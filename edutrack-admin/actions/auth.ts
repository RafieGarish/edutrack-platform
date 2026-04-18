'use server';

import { createSupabaseServerClient } from '@/lib/supabase/auth-server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const schoolName = formData.get('school_name') as string;

  const supabase = await createSupabaseServerClient();

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'Failed to create user account.' };
  }

  // 2. Create school + user record using service role
  const { data: school, error: schoolError } = await supabaseAdmin
    .from('schools')
    .insert({ name: schoolName })
    .select('id')
    .single();

  if (schoolError) {
    return { error: 'Failed to create school: ' + schoolError.message };
  }

  const { error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      school_id: school.id,
      email,
      full_name: fullName,
      role: 'admin',
    });

  if (userError) {
    return { error: 'Failed to create user profile: ' + userError.message };
  }

  return { success: true };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('*, schools(*)')
    .eq('id', user.id)
    .single();

  return profile;
}
