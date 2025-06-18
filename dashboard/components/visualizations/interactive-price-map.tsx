"use client";

import { useState } from "react";
import { MapPin, DollarSign, Home, TrendingUp, Filter, RotateCcw } from "lucide-react";
import { RealMap } from "./real-map";

interface PriceMapData {
  neighbourhood: string;
  neighbourhood_group: string;
  avgPrice: number;
  listings: number;
  latitude: number;
  longitude: number;
}

interface InteractivePriceMapProps {
  data: PriceMapData[];
}

export function InteractivePriceMap({ data }: InteractivePriceMapProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'listings'>('price');
  const [hoveredPoint, setHoveredPoint] = useState<PriceMapData | null>(null);


  // Filter and sort data
  const filteredData = data
    .filter(item => {
      if (priceFilter === 'all') return true;
      if (priceFilter === 'low') return item.avgPrice < 100;
      if (priceFilter === 'medium') return item.avgPrice >= 100 && item.avgPrice < 200;
      if (priceFilter === 'high') return item.avgPrice >= 200;
      return true;
    })
    .filter(item => selectedArea ? item.neighbourhood_group === selectedArea : true)
    .sort((a, b) => {
      if (sortBy === 'price') return b.avgPrice - a.avgPrice;
      return b.listings - a.listings;
    });

  // Get unique areas
  const areas = [...new Set(data.map(item => item.neighbourhood_group))].sort();

  // Stats
  const stats = {
    totalNeighbourhoods: filteredData.length,
    avgPrice: filteredData.length > 0 ? Math.round(filteredData.reduce((sum, item) => sum + item.avgPrice, 0) / filteredData.length) : 0,
    totalListings: filteredData.reduce((sum, item) => sum + item.listings, 0),
    highestPrice: filteredData.length > 0 ? Math.max(...filteredData.map(item => item.avgPrice)) : 0
  };

  // Color scale for prices (for table display)
  const getColorByPrice = (price: number) => {
    if (price >= 200) return '#dc2626'; // Red for high prices
    if (price >= 150) return '#ea580c'; // Orange
    if (price >= 100) return '#ca8a04'; // Yellow
    if (price >= 50) return '#16a34a';  // Green
    return '#0891b2'; // Blue for low prices
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedArea(null);
    setPriceFilter('all');
    setSortBy('price');
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Interactive Price Map Controls</h3>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Area Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Area
              </label>
              <select
                value={selectedArea || ''}
                onChange={(e) => setSelectedArea(e.target.value || null)}
                className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Areas ({areas.length})</option>
                {areas.map(area => (
                  <option key={area} value={area}>
                    {area} ({data.filter(item => item.neighbourhood_group === area).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Prices</option>
                <option value="low">Budget (&lt; $100)</option>
                <option value="medium">Mid-Range ($100-200)</option>
                <option value="high">Premium ($200+)</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'listings')}
                className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="price">Price (High to Low)</option>
                <option value="listings">Listings Count</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Neighbourhoods</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalNeighbourhoods}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Avg Price</p>
              <p className="text-xl font-bold text-gray-900">${stats.avgPrice}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalListings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Highest Price</p>
              <p className="text-xl font-bold text-gray-900">${stats.highestPrice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Geographic Map */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Geographic Price Distribution Map
          </h3>
          <span className="text-sm text-gray-500">
            ({filteredData.length} locations)
          </span>
        </div>
        
        <RealMap 
          data={data}
          filteredData={filteredData}
          hoveredPoint={hoveredPoint}
          onMarkerHover={setHoveredPoint}
        />
        
        {/* Map Legend */}
        <div className="flex flex-wrap gap-4 justify-center border-t pt-4 mt-4">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-2">Price Range Legend</div>
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">&lt; $50</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">$50-100</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-600">$100-150</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-600">$150-200</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">$200+</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-2">Circle Size = Listing Count</div>
            <div className="text-xs text-gray-500">Larger circles = More listings</div>
          </div>
        </div>
      </div>

      {/* Neighbourhood Ranking Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Neighbourhood Price Ranking
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredData.length} neighbourhoods sorted by {sortBy}
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
                  Neighbourhood
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.slice(0, 20).map((neighbourhood, index) => (
                <tr 
                  key={`${neighbourhood.neighbourhood}-${neighbourhood.neighbourhood_group}`} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(neighbourhood)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: getColorByPrice(neighbourhood.avgPrice) }}
                      ></div>
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {neighbourhood.neighbourhood}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {neighbourhood.neighbourhood_group}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      neighbourhood.avgPrice >= 200 ? 'bg-red-100 text-red-800' :
                      neighbourhood.avgPrice >= 150 ? 'bg-orange-100 text-orange-800' :
                      neighbourhood.avgPrice >= 100 ? 'bg-yellow-100 text-yellow-800' :
                      neighbourhood.avgPrice >= 50 ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      ${neighbourhood.avgPrice}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {neighbourhood.listings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {neighbourhood.latitude.toFixed(3)}, {neighbourhood.longitude.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length > 20 && (
          <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
            Showing top 20 of {filteredData.length} neighbourhoods
          </div>
        )}
      </div>
    </div>
  );
}