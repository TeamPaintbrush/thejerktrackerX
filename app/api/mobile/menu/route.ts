import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Mobile-Api-Key',
  'Content-Type': 'application/json',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const locationId = searchParams.get('locationId');
    const search = searchParams.get('search');

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId query param is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    let menuItems;

    if (locationId) {
      menuItems = await DynamoDBService.getMenuItemsByLocation(businessId, locationId);
    } else {
      menuItems = await DynamoDBService.getMenuItems(businessId);
    }

    if (search) {
      menuItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ menuItems }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching mobile menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}
