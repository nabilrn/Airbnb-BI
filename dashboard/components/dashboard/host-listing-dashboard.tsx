"use client";

import { useEffect, useState } from "react";
import {  PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Home, Crown, TrendingUp } from "lucide-react";

interface HostListingData {
  hostDistribution: Array<{ hostType: string; count: number; percentage: number }>;
  topHosts: Array<{ name: string; listings: number; totalReviews: number; revenue: number }>;
  listingsByHost: Array<{ range: string; hosts: number; totalListings: number }>;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function HostListingDashboard() {
  const [data, setData] = useState<HostListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/host-listing');
        
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
        console.error('Error fetching host listing data:', error);
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
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Host & Listing Analytics</h2>
              <p className="text-sm text-gray-600">Distribution and activity analysis</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Host & Listing Analytics</h2>
              <p className="text-sm text-gray-600">Distribution and activity analysis</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-center text-red-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Host Data</h3>
            <p>Failed to fetch host listing data from database</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Host & Listing Analytics</h2>
            <p className="text-sm text-gray-600">Distribution and activity analysis from database</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Total Host Types</p>
              <p className="text-xl font-bold text-gray-900">{data.hostDistribution.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Hosts</p>
              <p className="text-xl font-bold text-gray-900">
                {data.hostDistribution.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Top Hosts</p>
              <p className="text-xl font-bold text-gray-900">{data.topHosts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Listing Ranges</p>
              <p className="text-xl font-bold text-gray-900">{data.listingsByHost.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Host Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Host Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.hostDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ hostType, percentage }) => `${hostType}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.hostDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Hosts']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {data.hostDistribution.map((item, index) => (
                <div key={item.hostType} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-600">{item.hostType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Listings by Host Range
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Listings by Host Range</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.listingsByHost} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="range" 
                  width={100}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(), 
                    name === 'totalListings' ? 'Total Listings' : 'Hosts'
                  ]}
                />
                <Bar dataKey="hosts" fill="#3b82f6" name="hosts" />
                <Bar dataKey="totalListings" fill="#10b981" name="totalListings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Top Hosts Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Top Hosts by Listings</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Showing {data.topHosts.length} hosts from database
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Reviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topHosts.map((host, index) => (
                  <tr key={host.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {host.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{host.listings}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{host.totalReviews.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${host.revenue.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">
              {data.hostDistribution.find(item => item.hostType === 'Single Listing')?.percentage || 0}%
            </p>
            <p className="text-sm text-gray-600">Single Listing Hosts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {data.topHosts[0]?.listings || 0}
            </p>
            <p className="text-sm text-gray-600">Max Listings per Host</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {data.listingsByHost.reduce((sum, item) => sum + item.totalListings, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Listings Analyzed</p>
          </div>
        </div>
      </div>
    </div>
  );
}