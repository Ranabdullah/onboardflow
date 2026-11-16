import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
const configured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const missing = () => NextResponse.json({error:'Configure your own Supabase project and private storage first.'},{status:503});
export async function POST(request: NextRequest) {
  if (!configured()) return missing();
  if (Number(request.headers.get('content-length') || 0) > 53 * 1024 * 1024) return NextResponse.json({error:'File exceeds 50 MB.'},{status:413});
  try {
    const admin = createAdminClient(); const form = await request.formData();
    const file = form.get('file'); const token = form.get('token'); const category = String(form.get('category') || 'asset');
    if (!(file instanceof File) || typeof token !== 'string' || !token || !['contract','asset','brand','other'].includes(category)) return NextResponse.json({error:'File, valid category and client token required.'},{status:400});
    if (!file.size || file.size > 50 * 1024 * 1024) return NextResponse.json({error:'File must be between 1 byte and 50 MB.'},{status:413});
    const {data:client,error:clientError} = await admin.from('clients').select('id').eq('onboarding_token',token).single();
    if (clientError || !client) return NextResponse.json({error:'Invalid client token.'},{status:404});
    const id=crypto.randomUUID(); const bucket=category==='contract'?'contracts':'uploads';
    const storagePath=client.id+'/'+id+'_'+file.name.replace(/[^a-zA-Z0-9.-]/g,'_').slice(-150);
    const {error:storageError}=await admin.storage.from(bucket).upload(storagePath,Buffer.from(await file.arrayBuffer()),{contentType:file.type||'application/octet-stream',upsert:false});
    if (storageError) return NextResponse.json({error:'Storage upload failed. The file has not been saved.'},{status:502});
    const {data:upload,error:dbError}=await admin.from('uploads').insert({id,client_id:client.id,category,filename:file.name,file_url:'/api/upload?id='+id,storage_path:storagePath,file_size:file.size,mime_type:file.type}).select('*').single();
    if (dbError) { await admin.storage.from(bucket).remove([storagePath]); return NextResponse.json({error:'File record could not be saved. Retry the upload.'},{status:502}); }
    return NextResponse.json({upload},{status:201});
  } catch { return NextResponse.json({error:'Upload failed. Check your own server and storage configuration.'},{status:500}); }
}
export async function GET(request: NextRequest) {
  if (!configured()) return missing();
  const id=request.nextUrl.searchParams.get('id'); const token=request.nextUrl.searchParams.get('token');
  if (!id) return NextResponse.json({error:'File ID required.'},{status:400});
  try {
    const userClient=await createClient(); const {data:{user}}=await userClient.auth.getUser();
    const client=user?userClient:createAdminClient();
    if (!user&&!token) return NextResponse.json({error:'Sign in or use a valid client package link.'},{status:401});
    const {data:upload,error}=await client.from('uploads').select('*,client:clients(onboarding_token,package_share_token)').eq('id',id).single();
    if (error||!upload||(!user&&token!==upload.client?.onboarding_token&&token!==upload.client?.package_share_token)) return NextResponse.json({error:'File not found.'},{status:404});
    const bucket=upload.category==='contract'?'contracts':'uploads';
    const {data,error:signedError}=await createAdminClient().storage.from(bucket).createSignedUrl(upload.storage_path,60,{download:upload.filename});
    if (signedError||!data) return NextResponse.json({error:'Download unavailable.'},{status:502});
    const response=NextResponse.redirect(data.signedUrl); response.headers.set('Cache-Control','private, no-store'); response.headers.set('Referrer-Policy','no-referrer'); return response;
  } catch {return NextResponse.json({error:'Download unavailable.'},{status:500});}
}
