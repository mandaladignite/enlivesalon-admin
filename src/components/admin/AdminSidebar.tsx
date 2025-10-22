'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Scissors,
  Sparkles,
  Image as ImageIcon,
  MessageSquare,
  Package,
  Star,
} from 'lucide-react'
import { useState } from 'react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isSystemOpen, setIsSystemOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Bookings', href: '/bookings', icon: <Utensils size={18} /> },
    { name: 'Enquiries', href: '/enquiries', icon: <MessageSquare size={18} /> },
    { name: 'Reviews', href: '/reviews', icon: <Star size={18} /> },
    { name: 'Stylists', href: '/stylists', icon: <Scissors size={18} /> },
    { name: 'Services', href: '/services', icon: <Sparkles size={18} /> },
    { name: 'Gallery', href: '/gallery', icon: <ImageIcon size={18} /> },
    { name: 'Memberships', href: '/memberships', icon: <BarChart2 size={18} /> },
  ]

  const systemItems = [
    { name: 'AI Training', href: '/admin/system/ai-training', icon: <Bot size={18} /> },
    { name: 'Brand Guidelines', href: '/admin/system/brand-guidelines', icon: <FileText size={18} /> },
    { name: 'Onboarding', href: '/admin/system/onboarding', icon: <Home size={18} /> },
  ]

  return (
    <div className="w-64 bg-[#ffffff] border-r border-[#D4AF37]/20 p-4 hidden md:block">
      {/* Logo/Title */}
      <div className="mb-8 p-2">
        <img src="logo.png" alt="" className='h-8' />
      </div>

      <nav>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
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
        </ul>
      </nav>
    </div>
  )
}
