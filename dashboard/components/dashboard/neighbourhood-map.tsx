"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import map components dynamically to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false });

interface NeighbourhoodData {
  neighbourhood: string;
  avgPrice: number;
  latitude: number;
  longitude: number;
  listingCount?: number;
}

interface NeighbourhoodMapProps {
  data: NeighbourhoodData[];
  height?: string;
}

export function NeighbourhoodMap({ data, height = "400px" }: NeighbourhoodMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`w-full bg-gray-100 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // NYC center coordinates
  const center: [number, number] = [40.7128, -74.0060];

  // Function to get color based on price
  const getPriceColor = (price: number) => {
    if (price >= 250) return '#dc2626'; // Red for expensive
    if (price >= 180) return '#ea580c'; // Orange-red
    if (price >= 120) return '#f59e0b'; // Orange
    if (price >= 80) return '#10b981'; // Green
    return '#3b82f6'; // Blue for cheapest
  };

  // Function to get radius based on price
  const getPriceRadius = (price: number) => {
    return Math.max(8, Math.min(25, price / 10));
  };

  return (
    <div className="w-full" style={{ height }}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {data.map((item, index) => (
          <CircleMarker
            key={index}
            center={[item.latitude, item.longitude]}
            pathOptions={{
              fillColor: getPriceColor(item.avgPrice),
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }}
            radius={getPriceRadius(item.avgPrice)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">{item.neighbourhood}</h3>
                <p className="text-sm text-gray-600">Rata-rata Harga: <span className="font-bold text-green-600">${item.avgPrice}</span></p>
                {item.listingCount && (
                  <p className="text-sm text-gray-600">Total Listing: {item.listingCount}</p>
                )}
              </div>
            </Popup>
            <Tooltip>
              <div className="text-center">
                <div className="font-semibold">{item.neighbourhood}</div>
                <div className="text-sm">${item.avgPrice}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
