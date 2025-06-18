import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PriceLocationDashboard } from "@/components/dashboard/price-location-dashboard";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PriceLocationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Harga & Lokasi</h1>
          <p className="text-lg text-gray-600">
            Analisis komprehensif distribusi harga dan perbandingan antar wilayah
          </p>
        </div>

        {/* Dashboard Content */}
        <Suspense fallback={<DashboardSkeleton />}>
          <PriceLocationDashboard />
        </Suspense>
      </main>
    </div>
  );
}
