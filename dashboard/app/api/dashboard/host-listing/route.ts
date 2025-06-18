import { NextResponse } from 'next/server';
import DashboardService from '@/lib/dashboard-service';

export async function GET() {
  try {
    const data = await DashboardService.getHostListingData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Host Listing API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch host listing data from database' }, 
      { status: 500 }
    );
  }
}