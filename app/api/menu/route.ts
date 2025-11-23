import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DynamoDBService } from '@/lib/dynamodb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/menu
 * Get all menu items for the authenticated user's business
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const locationId = searchParams.get('locationId');
    const search = searchParams.get('search');

    // Get business ID from user (assuming it's stored in the user object)
    const businessId = (session.user as any).businessId || session.user.id;

    let menuItems;

    if (locationId) {
      menuItems = await DynamoDBService.getMenuItemsByLocation(businessId, locationId);
    } else if (category) {
      menuItems = await DynamoDBService.getMenuItemsByCategory(businessId, category);
    } else {
      menuItems = await DynamoDBService.getMenuItems(businessId);
    }

    // Apply search filter if provided
    if (search && menuItems) {
      menuItems = await DynamoDBService.searchMenuItems(businessId, search);
    }

    return NextResponse.json({ menuItems }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/menu
 * Create a new menu item
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and managers can create menu items
    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const businessId = (session.user as any).businessId || session.user.id;

    // Ensure businessId is set
    const menuItemData = {
      ...body,
      businessId,
      createdBy: session.user.id
    };

    const newMenuItem = await DynamoDBService.createMenuItem(menuItemData);

    return NextResponse.json({ menuItem: newMenuItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
