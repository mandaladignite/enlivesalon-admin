'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  DollarSign
} from 'lucide-react';
import { appointmentAPI } from '@/lib/api';

interface CalendarAppointment {
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
  };
  stylistId?: {
    _id: string;
    name: string;
    specialties: string[];
  };
  date: string;
  timeSlot: string;
  status: string;
  totalPrice: number;
  location: string;
  notes?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

interface CalendarDay {
  date: Date;
  appointments: CalendarAppointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStylist, setFilterStylist] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, [currentDate, filterStatus, filterStylist]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const params: any = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        limit: 1000
      };

      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response = await appointmentAPI.getAllAppointments(params);
      let filteredAppointments = response.data?.appointments || [];

      if (filterStylist !== 'all') {
        filteredAppointments = filteredAppointments.filter((apt: CalendarAppointment) => 
          apt.stylistId?._id === filterStylist
        );
      }

      setAppointments(filteredAppointments);

    } catch (error: any) {
      setError(error.message || 'Failed to load appointments');
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        appointments: dayAppointments,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
        <Calendar className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Calendar</h2>
          <p className="text-gray-600">View and manage appointments by date</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.01 }}
              className={`min-h-[100px] p-2 border border-gray-200 rounded-lg ${
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${day.isToday ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${day.isToday ? 'text-indigo-600' : ''}`}>
                {day.date.getDate()}
              </div>
              
              <div className="space-y-1">
                {day.appointments.slice(0, 3).map((appointment, aptIndex) => (
                  <div
                    key={appointment._id}
                    className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition ${getStatusColor(appointment.status)}`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className="font-medium">{appointment.userId.name}</div>
                    <div>{formatTime(appointment.timeSlot)}</div>
                  </div>
                ))}
                {day.appointments.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{day.appointments.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Appointments for {selectedDate.toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          
          {(() => {
            const dayAppointments = appointments.filter(apt => {
              const aptDate = new Date(apt.date);
              return aptDate.toDateString() === selectedDate.toDateString();
            });
            
            if (dayAppointments.length === 0) {
              return (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments scheduled for this date</p>
                </div>
              );
            }
            
            return (
              <div className="space-y-4">
                {dayAppointments.map((appointment) => (
                  <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{appointment.userId.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(appointment.timeSlot)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{appointment.serviceId.name}</span>
                          </div>
                          {appointment.stylistId && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>Stylist: {appointment.stylistId.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span>₹{appointment.totalPrice}</span>
                          </div>
                          {appointment.location === 'home' && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>Home Service</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{appointment.userId.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{appointment.userId.email}</span>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
