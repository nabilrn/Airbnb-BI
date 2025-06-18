"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DollarSign, Home, MapPin } from "lucide-react";

// Fix Leaflet default markers issue
const fixLeafletIcons = () => {
  if (typeof window !== 'undefined') {
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }
};

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface PriceMapData {
  neighbourhood: string;
  neighbourhood_group: string;
  avgPrice: number;
  listings: number;
  latitude: number;
  longitude: number;
}

interface RealMapProps {
  data: PriceMapData[];
  filteredData: PriceMapData[];
  hoveredPoint: PriceMapData | null;
  onMarkerHover: (point: PriceMapData | null) => void;
}

export function RealMap({ data, filteredData, hoveredPoint, onMarkerHover }: RealMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setMapLoaded(true);
  }, []);

  // Color scale for prices
  const getColorByPrice = (price: number) => {
    if (price >= 200) return '#dc2626'; // Red for high prices
    if (price >= 150) return '#ea580c'; // Orange
    if (price >= 100) return '#ca8a04'; // Yellow
    if (price >= 50) return '#16a34a';  // Green
    return '#0891b2'; // Blue for low prices
  };

  // Get radius based on listing count
  const getRadiusByListings = (listings: number) => {
    const maxListings = Math.max(...data.map(d => d.listings));
    const minRadius = 5;
    const maxRadius = 25;
    return minRadius + (listings / maxListings) * (maxRadius - minRadius);
  };

  // Calculate map center based on data
  const center = {
    lat: data.length > 0 ? data.reduce((sum, item) => sum + item.latitude, 0) / data.length : 40.7128,
    lng: data.length > 0 ? data.reduce((sum, item) => sum + item.longitude, 0) / data.length : -74.0060
  };

  // If no data, show empty state
  if (data.length === 0) {
    return (
      <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <div className="text-gray-500">No location data available</div>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
          <div className="text-gray-500">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border">
      <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
      `}</style>
      
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredData.map((point, index) => (
          <CircleMarker
            key={`${point.neighbourhood}-${point.neighbourhood_group}-${index}`}
            center={[point.latitude, point.longitude]}
            radius={getRadiusByListings(point.listings)}
            fillColor={getColorByPrice(point.avgPrice)}
            color={hoveredPoint === point ? "#000" : "#fff"}
            weight={hoveredPoint === point ? 3 : 1}
            opacity={0.8}
            fillOpacity={0.7}
            eventHandlers={{
              mouseover: () => onMarkerHover(point),
              mouseout: () => onMarkerHover(null),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-gray-900 mb-1">{point.neighbourhood}</h3>
                <p className="text-sm text-gray-600 mb-2">{point.neighbourhood_group}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="w-3 h-3 text-green-500" />
                    <span>Avg Price: <strong>${point.avgPrice}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Home className="w-3 h-3 text-blue-500" />
                    <span>Listings: <strong>{point.listings}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-gray-500">
                      {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
