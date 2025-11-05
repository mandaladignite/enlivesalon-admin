'use client'

import { useState, useEffect } from 'react'
import { heroAPI } from '@/lib/api'
import { Plus, Edit, Trash2, Search, X, CheckCircle, Image as ImageIcon, Link as LinkIcon, BarChart3 } from 'lucide-react'

interface HeroSection {
  _id: string
  title: string
  subtitle?: string
  description?: string
  backgroundImage: string
  ctaPrimary: {
    text: string
    link: string
  }
  ctaSecondary?: {
    text: string
    link: string
  }
  stats?: Array<{
    icon: string
    value: string
    label: string
  }>
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// Icon mapping for stats
const iconMap: Record<string, any> = {
  Users: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Award: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function HeroPage() {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    ctaPrimary: { text: '', link: '' },
    ctaSecondary: { text: '', link: '' },
    stats: [] as Array<{ icon: string; value: string; label: string }>,
    isActive: true,
    sortOrder: 0
  })

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [newStat, setNewStat] = useState({ icon: 'Users', value: '', label: '' })

  useEffect(() => {
    fetchHeroSections()
  }, [searchTerm, statusFilter])

  const fetchHeroSections = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params: any = {}
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active'
      }
      
      const response = await heroAPI.getAllAdmin(params)
      if (response.success) {
        setHeroSections(response.data.heroSections || [])
      } else {
        setError('Failed to fetch hero sections')
      }
    } catch (err) {
      setError('Error fetching hero sections')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      // Clear error if validation passes
      setError('')
    }
  }

  const removeImageFile = () => {
    setSelectedImageFile(null)
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setImagePreviewUrl(null)
    setFormData(prev => ({ ...prev, backgroundImage: '' }))
  }

  const addStat = () => {
    if (newStat.value && newStat.label) {
      setFormData({
        ...formData,
        stats: [...formData.stats, { ...newStat }]
      })
      setNewStat({ icon: 'Users', value: '', label: '' })
    }
  }

  const removeStat = (index: number) => {
    setFormData({
      ...formData,
      stats: formData.stats.filter((_, i) => i !== index)
    })
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      backgroundImage: '',
      ctaPrimary: { text: '', link: '' },
      ctaSecondary: { text: '', link: '' },
      stats: [],
      isActive: true,
      sortOrder: 0
    })
    setSelectedImageFile(null)
    setImagePreviewUrl(null)
    setNewStat({ icon: 'Users', value: '', label: '' })
  }

  const handleEdit = (hero: HeroSection) => {
    setEditingHero(hero)
    setFormData({
      title: hero.title,
      subtitle: hero.subtitle || '',
      description: hero.description || '',
      backgroundImage: hero.backgroundImage,
      ctaPrimary: hero.ctaPrimary,
      ctaSecondary: hero.ctaSecondary || { text: '', link: '' },
      stats: hero.stats || [],
      isActive: hero.isActive,
      sortOrder: hero.sortOrder
    })
    setImagePreviewUrl(hero.backgroundImage)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.ctaPrimary.text.trim() || !formData.ctaPrimary.link.trim()) {
      setError('Primary CTA text and link are required')
      return
    }
    if (!editingHero && !selectedImageFile && !formData.backgroundImage) {
      setError('Background image is required')
      return
    }
    
    try {
      setUploading(true)
      
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      if (formData.subtitle) formDataToSend.append('subtitle', formData.subtitle.trim())
      if (formData.description) formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('ctaPrimary', JSON.stringify({
        text: formData.ctaPrimary.text.trim(),
        link: formData.ctaPrimary.link.trim()
      }))
      if (formData.ctaSecondary?.text && formData.ctaSecondary?.link) {
        formDataToSend.append('ctaSecondary', JSON.stringify({
          text: formData.ctaSecondary.text.trim(),
          link: formData.ctaSecondary.link.trim()
        }))
      }
      if (formData.stats.length > 0) {
        formDataToSend.append('stats', JSON.stringify(formData.stats))
      }
      formDataToSend.append('isActive', formData.isActive.toString())
      formDataToSend.append('sortOrder', formData.sortOrder.toString())
      
      // Add background image file if selected
      if (selectedImageFile) {
        formDataToSend.append('backgroundImage', selectedImageFile)
      } else if (formData.backgroundImage && !editingHero) {
        // If no file but URL is provided (for new hero sections)
        formDataToSend.append('backgroundImage', formData.backgroundImage)
      }

      let response
      if (editingHero) {
        response = await heroAPI.update(editingHero._id, formDataToSend)
      } else {
        response = await heroAPI.create(formDataToSend)
      }

      if (response.success) {
        setShowModal(false)
        resetForm()
        setEditingHero(null)
        fetchHeroSections()
      } else {
        setError(response.message || 'Failed to save hero section')
      }
    } catch (err) {
      console.error('Error saving hero section:', err)
      setError('Error saving hero section: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero section?')) return
    
    try {
      const response = await heroAPI.delete(id)
      if (response.success) {
        fetchHeroSections()
      } else {
        setError('Failed to delete hero section')
      }
    } catch (err) {
      setError('Error deleting hero section')
    }
  }

  const handleToggleActive = async (hero: HeroSection) => {
    try {
      const response = hero.isActive 
        ? await heroAPI.deactivate(hero._id)
        : await heroAPI.reactivate(hero._id)
      
      if (response.success) {
        fetchHeroSections()
      } else {
        setError('Failed to update hero section status')
      }
    } catch (err) {
      setError('Error updating hero section status')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading hero sections...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hero Section Management</h1>
        <button
          onClick={() => {
            resetForm()
            setEditingHero(null)
            setShowModal(true)
          }}
          className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#B8941F] transition-colors"
        >
          <Plus size={20} />
          Add Hero Section
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, subtitle, or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-4 py-2 rounded-lg bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Hero Sections List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtitle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTAs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {heroSections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No hero sections found
                  </td>
                </tr>
              ) : (
                heroSections.map((hero) => (
                  <tr key={hero._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-20 h-12 rounded overflow-hidden bg-gray-100">
                        <img
                          src={hero.backgroundImage}
                          alt={hero.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{hero.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{hero.subtitle || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center gap-1 mb-1">
                          <LinkIcon className="w-3 h-3" />
                          <span>{hero.ctaPrimary.text}</span>
                        </div>
                        {hero.ctaSecondary?.text && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            <span>{hero.ctaSecondary.text}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(hero)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          hero.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {hero.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hero.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(hero)}
                          className="text-[#D4AF37] hover:text-[#B8941F]"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(hero._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingHero ? 'Edit Hero Section' : 'Add Hero Section'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                    setEditingHero(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image {!editingHero && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                  {(imagePreviewUrl || formData.backgroundImage) && (
                    <div className="mt-4 relative">
                      <img
                        src={imagePreviewUrl || formData.backgroundImage}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {selectedImageFile && (
                        <button
                          type="button"
                          onClick={removeImageFile}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  )}
                  {!editingHero && !selectedImageFile && !formData.backgroundImage && (
                    <p className="mt-2 text-sm text-gray-500">Image is required for new hero sections</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary CTA Text *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ctaPrimary.text}
                      onChange={(e) => setFormData({
                        ...formData,
                        ctaPrimary: { ...formData.ctaPrimary, text: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary CTA Link *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ctaPrimary.link}
                      onChange={(e) => setFormData({
                        ...formData,
                        ctaPrimary: { ...formData.ctaPrimary, link: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      placeholder="/book or /offers"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary CTA Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaSecondary?.text || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        ctaSecondary: { ...formData.ctaSecondary, text: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary CTA Link
                    </label>
                    <input
                      type="text"
                      value={formData.ctaSecondary?.link || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        ctaSecondary: { ...formData.ctaSecondary, link: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      placeholder="/gallery or /offers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stats
                  </label>
                  <div className="space-y-2 mb-4">
                    {formData.stats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <select
                            value={stat.icon}
                            onChange={(e) => {
                              const newStats = [...formData.stats]
                              newStats[index].icon = e.target.value
                              setFormData({ ...formData, stats: newStats })
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Users">Users</option>
                            <option value="Star">Star</option>
                            <option value="Award">Award</option>
                            <option value="Clock">Clock</option>
                          </select>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = [...formData.stats]
                              newStats[index].value = e.target.value
                              setFormData({ ...formData, stats: newStats })
                            }}
                            placeholder="10K+"
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...formData.stats]
                              newStats[index].label = e.target.value
                              setFormData({ ...formData, stats: newStats })
                            }}
                            placeholder="Happy Clients"
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStat(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newStat.icon}
                      onChange={(e) => setNewStat({ ...newStat, icon: e.target.value })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="Users">Users</option>
                      <option value="Star">Star</option>
                      <option value="Award">Award</option>
                      <option value="Clock">Clock</option>
                    </select>
                    <input
                      type="text"
                      value={newStat.value}
                      onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
                      placeholder="Value"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={newStat.label}
                      onChange={(e) => setNewStat({ ...newStat, label: e.target.value })}
                      placeholder="Label"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={addStat}
                      className="px-4 py-1 bg-[#D4AF37] text-white rounded text-sm hover:bg-[#B8941F]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                      setEditingHero(null)
                    }}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Saving...' : editingHero ? 'Update' : 'Create'}
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

