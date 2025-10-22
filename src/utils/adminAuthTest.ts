// Admin Authentication Test Utility
// This file helps test the admin authentication flow

export const testAdminAuth = () => {
  console.log('🔐 Testing Admin Authentication Flow...');
  
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    console.log('❌ Not in browser environment');
    return false;
  }

  // Check localStorage for token
  const token = localStorage.getItem('accessToken');
  console.log('🔑 Token exists:', !!token);
  
  if (token) {
    console.log('✅ Token found in localStorage');
    return true;
  } else {
    console.log('❌ No token found');
    return false;
  }
};

export const clearAdminAuth = () => {
  console.log('🧹 Clearing admin authentication...');
  localStorage.removeItem('accessToken');
  console.log('✅ Admin authentication cleared');
};

export const simulateAdminLogin = (email: string, password: string) => {
  console.log('🔐 Simulating admin login...');
  console.log('📧 Email:', email);
  console.log('🔒 Password:', password ? '***' : 'empty');
  
  // This would normally make an API call
  // For testing purposes, we'll just log the attempt
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ Login simulation complete');
      resolve({ success: true });
    }, 1000);
  });
};
