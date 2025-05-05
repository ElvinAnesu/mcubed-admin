"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Users', path: '/users' },
    { name: 'Withdrawal Requests', path: '/withdrawals' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white w-64 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={`block py-2 px-4 rounded transition-colors ${
                  pathname === item.path 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-700">
        <Link 
          href="/login" 
          className="block py-2 px-4 text-red-400 hover:bg-gray-700 rounded transition-colors"
        >
          Logout
        </Link>
      </div>
    </div>
  );
} 