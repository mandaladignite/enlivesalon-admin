import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface DashboardStats {
  totalBookings: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  activeCustomers: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  productsSold: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  revenue: {
    value: string;
    change: string;
    trend: 'up' | 'down';
  };
}

interface Booking {
  _id: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  totalPrice: number;
}

interface DashboardOverview {
  stats: DashboardStats;
  recentBookings: Booking[];
  upcomingAppointments: Booking[];
}

export const useAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/admin/dashboard/overview');
      setDashboardData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiRequest('/admin/dashboard/stats');
      return response.data;
    } catch (err: any) {
      console.error('Stats fetch error:', err);
      throw err;
    }
  };

  const fetchRecentBookings = async (limit = 10, status?: string) => {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (status) params.append('status', status);
      
      const response = await apiRequest(`/admin/dashboard/recent-bookings?${params}`);
      return response.data;
    } catch (err: any) {
      console.error('Recent bookings fetch error:', err);
      throw err;
    }
  };

  const fetchUpcomingAppointments = async (limit = 5) => {
    try {
      const response = await apiRequest(`/admin/dashboard/upcoming-appointments?limit=${limit}`);
      return response.data;
    } catch (err: any) {
      console.error('Upcoming appointments fetch error:', err);
      throw err;
    }
  };

  const fetchRevenueAnalytics = async (period = 'month') => {
    try {
      const response = await apiRequest(`/admin/dashboard/revenue-analytics?period=${period}`);
      return response.data;
    } catch (err: any) {
      console.error('Revenue analytics fetch error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData,
    fetchStats,
    fetchRecentBookings,
    fetchUpcomingAppointments,
    fetchRevenueAnalytics
  };
};
