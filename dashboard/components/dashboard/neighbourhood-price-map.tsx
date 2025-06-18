"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface NeighbourhoodData {
  neighbourhood: string;
  avgPrice: number;
  latitude: number;
  longitude: number;
  listingCount?: number;
}

interface NeighbourhoodMapProps {
  data: NeighbourhoodData[];
  height?: number;
}

export function NeighbourhoodMap({ data, height = 400 }: NeighbourhoodMapProps) {
  // Function to get color based on price
  const getPriceColor = (price: number) => {
    if (price >= 250) return '#dc2626'; // Red for expensive
    if (price >= 180) return '#ea580c'; // Orange-red
    if (price >= 120) return '#f59e0b'; // Orange
    if (price >= 80) return '#10b981'; // Green
    return '#3b82f6'; // Blue for cheapest
  };

  // Transform data for scatter chart
  const scatterData = data.map(item => ({
    ...item,
    x: item.longitude,
    y: item.latitude,
    z: item.avgPrice
  }));

  return (
    <div className="space-y-4">
      {/* Geographic Scatter Plot */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Peta Geografis Harga per Neighbourhood</h4>
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart
            data={scatterData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="x" 
              name="Longitude" 
              type="number" 
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
              tickFormatter={(value) => value.toFixed(3)}
            />
            <YAxis 
              dataKey="y" 
              name="Latitude" 
              type="number" 
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
              tickFormatter={(value) => value.toFixed(3)}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <h4 className="font-semibold text-gray-900">{data.neighbourhood}</h4>
                      <p className="text-sm text-gray-600">
                        Rata-rata Harga: <span className="font-bold text-green-600">${data.avgPrice}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Koordinat: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
                      </p>
                      {data.listingCount && (
                        <p className="text-sm text-gray-600">
                          Total Listing: {data.listingCount}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter dataKey="z" fill="#8884d8">
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getPriceColor(entry.avgPrice)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Price Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-3">Legenda Harga</h5>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">$0 - $80</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">$80 - $120</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="text-sm text-gray-600">$120 - $180</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-600"></div>
            <span className="text-sm text-gray-600">$180 - $250</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span className="text-sm text-gray-600">$250+</span>
          </div>
        </div>
      </div>

      {/* Neighbourhood Price List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h5 className="font-medium text-gray-900">Daftar Harga per Neighbourhood</h5>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {data
            .sort((a, b) => b.avgPrice - a.avgPrice)
            .map((item) => (
              <div 
                key={item.neighbourhood} 
                className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getPriceColor(item.avgPrice) }}
                  ></div>
                  <div>
                    <div className="font-medium text-gray-900">{item.neighbourhood}</div>
                    <div className="text-sm text-gray-500">
                      {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">${item.avgPrice}</div>
                  {item.listingCount && (
                    <div className="text-sm text-gray-500">{item.listingCount} listings</div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
