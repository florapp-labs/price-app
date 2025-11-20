import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description: 'Get started quickly with Next.js, Postgres, and Stripe.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function PublicLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`relative flex min-h-[100dvh] flex-col bg-background font-sans antialiased ${manrope.className}`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <div className="pointer-events-none fixed inset-0 -z-10 select-none opacity-40 [background:radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.15),transparent_60%),radial-gradient(circle_at_80%_30%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(circle_at_50%_80%,hsl(var(--primary)/0.1),transparent_60%)] dark:opacity-30" />
      </body>
    </html>
  );
}
