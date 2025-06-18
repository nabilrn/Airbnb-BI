'use client';

import { Calendar, MapPin, TrendingUp, Users, BarChart3, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
  const pathname = usePathname();
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Airbnb Analytics</h1>
              <p className="text-sm text-gray-600">Business Intelligence Dashboard</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <Link 
            href="/dashboard"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:shadow-md ${
              pathname === '/dashboard' 
                ? 'bg-gray-100 border-2 border-gray-200' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Overview</span>
          </Link>
          
          <Link 
            href="/dashboard/price-location"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:shadow-md ${
              pathname === '/dashboard/price-location' 
                ? 'bg-red-100 border-2 border-red-200' 
                : 'bg-red-50 hover:bg-red-100'
            }`}
          >
            <MapPin className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">Harga & Lokasi</span>
          </Link>
          
          <Link 
            href="/dashboard/availability-performance"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:shadow-md ${
              pathname === '/dashboard/availability-performance' 
                ? 'bg-blue-100 border-2 border-blue-200' 
                : 'bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Ketersediaan & Performa</span>
          </Link>
          
          <Link 
            href="/dashboard/review-trends"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:shadow-md ${
              pathname === '/dashboard/review-trends' 
                ? 'bg-green-100 border-2 border-green-200' 
                : 'bg-green-50 hover:bg-green-100'
            }`}
          >
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Review & Tren</span>
          </Link>
          
          <Link 
            href="/dashboard/host-listing"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:shadow-md ${
              pathname === '/dashboard/host-listing' 
                ? 'bg-purple-100 border-2 border-purple-200' 
                : 'bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <Users className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">Host & Listing</span>
          </Link>
          
          <Link 
            href="/dashboard/price-prediction"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:shadow-md ${
              pathname === '/dashboard/price-prediction' 
                ? 'bg-blue-100 border-2 border-blue-200' 
                : 'bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <Bot className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">ML Prediction</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
