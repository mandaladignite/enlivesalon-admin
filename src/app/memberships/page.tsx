"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Users, 
  Crown, 
  Calendar,
  CreditCard,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Star
} from "lucide-react";
import { useAdminMemberships, useAdminMembershipStats, useAdminMembershipActions, AdminMembership, MembershipFilters } from "@/hooks/useAdminMembership";
import { useAdminPackages, useAdminPackageStats, useAdminPackageActions, AdminPackage, PackageFilters } from "@/hooks/useAdminPlans";

// Filter options
const membershipPlans = [
  { id: "all", name: "All Plans" },
  { id: "premium", name: "Premium" },
  { id: "standard", name: "Standard" }
];

const statusOptions = [
  { id: "all", name: "All Status" },
  { id: "active", name: "Active" },
  { id: "expired", name: "Expired" },
  { id: "expiring_soon", name: "Expiring Soon" }
];

const paymentStatusOptions = [
  { id: "all", name: "All Payments" },
  { id: "pending", name: "Pending" },
  { id: "paid", name: "Paid" },
  { id: "failed", name: "Failed" },
  { id: "refunded", name: "Refunded" }
];

export default function AdminMembershipsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'memberships' | 'plans'>('memberships');
  
  // State for membership filters
  const [filters, setFilters] = useState<MembershipFilters>({
    page: 1,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  
  // State for package filters
  const [packageFilters, setPackageFilters] = useState<PackageFilters>({
    page: 1,
    limit: 10
  });
  const [packageSearchTerm, setPackageSearchTerm] = useState("");
  const [selectedPackageStatus, setSelectedPackageStatus] = useState("all");
  const [selectedPopularStatus, setSelectedPopularStatus] = useState("all");
  
  // Modal states
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isViewMemberModalOpen, setIsViewMemberModalOpen] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isViewPlanModalOpen, setIsViewPlanModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AdminMembership | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<AdminPackage | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // New package form data
  const [newPackageData, setNewPackageData] = useState<Partial<AdminPackage>>({
    name: '',
    description: '',
    price: 0,
    duration: 1,
    durationUnit: 'months',
    benefits: [''],
    discountPercentage: 0,
    maxAppointments: null,
    isActive: true,
    isPopular: false,
    sortOrder: 0,
    termsAndConditions: ''
  });

  // Edit package form data
  const [editPackageData, setEditPackageData] = useState<Partial<AdminPackage>>({
    name: '',
    description: '',
    price: 0,
    duration: 1,
    durationUnit: 'months',
    benefits: [''],
    discountPercentage: 0,
    maxAppointments: null,
    isActive: true,
    isPopular: false,
    sortOrder: 0,
    termsAndConditions: ''
  });

  // Hooks for data fetching
  const { memberships, loading, error, pagination, refetch } = useAdminMemberships(filters);
  const { stats, loading: statsLoading, error: statsError } = useAdminMembershipStats();
  const { updateMembership, cancelMembership, loading: actionHookLoading } = useAdminMembershipActions();
  
  // Package hooks
  const { packages, loading: packagesLoading, error: packagesError, pagination: packagePagination, refetch: refetchPackages } = useAdminPackages(packageFilters);
  const { stats: packageStats, loading: packageStatsLoading, error: packageStatsError } = useAdminPackageStats();
  const { createPackage, updatePackage, deletePackage, deactivatePackage, reactivatePackage, togglePopularStatus, loading: packageActionLoading } = useAdminPackageActions();

  // Update membership filters when dropdowns change
  useEffect(() => {
    const newFilters: MembershipFilters = {
      page: 1,
      limit: 10
    };

    if (selectedStatus !== "all") {
      newFilters.status = selectedStatus as 'active' | 'expired' | 'expiring_soon';
    }
    if (selectedPaymentStatus !== "all") {
      newFilters.paymentStatus = selectedPaymentStatus as 'pending' | 'paid' | 'failed' | 'refunded';
    }
    if (searchTerm.trim()) {
      newFilters.search = searchTerm.trim();
    }

    setFilters(newFilters);
  }, [selectedStatus, selectedPaymentStatus, searchTerm]);

  // Update package filters when dropdowns change
  useEffect(() => {
    const newFilters: PackageFilters = {
      page: 1,
      limit: 10
    };

    if (selectedPackageStatus !== "all") {
      newFilters.isActive = selectedPackageStatus === "active";
    }
    if (selectedPopularStatus !== "all") {
      newFilters.isPopular = selectedPopularStatus === "popular";
    }
    if (packageSearchTerm.trim()) {
      newFilters.search = packageSearchTerm.trim();
    }

    setPackageFilters(newFilters);
  }, [selectedPackageStatus, selectedPopularStatus, packageSearchTerm]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        // Search will be handled by the filters effect
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle member actions
  const handleViewMember = (member: AdminMembership) => {
    setSelectedMember(member);
    setIsViewMemberModalOpen(true);
  };

  const handleEditMember = (member: AdminMembership) => {
    setSelectedMember(member);
    setIsEditMemberModalOpen(true);
  };

  const handleCancelMembership = async (member: AdminMembership) => {
    if (!confirm(`Are you sure you want to cancel ${member.userId.name}'s membership?`)) return;

    try {
      setActionLoading(member._id);
      await cancelMembership(member._id, "Cancelled by admin");
      refetch();
      alert('Membership cancelled successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel membership');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateMembership = async (memberId: string, updateData: Partial<AdminMembership>) => {
    try {
      setActionLoading(memberId);
      await updateMembership(memberId, updateData);
      refetch();
      alert('Membership updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update membership');
    } finally {
      setActionLoading(null);
    }
  };

  // Package handlers
  const handleViewPackage = (pkg: AdminPackage) => {
    setSelectedPackage(pkg);
    setIsViewPlanModalOpen(true);
  };

  const handleEditPackage = (pkg: AdminPackage) => {
    setSelectedPackage(pkg);
    setEditPackageData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      durationUnit: pkg.durationUnit,
      benefits: pkg.benefits && pkg.benefits.length > 0 ? pkg.benefits : [''],
      discountPercentage: pkg.discountPercentage,
      maxAppointments: pkg.maxAppointments,
      isActive: pkg.isActive,
      isPopular: pkg.isPopular,
      sortOrder: pkg.sortOrder,
      termsAndConditions: pkg.termsAndConditions || ''
    });
    setIsEditPlanModalOpen(true);
  };

  const handleDeletePackage = async (pkg: AdminPackage) => {
    if (!confirm(`Are you sure you want to delete the package "${pkg.name}"?`)) return;

    try {
      setActionLoading(pkg._id);
      await deletePackage(pkg._id);
      refetchPackages();
      alert('Package deleted successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete package');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePackageStatus = async (pkg: AdminPackage) => {
    try {
      setActionLoading(pkg._id);
      if (pkg.isActive) {
        await deactivatePackage(pkg._id);
        alert('Package deactivated successfully');
      } else {
        await reactivatePackage(pkg._id);
        alert('Package reactivated successfully');
      }
      refetchPackages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update package status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePopularStatus = async (pkg: AdminPackage) => {
    try {
      setActionLoading(pkg._id);
      await togglePopularStatus(pkg._id);
      refetchPackages();
      alert(`Package ${pkg.isPopular ? 'removed from' : 'marked as'} popular`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update popular status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePackage = async (packageData: Partial<AdminPackage>) => {
    try {
      // Filter out empty benefits
      const filteredData = {
        ...packageData,
        benefits: packageData.benefits?.filter(benefit => benefit.trim() !== '') || []
      };
      
      await createPackage(filteredData);
      refetchPackages();
      setIsAddPlanModalOpen(false);
      
      // Reset form data
      setNewPackageData({
        name: '',
        description: '',
        price: 0,
        duration: 1,
        durationUnit: 'months',
        benefits: [''],
        discountPercentage: 0,
        maxAppointments: null,
        isActive: true,
        isPopular: false,
        sortOrder: 0,
        termsAndConditions: ''
      });
      
      alert('Package created successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create package');
    }
  };

  const handleUpdatePackage = async (packageId: string, updateData: Partial<AdminPackage>) => {
    try {
      // Filter out empty benefits
      const filteredData = {
        ...updateData,
        benefits: updateData.benefits?.filter(benefit => benefit.trim() !== '') || []
      };
      
      await updatePackage(packageId, filteredData);
      refetchPackages();
      setIsEditPlanModalOpen(false);
      
      // Reset form data
      setEditPackageData({
        name: '',
        description: '',
        price: 0,
        duration: 1,
        durationUnit: 'months',
        benefits: [''],
        discountPercentage: 0,
        maxAppointments: null,
        isActive: true,
        isPopular: false,
        sortOrder: 0,
        termsAndConditions: ''
      });
      
      alert('Package updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update package');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Calculate days remaining for active memberships
  const daysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Get status badge class
  const getStatusBadgeClass = (membership: AdminMembership) => {
    const now = new Date();
    const isExpired = new Date(membership.expiryDate) < now;
    const isActive = membership.isActive && membership.paymentStatus === 'paid' && !isExpired;

    if (membership.paymentStatus === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (membership.paymentStatus === 'failed') {
      return 'bg-red-100 text-red-800';
    }
    if (isActive) {
      return 'bg-green-100 text-green-800';
    }
    if (isExpired) {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-red-100 text-red-800';
  };

  // Get payment status badge class
  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (membership: AdminMembership) => {
    const now = new Date();
    const isExpired = new Date(membership.expiryDate) < now;
    const isActive = membership.isActive && membership.paymentStatus === 'paid' && !isExpired;

    if (membership.paymentStatus === 'pending') return 'Pending Payment';
    if (membership.paymentStatus === 'failed') return 'Payment Failed';
    if (isActive) return 'Active';
    if (isExpired) return 'Expired';
    return 'Cancelled';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Membership Management</h1>
              <p className="text-gray-600">Manage your membership plans, members, and renewals</p>
            </div>
            <button
              onClick={() => activeTab === 'memberships' ? refetch() : refetchPackages()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('memberships')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'memberships'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Memberships
                </div>
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'plans'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Plans Management
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'memberships' ? (
          <>
            {/* Stats Cards */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-gray-200 w-12 h-12"></div>
                      <div className="ml-4">
                        <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">{stats.overview?.totalMemberships || 0}</h2>
                      <p className="text-gray-600">Total Memberships</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">{stats.overview?.activeMemberships || 0}</h2>
                      <p className="text-gray-600">Active Memberships</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Crown className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">{stats.overview?.expiringSoon || 0}</h2>
                      <p className="text-gray-600">Expiring Soon</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">₹{stats.overview?.totalRevenue?.toLocaleString() || '0'}</h2>
                      <p className="text-gray-600">Total Revenue</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : null}

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search members..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusOptions.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>

                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                >
                  {paymentStatusOptions.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-5 h-5" />
                Export
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                <Plus className="w-5 h-5" />
                Add Member
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
              <span className="ml-2 text-gray-600">Loading memberships...</span>
            </div>
          ) : memberships.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No memberships found</h3>
              <p className="text-gray-500">Try adjusting your filters or add a new membership.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointments
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memberships.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.userId.name}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <Mail className="w-3 h-3 mr-1" />
                              {member.userId.email}
                            </div>
                            {member.userId.phone && (
                              <div className="text-xs text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {member.userId.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.packageName}</div>
                        <div className="text-xs text-gray-500">{member.packageId.duration} {member.packageId.durationUnit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(member.startDate)} - {formatDate(member.expiryDate)}
                        </div>
                        {getStatusText(member) === 'Active' && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {daysRemaining(member.expiryDate)} days remaining
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>₹{member.amountPaid}</div>
                        {member.discountApplied > 0 && (
                          <div className="text-xs text-green-600">
                            Saved ₹{member.discountApplied}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(member)}`}>
                          {getStatusText(member)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(member.paymentStatus)}`}>
                          {member.paymentStatus.charAt(0).toUpperCase() + member.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.usedAppointments || 0} / {member.remainingAppointments + (member.usedAppointments || 0)} used
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-yellow-600 h-1.5 rounded-full" 
                            style={{ 
                              width: `${((member.usedAppointments || 0) / (member.remainingAppointments + (member.usedAppointments || 0))) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleViewMember(member)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleEditMember(member)}
                            title="Edit Membership"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {member.isActive && (
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleCancelMembership(member)}
                              disabled={actionLoading === member._id}
                              title="Cancel Membership"
                            >
                              {actionLoading === member._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{((pagination.currentPage - 1) * 10) + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(pagination.currentPage * 10, pagination.totalMemberships)}
              </span>{" "}
              of <span className="font-medium">{pagination.totalMemberships}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      pagination.currentPage === page
                        ? "bg-yellow-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
          </>
        ) : (
          <>
            {/* Plans Management Content */}
            {/* Package Stats Cards */}
            {packageStatsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-gray-200 w-12 h-12"></div>
                      <div className="ml-4">
                        <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : packageStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Crown className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">{packageStats.totalPackages || 0}</h2>
                      <p className="text-gray-600">Total Packages</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">{packageStats.activePackages || 0}</h2>
                      <p className="text-gray-600">Active Packages</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">{packageStats.popularPackages || 0}</h2>
                      <p className="text-gray-600">Popular Packages</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">₹{packageStats.averagePrice?.toLocaleString() || '0'}</h2>
                      <p className="text-gray-600">Average Price</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : null}

            {/* Package Action Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search packages..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={packageSearchTerm}
                      onChange={(e) => setPackageSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={selectedPackageStatus}
                      onChange={(e) => setSelectedPackageStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={selectedPopularStatus}
                      onChange={(e) => setSelectedPopularStatus(e.target.value)}
                    >
                      <option value="all">All Popularity</option>
                      <option value="popular">Popular</option>
                      <option value="regular">Regular</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download className="w-5 h-5" />
                    Export
                  </button>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    onClick={() => {
                      // Reset form data when opening modal
                      setNewPackageData({
                        name: '',
                        description: '',
                        price: 0,
                        duration: 1,
                        durationUnit: 'months',
                        benefits: [''],
                        discountPercentage: 0,
                        maxAppointments: null,
                        isActive: true,
                        isPopular: false,
                        sortOrder: 0,
                        termsAndConditions: ''
                      });
                      setIsAddPlanModalOpen(true);
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    Add Package
                  </button>
                </div>
              </div>
            </div>

            {/* Package Error State */}
            {packagesError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-red-800">{packagesError}</span>
                </div>
              </div>
            )}

            {/* Packages Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              {packagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="ml-2 text-gray-600">Loading packages...</span>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12">
                  <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                  <p className="text-gray-500">Try adjusting your filters or add a new package.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Package
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Appointments
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Popular
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {packages.map((pkg) => (
                        <tr key={pkg._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Crown className="w-5 h-5 text-yellow-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                                <div className="text-xs text-gray-500 max-w-xs truncate">{pkg.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{pkg.discountedPrice}</div>
                            {pkg.discountPercentage > 0 && (
                              <div className="text-xs text-gray-500">
                                <span className="line-through">₹{pkg.price}</span>
                                <span className="ml-1 text-green-600">({pkg.discountPercentage}% off)</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pkg.formattedDuration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pkg.maxAppointments || 'Unlimited'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {pkg.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pkg.isPopular ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {pkg.isPopular ? 'Popular' : 'Regular'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => handleViewPackage(pkg)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                className="text-green-600 hover:text-green-900"
                                onClick={() => handleEditPackage(pkg)}
                                title="Edit Package"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                className="text-yellow-600 hover:text-yellow-900"
                                onClick={() => handleTogglePopularStatus(pkg)}
                                disabled={actionLoading === pkg._id}
                                title={pkg.isPopular ? "Remove from Popular" : "Mark as Popular"}
                              >
                                {actionLoading === pkg._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Star className="w-4 h-4" />
                                )}
                              </button>
                              <button 
                                className={`${pkg.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                onClick={() => handleTogglePackageStatus(pkg)}
                                disabled={actionLoading === pkg._id}
                                title={pkg.isActive ? "Deactivate" : "Activate"}
                              >
                                {actionLoading === pkg._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : pkg.isActive ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeletePackage(pkg)}
                                disabled={actionLoading === pkg._id}
                                title="Delete Package"
                              >
                                {actionLoading === pkg._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Package Pagination */}
            {packagePagination.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((packagePagination.currentPage - 1) * 10) + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(packagePagination.currentPage * 10, packagePagination.totalPackages)}
                  </span>{" "}
                  of <span className="font-medium">{packagePagination.totalPackages}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPackageFilters(prev => ({ ...prev, page: packagePagination.currentPage - 1 }))}
                    disabled={!packagePagination.hasPrev}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, packagePagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setPackageFilters(prev => ({ ...prev, page }))}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          packagePagination.currentPage === page
                            ? "bg-yellow-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPackageFilters(prev => ({ ...prev, page: packagePagination.currentPage + 1 }))}
                    disabled={!packagePagination.hasNext}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* View Member Modal */}
        {isViewMemberModalOpen && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Membership Details</h2>
                <button
                  onClick={() => setIsViewMemberModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Member Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{selectedMember.userId.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedMember.userId.email}</p>
                    </div>
                    {selectedMember.userId.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-gray-900">{selectedMember.userId.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Membership Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Package</label>
                      <p className="text-gray-900">{selectedMember.packageName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Duration</label>
                      <p className="text-gray-900">{selectedMember.packageId.duration} {selectedMember.packageId.durationUnit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Amount Paid</label>
                      <p className="text-gray-900">₹{selectedMember.amountPaid}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Method</label>
                      <p className="text-gray-900 capitalize">{selectedMember.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Period & Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <p className="text-gray-900">{formatDate(selectedMember.startDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                      <p className="text-gray-900">{formatDate(selectedMember.expiryDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedMember)}`}>
                        {getStatusText(selectedMember)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Appointments & Benefits</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Appointments Used</label>
                      <p className="text-gray-900">{selectedMember.usedAppointments || 0} / {selectedMember.remainingAppointments + (selectedMember.usedAppointments || 0)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Remaining Appointments</label>
                      <p className="text-gray-900">{selectedMember.remainingAppointments}</p>
                    </div>
                    {selectedMember.benefits && selectedMember.benefits.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Benefits</label>
                        <ul className="text-sm text-gray-900 list-disc list-inside">
                          {selectedMember.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedMember.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedMember.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsViewMemberModalOpen(false)}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  onClick={() => {
                    setIsViewMemberModalOpen(false);
                    handleEditMember(selectedMember);
                  }}
                >
                  Edit Membership
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal (Placeholder) */}
        {isAddMemberModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Member</h2>
              <p className="text-gray-600 mb-4">This feature will be implemented soon.</p>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsAddMemberModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  onClick={() => setIsAddMemberModalOpen(false)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Modal (Placeholder) */}
        {isEditMemberModalOpen && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Membership</h2>
              <p className="text-gray-600 mb-4">This feature will be implemented soon.</p>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsEditMemberModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  onClick={() => setIsEditMemberModalOpen(false)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Package Modal */}
        {isViewPlanModalOpen && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Package Details</h2>
                <button
                  onClick={() => setIsViewPlanModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Package Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{selectedPackage.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-900">{selectedPackage.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Duration</label>
                      <p className="text-gray-900">{selectedPackage.formattedDuration}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Max Appointments</label>
                      <p className="text-gray-900">{selectedPackage.maxAppointments || 'Unlimited'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Pricing & Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Original Price</label>
                      <p className="text-gray-900">₹{selectedPackage.price}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Discounted Price</label>
                      <p className="text-gray-900">₹{selectedPackage.discountedPrice}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Discount</label>
                      <p className="text-gray-900">{selectedPackage.discountPercentage}% (Save ₹{selectedPackage.savingsAmount})</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedPackage.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPackage.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Popular</label>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedPackage.isPopular ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPackage.isPopular ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPackage.benefits && selectedPackage.benefits.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Benefits</h3>
                    <ul className="text-sm text-gray-900 list-disc list-inside space-y-1">
                      {selectedPackage.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPackage.termsAndConditions && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPackage.termsAndConditions}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsViewPlanModalOpen(false)}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  onClick={() => {
                    setIsViewPlanModalOpen(false);
                    handleEditPackage(selectedPackage);
                  }}
                >
                  Edit Package
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Package Modal */}
        {isAddPlanModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add New Package</h2>
                <button
                  onClick={() => setIsAddPlanModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreatePackage(newPackageData);
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Package Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPackageData.name}
                      onChange={(e) => setNewPackageData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., Premium Hair Care Package"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min="1"
                        value={newPackageData.duration}
                        onChange={(e) => setNewPackageData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="3"
                      />
                      <select
                        value={newPackageData.durationUnit}
                        onChange={(e) => setNewPackageData(prev => ({ ...prev, durationUnit: e.target.value as 'days' | 'weeks' | 'months' | 'years' }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={newPackageData.price}
                      onChange={(e) => setNewPackageData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="2000"
                    />
                  </div>

                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newPackageData.discountPercentage}
                      onChange={(e) => setNewPackageData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="20"
                    />
                  </div>

                  {/* Max Appointments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Appointments
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newPackageData.maxAppointments || ''}
                      onChange={(e) => setNewPackageData(prev => ({ ...prev, maxAppointments: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="10 (leave empty for unlimited)"
                    />
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newPackageData.sortOrder}
                      onChange={(e) => setNewPackageData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newPackageData.description}
                    onChange={(e) => setNewPackageData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Describe the package benefits and features..."
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <div className="space-y-2">
                    {newPackageData.benefits?.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => {
                            const newBenefits = [...(newPackageData.benefits || [])];
                            newBenefits[index] = e.target.value;
                            setNewPackageData(prev => ({ ...prev, benefits: newBenefits }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder={`Benefit ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newBenefits = (newPackageData.benefits || []).filter((_, i) => i !== index);
                            setNewPackageData(prev => ({ ...prev, benefits: newBenefits }));
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNewPackageData(prev => ({ ...prev, benefits: [...(prev.benefits || []), ''] }))}
                      className="flex items-center gap-2 px-3 py-2 text-yellow-600 hover:text-yellow-800"
                    >
                      <Plus className="w-4 h-4" />
                      Add Benefit
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms and Conditions
                  </label>
                  <textarea
                    rows={3}
                    value={newPackageData.termsAndConditions || ''}
                    onChange={(e) => setNewPackageData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter terms and conditions for this package..."
                  />
                </div>

                {/* Status Options */}
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPackageData.isActive}
                      onChange={(e) => setNewPackageData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Package</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPackageData.isPopular}
                      onChange={(e) => setNewPackageData(prev => ({ ...prev, isPopular: e.target.checked }))}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Popular Package</span>
                  </label>
                </div>

                {/* Price Preview */}
                {(newPackageData.price || 0) > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Price Preview</h3>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Original Price:</span>
                        <span className="ml-2 text-lg font-semibold">₹{newPackageData.price || 0}</span>
                      </div>
                      {(newPackageData.discountPercentage || 0) > 0 && (
                        <>
                          <div>
                            <span className="text-sm text-gray-600">Discount:</span>
                            <span className="ml-2 text-lg font-semibold text-green-600">{newPackageData.discountPercentage || 0}%</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Discounted Price:</span>
                            <span className="ml-2 text-lg font-bold text-yellow-600">₹{Math.round((newPackageData.price || 0) * (1 - (newPackageData.discountPercentage || 0) / 100))}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">You Save:</span>
                            <span className="ml-2 text-lg font-semibold text-green-600">₹{Math.round((newPackageData.price || 0) * ((newPackageData.discountPercentage || 0) / 100))}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddPlanModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={packageActionLoading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {packageActionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Create Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Package Modal */}
        {isEditPlanModalOpen && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Package</h2>
                <button
                  onClick={() => setIsEditPlanModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdatePackage(selectedPackage._id, editPackageData);
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Package Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editPackageData.name}
                      onChange={(e) => setEditPackageData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., Premium Hair Care Package"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min="1"
                        value={editPackageData.duration}
                        onChange={(e) => setEditPackageData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="3"
                      />
                      <select
                        value={editPackageData.durationUnit}
                        onChange={(e) => setEditPackageData(prev => ({ ...prev, durationUnit: e.target.value as 'days' | 'weeks' | 'months' | 'years' }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editPackageData.price}
                      onChange={(e) => setEditPackageData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="2000"
                    />
                  </div>

                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editPackageData.discountPercentage}
                      onChange={(e) => setEditPackageData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="20"
                    />
                  </div>

                  {/* Max Appointments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Appointments
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editPackageData.maxAppointments || ''}
                      onChange={(e) => setEditPackageData(prev => ({ ...prev, maxAppointments: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="10 (leave empty for unlimited)"
                    />
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editPackageData.sortOrder}
                      onChange={(e) => setEditPackageData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editPackageData.description}
                    onChange={(e) => setEditPackageData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Describe the package benefits and features..."
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <div className="space-y-2">
                    {(editPackageData.benefits || []).map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => {
                            const newBenefits = [...(editPackageData.benefits || [])];
                            newBenefits[index] = e.target.value;
                            setEditPackageData(prev => ({ ...prev, benefits: newBenefits }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder={`Benefit ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newBenefits = (editPackageData.benefits || []).filter((_, i) => i !== index);
                            setEditPackageData(prev => ({ ...prev, benefits: newBenefits }));
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditPackageData(prev => ({ ...prev, benefits: [...(prev.benefits || []), ''] }))}
                      className="flex items-center gap-2 px-3 py-2 text-yellow-600 hover:text-yellow-800"
                    >
                      <Plus className="w-4 h-4" />
                      Add Benefit
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms and Conditions
                  </label>
                  <textarea
                    rows={3}
                    value={editPackageData.termsAndConditions || ''}
                    onChange={(e) => setEditPackageData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter terms and conditions for this package..."
                  />
                </div>

                {/* Status Options */}
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editPackageData.isActive}
                      onChange={(e) => setEditPackageData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Package</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editPackageData.isPopular}
                      onChange={(e) => setEditPackageData(prev => ({ ...prev, isPopular: e.target.checked }))}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Popular Package</span>
                  </label>
                </div>

                {/* Price Preview */}
                {(editPackageData.price || 0) > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Price Preview</h3>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Original Price:</span>
                        <span className="ml-2 text-lg font-semibold">₹{editPackageData.price || 0}</span>
                      </div>
                      {(editPackageData.discountPercentage || 0) > 0 && (
                        <>
                          <div>
                            <span className="text-sm text-gray-600">Discount:</span>
                            <span className="ml-2 text-lg font-semibold text-green-600">{editPackageData.discountPercentage || 0}%</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Discounted Price:</span>
                            <span className="ml-2 text-lg font-bold text-yellow-600">₹{Math.round((editPackageData.price || 0) * (1 - (editPackageData.discountPercentage || 0) / 100))}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">You Save:</span>
                            <span className="ml-2 text-lg font-semibold text-green-600">₹{Math.round((editPackageData.price || 0) * ((editPackageData.discountPercentage || 0) / 100))}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditPlanModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={packageActionLoading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {packageActionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Update Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}