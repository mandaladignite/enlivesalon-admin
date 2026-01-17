'use client'

import { motion } from 'framer-motion'
import { Calendar, Search, CheckCircle, Clock, XCircle, Filter, ChevronDown, MoreHorizontal, Plus, AlertCircle, Eye, Edit, Download, RefreshCw, Calendar as CalendarIcon, MapPin, User, Phone, Mail, FileText, Star, Trash2, CheckSquare, Square } from 'lucide-react'
import { useState, useEffect } from 'react'
import { appointmentAPI, serviceAPI, stylistAPI } from '@/lib/api'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

// Updated type to match backend API
type Appointment = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  serviceId: {
    _id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
  };
  stylistId?: {
    _id: string;
    name: string;
    specialties: string[];
    rating: number;
    image?: {
      public_id: string;
      secure_url: string;
      url: string;
    };
  };
  date: string;
  timeSlot: string;
  location: "home" | "salon";
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show" | "rescheduled";
  totalPrice: number;
  bookingReference: string;
  estimatedDuration: number;
  notes?: string;
  specialInstructions?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    changedBy: string;
    reason: string;
  }>;
  rescheduledFrom?: {
    date: string;
    timeSlot: string;
    rescheduledAt: string;
    rescheduledBy: string;
  };
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
};

export default function BookingsPage() {
  const { isAuthenticated } = useAdminAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Enhanced filtering states
  const [locationFilter, setLocationFilter] = useState('all');
  const [stylistFilter, setStylistFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  
  // Bulk actions states
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  
  // Data for filters
  const [services, setServices] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
      loadFilterData();
    }
  }, [isAuthenticated, statusFilter, locationFilter, stylistFilter, serviceFilter, dateRangeFilter, currentPage, itemsPerPage]);

  const loadFilterData = async () => {
    try {
      const [servicesResponse, stylistsResponse] = await Promise.all([
        serviceAPI.getAll({ limit: 100 }),
        stylistAPI.getAll({ limit: 100 })
      ]);
      
      setServices(servicesResponse.data?.services || []);
      setStylists(stylistsResponse.data?.stylists || []);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'date',
        sortOrder: 'desc'
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (locationFilter !== 'all') params.location = locationFilter;
      if (stylistFilter !== 'all') params.stylistId = stylistFilter;
      if (serviceFilter !== 'all') params.serviceId = serviceFilter;
      if (dateRangeFilter.start) params.startDate = dateRangeFilter.start;
      if (dateRangeFilter.end) params.endDate = dateRangeFilter.end;
      
      const response = await appointmentAPI.getAllAppointments(params);
      setAppointments(response.data?.appointments || []);
      setTotalAppointments(response.data?.pagination?.totalAppointments || 0);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      
      // Calculate statistics
      const appointments = response.data?.appointments || [];
      const newStats = {
        total: appointments.length,
        pending: appointments.filter((apt: Appointment) => apt.status === 'pending').length,
        confirmed: appointments.filter((apt: Appointment) => apt.status === 'confirmed').length,
        completed: appointments.filter((apt: Appointment) => apt.status === 'completed').length,
        cancelled: appointments.filter((apt: Appointment) => apt.status === 'cancelled').length,
        revenue: appointments
          .filter((apt: Appointment) => apt.status === 'completed')
          .reduce((sum: number, apt: Appointment) => sum + apt.totalPrice, 0)
      };
      setStats(newStats);
      
    } catch (error: any) {
      setError(error.message || 'Failed to load appointments');
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string, reason?: string) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, newStatus, reason);
      setAppointments(prev =>
        prev.map(apt =>
          apt._id === appointmentId ? { ...apt, status: newStatus as any } : apt
        )
      );
    } catch (error: any) {
      setError(error.message || 'Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentAPI.cancel(appointmentId, 'Cancelled by admin');
      setAppointments(prev =>
        prev.map(apt =>
          apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        )
      );
    } catch (error: any) {
      setError(error.message || 'Failed to cancel appointment');
    }
  };

  // Enhanced functions
  const handleBulkStatusUpdate = async (newStatus: string, reason?: string) => {
    if (selectedAppointments.length === 0) return;
    
    try {
      const promises = selectedAppointments.map(id => 
        appointmentAPI.updateStatus(id, newStatus, reason)
      );
      await Promise.all(promises);
      
      setAppointments(prev =>
        prev.map(apt =>
          selectedAppointments.includes(apt._id) 
            ? { ...apt, status: newStatus as any } 
            : apt
        )
      );
      setSelectedAppointments([]);
      setShowBulkActions(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update appointments');
    }
  };

  const handleBulkCancel = async () => {
    if (selectedAppointments.length === 0) return;
    if (!confirm(`Are you sure you want to cancel ${selectedAppointments.length} appointments?`)) return;
    
    try {
      const promises = selectedAppointments.map(id => 
        appointmentAPI.cancel(id, 'Bulk cancelled by admin')
      );
      await Promise.all(promises);
      
      setAppointments(prev =>
        prev.map(apt =>
          selectedAppointments.includes(apt._id) 
            ? { ...apt, status: 'cancelled' } 
            : apt
        )
      );
      setSelectedAppointments([]);
      setShowBulkActions(false);
    } catch (error: any) {
      setError(error.message || 'Failed to cancel appointments');
    }
  };

  const handleSelectAppointment = (appointmentId: string) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId) 
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAppointments.length === appointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(appointments.map(apt => apt._id));
    }
  };

  const handleViewDetails = async (appointmentId: string) => {
    try {
      const response = await appointmentAPI.getById(appointmentId);
      setSelectedAppointment(response.data);
      setShowDetailsModal(true);
    } catch (error: any) {
      setError(error.message || 'Failed to load appointment details');
    }
  };

  const handleExportCSV = () => {
    const csvData = appointments.map(apt => ({
      'Booking Reference': apt.bookingReference,
      'Customer Name': apt.userId.name,
      'Customer Email': apt.userId.email,
      'Customer Phone': apt.userId.phone,
      'Service': apt.serviceId.name,
      'Stylist': apt.stylistId?.name || 'TBD',
      'Date': formatDate(apt.date),
      'Time': formatTime(apt.timeSlot),
      'Location': apt.location,
      'Status': apt.status,
      'Total Price': apt.status === 'completed' ? apt.totalPrice : 0,
      'Revenue (Completed Only)': apt.status === 'completed' ? apt.totalPrice : 0,
      'Created At': new Date(apt.createdAt).toLocaleString()
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setLocationFilter('all');
    setStylistFilter('all');
    setServiceFilter('all');
    setDateRangeFilter({ start: '', end: '' });
    setSearchTerm('');
  };

  const refreshData = () => {
    loadAppointments();
  };

  const statusStyles = {
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    no_show: 'bg-gray-100 text-gray-800 border-gray-200',
    rescheduled: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const statusIcons = {
    confirmed: <CheckCircle size={14} />,
    pending: <Clock size={14} />,
    in_progress: <Clock size={14} />,
    completed: <CheckCircle size={14} />,
    cancelled: <XCircle size={14} />,
    no_show: <XCircle size={14} />,
    rescheduled: <Calendar size={14} />,
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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      appointment.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.userId.phone.includes(searchTerm) ||
      appointment.serviceId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.bookingReference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in as an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" /> Bookings Management
          </h1>
          <p className="text-gray-600 mt-1">Manage and track all salon appointments</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={refreshData}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={() => setShowNewBookingModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
          <Plus size={18} />
          New Booking
        </button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue (Completed)</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.revenue}</p>
            </div>
            <Star className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col gap-4">
          {/* Search and Basic Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
                placeholder="Search by customer name, email, phone, service, or booking reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>

          {/* Status filter */}
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>

            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Filter size={16} />
              {showAdvancedFilters ? 'Hide' : 'More'} Filters
            </button>

            <button 
              onClick={clearFilters}
              className="bg-gray-100 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              Clear All
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Location Filter */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select 
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
                >
                  <option value="all">All Locations</option>
                  <option value="salon">Salon</option>
                  <option value="home">Home</option>
                </select>
              </div>

              {/* Stylist Filter */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stylist</label>
                <select 
                  value={stylistFilter}
                  onChange={(e) => setStylistFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
                >
                  <option value="all">All Stylists</option>
                  {stylists.map(stylist => (
                    <option key={stylist._id} value={stylist._id}>{stylist.name}</option>
                  ))}
                </select>
              </div>

              {/* Service Filter */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select 
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
                >
                  <option value="all">All Services</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>{service.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 min-w-0">
                    <input
                      type="date"
                      value={dateRangeFilter.start}
                      onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
                      placeholder="Start Date"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="date"
                      value={dateRangeFilter.end}
                      onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
                      placeholder="End Date"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Bookings Table */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
          <span className="text-sm text-gray-600">{filteredAppointments.length} bookings</span>
            {selectedAppointments.length > 0 && (
              <span className="text-sm text-indigo-600 font-medium">
                {selectedAppointments.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Items per page selector */}
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-gray-50 border border-gray-300 text-gray-900 py-1 px-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            {/* Bulk Actions */}
            {selectedAppointments.length > 0 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm transition flex items-center gap-1"
                >
                  <CheckSquare size={14} />
                  Bulk Actions
                </button>
                <button 
                  onClick={() => setSelectedAppointments([])}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedAppointments.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-indigo-900">
                  {selectedAppointments.length} appointments selected
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBulkStatusUpdate('confirmed')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Confirm All
                  </button>
                  <button 
                    onClick={() => handleBulkStatusUpdate('completed')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Mark Complete
                  </button>
                  <button 
                    onClick={handleBulkCancel}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Cancel All
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowBulkActions(false)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No appointments found</h3>
            <p className="text-gray-500">No appointments match your current filters.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    {selectedAppointments.length === appointments.length ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                    Select All
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment, idx) => (
                <motion.tr
                  key={appointment._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`hover:bg-gray-50 transition ${selectedAppointments.includes(appointment._id) ? 'bg-indigo-50' : ''}`}
                >
                  <td className="px-4 py-4">
                    <button 
                      onClick={() => handleSelectAppointment(appointment._id)}
                      className="flex items-center gap-2 hover:text-gray-700"
                    >
                      {selectedAppointments.includes(appointment._id) ? (
                        <CheckSquare size={16} className="text-indigo-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{appointment.userId.name}</div>
                    <div className="text-sm text-gray-600">{appointment.serviceId.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Ref: {appointment.bookingReference} • {appointment.serviceId.duration} min
                    </div>
                    {appointment.location === 'home' && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <MapPin size={12} />
                        Home Service
                      </div>
                    )}
                    {appointment.specialInstructions && (
                      <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                        <FileText size={12} />
                        Special Instructions
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-900">{formatDate(appointment.date)}</div>
                    <div className="text-sm text-gray-600">{formatTime(appointment.timeSlot)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {appointment.stylistId?.image?.secure_url && (
                        <img 
                          src={appointment.stylistId.image.secure_url} 
                          alt={appointment.stylistId.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="text-gray-900">
                          {appointment.stylistId ? appointment.stylistId.name : 'TBD'}
                        </div>
                        {appointment.stylistId && (
                          <div className="text-xs text-gray-500">
                            {appointment.stylistId.specialties.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">
                    ₹{appointment.totalPrice}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit border ${statusStyles[appointment.status]}`}
                    >
                      {statusIcons[appointment.status]}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleViewDetails(appointment._id)}
                        className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {appointment.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                          className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition"
                          title="Confirm"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button 
                          onClick={() => handleStatusUpdate(appointment._id, 'in_progress')}
                          className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="Start"
                        >
                          <Clock size={16} />
                        </button>
                      )}
                      {appointment.status === 'in_progress' && (
                        <button 
                          onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                          className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition"
                          title="Complete"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button 
                          onClick={() => {
                            const reason = prompt('Reason for no-show:');
                            if (reason) {
                              handleStatusUpdate(appointment._id, 'no_show', reason);
                            }
                          }}
                          className="p-1.5 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                          title="Mark as No Show"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      {(appointment.status === 'pending' || appointment.status === 'confirmed' || appointment.status === 'in_progress') && (
                        <button 
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Cancel"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Enhanced Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-200 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalAppointments)}</span> of{' '}
            <span className="font-medium">{totalAppointments}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-md text-sm transition ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
            </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User size={20} />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedAppointment.userId.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Mail size={14} />
                      {selectedAppointment.userId.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Phone size={14} />
                      {selectedAppointment.userId.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Service Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service</label>
                    <p className="text-gray-900">{selectedAppointment.serviceId.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="text-gray-900">{selectedAppointment.serviceId.duration} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Price</label>
                    <p className="text-gray-900">₹{selectedAppointment.totalPrice}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-gray-900">{selectedAppointment.serviceId.category}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarIcon size={20} />
                  Appointment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date</label>
                    <p className="text-gray-900">{formatDate(selectedAppointment.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Time</label>
                    <p className="text-gray-900">{formatTime(selectedAppointment.timeSlot)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-gray-900 flex items-center gap-1">
                      <MapPin size={14} />
                      {selectedAppointment.location === 'home' ? 'Home Service' : 'Salon'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Stylist</label>
                    <p className="text-gray-900">
                      {selectedAppointment.stylistId ? selectedAppointment.stylistId.name : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedAppointment.notes || selectedAppointment.specialInstructions || selectedAppointment.address) && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h4>
                  {selectedAppointment.notes && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-600">Notes</label>
                      <p className="text-gray-900">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  {selectedAppointment.specialInstructions && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-600">Special Instructions</label>
                      <p className="text-gray-900">{selectedAppointment.specialInstructions}</p>
                    </div>
                  )}
                  {selectedAppointment.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">
                        {selectedAppointment.address.street}, {selectedAppointment.address.city}, {selectedAppointment.address.state} {selectedAppointment.address.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Status History */}
              {selectedAppointment.statusHistory && selectedAppointment.statusHistory.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Status History</h4>
                  <div className="space-y-2">
                    {selectedAppointment.statusHistory.map((history, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{history.status}</p>
                          <p className="text-xs text-gray-600">{history.reason}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(history.changedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  // Add edit functionality here
                }}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition"
              >
                Edit Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Create New Booking</h3>
                <button 
                  onClick={() => setShowNewBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                This feature will allow you to create new bookings directly from the admin panel.
                Implementation would include customer selection, service selection, date/time picker, and stylist assignment.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> This is a placeholder for the new booking creation feature. 
                  The full implementation would require additional components and API integration.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowNewBookingModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}