import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Salon Admin Dashboard',
  description: 'Admin dashboard for salon management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminAuthProvider>
          <AdminRouteGuard>
            {children}
          </AdminRouteGuard>
        </AdminAuthProvider>
      </body>
    </html>
  )
}