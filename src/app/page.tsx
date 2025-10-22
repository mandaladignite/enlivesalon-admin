'use client'

import { motion } from 'framer-motion'
import { Calendar, Users, CreditCard, TrendingUp, MoreHorizontal, Search, Bell, Filter, ChevronDown, Menu, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin } = useAdminAuth();
  const { dashboardData, loading, error, refetch } = useAdminDashboard();
  
  // Dynamic stats from API
  const stats = dashboardData?.stats ? [
    {
      name: 'Total Bookings',
      value: dashboardData.stats.totalBookings.value.toString(),
      change: dashboardData.stats.totalBookings.change,
      trend: dashboardData.stats.totalBookings.trend,
      icon: Calendar,
    },
    {
      name: 'Active Customers',
      value: dashboardData.stats.activeCustomers.value.toString(),
      change: dashboardData.stats.activeCustomers.change,
      trend: dashboardData.stats.activeCustomers.trend,
      icon: Users,
    },
    {
      name: 'Total Bookings',
      value: dashboardData.stats.totalBookings.value.toString(),
      change: dashboardData.stats.totalBookings.change,
      trend: dashboardData.stats.totalBookings.trend,
      icon: Calendar,
    },
    {
      name: 'Revenue',
      value: dashboardData.stats.revenue.value,
      change: dashboardData.stats.revenue.change,
      trend: dashboardData.stats.revenue.trend,
      icon: CreditCard,
    },
  ] : [
    {
      name: 'Total Bookings',
      value: '0',
      change: '0%',
      trend: 'up' as const,
      icon: Calendar,
    },
    {
      name: 'Active Customers',
      value: '0',
      change: '0%',
      trend: 'up' as const,
      icon: Users,
    },
    {
      name: 'Services Booked',
      value: '0',
      change: '0%',
      trend: 'up' as const,
      icon: Calendar,
    },
    {
      name: 'Revenue',
      value: '₹0',
      change: '0%',
      trend: 'up' as const,
      icon: CreditCard,
    },
  ];

  // Dynamic recent bookings from API
  const recentBookings = dashboardData?.recentBookings || [];

  const statusStyles: Record<string, string> = {
    Confirmed: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-blue-100 text-blue-800',
    Cancelled: 'bg-red-100 text-red-800',
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <div className="flex-1 p-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {admin?.name || 'Admin'}!</h2>
            <p className="text-gray-600">Here's what's happening with your salon today.</p>
            <div className="mt-2 text-sm text-gray-500">
              Logged in as: {admin?.email} | Role: {admin?.role}
            </div>
          </div>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map(({ name, value, change, trend, icon: Icon }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{name}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
                    <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className={`h-3 w-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
                      <span>{change} from last week</span>
                    </div>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
                <button className="text-sm text-indigo-600 hover:underline flex items-center">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </button>
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Revenue chart visualization</p>
                  <p className="text-xs">(Integration with Chart.js or Recharts)</p>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                <button className="text-sm text-indigo-600 hover:underline">View all</button>
              </div>
              <div className="space-y-4">
                {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                  dashboardData.upcomingAppointments.map((appointment, idx) => (
                    <div key={appointment._id || idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.customerName}</h4>
                          <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[appointment.status] || 'bg-gray-100 text-gray-800'}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">
                          {appointment.date} • {appointment.time}
                        </div>
                        <div className="text-sm font-medium text-indigo-600">
                          ₹{appointment.totalPrice}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>No upcoming appointments</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <div className="flex space-x-2">
                <button className="text-sm text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-300 flex items-center">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </button>
                <button className="text-sm text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-300 flex items-center">
                  Export <MoreHorizontal className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, idx) => (
                      <tr key={booking._id || idx} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{booking.customerName}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{booking.serviceName}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div>{booking.date}</div>
                          <div className="text-gray-500">{booking.time}</div>
                        </td>
                        <td className="px-4 py-4 font-medium text-indigo-600">₹{booking.totalPrice}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            View details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No recent bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
   
  )
}