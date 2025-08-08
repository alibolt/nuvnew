import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for assigning customers to groups
const assignCustomersSchema = z.object({
  customerIds: z.array(z.string()).min(1),
  groupId: z.string(),
  sendNotification: z.boolean().default(true),
  notificationMessage: z.string().optional(),
  effectiveDate: z.string().optional() // When the assignment takes effect
});

// Schema for bulk assignment rules
const bulkAssignmentSchema = z.object({
  groupId: z.string(),
  rules: z.object({
    minimumOrderCount: z.number().min(0).optional(),
    minimumOrderValue: z.number().min(0).optional(),
    registrationAge: z.number().min(0).optional(), // days
    locationCriteria: z.array(z.string()).optional(),
    tagCriteria: z.array(z.string()).optional()
  }),
  preview: z.boolean().default(false) // Just preview matches, don't assign
});

// Schema for removing customers from groups
const removeFromGroupSchema = z.object({
  customerIds: z.array(z.string()).min(1),
  sendNotification: z.boolean().default(false),
  reason: z.string().optional()
});

// Helper function to check if customer qualifies for auto-assignment
function checkAutoAssignmentEligibility(customer: any, group: any): boolean {
  const rules = group.access?.autoAssignRules;
  if (!rules || !group.access?.autoAssign) return false;

  // Check minimum order count
  if (rules.minimumOrderCount && customer.ordersCount < rules.minimumOrderCount) {
    return false;
  }

  // Check minimum order value
  if (rules.minimumOrderValue && customer.totalSpent < rules.minimumOrderValue) {
    return false;
  }

  // Check registration age
  if (rules.registrationAge) {
    const registrationDate = new Date(customer.createdAt);
    const daysSinceRegistration = (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceRegistration < rules.registrationAge) {
      return false;
    }
  }

  // Check location criteria (simplified - would need proper address parsing)
  if (rules.locationCriteria?.length && customer.addresses) {
    const customerLocations = customer.addresses.map((addr: any) => 
      [addr.country, addr.state, addr.city].filter(Boolean).join(',')
    );
    const hasMatchingLocation = rules.locationCriteria.some((criteria: any) => 
      customerLocations.some((location: string) => 
        location.toLowerCase().includes(criteria.toLowerCase())
      )
    );
    if (!hasMatchingLocation) {
      return false;
    }
  }

  return true;
}

// POST - Assign customers to a group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();
    const { action = 'assign' } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    if (action === 'bulk_assign') {
      // Handle bulk assignment based on rules
      const validation = bulkAssignmentSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({
          error: 'Invalid bulk assignment data',
          details: validation.error.format()
        }, { status: 400 });
      }

      const { groupId, rules, preview } = validation.data;

      // Get the target group
      const storeSettings = await prisma.storeSettings.findUnique({
        where: { storeId: store.id }
      });
      const customerGroups = (storeSettings?.customerGroups as any[]) || [];
      const targetGroup = customerGroups.find(g => g.id === groupId);

      if (!targetGroup) {
        return apiResponse.notFound('Customer group ');
      }

      // Build query based on rules
      const where: any = { storeId: store.id };

      if (rules.minimumOrderCount) {
        where.ordersCount = { gte: rules.minimumOrderCount };
      }

      if (rules.minimumOrderValue) {
        where.totalSpent = { gte: rules.minimumOrderValue };
      }

      if (rules.registrationAge) {
        const cutoffDate = new Date(Date.now() - rules.registrationAge * 24 * 60 * 60 * 1000);
        where.createdAt = { lte: cutoffDate };
      }

      // Get qualifying customers
      const qualifyingCustomers = await prisma.customer.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          ordersCount: true,
          totalSpent: true,
          customerGroup: true,
          addresses: true,
          tags: true,
          createdAt: true
        }
      });

      // Apply additional filtering
      let filteredCustomers = qualifyingCustomers;

      if (rules.tagCriteria?.length) {
        filteredCustomers = filteredCustomers.filter(customer => {
          const customerTags = Array.isArray(customer.tags) ? customer.tags : [];
          return rules.tagCriteria?.some((tag: any) => 
            customerTags.some((ct: any) => ct.toLowerCase().includes(tag.toLowerCase()))
          );
        });
      }

      if (rules.locationCriteria?.length) {
        filteredCustomers = filteredCustomers.filter(customer => {
          if (!customer.addresses) return false;
          const customerLocations = (customer.addresses as any[]).map((addr: any) => 
            [addr.country, addr.state, addr.city].filter(Boolean).join(',')
          );
          return rules.locationCriteria?.some((criteria: any) => 
            customerLocations.some((location: string) => 
              location.toLowerCase().includes(criteria.toLowerCase())
            )
          );
        });
      }

      // Remove customers already in the target group
      filteredCustomers = filteredCustomers.filter(c => c.customerGroup !== groupId);

      if (preview) {
        return NextResponse.json({
          preview: true,
          matchingCustomers: filteredCustomers.length,
          customers: filteredCustomers.slice(0, 50), // Limit preview
          estimatedAssignments: filteredCustomers.length
        });
      }

      // Perform bulk assignment
      if (filteredCustomers.length > 0) {
        const customerIds = filteredCustomers.map(c => c.id);
        
        await prisma.customer.updateMany({
          where: {
            id: { in: customerIds },
            storeId: store.id
          },
          data: {
            customerGroup: groupId,
            groupAssignedAt: new Date().toISOString()
          }
        });

        // TODO: Send notification emails if enabled
      }

      return NextResponse.json({
        message: `Successfully assigned ${filteredCustomers.length} customers to group`,
        assignedCount: filteredCustomers.length,
        groupId,
        groupName: targetGroup.name
      });
    }

    if (action === 'remove') {
      // Handle removing customers from groups
      const validation = removeFromGroupSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({
          error: 'Invalid removal data',
          details: validation.error.format()
        }, { status: 400 });
      }

      const { customerIds, sendNotification, reason } = validation.data;

      // Verify customers belong to this store
      const customers = await prisma.customer.findMany({
        where: {
          id: { in: customerIds },
          storeId: store.id
        }
      });

      if (customers.length !== customerIds.length) {
        return apiResponse.badRequest('Some customers not found or do not belong to this store');
      }

      // Remove group assignment
      await prisma.customer.updateMany({
        where: {
          id: { in: customerIds },
          storeId: store.id
        },
        data: {
          customerGroup: null,
          groupRemovedAt: new Date().toISOString(),
          groupRemovalReason: reason
        }
      });

      // TODO: Send notification if enabled

      return NextResponse.json({
        message: `Successfully removed ${customers.length} customers from their groups`,
        removedCount: customers.length
      });
    }

    // Default: Handle regular assignment
    const validation = assignCustomersSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid assignment data',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { customerIds, groupId, sendNotification, notificationMessage, effectiveDate } = validation.data;

    // Verify customers belong to this store
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        storeId: store.id
      }
    });

    if (customers.length !== customerIds.length) {
      return apiResponse.badRequest('Some customers not found or do not belong to this store');
    }

    // Get the target group
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });
    const customerGroups = (storeSettings?.customerGroups as any[]) || [];
    const targetGroup = customerGroups.find(g => g.id === groupId);

    if (!targetGroup) {
      return apiResponse.notFound('Customer group ');
    }

    // Check if group requires approval
    if (targetGroup.access?.requiresApproval) {
      // In a real implementation, you might create pending approval requests
      // For now, we'll assign them directly but could add an approval workflow
    }

    // Assign customers to group
    const assignmentData: any = {
      customerGroup: groupId,
      groupAssignedAt: effectiveDate ? new Date(effectiveDate).toISOString() : new Date().toISOString(),
      groupAssignedBy: session.user.email
    };

    await prisma.customer.updateMany({
      where: {
        id: { in: customerIds },
        storeId: store.id
      },
      data: assignmentData
    });

    // Update customer count in group (stored in settings for quick access)
    const updatedGroups = customerGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          customerCount: (group.customerCount || 0) + customers.length,
          lastUpdated: new Date().toISOString()
        };
      }
      return group;
    });

    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { customerGroups: updatedGroups }
    });

    // TODO: Send notification emails if enabled

    return NextResponse.json({
      message: `Successfully assigned ${customers.length} customers to ${targetGroup.name}`,
      assignedCustomers: customers.map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        email: c.email
      })),
      group: {
        id: targetGroup.id,
        name: targetGroup.name,
        type: targetGroup.type
      }
    });
  } catch (error) {
    console.error('[CUSTOMER GROUP ASSIGN API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// GET - Get assignment suggestions and auto-assignment candidates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'suggestions';

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get customer groups
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });
    const customerGroups = (storeSettings?.customerGroups as any[]) || [];

    if (action === 'auto_assignment_candidates') {
      // Find customers eligible for auto-assignment
      const autoAssignGroups = customerGroups.filter(g => g.access?.autoAssign && g.isActive);
      const candidates = [];

      for (const group of autoAssignGroups) {
        // Get ungrouped customers
        const ungroupedCustomers = await prisma.customer.findMany({
          where: {
            storeId: store.id,
            customerGroup: null
          },
        });

        // Check eligibility for each customer
        const eligibleCustomers = ungroupedCustomers.filter(customer => 
          checkAutoAssignmentEligibility(customer, group)
        );

        if (eligibleCustomers.length > 0) {
          candidates.push({
            group: {
              id: group.id,
              name: group.name,
              type: group.type
            },
            eligibleCustomers: eligibleCustomers.slice(0, 20), // Limit for performance
            totalEligible: eligibleCustomers.length
          });
        }
      }

      return NextResponse.json({
        autoAssignmentCandidates: candidates,
        totalCandidates: candidates.reduce((sum, c) => sum + c.totalEligible, 0)
      });
    }

    // Default: Get assignment suggestions
    const ungroupedCustomers = await prisma.customer.findMany({
      where: {
        storeId: store.id,
        customerGroup: null
      },
      orderBy: [
        { totalSpent: 'desc' },
        { ordersCount: 'desc' }
      ],
      take: 50
    });

    // Generate suggestions based on customer characteristics
    const suggestions = ungroupedCustomers.map(customer => {
      const recommendedGroups = [];

      // Suggest based on spending patterns
      if (customer.totalSpent >= 1000) {
        const vipGroup = customerGroups.find(g => g.type === 'vip' && g.isActive);
        if (vipGroup) recommendedGroups.push({ group: vipGroup, reason: 'High total spending', confidence: 0.9 });
      }

      if (customer.ordersCount >= 10) {
        const loyaltyGroup = customerGroups.find(g => g.type === 'loyalty' && g.isActive);
        if (loyaltyGroup) recommendedGroups.push({ group: loyaltyGroup, reason: 'Frequent purchases', confidence: 0.8 });
      }

      // Suggest wholesale for high-quantity orders (would need order analysis)
      const wholesaleGroup = customerGroups.find(g => g.type === 'wholesale' && g.isActive);
      if (wholesaleGroup && customer.totalSpent > 500) {
        recommendedGroups.push({ group: wholesaleGroup, reason: 'Potential wholesale customer', confidence: 0.6 });
      }

      return {
        customer: {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email,
          totalSpent: customer.totalSpent,
          ordersCount: customer.ordersCount
        },
        recommendations: recommendedGroups.slice(0, 3) // Limit to top 3 suggestions
      };
    });

    // Filter out customers with no recommendations
    const customersWithSuggestions = suggestions.filter(s => s.recommendations.length > 0);

    return NextResponse.json({
      suggestions: customersWithSuggestions,
      ungroupedCustomerCount: ungroupedCustomers.length,
      availableGroups: customerGroups.filter(g => g.isActive).map(g => ({
        id: g.id,
        name: g.name,
        type: g.type,
        customerCount: g.customerCount || 0
      }))
    });
  } catch (error) {
    console.error('[CUSTOMER GROUP ASSIGN API] GET Error:', error);
    return apiResponse.serverError();
  }
}