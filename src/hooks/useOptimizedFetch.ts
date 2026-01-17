"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseOptimizedFetchOptions {
  enabled?: boolean;
  retryCount?: number;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; staleTime: number }>();

export function useOptimizedFetch<T>(
  url: string,
  options: UseOptimizedFetchOptions = {}
) {
  const {
    enabled = true,
    retryCount = 3,
    retryDelay = 1000,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
    isStale: false,
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Check cache first
    const cached = cache.get(url);
    const now = Date.now();
    
    if (cached && !forceRefresh) {
      const isStale = now - cached.timestamp > cached.staleTime;
      const isExpired = now - cached.timestamp > cacheTime;
      
      if (!isExpired) {
        setState(prev => ({
          ...prev,
          data: cached.data,
          loading: false,
          error: null,
          isStale,
        }));
        
        // If stale, refetch in background
        if (isStale) {
          fetchData(true);
        }
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update cache
      cache.set(url, {
        data,
        timestamp: now,
        staleTime,
      });

      setState({
        data,
        loading: false,
        error: null,
        isStale: false,
      });

      retryCountRef.current = 0;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }

      const shouldRetry = retryCountRef.current < retryCount;
      
      if (shouldRetry) {
        retryCountRef.current++;
        setTimeout(() => fetchData(forceRefresh), retryDelay * retryCountRef.current);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
      }
    }
  }, [url, enabled, retryCount, retryDelay, staleTime, cacheTime]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (state.isStale) {
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, refetchOnWindowFocus, state.isStale]);

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      fetchData(true);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchData, refetchOnReconnect]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  const invalidate = useCallback(() => {
    cache.delete(url);
    fetchData(true);
  }, [url, fetchData]);

  return {
    ...state,
    refetch,
    invalidate,
  };
}

// Hook for multiple parallel requests
export function useOptimizedFetchMultiple<T>(
  requests: Array<{ url: string; key: string }>,
  options: UseOptimizedFetchOptions = {}
) {
  const [state, setState] = useState<{
    data: Record<string, T | null>;
    loading: Record<string, boolean>;
    errors: Record<string, string | null>;
  }>({
    data: {},
    loading: {},
    errors: {},
  });

  const fetchSingle = useCallback(async (url: string, key: string) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: true },
      errors: { ...prev.errors, [key]: null },
    }));

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setState(prev => ({
        ...prev,
        data: { ...prev.data, [key]: data },
        loading: { ...prev.loading, [key]: false },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, [key]: false },
        errors: { ...prev.errors, [key]: error instanceof Error ? error.message : 'An error occurred' },
      }));
    }
  }, []);

  useEffect(() => {
    if (!options.enabled) return;

    requests.forEach(({ url, key }) => {
      fetchSingle(url, key);
    });
  }, [requests, fetchSingle, options.enabled]);

  return {
    data: state.data,
    loading: state.loading,
    errors: state.errors,
    isLoading: Object.values(state.loading).some(Boolean),
    hasError: Object.values(state.errors).some(Boolean),
  };
}
