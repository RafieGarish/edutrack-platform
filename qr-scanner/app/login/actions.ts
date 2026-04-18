'use server';

import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createClient();

  // Standard authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Invalid email or password' };
  }

  // Check role in the public.users table using supabaseAdmin
  // (to bypass RLS if necessary, though the user can read their own row)
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (userError || !userData) {
    await supabase.auth.signOut();
    return { error: 'Failed to fetch user role.' };
  }

  // Allow 'scanner', 'admin', 'superadmin' to log into the scanner app
  if (!['scanner', 'admin', 'superadmin'].includes(userData.role)) {
    await supabase.auth.signOut();
    return { error: 'Unauthorized: You are not a scanner or admin.' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
