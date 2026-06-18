'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createLocation } from '@/app/api/locations/service';
import { PhysicalLocationInputSchema } from '@/app/api/locations/schemas';
import type { PhysicalLocationInput } from '@/app/api/locations/schemas';

function makeAuthClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
}

function makeAdminClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

async function verifyAdminToken(token: string) {
  const auth = makeAuthClient();
  const { data: { user }, error } = await auth.auth.getUser(token);
  if (error || !user) return null;

  const db = makeAdminClient();
  const { data } = await db.from('users').select('role').eq('id', user.id).single();
  if (!data || data.role !== 'admin') return null;

  return user;
}

export type SignInState = { error?: string };

export async function signIn(_: SignInState, formData: FormData): Promise<SignInState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const auth = makeAuthClient();
  const { data, error } = await auth.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return { error: 'Invalid email or password.' };
  }

  let isAdmin = false;
  try {
    const db = makeAdminClient();
    const { data: userData } = await db
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();
    isAdmin = userData?.role === 'admin';
  } catch {
    return { error: 'Failed to verify admin status. Please try again.' };
  }

  if (!isAdmin) {
    return { error: 'Access denied. Admin role required.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('auth_token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.session.expires_in,
    path: '/',
  });

  redirect('/admin/upload');
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/admin/upload');
}

export type UploadResult = {
  success?: true;
  locationId?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitLocation(data: PhysicalLocationInput): Promise<UploadResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  const user = await verifyAdminToken(token);
  if (!user) {
    return { error: 'Unauthorized. Please sign in as admin.' };
  }

  const parsed = PhysicalLocationInputSchema.safeParse(data);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const location = await createLocation(parsed.data);
    return { success: true, locationId: location.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create location.' };
  }
}
