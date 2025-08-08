import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendTemplatedEmail } from '@/lib/email/send-email';

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

async function handler(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (error: any) {
    console.error(`❌ Error verifying webhook signature: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
      
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { storeId, cartItems: cartItemsString, orderId, customerId } = paymentIntent.metadata;
    
    if (orderId) {
      // Update existing order
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId }
      });
      
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          financialStatus: 'paid',
          noteAttributes: {
            ...(existingOrder?.noteAttributes as any || {}),
            stripePaymentIntentId: paymentIntent.id,
          },
        },
      });
    } else if (storeId && cartItemsString) {
      // Create new order
      const cartItems = JSON.parse(cartItemsString);
      const customerName = paymentIntent.shipping?.name || 'Customer';
      const customerEmail = paymentIntent.receipt_email || '';
      const customerAddress = paymentIntent.shipping?.address ? 
        `${paymentIntent.shipping.address.line1}, ${paymentIntent.shipping.address.city}, ${paymentIntent.shipping.address.state} ${paymentIntent.shipping.address.postal_code}`
        : '';

      const result = await prisma.$transaction(async (tx) => {
        // Find or create customer
        let customer = null;
        if (customerEmail) {
          customer = await tx.customer.findFirst({
            where: {
              email: customerEmail,
              storeId: storeId,
            },
          });

          if (!customer) {
            customer = await tx.customer.create({
              data: {
                storeId: storeId,
                email: customerEmail,
                firstName: customerName.split(' ')[0] || '',
                lastName: customerName.split(' ').slice(1).join(' ') || '',
                totalSpent: 0,
                acceptsMarketing: false,
              },
            });
          }
        }

        // Create the order
        const order = await tx.order.create({
          data: {
            storeId: storeId,
            customerId: customer?.id,
            totalPrice: paymentIntent.amount / 100,
            subtotalPrice: paymentIntent.amount / 100,
            totalTax: 0,
            totalShipping: 0,
            totalDiscount: 0,
            currency: paymentIntent.currency.toUpperCase(),
            customerName: customerName,
            customerEmail: customerEmail,
            shippingAddress: customerAddress,
            billingAddress: customerAddress,
            status: 'pending',
            fulfillmentStatus: 'unfulfilled',
            paymentStatus: 'paid',
            financialStatus: 'paid',
            noteAttributes: {
              stripePaymentIntentId: paymentIntent.id,
              paidAt: new Date().toISOString(),
            },
            orderNumber: generateOrderNumber(),
          },
        });

        // Create line items and update inventory
        for (const item of cartItems) {
          await tx.orderLineItem.create({
            data: {
              orderId: order.id,
              title: item.title || 'Product',
              variantId: item.variantId,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.price * item.quantity,
            },
          });

          // Update inventory
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { 
              stock: { 
                decrement: item.quantity 
              } 
            },
          });
        }

        // Update customer total spent
        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: {
              totalSpent: {
                increment: paymentIntent.amount / 100,
              },
              ordersCount: {
                increment: 1,
              },
              lastOrderAt: new Date(),
            },
          });
        }

        return { order, customer };
      });

      // Send order confirmation email
      if (result?.order) {
        const store = await prisma.store.findUnique({
          where: { id: storeId },
          include: { storeSettings: true }
        });

        if (store && (store.storeSettings as any)?.emailSettings?.notifications?.orderConfirmation) {
          // Format order items for email
          const orderItems = cartItems.map((item: any) => 
            `<tr>
              <td>${item.name || 'Product'}</td>
              <td>${item.quantity}</td>
              <td>$${item.price.toFixed(2)}</td>
            </tr>`
          ).join('');

          await sendTemplatedEmail(
            store.id,
            'order-confirmation',
            customerEmail,
            {
              storeName: store.name,
              customerName: customerName,
              orderNumber: result.order.orderNumber,
              orderDate: new Date().toLocaleDateString(),
              orderTotal: `$${(paymentIntent.amount / 100).toFixed(2)}`,
              orderItems: orderItems,
              shippingAddress: customerAddress || 'No address provided',
              orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/s/${store.subdomain}/orders/${result.order.id}`,
              year: new Date().getFullYear().toString()
            }
          ).catch(error => {
            console.error('Failed to send order confirmation email:', error);
          });
        }

        // Send welcome email if it's a new customer
        if (result?.customer && result.customer.ordersCount === 1 && store && (store.storeSettings as any)?.emailSettings?.notifications?.customerWelcome) {
          await sendTemplatedEmail(
            store.id,
            'customer-welcome',
            customerEmail,
            {
              storeName: store.name,
              customerName: customerName,
              shopUrl: `${process.env.NEXT_PUBLIC_APP_URL}/s/${store.subdomain}`,
              year: new Date().getFullYear().toString()
            }
          ).catch(error => {
            console.error('Failed to send welcome email:', error);
          });
        }
      }
    }
  } catch (error: any) {
    console.error('Error handling payment_intent.succeeded:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { orderId } = paymentIntent.metadata;
    
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'failed',
          financialStatus: 'voided',
          cancelledAt: new Date(),
          cancelReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        },
      });
    }
  } catch (error: any) {
    console.error('Error handling payment_intent.payment_failed:', error);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { orderId } = session.metadata || {};
    
    if (orderId && session.payment_status === 'paid') {
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId }
      });
      
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          financialStatus: 'paid',
          noteAttributes: {
            ...(existingOrder?.noteAttributes as any || {}),
            stripeCheckoutSessionId: session.id,
            paidAt: new Date().toISOString(),
          },
        },
      });
    }
  } catch (error: any) {
    console.error('Error handling checkout.session.completed:', error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    // We need to find the order by searching through noteAttributes
    // This is not ideal but necessary since stripePaymentIntentId is in JSON
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'paid',
      },
    });
    
    const order = orders.find(o => 
      (o.noteAttributes as any)?.stripePaymentIntentId === charge.payment_intent
    );

    if (order) {
      const refundAmount = charge.amount_refunded / 100;
      const isFullRefund = refundAmount >= order.totalPrice;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          financialStatus: isFullRefund ? 'refunded' : 'partially_refunded',
          paymentStatus: isFullRefund ? 'refunded' : 'partially_refunded',
          noteAttributes: {
            ...(order.noteAttributes as any || {}),
            refundedAmount: refundAmount,
            refundedAt: new Date().toISOString(),
          },
        },
      });

      // Update customer total spent
      if (order.customerId) {
        await prisma.customer.update({
          where: { id: order.customerId },
          data: {
            totalSpent: {
              decrement: refundAmount,
            },
          },
        });
      }
    }
  } catch (error: any) {
    console.error('Error handling charge.refunded:', error);
  }
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${randomPart}`.toUpperCase();
}

export { handler as POST };
