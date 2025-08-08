import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getStripeClient } from '@/lib/stripe-client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const checkoutSchema = z.object({
  storeId: z.string(),
  cartItems: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
  customer: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string().default('US'),
  }),
  billingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string().default('US'),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const { storeId, cartItems, customer, shippingAddress, billingAddress } = validation.data;

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Verify prices and stock from database
    const variantIds = cartItems.map(item => item.variantId);
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
      },
      include: {
        product: true,
      },
    });

    // Validate all variants exist and have sufficient stock
    let subtotal = 0;
    const validatedItems = [];
    
    for (const cartItem of cartItems) {
      const variant = variants.find(v => v.id === cartItem.variantId);
      
      if (!variant) {
        return apiResponse.badRequest('Product variant ${cartItem.variantId} not found');
      }

      if (variant.trackQuantity && variant.stock < cartItem.quantity) {
        return apiResponse.badRequest('Insufficient stock for ${variant.product.name}. Available: ${variant.stock}');
      }

      // Use database price, not client-provided price
      const itemPrice = variant.price;
      subtotal += itemPrice * cartItem.quantity;
      
      validatedItems.push({
        variantId: variant.id,
        quantity: cartItem.quantity,
        price: itemPrice,
        name: variant.product.name,
        variantTitle: variant.name,
      });
    }

    // Calculate totals (you can add tax calculation here)
    const taxRate = 0.08; // 8% tax - this should come from store settings
    const shippingRate = 10; // $10 shipping - this should be calculated based on location
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingRate;

    // Amount in cents for Stripe
    const amountInCents = Math.round(total * 100);

    // Get store-specific Stripe client
    const stripeClient = await getStripeClient(storeId);
    if (!stripeClient) {
      return apiResponse.badRequest('Payment processing is not configured for this store');
    }

    // Create payment intent with comprehensive metadata
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: store.currency?.toLowerCase() || 'usd',
      receipt_email: customer.email,
      shipping: {
        name: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        address: {
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
      },
      metadata: {
        storeId: storeId,
        cartItems: JSON.stringify(validatedItems),
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
      },
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      orderId: paymentIntent.id,
      subtotal,
      tax,
      shipping: shippingRate,
      total,
    });

  } catch (error) {
    console.error('[CHECKOUT API] POST Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
