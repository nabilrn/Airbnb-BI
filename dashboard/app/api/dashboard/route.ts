import { NextResponse } from 'next/server';
import DashboardService from '@/lib/dashboard-service';

export async function GET() {
  try {
    const data = await DashboardService.getAvailabilityPerformanceData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Availability Performance API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability performance data from database' }, 
      { status: 500 }
    );
  }
}