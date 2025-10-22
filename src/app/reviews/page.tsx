'use client'

import { Suspense } from 'react'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'
import ReviewManagement from '@/components/admin/ReviewManagement'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AdminReviewsPage() {
  return (
    <AdminRouteGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading review management..." />
        </div>
      }>
        <ReviewManagement />
      </Suspense>
    </AdminRouteGuard>
  )
}
