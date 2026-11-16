import {withWorkspace} from '@/lib/persistent-workspace';
import {buyerApiSession} from '@/lib/buyer-api-session';
import {createClient as buyerDataClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/store';

async function GETHandler(request: NextRequest) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    let logs = localStore.getActivityLogs(limit);
    if (clientId) {
      logs = logs.filter((l) => l.entity_id === clientId || (l.metadata && l.metadata.client_id === clientId));
    }

    return NextResponse.json({ activities: logs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET=withWorkspace(GETHandler,false);
