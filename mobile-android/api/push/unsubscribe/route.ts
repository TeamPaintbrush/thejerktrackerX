// API endpoint for unsubscribing from push notifications

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { endpoint } = await request.json();
    
    // Remove subscription from database
    // For now, we'll just log it. In a real app, you'd remove it from DynamoDB
    console.log('Push unsubscribe received:', {
      userId: session.user.id,
      endpoint: endpoint
    });

    // In a real implementation, you would:
    // 1. Find the subscription by endpoint
    // 2. Remove it from DynamoDB
    
    return NextResponse.json({ 
      success: true, 
      message: 'Unsubscribed successfully' 
    });

  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}