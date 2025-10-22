"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminLoginRedirectProps {
  children: React.ReactNode;
}

export default function AdminLoginRedirect({ children }: AdminLoginRedirectProps) {
  const { isAuthenticated, isAdmin, loading, admin } = useAdminAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only check if not loading and not already redirecting
    if (!loading && !isRedirecting) {
      console.log('AdminLoginRedirect - Checking auth state:', { 
        isAuthenticated, 
        isAdmin, 
        loading, 
        adminEmail: admin?.email,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
      });

      if (!isAuthenticated || !isAdmin) {
        console.log('AdminLoginRedirect - Not authenticated, redirecting to login');
        setIsRedirecting(true);
        
        // Use replace to avoid back button issues
        router.replace('/auth/admin/login');
      } else {
        console.log('AdminLoginRedirect - Authenticated as admin, allowing access');
        setIsRedirecting(false);
      }
    }
  }, [isAuthenticated, isAdmin, loading, router, isRedirecting, admin]);

  // Show loading while checking authentication or redirecting
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Checking authentication...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
