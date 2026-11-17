import {redirect} from 'next/navigation';
import {purchaseLicense} from '@/lib/purchase-license';
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { loadOwnerWorkspace } from '@/lib/persistent-workspace';
import { Agency } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main style={{padding:32}}><h1>Set up your own OnboardFlow cloud</h1><p>Follow README.md in your download. No seller database is configured.</p></main>;
  const buyerClient=await createClient();const {data:{user:buyerUser}}=await buyerClient.auth.getUser();if(!buyerUser)redirect('/login');
  if(process.env.ACTIVATION_REQUIRED==='true'&&!(await purchaseLicense.status()).valid)return <main style={{padding:32}}><h1>Activate your purchased installation</h1><p>Open Purchase activation below and enter the key from your receipt. Your saved data remains in your own database.</p></main>;
  let agency: Agency | null = null;

  try {
    const supabase = await createClient();
    const admin = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('agencies')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();
      agency = data;
    }

    if (!agency) {
      const { data: firstAgency } = await admin.from('agencies').select('*').limit(1).single();
      agency = firstAgency;
    }
  } catch (err) {
    console.warn('Dashboard layout session fallback:', err);
  }

  if (!agency) {
    agency = (await loadOwnerWorkspace()).store.agency;
  }

  return <DashboardShell agency={agency}>{children}</DashboardShell>;
}
