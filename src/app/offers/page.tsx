'use client'

import { useState, useEffect } from 'react'
import { offerAPI, serviceAPI } from '@/lib/api'
import { Plus, Edit, Trash2, Gift, Percent, Calendar, Copy, CheckCircle, X, Search, Filter, ChevronLeft, ChevronRight, Clock, DollarSign, Users } from 'lucide-react'

interface Service {
  _id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
}

interface Offer {
  _id: string
  title: string
  description: string
  code: string
  discountType: 'percentage' | 'fixed' | 'free'
  discountValue: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  validFrom: string
  validUntil: string
  applicableServices: string[]
  applicableCategories: string[]
  usageLimit?: number
  usedCount: number
  isActive: boolean
  sortOrder: number
  bannerImage?: string
  termsAndConditions?: string
  createdAt: string
  updatedAt: string
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOffers, setTotalOffers] = useState(0)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'free',
    discountValue: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    validFrom: '',
    validUntil: '',
    applicableServices: [] as string[],
    applicableCategories: [] as string[],
    usageLimit: 0,
    isActive: true,
    sortOrder: 0,
    bannerImage: '',
    termsAndConditions: ''
  })

  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null)
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const categoryOptions = [
    { value: 'hair', label: 'Hair Services' },
    { value: 'nail', label: 'Nail Services' },
    { value: 'body', label: 'Body Services' },
    { value: 'skin', label: 'Skin Services' }
  ]

  useEffect(() => {
    fetchOffers()
  }, [searchTerm, statusFilter, currentPage, itemsPerPage])

  useEffect(() => {
    if (showModal) {
      fetchServices()
    }
  }, [showModal])

  const fetchServices = async () => {
    try {
      setLoadingServices(true)
      const response = await serviceAPI.getAll({ isActive: true, limit: 200 })
      if (response.success) {
        setServices(response.data?.services || [])
      }
    } catch (err) {
      console.error('Error fetching services:', err)
    } finally {
      setLoadingServices(false)
    }
  }

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  )

  const fetchOffers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active'
      }
      
      const response = await offerAPI.getAllAdmin(params)
      if (response.success) {
        setOffers(response.data.offers || [])
        setTotalOffers(response.data.pagination?.totalOffers || 0)
        setTotalPages(response.data.pagination?.totalPages || 1)
      } else {
        setError('Failed to fetch offers')
      }
    } catch (err) {
      setError('Error fetching offers')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setUploading(true)
      
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('code', formData.code)
      formDataToSend.append('discountType', formData.discountType)
      formDataToSend.append('discountValue', formData.discountValue.toString())
      formDataToSend.append('minPurchaseAmount', formData.minPurchaseAmount.toString())
      if (formData.maxDiscountAmount > 0) {
        formDataToSend.append('maxDiscountAmount', formData.maxDiscountAmount.toString())
      }
      formDataToSend.append('validFrom', new Date(formData.validFrom).toISOString())
      formDataToSend.append('validUntil', new Date(formData.validUntil).toISOString())
      formDataToSend.append('isActive', formData.isActive.toString())
      formDataToSend.append('sortOrder', formData.sortOrder.toString())
      
      // Add services as array
      formData.applicableServices.forEach((serviceId, index) => {
        formDataToSend.append(`applicableServices[${index}]`, serviceId)
      })
      
      // Add categories as array
      formData.applicableCategories.forEach((category, index) => {
        formDataToSend.append(`applicableCategories[${index}]`, category)
      })
      
      if (formData.usageLimit > 0) {
        formDataToSend.append('usageLimit', formData.usageLimit.toString())
      }
      
      if (formData.termsAndConditions) {
        formDataToSend.append('termsAndConditions', formData.termsAndConditions)
      }
      
      // Add banner image file if selected
      if (selectedBannerFile) {
        formDataToSend.append('bannerImage', selectedBannerFile)
      } else if (formData.bannerImage && !editingOffer) {
        // If no file but URL is provided (for backward compatibility)
        formDataToSend.append('bannerImage', formData.bannerImage)
      }

      if (editingOffer) {
        await offerAPI.update(editingOffer._id, formDataToSend)
      } else {
        await offerAPI.create(formDataToSend)
      }
      
      setShowModal(false)
      setEditingOffer(null)
      resetForm()
      fetchOffers()
    } catch (err) {
      setError('Error saving offer: ' + (err instanceof Error ? err.message : 'Unknown error'))
      console.error('Error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB')
        return
      }
      setSelectedBannerFile(file)
      const url = URL.createObjectURL(file)
      setBannerPreviewUrl(url)
      // Clear bannerImage URL since we're using file upload
      setFormData(prev => ({ ...prev, bannerImage: '' }))
    }
  }

  const removeBannerFile = () => {
    setSelectedBannerFile(null)
    setBannerPreviewUrl(null)
    if (bannerPreviewUrl) {
      URL.revokeObjectURL(bannerPreviewUrl)
    }
  }

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer)
    setFormData({
      title: offer.title,
      description: offer.description,
      code: offer.code,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minPurchaseAmount: offer.minPurchaseAmount || 0,
      maxDiscountAmount: offer.maxDiscountAmount || 0,
      validFrom: new Date(offer.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(offer.validUntil).toISOString().slice(0, 16),
      applicableServices: offer.applicableServices,
      applicableCategories: offer.applicableCategories,
      usageLimit: offer.usageLimit || 0,
      isActive: offer.isActive,
      sortOrder: offer.sortOrder,
      bannerImage: offer.bannerImage || '',
      termsAndConditions: offer.termsAndConditions || ''
    })
    setBannerPreviewUrl(offer.bannerImage || null)
    setSelectedBannerFile(null)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      try {
        await offerAPI.delete(id)
        fetchOffers()
      } catch (err) {
        setError('Error deleting offer')
        console.error('Error:', err)
      }
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await offerAPI.deactivate(id)
      } else {
        await offerAPI.reactivate(id)
      }
      fetchOffers()
    } catch (err) {
      setError('Error updating offer status')
      console.error('Error:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minPurchaseAmount: 0,
      maxDiscountAmount: 0,
      validFrom: '',
      validUntil: '',
      applicableServices: [],
      applicableCategories: [],
      usageLimit: 0,
      isActive: true,
      sortOrder: 0,
      bannerImage: '',
      termsAndConditions: ''
    })
    setServiceSearchTerm('')
    setSelectedBannerFile(null)
    if (bannerPreviewUrl) {
      URL.revokeObjectURL(bannerPreviewUrl)
    }
    setBannerPreviewUrl(null)
  }

  const formatDiscount = (offer: Offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`
    } else if (offer.discountType === 'fixed') {
      return `₹${offer.discountValue} OFF`
    } else {
      return 'FREE'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const isOfferValid = (offer: Offer) => {
    const now = new Date()
    const validFrom = new Date(offer.validFrom)
    const validUntil = new Date(offer.validUntil)
    return offer.isActive && now >= validFrom && now <= validUntil
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Offer Management</h1>
        <button
          onClick={() => {
            resetForm()
            setEditingOffer(null)
            setShowModal(true)
          }}
          className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#B8941F] transition-colors"
        >
          <Plus size={20} />
          Add Offer
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title, description, or code..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline px-4 py-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offers.map((offer) => {
                const valid = isOfferValid(offer)
                return (
                  <tr key={offer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Gift className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                          <div className="text-sm text-gray-500">{offer.description.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => copyToClipboard(offer.code)}
                        className="inline-flex items-center gap-1 font-mono font-semibold bg-yellow-100 text-amber-800 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
                        title="Click to copy"
                      >
                        {offer.code}
                        <Copy className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{formatDiscount(offer)}</div>
                      {offer.minPurchaseAmount && offer.minPurchaseAmount > 0 && (
                        <div className="text-xs text-gray-500">Min: ₹{offer.minPurchaseAmount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div>{formatDate(offer.validFrom)}</div>
                          <div>{formatDate(offer.validUntil)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400" />
                        {offer.usedCount} / {offer.usageLimit || '∞'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          valid
                            ? 'bg-green-100 text-green-800'
                            : offer.isActive
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <CheckCircle className={`h-3 w-3 mr-1 ${valid ? 'text-green-600' : 'text-gray-400'}`} />
                        {valid ? 'Active' : offer.isActive ? 'Upcoming/Expired' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="text-[#D4AF37] hover:text-[#B8941F]"
                          title="Edit Offer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(offer._id, offer.isActive)}
                          className={`${
                            offer.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                          }`}
                          title={offer.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {offer.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Offer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalOffers)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalOffers}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-[#D4AF37] border-[#D4AF37] text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingOffer ? 'Edit Offer' : 'Add New Offer'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingOffer(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 font-mono focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Type *</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as any }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free">Free</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Value *</label>
                    <input
                      type="number"
                      min="0"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valid From *</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valid Until *</label>
                    <input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Purchase Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minPurchaseAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, minPurchaseAmount: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                  {formData.discountType === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max Discount Amount</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxDiscountAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                        placeholder="No limit"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Services (Combo Offer)</label>
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                    {loadingServices ? (
                      <div className="text-center py-4 text-sm text-gray-500">Loading services...</div>
                    ) : filteredServices.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500">No services found</div>
                    ) : (
                      <div className="space-y-2">
                        {filteredServices.map((service) => (
                          <label key={service._id} className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.applicableServices.includes(service._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    applicableServices: [...prev.applicableServices, service._id]
                                  }))
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    applicableServices: prev.applicableServices.filter(id => id !== service._id)
                                  }))
                                }
                              }}
                              className="mt-1 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                            />
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900">{service.name}</div>
                              <div className="text-xs text-gray-500">{service.description.substring(0, 60)}...</div>
                              <div className="text-xs text-gray-600 mt-1">
                                ₹{service.price} • {service.duration} min • {service.category}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.applicableServices.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {formData.applicableServices.length} service{formData.applicableServices.length > 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Applicable Categories</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {categoryOptions.map((category) => (
                      <label key={category.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.applicableCategories.includes(category.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                applicableCategories: [...prev.applicableCategories, category.value]
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                applicableCategories: prev.applicableCategories.filter(c => c !== category.value)
                              }))
                            }
                          }}
                          className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D4AF37] file:text-white hover:file:bg-[#B8941F] cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF or WebP. Max size: 10MB</p>
                    </div>
                    {(bannerPreviewUrl || formData.bannerImage) && (
                      <div className="relative inline-block">
                        <img
                          src={bannerPreviewUrl || formData.bannerImage || ''}
                          alt="Banner preview"
                          className="h-32 w-auto rounded-lg border border-gray-300 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeBannerFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Terms and Conditions</label>
                  <textarea
                    value={formData.termsAndConditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingOffer(null)
                      resetForm()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-md text-sm font-medium hover:bg-[#B8941F] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={uploading}
                  >
                    {uploading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {uploading ? 'Saving...' : (editingOffer ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

