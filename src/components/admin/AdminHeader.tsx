'use client'

import { Bell, Search, User, LogOut } from 'lucide-react'
import MobileSidebar from './MobileSidebar'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'

export default function AdminHeader() {
  const { admin, logout } = useAdminAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-[#ffffff] border-b border-[#D4AF37]/20 p-4 shadow-md">
      <div className="flex items-center justify-between">
        {/* Mobile menu */}
        <div className="md:hidden">
          <MobileSidebar />
        </div>

        <div>
          
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-600 hover:text-[#D4AF37] hover:bg-gray-100">
            <Bell className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-black shadow-lg">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {admin?.name || 'Admin'}
              </span>
              <span className="text-xs text-gray-500">
                {admin?.email}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
