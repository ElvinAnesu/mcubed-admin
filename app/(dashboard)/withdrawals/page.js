"use client";

import { useState, useEffect } from 'react';
import { 
  getWithdrawalRequests, 
  getWithdrawalRequestsByStatus, 
  updateWithdrawalStatus,
  getWithdrawalStats
} from '../../lib/services/withdrawalService';

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingAmount: 0,
    completedAmount: 0
  });

  // Normalize status values for consistency
  const normalizeStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status.toLowerCase();
    
    // Map to proper case format
    if (statusLower === 'pending') return 'Pending';
    if (statusLower === 'processing') return 'Processing';
    if (statusLower === 'completed') return 'Completed';
    if (statusLower === 'rejected') return 'Rejected';
    if (statusLower === 'processed') return 'Processed';
    
    // Default case - return original with first letter capitalized
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      let response;
      
      if (statusFilter === 'All') {
        response = await getWithdrawalRequests();
      } else {
        response = await getWithdrawalRequestsByStatus(statusFilter);
      }
      
      if (response.error) {
        setError(response.error);
        setWithdrawals([]);
      } else {
        // Normalize all status values
        const normalizedData = response.data?.map(item => ({
          ...item,
          status: normalizeStatus(item.status)
        })) || [];
        
        setWithdrawals(normalizedData);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setError('Failed to load withdrawal requests');
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      const response = await getWithdrawalStats();
      
      if (response.error) {
        console.error('Error fetching stats:', response.error);
      } else {
        console.log('Stats received:', response.data);
        setStats(response.data || {
          totalCount: 0,
          pendingAmount: 0,
          completedAmount: 0
        });
      }
    } catch (error) {
      console.error('Error fetching withdrawal stats:', error);
    }
  };

  const handleAction = async (id, action) => {
    if (!id) {
      alert('Invalid withdrawal ID');
      return;
    }
    
    let status;
    if (action === 'Approve') {
      status = 'Completed';
    } else if (action === 'Reject') {
      status = 'Rejected';
    } else if (action === 'Process') {
      status = 'Processing';
    }
    
    if (!status) {
      alert('Invalid action');
      return;
    }
    
    try {
      const response = await updateWithdrawalStatus(id, {
        status,
        processed_by: 'current-user-id', // In a real app, get this from auth context
        notes: `${action}d by admin on ${new Date().toISOString()}`
      });
      
      if (response.error) {
        alert(`Error: ${response.error}`);
      } else {
        alert(`Successfully ${action.toLowerCase()}d withdrawal request`);
        // Refresh data
        fetchWithdrawals();
        fetchStats();
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing withdrawal:`, error);
      alert(`Error ${action.toLowerCase()}ing withdrawal request`);
    }
  };

  const handleMarkAsProcessed = async (id) => {
    if (!id) {
      alert('Invalid withdrawal ID');
      return;
    }
    
    try {
      const response = await updateWithdrawalStatus(id, {
        status: 'Processed',
        processed_by: 'current-user-id', // In a real app, get this from auth context
        notes: `Marked as processed by admin on ${new Date().toISOString()}`
      });
      
      if (response.error) {
        alert(`Error: ${response.error}`);
      } else {
        alert(`Successfully marked withdrawal request as processed`);
        // Refresh data
        fetchWithdrawals();
        fetchStats();
      }
    } catch (error) {
      console.error(`Error marking withdrawal as processed:`, error);
      alert(`Error marking withdrawal as processed`);
    }
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date';
    }
  };

  // Format amount to currency
  const formatCurrency = (amount) => {
    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount)) return '$0.00';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(numAmount);
    } catch (e) {
      console.error('Currency formatting error:', e);
      return '$0.00';
    }
  };

  // Get user name from withdrawal
  const getUserName = (withdrawal) => {
    if (!withdrawal) return 'Unknown User';
    
    if (withdrawal.user && withdrawal.user.full_name) {
      return withdrawal.user.full_name;
    }
    
    // Safely get user ID
    const userId = withdrawal.user_id;
    if (!userId) return 'Unknown User';
    
    try {
      return `User ID: ${userId.substring(0, 8)}...`;
    } catch (e) {
      return `User ID: ${userId}`;
    }
  };

  // Get status class for badge styling
  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const normalizedStatus = normalizeStatus(status);
    
    switch(normalizedStatus) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Processed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
        <p className="text-gray-600">Manage withdrawal requests from users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Total Requests</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalCount}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Processing Amount</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {formatCurrency(stats.pendingAmount)}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Completed Amount</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {formatCurrency(stats.completedAmount)}
          </dd>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-end">
        <select
          className="block rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
          <option value="Processed">Processed</option>
        </select>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{typeof error === 'string' ? error : 'An error occurred while fetching data'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Withdrawals Table */
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Request Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {withdrawals && withdrawals.length > 0 ? (
                  withdrawals.map((withdrawal) => {
                    // Get normalized status
                    const status = normalizeStatus(withdrawal?.status);
                    
                    return (
                      <tr key={withdrawal?.id || Math.random()}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {getUserName(withdrawal)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-medium">
                          {formatCurrency(withdrawal?.amount)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {formatDate(withdrawal?.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusClass(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          {status === 'Pending' && (
                            <>
                              <button 
                                className="text-blue-600 hover:text-blue-900 mr-4"
                                onClick={() => handleAction(withdrawal.id, 'Process')}
                              >
                                Process
                              </button>
                              <button 
                                className="text-green-600 hover:text-green-900 mr-4"
                                onClick={() => handleAction(withdrawal.id, 'Approve')}
                              >
                                Approve
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleAction(withdrawal.id, 'Reject')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {status !== 'Pending' && status !== 'Processed' && (
                            <button 
                              className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm"
                              onClick={() => handleMarkAsProcessed(withdrawal.id)}
                            >
                              Mark as Processed
                            </button>
                          )}
                          {status === 'Processed' && (
                            <span className="text-gray-500">Fully processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      {statusFilter !== 'All' ? `No ${statusFilter.toLowerCase()} withdrawal requests found` : 'No withdrawal requests found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 