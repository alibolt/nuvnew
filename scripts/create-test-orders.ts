import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper function to generate random order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD_${timestamp}_${random}`;
}

// Helper function to generate random date within range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function createTestOrders() {
  try {
    console.log('🚀 Starting test order creation...');

    // Get the first store (you can modify this to select a specific store)
    const store = await prisma.store.findFirst({
      include: {
        products: {
          include: {
            variants: true
          }
        },
        customers: true
      }
    });

    if (!store) {
      console.error('❌ No store found. Please create a store first.');
      return;
    }

    console.log(`📦 Found store: ${store.name}`);

    // Create test customers if none exist
    if (store.customers.length === 0) {
      console.log('👥 Creating test customers...');
      
      const customerData = [
        { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '+1 555-0101' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '+1 555-0102' },
        { firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@example.com', phone: '+1 555-0103' },
        { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@example.com', phone: '+1 555-0104' },
        { firstName: 'Michael', lastName: 'Wilson', email: 'michael.w@example.com', phone: '+1 555-0105' },
        { firstName: 'Sarah', lastName: 'Brown', email: 'sarah.brown@example.com', phone: '+1 555-0106' },
        { firstName: 'David', lastName: 'Jones', email: 'david.jones@example.com', phone: '+1 555-0107' },
        { firstName: 'Lisa', lastName: 'Miller', email: 'lisa.miller@example.com', phone: '+1 555-0108' },
        { firstName: 'James', lastName: 'Taylor', email: 'james.t@example.com', phone: '+1 555-0109' },
        { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@example.com', phone: '+1 555-0110' }
      ];

      for (const data of customerData) {
        await prisma.customer.create({
          data: {
            ...data,
            storeId: store.id
          }
        });
      }

      // Refresh store with customers
      store.customers = await prisma.customer.findMany({
        where: { storeId: store.id }
      });
    }

    // Check if store has products
    if (store.products.length === 0) {
      console.error('❌ No products found in store. Please add products first.');
      return;
    }

    // Order statuses and their distribution
    const statusDistribution = [
      { status: 'pending', financialStatus: 'pending', fulfillmentStatus: 'unfulfilled', count: 5 },
      { status: 'processing', financialStatus: 'paid', fulfillmentStatus: 'unfulfilled', count: 8 },
      { status: 'completed', financialStatus: 'paid', fulfillmentStatus: 'fulfilled', count: 15 },
      { status: 'cancelled', financialStatus: 'refunded', fulfillmentStatus: 'unfulfilled', count: 2 }
    ];

    let totalOrdersCreated = 0;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // Last 90 days

    for (const statusConfig of statusDistribution) {
      console.log(`\n📝 Creating ${statusConfig.count} ${statusConfig.status} orders...`);

      for (let i = 0; i < statusConfig.count; i++) {
        // Random customer
        const customer = faker.helpers.arrayElement(store.customers);
        
        // Random products (1-5 items per order)
        const itemCount = faker.number.int({ min: 1, max: 5 });
        const selectedProducts = faker.helpers.arrayElements(store.products, itemCount);
        
        // Calculate order totals
        let subtotal = 0;
        const lineItems = [];

        for (const product of selectedProducts) {
          const variant = faker.helpers.arrayElement(product.variants);
          const quantity = faker.number.int({ min: 1, max: 3 });
          const lineTotal = variant.price * quantity;
          subtotal += lineTotal;

          lineItems.push({
            productId: product.id,
            variantId: variant.id,
            quantity,
            price: variant.price,
            title: product.name,
            variantTitle: variant.name,
            sku: variant.sku || `SKU-${variant.id.slice(-8)}`,
            image: typeof product.images === 'string' ? JSON.parse(product.images)[0] : product.images?.[0] || null,
            totalPrice: lineTotal,
            requiresShipping: true,
            taxable: true
          });
        }

        // Calculate shipping and tax
        const shippingRate = faker.number.float({ min: 5, max: 20, precision: 0.01 });
        const taxRate = 0.08; // 8% tax
        const totalTax = subtotal * taxRate;
        const totalShipping = shippingRate;
        const totalDiscount = faker.datatype.boolean(0.3) ? faker.number.float({ min: 5, max: 50, precision: 0.01 }) : 0;
        const totalPrice = subtotal + totalTax + totalShipping - totalDiscount;

        // Create shipping address
        const shippingAddress = {
          name: `${customer.firstName} ${customer.lastName}`,
          address1: faker.location.streetAddress(),
          address2: faker.datatype.boolean(0.3) ? faker.location.secondaryAddress() : '',
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          zip: faker.location.zipCode(),
          country: 'US',
          phone: customer.phone
        };

        // Create order
        const orderDate = randomDate(startDate, endDate);
        const order = await prisma.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            storeId: store.id,
            customerId: customer.id,
            customerEmail: customer.email,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerPhone: customer.phone,
            status: statusConfig.status,
            financialStatus: statusConfig.financialStatus,
            fulfillmentStatus: statusConfig.fulfillmentStatus,
            subtotalPrice: subtotal,
            totalTax,
            totalShipping,
            totalDiscount,
            totalPrice,
            currency: 'USD',
            shippingAddress,
            billingAddress: shippingAddress,
            shippingLines: [{
              title: faker.helpers.arrayElement(['Standard Shipping', 'Express Shipping', 'Next Day Delivery']),
              price: totalShipping,
              carrier: faker.helpers.arrayElement(['USPS', 'FedEx', 'UPS', 'DHL'])
            }],
            note: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
            tags: faker.helpers.arrayElements(['vip', 'wholesale', 'retail', 'first-time', 'returning'], faker.number.int({ min: 0, max: 2 })),
            createdAt: orderDate,
            updatedAt: orderDate,
            lineItems: {
              create: lineItems
            }
          }
        });

        // Add timeline events
        const timelineEvents = [];
        
        // Order created event
        timelineEvents.push({
          event: 'order_created',
          title: 'Order Created',
          description: 'Order was created',
          timestamp: orderDate.toISOString(),
          metadata: { source: 'test_script' }
        });

        // Payment events for paid orders
        if (statusConfig.financialStatus === 'paid') {
          const paymentDate = new Date(orderDate);
          paymentDate.setHours(paymentDate.getHours() + faker.number.int({ min: 1, max: 4 }));
          
          timelineEvents.push({
            event: 'payment_received',
            title: 'Payment Received',
            description: `Payment of $${totalPrice.toFixed(2)} was successfully processed`,
            timestamp: paymentDate.toISOString(),
            metadata: { amount: totalPrice, method: 'credit_card' }
          });
        }

        // Fulfillment events for fulfilled orders
        if (statusConfig.fulfillmentStatus === 'fulfilled') {
          const shipDate = new Date(orderDate);
          shipDate.setDate(shipDate.getDate() + faker.number.int({ min: 1, max: 3 }));
          
          timelineEvents.push({
            event: 'order_shipped',
            title: 'Order Shipped',
            description: 'Order has been shipped',
            timestamp: shipDate.toISOString(),
            metadata: { 
              carrier: faker.helpers.arrayElement(['USPS', 'FedEx', 'UPS', 'DHL']),
              trackingNumber: faker.string.alphanumeric(16).toUpperCase()
            }
          });

          const deliverDate = new Date(shipDate);
          deliverDate.setDate(deliverDate.getDate() + faker.number.int({ min: 2, max: 5 }));
          
          timelineEvents.push({
            event: 'order_delivered',
            title: 'Order Delivered',
            description: 'Order was delivered to customer',
            timestamp: deliverDate.toISOString(),
            metadata: { signedBy: faker.person.firstName() }
          });
        }

        // Cancellation event for cancelled orders
        if (statusConfig.status === 'cancelled') {
          const cancelDate = new Date(orderDate);
          cancelDate.setHours(cancelDate.getHours() + faker.number.int({ min: 2, max: 24 }));
          
          timelineEvents.push({
            event: 'order_cancelled',
            title: 'Order Cancelled',
            description: faker.helpers.arrayElement(['Customer requested cancellation', 'Payment failed', 'Out of stock']),
            timestamp: cancelDate.toISOString(),
            metadata: { reason: 'customer_request' }
          });
        }

        // Update store settings with timeline
        const storeSettings = await prisma.storeSettings.findUnique({
          where: { storeId: store.id }
        });

        const orderTimelines = (storeSettings?.orderTimelines as any) || {};
        orderTimelines[order.id] = timelineEvents;

        await prisma.storeSettings.upsert({
          where: { storeId: store.id },
          update: { orderTimelines },
          create: { storeId: store.id, orderTimelines }
        });

        totalOrdersCreated++;
        console.log(`✅ Created order #${order.orderNumber.split('_').pop()?.substring(0, 7)} - ${statusConfig.status}`);
      }
    }

    console.log(`\n🎉 Successfully created ${totalOrdersCreated} test orders!`);
    console.log(`📊 Order distribution:`);
    console.log(`   - Pending: 5`);
    console.log(`   - Processing: 8`);
    console.log(`   - Completed: 15`);
    console.log(`   - Cancelled: 2`);

  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestOrders();