import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import Stripe from 'stripe';
import { createNuviCheckoutSession, NUVI_CONNECTED_ACCOUNT_ID } from '@/lib/stripe-connect';
// import { createTaxCalculator } from '@/lib/services/tax/tax-calculator';
// import { createShippingCalculator } from '@/lib/services/shipping/shipping-calculator';

// Checkout session schema
const checkoutSchema = z.object({
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().positive(),
  })),
  customer: z.object({
    email: z.string().email(),
    name: z.string().min(1),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2), // ISO country code
  }),
  billingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2),
  }).optional(),
  discountCode: z.string().optional(),
  paymentMethod: z.enum(['nuvi', 'stripe', 'paypal', 'manual']).default('stripe'),
  metadata: z.record(z.string()).optional(),
});

// POST - Create checkout session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await request.json();
    
    // Validate request
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      console.error('Checkout validation error:', validation.error.format());
      return NextResponse.json({
        error: 'Invalid checkout data',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { items, customer, shippingAddress, billingAddress, discountCode, paymentMethod, metadata } = validation.data;

    // Get store and payment settings
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: {
        storeSettings: true,
      }
    });

    if (!store) {
      return NextResponse.json({
        error: 'Store not found'
      }, { status: 404 });
    }

    // Check if payment methods are configured
    const paymentMethods = store.storeSettings?.paymentMethods as any;
    if (!paymentMethods || (!paymentMethods.stripe?.enabled && !paymentMethods.paypal?.enabled && !paymentMethods.manual?.enabled)) {
      return NextResponse.json({
        error: 'Payment methods not configured'
      }, { status: 400 });
    }

    // Fetch product variants with products
    const variantIds = items.map(item => item.variantId);
    console.log('[CHECKOUT] Looking for variants:', variantIds);
    console.log('[CHECKOUT] Store ID:', store.id);
    
    const variants = await prisma.productVariant.findMany({
      where: { 
        id: { in: variantIds },
        product: { storeId: store.id }
      },
      include: { 
        product: true 
      }
    });

    console.log('[CHECKOUT] Found variants:', variants.map(v => ({ id: v.id, productId: v.productId, name: v.name })));

    if (variants.length !== items.length) {
      console.error('[CHECKOUT] Variant mismatch - requested:', variantIds.length, 'found:', variants.length);
      return NextResponse.json({
        error: 'Some products not found',
        details: {
          requested: variantIds,
          found: variants.map(v => v.id),
          storeId: store.id
        }
      }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems: any[] = [];
    const cartItems: any[] = [];

    for (const item of items) {
      const variant = variants.find(v => v.id === item.variantId);
      if (!variant) continue;

      // Check stock
      if (variant.trackQuantity && variant.stock < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${variant.product.name}`
        }, { status: 400 });
      }

      const itemTotal = variant.price * item.quantity;
      subtotal += itemTotal;

      // Prepare line items for payment
      // Process images to ensure they are valid URLs
      let productImages: string[] = [];
      if (variant.product.images && Array.isArray(variant.product.images)) {
        productImages = (variant.product.images as string[])
          .filter((img: string) => img && typeof img === 'string')
          .map((img: string) => {
            // If it's a relative path, convert to absolute URL
            if (img.startsWith('/')) {
              return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${img}`;
            }
            // Check if it's a valid URL
            try {
              new URL(img);
              return img;
            } catch {
              // If not a valid URL, skip it
              return null;
            }
          })
          .filter((img): img is string => img !== null)
          .slice(0, 8); // Stripe allows max 8 images
      }

      lineItems.push({
        price_data: {
          currency: store.currency.toLowerCase(),
          product_data: {
            name: variant.product.name,
            description: variant.name !== variant.product.name ? variant.name : undefined,
            images: productImages,
            metadata: {
              productId: variant.productId,
              variantId: variant.id,
            }
          },
          unit_amount: Math.round(variant.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      });

      // Prepare cart items for order creation
      cartItems.push({
        variantId: variant.id,
        productId: variant.productId,
        quantity: item.quantity,
        price: variant.price,
        title: variant.product.name,
        variantTitle: variant.name,
      });
    }

    // Apply discount if provided
    let discountAmount = 0;
    let appliedDiscount = null;
    
    if (discountCode) {
      // Check discount validity
      const discount = await validateDiscount(store.id, discountCode, subtotal);
      if (discount) {
        discountAmount = calculateDiscountAmount(discount, subtotal);
        appliedDiscount = discount;
      }
    }

    // Calculate shipping (simple flat rate for now)
    const shippingAmount = 10; // $10 flat rate shipping

    // Calculate tax (simple percentage for now)
    const taxRate = 0.08; // 8% tax
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;
    const total = subtotal - discountAmount + taxAmount + shippingAmount;

    // Create checkout session based on payment method
    if (paymentMethod === 'nuvi') {
      const nuviSettings = paymentMethods.nuvi;
      if (!nuviSettings?.enabled) {
        return NextResponse.json({
          error: 'Nuvi payment not enabled'
        }, { status: 400 });
      }

      // Check if Nuvi connected account is configured
      if (!NUVI_CONNECTED_ACCOUNT_ID) {
        console.error('[CHECKOUT] Nuvi Stripe account ID not configured');
        return NextResponse.json({
          error: 'Payment processor not configured'
        }, { status: 500 });
      }

      // Calculate platform fees
      const commission = nuviSettings.settings?.commission || 5.9; // 5.9% commission (includes all costs)
      const fixedFee = nuviSettings.settings?.fixedFee || 0.50; // $0.50 fixed fee
      const platformFee = Math.round((total * commission / 100 + fixedFee) * 100); // Convert to cents
      const merchantPayout = total - (platformFee / 100); // Amount merchant will receive

      // Create Stripe checkout session using Nuvi Software Limited account
      const session = await createNuviCheckoutSession({
        amount: Math.round(total * 100), // Convert to cents
        currency: store.currency.toLowerCase(),
        customerEmail: customer.email,
        lineItems: lineItems,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${subdomain}/checkout/success?session_id={CHECKOUT_SESSION_ID}&payment=nuvi`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${subdomain}/cart`,
        shippingAddressCollection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'TR'],
        },
        shippingOptions: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: Math.round(shippingAmount * 100),
                currency: store.currency.toLowerCase(),
              },
              display_name: 'Standard Shipping',
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 5,
                },
                maximum: {
                  unit: 'business_day',
                  value: 7,
                },
              },
            },
          },
        ],
        metadata: {
          storeId: store.id,
          paymentMethod: 'nuvi',
          platformFee: platformFee.toString(),
          merchantPayout: merchantPayout.toFixed(2),
          cartItems: JSON.stringify(cartItems),
          discount: appliedDiscount ? JSON.stringify({
            code: discountCode,
            amount: discountAmount,
          }) : undefined,
          ...metadata,
        },
      });

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        paymentMethod: 'nuvi',
      });

    } else if (paymentMethod === 'stripe') {
      const stripeSettings = paymentMethods.stripe;
      if (!stripeSettings?.enabled || !stripeSettings?.settings?.secretKey) {
        return NextResponse.json({
          error: 'Stripe not configured'
        }, { status: 400 });
      }

      // Initialize Stripe with store's secret key
      const storeStripe = new Stripe(stripeSettings.settings.secretKey, {
        apiVersion: '2024-11-20.acacia',
      });

      // Create Stripe checkout session
      const session = await storeStripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${subdomain}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${subdomain}/cart`,
        customer_email: customer.email,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU'],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: Math.round(shippingAmount * 100),
                currency: store.currency.toLowerCase(),
              },
              display_name: 'Standard Shipping',
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 5,
                },
                maximum: {
                  unit: 'business_day',
                  value: 7,
                },
              },
            },
          },
        ],
        metadata: {
          storeId: store.id,
          cartItems: JSON.stringify(cartItems),
          discount: appliedDiscount ? JSON.stringify({
            code: discountCode,
            amount: discountAmount,
          }) : undefined,
          ...metadata,
        },
        allow_promotion_codes: !appliedDiscount, // Allow promo codes if no discount applied
        invoice_creation: {
          enabled: true,
        },
      });

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        paymentMethod: 'stripe',
      });

    } else if (paymentMethod === 'paypal') {
      // PayPal implementation would go here
      return NextResponse.json({
        error: 'PayPal not implemented yet'
      }, { status: 501 });
    } else if (paymentMethod === 'manual') {
      // Create order for manual payment
      const order = await prisma.order.create({
        data: {
          storeId: store.id,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
          customerEmail: customer.email,
          customerName: customer.name,
          customerPhone: customer.phone || '',
          status: 'pending_payment',
          financialStatus: 'pending',
          paymentStatus: 'pending',
          currency: store.currency || 'USD',
          subtotalPrice: subtotal,
          totalDiscount: discountAmount,
          totalTax: taxAmount,
          totalShipping: shippingAmount,
          totalPrice: total,
          shippingAddress: shippingAddress as any,
          billingAddress: (billingAddress || shippingAddress) as any,
          note: 'Payment pending - Bank transfer',
          lineItems: {
            create: cartItems.map((item, index) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.title,
              variantTitle: item.variantTitle,
              price: item.price,
              quantity: item.quantity,
              totalPrice: item.price * item.quantity,
              position: index + 1,
            }))
          },
        }
      });
      
      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: 'manual',
        bankDetails: paymentMethods.manual?.settings,
        total,
        currency: store.currency || 'USD',
        message: 'Order created. Please complete the bank transfer using the provided details.',
        redirectUrl: `/s/${subdomain}/orders/${order.orderNumber}/confirmation?payment=manual`
      });
    }

    return NextResponse.json({
      error: 'Invalid payment method'
    }, { status: 400 });

  } catch (error) {
    console.error('[CHECKOUT API] Error:', error);
    console.error('[CHECKOUT API] Error details:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.message.includes('Invalid')) {
      console.error('[CHECKOUT API] Validation error details:', error);
    }
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to validate discount
async function validateDiscount(storeId: string, code: string, subtotal: number) {
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { storeId },
    select: { discounts: true }
  });

  if (!storeSettings?.discounts) return null;

  const discounts = storeSettings.discounts as any;
  const discount = discounts.find((d: any) => 
    d.code === code && 
    d.isActive &&
    (!d.startDate || new Date(d.startDate) <= new Date()) &&
    (!d.endDate || new Date(d.endDate) >= new Date()) &&
    (!d.minimumAmount || subtotal >= d.minimumAmount) &&
    (!d.usageLimit || d.usageCount < d.usageLimit)
  );

  return discount;
}

// Helper function to calculate discount amount
function calculateDiscountAmount(discount: any, subtotal: number): number {
  if (discount.type === 'percentage') {
    return subtotal * (discount.value / 100);
  } else if (discount.type === 'fixed') {
    return Math.min(discount.value, subtotal);
  }
  return 0;
}

// GET - Get checkout status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({
        error: 'Session ID required'
      }, { status: 400 });
    }

    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: { storeSettings: true }
    });

    if (!store) {
      return NextResponse.json({
        error: 'Store not found'
      }, { status: 400 });
    }
    
    const paymentMethods = store.storeSettings?.paymentMethods as any;
    const paymentType = searchParams.get('payment');
    
    let stripeInstance: Stripe;
    
    // Determine which Stripe instance to use based on payment type
    let session: Stripe.Checkout.Session;
    
    if (paymentType === 'nuvi' || (paymentMethods?.nuvi?.enabled && !paymentMethods?.stripe?.enabled)) {
      // Use Nuvi connected account for Nuvi payments
      const { retrieveNuviCheckoutSession } = await import('@/lib/stripe-connect');
      session = await retrieveNuviCheckoutSession(sessionId);
    } else {
      // Use store's Stripe for regular Stripe payments
      const stripeSettings = paymentMethods?.stripe;
      if (!stripeSettings?.enabled || !stripeSettings?.settings?.secretKey) {
        return NextResponse.json({
          error: 'Stripe not configured'
        }, { status: 400 });
      }
      stripeInstance = new Stripe(stripeSettings.settings.secretKey, {
        apiVersion: '2024-11-20.acacia',
      });
      session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    }

    return NextResponse.json({
      status: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency?.toUpperCase(),
    });

  } catch (error) {
    console.error('[CHECKOUT STATUS API] Error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}