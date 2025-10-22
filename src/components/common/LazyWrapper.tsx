"use client";

import { Suspense, lazy, ComponentType } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { motion } from "framer-motion";

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function LazyWrapper({ 
  children, 
  fallback, 
  className = "",
  delay = 0 
}: LazyWrapperProps) {
  const defaultFallback = (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay,
          ease: "easeOut" 
        }}
        className={className}
      >
        {children}
      </motion.div>
    </Suspense>
  );
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner size="lg" />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Utility function to create lazy components
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapperComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner size="lg" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
