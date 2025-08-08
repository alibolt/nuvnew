import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for GDPR settings
const gdprSettingsSchema = z.object({
  // Cookie Consent
  cookieConsentEnabled: z.boolean().default(true),
  cookieConsentMessage: z.string().optional(),
  cookieConsentPosition: z.enum(['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).default('bottom'),
  
  // Cookie Categories
  essentialCookies: z.object({
    enabled: z.boolean().default(true),
    description: z.string().optional()
  }).optional(),
  
  analyticalCookies: z.object({
    enabled: z.boolean().default(false),
    description: z.string().optional(),
    userCanDisable: z.boolean().default(true)
  }).optional(),
  
  marketingCookies: z.object({
    enabled: z.boolean().default(false),
    description: z.string().optional(),
    userCanDisable: z.boolean().default(true)
  }).optional(),
  
  functionalCookies: z.object({
    enabled: z.boolean().default(false),
    description: z.string().optional(),
    userCanDisable: z.boolean().default(true)
  }).optional(),
  
  // Data Processing
  dataRetentionPeriod: z.number().min(1).max(2555).default(365), // days, max ~7 years
  automaticDataDeletion: z.boolean().default(false),
  customerDataDownload: z.boolean().default(true),
  customerDataDeletion: z.boolean().default(true),
  
  // Privacy Settings
  privacyPolicyUrl: z.string().url().optional(),
  cookiePolicyUrl: z.string().url().optional(),
  dataProcessingBasis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']).default('consent'),
  
  // Regional Compliance
  gdprCompliance: z.boolean().default(true),
  ccpaCompliance: z.boolean().default(false),
  lgpdCompliance: z.boolean().default(false),
  
  // Contact Information
  dataProtectionOfficer: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional()
  }).optional(),
  
  // Third Party Services
  thirdPartyServices: z.array(z.object({
    name: z.string(),
    purpose: z.string(),
    dataShared: z.array(z.string()),
    privacyPolicyUrl: z.string().url().optional(),
    enabled: z.boolean().default(true)
  })).optional()
});

// Default GDPR settings
const defaultGdprSettings = {
  cookieConsentEnabled: true,
  cookieConsentMessage: "We use cookies to enhance your browsing experience and analyze our traffic. By clicking 'Accept', you consent to our use of cookies.",
  cookieConsentPosition: 'bottom',
  
  essentialCookies: {
    enabled: true,
    description: "These cookies are necessary for the website to function and cannot be switched off in our systems."
  },
  
  analyticalCookies: {
    enabled: false,
    description: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.",
    userCanDisable: true
  },
  
  marketingCookies: {
    enabled: false,
    description: "These cookies may be set through our site by our advertising partners to build a profile of your interests.",
    userCanDisable: true
  },
  
  functionalCookies: {
    enabled: false,
    description: "These cookies enable the website to provide enhanced functionality and personalization.",
    userCanDisable: true
  },
  
  dataRetentionPeriod: 365,
  automaticDataDeletion: false,
  customerDataDownload: true,
  customerDataDeletion: true,
  
  dataProcessingBasis: 'consent',
  gdprCompliance: true,
  ccpaCompliance: false,
  lgpdCompliance: false,
  
  thirdPartyServices: [
    {
      name: "Google Analytics",
      purpose: "Website analytics and performance tracking",
      dataShared: ["IP address", "browser information", "page views", "user interactions"],
      privacyPolicyUrl: "https://policies.google.com/privacy",
      enabled: false
    },
    {
      name: "Stripe",
      purpose: "Payment processing",
      dataShared: ["payment information", "billing address", "transaction data"],
      privacyPolicyUrl: "https://stripe.com/privacy",
      enabled: true
    }
  ]
};

// GET - Get GDPR settings
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

    // Get GDPR settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const gdprSettings = (storeSettings?.emailSettings as any)?.gdpr || defaultGdprSettings;

    return NextResponse.json({ 
      gdprSettings,
      availableRegions: ['EU (GDPR)', 'California (CCPA)', 'Brazil (LGPD)'],
      dataProcessingBasisOptions: [
        { value: 'consent', label: 'Consent' },
        { value: 'contract', label: 'Performance of a contract' },
        { value: 'legal_obligation', label: 'Compliance with legal obligation' },
        { value: 'vital_interests', label: 'Protection of vital interests' },
        { value: 'public_task', label: 'Performance of public task' },
        { value: 'legitimate_interests', label: 'Legitimate interests' }
      ]
    });
  } catch (error) {
    console.error('[GDPR API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update GDPR settings
export async function PUT(
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
    
    // Validate input
    const validation = gdprSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

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

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        emailSettings: { gdpr: validation.data }
      },
      create: {
        storeId: store.id,
        emailSettings: { gdpr: validation.data }
      }
    });

    return NextResponse.json({ 
      message: 'GDPR settings updated successfully',
      gdprSettings: validation.data 
    });
  } catch (error) {
    console.error('[GDPR API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Handle data subject requests (GDPR Article 15-20)
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
    const { action, customerEmail, customerId } = await request.json();
    
    if (!action || (!customerEmail && !customerId)) {
      return apiResponse.badRequest('Action and customer email or ID are required');
    }

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

    // Get or create data requests log
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const dataRequests = (storeSettings?.emailSettings as any)?.dataRequests || [];

    // Create new request
    const newRequest = {
      id: `req_${Date.now()}`,
      action, // 'download', 'delete', 'rectification', 'portability', 'restriction'
      customerEmail,
      customerId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      requestedBy: session.user.email,
      processedAt: null,
      processedBy: null,
      notes: []
    };

    // Handle different types of requests
    switch (action) {
      case 'download':
        // TODO: Generate customer data export
        newRequest.status = 'processing';
        break;
        
      case 'delete':
        // TODO: Schedule customer data deletion
        newRequest.status = 'processing';
        break;
        
      case 'rectification':
        // TODO: Allow customer to update their data
        newRequest.status = 'pending_customer_action';
        break;
        
      case 'portability':
        // TODO: Generate portable data format
        newRequest.status = 'processing';
        break;
        
      case 'restriction':
        // TODO: Restrict processing of customer data
        newRequest.status = 'processing';
        break;
        
      default:
        return apiResponse.badRequest('Invalid action');
    }

    // Add to requests log
    dataRequests.push(newRequest);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        emailSettings: { dataRequests }
      },
      create: {
        storeId: store.id,
        emailSettings: { dataRequests }
      }
    });

    return NextResponse.json({ 
      message: `Data ${action} request created successfully`,
      request: newRequest
    });
  } catch (error) {
    console.error('[GDPR API] POST Error:', error);
    return apiResponse.serverError();
  }
}