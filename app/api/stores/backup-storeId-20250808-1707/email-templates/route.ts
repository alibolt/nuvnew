import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for email template
const emailTemplateSchema = z.object({
  type: z.enum([
    'order_confirmation',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'order_refunded',
    'welcome_email',
    'password_reset',
    'account_created',
    'newsletter_welcome',
    'abandoned_cart',
    'back_in_stock',
    'low_stock_alert',
    'custom'
  ]),
  name: z.string().min(1),
  subject: z.string().min(1),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  enabled: z.boolean().default(true),
  variables: z.array(z.string()).optional(),
});

// Schema for updating template
const updateTemplateSchema = emailTemplateSchema.partial().extend({
  id: z.string().min(1)
});

// Default email templates
const defaultTemplates = {
  order_confirmation: {
    name: 'Order Confirmation',
    subject: 'Order Confirmation - {{order_number}}',
    htmlContent: `
      <h1>Thank you for your order!</h1>
      <p>Hi {{customer_name}},</p>
      <p>We've received your order and are processing it now.</p>
      
      <h2>Order Details</h2>
      <p><strong>Order Number:</strong> {{order_number}}</p>
      <p><strong>Order Date:</strong> {{order_date}}</p>
      <p><strong>Total:</strong> {{order_total}}</p>
      
      <h3>Items Ordered</h3>
      {{#each items}}
      <div>
        <p>{{name}} - Quantity: {{quantity}} - Price: {{price}}</p>
      </div>
      {{/each}}
      
      <h3>Shipping Address</h3>
      <p>{{shipping_address}}</p>
      
      <p>We'll send you another email when your order ships.</p>
      <p>Thanks for shopping with us!</p>
    `,
    textContent: `
Thank you for your order!

Hi {{customer_name}},

We've received your order and are processing it now.

Order Details:
Order Number: {{order_number}}
Order Date: {{order_date}}
Total: {{order_total}}

Items Ordered:
{{#each items}}
{{name}} - Quantity: {{quantity}} - Price: {{price}}
{{/each}}

Shipping Address:
{{shipping_address}}

We'll send you another email when your order ships.
Thanks for shopping with us!
    `,
    variables: ['customer_name', 'order_number', 'order_date', 'order_total', 'items', 'shipping_address']
  },
  order_shipped: {
    name: 'Order Shipped',
    subject: 'Your order {{order_number}} has shipped!',
    htmlContent: `
      <h1>Your order is on its way!</h1>
      <p>Hi {{customer_name}},</p>
      <p>Great news! Your order {{order_number}} has been shipped and is on its way to you.</p>
      
      <h2>Tracking Information</h2>
      <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
      <p><strong>Carrier:</strong> {{carrier}}</p>
      <p><strong>Expected Delivery:</strong> {{expected_delivery}}</p>
      
      <p><a href="{{tracking_url}}">Track your package</a></p>
      
      <p>Thank you for your business!</p>
    `,
    textContent: `
Your order is on its way!

Hi {{customer_name}},

Great news! Your order {{order_number}} has been shipped and is on its way to you.

Tracking Information:
Tracking Number: {{tracking_number}}
Carrier: {{carrier}}
Expected Delivery: {{expected_delivery}}

Track your package: {{tracking_url}}

Thank you for your business!
    `,
    variables: ['customer_name', 'order_number', 'tracking_number', 'carrier', 'expected_delivery', 'tracking_url']
  },
  welcome_email: {
    name: 'Welcome Email',
    subject: 'Welcome to {{store_name}}!',
    htmlContent: `
      <h1>Welcome to {{store_name}}!</h1>
      <p>Hi {{customer_name}},</p>
      <p>Thanks for creating an account with us. We're excited to have you as part of our community!</p>
      
      <h2>What's next?</h2>
      <ul>
        <li>Browse our latest products</li>
        <li>Sign up for our newsletter for exclusive deals</li>
        <li>Follow us on social media</li>
      </ul>
      
      <p><a href="{{store_url}}">Start Shopping</a></p>
      
      <p>If you have any questions, feel free to contact us.</p>
      <p>Welcome aboard!</p>
    `,
    textContent: `
Welcome to {{store_name}}!

Hi {{customer_name}},

Thanks for creating an account with us. We're excited to have you as part of our community!

What's next?
- Browse our latest products
- Sign up for our newsletter for exclusive deals
- Follow us on social media

Start Shopping: {{store_url}}

If you have any questions, feel free to contact us.
Welcome aboard!
    `,
    variables: ['store_name', 'customer_name', 'store_url']
  },
  abandoned_cart: {
    name: 'Abandoned Cart',
    subject: 'You left something in your cart',
    htmlContent: `
      <h1>Don't forget your items!</h1>
      <p>Hi {{customer_name}},</p>
      <p>You left some great items in your cart. Complete your purchase before they're gone!</p>
      
      <h2>Your Cart</h2>
      {{#each items}}
      <div>
        <p>{{name}} - {{price}}</p>
      </div>
      {{/each}}
      
      <p><strong>Total:</strong> {{cart_total}}</p>
      
      <p><a href="{{checkout_url}}">Complete Your Purchase</a></p>
      
      <p>Need help? Contact our support team.</p>
    `,
    textContent: `
Don't forget your items!

Hi {{customer_name}},

You left some great items in your cart. Complete your purchase before they're gone!

Your Cart:
{{#each items}}
{{name}} - {{price}}
{{/each}}

Total: {{cart_total}}

Complete Your Purchase: {{checkout_url}}

Need help? Contact our support team.
    `,
    variables: ['customer_name', 'items', 'cart_total', 'checkout_url']
  }
};

// GET - Get email templates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const enabled = searchParams.get('enabled');
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get templates from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let templates = storeSettings?.emailTemplates as any[] || [];

    // Filter by type
    if (type) {
      templates = templates.filter(template => template.type === type);
    }

    // Filter by enabled status
    if (enabled !== null) {
      const isEnabled = enabled === 'true';
      templates = templates.filter(template => template.enabled === isEnabled);
    }

    return NextResponse.json({ 
      templates,
      defaultTemplates: Object.keys(defaultTemplates)
    });
  } catch (error) {
    console.error('[EMAIL TEMPLATES API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create email template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    
    // Check if creating from default template
    if (body.fromTemplate && defaultTemplates[body.fromTemplate as keyof typeof defaultTemplates]) {
      const template = defaultTemplates[body.fromTemplate as keyof typeof defaultTemplates];
      body.name = template.name;
      body.subject = template.subject;
      body.htmlContent = template.htmlContent;
      body.textContent = template.textContent;
      body.variables = template.variables;
      body.type = body.fromTemplate;
    }

    // Validate input
    const validation = emailTemplateSchema.safeParse(body);
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
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current templates
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const templates = storeSettings?.emailTemplates as any[] || [];

    // Check for duplicate type (except for custom templates)
    if (validation.data.type !== 'custom') {
      const existingTemplate = templates.find(template => template.type === validation.data.type);
      if (existingTemplate) {
        return NextResponse.json({ 
          error: 'A template of this type already exists' 
        }, { status: 400 });
      }
    }

    // Create new template
    const newTemplate = {
      id: `template_${Date.now()}`,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.email
    };

    // Add to templates
    templates.push(newTemplate);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        emailTemplates: templates
      },
      create: {
        storeId: store.id,
        emailTemplates: templates
      }
    });

    return NextResponse.json({ 
      message: 'Email template created successfully',
      template: newTemplate 
    });
  } catch (error) {
    console.error('[EMAIL TEMPLATES API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update email template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = updateTemplateSchema.safeParse(body);
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
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current templates
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const templates = storeSettings?.emailTemplates as any[] || [];
    const templateIndex = templates.findIndex(template => template.id === validation.data.id);

    if (templateIndex === -1) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check for duplicate type if type is being changed (except for custom templates)
    if (validation.data.type && validation.data.type !== 'custom' && 
        validation.data.type !== templates[templateIndex].type) {
      const duplicateType = templates.find(
        template => template.type === validation.data.type && template.id !== validation.data.id
      );
      
      if (duplicateType) {
        return NextResponse.json({ 
          error: 'A template of this type already exists' 
        }, { status: 400 });
      }
    }

    // Update template
    const { id, ...updateData } = validation.data;
    templates[templateIndex] = {
      ...templates[templateIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        emailTemplates: templates
      }
    });

    return NextResponse.json({ 
      message: 'Email template updated successfully',
      template: templates[templateIndex]
    });
  } catch (error) {
    console.error('[EMAIL TEMPLATES API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current templates
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const templates = storeSettings?.emailTemplates as any[] || [];
    const filteredTemplates = templates.filter(template => template.id !== templateId);

    if (filteredTemplates.length === templates.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        emailTemplates: filteredTemplates
      }
    });

    return NextResponse.json({ 
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('[EMAIL TEMPLATES API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}