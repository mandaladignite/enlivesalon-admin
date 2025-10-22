"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from './AuthContext';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!admin;
  const isAdmin = admin?.role === 'admin';

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Verify token and get user info
          const response = await apiRequest('/auth/profile');
          if (response.data && response.data.role === 'admin') {
            setAdmin(response.data as AdminUser);
          } else {
            setAdmin(null);
            // Clear invalid token if user is not admin
            localStorage.removeItem('accessToken');
          }
        } else {
          setAdmin(null);
        }
      } catch (error) {
        console.error('Admin session check failed:', error);
        setAdmin(null);
        // Clear invalid token on error
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.data.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Store tokens in localStorage
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      
      // Set admin user and ensure state is updated
      setAdmin(response.data.user as AdminUser);
      
      // Debug: Log the admin state
      console.log('Admin login successful:', response.data.user);
      
      // Force a small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Admin login error:', error);
      setAdmin(null);
      localStorage.removeItem('accessToken');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear admin state
      setAdmin(null);
      
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      
      // Call server logout endpoint
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Server logout error:', error);
        // Continue with local logout even if server call fails
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AdminAuthContextType = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
