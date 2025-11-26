import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DynamoDBService } from '@/lib/dynamodb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/menu/[id]
 * Get a single menu item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const menuItem = await DynamoDBService.getMenuItem(id);

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    // Verify the menu item belongs to the user's business
    const businessId = (session.user as any).businessId || session.user.id;
    if (menuItem.businessId !== businessId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ menuItem }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/menu/[id]
 * Update a menu item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and managers can update menu items
    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify the menu item exists and belongs to the user's business
    const { id } = await params;
    const existingItem = await DynamoDBService.getMenuItem(id);
    if (!existingItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const businessId = (session.user as any).businessId || session.user.id;
    if (existingItem.businessId !== businessId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedMenuItem = await DynamoDBService.updateMenuItem(id, body);

    if (!updatedMenuItem) {
      return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
    }

    return NextResponse.json({ menuItem: updatedMenuItem }, { status: 200 });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/menu/[id]
 * Delete a menu item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and managers can delete menu items
    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify the menu item exists and belongs to the user's business
    const { id } = await params;
    const existingItem = await DynamoDBService.getMenuItem(id);
    if (!existingItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const businessId = (session.user as any).businessId || session.user.id;
    if (existingItem.businessId !== businessId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent deletion of preset items
    if (existingItem.id.startsWith('jerk-') || existingItem.id.startsWith('curry-') || 
        existingItem.id.startsWith('ackee-') || existingItem.id.startsWith('brown-')) {
      return NextResponse.json({ error: 'Cannot delete preset items' }, { status: 403 });
    }

    const success = await DynamoDBService.deleteMenuItem(id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Menu item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
