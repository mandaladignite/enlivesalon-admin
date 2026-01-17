import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

export interface AdminPackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  formattedDuration: string;
  benefits: string[];
  services: string[];
  discountPercentage: number;
  savingsAmount: number;
  maxAppointments: number | null;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackageStats {
  totalPackages?: number;
  activePackages?: number;
  popularPackages?: number;
  totalRevenue?: number;
  averagePrice?: number;
  topSellingPackages?: Array<{
    _id: string;
    name: string;
    salesCount: number;
    revenue: number;
  }>;
}

export interface PackageFilters {
  isActive?: boolean;
  isPopular?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'sortOrder' | 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

export const useAdminPackages = (filters: PackageFilters = {}) => {
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPackages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await apiRequest(`/packages/admin/all?${queryParams.toString()}`);
      
      if (response.success) {
        setPackages(response.data.packages);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch packages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch packages';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [JSON.stringify(filters)]);

  return {
    packages,
    loading,
    error,
    pagination,
    refetch: fetchPackages
  };
};

export const useAdminPackageStats = () => {
  const [stats, setStats] = useState<PackageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/packages/admin/stats');
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

export const useAdminPackageActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPackage = async (packageData: Partial<AdminPackage>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/packages', {
        method: 'POST',
        body: JSON.stringify(packageData)
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create package');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create package';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePackage = async (packageId: string, updateData: Partial<AdminPackage>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/packages/${packageId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update package');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update package';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (packageId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/packages/${packageId}`, {
        method: 'DELETE'
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete package');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete package';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deactivatePackage = async (packageId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/packages/${packageId}/deactivate`, {
        method: 'PATCH'
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to deactivate package');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate package';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reactivatePackage = async (packageId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/packages/${packageId}/reactivate`, {
        method: 'PATCH'
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to reactivate package');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reactivate package';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePopularStatus = async (packageId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/packages/${packageId}/toggle-popular`, {
        method: 'PATCH'
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to toggle popular status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle popular status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateSortOrder = async (packageId: string, sortOrder: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/packages/${packageId}/sort-order`, {
        method: 'PATCH',
        body: JSON.stringify({ sortOrder })
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update sort order');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update sort order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPackageById = async (packageId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/packages/${packageId}`);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch package');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch package';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createPackage,
    updatePackage,
    deletePackage,
    deactivatePackage,
    reactivatePackage,
    togglePopularStatus,
    updateSortOrder,
    getPackageById,
    loading,
    error
  };
};
