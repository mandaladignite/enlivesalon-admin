"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAuthenticated, isAdmin, loading, admin } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const isLoginPage = pathname === '/auth/admin/login';

  useEffect(() => {
    console.log('AdminRouteGuard - Auth state:', { isAuthenticated, isAdmin, loading, admin: admin?.email, pathname });
    
    if (!loading) {
      if (!isAuthenticated || !isAdmin) {
        console.log('AdminRouteGuard - Not authenticated, redirecting to login');
        // Only redirect if we're not already on the login page
        if (!isLoginPage) {
          setShouldRedirect(true);
          router.replace('/auth/admin/login');
        }
      } else {
        console.log('AdminRouteGuard - Authenticated as admin, allowing access');
        // If authenticated and admin, redirect away from login page
        if (isLoginPage) {
          router.replace('/');
        }
        setShouldRedirect(false);
      }
    }
  }, [isAuthenticated, isAdmin, loading, router, isLoginPage]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning={true}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" suppressHydrationWarning={true}></div>
      </div>
    );
  }

  // If on login page, render children directly (login form)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Don't render children if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return null; // Let the useEffect handle the redirect
  }

  // Render admin dashboard layout
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
