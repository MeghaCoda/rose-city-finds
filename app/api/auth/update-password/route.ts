import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { access_token, refresh_token, password } = await req.json();

  if (!access_token || !password) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { error: sessionError } = await client.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  });

  if (sessionError) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }

  const { error } = await client.auth.updateUser({ password });

  if (error) {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }

  const { data: sessionData } = await client.auth.getSession();

  const response = NextResponse.json({ success: true });

  if (sessionData.session) {
    response.cookies.set('auth_token', sessionData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionData.session.expires_in,
      path: '/',
    });
  }

  return response;
}
