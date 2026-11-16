import {withWorkspace} from '@/lib/persistent-workspace';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitOnboardingSchema } from '@/lib/validations/onboarding';
import { generateProjectBrief } from '@/lib/ai';
import { BriefGenerationContext } from '@/lib/ai/prompts';
import { sendCompletionNotification } from '@/lib/email/resend';
import { dispatchAgencyWebhooks } from '@/lib/notifications/webhook';
import { localStore } from '@/lib/store';
import { ProjectBrief } from '@/types';

async function POSTHandler(request: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await request.json();
    const validated = submitOnboardingSchema.parse(body);

    let client: any = localStore.getClientByToken(validated.token);

    try {
      const { data: dbClient } = await admin
        .from('clients')
        .select(`
          *,
          agency:agencies(*),
          responses:questionnaire_responses(
            *,
            question:questionnaire_questions(*)
          ),
          checklist_status:client_checklist_status(
            *,
            item:checklist_template_items(*)
          ),
          uploads(*)
        `)
        .eq('onboarding_token', validated.token)
        .single();
      if (dbClient) client = dbClient;
    } catch {
      // Offline fallback
    }

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const template=localStore.getTemplate(client.questionnaire_template_id),knownQuestions=template.questions||[];
    if(Object.keys(validated.responses||{}).some(id=>!knownQuestions.some(q=>q.id===id)))return NextResponse.json({error:'An answer does not belong to this questionnaire.'},{status:400});
    const existingResponses=Object.fromEntries(localStore.responses.get(client.id)||[]),submitted={...existingResponses,...validated.responses};
    if(knownQuestions.some(q=>q.required&&(submitted[q.id]===undefined||submitted[q.id]===null||submitted[q.id]===''||(Array.isArray(submitted[q.id])&&!submitted[q.id].length))))return NextResponse.json({error:'Complete the required questionnaire answers first.'},{status:400});
    if(JSON.stringify(body).length>250000)return NextResponse.json({error:'Submission is too large.'},{status:413});

    // Save final responses to localStore
    if (validated.responses) {
      const respMap = localStore.responses.get(client.id) || new Map<string, any>();
      Object.entries(validated.responses).forEach(([qId, val]) => {
        respMap.set(qId, val);
      });
      localStore.responses.set(client.id, respMap);
    }

    // Update client status to completed
    const completedAt = new Date().toISOString();
    const clientRecord = localStore.clients.get(client.id);
    if (clientRecord) {
      clientRecord.status = 'completed';
      clientRecord.completed_at = completedAt;
      clientRecord.last_activity_at = completedAt;
      if (body.platform_access) clientRecord.platform_access = body.platform_access;
      if (body.payment) clientRecord.payment = body.payment;
      localStore.clients.set(client.id, clientRecord);
    }

    // Prepare AI Context
    const fullClient: any = localStore.getClientWithDetails(client.id) || client;
    const questionAnswers = (fullClient.responses || []).map((r: any) => ({
      question: r.question?.label || 'Intake Question',
      answer: typeof r.answer === 'string' ? r.answer : JSON.stringify(r.answer_json || ''),
      required: !!r.question?.required,
    }));

    const uploadedFiles = (fullClient.uploads || []).map((u: any) => ({
      filename: u.filename,
      category: u.category,
    }));

    const completedChecklistItems = (fullClient.checklist_status || [])
      .filter((c: any) => c.is_completed)
      .map((c: any) => c.item?.label || 'Completed item');

    const briefContext: BriefGenerationContext = {
      agencyName: fullClient.agency?.name || localStore.agency.name,
      clientName: fullClient.name,
      clientCompany: fullClient.company,
      clientEmail: fullClient.email,
      questionAnswers,
      uploadedFiles,
      completedChecklistItems,
    };

    let aiWarning:string|undefined;
    let aiOutput;try{aiOutput=await generateProjectBrief(briefContext);}catch{aiWarning="AI brief unavailable; original client answers are saved.";aiOutput={ai_summary:"Client submission received. AI brief pending.",ai_brief:"Review original answers and uploads. No AI brief has been generated.",goals:[],scope:[],key_assets:uploadedFiles.map((u:any)=>u.filename),open_gaps:[],next_steps:[]};}

    const savedBrief: ProjectBrief = {
      id: `brief_${fullClient.id}`,
      client_id: fullClient.id,
      ai_summary: aiOutput.ai_summary,
      ai_brief: aiOutput.ai_brief,
      goals: aiOutput.goals,
      scope: aiOutput.scope,
      key_assets: aiOutput.key_assets,
      open_gaps: aiOutput.open_gaps,
      next_steps: aiOutput.next_steps,
      status: 'draft',
      generated_at: new Date().toISOString(),
      edited_at: new Date().toISOString(),
    };

    localStore.briefs.set(fullClient.id, savedBrief);

    // Auto-provision Project, Workflow, Kickoff Tasks, Internal Notifications & Audit
    try {
      localStore.provisionProjectFromOnboarding(fullClient.id);
    } catch (provisionErr) {
      console.error('Project auto-provision error:', provisionErr);
    }

    // Try persisting to Supabase if connected
    try {
      const {error:clientError}=await admin
        .from('clients')
        .update({
          status: 'completed',
          completed_at: completedAt,
          last_activity_at: completedAt,
          metadata:{...(client.metadata||{}),platform_access:validated.platform_access||null,payment:validated.payment||null},
        })
        .eq('id', fullClient.id);
      if(clientError)throw new Error('Submission status was not saved.');
    } catch {
      return NextResponse.json({error:'Submission was not saved. Check the database connection and retry.'},{status:503});
    }

    // Trigger Webhook & WhatsApp/Slack alerts
    const targetAgency = fullClient.agency || localStore.agency;
    dispatchAgencyWebhooks(
      targetAgency,
      fullClient,
      savedBrief,
      uploadedFiles.length
    ).catch((e) => console.warn('Webhook dispatch alert notice:', e));

    return NextResponse.json({ success: true, completed_at: completedAt, warning:aiWarning });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const POST=withWorkspace(POSTHandler,true);
