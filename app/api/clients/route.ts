import {loadOwnerWorkspace} from '@/lib/persistent-workspace';
import {buyerApiSession} from '@/lib/buyer-api-session';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClientSchema } from '@/lib/validations/client';
import { generateOnboardingToken, generateShareToken } from '@/lib/utils';
import { sendClientInvitationEmail } from '@/lib/email/resend';
export async function GET(request: NextRequest) {
 const denied=await buyerApiSession();if(denied)return denied;
 try {
  const db=await createClient(); const {data:{user}}=await db.auth.getUser();
  const {data:agency}=await db.from('agencies').select('id').eq('owner_user_id',user!.id).single();
  if(!agency)return NextResponse.json({error:'Your agency is not configured.'},{status:403});
  const archived=new URL(request.url).searchParams.get('archived')==='true';
  let query=db.from('clients').select('*,agency:agencies(*),brief:project_briefs(*),responses:questionnaire_responses(*),checklist_status:client_checklist_status(*),uploads(*)').eq('agency_id',agency.id);
  query=archived?query.eq('is_archived',true):query.or('is_archived.is.null,is_archived.eq.false');
  const {data,error}=await query.order('created_at',{ascending:false});
  if(error)return NextResponse.json({error:'Could not load saved clients. Please retry.'},{status:503});
  const workspace=(await loadOwnerWorkspace()).store;
  const clients=(data||[]).map(client=>{const saved=workspace.getClientWithDetails(client.id);return saved?{...client,responses:saved.responses,checklist_status:saved.checklist_status,brief:saved.brief}:client;});
  return NextResponse.json({clients},{headers:{'Cache-Control':'private, no-store'}});
 } catch {return NextResponse.json({error:'Your database is unavailable. No temporary records are shown.'},{status:503});}
}
export async function POST(request: NextRequest) {
 const denied=await buyerApiSession();if(denied)return denied;
 try {
  const db=await createClient();const {data:{user}}=await db.auth.getUser();
  const {data:agency}=await db.from('agencies').select('*').eq('owner_user_id',user!.id).single();
  if(!agency)return NextResponse.json({error:'Your agency is not configured.'},{status:403});
  const parsed=createClientSchema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:'Check the client details.',details:parsed.error.flatten()},{status:400});
  const v=parsed.data;
  for(const [table,id] of [['staff',v.manager_id],['questionnaire_templates',v.questionnaire_template_id],['checklist_templates',v.checklist_template_id]])if(id){const {data:reference}=await db.from(table!).select('id').eq('id',id!).eq('agency_id',agency.id).maybeSingle();if(!reference)return NextResponse.json({error:'Select staff and templates in your own agency.'},{status:400});}
  if(v.assigned_staff_ids?.length){const {data:staff}=await db.from('staff').select('id').in('id',v.assigned_staff_ids).eq('agency_id',agency.id);if(staff?.length!==new Set(v.assigned_staff_ids).size)return NextResponse.json({error:'Select staff in your own agency.'},{status:400});}
  const {data:client,error}=await db.from('clients').insert({agency_id:agency.id,name:v.name,email:v.email,phone:v.phone||null,website:v.website||null,company:v.company||null,service_category:v.service_category||'general',status:'invited',project_status:'pending_onboarding',manager_id:v.manager_id||null,assigned_staff_ids:v.assigned_staff_ids||[],is_archived:false,onboarding_token:generateOnboardingToken(),package_share_token:generateShareToken(),questionnaire_template_id:v.questionnaire_template_id||null,checklist_template_id:v.checklist_template_id||null,last_activity_at:new Date().toISOString()}).select('*').single();
  if(error||!client)return NextResponse.json({error:'Client was not saved. Check the selected templates/staff and your database connection.'},{status:400});
  let invitationSent=false;
  if(v.send_invitation_email){try{const delivery=await sendClientInvitationEmail({recipientEmail:v.email,clientName:v.name,agency:{name:agency.name,logoUrl:agency.logo_url,brandColor:agency.brand_color,supportEmail:agency.support_email},onboardingUrl:(process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000')+'/onboard/'+client.onboarding_token});invitationSent=delivery.success;}catch{}}
  return NextResponse.json({client,invitationSent},{status:201,headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Client was not saved. Please retry.'},{status:503});}
}
