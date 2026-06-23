import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/update-password`,
  });

  if (error) {
    console.error('[reset-password]', error.message);
    if (error.status === 429) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a moment and try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to send reset email. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
