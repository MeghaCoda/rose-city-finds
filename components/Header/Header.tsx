import Link from 'next/link';
import Image from 'next/image';

export function Header() {
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
                <p className="text-sm text-secondary-300 leading-tight mt-1">
          Portland&apos;s free and discount food finder
        </p>
        </div>
          </div>
        </Link>
      </div>
      <nav className="shrink-0 ml-4">
        <Link
          href="/about"
          className="text-sm font-semibold text-[#F0F2F8] hover:text-secondary-300 transition-colors"
        >
          About
        </Link>
      </nav>
    </header>
  );
}
