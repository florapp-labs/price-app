// import '../public/globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUserWithAccount } from '@/domains/users/repositories/user.repository';
import { AuthProvider } from '@/domains/core/auth/auth-context';
import { FeatureFlagsProvider } from '@/domains/core/feature-flags';

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description: 'Get started quickly with Next.js, Postgres, and Stripe.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {

  const { user, account } = await getUserWithAccount();

  return (
    <section>
      PRIVATE LAYOUT
      <AuthProvider user={user} account={account}>
        <FeatureFlagsProvider planName={account.planName}>
          {children}
        </FeatureFlagsProvider>
      </AuthProvider>
    </section>
  );
}
