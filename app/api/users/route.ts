import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';
import { User } from '@/lib/dynamodb';
import bcrypt from 'bcryptjs';

/**
 * GET /api/users - List all users
 * Query params:
 *   - role: filter by role (admin, manager, driver, customer)
 *   - search: search by name, email, phone
 *   - businessId: filter by business
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') as User['role'] | null;
    const search = searchParams.get('search');
    const businessId = searchParams.get('businessId') || undefined;

    let users: User[];

    if (search) {
      users = await DynamoDBService.searchUsers(search, businessId);
    } else if (role) {
      users = await DynamoDBService.getUsersByRole(role, businessId);
    } else {
      users = await DynamoDBService.getAllUsers(businessId);
    }

    // Remove sensitive data (password) from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json({
      success: true,
      users: sanitizedUsers,
      count: sanitizedUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Create new user
 * Body:
 *   - email (required)
 *   - password (required)
 *   - name (required)
 *   - role (required): admin | manager | driver | customer
 *   - phone (optional)
 *   - businessId (optional)
 *   - platform (optional): web | mobile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      role, 
      phone,
      businessId,
      platform = 'web',
      permissions,
      settings,
      driverInfo,
      customerInfo
    } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['email', 'password', 'name', 'role']
        },
        { status: 400 }
      );
    }

    if (!['admin', 'manager', 'driver', 'customer'].includes(role)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid role',
          validRoles: ['admin', 'manager', 'driver', 'customer']
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await DynamoDBService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const userData: Omit<User, 'id' | 'createdAt'> = {
      email,
      password: hashedPassword,
      name,
      role,
      platform,
      updatedAt: new Date(),
      ...(phone && { phone }),
      ...(businessId && { businessId }),
      ...(permissions && { permissions }),
      ...(settings && { settings }),
      ...(driverInfo && role === 'driver' && { driverInfo }),
      ...(customerInfo && role === 'customer' && { customerInfo })
    };

    const newUser = await DynamoDBService.createUser(userData);

    if (!newUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
