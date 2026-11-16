import {withWorkspace} from '@/lib/persistent-workspace';
import {buyerApiSession} from '@/lib/buyer-api-session';
import {createClient as buyerDataClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/store';

async function GETHandler(request: NextRequest) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const notifications = localStore.getAllNotifications();
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function PUTHandler(request: NextRequest) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const body = await request.json();
    if (body.all) {
      localStore.notifications.forEach((n) => {
        n.is_read = true;
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }
    if (body.id) {
      localStore.markNotificationAsRead(body.id);
      return NextResponse.json({ success: true, id: body.id });
    }
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET=withWorkspace(GETHandler,false);
export const PUT=withWorkspace(PUTHandler,false);
