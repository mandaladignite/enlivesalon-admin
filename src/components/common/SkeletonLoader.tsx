"use client";

import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
}

export default function SkeletonLoader({ 
  className = "", 
  lines = 1, 
  height = "h-4", 
  width = "w-full" 
}: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            delay: index * 0.1 
          }}
          className={`bg-gray-200 rounded ${height} ${width} ${
            index < lines - 1 ? "mb-2" : ""
          }`}
        />
      ))}
    </div>
  );
}

// Pre-built skeleton components for common use cases
export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <SkeletonLoader height="h-8" width="w-3/4" className="mb-4" />
      <SkeletonLoader height="h-4" width="w-full" lines={3} className="mb-4" />
      <div className="flex justify-between items-center">
        <SkeletonLoader height="h-6" width="w-20" />
        <SkeletonLoader height="h-8" width="w-24" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <SkeletonLoader height="h-48" width="w-full" />
      <div className="p-4">
        <SkeletonLoader height="h-6" width="w-3/4" className="mb-2" />
        <SkeletonLoader height="h-4" width="w-full" lines={2} className="mb-4" />
        <div className="flex justify-between items-center">
          <SkeletonLoader height="h-6" width="w-16" />
          <SkeletonLoader height="h-8" width="w-20" />
        </div>
      </div>
    </div>
  );
}

export function MembershipCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-100">
      <SkeletonLoader height="h-8" width="w-1/2" className="mb-4" />
      <SkeletonLoader height="h-6" width="w-1/3" className="mb-6" />
      <SkeletonLoader height="h-4" width="w-full" lines={4} className="mb-6" />
      <div className="flex justify-between items-center mb-6">
        <SkeletonLoader height="h-8" width="w-24" />
        <SkeletonLoader height="h-6" width="w-16" />
      </div>
      <SkeletonLoader height="h-12" width="w-full" />
    </div>
  );
}
