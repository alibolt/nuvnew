#!/bin/bash

echo "Setting up Nuvi Software Limited Stripe integration..."
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed. Please install it first:"
    echo "   brew install stripe/stripe-cli/stripe"
    echo "   or visit: https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "✅ Stripe CLI is installed"
echo ""

# Check if logged in to Stripe
echo "Checking Stripe CLI login status..."
if ! stripe config --list &> /dev/null; then
    echo "❌ Not logged in to Stripe CLI"
    echo "Please run: stripe login"
    exit 1
fi

echo "✅ Logged in to Stripe CLI"
echo ""

# Instructions for setting up Nuvi Software Limited account
echo "📋 To connect Nuvi Software Limited account:"
echo ""
echo "1. Get the Nuvi Software Limited Stripe Account ID:"
echo "   - Log in to Stripe Dashboard with Nuvi Software Limited credentials"
echo "   - Go to Settings → Account details"
echo "   - Copy the Account ID (starts with 'acct_')"
echo ""
echo "2. Set up webhook endpoints:"
echo "   stripe listen --forward-to localhost:3000/api/webhooks/nuvi \\"
echo "     --events checkout.session.completed,payment_intent.succeeded \\"
echo "     --account {NUVI_ACCOUNT_ID}"
echo ""
echo "3. Update your .env file with:"
echo "   PLATFORM_STRIPE_SECRET_KEY=sk_live_... (Platform account key)"
echo "   NUVI_STRIPE_ACCOUNT_ID=acct_... (Nuvi Software Limited account ID)"
echo "   NUVI_STRIPE_WEBHOOK_SECRET=whsec_... (From webhook setup)"
echo ""
echo "4. For testing with Stripe CLI:"
echo "   stripe trigger checkout.session.completed \\"
echo "     --account {NUVI_ACCOUNT_ID}"
echo ""

# Create a test webhook listener script
cat > stripe-listen-nuvi.sh << 'EOF'
#!/bin/bash
# Listen to Nuvi Software Limited webhooks
echo "Starting Nuvi webhook listener..."
echo "Make sure to update NUVI_STRIPE_ACCOUNT_ID in your .env file"
echo ""

# Read account ID from .env if available
if [ -f .env ]; then
    export $(grep NUVI_STRIPE_ACCOUNT_ID .env | xargs)
fi

if [ -z "$NUVI_STRIPE_ACCOUNT_ID" ]; then
    echo "❌ NUVI_STRIPE_ACCOUNT_ID not found in .env"
    echo "Please add: NUVI_STRIPE_ACCOUNT_ID=acct_..."
    exit 1
fi

stripe listen \
  --forward-to localhost:3000/api/webhooks/nuvi \
  --events checkout.session.completed,payment_intent.succeeded,payment_intent.payment_failed \
  --account $NUVI_STRIPE_ACCOUNT_ID
EOF

chmod +x stripe-listen-nuvi.sh

echo "✅ Created stripe-listen-nuvi.sh helper script"
echo ""
echo "To start listening to Nuvi webhooks, run:"
echo "./stripe-listen-nuvi.sh"