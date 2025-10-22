'use client'

import { useState, useEffect } from 'react'
import { stylistAPI } from '@/lib/api'
import { Plus, Edit, Trash2, Eye, Star, Phone, Mail, MapPin, Clock, Scissors } from 'lucide-react'

interface Stylist {
  _id: string
  name: string
  email: string
  phone: string
  specialties: string[]
  experience: number
  rating: number
  bio: string
  workingHours: {
    start: string
    end: string
  }
  workingDays: string[]
  availableForHome: boolean
  availableForSalon: boolean
  isActive: boolean
  image?: {
    public_id: string
    secure_url: string
    url: string
  }
  createdAt: string
  updatedAt: string
}

export default function StylistsPage() {
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    experience: 0,
    rating: 0,
    bio: '',
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: [] as string[],
    availableForHome: false,
    availableForSalon: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const specialtyOptions = ['hair', 'nails', 'skincare', 'massage', 'makeup', 'other']
  const dayOptions = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  useEffect(() => {
    fetchStylists()
  }, [])

  const fetchStylists = async () => {
    try {
      setLoading(true)
      const response = await stylistAPI.getAll()
      if (response.success) {
        setStylists(response.data.stylists || [])
      } else {
        setError('Failed to fetch stylists')
      }
    } catch (err) {
      setError('Error fetching stylists')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'specialties' || key === 'workingDays') {
          // Send arrays as individual entries
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              formDataToSend.append(`${key}[${index}]`, item)
            })
          }
        } else if (key === 'workingHours') {
          // Send working hours as individual fields
          if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
            formDataToSend.append('workingHours.start', (value as { start: string; end: string }).start)
            formDataToSend.append('workingHours.end', (value as { start: string; end: string }).end)
          }
        } else {
          formDataToSend.append(key, value.toString())
        }
      })
      
      // Append image file if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }
      
      if (editingStylist) {
        await stylistAPI.update(editingStylist._id, formDataToSend)
      } else {
        await stylistAPI.create(formDataToSend)
      }
      setShowModal(false)
      setEditingStylist(null)
      resetForm()
      fetchStylists()
    } catch (err) {
      setError('Error saving stylist')
      console.error('Error:', err)
    }
  }

  const handleEdit = (stylist: Stylist) => {
    setEditingStylist(stylist)
    setFormData({
      name: stylist.name,
      email: stylist.email,
      phone: stylist.phone,
      specialties: stylist.specialties,
      experience: stylist.experience,
      rating: stylist.rating,
      bio: stylist.bio,
      workingHours: stylist.workingHours,
      workingDays: stylist.workingDays,
      availableForHome: stylist.availableForHome,
      availableForSalon: stylist.availableForSalon
    })
    setImageFile(null)
    setImagePreview(stylist.image?.secure_url || null)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this stylist?')) {
      try {
        await stylistAPI.delete(id)
        fetchStylists()
      } catch (err) {
        setError('Error deleting stylist')
        console.error('Error:', err)
      }
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await stylistAPI.deactivate(id)
      } else {
        await stylistAPI.reactivate(id)
      }
      fetchStylists()
    } catch (err) {
      setError('Error updating stylist status')
      console.error('Error:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialties: [],
      experience: 0,
      rating: 0,
      bio: '',
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      workingDays: [],
      availableForHome: false,
      availableForSalon: true
    })
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const handleDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Stylist Management</h1>
        <button
          onClick={() => {
            resetForm()
            setEditingStylist(null)
            setShowModal(true)
          }}
          className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#B8941F] transition-colors"
        >
          <Plus size={20} />
          Add Stylist
        </button>
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
                  Stylist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
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
              {stylists.map((stylist) => (
                <tr key={stylist._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {stylist.image?.secure_url ? (
                          <img 
                            src={stylist.image.secure_url} 
                            alt={stylist.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
                            <Scissors className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{stylist.name}</div>
                        <div className="text-sm text-gray-500">{stylist.bio.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Mail size={14} />
                      {stylist.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone size={14} />
                      {stylist.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {stylist.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/10 text-[#D4AF37]"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stylist.experience} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-900">{stylist.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stylist.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {stylist.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(stylist)}
                        className="text-[#D4AF37] hover:text-[#B8941F]"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(stylist._id, stylist.isActive)}
                        className={`${
                          stylist.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {stylist.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(stylist._id)}
                        className="text-red-600 hover:text-red-800"
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingStylist ? 'Edit Stylist' : 'Add New Stylist'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                          <Scissors className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D4AF37] file:text-white hover:file:bg-[#B8941F]"
                      />
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WebP up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialties</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {specialtyOptions.map((specialty) => (
                      <label key={specialty} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(specialty)}
                          onChange={() => handleSpecialtyChange(specialty)}
                          className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Working Days</label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {dayOptions.map((day) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.workingDays.includes(day)}
                          onChange={() => handleDayChange(day)}
                          className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      value={formData.workingHours.start}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        workingHours: { ...prev.workingHours, start: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      value={formData.workingHours.end}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        workingHours: { ...prev.workingHours, end: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availableForHome}
                      onChange={(e) => setFormData(prev => ({ ...prev, availableForHome: e.target.checked }))}
                      className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available for Home Service</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availableForSalon}
                      onChange={(e) => setFormData(prev => ({ ...prev, availableForSalon: e.target.checked }))}
                      className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available for Salon Service</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-md text-sm font-medium hover:bg-[#B8941F]"
                  >
                    {editingStylist ? 'Update' : 'Create'}
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
