import {purchaseLicense} from './purchase-license';
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';
import { LocalDataStore } from './store';
import { workspaceContext } from './workspace-context';

const encode=(value:any):any=>value instanceof Map?{__workspaceMap:Array.from(value.entries(),([k,v])=>[k,encode(v)])}:Array.isArray(value)?value.map(encode):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,encode(v)])):value;
const decode=(value:any):any=>value&&Array.isArray(value.__workspaceMap)?new Map(value.__workspaceMap.map(([k,v]:any)=>[k,decode(v)])):Array.isArray(value)?value.map(decode):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,decode(v)])):value;
export function workspaceSnapshot(store:LocalDataStore){const state:any={};for(const key of Object.keys(store))if(key!=='agency'&&key!=='clients'&&key!=='uploads')state[key]=encode((store as any)[key]);return state;}
async function hydrate(db:any,agency:any){
 const {data:row,error}=await db.from('agency_workspaces').select('state,revision').eq('agency_id',agency.id).maybeSingle();
 if(error)throw new Error('Workspace database unavailable. Apply the workspace migration before using this app.');
 const store=new LocalDataStore();if(row?.state){const saved=decode(row.state);for(const key of Object.keys(store))if(Object.hasOwn(saved,key)&&!['agency','clients','uploads'].includes(key))(store as any)[key]=saved[key];}store.agency=agency;
 const {data:staff,error:se}=await db.from('staff').select('*').eq('agency_id',agency.id);if(se)throw new Error('Could not load staff.');store.staff=new Map((staff||[]).map((s:any)=>[s.id,{active_tasks_count:0,completed_tasks_count:0,overdue_tasks_count:0,assigned_clients_count:0,performance_score:0,...store.staff.get(s.id),...s}]));
 store.templates=store.templates.map((t:any)=>({...t,agency_id:agency.id}));store.departments=store.departments.map((d:any)=>({...d,agency_id:agency.id}));
 const {data:clients,error:ce}=await db.from('clients').select('*,uploads(*)').eq('agency_id',agency.id);if(ce)throw new Error('Could not load saved clients.');
 store.clients=new Map((clients||[]).map((c:any)=>{const {uploads,...client}=c;store.uploads.set(c.id,uploads||[]);return [c.id,{...client,platform_access:client.metadata?.platform_access,payment:client.metadata?.payment}];}));
 const {data:templates,error:te}=await db.from('questionnaire_templates').select('*,questions:questionnaire_questions(*)').eq('agency_id',agency.id);if(te)throw new Error('Could not load templates.');if(templates?.length)store.templates=templates.map((t:any)=>({...t,questions:t.questions.filter((q:any)=>!q.is_archived)}));
 return {store,db,agencyId:agency.id,revision:row?.revision??null};
}
export async function loadOwnerWorkspace(){
 const db=await createClient();const {data:{user},error}=await db.auth.getUser();if(error||!user)throw new Error('Sign in first.');
 const {data:agency,error:ae}=await db.from('agencies').select('*').eq('owner_user_id',user.id).maybeSingle();if(ae||!agency)throw new Error('Your agency was not found.');
 return hydrate(db,agency);
}
export async function loadTokenWorkspace(token:string,share=false){
 if(!token||token.length>180)throw new Error('Invalid link.');const db=createAdminClient();
 const {data:client,error}=await db.from('clients').select('*,agency:agencies(*)').eq(share?'package_share_token':'onboarding_token',token).maybeSingle();
 if(error||!client||client.is_archived||!client.agency)throw new Error('This link is unavailable.');
 // Old links with an explicit expiry cannot be used after their expiry.
 if(client.token_expires_at&&new Date(client.token_expires_at).getTime()<Date.now())throw new Error('This link has expired.');
 const scope=await hydrate(db,client.agency);return {...scope,tokenClientId:client.id};
}
async function commit(scope:any){
 const state=workspaceSnapshot(scope.store);if(JSON.stringify(state).length>5*1024*1024)throw new Error('Workspace exceeds the 5 MB record limit. Export a backup before adding more.');
 if(scope.revision===null){const {error}=await scope.db.from('agency_workspaces').insert({agency_id:scope.agencyId,state,revision:1});if(error)throw new Error('Workspace changed in another window. Reload before retrying.');}
 else{const {data,error}=await scope.db.from('agency_workspaces').update({state,revision:scope.revision+1,updated_at:new Date().toISOString()}).eq('agency_id',scope.agencyId).eq('revision',scope.revision).select('revision').maybeSingle();if(error||!data)throw new Error('Workspace changed in another window. Reload before retrying.');}
}
export function withWorkspace<T extends (...args:any[])=>Promise<Response>>(handler:T,tokenAllowed=false):T{
 return (async(request:NextRequest,...args:any[])=>{
  try{
   if(process.env.ACTIVATION_REQUIRED==="true"&&!(await purchaseLicense.status()).valid)return NextResponse.json({error:"Activate this purchased installation first."},{status:402});
   let scope:any;const body=request.method==='GET'?{}:await request.clone().json().catch(()=>({}));
   if(tokenAllowed&&body.token){scope=await loadTokenWorkspace(body.token);if(body.clientId&&body.clientId!==scope.tokenClientId)return NextResponse.json({error:'Invalid client link.'},{status:403});}
   else scope=await loadOwnerWorkspace();
   if(body.client_id&&!scope.store.clients.has(body.client_id))return NextResponse.json({error:'Client not found.'},{status:404});
   for(const field of ['assigned_to','manager_id','staff_id'])if(body[field]&&!scope.store.staff.has(body[field]))return NextResponse.json({error:'Staff member not found.'},{status:404});
   if(body.project_id&&!scope.store.projects.has(body.project_id))return NextResponse.json({error:'Project not found.'},{status:404});
   const before=JSON.stringify(workspaceSnapshot(scope.store));
   return await workspaceContext.run(scope.store,async()=>{const response=await handler(request,...args);if(response.ok&&request.method!=='GET'&&before!==JSON.stringify(workspaceSnapshot(scope.store)))await commit(scope);response.headers.set('Cache-Control','private, no-store');return response;});
  }catch(error){const message=error instanceof Error?error.message:'Could not save workspace.';return NextResponse.json({error:message},{status:message.includes('another window')?409:message==='Sign in first.'?401:503});}
 }) as T;
}
