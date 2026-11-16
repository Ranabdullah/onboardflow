import {withWorkspace} from '@/lib/persistent-workspace';
import {buyerApiSession} from '@/lib/buyer-api-session';
import {createClient as buyerDataClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';
import { Staff } from '@/types';

async function GETHandler(request: NextRequest) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    let staffList = localStore.getAllStaff();
    if (department && department !== 'all') {
      staffList = staffList.filter((s) => s.department.toLowerCase() === department.toLowerCase());
    }
    if (status && status !== 'all') {
      staffList = staffList.filter((s) => s.status.toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json({ staff: staffList });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function POSTHandler(request: NextRequest) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const body = await request.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const newStaff: Staff = {
      id: crypto.randomUUID(),
      agency_id: localStore.agency.id,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      role: body.role || 'staff',
      department: body.department || 'SEO & Content',
      status: body.status || 'active',
      is_online: false,
      avatar_url: body.avatar_url || null,
      active_tasks_count: 0,
      completed_tasks_count: 0,
      overdue_tasks_count: 0,
      assigned_clients_count: 0,
      performance_score: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = await buyerDataClient();
    const {active_tasks_count,completed_tasks_count,overdue_tasks_count,assigned_clients_count,performance_score,...row}=newStaff;
    const {error}=await db.from('staff').insert(row);
    if(error)return NextResponse.json({error:'Staff was not saved. Check the connection and details.'},{status:503});
    localStore.saveStaff(newStaff);

    localStore.logActivity({
      id: `act_${Date.now()}`,
      agency_id: localStore.agency.id,
      actor_name: 'Agency Admin',
      action: 'staff_added',
      entity_type: 'staff',
      entity_id: newStaff.id,
      entity_title: newStaff.name,
      metadata: { department: newStaff.department, role: newStaff.role },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ staff: newStaff }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const GET=withWorkspace(GETHandler,false);
export const POST=withWorkspace(POSTHandler,false);
