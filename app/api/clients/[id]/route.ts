import {loadOwnerWorkspace} from '@/lib/persistent-workspace';
import {buyerApiSession} from '@/lib/buyer-api-session';
import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {updateClientSchema} from '@/lib/validations/client';
interface RouteContext {params:Promise<{id:string}>;}
export async function GET(_request:NextRequest,{params}:RouteContext){
 const denied=await buyerApiSession();if(denied)return denied;
 try{const {id}=await params;const db=await createClient();const {data:client,error}=await db.from('clients').select('*,agency:agencies(*),questionnaire_template:questionnaire_templates(*,questions:questionnaire_questions(*)),checklist_template:checklist_templates(*,items:checklist_template_items(*)),brief:project_briefs(*),responses:questionnaire_responses(*,question:questionnaire_questions(*)),checklist_status:client_checklist_status(*,item:checklist_template_items(*)),uploads(*)').eq('id',id).maybeSingle();
 if(error)return NextResponse.json({error:'Could not load the saved client.'},{status:503});
 if(!client)return NextResponse.json({error:'Client not found'},{status:404});
 const workspace=(await loadOwnerWorkspace()).store;const details=workspace.getClientWithDetails(id);if(details){client.responses=details.responses;client.checklist_status=details.checklist_status;client.brief=workspace.briefs.get(id)||client.brief;client.manager=details.manager;client.assigned_staff=details.assigned_staff;}
 return NextResponse.json({client},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Database unavailable.'},{status:503});}
}
export async function PUT(request:NextRequest,{params}:RouteContext){
 const denied=await buyerApiSession();if(denied)return denied;
 try{const {id}=await params;const db=await createClient();const body=await request.json();
 const data=body.action==='archive'?{is_archived:true}:body.action==='unarchive'?{is_archived:false}:updateClientSchema.parse(body);
 const {data:client,error}=await db.from('clients').update({...data,...('is_archived' in data?{archived_at:data.is_archived?new Date().toISOString():null}:{}),updated_at:new Date().toISOString()}).eq('id',id).select('*').maybeSingle();
 if(error)return NextResponse.json({error:'Changes were not saved.'},{status:400});
 if(!client)return NextResponse.json({error:'Client not found'},{status:404});
 return NextResponse.json({client});
 }catch{return NextResponse.json({error:'Changes were not saved. Check the details and connection.'},{status:400});}
}
export async function DELETE(_request:NextRequest,{params}:RouteContext){
 const denied=await buyerApiSession();if(denied)return denied;
 try{const {id}=await params;const db=await createClient();
 const {data:client,error}=await db.from('clients').select('id,uploads(storage_path,category)').eq('id',id).maybeSingle();
 if(error)return NextResponse.json({error:'Could not check client ownership.'},{status:503});
 if(!client)return NextResponse.json({error:'Client not found'},{status:404});
 const admin=createAdminClient();
 for(const bucket of ['uploads','contracts']){const paths=(client.uploads||[]).filter((u:any)=>(u.category==='contract'?'contracts':'uploads')===bucket&&u.storage_path).map((u:any)=>u.storage_path);if(paths.length){const {error:e}=await admin.storage.from(bucket).remove(paths);if(e)return NextResponse.json({error:'Files could not be removed. The client record was retained.'},{status:503});}}
 const {error:e}=await db.from('clients').delete().eq('id',id);if(e)return NextResponse.json({error:'Client was not deleted.'},{status:503});
 return NextResponse.json({success:true});
 }catch{return NextResponse.json({error:'Client was not deleted.'},{status:503});}
}
