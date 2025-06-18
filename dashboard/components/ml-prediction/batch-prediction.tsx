'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface BatchResult {
  processed_count: number;
  successful_predictions: number;
  failed_predictions: number;
  results: Array<{
    row_id: number;
    predicted_price: number;
    confidence_score: number;
    status: 'success' | 'error';
    error_message?: string;
  }>;
  processing_time: number;
  timestamp: string;
}

export function BatchPrediction() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Allow both .csv files and files without extension that are CSV format
      const isCSV = selectedFile.type === 'text/csv' || 
                   selectedFile.type === 'application/vnd.ms-excel' ||
                   selectedFile.name.toLowerCase().endsWith('.csv');
      
      if (!isCSV) {
        setError('Please select a CSV file (.csv extension)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setResults(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleBatchPrediction = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      // Headers needed for ngrok
      const headers = {
        'ngrok-skip-browser-warning': 'true',
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

      const formData = new FormData();
      formData.append('file', file, file.name);

      const response = await fetch('https://thermal-wonder-463113-i4.et.r.appspot.com/predict/batch', {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        // Don't set Content-Type header - let the browser set it with boundary for FormData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setResults(result);
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Batch prediction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;

    const csvContent = [
      ['Row ID', 'Predicted Price', 'Confidence Score', 'Status', 'Error Message'].join(','),
      ...results.results.map(result => [
        result.row_id,
        result.predicted_price || '',
        result.confidence_score || '',
        result.status,
        result.error_message || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch_predictions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const templateContent = [
      // Header with exact fields matching the API structure
      ['neighbourhood_group', 'neighbourhood', 'room_type', 'latitude', 'longitude', 'minimum_nights', 'availability_365', 'number_of_reviews', 'reviews_per_month', 'calculated_host_listings_count', 'day', 'month', 'year', 'is_weekend'].join(','),
      // Sample data rows matching the provided JSON structure
      ['Manhattan', 'Upper East Side', 'Entire home/apt', '40.7736', '-73.9566', '2', '180', '50', '2.5', '3', '15', '7', '2024', '1'].join(','),
      ['Brooklyn', 'Williamsburg', 'Private room', '40.7081', '-73.9571', '1', '250', '25', '1.8', '1', '20', '8', '2024', '0'].join(','),
      ['Queens', 'Astoria', 'Shared room', '40.7698', '-73.9242', '3', '300', '15', '', '2', '', '', '', ''].join(','),
      ['Bronx', 'Concourse', 'Entire home/apt', '40.8259', '-73.9171', '4', '200', '12', '1.0', '3', '18', '6', '2024', '1'].join(','),
      ['Staten Island', 'St. George', 'Private room', '40.6432', '-74.0776', '2', '180', '6', '0.6', '1', '19', '6', '2024', '0'].join(',')
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'batch_prediction_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Price Prediction</CardTitle>
          <CardDescription>
            Upload a CSV file with listing data to get price predictions for multiple properties.
            The CSV must include all 14 required columns matching the single prediction form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
            <span className="text-sm text-gray-500">
              Use this template to format your data correctly
            </span>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">CSV Column Requirements:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Required fields:</strong></div>
              <div className="ml-4">• <strong>neighbourhood_group:</strong> Manhattan, Brooklyn, Queens, Bronx, Staten Island</div>
              <div className="ml-4">• <strong>neighbourhood:</strong> Valid neighborhood name</div>
              <div className="ml-4">• <strong>room_type:</strong> Entire home/apt, Private room, Shared room, Hotel room</div>
              <div className="ml-4">• <strong>latitude, longitude:</strong> Valid NYC coordinates (decimal format)</div>
              <div className="ml-4">• <strong>minimum_nights:</strong> Positive integer</div>
              <div className="ml-4">• <strong>availability_365:</strong> Integer 0-365</div>
              <div><strong>Optional fields (can be empty):</strong></div>
              <div className="ml-4">• <strong>number_of_reviews:</strong> Non-negative integer</div>
              <div className="ml-4">• <strong>reviews_per_month:</strong> Decimal number</div>
              <div className="ml-4">• <strong>calculated_host_listings_count:</strong> Positive integer</div>
              <div className="ml-4">• <strong>day, month, year:</strong> Date components (can be empty)</div>
              <div className="ml-4">• <strong>is_weekend:</strong> 0 (weekday) or 1 (weekend)</div>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-2">
                <FileText className="w-8 h-8 text-green-500 mx-auto" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  size="sm"
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Click to upload your CSV file
                </p>
                <Button onClick={handleUploadClick} variant="outline">
                  Select File
                </Button>
              </div>
            )}
          </div>

          {file && (
            <Button
              onClick={handleBatchPrediction}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Process Batch Prediction
                </>
              )}
            </Button>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Batch Processing Complete
                </CardTitle>
                <CardDescription>
                  Processed {results.processed_count} rows in {results.processing_time.toFixed(2)} seconds
                </CardDescription>
              </div>
              <Button onClick={downloadResults} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Results
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.successful_predictions}
                </div>
                <div className="text-sm text-green-700">Successful Predictions</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.failed_predictions}
                </div>
                <div className="text-sm text-red-700">Failed Predictions</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {((results.successful_predictions / results.processed_count) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700">Success Rate</div>
              </div>
            </div>

            {/* Results Preview */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Results Preview</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                    <div>Row ID</div>
                    <div>Predicted Price</div>
                    <div>Confidence</div>
                    <div>Status</div>
                    <div>Error</div>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {results.results.slice(0, 10).map((result, index) => (
                    <div key={index} className="px-4 py-2 border-b last:border-b-0">
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>{result.row_id}</div>
                        <div>
                          {result.predicted_price 
                            ? `$${result.predicted_price.toFixed(0)}`
                            : '-'
                          }
                        </div>
                        <div>
                          {result.confidence_score 
                            ? `${(result.confidence_score * 100).toFixed(1)}%`
                            : '-'
                          }
                        </div>
                        <div>
                          <Badge 
                            variant={result.status === 'success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {result.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {result.error_message || '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {results.results.length > 10 && (
                <p className="text-sm text-gray-500">
                  Showing first 10 results. Download the full results file to see all {results.results.length} predictions.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
