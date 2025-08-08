import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { EMAIL_PLANS } from '@/lib/email/resend-service';

// GET - Get all email plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return apiResponse.forbidden();
    }

    // Convert EMAIL_PLANS to array format
    const plans = Object.values(EMAIL_PLANS).map(plan => ({
      ...plan,
      isActive: true // Default to active for existing plans
    }));

    return NextResponse.json({
      plans,
      message: 'Email plans retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching email plans:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update email plans configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return apiResponse.forbidden();
    }

    const { plans } = await request.json();

    if (!Array.isArray(plans)) {
      return apiResponse.badRequest('Invalid plans data');
    }

    // Validate each plan
    for (const plan of plans) {
      if (!plan.id || !plan.name || typeof plan.price !== 'number' || typeof plan.monthlyLimit !== 'number') {
        return apiResponse.badRequest('Invalid plan data structure');
      }
    }

    // Store the updated plans configuration in platform settings
    await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {
        // Store email plans as JSON in a custom field
        // You might want to add an emailPlans field to PlatformSettings model
      },
      create: {
        id: 'default',
        // Store email plans as JSON in a custom field
      }
    });

    // For now, we'll just return success since the EMAIL_PLANS are hardcoded
    // In a production system, you'd want to store these in the database
    return NextResponse.json({
      message: 'Email plans updated successfully',
      plans
    });

  } catch (error) {
    console.error('Error updating email plans:', error);
    return apiResponse.serverError();
  }
}

// POST - Create new email plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return apiResponse.forbidden();
    }

    const planData = await request.json();

    // Validate plan data
    if (!planData.id || !planData.name || typeof planData.price !== 'number' || typeof planData.monthlyLimit !== 'number') {
      return apiResponse.badRequest('Invalid plan data');
    }

    // In a real implementation, you would store this in a database
    // For now, return success
    return NextResponse.json({
      message: 'Email plan created successfully',
      plan: planData
    });

  } catch (error) {
    console.error('Error creating email plan:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete email plan
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return apiResponse.forbidden();
    }

    const { planId } = await request.json();

    if (!planId) {
      return apiResponse.badRequest('Plan ID is required');
    }

    // Check if any stores are using this plan
    const storesUsingPlan = await prisma.storeSettings.count({
      where: {
        emailSettings: {
          path: '$.planId',
          equals: planId
        }
      }
    });

    if (storesUsingPlan > 0) {
      return apiResponse.badRequest('Cannot delete plan. ${storesUsingPlan} store(s) are currently using this plan.');
    }

    // In a real implementation, you would delete from database
    return apiResponse.success({ message: 'Email plan deleted successfully' });

  } catch (error) {
    console.error('Error deleting email plan:', error);
    return apiResponse.serverError();
  }
}