"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, MapPin, TrendingUp, AlertCircle } from "lucide-react";
import { InteractivePriceMap } from "@/components/visualizations/interactive-price-map";

interface PriceLocationData {
  neighbourhoodPrices: Array<{
    neighbourhood: string;
    neighbourhood_group: string;
    avgPrice: number;
    listings: number;
    latitude: number;
    longitude: number;
  }>;
  priceDistribution: Array<{ range: string; count: number; percentage: number }>;
  avgPriceByArea: Array<{ area: string; avgPrice: number; listingCount: number }>;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export function PriceLocationDashboard() {
  const [data, setData] = useState<PriceLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/price-location');
        
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
        console.error('Error fetching price location data:', error);
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
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Price & Location Analytics</h2>
              <p className="text-sm text-gray-600">Interactive visualization of pricing across neighborhoods</p>
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
        
        <div className="bg-white p-6 rounded-lg border animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
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
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Price & Location Analytics</h2>
              <p className="text-sm text-gray-600">Interactive visualization of pricing across neighborhoods</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-center text-red-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Price Data</h3>
            <p>Failed to fetch price location data from database</p>
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
  const avgPrice = Math.round(
    data.avgPriceByArea.reduce((sum, item) => sum + item.avgPrice, 0) / data.avgPriceByArea.length
  );
  const highestPrice = Math.max(...data.avgPriceByArea.map(item => item.avgPrice));
  const lowestPrice = Math.min(...data.avgPriceByArea.map(item => item.avgPrice));
  const totalListings = data.avgPriceByArea.reduce((sum, item) => sum + item.listingCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Price & Location Analytics</h2>
            <p className="text-sm text-gray-600">Real-time pricing data across neighborhoods from database</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-gray-900">${avgPrice}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Highest Price</p>
              <p className="text-2xl font-bold text-gray-900">${highestPrice}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lowest Price</p>
              <p className="text-2xl font-bold text-gray-900">${lowestPrice}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{totalListings.toLocaleString()}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Interactive Price Map */}
      <InteractivePriceMap data={data.neighbourhoodPrices} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Price Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.priceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.priceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Listings']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total: {data.priceDistribution.reduce((sum, item) => sum + item.count, 0).toLocaleString()} listings
            </p>
          </div>
        </div>

        {/* Average Price by Area */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Average Price by Area</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.avgPriceByArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="area" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'avgPrice') return [`$${value}`, 'Avg Price'];
                    if (name === 'listingCount') return [value.toLocaleString(), 'Listings'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Area: ${label}`}
                />
                <Bar 
                  dataKey="avgPrice" 
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="avgPrice"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Area Details Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Area Price Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Detailed breakdown by area from database
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listing Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price Range
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.avgPriceByArea
                .sort((a, b) => b.avgPrice - a.avgPrice)
                .map((area, index) => (
                <tr key={area.area} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-red-500' : 
                        index === 1 ? 'bg-orange-500' : 
                        index === 2 ? 'bg-yellow-500' : 
                        index === 3 ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {area.area}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      ${area.avgPrice}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {area.listingCount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        area.avgPrice >= 150 ? 'bg-red-100 text-red-800' :
                        area.avgPrice >= 100 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {area.avgPrice >= 150 ? 'Premium' :
                         area.avgPrice >= 100 ? 'Mid-Range' : 'Budget'}
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
            <p className="text-2xl font-bold text-red-500">
              {data.neighbourhoodPrices.length}
            </p>
            <p className="text-sm text-gray-600">Neighbourhoods Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {data.avgPriceByArea.length}
            </p>
            <p className="text-sm text-gray-600">Areas Covered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {data.priceDistribution.length}
            </p>
            <p className="text-sm text-gray-600">Price Ranges</p>
          </div>
        </div>
      </div>
    </div>
  );
}