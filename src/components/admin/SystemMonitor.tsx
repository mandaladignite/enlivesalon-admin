/**
 * System monitoring dashboard component
 */

import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SystemStatus {
  status: 'healthy' | 'unhealthy' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      result?: any;
      error?: string;
      timestamp: string;
    };
  };
}

interface SystemMonitorProps {
  className?: string;
  refreshInterval?: number;
}

export default function SystemMonitor({ 
  className = '', 
  refreshInterval = 30000 
}: SystemMonitorProps) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/health');
      const data = await response.json();
      
      setStatus(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to fetch system status');
      console.error('System status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    const interval = setInterval(fetchSystemStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !status) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">System Status Error</h3>
        </div>
        <p className="text-sm text-gray-600 mt-2">{error}</p>
        <button
          onClick={fetchSystemStatus}
          className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Server className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.status)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status.status)}`}>
              {status.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        {lastRefresh && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Uptime</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatUptime(status.uptime)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Environment</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
              {status.environment}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Server className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Version</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              v{status.version}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Service Checks</h4>
          <div className="space-y-3">
            {Object.entries(status.checks).map(([name, check]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {getStatusIcon(check.status)}
                  <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                    {name.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(check.status)}`}>
                    {check.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchSystemStatus}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact system status indicator
 */
interface SystemStatusIndicatorProps {
  className?: string;
}

export function SystemStatusIndicator({ className = '' }: SystemStatusIndicatorProps) {
  const [status, setStatus] = useState<'healthy' | 'unhealthy' | 'error' | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setStatus(data.status);
      } catch (err) {
        setStatus('error');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className={`flex items-center ${className}`}>
      {getStatusIcon(status)}
      <span className="ml-1 text-sm font-medium">
        System {status === 'healthy' ? 'Online' : 'Issues'}
      </span>
    </div>
  );
}
