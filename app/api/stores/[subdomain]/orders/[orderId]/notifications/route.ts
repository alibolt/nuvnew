import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for sending notifications
const notificationSchema = z.object({
  type: z.enum(['order_confirmation', 'payment_received', 'order_shipped', 'order_delivered', 'order_cancelled', 'custom']),
  recipient: z.string().email(),
  customMessage: z.string().optional(),
  includeOrderDetails: z.boolean().default(true),
  includeShippingInfo: z.boolean().default(false),
  includeTrackingInfo: z.boolean().default(false),
  trackingNumber: z.string().optional(),
  deliveryDate: z.string().optional()
});

// Email templates
const getEmailTemplate = (type: string, order: any, customMessage?: string, trackingNumber?: string) => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const orderUrl = `${baseUrl}/orders/${order.orderNumber}`;
  
  const templates = {
    order_confirmation: {
      subject: `Order Confirmation #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Thank you for your order!</h1>
          <p>Hi ${order.customerName},</p>
          <p>We've received your order and are processing it now. Here are the details:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Order #${order.orderNumber}</h2>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
          </div>
          
          <h3>Items Ordered:</h3>
          <ul>
            ${order.lineItems.map((item: any) => `
              <li>${item.title} - Quantity: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
            `).join('')}
          </ul>
          
          <h3>Shipping Address:</h3>
          <p>
            ${order.shippingAddress.name}<br>
            ${order.shippingAddress.address1}<br>
            ${order.shippingAddress.address2 ? order.shippingAddress.address2 + '<br>' : ''}
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
            ${order.shippingAddress.country}
          </p>
          
          <p><a href="${orderUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order Details</a></p>
          
          <p>Thanks for shopping with us!</p>
        </div>
      `
    },
    
    payment_received: {
      subject: `Payment Received for Order #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Payment Received</h1>
          <p>Hi ${order.customerName},</p>
          <p>We've successfully received your payment for order #${order.orderNumber}.</p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Payment Details</h2>
            <p><strong>Amount Paid:</strong> $${order.totalPrice.toFixed(2)}</p>
            <p><strong>Payment Status:</strong> ${order.financialStatus}</p>
            <p><strong>Order Status:</strong> ${order.status}</p>
          </div>
          
          <p>Your order is now being prepared for shipment.</p>
          
          <p><a href="${orderUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order Details</a></p>
        </div>
      `
    },
    
    order_shipped: {
      subject: `Your Order #${order.orderNumber} Has Shipped`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Your Order Has Shipped!</h1>
          <p>Hi ${order.customerName},</p>
          <p>Great news! Your order #${order.orderNumber} has been shipped and is on its way to you.</p>
          
          <div style="background: #cce7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Shipping Information</h2>
            <p><strong>Shipping Address:</strong></p>
            <p>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.address1}<br>
              ${order.shippingAddress.address2 ? order.shippingAddress.address2 + '<br>' : ''}
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}
            </p>
            ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
          </div>
          
          <h3>Items Shipped:</h3>
          <ul>
            ${order.lineItems.map((item: any) => `
              <li>${item.title} - Quantity: ${item.quantity}</li>
            `).join('')}
          </ul>
          
          <p><a href="${orderUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Your Order</a></p>
        </div>
      `
    },
    
    order_delivered: {
      subject: `Your Order #${order.orderNumber} Has Been Delivered`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Order Delivered!</h1>
          <p>Hi ${order.customerName},</p>
          <p>Your order #${order.orderNumber} has been successfully delivered!</p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Delivery Confirmation</h2>
            <p><strong>Delivered To:</strong> ${order.shippingAddress.name}</p>
            <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>We hope you love your purchase! If you have any questions or concerns, please don't hesitate to contact us.</p>
          
          <p><a href="${orderUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order Details</a></p>
          
          <p>Thank you for choosing us!</p>
        </div>
      `
    },
    
    order_cancelled: {
      subject: `Order #${order.orderNumber} Has Been Cancelled`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Order Cancelled</h1>
          <p>Hi ${order.customerName},</p>
          <p>We're writing to let you know that your order #${order.orderNumber} has been cancelled.</p>
          
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Cancellation Details</h2>
            <p><strong>Order Total:</strong> $${order.totalPrice.toFixed(2)}</p>
            <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${order.cancelReason ? `<p><strong>Reason:</strong> ${order.cancelReason}</p>` : ''}
          </div>
          
          <p>If you paid for this order, any charges will be refunded to your original payment method within 3-5 business days.</p>
          
          <p>If you have any questions about this cancellation, please contact our support team.</p>
          
          <p><a href="${orderUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order Details</a></p>
        </div>
      `
    },
    
    custom: {
      subject: `Update on Your Order #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Order Update</h1>
          <p>Hi ${order.customerName},</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Order #${order.orderNumber}</h2>
            ${customMessage ? `<p>${customMessage}</p>` : ''}
          </div>
          
          <p><a href="${orderUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order Details</a></p>
          
          <p>Thank you for your business!</p>
        </div>
      `
    }
  };
  
  return (templates as any)[type] || templates.custom;
};

// Mock email sending function (replace with actual email service)
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  // In a real implementation, you would use a service like:
  // - SendGrid
  // - AWS SES
  // - Nodemailer with SMTP
  // - Resend
  // - etc.
  
  console.log('📧 Email would be sent to:', to);
  console.log('📧 Subject:', subject);
  console.log('📧 HTML content:', html.substring(0, 200) + '...');
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 95% success rate
  return Math.random() > 0.05;
}

// POST - Send notification email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, orderId } = await params;
    const body = await request.json();

    // Validate input
    const validation = notificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid notification data',
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

    // Get order details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId: store.id
      },
      include: {
        lineItems: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return apiResponse.notFound('Order ');
    }

    const { 
      type, 
      recipient, 
      customMessage, 
      trackingNumber
    } = validation.data;

    // Parse addresses
    const shippingAddress = order.shippingAddress as any;
    const billingAddress = order.billingAddress as any;

    // Prepare order data for email template
    const orderData = {
      ...order,
      shippingAddress,
      billingAddress
    };

    // Generate email content
    const emailTemplate = getEmailTemplate(type, orderData, customMessage, trackingNumber);
    
    // Send email
    const emailSent = await sendEmail(recipient, emailTemplate.subject, emailTemplate.html);
    
    if (!emailSent) {
      return NextResponse.json({ 
        error: 'Failed to send email notification' 
      }, { status: 500 });
    }

    // Log notification in database
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.id,
      type,
      recipient,
      subject: emailTemplate.subject,
      sentAt: new Date().toISOString(),
      sentBy: session.user.email,
      status: 'sent'
    };

    // Get store settings to update notification history
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const notificationHistory = (storeSettings?.notificationHistory as any[]) || [];
    const updatedHistory = [notification, ...notificationHistory.slice(0, 999)]; // Keep last 1000

    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { notificationHistory: updatedHistory },
      create: { storeId: store.id, notificationHistory: updatedHistory }
    });

    return NextResponse.json({
      message: 'Notification sent successfully',
      notification: {
        id: notification.id,
        type: notification.type,
        recipient: notification.recipient,
        sentAt: notification.sentAt
      }
    });
  } catch (error) {
    console.error('[ORDER NOTIFICATIONS API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// GET - Get notification history for order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, orderId } = await params;

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

    // Get notification history
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const notificationHistory = (storeSettings?.notificationHistory as any[]) || [];
    
    // Filter notifications for this order
    const orderNotifications = notificationHistory.filter(notif => notif.orderId === orderId);

    return NextResponse.json({
      notifications: orderNotifications,
      total: orderNotifications.length
    });
  } catch (error) {
    console.error('[ORDER NOTIFICATIONS API] GET Error:', error);
    return apiResponse.serverError();
  }
}