import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/auth-server';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check onboarding status
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('school_id, schools(onboarding_completed)')
    .eq('id', user.id)
    .single();

  if (profile?.schools && !(profile.schools as any).onboarding_completed) {
    redirect('/onboarding');
  }

  redirect('/dashboard');
}
