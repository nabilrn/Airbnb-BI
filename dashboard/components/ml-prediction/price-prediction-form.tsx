'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

interface PredictionFormData {
  neighbourhood_group: string;
  neighbourhood: string;
  room_type: string;
  latitude: number;
  longitude: number;
  minimum_nights: number;
  number_of_reviews: number;
  reviews_per_month: number;
  calculated_host_listings_count: number;
  availability_365: number;
  day: number;
  month: number;
  year: number;
  is_weekend: number;
}

interface PredictionResult {
  predicted_price: number;
  model_used?: string;
  confidence_level?: string;
  individual_predictions?: {
    neural_network: number;
    random_forest: number;
    gradient_boosting: number;
    ridge: number;
  };
  confidence?: number;
  error?: string;
}

interface PricePredictionFormProps {
  onPredictionResult: (result: PredictionResult) => void;
}

export function PricePredictionForm({ onPredictionResult }: PricePredictionFormProps) {
  const [formData, setFormData] = useState<PredictionFormData>({
    neighbourhood_group: '',
    neighbourhood: '',
    room_type: '',
    latitude: 40.7128,
    longitude: -74.0060,
    minimum_nights: 1,
    number_of_reviews: 0,
    reviews_per_month: 0,
    calculated_host_listings_count: 1,
    availability_365: 365,
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    is_weekend: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const neighbourhoodGroups = [
    'Manhattan',
    'Brooklyn',
    'Queens',
    'Bronx',
    'Staten Island'
  ];

  const neighbourhoods = {
    'Manhattan': [
      { name: 'Upper West Side', lat: 40.7870, lng: -73.9754 },
      { name: 'Upper East Side', lat: 40.7736, lng: -73.9566 },
      { name: 'Midtown', lat: 40.7549, lng: -73.9840 },
      { name: 'Lower East Side', lat: 40.7153, lng: -73.9874 },
      { name: 'Chelsea', lat: 40.7465, lng: -74.0014 },
      { name: 'Greenwich Village', lat: 40.7336, lng: -74.0027 },
      { name: 'SoHo', lat: 40.7233, lng: -74.0029 },
      { name: 'Tribeca', lat: 40.7195, lng: -74.0137 }
    ],
    'Brooklyn': [
      { name: 'Williamsburg', lat: 40.7081, lng: -73.9571 },
      { name: 'DUMBO', lat: 40.7033, lng: -73.9881 },
      { name: 'Park Slope', lat: 40.6712, lng: -73.9773 },
      { name: 'Brooklyn Heights', lat: 40.6962, lng: -73.9954 },
      { name: 'Bushwick', lat: 40.6944, lng: -73.9213 },
      { name: 'Red Hook', lat: 40.6743, lng: -74.0110 },
      { name: 'Crown Heights', lat: 40.6681, lng: -73.9442 }
    ],
    'Queens': [
      { name: 'Long Island City', lat: 40.7448, lng: -73.9498 },
      { name: 'Astoria', lat: 40.7712, lng: -73.9262 },
      { name: 'Flushing', lat: 40.7647, lng: -73.8331 },
      { name: 'Jamaica', lat: 40.7024, lng: -73.7880 },
      { name: 'Forest Hills', lat: 40.7176, lng: -73.8448 },
      { name: 'Elmhurst', lat: 40.7370, lng: -73.8803 }
    ],
    'Bronx': [
      { name: 'Bronx', lat: 40.8448, lng: -73.8648 },
      { name: 'Mott Haven', lat: 40.8073, lng: -73.9249 },
      { name: 'Concourse', lat: 40.8259, lng: -73.9171 },
      { name: 'University Heights', lat: 40.8571, lng: -73.9127 }
    ],
    'Staten Island': [
      { name: 'St. George', lat: 40.6432, lng: -74.0776 },
      { name: 'Stapleton', lat: 40.6276, lng: -74.0754 },
      { name: 'Port Richmond', lat: 40.6343, lng: -74.1351 }
    ]
  };

  const roomTypes = [
    'Entire home/apt',
    'Private room',
    'Shared room',
    'Hotel room'
  ];

  const handleInputChange = (field: keyof PredictionFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.neighbourhood_group || !formData.neighbourhood || !formData.room_type) {
        throw new Error('Please fill in all required fields');
      }

      const response = await fetch('https://thermal-wonder-463113-i4.et.r.appspot.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      onPredictionResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predict Airbnb Price</CardTitle>
        <CardDescription>
          Enter the listing details below to get a price prediction from our ML model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location</h3>
              
              <div className="space-y-2">
                <Label htmlFor="neighbourhood_group">Neighbourhood Group *</Label>
                <Select
                  value={formData.neighbourhood_group}
                  onValueChange={(value) => {
                    handleInputChange('neighbourhood_group', value);
                    handleInputChange('neighbourhood', ''); // Reset neighbourhood when group changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select neighbourhood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {neighbourhoodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighbourhood">Neighbourhood *</Label>
                <Select
                  value={formData.neighbourhood}
                  onValueChange={(value) => {
                    handleInputChange('neighbourhood', value);
                    // Update coordinates when neighbourhood changes
                    const selectedGroup = formData.neighbourhood_group as keyof typeof neighbourhoods;
                    const neighbourhood = neighbourhoods[selectedGroup]?.find(n => n.name === value);
                    if (neighbourhood) {
                      handleInputChange('latitude', neighbourhood.lat);
                      handleInputChange('longitude', neighbourhood.lng);
                    }
                  }}
                  disabled={!formData.neighbourhood_group}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select neighbourhood" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.neighbourhood_group &&
                      neighbourhoods[formData.neighbourhood_group as keyof typeof neighbourhoods]?.map((neighbourhood) => (
                        <SelectItem key={neighbourhood.name} value={neighbourhood.name}>
                          {neighbourhood.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_type">Room Type *</Label>
                <Select
                  value={formData.room_type}
                  onValueChange={(value) => handleInputChange('room_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="minimum_nights">Minimum Nights</Label>
                <Input
                  id="minimum_nights"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.minimum_nights}
                  onChange={(e) => handleInputChange('minimum_nights', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_of_reviews">Number of Reviews</Label>
                <Input
                  id="number_of_reviews"
                  type="number"
                  min="0"
                  value={formData.number_of_reviews}
                  onChange={(e) => handleInputChange('number_of_reviews', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviews_per_month">Reviews per Month</Label>
                <Input
                  id="reviews_per_month"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.reviews_per_month}
                  onChange={(e) => handleInputChange('reviews_per_month', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calculated_host_listings_count">Host Listings Count</Label>
                <Input
                  id="calculated_host_listings_count"
                  type="number"
                  min="1"
                  value={formData.calculated_host_listings_count}
                  onChange={(e) => handleInputChange('calculated_host_listings_count', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability_365">Availability (days per year)</Label>
                <Input
                  id="availability_365"
                  type="number"
                  min="0"
                  max="365"
                  value={formData.availability_365}
                  onChange={(e) => handleInputChange('availability_365', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Additional Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Date & Time</h3>
              
              <div className="space-y-2">
                <Label htmlFor="day">Day of Month</Label>
                <Input
                  id="day"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day}
                  onChange={(e) => handleInputChange('day', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.month}
                  onChange={(e) => handleInputChange('month', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="2020"
                  max="2030"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value) || 2024)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Weekend & Coordinates</h3>
              
              <div className="space-y-2">
                <Label htmlFor="is_weekend">Is Weekend</Label>
                <Select
                  value={formData.is_weekend.toString()}
                  onValueChange={(value) => handleInputChange('is_weekend', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No (Weekday)</SelectItem>
                    <SelectItem value="1">Yes (Weekend)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const today = new Date();
                  const isWeekend = today.getDay() === 0 || today.getDay() === 6 ? 1 : 0;
                  handleInputChange('day', today.getDate());
                  handleInputChange('month', today.getMonth() + 1);
                  handleInputChange('year', today.getFullYear());
                  handleInputChange('is_weekend', isWeekend);
                }}
                className="w-full"
              >
                Use Today&apos;s Date
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const nextWeekend = new Date();
                  nextWeekend.setDate(nextWeekend.getDate() + (6 - nextWeekend.getDay()));
                  handleInputChange('day', nextWeekend.getDate());
                  handleInputChange('month', nextWeekend.getMonth() + 1);
                  handleInputChange('year', nextWeekend.getFullYear());
                  handleInputChange('is_weekend', 1);
                }}
                className="w-full"
              >
                Use Next Weekend
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="min-w-[140px]">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Get Prediction
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
