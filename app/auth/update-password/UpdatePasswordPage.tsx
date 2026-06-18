'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function UpdatePasswordPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'invalid'>('loading');
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const errorCode = params.get('error_code');

    if (errorCode) {
      setTokenError(
        params.get('error_description')?.replace(/\+/g, ' ') ??
          'The reset link is invalid or has expired.',
      );
      setStatus('invalid');
      return;
    }

    const type = params.get('type');
    const token = params.get('access_token');

    if (type !== 'recovery' || !token) {
      setTokenError('Invalid recovery link. Please request a new password reset.');
      setStatus('invalid');
      return;
    }

    setAccessToken(token);
    setRefreshToken(params.get('refresh_token'));
    setStatus('ready');
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    setIsPending(true);

    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;

    if (password !== confirm) {
      setFormError('Passwords do not match.');
      setIsPending(false);
      return;
    }

    const res = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken, password }),
    });

    if (res.ok) {
      setStatus('success');
    } else {
      const data = await res.json();
      setFormError(data.error ?? 'Failed to update password. Please try again.');
    }
    setIsPending(false);
  }

  if (status === 'loading') {
    return null;
  }

  if (status === 'invalid') {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-1">Link Invalid</h2>
        <div
          role="alert"
          className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
        >
          {tokenError}
        </div>
        <button
          onClick={() => router.push('/auth')}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-1">Password Updated</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Your password has been updated successfully.
        </p>
        <Button onClick={() => router.push('/')}>Continue</Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-1">Set New Password</h2>
      <p className="text-sm text-muted-foreground mb-6">Enter your new password below.</p>

      {formError && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" disabled={isPending} className="mt-2">
          {isPending ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}
