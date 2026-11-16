import {withWorkspace} from '@/lib/persistent-workspace';
import {buyerApiSession} from '@/lib/buyer-api-session';
import {createClient as buyerDataClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function GETHandler(request: NextRequest, { params }: RouteContext) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const { id } = await params;
    const staff = localStore.getStaffById(id);
    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const assignedTasks = localStore.getAllTasks({ assignedTo: id });
    const managedTasks = Array.from(localStore.tasks.values()).filter((t) => t.manager_id === id);
    const clients = Array.from(localStore.clients.values()).filter(
      (c) => c.manager_id === id || (c.assigned_staff_ids && c.assigned_staff_ids.includes(id))
    );
    const workLogs = localStore.getStaffWorkLogs().filter((w) => w.staff_id === id);

    return NextResponse.json({ staff, assignedTasks, managedTasks, clients, workLogs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function PUTHandler(request: NextRequest, { params }: RouteContext) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const { id } = await params;
    const body = await request.json();
    const existing = localStore.getStaffById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const updated = {
      ...existing,
      ...Object.fromEntries(Object.entries(body).filter(([k])=>['name','email','phone','avatar_url','role','department','status','is_online'].includes(k))),
      updated_at: new Date().toISOString(),
    };
    const db=await buyerDataClient();const fields=Object.fromEntries(Object.entries(updated).filter(([k])=>['name','email','phone','avatar_url','role','department','status','is_online','updated_at'].includes(k)));
    const {error}=await db.from('staff').update(fields).eq('id',id);if(error)return NextResponse.json({error:'Staff changes were not saved.'},{status:503});
    localStore.saveStaff(updated);

    return NextResponse.json({ staff: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function DELETEHandler(request: NextRequest, { params }: RouteContext) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const { id } = await params;
    if(!localStore.getStaffById(id))return NextResponse.json({error:'Staff member not found'},{status:404});
    const db=await buyerDataClient();const {error}=await db.from('staff').delete().eq('id',id);if(error)return NextResponse.json({error:'Staff member was not removed. Check assigned clients and tasks.'},{status:409});localStore.deleteStaff(id);
    return NextResponse.json({ success: true, message: 'Staff member removed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET=withWorkspace(GETHandler,false);
export const PUT=withWorkspace(PUTHandler,false);
export const DELETE=withWorkspace(DELETEHandler,false);
