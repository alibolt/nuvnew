import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

interface EmailQuota {
  planName: string;
  monthlyLimit: number;
  currentUsage: number;
  remainingEmails: number;
  resetDate: Date;
  isActive: boolean;
}

// Email plans configuration
const EMAIL_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Plan',
    monthlyLimit: 100,
    pricePerEmail: 0,
    price: 0,
    features: ['Basic templates', 'Order notifications']
  },
  STARTER: {
    id: 'starter', 
    name: 'Starter',
    monthlyLimit: 1000,
    pricePerEmail: 0.001, // $0.001 per email
    price: 9.99,
    features: ['All templates', 'Marketing emails', 'Analytics', 'A/B testing']
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional', 
    monthlyLimit: 10000,
    pricePerEmail: 0.0008,
    price: 29.99,
    features: ['Unlimited templates', 'Advanced analytics', 'API access', 'Priority support']
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyLimit: -1, // Unlimited
    pricePerEmail: 0.0005,
    price: 99.99,
    features: ['Everything', 'Dedicated IP', 'Custom domain', 'White-label']
  }
};

// Check if store has active email package
export async function getEmailQuota(storeId: string): Promise<EmailQuota | null> {
  try {
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId },
      select: { emailPackage: true }
    });

    if (!storeSettings?.emailPackage) {
      // Default to free plan
      return {
        planName: EMAIL_PLANS.FREE.name,
        monthlyLimit: EMAIL_PLANS.FREE.monthlyLimit,
        currentUsage: 0,
        remainingEmails: EMAIL_PLANS.FREE.monthlyLimit,
        resetDate: getNextMonthStart(),
        isActive: true
      };
    }

    const emailPackage = storeSettings.emailPackage as any;
    const plan = EMAIL_PLANS[emailPackage.planId?.toUpperCase() as keyof typeof EMAIL_PLANS] || EMAIL_PLANS.FREE;
    
    // Get current month usage
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const usage = await prisma.emailLog.count({
      where: {
        storeId,
        status: 'sent',
        createdAt: {
          gte: monthStart
        }
      }
    });

    const remainingEmails = plan.monthlyLimit === -1 ? -1 : Math.max(0, plan.monthlyLimit - usage);

    return {
      planName: plan.name,
      monthlyLimit: plan.monthlyLimit,
      currentUsage: usage,
      remainingEmails,
      resetDate: getNextMonthStart(),
      isActive: emailPackage.isActive !== false && new Date(emailPackage.expiresAt) > now
    };

  } catch (error) {
    console.error('Error getting email quota:', error);
    return null;
  }
}

// Send email through Resend with quota checking
export async function sendEmailWithResend(
  storeId: string,
  options: EmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string; quotaExceeded?: boolean }> {
  try {
    // Check email quota
    const quota = await getEmailQuota(storeId);
    
    if (!quota) {
      return { success: false, error: 'Email package not configured' };
    }

    if (!quota.isActive) {
      return { success: false, error: 'Email package is not active' };
    }

    if (quota.remainingEmails !== -1 && quota.remainingEmails <= 0) {
      return { 
        success: false, 
        error: 'Monthly email limit exceeded', 
        quotaExceeded: true 
      };
    }

    // Get store information for from address
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { name: true, subdomain: true }
    });

    if (!store) {
      return { success: false, error: 'Store not found' };
    }

    // Prepare from address
    const fromAddress = options.from || `${store.name} <noreply@${store.subdomain}.nuvi.com>`;

    // Send email through Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      reply_to: options.replyTo,
      attachments: options.attachments as any,
    });

    if (error) {
      // Log failed email
      await prisma.emailLog.create({
        data: {
          storeId,
          to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
          subject: options.subject,
          status: 'failed',
          provider: 'resend',
          error: error.message,
        },
      }).catch(console.error);

      return { success: false, error: error.message };
    }

    // Log successful email
    await prisma.emailLog.create({
      data: {
        storeId,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        status: 'sent',
        messageId: data?.id,
        provider: 'resend',
      },
    }).catch(console.error);

    // Update email usage analytics
    await updateEmailUsageAnalytics(storeId);

    return { success: true, messageId: data?.id };

  } catch (error) {
    console.error('Resend email error:', error);
    
    // Log failed email
    await prisma.emailLog.create({
      data: {
        storeId,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        status: 'failed',
        provider: 'resend',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }).catch(console.error);

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

// Send templated email with Resend
export async function sendTemplatedEmailWithResend(
  storeId: string,
  templateName: string,
  to: string | string[],
  variables: Record<string, any>
): Promise<{ success: boolean; messageId?: string; error?: string; quotaExceeded?: boolean }> {
  try {
    // Get email template from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId },
      select: { emailTemplates: true }
    });

    const templates = storeSettings?.emailTemplates as any;
    const template = templates?.[templateName];

    if (!template) {
      // Use default template
      const defaultTemplate = await getDefaultTemplate(templateName, variables);
      if (!defaultTemplate) {
        return { success: false, error: `Template ${templateName} not found` };
      }
      
      return sendEmailWithResend(storeId, {
        to,
        subject: defaultTemplate.subject,
        html: defaultTemplate.html,
      });
    }

    // Replace variables in template
    let subject = template.subject;
    let html = template.html;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
    });

    return sendEmailWithResend(storeId, {
      to,
      subject,
      html,
    });

  } catch (error) {
    console.error('Templated email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send templated email' 
    };
  }
}

// Update email usage analytics
async function updateEmailUsageAnalytics(storeId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    // Update monthly and daily usage stats
    await prisma.storeSettings.upsert({
      where: { storeId },
      update: {
        emailAnalytics: {
          lastUpdated: now.toISOString(),
          monthlyUsage: await prisma.emailLog.count({
            where: {
              storeId,
              status: 'sent',
              createdAt: { gte: monthStart }
            }
          }),
          dailyUsage: await prisma.emailLog.count({
            where: {
              storeId,
              status: 'sent',
              createdAt: { gte: dayStart }
            }
          })
        }
      },
      create: {
        storeId,
        emailAnalytics: {
          lastUpdated: now.toISOString(),
          monthlyUsage: 1,
          dailyUsage: 1
        }
      }
    });
  } catch (error) {
    console.error('Error updating email analytics:', error);
  }
}

// Get next month start date
function getNextMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

// Get default email template
async function getDefaultTemplate(
  templateName: string,
  variables: Record<string, any>
): Promise<{ subject: string; html: string } | null> {
  const templates: Record<string, { subject: string; html: string }> = {
    'order-confirmation': {
      subject: 'Order Confirmation - #{{orderNumber}}',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .order-summary { background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; }
            .order-number { font-size: 24px; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
            .order-details { display: flex; justify-content: space-between; margin: 16px 0; }
            .order-details .label { color: #718096; }
            .order-details .value { font-weight: 600; color: #1a202c; }
            .items-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            .items-table th { background: #edf2f7; padding: 12px; text-align: left; font-weight: 600; color: #4a5568; }
            .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .total-row { background: #f7fafc; font-weight: 600; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
            .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
            .social-links { margin: 20px 0; }
            .social-links a { color: #667eea; text-decoration: none; margin: 0 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{{storeName}}</h1>
              <p>Your order has been confirmed</p>
            </div>
            <div class="content">
              <p>Hi {{customerName}},</p>
              <p>Thank you for your order! We've received your order and will begin processing it right away.</p>
              
              <div class="order-summary">
                <div class="order-number">#{{orderNumber}}</div>
                <div class="order-details">
                  <span class="label">Order Date:</span>
                  <span class="value">{{orderDate}}</span>
                </div>
                <div class="order-details">
                  <span class="label">Total Amount:</span>
                  <span class="value">{{orderTotal}}</span>
                </div>
              </div>

              <h3>Order Items</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {{orderItems}}
                  <tr class="total-row">
                    <td colspan="2"><strong>Total</strong></td>
                    <td><strong>{{orderTotal}}</strong></td>
                  </tr>
                </tbody>
              </table>

              <h3>Shipping Address</h3>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                {{shippingAddress}}
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="{{orderUrl}}" class="button">Track Your Order</a>
              </div>

              <p>If you have any questions about your order, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
              <div class="social-links">
                <a href="#">Help Center</a> |
                <a href="#">Contact Support</a> |
                <a href="#">Order Status</a>
              </div>
              <p>© {{year}} {{storeName}}. All rights reserved.</p>
              <p>Powered by <strong>Nuvi</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    'order-shipped': {
      subject: 'Your order has been shipped - #{{orderNumber}}',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .tracking-info { background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #38a169; }
            .tracking-number { font-size: 20px; font-weight: 700; color: #1a202c; font-family: monospace; }
            .button { display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
            .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{{storeName}}</h1>
              <p>Your order is on its way!</p>
            </div>
            <div class="content">
              <p>Hi {{customerName}},</p>
              <p>Great news! Your order #{{orderNumber}} has been shipped and is on its way to you.</p>
              
              <div class="tracking-info">
                <h3 style="margin-top: 0;">Tracking Information</h3>
                <p><strong>Carrier:</strong> {{carrier}}</p>
                <p><strong>Tracking Number:</strong></p>
                <div class="tracking-number">{{trackingNumber}}</div>
                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
              </div>

              <div style="text-align: center;">
                <a href="{{trackingUrl}}" class="button">Track Your Package</a>
              </div>

              <h3>Delivery Address</h3>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                {{shippingAddress}}
              </div>
            </div>
            <div class="footer">
              <p>© {{year}} {{storeName}}. All rights reserved.</p>
              <p>Powered by <strong>Nuvi</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    'customer-welcome': {
      subject: 'Welcome to {{storeName}}! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .welcome-benefits { background: #fffaf0; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #ed8936; }
            .benefit-list { list-style: none; padding: 0; }
            .benefit-list li { padding: 8px 0; position: relative; padding-left: 24px; }
            .benefit-list li:before { content: '✓'; position: absolute; left: 0; color: #38a169; font-weight: bold; }
            .button { display: inline-block; background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
            .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to {{storeName}}!</h1>
              <p>We're thrilled to have you join our community</p>
            </div>
            <div class="content">
              <p>Hi {{customerName}},</p>
              <p>Welcome to {{storeName}}! We're excited to have you as part of our growing community of happy customers.</p>
              
              <div class="welcome-benefits">
                <h3 style="margin-top: 0;">What you can expect:</h3>
                <ul class="benefit-list">
                  <li>Exclusive access to new products and collections</li>
                  <li>Special member-only discounts and early sales</li>
                  <li>Fast and secure checkout experience</li>
                  <li>Easy order tracking and history</li>
                  <li>Dedicated customer support when you need it</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="{{shopUrl}}" class="button">Start Shopping Now</a>
              </div>

              <p>If you have any questions or need assistance, our friendly support team is here to help. Simply reply to this email or visit our help center.</p>
              
              <p>Happy shopping!</p>
              <p>The {{storeName}} Team</p>
            </div>
            <div class="footer">
              <p>© {{year}} {{storeName}}. All rights reserved.</p>
              <p>Powered by <strong>Nuvi</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  const template = templates[templateName];
  if (!template) return null;

  // Replace variables
  let subject = template.subject;
  let html = template.html;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    html = html.replace(regex, value);
  });

  return { subject, html };
}

export { EMAIL_PLANS };