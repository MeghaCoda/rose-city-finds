import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk, Libre_Franklin } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from './providers';
import { HeaderWrapper } from '@/components/Header/HeaderWrapper';
import { Header } from '@/components/Header/Header';
import { SITE_TITLE, SITE_DESCRIPTION } from '@/lib/constants';

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-header',
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
});

const libreFranklin = Libre_Franklin({
  variable: '--font-subheader',
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistMono.variable, spaceGrotesk.variable, libreFranklin.variable)}
    >
      <body className="min-h-full flex flex-col h-full" suppressHydrationWarning>
        <HeaderWrapper><Header /></HeaderWrapper>
        <div className="flex-1 flex flex-col min-h-0">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
