import { prisma } from '@/lib/prisma';

export async function createTestDataForStore(storeId: string) {
  try {
    // Create test customers - check if they already exist first
    const existingCustomers = await prisma.customer.findMany({
      where: {
        storeId,
        email: {
          in: ['john.doe@example.com', 'jane.smith@example.com', 'test.customer@example.com']
        }
      }
    });

    if (existingCustomers.length === 0) {
      // Create customers individually to handle duplicates
      const customersData = [
        {
          storeId,
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1 555-0101',
          acceptsMarketing: true,
          status: 'active' as const,
          totalSpent: 29900, // $299.00
          ordersCount: 2,
        },
        {
          storeId,
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1 555-0102',
          acceptsMarketing: false,
          status: 'active' as const,
          totalSpent: 15500, // $155.00
          ordersCount: 1,
        },
        {
          storeId,
          email: 'test.customer@example.com',
          firstName: 'Test',
          lastName: 'Customer',
          acceptsMarketing: true,
          status: 'active' as const,
          totalSpent: 0,
          ordersCount: 0,
        }
      ];

      for (const customerData of customersData) {
        try {
          await prisma.customer.create({ data: customerData });
        } catch (error) {
          // Ignore duplicate errors
          if (error instanceof Error && !error.message.includes('Unique constraint')) {
            throw error;
          }
        }
      }
    }

    // Get the created customers
    const customers = await prisma.customer.findMany({
      where: { storeId },
      take: 3,
    });

    // Get some products from the store
    const products = await prisma.product.findMany({
      where: { storeId },
      include: { variants: true },
      take: 5,
    });

    if (products.length === 0) {
      console.log('No products found for store, skipping order creation');
      return;
    }

    // Create test orders
    const orderData = [
      {
        storeId,
        customerId: customers[0]?.id,
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        orderNumber: `ORD-${Date.now()}-001`,
        status: 'completed',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled',
        currency: 'USD',
        subtotalPrice: 9900, // $99.00
        totalShipping: 1000, // $10.00
        totalTax: 990, // $9.90
        totalPrice: 11890, // $118.90
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          province: 'NY',
          country: 'US',
          zip: '10001',
          phone: '+1 555-0101',
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          province: 'NY',
          country: 'US',
          zip: '10001',
          phone: '+1 555-0101',
        },
        lineItems: {
          create: products.slice(0, 2).map(product => ({
            productId: product.id,
            variantId: product.variants[0]?.id,
            title: product.name,
            variantTitle: product.variants[0]?.name || 'Default',
            quantity: 1,
            price: product.variants[0]?.price || 0,
            sku: product.variants[0]?.sku,
          })),
        },
      },
      {
        storeId,
        customerId: customers[0]?.id,
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        orderNumber: `ORD-${Date.now()}-002`,
        status: 'processing',
        financialStatus: 'paid',
        fulfillmentStatus: 'unfulfilled',
        currency: 'USD',
        subtotalPrice: 20000, // $200.00
        totalShipping: 0, // Free shipping
        totalTax: 2000, // $20.00
        totalPrice: 22000, // $220.00
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          province: 'NY',
          country: 'US',
          zip: '10001',
          phone: '+1 555-0101',
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          province: 'NY',
          country: 'US',
          zip: '10001',
          phone: '+1 555-0101',
        },
        lineItems: {
          create: products.slice(0, 1).map(product => ({
            productId: product.id,
            variantId: product.variants[0]?.id,
            title: product.name,
            variantTitle: product.variants[0]?.name || 'Default',
            quantity: 2,
            price: product.variants[0]?.price || 0,
            sku: product.variants[0]?.sku,
          })),
        },
      },
      {
        storeId,
        customerId: customers[1]?.id,
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@example.com',
        orderNumber: `ORD-${Date.now()}-003`,
        status: 'pending',
        financialStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        currency: 'USD',
        subtotalPrice: 15500, // $155.00
        totalShipping: 1000, // $10.00
        totalTax: 1550, // $15.50
        totalPrice: 18050, // $180.50
        shippingAddress: {
          firstName: 'Jane',
          lastName: 'Smith',
          address1: '456 Oak Ave',
          city: 'Los Angeles',
          province: 'CA',
          country: 'US',
          zip: '90001',
          phone: '+1 555-0102',
        },
        billingAddress: {
          firstName: 'Jane',
          lastName: 'Smith',
          address1: '456 Oak Ave',
          city: 'Los Angeles',
          province: 'CA',
          country: 'US',
          zip: '90001',
          phone: '+1 555-0102',
        },
        lineItems: {
          create: products.slice(2, 4).filter(p => p).map(product => ({
            productId: product.id,
            variantId: product.variants[0]?.id,
            title: product.name,
            variantTitle: product.variants[0]?.name || 'Default',
            quantity: 1,
            price: product.variants[0]?.price || 0,
            sku: product.variants[0]?.sku,
          })),
        },
      },
      {
        storeId,
        customerName: 'Guest Customer',
        customerEmail: 'guest@example.com',
        orderNumber: `ORD-${Date.now()}-004`,
        status: 'cancelled',
        financialStatus: 'refunded',
        fulfillmentStatus: 'unfulfilled',
        currency: 'USD',
        subtotalPrice: 5000, // $50.00
        totalShipping: 500, // $5.00
        totalTax: 500, // $5.00
        totalPrice: 6000, // $60.00
        shippingAddress: {
          firstName: 'Guest',
          lastName: 'Customer',
          address1: '789 Pine St',
          city: 'Chicago',
          province: 'IL',
          country: 'US',
          zip: '60601',
          phone: '+1 555-0103',
        },
        billingAddress: {
          firstName: 'Guest',
          lastName: 'Customer',
          address1: '789 Pine St',
          city: 'Chicago',
          province: 'IL',
          country: 'US',
          zip: '60601',
          phone: '+1 555-0103',
        },
        lineItems: {
          create: products.slice(0, 1).map(product => ({
            productId: product.id,
            variantId: product.variants[0]?.id,
            title: product.name,
            variantTitle: product.variants[0]?.name || 'Default',
            quantity: 1,
            price: product.variants[0]?.price || 0,
            sku: product.variants[0]?.sku,
          })),
        },
      },
      {
        storeId,
        customerName: 'Recent Order',
        customerEmail: 'recent@example.com',
        orderNumber: `ORD-${Date.now()}-005`,
        status: 'processing',
        financialStatus: 'paid',
        fulfillmentStatus: 'partial',
        currency: 'USD',
        subtotalPrice: 35000, // $350.00
        totalShipping: 2000, // $20.00
        totalTax: 3500, // $35.00
        totalPrice: 40500, // $405.00
        shippingAddress: {
          firstName: 'Recent',
          lastName: 'Order',
          address1: '321 Elm St',
          city: 'Houston',
          province: 'TX',
          country: 'US',
          zip: '77001',
          phone: '+1 555-0104',
        },
        billingAddress: {
          firstName: 'Recent',
          lastName: 'Order',
          address1: '321 Elm St',
          city: 'Houston',
          province: 'TX',
          country: 'US',
          zip: '77001',
          phone: '+1 555-0104',
        },
        lineItems: {
          create: products.slice(0, 3).map(product => ({
            productId: product.id,
            variantId: product.variants[0]?.id,
            title: product.name,
            variantTitle: product.variants[0]?.name || 'Default',
            quantity: 1,
            price: product.variants[0]?.price || 0,
            sku: product.variants[0]?.sku,
          })),
        },
      },
    ];

    // Create orders
    for (const order of orderData) {
      await prisma.order.create({
        data: order,
      });
    }

    console.log('Test data created successfully for store:', storeId);
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}