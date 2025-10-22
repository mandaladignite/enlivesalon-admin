export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// Enhanced API request function with automatic token refresh
export async function apiRequest<T = any>(
  path: string, 
  options: RequestInit = {},
  retryOptions: { maxRetries?: number; retryDelay?: number } = {}
): Promise<ApiResponse<T>> {
  const { maxRetries = 3, retryDelay = 1000 } = retryOptions;
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const config: RequestInit = {
    ...options,
    headers: {
      // Only set Content-Type for non-FormData requests
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
    credentials: "include",
  };

  let lastError: Error | null = null;
  let hasTriedRefresh = false;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }

      
      const res = await fetch(`${API_BASE_URL}${path}`, config);

      // Handle different response types
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error Response:', {
          status: res.status,
          statusText: res.statusText,
          body: errorText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Unknown error occurred' };
        }
        
        // If we get a 401 and haven't tried refreshing the token yet, try to refresh
        if (res.status === 401 && !hasTriedRefresh && typeof window !== 'undefined') {
          hasTriedRefresh = true;
          
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.data && refreshData.data.accessToken) {
                localStorage.setItem('accessToken', refreshData.data.accessToken);
                // Update the token in the config for the retry
                config.headers = {
                  ...config.headers,
                  Authorization: `Bearer ${refreshData.data.accessToken}`
                };
                continue; // Retry the original request with new token
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear invalid tokens
            localStorage.removeItem('accessToken');
            // Don't redirect automatically - let the auth context handle it
            // This prevents redirect loops for admin users
          }
        }
        
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      
      return data;
    } catch (error) {
      lastError = error as Error;
      console.error(`API Request failed (attempt ${attempt + 1}):`, error);
      
      if (attempt === maxRetries) {
        console.error('All retry attempts failed');
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error('Request failed after all retries');
}

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: any) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () =>
    apiRequest('/auth/logout', { method: 'POST' }),

  refreshToken: () =>
    apiRequest('/auth/refresh-token', { method: 'POST' }),

  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  verifyEmail: (token: string) =>
    apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resendVerification: (email: string) =>
    apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getProfile: () =>
    apiRequest('/auth/profile'),

  updateProfile: (userData: any) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};

// Service APIs
export const serviceAPI = {
  getAll: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/services${queryString}`);
  },
  
  getById: (id: string) =>
    apiRequest(`/services/${id}`),
  
  // New category-wise APIs
  getByCategory: (category: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/services/category/${category}${queryString}`);
  },
  
  getFeatured: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/services/featured/list${queryString}`);
  },
  
  getCategories: () =>
    apiRequest('/services/categories/list'),
  
  // Admin functions
  create: (serviceData: FormData | any) => {
    const isFormData = serviceData instanceof FormData;
    return apiRequest('/services', {
      method: 'POST',
      body: isFormData ? serviceData : JSON.stringify(serviceData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  update: (id: string, serviceData: FormData | any) => {
    const isFormData = serviceData instanceof FormData;
    return apiRequest(`/services/${id}`, {
      method: 'PUT',
      body: isFormData ? serviceData : JSON.stringify(serviceData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  delete: (id: string) =>
    apiRequest(`/services/${id}`, { method: 'DELETE' }),
  
  deactivate: (id: string) =>
    apiRequest(`/services/${id}/deactivate`, { method: 'PATCH' }),
  
  reactivate: (id: string) =>
    apiRequest(`/services/${id}/reactivate`, { method: 'PATCH' }),
  
  // New admin functions
  uploadPhoto: (id: string, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    return apiRequest(`/services/${id}/photo`, {
      method: 'POST',
      body: formData,
    });
  },
  
  toggleFeatured: (id: string) =>
    apiRequest(`/services/${id}/featured`, { method: 'PATCH' }),
  
  getStats: () =>
    apiRequest('/services/stats'),
  
  getAllAdmin: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/services/admin/all${queryString}`);
  },
  
  getByIdAdmin: (id: string) =>
    apiRequest(`/services/admin/${id}`),
  
  createAdmin: (serviceData: FormData | any) => {
    const isFormData = serviceData instanceof FormData;
    return apiRequest('/services/admin', {
      method: 'POST',
      body: isFormData ? serviceData : JSON.stringify(serviceData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  updateAdmin: (id: string, serviceData: FormData | any) => {
    const isFormData = serviceData instanceof FormData;
    return apiRequest(`/services/admin/${id}`, {
      method: 'PUT',
      body: isFormData ? serviceData : JSON.stringify(serviceData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  deleteAdmin: (id: string) =>
    apiRequest(`/services/admin/${id}`, { method: 'DELETE' }),
  
  getStatsAdmin: () =>
    apiRequest('/services/admin/stats'),
  
  bulkUpdate: (serviceIds: string[], updateData: any) =>
    apiRequest('/services/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ serviceIds, updateData }),
    }),
};

// Stylist APIs
export const stylistAPI = {
  getAll: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/stylists${queryString}`);
  },
  
  getById: (id: string) =>
    apiRequest(`/stylists/${id}`),
  
  getFeatured: () =>
    apiRequest('/stylists/featured'),
  
  getByService: (serviceId: string) =>
    apiRequest(`/stylists/service/${serviceId}`),
  
  getAvailability: (stylistId: string, date: string) =>
    apiRequest(`/stylists/${stylistId}/availability?date=${date}`),
  
  // Admin functions
  create: (stylistData: FormData | any) => {
    const isFormData = stylistData instanceof FormData;
    return apiRequest('/stylists', {
      method: 'POST',
      body: isFormData ? stylistData : JSON.stringify(stylistData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  update: (id: string, stylistData: FormData | any) => {
    const isFormData = stylistData instanceof FormData;
    return apiRequest(`/stylists/${id}`, {
      method: 'PUT',
      body: isFormData ? stylistData : JSON.stringify(stylistData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  delete: (id: string) =>
    apiRequest(`/stylists/${id}`, { method: 'DELETE' }),
  
  toggleActive: (id: string) =>
    apiRequest(`/stylists/${id}/toggle-active`, { method: 'PATCH' }),
  
  deactivate: (id: string) =>
    apiRequest(`/stylists/${id}/deactivate`, { method: 'PATCH' }),
  
  reactivate: (id: string) =>
    apiRequest(`/stylists/${id}/reactivate`, { method: 'PATCH' }),
  
  uploadPhoto: (id: string, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    return apiRequest(`/stylists/${id}/photo`, {
      method: 'POST',
      body: formData,
    });
  },
  
  getStats: () =>
    apiRequest('/stylists/stats'),
  
  getAllAdmin: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/stylists/admin/all${queryString}`);
  },
  
  getByIdAdmin: (id: string) =>
    apiRequest(`/stylists/admin/${id}`),
  
  createAdmin: (stylistData: FormData | any) => {
    const isFormData = stylistData instanceof FormData;
    return apiRequest('/stylists/admin', {
      method: 'POST',
      body: isFormData ? stylistData : JSON.stringify(stylistData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  updateAdmin: (id: string, stylistData: FormData | any) => {
    const isFormData = stylistData instanceof FormData;
    return apiRequest(`/stylists/admin/${id}`, {
      method: 'PUT',
      body: isFormData ? stylistData : JSON.stringify(stylistData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  deleteAdmin: (id: string) =>
    apiRequest(`/stylists/admin/${id}`, { method: 'DELETE' }),
  
  getStatsAdmin: () =>
    apiRequest('/stylists/admin/stats'),
};

// Appointment APIs
export const appointmentAPI = {
  create: (appointmentData: any) =>
    apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),
  
  getUserAppointments: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/appointments/my-appointments${queryString}`);
  },
  
  getAppointment: (id: string) =>
    apiRequest(`/appointments/${id}`),
  
  update: (id: string, appointmentData: any) =>
    apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    }),
  
  cancel: (id: string, cancellationReason?: string) =>
    apiRequest(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ cancellationReason }),
    }),
  
  reschedule: (id: string, newDate: string, newTimeSlot: string, reason?: string) =>
    apiRequest(`/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ newDate, newTimeSlot, reason }),
    }),
  
  getAvailableSlots: (stylistId: string, serviceId: string, date: string) =>
    apiRequest(`/appointments/available-slots?stylistId=${stylistId}&serviceId=${serviceId}&date=${date}`),
  
  getAvailableTimeSlots: (stylistId: string, date: string) =>
    apiRequest(`/appointments/time-slots/available?stylistId=${stylistId}&date=${date}`),
  
  getAvailableDates: (stylistId: string) =>
    apiRequest(`/appointments/dates/available?stylistId=${stylistId}`),
  
  // Admin functions
  getAllAdmin: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/appointments${queryString}`);
  },
  
  // Alias for getAllAdmin to match the usage in components
  getAllAppointments: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/appointments${queryString}`);
  },
  
  getAppointmentAdmin: (id: string) =>
    apiRequest(`/appointments/${id}`),
  
  // Alias for getAppointmentAdmin to match the usage in components
  getById: (id: string) =>
    apiRequest(`/appointments/${id}`),
  
  updateStatus: (id: string, status: string, reason?: string) =>
    apiRequest(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),
  
  getStatsAdmin: () =>
    apiRequest('/appointments/stats/overview'),
  
  getOverviewStats: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/appointments/stats/overview${queryString}`);
  },

  getTodaysAppointments: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/appointments/today${queryString}`);
  },
};


// Package APIs
export const packageAPI = {
  getAll: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/packages${queryString}`);
  },
  
  getById: (id: string) =>
    apiRequest(`/packages/${id}`),
  
  getFeatured: () =>
    apiRequest('/packages/featured'),
  
  getByCategory: (category: string) =>
    apiRequest(`/packages/category/${category}`),
  
  // Admin functions
  create: (packageData: any) =>
    apiRequest('/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    }),
  
  update: (id: string, packageData: any) =>
    apiRequest(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    }),
  
  delete: (id: string) =>
    apiRequest(`/packages/${id}`, { method: 'DELETE' }),
  
  toggleActive: (id: string) =>
    apiRequest(`/packages/${id}/toggle-active`, { method: 'PATCH' }),
  
  getStats: () =>
    apiRequest('/packages/stats'),
  
  getAllAdmin: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/packages/admin/all${queryString}`);
  },
  
  getByIdAdmin: (id: string) =>
    apiRequest(`/packages/admin/${id}`),
  
  createAdmin: (packageData: any) =>
    apiRequest('/packages/admin', {
      method: 'POST',
      body: JSON.stringify(packageData),
    }),
  
  updateAdmin: (id: string, packageData: any) =>
    apiRequest(`/packages/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    }),
  
  deleteAdmin: (id: string) =>
    apiRequest(`/packages/admin/${id}`, { method: 'DELETE' }),
  
  getStatsAdmin: () =>
    apiRequest('/packages/admin/stats'),
};

// Membership APIs
export const membershipAPI = {
  getAll: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/memberships${queryString}`);
  },
  
  getById: (id: string) =>
    apiRequest(`/memberships/${id}`),
  
  getFeatured: () =>
    apiRequest('/memberships/featured'),
  
  getUserMemberships: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/memberships/my/all${queryString}`);
  },
  
  getMyAll: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/memberships/my/all${queryString}`);
  },
  
  purchase: (packageId: string, notes?: string, autoRenewal?: boolean) =>
    apiRequest('/memberships/purchase', {
      method: 'POST',
      body: JSON.stringify({ 
        packageId, 
        notes, 
        autoRenewal 
      }),
    }),
  
  verifyPayment: (paymentData: any) =>
    apiRequest('/memberships/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
  
  join: (membershipId: string, paymentData: any) =>
    apiRequest(`/memberships/${membershipId}/join`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
  
  cancel: (membershipId: string, reason?: string) =>
    apiRequest(`/memberships/my/${membershipId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  
  extend: (membershipId: string, additionalDays: number) =>
    apiRequest(`/memberships/my/${membershipId}/extend`, {
      method: 'PATCH',
      body: JSON.stringify({ additionalDays }),
    }),
  
  useAppointment: (membershipId: string) =>
    apiRequest(`/memberships/my/${membershipId}/use-appointment`, {
      method: 'PATCH',
    }),
  
  // Admin functions
  create: (membershipData: any) =>
    apiRequest('/memberships', {
      method: 'POST',
      body: JSON.stringify(membershipData),
    }),
  
  update: (id: string, membershipData: any) =>
    apiRequest(`/memberships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(membershipData),
    }),
  
  delete: (id: string) =>
    apiRequest(`/memberships/${id}`, { method: 'DELETE' }),
  
  getStats: () =>
    apiRequest('/memberships/my/stats'),
  
  getAllAdmin: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/memberships/admin/all${queryString}`);
  },
  
  getByIdAdmin: (id: string) =>
    apiRequest(`/memberships/admin/${id}`),
  
  createAdmin: (membershipData: any) =>
    apiRequest('/memberships/admin', {
      method: 'POST',
      body: JSON.stringify(membershipData),
    }),
  
  updateAdmin: (id: string, membershipData: any) =>
    apiRequest(`/memberships/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(membershipData),
    }),
  
  deleteAdmin: (id: string) =>
    apiRequest(`/memberships/admin/${id}`, { method: 'DELETE' }),
  
  getStatsAdmin: () =>
    apiRequest('/memberships/admin/stats'),
};

// Gallery APIs
export const galleryAPI = {
  getAll: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/gallery${queryString}`);
  },
  
  getById: (id: string) =>
    apiRequest(`/gallery/${id}`),
  
  getByCategory: (category: string) =>
    apiRequest(`/gallery/category/${category}`),
  
  getFeatured: () =>
    apiRequest('/gallery/featured'),
  
  // Admin functions
  upload: (imageData: FormData) =>
    apiRequest('/gallery/upload', {
      method: 'POST',
      body: imageData,
    }),
  
  create: (galleryData: any) =>
    apiRequest('/gallery', {
      method: 'POST',
      body: JSON.stringify(galleryData),
    }),
  
  update: (id: string, galleryData: any) =>
    apiRequest(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(galleryData),
    }),
  
  delete: (id: string) =>
    apiRequest(`/gallery/${id}`, { method: 'DELETE' }),
  
  toggleFeatured: (id: string) =>
    apiRequest(`/gallery/${id}/featured`, { method: 'PATCH' }),
  
  getStats: () =>
    apiRequest('/gallery/stats'),
  
  getAllAdmin: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/gallery/admin/all${queryString}`);
  },
  
  getByIdAdmin: (id: string) =>
    apiRequest(`/gallery/admin/${id}`),
  
  createAdmin: (galleryData: any) =>
    apiRequest('/gallery/admin', {
      method: 'POST',
      body: JSON.stringify(galleryData),
    }),
  
  updateAdmin: (id: string, galleryData: any) =>
    apiRequest(`/gallery/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(galleryData),
    }),
  
  deleteAdmin: (id: string) =>
    apiRequest(`/gallery/admin/${id}`, { method: 'DELETE' }),
  
  getStatsAdmin: () =>
    apiRequest('/gallery/admin/stats'),
  
  getDashboardStats: () =>
    apiRequest('/gallery/admin/dashboard/stats'),
};

// Admin APIs
export const adminAPI = {
  
  
  // User Management
  getAllUsers: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/users/admin/all${queryString}`);
  },
  
  updateUserStatus: (id: string, status: string) =>
    apiRequest(`/users/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  
  getUserStats: () =>
    apiRequest('/users/admin/stats'),
  
  // Membership Management
  getAllMemberships: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/memberships/admin/all${queryString}`);
  },
  
  getMembershipById: (id: string) =>
    apiRequest(`/memberships/admin/${id}`),
  
  updateMembership: (id: string, updateData: any) =>
    apiRequest(`/memberships/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),
  
  cancelMembership: (id: string, reason: string) =>
    apiRequest(`/memberships/admin/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  
  getMembershipStats: () =>
    apiRequest('/memberships/admin/stats'),
  
  // Dashboard Stats
  getDashboardStats: () =>
    apiRequest('/admin/dashboard/stats'),
  
  getOverviewStats: () =>
    apiRequest('/admin/overview/stats'),
  
  // System Management
  getSystemHealth: () =>
    apiRequest('/admin/system/health'),
  
  getSystemStats: () =>
    apiRequest('/admin/system/stats'),
  
  // Analytics
  getAnalytics: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/admin/analytics${queryString}`);
  },
  
  getRevenueAnalytics: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/admin/analytics/revenue${queryString}`);
  },
  
  getCustomerAnalytics: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/admin/analytics/customers${queryString}`);
  },
  
  getServiceAnalytics: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/admin/analytics/services${queryString}`);
  },
  
  getAppointmentAnalytics: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/admin/analytics/appointments${queryString}`);
  },
};


// Enquiry APIs
export const enquiryAPI = {
  create: (enquiryData: any) =>
    apiRequest('/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryData),
    }),
  
  getUserEnquiries: () =>
    apiRequest('/enquiries/my-enquiries'),
  
  getMyEnquiries: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/enquiries/my-enquiries${queryString}`);
  },
  
  getEnquiry: (id: string) =>
    apiRequest(`/enquiries/${id}`),
  
  update: (id: string, enquiryData: any) =>
    apiRequest(`/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(enquiryData),
    }),
  
  delete: (id: string) =>
    apiRequest(`/enquiries/${id}`, { method: 'DELETE' }),
  
  // Admin functions
  getAll: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/enquiries${queryString}`);
  },
  
  getAllAdmin: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/enquiries/admin/all${queryString}`);
  },
  
  search: (query: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams({ ...params, search: query }).toString()}` : `?search=${encodeURIComponent(query)}`;
    return apiRequest(`/enquiries/search${queryString}`);
  },
  
  getStats: () =>
    apiRequest('/enquiries/admin/stats'),
  
  bulkUpdate: (enquiryIds: string[], updateData: any) =>
    apiRequest('/enquiries/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ enquiryIds, updateData }),
    }),
  
  updateStatus: (id: string, status: string, response?: string) =>
    apiRequest(`/enquiries/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, response }),
    }),
  
  respond: (id: string, message: string, responseMethod: string) =>
    apiRequest(`/enquiries/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ message, responseMethod }),
    }),
  
  assign: (id: string, assignedTo: string) =>
    apiRequest(`/enquiries/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo }),
    }),
  
  getStatsAdmin: () =>
    apiRequest('/enquiries/stats'),
};


// Address APIs
export const addressAPI = {
  getAll: () =>
    apiRequest('/addresses'),
  
  getById: (id: string) =>
    apiRequest(`/addresses/${id}`),
  
  create: (addressData: any) =>
    apiRequest('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),
  
  update: (id: string, addressData: any) =>
    apiRequest(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    }),
  
  delete: (id: string) =>
    apiRequest(`/addresses/${id}`, { method: 'DELETE' }),
  
  setDefault: (id: string) =>
    apiRequest(`/addresses/${id}/default`, { method: 'PATCH' }),

  duplicate: (id: string, newLabel: string) =>
    apiRequest(`/addresses/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newLabel }),
    }),
};

// Review APIs
export const reviewAPI = {
  getAll: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/reviews${queryString}`);
  },
  
  getById: (id: string) =>
    apiRequest(`/reviews/${id}`),
  
  getFeatured: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams({ ...params, isFeatured: 'true' }).toString()}` : '?isFeatured=true';
    return apiRequest(`/reviews${queryString}`);
  },
  
  getActive: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams({ ...params, isActive: 'true' }).toString()}` : '?isActive=true';
    return apiRequest(`/reviews${queryString}`);
  },
  
  // Admin functions
  create: (reviewData: FormData | any) => {
    const isFormData = reviewData instanceof FormData;
    return apiRequest('/reviews', {
      method: 'POST',
      body: isFormData ? reviewData : JSON.stringify(reviewData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  update: (id: string, reviewData: FormData | any) => {
    const isFormData = reviewData instanceof FormData;
    return apiRequest(`/reviews/${id}`, {
      method: 'PUT',
      body: isFormData ? reviewData : JSON.stringify(reviewData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  
  delete: (id: string) =>
    apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
  
  toggleStatus: (id: string) =>
    apiRequest(`/reviews/${id}/toggle-status`, { method: 'PATCH' }),
  
  toggleFeatured: (id: string) =>
    apiRequest(`/reviews/${id}/toggle-featured`, { method: 'PATCH' }),
  
  getAllAdmin: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/reviews/admin/dashboard${queryString}`);
  },
  
  getStats: () =>
    apiRequest('/reviews/admin/dashboard'),
};

// WhatsApp APIs
export const whatsappAPI = {
  sendMessage: (messageData: any) =>
    apiRequest('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
  
  sendTemplate: (templateData: any) =>
    apiRequest('/whatsapp/template', {
      method: 'POST',
      body: JSON.stringify(templateData),
    }),
  
  getTemplates: () =>
    apiRequest('/whatsapp/templates'),
  
  sendAppointmentReminder: (appointmentId: string) =>
    apiRequest(`/whatsapp/appointment-reminder/${appointmentId}`, {
      method: 'POST',
    }),
  
};
