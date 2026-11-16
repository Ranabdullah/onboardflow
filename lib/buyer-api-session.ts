import {purchaseLicense} from './purchase-license';
import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
export async function buyerApiSession(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({error:'Configure your own Supabase project first.'},{status:503});
 if(process.env.ACTIVATION_REQUIRED==="true"&&!(await purchaseLicense.status()).valid)return NextResponse.json({error:"Activate this purchased installation first."},{status:402});
 const client=await createClient();const {data:{user},error}=await client.auth.getUser();
 return error||!user?NextResponse.json({error:'Sign in to your own agency first.'},{status:401}):null;
}
