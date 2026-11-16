import {withWorkspace} from '@/lib/persistent-workspace';
import {buyerApiSession} from '@/lib/buyer-api-session';
import {createClient as buyerDataClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function POSTHandler(request: NextRequest, { params }: RouteContext) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const { id: clientId } = await params;
    const admin = await buyerDataClient();
    const body = await request.json();

    const { checklist_item_id, is_completed, notes } = body;
    if (!checklist_item_id) {
      return NextResponse.json({ error: 'checklist_item_id is required' }, { status: 400 });
    }

    // Update in localStore
    const checkMap = localStore.checklistStatus.get(clientId) || new Map<string, boolean>();
    checkMap.set(checklist_item_id, !!is_completed);
    localStore.checklistStatus.set(clientId, checkMap);

    // Try Supabase
    try {
      await admin
        .from('client_checklist_status')
        .upsert(
          {
            client_id: clientId,
            checklist_item_id,
            is_completed: !!is_completed,
            completed_at: is_completed ? new Date().toISOString() : null,
            notes: notes || null,
          },
          { onConflict: 'client_id,checklist_item_id' }
        );
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      status: {
        client_id: clientId,
        checklist_item_id,
        is_completed: !!is_completed,
        completed_at: is_completed ? new Date().toISOString() : null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST=withWorkspace(POSTHandler,false);
