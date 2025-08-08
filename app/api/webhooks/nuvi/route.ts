import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendTemplatedEmail } from '@/lib/email/send-email';
import { createMerchantPayout, platformStripe } from '@/lib/stripe-connect';

const nuviWebhookSecret = process.env.NUVI_STRIPE_WEBHOOK_SECRET || '';

async function handler(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = platformStripe.webhooks.constructEvent(body, signature, nuviWebhookSecret);
  } catch (error: any) {
    console.error(`❌ Error verifying webhook signature: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
      
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
      
    default:
      console.log(`[NUVI WEBHOOK] Unhandled event type: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('[NUVI WEBHOOK] Processing checkout.session.completed:', session.id);
    
    const { storeId, cartItems: cartItemsString, paymentMethod, platformFee } = session.metadata || {};
    
    if (paymentMethod !== 'nuvi') {
      // Not a Nuvi payment, ignore
      return;
    }

    if (!storeId || !cartItemsString) {
      console.error('[NUVI WEBHOOK] Missing metadata:', { storeId, cartItemsString });
      return;
    }

    const cartItems = JSON.parse(cartItemsString);
    const customerEmail = session.customer_email || '';
    const customerName = session.customer_details?.name || 'Customer';
    const shippingAddress = session.shipping_details?.address || session.customer_details?.address;
    
    const formattedAddress = shippingAddress ? {
      line1: shippingAddress.line1 || '',
      line2: shippingAddress.line2 || '',
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      postalCode: shippingAddress.postal_code || '',
      country: shippingAddress.country || '',
    } : null;

    const formattedAddressString = formattedAddress ? 
      `${formattedAddress.line1}${formattedAddress.line2 ? ', ' + formattedAddress.line2 : ''}, ${formattedAddress.city}, ${formattedAddress.state} ${formattedAddress.postalCode}, ${formattedAddress.country}` 
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
              status: 'active',
            },
          });
        }
      }

      // Calculate totals
      const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const shipping = session.shipping_cost?.amount_total ? session.shipping_cost.amount_total / 100 : 10;
      const tax = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : subtotal * 0.08;
      const total = session.amount_total ? session.amount_total / 100 : subtotal + shipping + tax;

      // Create the order
      const order = await tx.order.create({
        data: {
          storeId: storeId,
          customerId: customer?.id,
          totalPrice: total,
          subtotalPrice: subtotal,
          totalTax: tax,
          totalShipping: shipping,
          totalDiscount: session.total_details?.amount_discount ? session.total_details.amount_discount / 100 : 0,
          currency: session.currency?.toUpperCase() || 'USD',
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: session.customer_details?.phone || '',
          shippingAddress: formattedAddress || {},
          billingAddress: formattedAddress || {},
          status: 'pending',
          fulfillmentStatus: 'unfulfilled',
          paymentStatus: 'paid',
          financialStatus: 'paid',
          paymentProvider: 'nuvi',
          noteAttributes: {
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
            platformFee: platformFee,
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
            variantTitle: item.variantTitle || '',
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.price * item.quantity,
            position: 1,
          },
        });

        // Update inventory if tracking is enabled
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (variant && variant.trackQuantity) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { 
              stock: { 
                decrement: item.quantity 
              } 
            },
          });
        }
      }

      // Update customer total spent
      if (customer) {
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            totalSpent: {
              increment: total,
            },
            ordersCount: {
              increment: 1,
            },
            lastOrderAt: new Date(),
          },
        });
      }

      // Record platform fee transaction
      if (platformFee) {
        await tx.platformTransaction.create({
          data: {
            storeId: storeId,
            orderId: order.id,
            type: 'commission',
            amount: parseFloat(platformFee) / 100, // Convert from cents
            currency: session.currency?.toUpperCase() || 'USD',
            status: 'completed',
            description: `Nuvi payment commission for order ${order.orderNumber}`,
            metadata: {
              sessionId: session.id,
              paymentIntentId: session.payment_intent,
            },
          },
        });
      }

      return { order, customer, store };
    });

    // Schedule merchant payout (after order is successfully created)
    if (result?.order && result?.store) {
      try {
        // Get merchant bank details from Nuvi settings
        const nuviSettings = (result.store.storeSettings as any)?.paymentMethods?.nuvi?.settings;
        
        if (nuviSettings?.bankName && nuviSettings?.accountNumber) {
          // Calculate merchant payout amount
          const merchantPayoutAmount = result.order.totalPrice - (parseFloat(platformFee || '0') / 100);
          
          // Create payout transaction record
          await prisma.platformTransaction.create({
            data: {
              storeId: storeId,
              orderId: result.order.id,
              type: 'payout',
              amount: merchantPayoutAmount,
              currency: result.order.currency,
              status: 'scheduled',
              description: `Merchant payout for order ${result.order.orderNumber}`,
              metadata: {
                bankName: nuviSettings.bankName,
                accountNumber: nuviSettings.accountNumber.slice(-4), // Last 4 digits only for security
                iban: nuviSettings.iban,
                swiftCode: nuviSettings.swiftCode,
                scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
              },
            },
          });
          
          console.log(`[NUVI WEBHOOK] Scheduled payout of ${merchantPayoutAmount} ${result.order.currency} for order ${result.order.orderNumber}`);
        }
      } catch (error) {
        console.error('[NUVI WEBHOOK] Error scheduling merchant payout:', error);
        // Don't fail the webhook, just log the error
      }
    }

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
            <td>${item.title || 'Product'}</td>
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
            orderTotal: `$${result.order.totalPrice.toFixed(2)}`,
            orderItems: orderItems,
            shippingAddress: formattedAddressString || 'No address provided',
            orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/s/${store.subdomain}/orders/${result.order.orderNumber}`,
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

    console.log('[NUVI WEBHOOK] Order created successfully:', result?.order?.orderNumber);
  } catch (error: any) {
    console.error('[NUVI WEBHOOK] Error handling checkout.session.completed:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('[NUVI WEBHOOK] Processing payment_intent.succeeded:', paymentIntent.id);
    
    const { storeId, paymentMethod } = paymentIntent.metadata;
    
    if (paymentMethod !== 'nuvi') {
      // Not a Nuvi payment, ignore
      return;
    }

    // Payment intent succeeded is usually handled by checkout.session.completed
    // But we log it for tracking purposes
    console.log('[NUVI WEBHOOK] Payment intent succeeded for store:', storeId);
  } catch (error: any) {
    console.error('[NUVI WEBHOOK] Error handling payment_intent.succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('[NUVI WEBHOOK] Processing payment_intent.payment_failed:', paymentIntent.id);
    
    const { storeId, paymentMethod } = paymentIntent.metadata;
    
    if (paymentMethod !== 'nuvi') {
      // Not a Nuvi payment, ignore
      return;
    }

    // Log the failure
    console.error('[NUVI WEBHOOK] Payment failed for store:', storeId, paymentIntent.last_payment_error?.message);
  } catch (error: any) {
    console.error('[NUVI WEBHOOK] Error handling payment_intent.payment_failed:', error);
  }
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${randomPart}`.toUpperCase();
}

export { handler as POST };