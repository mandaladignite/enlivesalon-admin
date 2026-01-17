"use client";

import React, { useState, useEffect } from 'react';
import { enquiryAPI } from '@/lib/api';
import { Enquiry, EnquiryPaginationResponse, EnquiryFilters, EnquiryStats, EnquiryStatus, Priority, EnquiryType, ENQUIRY_STATUSES, ENQUIRY_TYPES, PRIORITY_LEVELS, RESPONSE_METHODS } from '@/types/enquiry';
import { 
  MessageSquare, 
  Eye, 
  Reply, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Tag, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Star,
  Send,
  Download,
  Upload
} from 'lucide-react';

interface EnquiryManagementProps {
  className?: string;
}

export default function EnquiryManagement({ className = "" }: EnquiryManagementProps) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [pagination, setPagination] = useState<EnquiryPaginationResponse | null>(null);
  const [stats, setStats] = useState<EnquiryStats | null>(null);
  const [filters, setFilters] = useState<EnquiryFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiries, setSelectedEnquiries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseMethod, setResponseMethod] = useState('email');
  const [editData, setEditData] = useState<Partial<Enquiry>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isLoading, setIsLoading] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await enquiryAPI.getAll(filters);
      
      if (response.success) {
        setEnquiries(response.data.docs);
        setPagination(response.data);
      } else {
        setError(response.message || 'Failed to fetch enquiries');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await enquiryAPI.getStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchStats();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<EnquiryFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setLoading(true);
        const response = await enquiryAPI.search(searchQuery, { page: 1, limit: 10 });
        if (response.success) {
          setEnquiries(response.data.docs);
          setPagination(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    } else {
      fetchEnquiries();
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSelectEnquiry = (enquiryId: string) => {
    setSelectedEnquiries(prev => 
      prev.includes(enquiryId) 
        ? prev.filter(id => id !== enquiryId)
        : [...prev, enquiryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEnquiries.length === enquiries.length) {
      setSelectedEnquiries([]);
    } else {
      setSelectedEnquiries(enquiries.map(e => e._id));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedEnquiries.length === 0) return;

    try {
      const response = await enquiryAPI.bulkUpdate(selectedEnquiries, { status });
      if (response.success) {
        setSelectedEnquiries([]);
        fetchEnquiries();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk update failed');
    }
  };

  const handleRespondToEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setResponseMessage('');
    setResponseMethod('email');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedEnquiry || !responseMessage.trim()) return;

    try {
      const response = await enquiryAPI.respond(selectedEnquiry._id, responseMessage, responseMethod);
      if (response.success) {
        setShowResponseModal(false);
        setSelectedEnquiry(null);
        setResponseMessage('');
        fetchEnquiries();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send response');
    }
  };

  const handleStatusUpdate = async (enquiryId: string, status: string) => {
    try {
      const response = await enquiryAPI.updateStatus(enquiryId, status);
      if (response.success) {
        fetchEnquiries();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  const handleViewEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowViewModal(true);
  };

  const handleEditEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setEditData({
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      subject: enquiry.subject,
      message: enquiry.message,
      enquiryType: enquiry.enquiryType,
      priority: enquiry.priority,
      status: enquiry.status,
      tags: enquiry.tags
    });
    setShowEditModal(true);
  };

  const handleUpdateEnquiry = async () => {
    if (!selectedEnquiry) return;

    try {
      setIsLoading(true);
      const response = await enquiryAPI.update(selectedEnquiry._id, editData);
      if (response.success) {
        setShowEditModal(false);
        setSelectedEnquiry(null);
        setEditData({});
        fetchEnquiries();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEnquiry = async (enquiryId: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      const response = await enquiryAPI.delete(enquiryId);
      if (response.success) {
        fetchEnquiries();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleAssignEnquiry = async (enquiry: Enquiry) => {
    const assignedTo = prompt('Enter the user ID to assign this enquiry to:');
    if (!assignedTo) return;

    try {
      const response = await enquiryAPI.assign(enquiry._id, assignedTo);
      if (response.success) {
        fetchEnquiries();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assignment failed');
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    handleFilterChange({ 
      sortBy: key as any, 
      sortOrder: direction 
    });
  };

  const handleExportEnquiries = () => {
    // Create CSV data
    const csvData = enquiries.map(enquiry => ({
      'Enquiry Number': enquiry.enquiryNumber,
      'Name': enquiry.name,
      'Email': enquiry.email,
      'Phone': enquiry.phone,
      'Subject': enquiry.subject,
      'Type': enquiry.enquiryType,
      'Priority': enquiry.priority,
      'Status': enquiry.status,
      'Created': new Date(enquiry.createdAt).toLocaleDateString(),
      'Message': enquiry.message.replace(/\n/g, ' ')
    }));

    // Convert to CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'responded': return <Reply className="h-4 w-4 text-green-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = ENQUIRY_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityConfig?.color || 'gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !stats) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.new}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.urgent}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gold/5 to-gold/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-gold/10 px-3 py-1 rounded-full mb-2">
                <MessageSquare className="h-4 w-4 text-gold" />
                <span className="text-sm font-semibold text-gold uppercase tracking-wider">
                  Enquiry Management
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Customer Enquiries</h2>
              <p className="text-gray-600 mt-1">Manage and respond to customer enquiries efficiently</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search enquiries..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-gold text-white border-gold' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 inline mr-2" />
                Filters
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'table' 
                      ? 'bg-gold text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'card' 
                      ? 'bg-gold text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cards
                </button>
              </div>
              
              {/* Export */}
              <button
                onClick={handleExportEnquiries}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        {showFilters && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value as EnquiryStatus || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {ENQUIRY_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange({ priority: e.target.value as Priority || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {PRIORITY_LEVELS.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange({ sortBy: sortBy as any, sortOrder: sortOrder as any });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="priority-desc">High Priority First</option>
                <option value="status-asc">Status A-Z</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedEnquiries.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedEnquiries.length} selected
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusUpdate(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bulk Actions</option>
                <option value="in_progress">Mark as In Progress</option>
                <option value="responded">Mark as Responded</option>
                <option value="resolved">Mark as Resolved</option>
                <option value="closed">Close</option>
              </select>
            </div>
          )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enquiries Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEnquiries.length === enquiries.length && enquiries.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('enquiryNumber')}
                >
                  <div className="flex items-center gap-1">
                    Enquiry
                    {sortConfig?.key === 'enquiryNumber' && (
                      <span className="text-gold">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center gap-1">
                    Priority
                    {sortConfig?.key === 'priority' && (
                      <span className="text-gold">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortConfig?.key === 'status' && (
                      <span className="text-gold">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortConfig?.key === 'createdAt' && (
                      <span className="text-gold">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enquiries.map((enquiry) => (
                <tr key={enquiry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEnquiries.includes(enquiry._id)}
                      onChange={() => handleSelectEnquiry(enquiry._id)}
                      className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {enquiry.subject}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{enquiry.enquiryNumber}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">
                        {enquiry.message.substring(0, 100)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-gold" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {enquiry.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enquiry.email}
                        </div>
                        {enquiry.userId && (
                          <div className="text-xs text-blue-600">
                            ID: {enquiry.userId._id}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {enquiry.enquiryType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPriorityIcon(enquiry.priority)}
                      <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        enquiry.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        enquiry.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        enquiry.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {enquiry.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(enquiry.status)}
                      <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusColor(enquiry.status) === 'green' ? 'bg-green-100 text-green-800' :
                        getStatusColor(enquiry.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        getStatusColor(enquiry.status) === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {enquiry.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(enquiry.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(enquiry.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewEnquiry(enquiry)}
                        className="text-gray-600 hover:text-gold transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEnquiry(enquiry);
                          setShowResponseModal(true);
                        }}
                        className="bg-gold text-white px-3 py-1 rounded-lg hover:bg-gold-dark transition-colors flex items-center gap-1"
                        title="Send Email Response"
                      >
                        <Send className="h-4 w-4" />
                        <span className="text-xs">Email</span>
                      </button>
                      <div className="relative group">
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <div className="py-1">
                            <button
                              onClick={() => handleEditEnquiry(enquiry)}
                              className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4 inline mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleAssignEnquiry(enquiry)}
                              className="w-full px-3 py-2 text-sm text-left text-green-600 hover:bg-green-50"
                            >
                              <User className="h-4 w-4 inline mr-2" />
                              Assign
                            </button>
                            <button
                              onClick={() => handleDeleteEnquiry(enquiry._id)}
                              className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 inline mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalDocs)} of {pagination.totalDocs} results
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Enquiry #{selectedEnquiry.enquiryNumber}
                  </h3>
                  <p className="text-gray-600">
                    Submitted on {new Date(selectedEnquiry.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-gold" />
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{selectedEnquiry.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedEnquiry.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {selectedEnquiry.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enquiry Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-gold" />
                    Enquiry Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="text-gray-900">{selectedEnquiry.enquiryType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Priority</label>
                      <div className="flex items-center">
                        {getPriorityIcon(selectedEnquiry.priority)}
                        <span className="ml-1 text-gray-900">{selectedEnquiry.priority}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center">
                        {getStatusIcon(selectedEnquiry.status)}
                        <span className="ml-1 text-gray-900">{selectedEnquiry.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject and Message */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Subject</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedEnquiry.subject}</p>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Message</h4>
                <div className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Tags */}
              {selectedEnquiry.tags && selectedEnquiry.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-gold" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEnquiry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Responses */}
              {selectedEnquiry.response && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Responses</h4>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          {selectedEnquiry.response.responseMethod} response
                        </span>
                        <span className="text-xs text-blue-600">
                          {selectedEnquiry.response.respondedAt && new Date(selectedEnquiry.response.respondedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-blue-800">{selectedEnquiry.response.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setShowResponseModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Reply className="h-4 w-4 inline mr-2" />
                  Respond
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Edit Enquiry #{selectedEnquiry.enquiryNumber}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editData.subject || ''}
                    onChange={(e) => setEditData({...editData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={editData.enquiryType || ''}
                      onChange={(e) => setEditData({...editData, enquiryType: e.target.value as EnquiryType})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                    >
                      {ENQUIRY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={editData.priority || ''}
                      onChange={(e) => setEditData({...editData, priority: e.target.value as Priority})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                    >
                      {PRIORITY_LEVELS.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editData.status || ''}
                      onChange={(e) => setEditData({...editData, status: e.target.value as EnquiryStatus})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                    >
                      {ENQUIRY_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={editData.message || ''}
                    onChange={(e) => setEditData({...editData, message: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEnquiry}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Enquiry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Response Modal */}
      {showResponseModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Send Email Response
                  </h3>
                  <p className="text-gray-600">
                    Responding to Enquiry #{selectedEnquiry.enquiryNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gold" />
                  Customer Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedEnquiry.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subject</label>
                    <p className="text-gray-900">{selectedEnquiry.subject}</p>
                  </div>
                </div>
              </div>

              {/* Response Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Method
                  </label>
                  <select
                    value={responseMethod}
                    onChange={(e) => setResponseMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  >
                    {RESPONSE_METHODS.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={`Re: ${selectedEnquiry.subject}`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Message
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                    placeholder="Enter your response message here..."
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    This message will be sent to {selectedEnquiry.email}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseMessage('');
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={!responseMessage.trim()}
                  className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Email Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
