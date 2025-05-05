"use client";

import { useState } from 'react';

export default function Header({ user = { name: "Admin User" } }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-end px-6">
      <div className="relative">
        <button 
          className="flex items-center space-x-2"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {user.name.charAt(0)}
          </div>
          <span className="text-gray-900 font-medium">{user.name}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <a href="/login" className="block px-4 py-2 text-sm font-medium text-red-600 hover:bg-gray-100">
              Logout
            </a>
          </div>
        )}
      </div>
    </header>
  );
} 