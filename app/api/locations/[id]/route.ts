import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;

  try {
    const location = await DynamoDBService.getLocationById(params.id);

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ location }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;

  try {
    const updates = await request.json();
    const success = await DynamoDBService.updateLocation(params.id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedLocation = await DynamoDBService.getLocationById(params.id);
    return NextResponse.json({ location: updatedLocation }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;

  try {
    const success = await DynamoDBService.deleteLocation(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete location' },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 204,
      headers: corsHeaders,
    }
  );
}
