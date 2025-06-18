"use client";

import { useEffect, useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, PieChart, Pie, Cell } from "recharts";
import { MessageSquare, TrendingUp, Calendar, AlertCircle, Star } from "lucide-react";

interface ReviewTrendData {
  monthlyReviews: Array<{ month: string; reviews: number }>;
  priceVsReviews: Array<{ price: number; reviews: number; neighbourhood: string }>;
  reviewDistribution: Array<{ range: string; count: number; percentage: number }>;
}

const COLORS = ['#ef4444', '#f97316', '#16a34a', '#3b82f6', '#8b5cf6'];

export function ReviewTrendDashboard() {
  const [data, setData] = useState<ReviewTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/review-trends');
        
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
        console.error('Error fetching review trend data:', error);
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
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review Trends Analytics</h2>
              <p className="text-sm text-gray-600">Monthly review patterns and correlations</p>
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
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review Trends Analytics</h2>
              <p className="text-sm text-gray-600">Monthly review patterns and correlations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-center text-red-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Review Data</h3>
            <p>Failed to fetch review trends data from database</p>
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

  // Check if data has meaningful content
  const hasValidData = data.monthlyReviews.some(item => item.reviews > 0) ||
                      data.priceVsReviews.some(item => item.reviews > 0) ||
                      data.reviewDistribution.some(item => item.count > 1);

  // Calculate metrics from real data with safe defaults
  const totalReviews = data.monthlyReviews.reduce((sum, item) => sum + (item.reviews || 0), 0);
  const avgMonthlyReviews = data.monthlyReviews.length > 0 ? 
    Math.round(totalReviews / data.monthlyReviews.length) : 0;
  
  const highestMonth = data.monthlyReviews.length > 0 ? 
    data.monthlyReviews.reduce((prev, current) => 
      (prev.reviews || 0) > (current.reviews || 0) ? prev : current
    ) : { month: 'N/A', reviews: 0 };
  
  const totalListingsWithReviews = data.reviewDistribution.reduce((sum, item) => sum + (item.count || 0), 0);

  // Calculate review growth (last vs first month)
  const reviewGrowth = data.monthlyReviews.length > 1 && data.monthlyReviews[0].reviews > 0 ? 
    ((data.monthlyReviews[data.monthlyReviews.length - 1].reviews - data.monthlyReviews[0].reviews) / 
     data.monthlyReviews[0].reviews * 100) : 0;

  if (!hasValidData) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review Trends Analytics</h2>
              <p className="text-sm text-gray-600">Monthly review patterns and correlations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-center text-yellow-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Limited Review Data</h3>
            <p>The database contains limited review data for analysis</p>
            <p className="text-sm text-gray-500 mt-2">
              This may be due to data structure or recent database setup
            </p>
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
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review Trends Analytics</h2>
            <p className="text-sm text-gray-600">Real-time review patterns and correlations from database</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{totalReviews.toLocaleString()}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Monthly</p>
              <p className="text-2xl font-bold text-gray-900">{avgMonthlyReviews.toLocaleString()}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>
        {/* <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className={`text-2xl font-bold ${reviewGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reviewGrowth > 0 ? '+' : ''}{reviewGrowth.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${reviewGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div> */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peak Month</p>
              <p className="text-2xl font-bold text-gray-900">{highestMonth.month}</p>
              <p className="text-xs text-gray-500">{highestMonth.reviews.toLocaleString()} reviews</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Review Trends */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Review Trends</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyReviews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Reviews']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="reviews" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Total Reviews"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Review Distribution */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Review Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.reviewDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.reviewDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Listings']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Total: {totalListingsWithReviews.toLocaleString()} listings analyzed
          </div>
        </div>

        {/* Price vs Reviews Correlation */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Price vs Reviews Correlation by Area</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={data.priceVsReviews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="price" 
                    name="Price" 
                    unit="$"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    dataKey="reviews" 
                    name="Reviews"
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'reviews') return [value.toLocaleString(), 'Total Reviews'];
                      if (name === 'price') return [`$${value}`, 'Avg Price'];
                      return [value, name];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `${payload[0].payload.neighbourhood}`;
                      }
                      return label;
                    }}
                  />
                  <Scatter dataKey="reviews" fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Correlation Insights</h4>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900">Market Trends</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    Analysis shows relationship between pricing and guest engagement 
                    across {data.priceVsReviews.length} neighborhoods.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-900">Top Performers</h5>
                  <p className="text-sm text-green-700 mt-1">
                    {data.priceVsReviews.length > 0 && data.priceVsReviews[0].neighbourhood !== 'Database Error' &&
                      `${data.priceVsReviews[0].neighbourhood} leads with ${data.priceVsReviews[0].reviews.toLocaleString()} reviews`
                    }
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h5 className="font-medium text-purple-900">Data Coverage</h5>
                  <p className="text-sm text-purple-700 mt-1">
                    Analysis covers {data.priceVsReviews.length} areas with total of {totalReviews.toLocaleString()} reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary from Database</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {data.monthlyReviews.length}
            </p>
            <p className="text-sm text-gray-600">Months Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {data.priceVsReviews.length}
            </p>
            <p className="text-sm text-gray-600">Areas Covered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">
              {data.reviewDistribution.length}
            </p>
            <p className="text-sm text-gray-600">Review Categories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">
              {totalListingsWithReviews.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Listings</p>
          </div>
        </div>
      </div>
    </div>
  );
}