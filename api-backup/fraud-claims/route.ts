// API Route: GET /api/fraud-claims - List fraud claims
// API Route: POST /api/fraud-claims - Create fraud claim

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DynamoDBService } from '@/lib/dynamodb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and managers can view fraud claims
    const userRole = (session.user as any).role;
    if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const businessId = (session.user as any).businessId || 'default-business';
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const claimType = searchParams.get('claimType') as any;
    const priority = searchParams.get('priority') as any;

    const filters: any = {};
    if (status) filters.status = status;
    if (claimType) filters.claimType = claimType;
    if (priority) filters.priority = priority;

    const claims = await DynamoDBService.getFraudClaims(businessId, filters);

    return NextResponse.json(claims, { status: 200 });
  } catch (error) {
    console.error('Error fetching fraud claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fraud claims' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Validate required fields
    if (!body.orderId || !body.claimType || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create fraud claim
    const newClaim = await DynamoDBService.createFraudClaim({
      businessId: body.businessId,
      orderId: body.orderId,
      orderNumber: body.orderNumber,
      claimType: body.claimType,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      description: body.description,
      customerId: body.customerId || userId, // Use provided customerId or fallback to userId
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      driverName: body.driverName,
      driverEmail: body.driverEmail,
      orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
      orderTotal: body.orderTotal || 0,
      evidence: body.evidence || {
        qrScanned: false
      },
      createdBy: userId
    });

    return NextResponse.json(newClaim, { status: 201 });
  } catch (error) {
    console.error('Error creating fraud claim:', error);
    return NextResponse.json(
      { error: 'Failed to create fraud claim' },
      { status: 500 }
    );
  }
}
