import {withWorkspace} from '@/lib/persistent-workspace';
import {buyerApiSession} from '@/lib/buyer-api-session';
import {createClient as buyerDataClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';
import { Task, TaskComment } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function GETHandler(request: NextRequest, { params }: RouteContext) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const { id } = await params;
    const task = localStore.getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const comments = localStore.taskComments.get(id) || [];
    return NextResponse.json({ task, comments });
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
    const existing = localStore.tasks.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if adding a comment
    if (body.add_comment) {
      const comment: TaskComment = {
        id: `com_${Date.now()}`,
        task_id: id,
        author_id: localStore.agency.owner_user_id,
        author_name: 'Agency owner',
        content: body.add_comment.content,
        created_at: new Date().toISOString(),
      };
      localStore.addTaskComment(id, comment);
      return NextResponse.json({ success: true, comment });
    }

    const isCompleting = body.status === 'completed' && existing.status !== 'completed';
    const updated: Task = {
      ...existing,
      ...body,
      id:existing.id,
      agency_id:existing.agency_id,
      completed_at: isCompleting
        ? new Date().toISOString()
        : (body.status && body.status !== 'completed' ? null : existing.completed_at),
      updated_at: new Date().toISOString(),
    };
    localStore.saveTask(updated);

    try {
      const admin = await buyerDataClient();
      await admin.from('tasks').update(updated).eq('id', id);
    } catch {
      // Offline
    }

    if (isCompleting) {
      localStore.logActivity({
        id: `act_${Date.now()}`,
        agency_id: existing.agency_id,
        actor_name: 'Staff Member',
        action: 'task_completed',
        entity_type: 'task',
        entity_id: id,
        entity_title: existing.title,
        metadata: { completed_at: updated.completed_at },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ task: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function DELETEHandler(request: NextRequest, { params }: RouteContext) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const { id } = await params;
    localStore.deleteTask(id);
    try {
      const admin = await buyerDataClient();
      await admin.from('tasks').delete().eq('id', id);
    } catch {
      // Offline
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET=withWorkspace(GETHandler,false);
export const PUT=withWorkspace(PUTHandler,false);
export const DELETE=withWorkspace(DELETEHandler,false);
