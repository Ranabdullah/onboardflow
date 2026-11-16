import {buyerApiSession} from '@/lib/buyer-api-session';
import {createClient as buyerDataClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const buyerDenied=await buyerApiSession();if(buyerDenied)return buyerDenied;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const admin = await buyerDataClient();

    // 1. Fetch upload record
    const { data: upload, error: fetchErr } = await admin
      .from('uploads')
      .select('*, client:clients(onboarding_token)')
      .eq('id', id)
      .single();

    if (fetchErr || !upload) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify token if passed from public client page
    if (token && upload.client?.onboarding_token !== token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Delete from Supabase Storage if path exists
    if (upload.storage_path) {
      const bucketName = upload.category === 'contract' ? 'contracts' : 'uploads';
      const {error: storageError} = await createAdminClient().storage.from(bucketName).remove([upload.storage_path]);
      if(storageError)return NextResponse.json({error:'File could not be removed. Its record was retained.'},{status:503});
    }

    // 3. Delete from DB
    const {error: deleteError} = await admin.from('uploads').delete().eq('id', id);
    if(deleteError)return NextResponse.json({error:'File record could not be removed.'},{status:503});

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
