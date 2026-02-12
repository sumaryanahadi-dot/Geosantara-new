"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = "admin@geosantara.com";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Cek session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login?redirect=/admin/destinations');
          return;
        }

        // Cek apakah user adalah admin
        const userEmail = session.user.email?.toLowerCase();
        const isAdminUser = userEmail === ADMIN_EMAIL.toLowerCase();

        if (!isAdminUser) {
          // Jika bukan admin, redirect ke home
          router.push('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin access check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Spacing for navbar (since navbar is fixed) */}
      <div className="h-16"></div>

      {/* Main Content Area - dengan container yang tepat */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}