// API Route: GET /api/fraud-claims/[id] - Get single fraud claim
// API Route: PATCH /api/fraud-claims/[id] - Update fraud claim (including resolution)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DynamoDBService } from '@/lib/dynamodb';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = await params;
    const claim = await DynamoDBService.getFraudClaim(id);

    if (!claim) {
      return NextResponse.json({ error: 'Fraud claim not found' }, { status: 404 });
    }

    return NextResponse.json(claim, { status: 200 });
  } catch (error) {
    console.error('Error fetching fraud claim:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fraud claim' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and managers can update fraud claims
    const userRole = (session.user as any).role;
    if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const userId = (session.user as any).id;
    const { id } = await params;

    // Check if this is a resolution update
    if (body.status && ['resolved_fraud', 'resolved_legitimate', 'dismissed'].includes(body.status)) {
      const resolved = await DynamoDBService.resolveFraudClaim(id, {
        status: body.status,
        resolutionNotes: body.resolutionNotes || '',
        resolvedBy: userId,
        refundAmount: body.refundAmount,
        actionTaken: body.actionTaken
      });

      if (!resolved) {
        return NextResponse.json({ error: 'Failed to resolve fraud claim' }, { status: 404 });
      }

      return NextResponse.json(resolved, { status: 200 });
    }

    // Regular update
    const updated = await DynamoDBService.updateFraudClaim(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Fraud claim not found' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating fraud claim:', error);
    return NextResponse.json(
      { error: 'Failed to update fraud claim' },
      { status: 500 }
    );
  }
}
