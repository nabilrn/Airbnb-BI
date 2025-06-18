"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Star, TrendingUp, Eye, Home, AlertCircle } from "lucide-react";

interface AvailabilityPerformanceData {
  propertyAvailability: Array<{ area: string; availability: number; totalProperties: number }>;
  roomTypeAvailability: Array<{ room_type: string; avgAvailability: number; listings: number }>;
  topRatedListings: Array<{ name: string; reviews: number; neighbourhood: string }>;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function AvailabilityPerformanceDashboard() {
  const [data, setData] = useState<AvailabilityPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/availability-performance');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const apiData = await response.json();
        
        if (apiData.error) {
          throw new Error(apiData.error);
        }
        
        setData(apiData);
        setError(null);
      } catch (error) {
        console.error('Error fetching availability performance data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Availability & Performance Analytics</h2>
              <p className="text-sm text-gray-600">Property availability and performance metrics</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Availability & Performance Analytics</h2>
              <p className="text-sm text-gray-600">Property availability and performance metrics</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-center text-red-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Availability Data</h3>
            <p>Failed to fetch availability performance data from database</p>
            {error && (
              <p className="text-sm text-gray-500 mt-2">Error: {error}</p>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics from real data
  const avgAvailability = Math.round(
    data.propertyAvailability.reduce((sum, item) => sum + item.availability, 0) / 
    data.propertyAvailability.length
  );
  
  const totalProperties = data.propertyAvailability.reduce((sum, item) => sum + item.totalProperties, 0);
  const totalReviews = data.topRatedListings.reduce((sum, item) => sum + item.reviews, 0);
  const avgReviews = Math.round(totalReviews / data.topRatedListings.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Availability & Performance Analytics</h2>
            <p className="text-sm text-gray-600">Real-time property availability and performance metrics</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Availability</p>
              <p className="text-2xl font-bold text-gray-900">{avgAvailability} days</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{totalProperties.toLocaleString()}</p>
            </div>
            <Home className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Listings</p>
              <p className="text-2xl font-bold text-gray-900">{data.topRatedListings.length}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{avgReviews}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Availability by Area */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Property Availability by Area</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.propertyAvailability}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="area" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tickFormatter={(value) => `${value} days`}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} days`, 'Availability']}
                  labelFormatter={(label) => `Area: ${label}`}
                />
                <Bar dataKey="availability" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Type Availability */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Room Type Availability</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.roomTypeAvailability} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${value} days`} />
                <YAxis 
                  type="category" 
                  dataKey="room_type" 
                  width={120}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} days`, 'Avg Availability']}
                />
                <Bar dataKey="avgAvailability" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Availability Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Availability Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.propertyAvailability}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ area, availability }) => `${area}: ${availability}d`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="availability"
                >
                  {data.propertyAvailability.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} days`, 'Availability']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Rated Listings */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Top Listings by Reviews</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Showing {data.topRatedListings.length} listings with highest review counts from database
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listing Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Neighbourhood
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topRatedListings.map((listing, index) => (
                <tr key={`${listing.name}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {listing.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{listing.neighbourhood}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {listing.reviews.toLocaleString()} reviews
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((listing.reviews / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.min(Math.round((listing.reviews / 100) * 100), 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary from Database</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {data.propertyAvailability.length}
            </p>
            <p className="text-sm text-gray-600">Areas Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {data.roomTypeAvailability.length}
            </p>
            <p className="text-sm text-gray-600">Room Types</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">
              {totalReviews.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
}