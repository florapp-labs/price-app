'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { signInWithPassword } from '@/domains/core/auth/auth.client';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Authenticate with Firebase Auth and get idToken
      const idToken = await signInWithPassword(email, password);
      
      // Step 2: Send idToken to backend to create session
  await axios.post('/api/auth/login', { idToken });
  
  // redirect with full reload to ensure all state is reset
  window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <div className="flex lg:py-20 items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6 min-w-sm">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      className="mt-1"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      className="mt-1"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </Card>

            
        <Card className="w-full relative overflow-hidden border bg-white/90 backdrop-blur lg:fixed lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-[420px] lg:rounded-none lg:rounded-l-md lg:shadow-xl lg:z-10">
          <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-sky-500/10" />
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg">Ainda não tem conta?</CardTitle>
            <CardDescription>
              Crie sua conta gratuita e comece a precificar seus produtos em segundos.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-col gap-3">
            <Link
              href="/signup"
              className="w-full bg-gradient-to-r from-blue-800 via-cyan-800 to-slate-600 hover:brightness-110 transition focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 text-white inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-md"
            >
              Cadastre-se grátis
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
    </>
  );
}
