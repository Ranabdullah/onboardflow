import {NextRequest,NextResponse} from 'next/server';
import {loadOwnerWorkspace} from '@/lib/persistent-workspace';
import {updateAgencyBrandingSchema} from '@/lib/validations/agency';
export async function GET(){try{return NextResponse.json({agency:(await loadOwnerWorkspace()).store.agency},{headers:{'Cache-Control':'private, no-store'}});}catch{return NextResponse.json({error:'Sign in to your saved agency.'},{status:401});}}
export async function PUT(request:NextRequest){try{const scope=await loadOwnerWorkspace();const body=await request.json(),validated=updateAgencyBrandingSchema.parse(body);const {data,error}=await scope.db.from('agencies').update({...validated,updated_at:new Date().toISOString()}).eq('id',scope.agencyId).select('*').single();if(error)throw error;return NextResponse.json({agency:data});}catch{return NextResponse.json({error:'Agency settings were not saved. Check the details and connection.'},{status:400});}}
