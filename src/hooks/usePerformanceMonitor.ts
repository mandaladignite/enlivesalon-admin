"use client";

import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export function usePerformanceMonitor() {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              metricsRef.current.fcp = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            metricsRef.current.lcp = entry.startTime;
            break;
          case 'first-input':
            metricsRef.current.fid = (entry as any).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              metricsRef.current.cls = (metricsRef.current.cls || 0) + (entry as any).value;
            }
            break;
        }
      }
    });

    // Observe different entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      observer.observe({ entryTypes: ['paint'] });
    }

    // Monitor TTFB
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metricsRef.current.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const getMetrics = () => metricsRef.current;

  const logMetrics = () => {
    const metrics = getMetrics();
    console.group('🚀 Performance Metrics');
    console.groupEnd();
  };

  const sendMetricsToAnalytics = async (endpoint: string) => {
    const metrics = getMetrics();
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metrics,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  };

  return {
    getMetrics,
    logMetrics,
    sendMetricsToAnalytics,
  };
}

// Hook for monitoring component render performance
export function useRenderPerformance(componentName: string) {
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;

    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStartRef.current;

    if (renderTime > 16) { // More than one frame (16ms at 60fps)
    }

    if (renderCountRef.current > 10) {
    }
  });

  return {
    renderCount: renderCountRef.current,
  };
}

// Hook for monitoring memory usage
export function useMemoryMonitor() {
  useEffect(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryInfo = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };

      if (memoryInfo.usage > 80) {
      }
    }
  }, []);

  const getMemoryInfo = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  };

  return { getMemoryInfo };
}
