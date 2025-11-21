export const dynamic = 'force-dynamic';

import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { redirect } from 'next/navigation';
import { Manrope } from 'next/font/google';
import { getUserWithAccount } from '@/domains/users/repositories/user.repository';
import { AuthProvider } from '@/domains/core/auth/auth-context';
import { FeatureFlagsProvider } from '@/domains/core/feature-flags';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description: 'Get started quickly with Next.js, Postgres, and Stripe.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function PrivateLayout({
  children
}: {
  children: React.ReactNode;
}) {

  let user = null;
  let account = null;

  try {
    const auth = await getUserWithAccount();
    user = auth.user;
    account = auth.account;
    if (!user || !account) redirect('/login');
  }
  catch (error) {
    redirect('/login');
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`relative flex min-h-[100dvh] flex-col font-sans antialiased ${manrope.className}`}
      >
        <SidebarProvider>
          <AuthProvider user={user} account={account}>
            <FeatureFlagsProvider planName={account.planName}>
              <AppSidebar />
              <main className='w-full m-2 lg:mr-4'>
                {children}
              </main>
            </FeatureFlagsProvider>
          </AuthProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
