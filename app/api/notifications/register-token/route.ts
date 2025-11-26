import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';

/**
 * POST /api/notifications/register-token
 * Registers or updates a user's FCM push notification token
 * 
 * Body: { userId: string, fcmToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fcmToken } = body;

    // Validate required fields
    if (!userId || !fcmToken) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and fcmToken' },
        { status: 400 }
      );
    }

    // Get existing user
    const user = await DynamoDBService.getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user with FCM token
    const updatedUser = await DynamoDBService.updateUser(userId, {
      fcmToken,
      fcmTokenUpdatedAt: new Date().toISOString(),
    });

    console.log(`✅ FCM token registered for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Push notification token registered successfully',
      userId: updatedUser.id,
    });

  } catch (error) {
    console.error('❌ Error registering FCM token:', error);
    return NextResponse.json(
      { error: 'Failed to register push notification token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/register-token
 * Removes a user's FCM push notification token (e.g., on logout)
 * 
 * Body: { userId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Remove FCM token from user
    await DynamoDBService.updateUser(userId, {
      fcmToken: null,
      fcmTokenUpdatedAt: new Date().toISOString(),
    });

    console.log(`🗑️ FCM token removed for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Push notification token removed successfully',
    });

  } catch (error) {
    console.error('❌ Error removing FCM token:', error);
    return NextResponse.json(
      { error: 'Failed to remove push notification token' },
      { status: 500 }
    );
  }
}
