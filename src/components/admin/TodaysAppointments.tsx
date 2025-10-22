'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, MapPin, Phone, Mail, CheckCircle, AlertCircle, Star } from 'lucide-react'
import { appointmentAPI } from '@/lib/api'

interface TodaysAppointment {
  _id: string;
  userId: {
    name: string;
    phone: string;
    email: string;
  };
  serviceId: {
    name: string;
    duration: number;
    price: number;
  };
  stylistId?: {
    name: string;
    specialties: string[];
  };
  date: string;
  timeSlot: string;
  status: string;
  location: string;
  bookingReference: string;
  notes?: string;
  specialInstructions?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  rating?: number;
  feedback?: string;
}

export default function TodaysAppointments() {
  const [appointments, setAppointments] = useState<TodaysAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTodaysAppointments()
  }, [])

  const loadTodaysAppointments = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await appointmentAPI.getTodaysAppointments()
      setAppointments(response.data?.appointments || [])
    } catch (error: any) {
      setError(error.message || 'Failed to load today\'s appointments')
      console.error('Error loading today\'s appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, newStatus)
      setAppointments(prev =>
        prev.map(apt =>
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      )
    } catch (error: any) {
      setError(error.message || 'Failed to update appointment status')
    }
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} />
      case 'pending':
        return <Clock size={16} />
      case 'in_progress':
        return <Clock size={16} />
      case 'completed':
        return <CheckCircle size={16} />
      case 'cancelled':
        return <AlertCircle size={16} />
      case 'no_show':
        return <AlertCircle size={16} />
      case 'rescheduled':
        return <Calendar size={16} />
      default:
        return <Clock size={16} />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
        <span className="text-sm text-gray-500">{appointments.length} appointments</span>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No appointments scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment, index) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.userId.name}</h4>
                      <p className="text-sm text-gray-600">{appointment.serviceId.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatTime(appointment.timeSlot)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{appointment.stylistId?.name || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{appointment.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-gray-400 font-bold">₹</span>
                      <span>₹{appointment.serviceId.price}</span>
                    </div>
                  </div>

                  {appointment.specialInstructions && (
                    <div className="mt-2 p-2 bg-purple-50 rounded text-sm text-purple-700">
                      <strong>Special Instructions:</strong> {appointment.specialInstructions}
                    </div>
                  )}

                  {appointment.location === 'home' && appointment.address && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      <strong>Address:</strong> {appointment.address.street}, {appointment.address.city}, {appointment.address.state} {appointment.address.zipCode}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    Ref: {appointment.bookingReference} • {appointment.serviceId.duration} min
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                    >
                      Confirm
                    </button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'in_progress')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                    >
                      Start
                    </button>
                  )}
                  {appointment.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                    >
                      Complete
                    </button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for no-show:')
                        if (reason) {
                          handleStatusUpdate(appointment._id, 'no_show')
                        }
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
                    >
                      No Show
                    </button>
                  )}
                </div>
              </div>

              {appointment.rating && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < appointment.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">{appointment.rating}/5</span>
                    </div>
                  </div>
                  {appointment.feedback && (
                    <p className="text-sm text-gray-600 mt-1">{appointment.feedback}</p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
