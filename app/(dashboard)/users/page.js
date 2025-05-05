"use client";

import { useState, useEffect } from 'react';
import { getAllUsers, getUsersByStatus } from '@/app/lib/services/userService';
import { formatDate } from '@/app/lib/utils';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState(null);

  // Fetch users on component mount and when status filter changes
  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      let response;

      if (statusFilter === 'All') {
        response = await getAllUsers();
      } else {
        response = await getUsersByStatus(statusFilter);
      }

      if (response.error) {
        console.error('Error fetching users:', response.error);
        setError(response.error);
        setUsers([]);
      } else {
        console.log('Fetched users:', response.data);
        setUsers(response.data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      setError('Failed to fetch users. Please try again later.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Get username safely from user object
  const getUserName = (user) => {
    if (!user) return 'Unknown User';
    
    // First try to get the name, then fallback to email
    if (user.name) return user.name;
    if (user.email) {
      // If only email is available, get username part (before @)
      const emailParts = user.email.split('@');
      return emailParts[0];
    }
    
    return `User ID: ${user.id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage your users</p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm font-medium shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <select
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="text-sm text-red-700 mt-2">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-blue-800">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-blue-800">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-blue-800">
                    Joined Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-medium">
                            {getUserName(user).charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{getUserName(user)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email || 'No Email'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {user.created_at ? formatDate(user.created_at) : 'Unknown'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found
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