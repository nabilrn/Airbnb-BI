import { NextResponse } from 'next/server';
import DashboardService from '@/lib/dashboard-service';

export async function GET() {
  try {
    const data = await DashboardService.getReviewTrendData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Review Trends API Error:', error);
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch review trends data from database',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}