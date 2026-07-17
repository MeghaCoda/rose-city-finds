'use client';

import { useState, useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_ROUTES, ROUTES } from '@/lib/constants';
import { BACK_TO_SIGN_IN } from '../constants';
import {
  INVALID_LINK_DEFAULT_ERROR,
  INVALID_RECOVERY_LINK_ERROR,
  PASSWORDS_MISMATCH_ERROR,
  UPDATE_PASSWORD_DEFAULT_ERROR,
  LINK_INVALID_TITLE,
  PASSWORD_UPDATED_TITLE,
  PASSWORD_UPDATED_MESSAGE,
  CONTINUE_LABEL,
  SET_NEW_PASSWORD_TITLE,
  SET_NEW_PASSWORD_SUBTITLE,
  NEW_PASSWORD_LABEL,
  CONFIRM_PASSWORD_LABEL,
  UPDATING_LABEL,
  UPDATE_PASSWORD_LABEL,
} from './constants';

type TokenState =
  | { status: 'loading' }
  | { status: 'invalid'; error: string }
  | { status: 'ready'; accessToken: string; refreshToken: string | null }
  | { status: 'success' };

type TokenAction =
  | { type: 'invalid'; error: string }
  | { type: 'ready'; accessToken: string; refreshToken: string | null }
  | { type: 'success' };

function tokenReducer(_state: TokenState, action: TokenAction): TokenState {
  switch (action.type) {
    case 'invalid':
      return { status: 'invalid', error: action.error };
    case 'ready':
      return { status: 'ready', accessToken: action.accessToken, refreshToken: action.refreshToken };
    case 'success':
      return { status: 'success' };
  }
}

export function UpdatePasswordPage() {
  const router = useRouter();
  const [tokenState, dispatch] = useReducer(tokenReducer, { status: 'loading' });
  const [formError, setFormError] = useState('');
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const errorCode = params.get('error_code');

    if (errorCode) {
      dispatch({
        type: 'invalid',
        error: params.get('error_description')?.replace(/\+/g, ' ') ?? INVALID_LINK_DEFAULT_ERROR,
      });
      return;
    }

    const type = params.get('type');
    const token = params.get('access_token');

    if (type !== 'recovery' || !token) {
      dispatch({ type: 'invalid', error: INVALID_RECOVERY_LINK_ERROR });
      return;
    }

    dispatch({ type: 'ready', accessToken: token, refreshToken: params.get('refresh_token') });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (tokenState.status !== 'ready') return;
    setFormError('');
    setIsPending(true);

    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;

    if (password !== confirm) {
      setFormError(PASSWORDS_MISMATCH_ERROR);
      setIsPending(false);
      return;
    }

    const res = await fetch(API_ROUTES.AUTH_UPDATE_PASSWORD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: tokenState.accessToken,
        refresh_token: tokenState.refreshToken,
        password,
      }),
    });

    if (res.ok) {
      dispatch({ type: 'success' });
    } else {
      const data = await res.json();
      setFormError(data.error ?? UPDATE_PASSWORD_DEFAULT_ERROR);
    }
    setIsPending(false);
  }

  if (tokenState.status === 'loading') {
    return null;
  }

  if (tokenState.status === 'invalid') {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-1">{LINK_INVALID_TITLE}</h2>
        <div
          role="alert"
          className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
        >
          {tokenState.error}
        </div>
        <button
          onClick={() => router.push(ROUTES.LOGIN)}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          {BACK_TO_SIGN_IN}
        </button>
      </div>
    );
  }

  if (tokenState.status === 'success') {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-1">{PASSWORD_UPDATED_TITLE}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {PASSWORD_UPDATED_MESSAGE}
        </p>
        <Button onClick={() => router.push(ROUTES.HOME)}>{CONTINUE_LABEL}</Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-1">{SET_NEW_PASSWORD_TITLE}</h2>
      <p className="text-sm text-muted-foreground mb-6">{SET_NEW_PASSWORD_SUBTITLE}</p>

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
          <Label htmlFor="password">{NEW_PASSWORD_LABEL}</Label>
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
          <Label htmlFor="confirm">{CONFIRM_PASSWORD_LABEL}</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" disabled={isPending} className="mt-2">
          {isPending ? UPDATING_LABEL : UPDATE_PASSWORD_LABEL}
        </Button>
      </form>
    </div>
  );
}
