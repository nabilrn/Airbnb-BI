'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, MapPin, Users, Star, AlertCircle } from "lucide-react";

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

interface PredictionResultsProps {
  result: PredictionResult;
}

export function PredictionResults({ result }: PredictionResultsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  // Handle error case
  if (result.error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            Prediction Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{result.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Prediction Result */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Price Prediction Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatCurrency(result.predicted_price)}
              </div>
              <div className="text-lg text-gray-600 mb-2">
                Predicted nightly rate
              </div>
              {result.confidence && (
                <Badge className={`${getConfidenceColor(result.confidence)} border`}>
                  {(result.confidence * 100).toFixed(1)}% Confidence
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Generated</div>
              <div className="text-xs text-gray-400">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Optimization Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium">Availability Optimization</div>
                <div className="text-gray-600">Higher availability can impact pricing strategy</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium">Review Strategy</div>
                <div className="text-gray-600">More reviews typically support higher pricing</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium">Location Premium</div>
                <div className="text-gray-600">Your neighborhood supports competitive pricing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="font-medium mb-1">Recommended Range:</div>
              <div className="text-blue-600 font-bold text-lg">
                {formatCurrency(result.predicted_price * 0.9)} - {formatCurrency(result.predicted_price * 1.1)}
              </div>
            </div>
            <div className="text-sm">
              <div className="font-medium mb-1">Base Price:</div>
              <div className="text-gray-600">Start with the predicted price and adjust based on demand</div>
            </div>
            <div className="text-sm">
              <div className="font-medium mb-1">Dynamic Pricing:</div>
              <div className="text-gray-600">Consider seasonal and event-based adjustments</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Prediction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Model:</span> {result.model_used || 'Machine Learning Price Predictor'}
            </div>
            <div>
              <span className="font-medium">Confidence Level:</span> {result.confidence_level || 'Standard'}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Currency:</span> USD
            </div>
          </div>
          
          {/* Individual Model Predictions */}
          {result.individual_predictions && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-3">Individual Model Predictions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.individual_predictions).map(([model, price]) => (
                  <div key={model} className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500 capitalize mb-1">
                      {model.replace('_', ' ')}
                    </div>
                    <div className="font-semibold text-sm">
                      {formatCurrency(price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
