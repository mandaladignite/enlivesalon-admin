'use client'

import { 
  LayoutDashboard, 
  Utensils, 
  BookUser, 
  BarChart2,
  Settings,
  FileText,
  Bot,
  Home,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
  Image as ImageIcon,
  Scissors,
  Sparkles,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSystemOpen, setIsSystemOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Bookings', href: '/admin/bookings', icon: <Utensils size={18} /> },
    { name: 'Enquiries', href: '/admin/enquiries', icon: <MessageSquare size={18} /> },
    { name: 'Stylists', href: '/admin/stylists', icon: <Scissors size={18} /> },
    { name: 'Services', href: '/admin/services', icon: <Sparkles size={18} /> },
    { name: 'Gallery', href: '/admin/gallery', icon: <ImageIcon size={18} /> },
    { name: 'Memberships', href: '/admin/memberships', icon: <BarChart2 size={18} /> },
    { name: 'Contacts', href: '/admin/contacts', icon: <BarChart2 size={18} /> },
  ]

  const systemItems = [
    { name: 'AI Training', href: '/admin/system/ai-training', icon: <Bot size={18} /> },
    { name: 'Brand Guidelines', href: '/admin/system/brand-guidelines', icon: <FileText size={18} /> },
    { name: 'Onboarding', href: '/admin/system/onboarding', icon: <Home size={18} /> },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[#D4AF37] hover:text-white focus:outline-none md:hidden"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/70"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-[#0E0E0E] shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/20">
              <h2 className="text-xl font-bold text-[#D4AF37] font-playfair">
                Enlive Admin
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-[#D4AF37]"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                        pathname === item.href 
                          ? 'bg-[#D4AF37] text-black shadow-md'
                          : 'text-gray-300 hover:bg-[#1A1A1A] hover:text-[#D4AF37]'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                ))}

                {/* System Dropdown */}
                <li>
                  <button
                    onClick={() => setIsSystemOpen(!isSystemOpen)}
                    className={`flex items-center justify-between w-full p-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/admin/system')
                        ? 'bg-[#1A1A1A] text-[#D4AF37]'
                        : 'text-gray-300 hover:bg-[#1A1A1A] hover:text-[#D4AF37]'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3"><Settings size={18} /></span>
                      System
                    </div>
                    {isSystemOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {isSystemOpen && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {systemItems.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center p-2 rounded-lg text-sm font-medium transition-colors ${
                              pathname === item.href
                                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                                : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-[#D4AF37]'
                            }`}
                          >
                            <span className="mr-3">{item.icon}</span>
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
