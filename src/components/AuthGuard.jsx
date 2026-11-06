'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthGuard({ children }) {
  const { user, isLoaded } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user && pathname !== '/login') {
      // Preserve invite query param if present
      const search = typeof window !== 'undefined' ? window.location.search : '';
      router.replace(`/login${search}`);
    }
  }, [user, isLoaded, pathname, router]);

  // Always render login page freely
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show friendly loading state while checking session
  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black mb-3 animate-pulse">
          س
        </div>
        <p className="text-xs font-bold text-zinc-500">جاري تحميل سَكَن سبليت...</p>
      </div>
    );
  }

  // If not logged in and not on /login, don't flash dashboard
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

