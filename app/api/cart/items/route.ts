import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Get or create cart session
async function getOrCreateCartSession(subdomain: string): Promise<string> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cart_id')?.value;
  
  if (cartId) {
    return cartId;
  }
  
  // Create new cart session
  const newCartId = uuidv4();
  cookieStore.set('cart_id', newCartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  });
  
  return newCartId;
}

// Get cart items from session storage (you can replace this with a database implementation)
async function getCartItems(cartId: string): Promise<any[]> {
  // For now, we'll use cookies to store cart items
  // In production, you should use a database or Redis
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

// Save cart items to session storage
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

// POST /api/cart/items - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { variantId, quantity = 1 } = await request.json();
    
    if (!variantId) {
      return apiResponse.badRequest('Variant ID is required');
    }
    
    // Get subdomain from referer or host
    const referer = request.headers.get('referer') || '';
    const host = request.headers.get('host') || '';
    const subdomain = referer.match(/\/\/([^.]+)\./)?.[1] || host.split('.')[0];
    
    // Verify variant exists and get product details
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            store: true
          }
        }
      }
    });
    
    if (!variant) {
      return apiResponse.notFound('Variant not found');
    }
    
    // Check if product is active
    if (!variant.product.isActive) {
      return apiResponse.badRequest('Product is not available');
    }
    
    // Check stock if tracking is enabled
    if (variant.trackQuantity && !variant.continueSellingWhenOutOfStock) {
      if (variant.stock < quantity) {
        return apiResponse.badRequest('Insufficient stock');
      }
    }
    
    // Get or create cart session
    const cartId = await getOrCreateCartSession(subdomain);
    const cartItems = await getCartItems(cartId);
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.variantId === variantId);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      cartItems[existingItemIndex].quantity += quantity;
      
      // Verify stock for updated quantity
      if (variant.trackQuantity && !variant.continueSellingWhenOutOfStock) {
        if (variant.stock < cartItems[existingItemIndex].quantity) {
          cartItems[existingItemIndex].quantity = variant.stock;
        }
      }
    } else {
      // Add new item
      cartItems.push({
        variantId,
        productId: variant.productId,
        quantity,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        productName: variant.product.name,
        variantName: variant.name,
        sku: variant.sku,
        image: Array.isArray(variant.product.images) 
          ? variant.product.images[0] 
          : JSON.parse(variant.product.images as string || '[]')[0],
        addedAt: new Date().toISOString()
      });
    }
    
    // Save updated cart
    await saveCartItems(cartId, cartItems);
    
    return NextResponse.json({
      success: true,
      cartItems,
      cartTotal: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// GET /api/cart/items - Get cart items
export async function GET(request: NextRequest) {
  try {
    const subdomain = request.headers.get('host')?.split('.')[0] || '';
    const cartId = await getOrCreateCartSession(subdomain);
    const cartItems = await getCartItems(cartId);
    
    return NextResponse.json({
      cartItems,
      cartTotal: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    return NextResponse.json(
      { error: 'Failed to get cart' },
      { status: 500 }
    );
  }
}