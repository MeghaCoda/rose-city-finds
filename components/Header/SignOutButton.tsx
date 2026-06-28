'use client';

import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-teal hover:text-[#F0F2F8] transition-colors underline underline-offset-4"
    >
      Sign out
    </button>
  );
}
