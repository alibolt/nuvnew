import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Helper functions from parent route
async function getCartItems(cartId: string): Promise<any[]> {
  const cookieStore = await cookies();
  const cartData = cookieStore.get(`cart_${cartId}`)?.value;
  
  if (!cartData) {
    return [];
  }
  
  try {
    return JSON.parse(decodeURIComponent(cartData));
  } catch (error) {
    return [];
  }
}

async function saveCartItems(cartId: string, items: any[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`cart_${cartId}`, encodeURIComponent(JSON.stringify(items)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  });
}

// DELETE /api/cart/items/[variantId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cart_id')?.value;
    if (!cartId) {
      return apiResponse.success({ success: true, cartItems: [] });
    }

    const cartItems = await getCartItems(cartId);
    const updatedItems = cartItems.filter(item => item.variantId !== variantId);
    await saveCartItems(cartId, updatedItems);

    return NextResponse.json({
      success: true,
      cartItems: updatedItems,
      cartTotal: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}

// PATCH /api/cart/items/[variantId] - Update item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const { quantity } = await request.json();
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cart_id')?.value;
    
    if (!cartId) {
      return NextResponse.json(
        { error: 'No cart found' },
        { status: 404 }
      );
    }

    const cartItems = await getCartItems(cartId);
    const itemIndex = cartItems.findIndex(item => item.variantId === variantId);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Verify stock if needed
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (variant && variant.trackQuantity && !variant.continueSellingWhenOutOfStock) {
      if (variant.stock < quantity) {
        return apiResponse.badRequest('Insufficient stock');
      }
    }

    cartItems[itemIndex].quantity = quantity;
    await saveCartItems(cartId, cartItems);

    return NextResponse.json({
      success: true,
      cartItems,
      cartTotal: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}