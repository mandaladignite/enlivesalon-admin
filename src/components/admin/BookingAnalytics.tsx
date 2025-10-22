'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock,
  Users,
  DollarSign,
  Filter,
  Download
} from 'lucide-react';
import { appointmentAPI } from '@/lib/api';

interface AnalyticsData {
  dailyStats: Array<{
    date: string;
    appointments: number;
    revenue: number;
  }>;
  serviceStats: Array<{
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  stylistStats: Array<{
    stylistName: string;
    appointments: number;
    revenue: number;
  }>;
  timeSlotStats: Array<{
    timeSlot: string;
    count: number;
  }>;
}

export default function BookingAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dailyStats: [],
    serviceStats: [],
    stylistStats: [],
    timeSlotStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7'); // days
  const [selectedMetric, setSelectedMetric] = useState('appointments');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await appointmentAPI.getAllAppointments({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        limit: 1000
      });

      const appointments = response.data?.appointments || [];
      processAnalyticsData(appointments);

    } catch (error: any) {
      setError(error.message || 'Failed to load analytics data');
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (appointments: any[]) => {
    // Daily stats
    const dailyMap = new Map();
    appointments.forEach(apt => {
      const date = new Date(apt.date).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { appointments: 0, revenue: 0 });
      }
      dailyMap.get(date).appointments += 1;
      dailyMap.get(date).revenue += apt.totalPrice;
    });

    const dailyStats = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      appointments: data.appointments,
      revenue: data.revenue
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Service stats
    const serviceMap = new Map();
    appointments.forEach(apt => {
      const serviceName = apt.serviceId.name;
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { count: 0, revenue: 0 });
      }
      serviceMap.get(serviceName).count += 1;
      serviceMap.get(serviceName).revenue += apt.totalPrice;
    });

    const serviceStats = Array.from(serviceMap.entries()).map(([serviceName, data]) => ({
      serviceName,
      count: data.count,
      revenue: data.revenue
    })).sort((a, b) => b.count - a.count);

    // Stylist stats
    const stylistMap = new Map();
    appointments.forEach(apt => {
      if (apt.stylistId) {
        const stylistName = apt.stylistId.name;
        if (!stylistMap.has(stylistName)) {
          stylistMap.set(stylistName, { appointments: 0, revenue: 0 });
        }
        stylistMap.get(stylistName).appointments += 1;
        stylistMap.get(stylistName).revenue += apt.totalPrice;
      }
    });

    const stylistStats = Array.from(stylistMap.entries()).map(([stylistName, data]) => ({
      stylistName,
      appointments: data.appointments,
      revenue: data.revenue
    })).sort((a, b) => b.appointments - a.appointments);

    // Time slot stats
    const timeSlotMap = new Map();
    appointments.forEach(apt => {
      const timeSlot = apt.timeSlot;
      if (!timeSlotMap.has(timeSlot)) {
        timeSlotMap.set(timeSlot, 0);
      }
      timeSlotMap.set(timeSlot, timeSlotMap.get(timeSlot) + 1);
    });

    const timeSlotStats = Array.from(timeSlotMap.entries()).map(([timeSlot, count]) => ({
      timeSlot,
      count
    })).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    setAnalyticsData({
      dailyStats,
      serviceStats,
      stylistStats,
      timeSlotStats
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
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
        <BarChart3 className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Analytics</h2>
          <p className="text-gray-600">Insights into your appointment bookings</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Daily Stats Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Appointments & Revenue</h3>
        <div className="h-64 flex items-end gap-2">
          {analyticsData.dailyStats.map((day, index) => {
            const maxAppointments = Math.max(...analyticsData.dailyStats.map(d => d.appointments));
            const height = (day.appointments / maxAppointments) * 200;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-indigo-100 rounded-t-lg relative" style={{ height: `${height}px` }}>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                    {day.appointments}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {formatDate(day.date)}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  ₹{day.revenue}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Service Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h3>
        <div className="space-y-3">
          {analyticsData.serviceStats.slice(0, 5).map((service, index) => (
            <div key={service.serviceName} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{service.serviceName}</span>
                  <span className="text-sm text-gray-600">{service.count} bookings</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(service.count / analyticsData.serviceStats[0]?.count) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="text-sm text-green-600 mt-1">₹{service.revenue.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stylist Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stylist Performance</h3>
        <div className="space-y-3">
          {analyticsData.stylistStats.slice(0, 5).map((stylist, index) => (
            <div key={stylist.stylistName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{stylist.stylistName}</div>
                <div className="text-sm text-gray-600">{stylist.appointments} appointments</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">₹{stylist.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">revenue</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Time Slot Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Time Slots</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analyticsData.timeSlotStats.slice(0, 8).map((slot, index) => (
            <div key={slot.timeSlot} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">{formatTime(slot.timeSlot)}</div>
              <div className="text-sm text-gray-600">{slot.count} bookings</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
