// API Route: POST /api/push/register
// Register device token for push notifications

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userRole, deviceToken, platform, timestamp } = body;

    if (!userId || !deviceToken) {
      return NextResponse.json(
        { error: 'Missing userId or deviceToken' },
        { status: 400 }
      );
    }

    // Store device token in database
    // You would implement this in DynamoDBService
    console.log('📱 Registering device:', {
      userId,
      userRole,
      deviceToken: deviceToken.substring(0, 20) + '...',
      platform,
      timestamp
    });

    // For now, store in memory or DynamoDB
    // In production, you'd have a DeviceTokens table
    const tokenRecord = {
      userId,
      userRole,
      deviceToken,
      platform,
      registeredAt: timestamp,
      active: true
    };

    // TODO: Add DynamoDBService.saveDeviceToken(tokenRecord)
    
    return NextResponse.json({ 
      success: true,
      message: 'Device registered successfully' 
    });
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}
