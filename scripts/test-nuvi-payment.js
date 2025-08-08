const Stripe = require('stripe');

// Test script to verify Nuvi payment setup
async function testNuviPayment() {
  console.log('Testing Nuvi Payment Setup...\n');

  // Check environment variables
  const requiredEnvVars = {
    'PLATFORM_STRIPE_SECRET_KEY': process.env.PLATFORM_STRIPE_SECRET_KEY,
    'NUVI_STRIPE_ACCOUNT_ID': process.env.NUVI_STRIPE_ACCOUNT_ID,
    'NUVI_STRIPE_WEBHOOK_SECRET': process.env.NUVI_STRIPE_WEBHOOK_SECRET,
  };

  let allConfigured = true;
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.log(`❌ ${key} is not configured`);
      allConfigured = false;
    } else {
      console.log(`✅ ${key} is configured: ${value.substring(0, 20)}...`);
    }
  }

  if (!allConfigured) {
    console.log('\n⚠️  Please configure all environment variables first.');
    return;
  }

  // Test Stripe connection
  try {
    const stripe = new Stripe(process.env.PLATFORM_STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });

    console.log('\n📋 Creating test checkout session...');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Test Product',
            description: 'Testing Nuvi Payment Integration',
          },
          unit_amount: 1000, // $10.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: {
        test: 'true',
        processed_by: 'nuvi_platform',
      },
    });

    console.log('✅ Test checkout session created successfully!');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Payment URL: ${session.url}\n`);
    
    console.log('🎉 Nuvi Payment integration is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Enable Nuvi Payment for a test store');
    console.log('2. Make a test purchase');
    console.log('3. Check webhook logs');
    
  } catch (error) {
    console.error('❌ Error testing Stripe connection:', error.message);
  }
}

// Load environment variables
require('dotenv').config();

// Run test
testNuviPayment();