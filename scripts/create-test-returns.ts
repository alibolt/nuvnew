import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper function to generate return ID
function generateReturnId() {
  return `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to generate return number
function generateReturnNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RET${timestamp.slice(-6)}${random}`;
}

async function createTestReturns() {
  try {
    console.log('🚀 Starting test return creation...');

    // Get the first store
    const store = await prisma.store.findFirst();

    if (!store) {
      console.error('❌ No store found. Please create a store first.');
      return;
    }

    console.log(`📦 Found store: ${store.name}`);

    // Get completed orders for returns
    const completedOrders = await prisma.order.findMany({
      where: {
        storeId: store.id,
        status: 'completed',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: {
        lineItems: {
          include: {
            product: true,
            variant: true
          }
        },
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Get 10 most recent completed orders
    });

    if (completedOrders.length === 0) {
      console.error('❌ No completed orders found. Please create some orders first.');
      return;
    }

    console.log(`📋 Found ${completedOrders.length} completed orders`);

    // Return reasons
    const returnReasons = [
      'defective',
      'wrong_item',
      'not_as_described',
      'changed_mind',
      'damaged_shipping',
      'other'
    ];

    // Return conditions
    const conditions = ['new', 'used', 'damaged', 'defective'];

    // Create returns for some orders
    const returns = [];
    let totalReturnsCreated = 0;

    // Distribution of return statuses
    const statusDistribution = [
      { status: 'pending', count: 3 },
      { status: 'approved', count: 2 },
      { status: 'received', count: 2 },
      { status: 'processed', count: 1 },
      { status: 'completed', count: 2 }
    ];

    let orderIndex = 0;
    
    for (const statusConfig of statusDistribution) {
      console.log(`\n📝 Creating ${statusConfig.count} ${statusConfig.status} returns...`);

      for (let i = 0; i < statusConfig.count && orderIndex < completedOrders.length; i++) {
        const order = completedOrders[orderIndex++];
        
        // Select 1-2 items to return from the order
        const itemsToReturn = faker.helpers.arrayElements(
          order.lineItems,
          faker.number.int({ min: 1, max: Math.min(2, order.lineItems.length) })
        );

        // Calculate refund amount
        let refundAmount = 0;
        const returnItems = itemsToReturn.map(lineItem => {
          const quantity = faker.number.int({ min: 1, max: lineItem.quantity });
          const itemRefund = lineItem.price * quantity;
          refundAmount += itemRefund;

          return {
            lineItemId: lineItem.id,
            quantity,
            reason: faker.helpers.arrayElement(returnReasons),
            condition: faker.helpers.arrayElement(conditions),
            note: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : '',
            lineItem: {
              id: lineItem.id,
              title: lineItem.title,
              price: lineItem.price,
              sku: lineItem.sku,
              image: lineItem.image
            },
            refundAmount: itemRefund
          };
        });

        const returnType = faker.helpers.arrayElement(['refund', 'exchange', 'store_credit']);
        const refundShipping = faker.datatype.boolean(0.2);
        
        if (refundShipping) {
          const shippingCost = order.totalShipping || 0;
          refundAmount += shippingCost;
        }

        // Create return object
        const returnData = {
          id: generateReturnId(),
          returnNumber: generateReturnNumber(),
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          returnItems,
          returnReason: faker.lorem.sentence(),
          customerNote: faker.datatype.boolean(0.5) ? faker.lorem.paragraph() : null,
          returnType,
          status: statusConfig.status,
          refundAmount,
          refundShipping,
          restockItems: faker.datatype.boolean(0.8),
          returnShippingAddress: {
            name: order.customerName,
            address1: '123 Return Center',
            address2: 'Suite 100',
            city: 'Return City',
            state: 'RC',
            zip: '12345',
            country: 'US',
            phone: '+1 555-RETURNS'
          },
          createdAt: faker.date.recent({ days: 20 }).toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'test_script@example.com',
          adminNotes: [],
          trackingNumber: statusConfig.status !== 'pending' ? faker.string.alphanumeric(16).toUpperCase() : null,
          statusHistory: [
            {
              status: 'pending',
              timestamp: faker.date.recent({ days: 20 }).toISOString(),
              note: 'Return request created',
              updatedBy: 'customer'
            }
          ]
        };

        // Add status history for non-pending returns
        if (statusConfig.status !== 'pending') {
          const approvalDate = faker.date.recent({ days: 15 });
          returnData.statusHistory.push({
            status: 'approved',
            timestamp: approvalDate.toISOString(),
            note: 'Return request approved',
            updatedBy: 'admin@store.com'
          });

          if (['received', 'processed', 'completed'].includes(statusConfig.status)) {
            const receivedDate = new Date(approvalDate);
            receivedDate.setDate(receivedDate.getDate() + faker.number.int({ min: 3, max: 7 }));
            returnData.statusHistory.push({
              status: 'received',
              timestamp: receivedDate.toISOString(),
              note: 'Return package received at warehouse',
              updatedBy: 'warehouse@store.com'
            });
          }

          if (['processed', 'completed'].includes(statusConfig.status)) {
            const processedDate = faker.date.recent({ days: 5 });
            returnData.statusHistory.push({
              status: 'processed',
              timestamp: processedDate.toISOString(),
              note: 'Return processed, refund initiated',
              updatedBy: 'finance@store.com'
            });
          }

          if (statusConfig.status === 'completed') {
            const completedDate = faker.date.recent({ days: 2 });
            returnData.statusHistory.push({
              status: 'completed',
              timestamp: completedDate.toISOString(),
              note: 'Refund completed successfully',
              updatedBy: 'system'
            });
            returnData.refundProcessed = true;
            returnData.refundProcessedAt = completedDate.toISOString();
          }
        }

        returns.push(returnData);
        totalReturnsCreated++;
        console.log(`✅ Created return #${returnData.returnNumber.slice(-8)} for order #${order.orderNumber.split('_').pop()?.substring(0, 7)}`);
      }
    }

    // Save returns to store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { returns },
      create: {
        storeId: store.id,
        returns
      }
    });

    console.log(`\n🎉 Successfully created ${totalReturnsCreated} test returns!`);
    console.log(`📊 Return distribution:`);
    console.log(`   - Pending: 3`);
    console.log(`   - Approved: 2`);
    console.log(`   - Received: 2`);
    console.log(`   - Processed: 1`);
    console.log(`   - Completed: 2`);

  } catch (error) {
    console.error('❌ Error creating test returns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestReturns();