import Link from 'next/link';
import { cookies } from 'next/headers';
import { SignOutButton } from './SignOutButton';
import { StandardButton } from '../ui/StandardButton';
import Image from 'next/image';

export async function Header() {
  const cookieStore = await cookies();
  const isSignedIn = !!cookieStore.get('auth_token')?.value;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-primary">
      <div>
         <Link
            href="/">
              <div className="flex">
                <Image src="/logo.svg" alt="Rose City Finds" width={40} height={60} priority />
                <div className="pl-3 flex flex-col">
                <h1 className="text-2xl leading-tight text-[#F0F2F8]">
                Rose City Finds</h1>
                <p className="text-sm text-secondary leading-tight mt-1">
          Food deals in and around Portland, OR
        </p>
        </div>
          </div>
        </Link>
      </div>
      <nav className="shrink-0 ml-4">
        {isSignedIn ? (
          <SignOutButton />
        ) : (
          <Link
            href="/login">
            <StandardButton color="primary" variant="light">Sign in</StandardButton>
          </Link>
        )}
      </nav>
    </header>
  );
}
