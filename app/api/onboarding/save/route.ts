import {withWorkspace} from '@/lib/persistent-workspace';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveResponsesSchema } from '@/lib/validations/onboarding';
import { localStore } from '@/lib/store';

async function POSTHandler(request: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await request.json();
    const validated = saveResponsesSchema.parse(body);

    let client: any = localStore.getClientByToken(validated.token);

    try {
      const { data: dbClient } = await admin
        .from('clients')
        .select('id, status')
        .eq('onboarding_token', validated.token)
        .single();
      if (dbClient) client = dbClient;
    } catch {
      // Offline
    }

    if (!client) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    const questions=localStore.getTemplate(localStore.clients.get(client.id)?.questionnaire_template_id).questions||[];
    if(Object.keys(validated.responses).some(id=>!questions.some(q=>q.id===id)))return NextResponse.json({error:'An answer does not belong to this questionnaire.'},{status:400});
    if(JSON.stringify(validated.responses).length>200000)return NextResponse.json({error:'Answers are too large.'},{status:413});

    // Update in localStore
    const respMap = localStore.responses.get(client.id) || new Map<string, any>();
    Object.entries(validated.responses).forEach(([qId, val]) => {
      respMap.set(qId, val);
    });
    localStore.responses.set(client.id, respMap);

    const clientRecord = localStore.clients.get(client.id);
    if (clientRecord) {
      clientRecord.status = 'in_progress';
      clientRecord.last_activity_at = new Date().toISOString();
      localStore.clients.set(client.id, clientRecord);
    }

    // Try Supabase
    try {
      const {error:statusError}=await admin
        .from('clients')
        .update({
          status: 'in_progress',
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', client.id);
      if(statusError)throw new Error('Client status was not saved.');

      for (const [questionId, answerValue] of Object.entries(validated.responses)) {
        const {error:answerError}=await admin.from('questionnaire_responses').upsert(
          {
            client_id: client.id,
            question_id: questionId,
            answer: typeof answerValue === 'string' ? answerValue : JSON.stringify(answerValue),
            answer_json: typeof answerValue !== 'string' ? (answerValue as any) : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'client_id,question_id' }
        );
        if(answerError)throw new Error('Answers were not saved.');
      }
    } catch {
      return NextResponse.json({error:'Answers were not saved. Check the database connection and retry.'},{status:503});
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const POST=withWorkspace(POSTHandler,true);
