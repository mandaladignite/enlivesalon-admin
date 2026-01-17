import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

export interface AdminMembership {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  packageId: {
    _id: string;
    name: string;
    price: number;
    duration: number;
    durationUnit: string;
  };
  packageName: string;
  description: string;
  startDate: string;
  expiryDate: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId?: string;
  amountPaid: number;
  discountApplied: number;
  remainingAppointments: number;
  usedAppointments: number;
  benefits: string[];
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipStats {
  overview: {
    totalMemberships?: number;
    activeMemberships?: number;
    expiredMemberships?: number;
    expiringSoon?: number;
    totalRevenue?: number;
  };
  packageStats?: Array<{
    _id: string;
    count: number;
    totalRevenue: number;
    averageAmount: number;
  }>;
  monthlyStats?: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
    revenue: number;
  }>;
}

export interface MembershipFilters {
  status?: 'active' | 'expired' | 'expiring_soon';
  userId?: string;
  packageId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  page?: number;
  limit?: number;
  search?: string;
}

export const useAdminMemberships = (filters: MembershipFilters = {}) => {
  const [memberships, setMemberships] = useState<AdminMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMemberships: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiRequest(`/memberships/admin/all?${queryParams.toString()}`);
      if (response.success) {
        setMemberships(response.data.memberships);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch memberships');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch memberships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, [JSON.stringify(filters)]);

  return {
    memberships,
    loading,
    error,
    pagination,
    refetch: fetchMemberships
  };
};

export const useAdminMembershipStats = () => {
  const [stats, setStats] = useState<MembershipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/memberships/admin/stats');
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

export const useAdminMembershipActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMembershipById = async (membershipId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/memberships/admin/${membershipId}`);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch membership');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch membership';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateMembership = async (membershipId: string, updateData: Partial<AdminMembership>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/memberships/admin/${membershipId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update membership');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update membership';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelMembership = async (membershipId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/memberships/admin/${membershipId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason })
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to cancel membership');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel membership';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchMemberships = async (query: string, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/memberships/admin/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      if (response.success) {
        return {
          memberships: response.data.memberships,
          pagination: response.data.pagination
        };
      } else {
        throw new Error(response.message || 'Failed to search memberships');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search memberships';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    getMembershipById,
    updateMembership,
    cancelMembership,
    searchMemberships,
    loading,
    error
  };
};
