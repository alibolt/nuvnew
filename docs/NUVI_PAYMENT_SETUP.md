# Nuvi Payment Integration Setup

## Overview

Nuvi Payment allows merchants to accept payments without setting up their own Stripe account. Instead, payments are processed through the Nuvi Software Limited Stripe account, with automatic fee deduction and payout scheduling.

## Features

- **No Stripe Account Required**: Merchants can start accepting payments immediately
- **Automatic Fee Deduction**: 5.9% + $0.50 per transaction (includes all costs)
- **Bank Payouts**: Automatic transfer to merchant's bank account
- **Full Integration**: Works seamlessly with the existing checkout flow

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Platform Stripe account (your main account)
PLATFORM_STRIPE_SECRET_KEY=sk_live_...

# Nuvi Software Limited Stripe account
NUVI_STRIPE_ACCOUNT_ID=acct_...
NUVI_STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Get Nuvi Account ID

1. Log in to Stripe Dashboard with Nuvi Software Limited credentials
2. Go to Settings → Account details
3. Copy the Account ID (starts with `acct_`)
4. Add it as `NUVI_STRIPE_ACCOUNT_ID` in your `.env`

### 3. Set Up Webhooks

#### Using Stripe CLI (Development)

```bash
# Run the setup script
./scripts/setup-nuvi-stripe.sh

# Start webhook listener
./stripe-listen-nuvi.sh
```

#### Production Webhook

1. In Stripe Dashboard (Nuvi account), go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/nuvi`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the signing secret to `NUVI_STRIPE_WEBHOOK_SECRET`

### 4. Enable for Merchants

Merchants can enable Nuvi payments in their dashboard:

1. Go to Settings → Payment Methods
2. Enable "Nuvi Payment"
3. Fill in bank account details for payouts
4. Save settings

## How It Works

### Payment Flow

1. **Customer Checkout**: Customer selects Nuvi payment at checkout
2. **Stripe Processing**: Payment processed through Nuvi Software Limited Stripe account
3. **Fee Deduction**: Platform fee (5.9% + $0.50) is automatically calculated
4. **Order Creation**: Order is created with payment confirmation
5. **Payout Scheduling**: Merchant payout is scheduled (typically 2-3 days)

### Fee Structure

For a $100 sale:
- Sale Amount: $100.00
- Nuvi Fee: -$6.40 (5.9% + $0.50)
- Merchant Receives: $93.60

The fee includes:
- Stripe processing (2.9% + $0.30)
- Bank transfer fees
- Currency exchange (if needed)
- Platform operations & profit

### Bank Payouts

Merchants provide their bank details:
- Bank Name
- Account Holder Name
- Account Number
- Account Type (Checking/Savings)
- IBAN (for international)
- SWIFT/BIC Code

Payouts are automatically scheduled 2-3 business days after payment.

## Testing

### Test Cards

Use Stripe test cards in development:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication: `4000 0025 0000 3155`

### Webhook Testing

```bash
# Trigger test webhook
stripe trigger checkout.session.completed \
  --account $NUVI_STRIPE_ACCOUNT_ID
```

## Monitoring

### Platform Transactions

View all platform transactions:
```sql
SELECT * FROM PlatformTransaction 
WHERE type IN ('commission', 'payout')
ORDER BY createdAt DESC;
```

### Webhook Logs

Check webhook processing:
```bash
tail -f logs/nuvi-webhooks.log
```

## Troubleshooting

### Common Issues

1. **"Payment processor not configured"**
   - Check `NUVI_STRIPE_ACCOUNT_ID` is set
   - Verify Stripe API keys are correct

2. **Webhook signature verification failed**
   - Ensure `NUVI_STRIPE_WEBHOOK_SECRET` matches webhook endpoint
   - Check webhook URL is correct

3. **Payouts not processing**
   - Verify merchant bank details are complete
   - Check PlatformTransaction records for errors

### Debug Mode

Enable debug logging:
```env
STRIPE_DEBUG=true
NUVI_PAYMENT_DEBUG=true
```

## Security

- Bank account numbers are partially masked in logs
- Sensitive data is encrypted at rest
- All payments are PCI compliant through Stripe
- Webhook signatures are verified

## Support

For technical issues:
- Check logs in `/api/webhooks/nuvi`
- Review PlatformTransaction records
- Contact Nuvi support team