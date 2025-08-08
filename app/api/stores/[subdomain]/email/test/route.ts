import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { validateSubdomain } from '@/lib/api/response';
import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    const { valid, error, store } = await validateSubdomain(subdomain, request);
    
    if (!valid || !store) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' }, 
        { status: 400 }
      );
    }

    // Get email settings
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: {
        emailSettings: true
      }
    });

    const emailSettings = settings?.emailSettings as any || {};
    const fromEmail = emailSettings.fromEmail || `noreply@${subdomain}.nuvi.com`;
    const fromName = emailSettings.fromName || store.name;
    const replyTo = emailSettings.replyToEmail || fromEmail;

    // Check if we have a valid Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.log('Resend API key not configured, simulating email send');
      // Simulate successful send in development
      return NextResponse.json({ 
        success: true,
        message: 'Test email simulated (no Resend API key configured)'
      });
    }

    // Send test email using Resend
    try {
      const data = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        reply_to: replyTo,
        subject: `Test Email from ${store.name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Test Email</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${store.name}</h1>
                </div>
                <div class="content">
                  <h2>Test Email</h2>
                  <p>Hi there,</p>
                  <p>This is a test email from your Nuvi store to verify that email sending is working correctly.</p>
                  <p>If you received this email, your email configuration is working properly!</p>
                  <p><strong>Email Details:</strong></p>
                  <ul>
                    <li>From: ${fromName} &lt;${fromEmail}&gt;</li>
                    <li>Reply-To: ${replyTo}</li>
                    <li>Store: ${store.name}</li>
                  </ul>
                  <p>Best regards,<br>${fromName}</p>
                </div>
                <div class="footer">
                  <p>Powered by Nuvi | ${new Date().getFullYear()}</p>
                </div>
              </div>
            </body>
          </html>
        `
      });

      return NextResponse.json({ 
        success: true,
        message: 'Test email sent successfully',
        emailId: data.id
      });
    } catch (resendError: any) {
      console.error('Resend error:', resendError);
      return NextResponse.json(
        { error: resendError.message || 'Failed to send test email' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' }, 
      { status: 500 }
    );
  }
}