import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

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

interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  mailgun?: {
    apiKey: string;
    domain: string;
  };
  ses?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  fromEmail: string;
  fromName: string;
}

// Get email configuration from store settings
async function getEmailConfig(storeId: string): Promise<EmailConfig | null> {
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { storeId }
  });

  if (!storeSettings?.emailSettings) {
    return null;
  }

  const emailSettings = storeSettings.emailSettings as any;
  
  return {
    provider: emailSettings.provider || 'smtp',
    smtp: emailSettings.smtp,
    sendgrid: emailSettings.sendgrid,
    mailgun: emailSettings.mailgun,
    ses: emailSettings.ses,
    fromEmail: emailSettings.fromEmail || process.env.DEFAULT_FROM_EMAIL || 'noreply@nuvi.com',
    fromName: emailSettings.fromName || 'Nuvi Store'
  };
}

// Create transporter based on provider
function createTransporter(config: EmailConfig) {
  switch (config.provider) {
    case 'smtp':
      if (!config.smtp) throw new Error('SMTP configuration missing');
      return nodemailer.createTransporter({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.auth.user,
          pass: config.smtp.auth.pass,
        },
      });

    case 'sendgrid':
      if (!config.sendgrid?.apiKey) throw new Error('SendGrid API key missing');
      return nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: config.sendgrid.apiKey,
        },
      });

    case 'mailgun':
      if (!config.mailgun?.apiKey || !config.mailgun?.domain) {
        throw new Error('Mailgun configuration missing');
      }
      return nodemailer.createTransporter({
        host: 'smtp.mailgun.org',
        port: 587,
        auth: {
          user: `postmaster@${config.mailgun.domain}`,
          pass: config.mailgun.apiKey,
        },
      });

    case 'ses':
      if (!config.ses?.accessKeyId || !config.ses?.secretAccessKey || !config.ses?.region) {
        throw new Error('AWS SES configuration missing');
      }
      const { SES } = require('@aws-sdk/client-ses');
      const ses = new SES({
        credentials: {
          accessKeyId: config.ses.accessKeyId,
          secretAccessKey: config.ses.secretAccessKey,
        },
        region: config.ses.region,
      });
      return nodemailer.createTransporter({
        SES: { ses, aws: { SES } },
      });

    default:
      throw new Error(`Unsupported email provider: ${config.provider}`);
  }
}

// Send email function
export async function sendEmail(
  storeId: string,
  options: EmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get email configuration
    const config = await getEmailConfig(storeId);
    
    if (!config) {
      // Fallback to environment variables if no store config
      if (!process.env.SMTP_HOST) {
        console.error('No email configuration found');
        return { success: false, error: 'Email not configured' };
      }

      // Use default SMTP from environment
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      });

      const info = await transporter.sendMail({
        from: options.from || `${process.env.SMTP_FROM_NAME || 'Nuvi'} <${process.env.SMTP_FROM_EMAIL || 'noreply@nuvi.com'}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments,
      });

      return { success: true, messageId: info.messageId };
    }

    // Create transporter
    const transporter = createTransporter(config);

    // Send email
    const info = await transporter.sendMail({
      from: options.from || `${config.fromName} <${config.fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      html: options.html,
      replyTo: options.replyTo,
      attachments: options.attachments,
    });

    // Log email sent
    await prisma.emailLog.create({
      data: {
        storeId,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        status: 'sent',
        messageId: info.messageId,
        provider: config.provider,
      },
    }).catch(console.error); // Don't fail if logging fails

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Email sending error:', error);
    
    // Log failed email
    if (storeId) {
      await prisma.emailLog.create({
        data: {
          storeId,
          to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
          subject: options.subject,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch(console.error); // Don't fail if logging fails
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

// Send templated email
export async function sendTemplatedEmail(
  storeId: string,
  templateName: string,
  to: string | string[],
  variables: Record<string, any>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
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
      
      return sendEmail(storeId, {
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

    return sendEmail(storeId, {
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
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .order-details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{{storeName}}</h1>
              <h2>Order Confirmation</h2>
            </div>
            <div class="content">
              <p>Hi {{customerName}},</p>
              <p>Thank you for your order! We've received your order and will begin processing it right away.</p>
              
              <div class="order-details">
                <h3>Order #{{orderNumber}}</h3>
                <p>Order Date: {{orderDate}}</p>
                <p>Total: {{orderTotal}}</p>
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
                </tbody>
              </table>

              <h3>Shipping Address</h3>
              <p>{{shippingAddress}}</p>

              <p style="text-align: center; margin: 30px 0;">
                <a href="{{orderUrl}}" class="button">View Order</a>
              </p>

              <p>If you have any questions about your order, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
              <p>© {{year}} {{storeName}}. All rights reserved.</p>
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
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .tracking-info { background-color: #e7f3ff; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{{storeName}}</h1>
              <h2>Your Order Has Been Shipped!</h2>
            </div>
            <div class="content">
              <p>Hi {{customerName}},</p>
              <p>Great news! Your order #{{orderNumber}} has been shipped and is on its way to you.</p>
              
              <div class="tracking-info">
                <h3>Tracking Information</h3>
                <p><strong>Carrier:</strong> {{carrier}}</p>
                <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
              </div>

              <p style="text-align: center; margin: 30px 0;">
                <a href="{{trackingUrl}}" class="button">Track Package</a>
              </p>

              <h3>Delivery Address</h3>
              <p>{{shippingAddress}}</p>

              <p>You can also track your order status anytime by visiting your account.</p>
            </div>
            <div class="footer">
              <p>© {{year}} {{storeName}}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    'customer-welcome': {
      subject: 'Welcome to {{storeName}}!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .benefits { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{{storeName}}</h1>
              <h2>Welcome!</h2>
            </div>
            <div class="content">
              <p>Hi {{customerName}},</p>
              <p>Welcome to {{storeName}}! We're thrilled to have you as part of our community.</p>
              
              <div class="benefits">
                <h3>As a valued customer, you'll enjoy:</h3>
                <ul>
                  <li>Exclusive access to new products</li>
                  <li>Special member-only discounts</li>
                  <li>Fast and secure checkout</li>
                  <li>Order history and tracking</li>
                </ul>
              </div>

              <p style="text-align: center; margin: 30px 0;">
                <a href="{{shopUrl}}" class="button">Start Shopping</a>
              </p>

              <p>If you have any questions, our customer support team is here to help!</p>
            </div>
            <div class="footer">
              <p>© {{year}} {{storeName}}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    'password-reset': {
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .warning { background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{{storeName}}</h1>
              <h2>Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hi {{customerName}},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="{{resetUrl}}" class="button">Reset Password</a>
              </p>

              <div class="warning">
                <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
              </div>

              <p>If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>
            </div>
            <div class="footer">
              <p>© {{year}} {{storeName}}. All rights reserved.</p>
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