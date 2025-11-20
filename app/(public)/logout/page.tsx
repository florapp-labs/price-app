'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/domains/core/auth';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await axios.post('/api/auth/logout');
        
        // redirect with window.location to guarantee full reload
        window.location.href = '/'
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login'
      }
    }
    logout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Logging out...</h2>
      </div>
    </div>
  );
}
