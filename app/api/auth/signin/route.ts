import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const response = NextResponse.json({ email: data.user.email });
  response.cookies.set('auth_token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.session.expires_in,
    path: '/',
  });
  return response;
}
