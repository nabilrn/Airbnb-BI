'use client';

import { useState } from 'react';
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PricePredictionForm } from "@/components/ml-prediction/price-prediction-form";
import { PredictionResults } from "@/components/ml-prediction/prediction-results";
import { BatchPrediction } from "@/components/ml-prediction/batch-prediction";
import { ModelInfo } from "@/components/ml-prediction/model-info";
import { Bot, Calculator, FileText, Info } from "lucide-react";

interface PredictionResult {
  predicted_price: number;
  confidence?: number;
  error?: string;
}

export default function PricePredictionPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'model'>('single');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ML Price Prediction</h1>
              <p className="text-lg text-gray-600">
                Prediksi harga Airbnb menggunakan Machine Learning
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('single')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'single'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Single Prediction
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'batch'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                Batch Prediction
              </button>
              <button
                onClick={() => setActiveTab('model')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'model'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Info className="w-4 h-4" />
                Model Info
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'single' && (
                <div className="space-y-6">
                  <PricePredictionForm onPredictionResult={setPredictionResult} />
                  {predictionResult && (
                    <PredictionResults result={predictionResult} />
                  )}
                </div>
              )}
              
              {activeTab === 'batch' && (
                <BatchPrediction />
              )}
              
              {activeTab === 'model' && (
                <ModelInfo />
              )}
            </div>
          </div>
        </section>

        {/* Features Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Prediksi Tunggal</h3>
            <p className="text-sm text-gray-600">
              Masukkan parameter listing untuk mendapatkan prediksi harga secara real-time
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Prediksi Batch</h3>
            <p className="text-sm text-gray-600">
              Upload file CSV untuk mendapatkan prediksi harga untuk multiple listing sekaligus
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Info className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Model Insights</h3>
            <p className="text-sm text-gray-600">
              Informasi detail tentang model ML yang digunakan dan performa prediksi
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
