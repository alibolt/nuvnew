#!/bin/bash

# Stripe webhook listener for Nuvi payments
echo "🚀 Starting Stripe webhook listener for Nuvi payments..."
echo ""
echo "This will forward webhook events from Stripe to your local development server."
echo "Keep this running while testing Nuvi payments."
echo ""

# Check if stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed. Please install it first:"
    echo "   macOS: brew install stripe/stripe-cli/stripe"
    echo "   Other: https://stripe.com/docs/stripe-cli#install"
    exit 1
fi

# Forward webhooks to local endpoint
echo "📡 Listening for Nuvi payment webhooks..."
echo "   Forwarding to: http://localhost:3000/api/webhooks/nuvi"
echo ""
echo "Press Ctrl+C to stop"
echo ""

stripe listen --forward-to http://localhost:3000/api/webhooks/nuvi \
  --events checkout.session.completed,payment_intent.succeeded,payment_intent.payment_failed \
  --skip-verify