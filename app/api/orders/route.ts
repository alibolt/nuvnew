import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      notes,
      items,
      totalAmount
    } = body;

    // Validate required fields
    if (!storeId || !customerName || !customerEmail || !items || items.length === 0) {
      return apiResponse.badRequest('Missing required fields');
    }

    // Generate unique order number
    const orderNumber = `ORD-${nanoid(10).toUpperCase()}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: address || {},
        billingAddress: address || {},
        note: notes,
        subtotalPrice: totalAmount,
        totalPrice: totalAmount,
        storeId,
        lineItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title || 'Product',
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.price * item.quantity
          }))
        }
      },
      include: {
        lineItems: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    // Update variant stock
    for (const item of items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('CREATE_ORDER_ERROR', error);
    return apiResponse.serverError();
  }
}