import {NextResponse} from 'next/server';
export async function POST(){return NextResponse.json({error:'AppSumo redemption is not connected. Use Purchase activation for an itch.io or Gumroad receipt. No subscription was changed.'},{status:410});}
