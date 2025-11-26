import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService } from '@/lib/dynamodb';
import { hashPassword, generateBusinessId, isValidEmail, isValidPassword } from '@/lib/auth-utils';
import { emailService } from '@/lib/email-service';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'customer' } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if user already exists
    const existingUser = await DynamoDBService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409, headers: corsHeaders }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate unique business ID
    const businessId = generateBusinessId();

    // Create user in DynamoDB
    const newUser = await DynamoDBService.createUser({
      email,
      password: hashedPassword,
      name,
      role: role as 'admin' | 'user' | 'customer' | 'driver' | 'manager',
      businessId,
      platform: 'mobile',
      lastLoginPlatform: 'mobile',
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    // Send welcome email (async, don't wait for it)
    emailService.sendWelcomeEmail(email, name, role).catch(err => {
      console.error('Failed to send welcome email:', err);
    });
    
    console.log(`✅ New user registered: ${email} (${role}) - Welcome email sent`);

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        message: 'Account created successfully'
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500, headers: corsHeaders }
    );
  }
}
