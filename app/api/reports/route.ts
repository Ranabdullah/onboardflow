import {withWorkspace} from '@/lib/persistent-workspace';
import {buyerApiSession} from '@/lib/buyer-api-session';
import {createClient as buyerDataClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/store';

async function GETHandler(request: NextRequest) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const reports = localStore.getPerformanceReports();
    const workLogs = localStore.getStaffWorkLogs();
    const tasks = localStore.getAllTasks();
    const staff = localStore.getAllStaff();

    const summary = {
      total_staff: staff.length,
      active_tasks: tasks.filter((t) => t.status !== 'completed').length,
      completed_tasks: tasks.filter((t) => t.status === 'completed').length,
      total_hours_logged: workLogs.reduce((acc, l) => acc + (l.hours_spent || 0), 0),
      average_performance_score: Math.round(
        reports.reduce((acc, r) => acc + (r.performance_score || 0), 0) / (reports.length || 1)
      ),
      department_breakdown: [
        { name: 'SEO & Content', count: staff.filter((s) => s.department === 'SEO & Content').length, active_tasks: tasks.filter((t) => t.department === 'SEO & Content' && t.status !== 'completed').length },
        { name: 'Engineering & Dev', count: staff.filter((s) => s.department === 'Engineering & Dev').length, active_tasks: tasks.filter((t) => t.department === 'Engineering & Dev' && t.status !== 'completed').length },
        { name: 'Design & Creative', count: staff.filter((s) => s.department === 'Design & Creative').length, active_tasks: tasks.filter((t) => t.department === 'Design & Creative' && t.status !== 'completed').length },
        { name: 'Paid Media & Ads', count: staff.filter((s) => s.department === 'Paid Media & Ads').length, active_tasks: tasks.filter((t) => t.department === 'Paid Media & Ads' && t.status !== 'completed').length },
        { name: 'Account Management', count: staff.filter((s) => s.department === 'Account Management').length, active_tasks: tasks.filter((t) => t.department === 'Account Management' && t.status !== 'completed').length },
      ],
    };

    return NextResponse.json({ reports, workLogs, summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function POSTHandler(request: NextRequest) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const body = await request.json();
    const staff = localStore.getStaffById(body.staff_id);
    if(!staff)return NextResponse.json({error:'Select a staff member in your own agency.'},{status:400});
    const hours=Number(body.hours_spent);if(!Number.isFinite(hours)||hours<0||hours>24)return NextResponse.json({error:'Enter hours between 0 and 24.'},{status:400});
    const staffName = staff.name;

    const newLog = {
      id: `wl_${Date.now()}`,
      agency_id: localStore.agency.id,
      staff_id: staff.id,
      staff_name: staffName,
      task_id: body.task_id || null,
      task_title: body.task_title || 'General Agency Operations',
      date: body.date || new Date().toISOString().split('T')[0],
      hours_spent: hours,
      description: body.description || '',
      status: body.status || 'present',
      created_at: new Date().toISOString(),
    };

    localStore.addWorkLog(newLog);

    localStore.logActivity({
      id: `act_${Date.now()}`,
      agency_id: newLog.agency_id,
      actor_name: staffName,
      action: 'hours_logged',
      entity_type: 'staff',
      entity_id: newLog.staff_id,
      entity_title: `${newLog.hours_spent} hrs on ${newLog.task_title}`,
      metadata: { date: newLog.date, description: newLog.description },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, workLog: newLog }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET=withWorkspace(GETHandler,false);
export const POST=withWorkspace(POSTHandler,false);
