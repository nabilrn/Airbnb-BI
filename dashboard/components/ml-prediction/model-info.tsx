'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, BarChart3, Target, Clock, Database, RefreshCw } from "lucide-react";

interface ModelInfo {
  api_version?: string;
  model_version?: string;
  server_status?: string;
  timestamp?: string;
  is_ensemble?: boolean;
  available_models?: {
    gradient_boosting?: boolean;
    neural_network?: boolean;
    random_forest?: boolean;
    ridge_regression?: boolean;
  };
  capabilities?: {
    batch_prediction?: boolean;
    data_validation?: boolean;
    feature_engineering?: boolean;
    outlier_handling?: boolean;
    single_prediction?: boolean;
  };
  feature_counts?: {
    binary?: number;
    categorical?: number;
    numerical?: number;
    total?: number;
  };
  preprocessing?: {
    ensemble_weights_available?: boolean;
    label_encoders_count?: number;
    scaler_available?: boolean;
  };
}

export function ModelInfo() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Headers needed for ngrok
      const headers = {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      };

      // Check if API is available first
      try {
        const healthCheck = await fetch('https://thermal-wonder-463113-i4.et.r.appspot.com/health', {
          headers
        });
        if (!healthCheck.ok) {
          throw new Error('ML API server is not running. Please start the Flask server.');
        }
      } catch {
        throw new Error('Cannot connect to ML API server. Please ensure the Flask server is running on port 5000.');
      }

      const response = await fetch('https://thermal-wonder-463113-i4.et.r.appspot.com/model/info', {
        headers
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setModelInfo(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch model info';
      setError(errorMessage);
      console.error('Model info error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-green-100 text-green-700 border-green-200';
      case 'offline': return 'bg-red-100 text-red-700 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading model information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <p>Error loading model information: {error}</p>
            </div>
            <Button 
              onClick={fetchModelInfo}
              variant="outline"
              className="flex items-center gap-2 mx-auto"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!modelInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            No model information available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Model Overview
          </CardTitle>
          <CardDescription>
            Information about the current machine learning model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">API Version</div>
              <div className="font-medium">{modelInfo.api_version || 'Unknown'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Model Version</div>
              <div className="font-medium">{modelInfo.model_version || 'Unknown'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Model Type</div>
              <div className="font-medium">{modelInfo.is_ensemble ? 'Ensemble Model' : 'Single Model'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Server Status</div>
              <Badge className={getStatusColor(modelInfo.server_status || 'unknown')}>
                {modelInfo.server_status ? 
                  modelInfo.server_status.charAt(0).toUpperCase() + modelInfo.server_status.slice(1) :
                  'Unknown'
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            Available Models
          </CardTitle>
          <CardDescription>
            Machine learning models available in the ensemble
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modelInfo.available_models && Object.entries(modelInfo.available_models).map(([model, available]) => (
              <div key={model} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {model.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-600" />
            Feature Information
          </CardTitle>
          <CardDescription>
            Data features used for predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Total Features</div>
              <div className="text-2xl font-bold text-blue-600">
                {modelInfo.feature_counts?.total || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Numerical Features</div>
              <div className="text-2xl font-bold text-green-600">
                {modelInfo.feature_counts?.numerical || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Categorical Features</div>
              <div className="text-2xl font-bold text-purple-600">
                {modelInfo.feature_counts?.categorical || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Binary Features</div>
              <div className="text-2xl font-bold text-orange-600">
                {modelInfo.feature_counts?.binary || 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Model Capabilities
          </CardTitle>
          <CardDescription>
            Available features and functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelInfo.capabilities && Object.entries(modelInfo.capabilities).map(([capability, available]) => (
              <div key={capability} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">
                  {capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <Badge className={available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preprocessing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Preprocessing Information
          </CardTitle>
          <CardDescription>
            Data preprocessing and model preparation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Data Scaler</span>
              <Badge className={modelInfo.preprocessing?.scaler_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {modelInfo.preprocessing?.scaler_available ? 'Available' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Ensemble Weights</span>
              <Badge className={modelInfo.preprocessing?.ensemble_weights_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {modelInfo.preprocessing?.ensemble_weights_available ? 'Available' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Label Encoders</span>
              <span className="font-bold text-blue-600">
                {modelInfo.preprocessing?.label_encoders_count || 0} encoders
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Last Updated</span>
              <span className="font-medium">
                {modelInfo.timestamp ? 
                  new Date(modelInfo.timestamp).toLocaleString() : 
                  'Unknown'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
