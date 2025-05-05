"use client";

import { useState, useEffect } from 'react';
import { getTotalDeposits, getProcessingWithdrawalsCount, getRecentWithdrawals } from '@/app/lib/services/transactionService';
import { getUsersCount } from '@/app/lib/services/userService';
import { formatCurrency, formatDate } from '@/app/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { id: 1, name: 'Total Users', value: '0', icon: '👤', change: '0%', changeType: 'neutral' },
    { id: 2, name: 'Active Users', value: '0', icon: '✅', change: '0%', changeType: 'neutral' },
    { id: 3, name: 'Pending Withdrawals', value: '0', icon: '💰', change: '0%', changeType: 'neutral' },
    { id: 4, name: 'Total Deposits', value: '$0', icon: '💵', change: '0%', changeType: 'neutral' },
  ]);
  
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentWithdrawals();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch total deposits amount
      const depositsResponse = await getTotalDeposits();
      
      // Fetch processing withdrawals count
      const withdrawalsResponse = await getProcessingWithdrawalsCount();
      
      // Fetch total users count
      const usersResponse = await getUsersCount();
      
      // Update stats with real data
      setStats(prevStats => 
        prevStats.map(stat => {
          if (stat.name === 'Total Deposits') {
            const totalAmount = depositsResponse.data?.totalAmount || 0;
            return {
              ...stat,
              value: formatCurrency(totalAmount),
              // For now, keep the change percentage as is
            };
          }
          
          if (stat.name === 'Pending Withdrawals') {
            const processingCount = withdrawalsResponse.data?.processingCount || 0;
            return {
              ...stat,
              value: String(processingCount),
              // For now, keep the change percentage as is
            };
          }
          
          if (stat.name === 'Total Users' || stat.name === 'Active Users') {
            const totalUsers = usersResponse.data?.totalUsers || 0;
            // Format the number with commas
            const formattedCount = new Intl.NumberFormat('en-US').format(totalUsers);
            return {
              ...stat,
              value: formattedCount,
              // For now, keep the change percentage as is
            };
          }
          
          // Return other stats unchanged
          return stat;
        })
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentWithdrawals = async () => {
    setWithdrawalsLoading(true);
    try {
      const response = await getRecentWithdrawals(5); // Get 5 most recent withdrawals
      
      if (response.error) {
        console.error('Error fetching recent withdrawals:', response.error);
      } else {
        console.log('Recent withdrawals:', response.data);
        setRecentWithdrawals(response.data || []);
      }
    } catch (error) {
      console.error('Error in fetchRecentWithdrawals:', error);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Convert to proper case format
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Get status class for badge styling
  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    status = status.toLowerCase();
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // Loading skeletons for stats
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow animate-pulse">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-gray-200 p-3 h-12 w-12"></div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="mt-4 h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          stats.map((stat) => (
            <div key={stat.id} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-blue-100 p-3 text-blue-600">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className={`mt-4 text-sm ${
                stat.changeType === 'increase' ? 'text-green-600' : 
                stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.change} {stat.changeType === 'increase' ? '↑' : stat.changeType === 'decrease' ? '↓' : ''}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Withdrawal Requests */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Withdrawal Requests</h3>
        </div>
        
        {withdrawalsLoading ? (
          // Loading state
          <div className="px-4 py-5 sm:p-6">
            <div className="animate-pulse space-y-4">
              {Array(5).fill(0).map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        ) : recentWithdrawals.length > 0 ? (
          // Withdrawals list
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {recentWithdrawals.map((withdrawal) => (
                <li key={withdrawal.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600">
                          Withdrawal Request
                        </p>
                        <p className="ml-1 text-sm text-gray-500">
                          by {getUserName(withdrawal)}
                        </p>
                      </div>
                      <div className="flex items-center mt-1">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(withdrawal.amount)}
                        </p>
                        <span className={`ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusClass(withdrawal.status)}`}>
                          {formatStatus(withdrawal.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(withdrawal.created_at)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          // No withdrawals
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 text-center text-gray-500">
            No recent withdrawal requests found
          </div>
        )}
        
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          <a href="/withdrawals" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View all withdrawal requests <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
} 