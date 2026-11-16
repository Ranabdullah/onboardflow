import {NextRequest,NextResponse} from 'next/server';
const {licenseStore}=require('./lib/purchase-license.cjs');
const purchaseLicense=licenseStore(process.cwd(),'onboardflow');
export async function proxy(request:NextRequest){
 if(request.nextUrl.pathname==='/api/purchase-activation'||process.env.ACTIVATION_REQUIRED!=='true')return NextResponse.next();
 try{if((await purchaseLicense.status()).valid)return NextResponse.next();}catch{}
 return NextResponse.json({error:'Activate this purchased installation first. Your existing records are unchanged.'},{status:402});
}
export const config={matcher:'/api/:path*'};
