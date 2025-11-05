// import '../public/globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUserWithAccount } from '@/domains/users/repositories/user.repository';
import { AuthProvider } from '@/domains/core/auth/auth-context';

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

  const data = await getUserWithAccount();
  console.log('Layout user:', data?.user, 'account:', data?.account);

  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <AuthProvider user={data?.user || null} account={data?.account || null}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
