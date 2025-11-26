import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  // Enable CORS for GitHub Pages
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const orderId = params.id;
    const body = await request.json();
    
    const { driverName, deliveryCompany, pickedUpAt } = body;

    if (!driverName || !deliveryCompany) {
      return NextResponse.json(
        { error: 'Driver name and delivery company are required' },
        { status: 400, headers }
      );
    }

    // Update order in DynamoDB
    const updatedOrder = await DynamoDBService.updateOrder(orderId, {
      status: 'picked_up',
      driverName,
      driverCompany: deliveryCompany,
      pickedUpAt: pickedUpAt || new Date().toISOString(),
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers }
      );
    }

    // TODO: Send notification to restaurant
    // await sendNotificationToRestaurant(orderId, driverName, deliveryCompany);

    return NextResponse.json(
      {
        success: true,
        message: 'Pickup confirmed successfully',
        order: updatedOrder,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error confirming pickup:', error);
    return NextResponse.json(
      { error: 'Failed to confirm pickup' },
      { status: 500, headers }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
