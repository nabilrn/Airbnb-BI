import { NextResponse } from 'next/server';
import DashboardService from '@/lib/dashboard-service';

export async function GET() {
  try {
    const data = await DashboardService.getPriceLocationData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Price Location API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price location data from database' }, 
      { status: 500 }
    );
  }
}