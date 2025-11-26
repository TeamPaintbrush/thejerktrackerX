import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';
import { User } from '@/lib/dynamodb';
import bcrypt from 'bcryptjs';

/**
 * GET /api/users/[id] - Get user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await DynamoDBService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id] - Update user
 * Body: Any User fields to update (except id, createdAt)
 * Special handling for password (will be hashed)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // Validate user exists
    const existingUser = await DynamoDBService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent updating immutable fields
    const immutableFields = ['id', 'createdAt'];
    immutableFields.forEach(field => delete updates[field]);

    // Hash password if being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Validate role if being updated
    if (updates.role && !['admin', 'manager', 'driver', 'customer'].includes(updates.role)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid role',
          validRoles: ['admin', 'manager', 'driver', 'customer']
        },
        { status: 400 }
      );
    }

    // Validate email format if being updated
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Check if email already exists (for different user)
      const userWithEmail = await DynamoDBService.getUserByEmail(updates.email);
      if (userWithEmail && userWithEmail.id !== id) {
        return NextResponse.json(
          { success: false, error: 'Email already in use by another user' },
          { status: 409 }
        );
      }
    }

    const updatedUser = await DynamoDBService.updateUser(id, updates);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id] - Delete user
 * Note: Soft delete - marks as inactive rather than removing
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate user exists
    const existingUser = await DynamoDBService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the last admin
    if (existingUser.role === 'admin') {
      const allAdmins = await DynamoDBService.getUsersByRole('admin');
      if (allAdmins.length <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the last admin user' },
          { status: 403 }
        );
      }
    }

    const success = await DynamoDBService.deleteUser(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
