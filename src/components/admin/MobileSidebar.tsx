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
  MessageSquare,
  Gift,
  Star,
  Layout,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSystemOpen, setIsSystemOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Hero Sections', href: '/hero', icon: <Layout size={18} /> },
    { name: 'Bookings', href: '/bookings', icon: <Utensils size={18} /> },
    { name: 'Enquiries', href: '/enquiries', icon: <MessageSquare size={18} /> },
    { name: 'Reviews', href: '/reviews', icon: <Star size={18} /> },
    { name: 'Stylists', href: '/stylists', icon: <Scissors size={18} /> },
    { name: 'Services', href: '/services', icon: <Sparkles size={18} /> },
    { name: 'Gallery', href: '/gallery', icon: <ImageIcon size={18} /> },
    { name: 'Offers', href: '/offers', icon: <Gift size={18} /> },
    { name: 'Memberships', href: '/memberships', icon: <BarChart2 size={18} /> },
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
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-[#ffffff] shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/20">
              <div className="p-2">
                <img src="logo.png" alt="" className='h-8' />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-[#D4AF37]"
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
                          ? 'bg-[#D4AF37] text-white shadow-md'
                          : 'text-black hover:bg-[#1A1A1A] hover:text-[#ffffff]'
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
                        ? 'bg-[#1A1A1A] text-[#ffffff]'
                        : 'text-black hover:bg-[#1A1A1A] hover:text-[#ffffff]'
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
                                ? 'bg-[#D4AF37] text-white shadow-md'
                                : 'text-black hover:bg-[#1A1A1A] hover:text-[#ffffff]'
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
