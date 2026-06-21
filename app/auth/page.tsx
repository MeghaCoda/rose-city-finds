import { cookies } from 'next/headers';
import { AuthPage } from './AuthPage';

export default async function Page() {
  const cookieStore = await cookies();
  const isSignedIn = !!cookieStore.get('auth_token')?.value;

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16">
      <AuthPage isSignedIn={isSignedIn} />
    </main>
  );
}
