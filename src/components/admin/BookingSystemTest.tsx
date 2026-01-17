'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  RefreshCw,
  Calendar,
  Clock,
  User,
  Settings
} from 'lucide-react';
import { appointmentAPI, serviceAPI, stylistAPI } from '@/lib/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

export default function BookingSystemTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const tests = [
    {
      name: 'API Connection Test',
      test: async () => {
        const response = await appointmentAPI.getAllAppointments({ limit: 1 });
        return response.success ? 'API connection successful' : 'API connection failed';
      }
    },
    {
      name: 'Services API Test',
      test: async () => {
        const response = await serviceAPI.getAll();
        return response.data && response.data.length > 0 
          ? `Found ${response.data.length} services` 
          : 'No services found';
      }
    },
    {
      name: 'Stylists API Test',
      test: async () => {
        const response = await stylistAPI.getAll();
        return response.data && response.data.length > 0 
          ? `Found ${response.data.length} stylists` 
          : 'No stylists found';
      }
    },
    {
      name: 'Appointments API Test',
      test: async () => {
        const response = await appointmentAPI.getAllAppointments({ limit: 10 });
        return response.data ? `Found ${response.data.appointments?.length || 0} appointments` : 'No appointments found';
      }
    },
    {
      name: 'Time Slots API Test',
      test: async () => {
        // This test requires a valid stylist ID, so we'll make it conditional
        const stylistsResponse = await stylistAPI.getAll();
        if (stylistsResponse.data && stylistsResponse.data.length > 0) {
          const stylistId = stylistsResponse.data[0]._id;
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const response = await appointmentAPI.getAvailableTimeSlots(stylistId, tomorrow.toISOString().split('T')[0]);
          return response.data ? 'Time slots API working' : 'Time slots API failed';
        }
        return 'No stylists available for time slots test';
      }
    },
    {
      name: 'Authentication Test',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        return token ? 'Authentication token found' : 'No authentication token';
      }
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallStatus('pending');

    const results: TestResult[] = [];

    for (const test of tests) {
      const startTime = Date.now();
      
      try {
        setTestResults([...results, { name: test.name, status: 'pending', message: 'Running...' }]);
        
        const message = await test.test();
        const duration = Date.now() - startTime;
        
        results.push({
          name: test.name,
          status: 'success',
          message,
          duration
        });
        
      } catch (error: any) {
        const duration = Date.now() - startTime;
        results.push({
          name: test.name,
          status: 'error',
          message: error.message || 'Test failed',
          duration
        });
      }
      
      setTestResults([...results]);
    }

    const hasErrors = results.some(result => result.status === 'error');
    setOverallStatus(hasErrors ? 'error' : 'success');
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking System Test</h2>
          <p className="text-gray-600">Test the integration between frontend and backend booking systems</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>
      </div>

      {/* Overall Status */}
      {testResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-4 rounded-lg border ${getStatusColor(overallStatus)}`}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(overallStatus)}
            <div>
              <h3 className="font-semibold">
                {overallStatus === 'success' ? 'All Tests Passed!' : 
                 overallStatus === 'error' ? 'Some Tests Failed' : 'Tests Running...'}
              </h3>
              <p className="text-sm">
                {overallStatus === 'success' ? 'Your booking system is working correctly.' :
                 overallStatus === 'error' ? 'Please check the failed tests below.' :
                 'Running system tests...'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <motion.div
            key={result.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <h4 className="font-medium">{result.name}</h4>
                  <p className="text-sm">{result.message}</p>
                </div>
              </div>
              {result.duration && (
                <div className="text-sm text-gray-500">
                  {result.duration}ms
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="font-medium text-gray-900">API Base URL</div>
              <div className="text-sm text-gray-600">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="font-medium text-gray-900">Environment</div>
              <div className="text-sm text-gray-600">{process.env.NODE_ENV || 'development'}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="font-medium text-gray-900">Authentication</div>
              <div className="text-sm text-gray-600">
                {localStorage.getItem('accessToken') ? 'Logged In' : 'Not Logged In'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="font-medium text-gray-900">Last Test Run</div>
              <div className="text-sm text-gray-600">
                {testResults.length > 0 ? new Date().toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Troubleshooting Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-blue-50 p-6 rounded-xl border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Troubleshooting Guide</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>API Connection Failed:</strong> Check if the backend server is running on the correct port.
          </div>
          <div>
            <strong>Authentication Failed:</strong> Make sure you're logged in and have a valid token.
          </div>
          <div>
            <strong>No Data Found:</strong> Ensure the database has been seeded with sample data.
          </div>
          <div>
            <strong>Time Slots Failed:</strong> Verify that stylists are available and have working hours set.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
