'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { appointmentAPI } from '@/lib/api';
import TodaysAppointments from './TodaysAppointments';

interface BookingStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  todayAppointments: number;
  upcomingAppointments: number;
}

interface Appointment {
  _id: string;
  userId: {
    name: string;
    email: string;
    phone: string;
  };
  serviceId: {
    name: string;
    duration: number;
    price: number;
    category: string;
  };
  stylistId?: {
    name: string;
    specialties: string[];
  };
  date: string;
  timeSlot: string;
  status: string;
  totalPrice: number;
  location: string;
  createdAt: string;
}

export default function BookingDashboard() {
  const [stats, setStats] = useState<BookingStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load recent appointments
      const appointmentsResponse = await appointmentAPI.getAllAppointments({ 
        limit: 10, 
        sortBy: 'date', 
        sortOrder: 'desc' 
      });
      setRecentAppointments(appointmentsResponse.data?.appointments || []);

      // Calculate stats from appointments
      const appointments = appointmentsResponse.data?.appointments || [];
      const today = new Date().toDateString();
      const todayAppts = appointments.filter((apt: Appointment) => 
        new Date(apt.date).toDateString() === today
      );
      const upcomingAppts = appointments.filter((apt: Appointment) => 
        new Date(apt.date) > new Date()
      );

      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter((apt: Appointment) => apt.status === 'pending').length,
        confirmedAppointments: appointments.filter((apt: Appointment) => apt.status === 'confirmed').length,
        completedAppointments: appointments.filter((apt: Appointment) => apt.status === 'completed').length,
        cancelledAppointments: appointments.filter((apt: Appointment) => apt.status === 'cancelled').length,
        totalRevenue: appointments.reduce((sum: number, apt: Appointment) => sum + apt.totalPrice, 0),
        todayAppointments: todayAppts.length,
        upcomingAppointments: upcomingAppts.length,
      });

    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard data');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.confirmedAppointments}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedAppointments}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelledAppointments}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>
      </motion.div>

      {/* Today's Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <TodaysAppointments />
      </motion.div>

      {/* Recent Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            View All
          </button>
        </div>
        
        {recentAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAppointments.slice(0, 5).map((appointment, index) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.userId.name}</h4>
                      <p className="text-sm text-gray-600">{appointment.serviceId.name}</p>
                    </div>
                    {appointment.stylistId && (
                      <div className="text-xs text-gray-500">
                        Stylist: {appointment.stylistId.name}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{formatDate(appointment.date)}</span>
                    <span>{formatTime(appointment.timeSlot)}</span>
                    <span>₹{appointment.totalPrice}</span>
                    {appointment.location === 'home' && (
                      <span className="text-blue-600">📍 Home</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
