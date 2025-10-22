'use client'

import { useState, useEffect } from 'react'
import { serviceAPI } from '@/lib/api'
import { Plus, Edit, Trash2, Eye, Clock, DollarSign, Sparkles, MapPin, Home, Upload, Star, Tag, Image as ImageIcon, X, Check, Settings, Users, Percent, Calendar, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

interface Service {
  _id: string
  name: string
  description: string
  duration: number
  price: number
  currency: string
  category: string
  icon: string
  photo?: string
  tags: string[]
  availableAtHome: boolean
  availableAtSalon: boolean
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  discount: {
    percentage: number
    isActive: boolean
    validFrom: string
    validUntil?: string
  }
  createdAt: string
  updatedAt: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priceRangeFilter, setPriceRangeFilter] = useState({ min: 0, max: 10000 })
  const [durationRangeFilter, setDurationRangeFilter] = useState({ min: 0, max: 300 })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalServices, setTotalServices] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: 'hair',
    icon: 'Scissors',
    tags: '',
    availableAtHome: false,
    availableAtSalon: true,
    isFeatured: false,
    sortOrder: 0
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // Bulk edit state
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [bulkEditData, setBulkEditData] = useState({
    category: '',
    availableAtHome: null as boolean | null,
    availableAtSalon: null as boolean | null,
    isActive: null as boolean | null,
    isFeatured: null as boolean | null,
    discount: {
      percentage: 0,
      isActive: false,
      validFrom: '',
      validUntil: ''
    }
  })
  const [bulkEditLoading, setBulkEditLoading] = useState(false)

  const categoryOptions = [
    { value: 'hair', label: 'Hair Services', icon: 'Scissors', color: '#D4AF37' },
    { value: 'nail', label: 'Nail Services', icon: 'Sparkles', color: '#E91E63' },
    { value: 'body', label: 'Body Services', icon: 'Heart', color: '#4CAF50' },
    { value: 'skin', label: 'Skin Services', icon: 'Zap', color: '#FF9800' }
  ]

  const iconOptions = [
    'Scissors', 'Sparkles', 'Heart', 'Zap', 'Star', 'Crown', 'Gem', 'Flower',
    'Sun', 'Moon', 'Diamond', 'Circle', 'Square', 'Triangle', 'Hexagon',
    'Shield', 'Award', 'Trophy', 'Medal', 'Badge', 'Ribbon', 'Gift'
  ]

  useEffect(() => {
    fetchServices()
  }, [searchTerm, categoryFilter, statusFilter, priceRangeFilter, durationRangeFilter, currentPage, itemsPerPage])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Build query parameters
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      
      if (categoryFilter !== 'all') {
        params.category = categoryFilter
      }
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active'
      }
      
      if (priceRangeFilter.min > 0 || priceRangeFilter.max < 10000) {
        params.minPrice = priceRangeFilter.min
        params.maxPrice = priceRangeFilter.max
      }
      
      if (durationRangeFilter.min > 0 || durationRangeFilter.max < 300) {
        params.minDuration = durationRangeFilter.min
        params.maxDuration = durationRangeFilter.max
      }
      
      const response = await serviceAPI.getAllAdmin(params)
      if (response.success) {
        setServices(response.data.services || [])
        setTotalServices(response.data.pagination?.totalServices || 0)
        setTotalPages(response.data.pagination?.totalPages || 1)
      } else {
        setError('Failed to fetch services')
      }
    } catch (err) {
      setError('Error fetching services')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Search and filter functions
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setPriceRangeFilter({ min: 0, max: 10000 })
    setDurationRangeFilter({ min: 0, max: 300 })
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setUploading(true)
      
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('duration', formData.duration.toString())
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('category', formData.category)
      formDataToSend.append('icon', formData.icon)
      formDataToSend.append('tags', formData.tags)
      formDataToSend.append('availableAtHome', formData.availableAtHome.toString())
      formDataToSend.append('availableAtSalon', formData.availableAtSalon.toString())
      formDataToSend.append('isFeatured', formData.isFeatured.toString())
      formDataToSend.append('sortOrder', formData.sortOrder.toString())
      
      
      if (selectedFile) {
        formDataToSend.append('photo', selectedFile)
      }

      if (editingService) {
        await serviceAPI.update(editingService._id, formDataToSend)
      } else {
        await serviceAPI.create(formDataToSend)
      }
      
      setShowModal(false)
      setEditingService(null)
      resetForm()
      fetchServices()
    } catch (err) {
      setError('Error saving service: ' + (err instanceof Error ? err.message : 'Unknown error'))
      console.error('Error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      icon: service.icon,
      tags: service.tags.join(', '),
      availableAtHome: service.availableAtHome,
      availableAtSalon: service.availableAtSalon,
      isFeatured: service.isFeatured,
      sortOrder: service.sortOrder
    })
    setPreviewUrl(service.photo || null)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceAPI.delete(id)
        fetchServices()
      } catch (err) {
        setError('Error deleting service')
        console.error('Error:', err)
      }
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await serviceAPI.deactivate(id)
      } else {
        await serviceAPI.reactivate(id)
      }
      fetchServices()
    } catch (err) {
      setError('Error updating service status')
      console.error('Error:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: 'hair',
      icon: 'Scissors',
      tags: '',
      availableAtHome: false,
      availableAtSalon: true,
      isFeatured: false,
      sortOrder: 0
    })
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await serviceAPI.toggleFeatured(id)
      fetchServices()
    } catch (err) {
      setError('Error updating featured status')
      console.error('Error:', err)
    }
  }


  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  // Bulk edit functions
  const handleSelectService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSelectAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([])
    } else {
      setSelectedServices(services.map(service => service._id))
    }
  }

  const handleBulkEdit = async () => {
    if (selectedServices.length === 0) return

    try {
      setBulkEditLoading(true)
      
      // Prepare update data - only include fields that have values
      const updateData: any = {}
      
      if (bulkEditData.category) {
        updateData.category = bulkEditData.category
      }
      if (bulkEditData.availableAtHome !== null) {
        updateData.availableAtHome = bulkEditData.availableAtHome
      }
      if (bulkEditData.availableAtSalon !== null) {
        updateData.availableAtSalon = bulkEditData.availableAtSalon
      }
      if (bulkEditData.isActive !== null) {
        updateData.isActive = bulkEditData.isActive
      }
      if (bulkEditData.isFeatured !== null) {
        updateData.isFeatured = bulkEditData.isFeatured
      }
      
      // Handle discount fields
      if (bulkEditData.discount.percentage > 0) {
        updateData['discount.percentage'] = bulkEditData.discount.percentage
      }
      if (bulkEditData.discount.isActive) {
        updateData['discount.isActive'] = bulkEditData.discount.isActive
      }
      if (bulkEditData.discount.validFrom) {
        updateData['discount.validFrom'] = bulkEditData.discount.validFrom
      }
      if (bulkEditData.discount.validUntil) {
        updateData['discount.validUntil'] = bulkEditData.discount.validUntil
      }

      const response = await serviceAPI.bulkUpdate(selectedServices, updateData)
      
      if (response.success) {
        setError('')
        setSelectedServices([])
        setShowBulkEdit(false)
        setBulkEditData({
          category: '',
          availableAtHome: null,
          availableAtSalon: null,
          isActive: null,
          isFeatured: null,
          discount: {
            percentage: 0,
            isActive: false,
            validFrom: '',
            validUntil: ''
          }
        })
        fetchServices()
      } else {
        setError(response.message || 'Bulk update failed')
      }
    } catch (err) {
      setError('Error performing bulk update')
      console.error('Error:', err)
    } finally {
      setBulkEditLoading(false)
    }
  }

  const resetBulkEdit = () => {
    setBulkEditData({
      category: '',
      availableAtHome: null,
      availableAtSalon: null,
      isActive: null,
      isFeatured: null,
      discount: {
        percentage: 0,
        isActive: false,
        validFrom: '',
        validUntil: ''
      }
    })
    setSelectedServices([])
    setShowBulkEdit(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
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
        <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
        <button
          onClick={() => {
            resetForm()
            setEditingService(null)
            setShowModal(true)
          }}
          className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#B8941F] transition-colors"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {/* Search and Filter Section */}
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
                placeholder="Search by service name, description, or tags..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              />
            </div>

            {/* Category filter */}
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              >
                <option value="all">All Categories</option>
                <option value="hair">Hair Services</option>
                <option value="nail">Nail Services</option>
                <option value="body">Body Services</option>
                <option value="skin">Skin Services</option>
              </select>
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

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showAdvancedFilters 
                  ? 'bg-[#D4AF37] text-white border-[#D4AF37]' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#D4AF37]'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ₹{priceRangeFilter.min} - ₹{priceRangeFilter.max}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={priceRangeFilter.max}
                      onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRangeFilter.min}
                        onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRangeFilter.max}
                        onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration: {durationRangeFilter.min} - {durationRangeFilter.max} min
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="300"
                      step="15"
                      value={durationRangeFilter.max}
                      onChange={(e) => setDurationRangeFilter(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={durationRangeFilter.min}
                        onChange={(e) => setDurationRangeFilter(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={durationRangeFilter.max}
                        onChange={(e) => setDurationRangeFilter(prev => ({ ...prev, max: parseInt(e.target.value) || 300 }))}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Bulk Edit Controls */}
      {selectedServices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-blue-700 font-medium">
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setShowBulkEdit(!showBulkEdit)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Settings size={16} />
                Bulk Edit
              </button>
              <button
                onClick={() => setSelectedServices([])}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Form */}
      {showBulkEdit && selectedServices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Edit Services</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={bulkEditData.category}
                onChange={(e) => setBulkEditData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No change</option>
                {categoryOptions.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available at Home</label>
              <select
                value={bulkEditData.availableAtHome === null ? '' : bulkEditData.availableAtHome.toString()}
                onChange={(e) => setBulkEditData(prev => ({ 
                  ...prev, 
                  availableAtHome: e.target.value === '' ? null : e.target.value === 'true' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No change</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available at Salon</label>
              <select
                value={bulkEditData.availableAtSalon === null ? '' : bulkEditData.availableAtSalon.toString()}
                onChange={(e) => setBulkEditData(prev => ({ 
                  ...prev, 
                  availableAtSalon: e.target.value === '' ? null : e.target.value === 'true' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No change</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={bulkEditData.isActive === null ? '' : bulkEditData.isActive.toString()}
                onChange={(e) => setBulkEditData(prev => ({ 
                  ...prev, 
                  isActive: e.target.value === '' ? null : e.target.value === 'true' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No change</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
              <select
                value={bulkEditData.isFeatured === null ? '' : bulkEditData.isFeatured.toString()}
                onChange={(e) => setBulkEditData(prev => ({ 
                  ...prev, 
                  isFeatured: e.target.value === '' ? null : e.target.value === 'true' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No change</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={bulkEditData.discount.percentage}
                onChange={(e) => setBulkEditData(prev => ({ 
                  ...prev, 
                  discount: { ...prev.discount, percentage: parseInt(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Active</label>
              <select
                value={bulkEditData.discount.isActive.toString()}
                onChange={(e) => setBulkEditData(prev => ({ 
                  ...prev, 
                  discount: { ...prev.discount, isActive: e.target.value === 'true' }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
              <input
                type="datetime-local"
                value={bulkEditData.discount.validFrom}
                onChange={(e) => setBulkEditData(prev => ({ 
                  ...prev, 
                  discount: { ...prev.discount, validFrom: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
              <input
                type="datetime-local"
                value={bulkEditData.discount.validUntil}
                onChange={(e) => setBulkEditData(prev => ({ 
                  ...prev, 
                  discount: { ...prev.discount, validUntil: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleBulkEdit}
              disabled={bulkEditLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {bulkEditLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Apply Changes
                </>
              )}
            </button>
            <button
              onClick={resetBulkEdit}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedServices.length === services.length && services.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
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
              {services.map((service) => (
                <tr key={service._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service._id)}
                      onChange={() => handleSelectService(service._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {service.photo ? (
                          <img 
                            src={service.photo} 
                            alt={service.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {service.name}
                          {service.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{service.description.substring(0, 50)}...</div>
                        {service.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {service.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {service.tags.length > 2 && (
                              <span className="text-xs text-gray-400">+{service.tags.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/10 text-[#D4AF37] capitalize">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      {formatDuration(service.duration)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      {formatPrice(service.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleFeatured(service._id, service.isFeatured)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isFeatured
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Star className={`h-3 w-3 mr-1 ${service.isFeatured ? 'fill-current' : ''}`} />
                      {service.isFeatured ? 'Featured' : 'Regular'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {service.availableAtHome && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Home className="h-3 w-3 mr-1" />
                          Home
                        </span>
                      )}
                      {service.availableAtSalon && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <MapPin className="h-3 w-3 mr-1" />
                          Salon
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-[#D4AF37] hover:text-[#B8941F]"
                        title="Edit Service"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(service._id, service.isActive)}
                        className={`${
                          service.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                        }`}
                        title={service.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {service.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Service"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalServices)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalServices}</span>
                  {' '}results
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {(() => {
                    const maxVisiblePages = 5;
                    const halfVisible = Math.floor(maxVisiblePages / 2);
                    let startPage = Math.max(1, currentPage - halfVisible);
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    // Adjust start page if we're near the end
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            i === currentPage
                              ? 'z-10 bg-[#D4AF37] border-[#D4AF37] text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
                
                {/* Go to page input */}
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-700">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (!isNaN(page)) {
                        handleGoToPage(page);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                  <span className="text-sm text-gray-700">of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Photo</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-[#B8941F]"
                      />
                    </div>
                    {previewUrl && (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeSelectedFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    >
                      {categoryOptions.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                    <input
                      type="number"
                      min="15"
                      max="480"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Icon</label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    >
                      {iconOptions.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
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
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., premium, popular, new"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availableAtHome}
                      onChange={(e) => setFormData(prev => ({ ...prev, availableAtHome: e.target.checked }))}
                      className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available at Home</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availableAtSalon}
                      onChange={(e) => setFormData(prev => ({ ...prev, availableAtSalon: e.target.checked }))}
                      className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available at Salon</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Featured Service
                    </span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                    {uploading ? 'Saving...' : (editingService ? 'Update' : 'Create')}
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
