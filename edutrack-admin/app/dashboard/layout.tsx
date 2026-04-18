import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/auth-server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check onboarding status
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('full_name, role, school_id, schools(name, logo_url, onboarding_completed)')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/login');
  }

  const school = profile.schools as any;
  if (school && !school.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar userName={profile.full_name} schoolName={school?.name} logoUrl={school?.logo_url} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header userName={profile.full_name} userRole={profile.role} />
        <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
