import {NextRequest,NextResponse} from 'next/server';
import {loadOwnerWorkspace} from '@/lib/persistent-workspace';
import {saveTemplate} from '@/lib/template-storage';
export async function PUT(request:NextRequest,{params}:{params:Promise<{id:string}>}){try{const scope=await loadOwnerWorkspace(),{id}=await params;const old=scope.store.templates.find((t:any)=>t.id===id);if(!old)return NextResponse.json({error:'Template not found.'},{status:404});return NextResponse.json({template:await saveTemplate(scope.db,scope.agencyId,{...old,...await request.json(),id})});}catch{return NextResponse.json({error:'Template was not saved.'},{status:400});}}
