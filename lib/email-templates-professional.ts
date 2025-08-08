// Professional Email Templates with consistent styling
// All templates use the Nuvi brand colors and modern design

export const emailStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    .email-wrapper {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      padding: 0;
      margin: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #8B9F7E 0%, #7A8B6D 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .email-body {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    h1 {
      color: #1f2937;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 20px;
    }
    h2 {
      color: #374151;
      font-size: 20px;
      font-weight: 600;
      margin: 30px 0 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    h3 {
      color: #4b5563;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0 10px;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background-color: #8B9F7E;
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .btn-secondary {
      background-color: #6b7280;
    }
    .btn-danger {
      background-color: #ef4444;
    }
    .order-box {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background-color: #f9fafb;
      margin-bottom: 10px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .alert {
      padding: 15px 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .alert-success {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .alert-warning {
      background-color: #fed7aa;
      color: #92400e;
      border: 1px solid #fdba74;
    }
    .alert-info {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
    }
    .alert-danger {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .product-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 15px 0;
      background-color: #ffffff;
    }
    .product-image {
      width: 100%;
      max-width: 200px;
      height: auto;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #6b7280;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
    .text-muted {
      color: #6b7280;
      font-size: 14px;
    }
    .text-center {
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success {
      background-color: #d1fae5;
      color: #065f46;
    }
    .badge-warning {
      background-color: #fed7aa;
      color: #92400e;
    }
    .badge-danger {
      background-color: #fee2e2;
      color: #991b1b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background-color: #f9fafb;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #4b5563;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .icon {
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-right: 8px;
      vertical-align: middle;
    }
    @media only screen and (max-width: 600px) {
      .email-body {
        padding: 20px 15px;
      }
      h1 {
        font-size: 24px;
      }
      h2 {
        font-size: 18px;
      }
      .btn {
        padding: 12px 24px;
        font-size: 14px;
      }
    }
  </style>
`;

export const wrapEmailContent = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f5f5f5;">
  <div class="email-wrapper">
    <div class="email-container">
      ${content}
    </div>
  </div>
</body>
</html>
`;

export const professionalEmailTemplates = {
  // ORDER CONFIRMATION
  order_confirmation: {
    name: 'Order Confirmation',
    subject: 'Order Confirmed! #{{order_number}}',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0; font-size: 32px;">✓ Order Confirmed!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
          Thank you for your purchase, {{customer_name}}
        </p>
      </div>
      
      <div class="email-body">
        <div class="alert alert-success">
          <strong>🎉 Great news!</strong> We've received your order and our team is preparing it with care.
        </div>
        
        <div class="order-box">
          <h2 style="margin-top: 0;">Order Details</h2>
          <table style="width: 100%;">
            <tr>
              <td style="width: 50%;"><strong>Order Number:</strong></td>
              <td>#{{order_number}}</td>
            </tr>
            <tr>
              <td><strong>Order Date:</strong></td>
              <td>{{order_date}}</td>
            </tr>
            <tr>
              <td><strong>Payment Method:</strong></td>
              <td>{{payment_method}}</td>
            </tr>
            <tr>
              <td><strong>Total Amount:</strong></td>
              <td style="font-size: 20px; color: #059669;"><strong>{{order_total}}</strong></td>
            </tr>
          </table>
        </div>
        
        <h2>Order Items</h2>
        {{#each items}}
        <div class="item-row">
          <div style="flex: 1;">
            <strong style="font-size: 16px;">{{name}}</strong><br>
            <span class="text-muted">SKU: {{sku}} | Qty: {{quantity}}</span>
          </div>
          <div style="text-align: right;">
            <strong style="font-size: 18px;">{{price}}</strong>
          </div>
        </div>
        {{/each}}
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td style="text-align: right;">{{subtotal}}</td>
            </tr>
            <tr>
              <td><strong>Shipping:</strong></td>
              <td style="text-align: right;">{{shipping_cost}}</td>
            </tr>
            <tr>
              <td><strong>Tax:</strong></td>
              <td style="text-align: right;">{{tax}}</td>
            </tr>
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding-top: 10px;"><strong style="font-size: 18px;">Total:</strong></td>
              <td style="text-align: right; padding-top: 10px;">
                <strong style="font-size: 20px; color: #059669;">{{order_total}}</strong>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="display: flex; gap: 20px; margin: 30px 0;">
          <div style="flex: 1;">
            <h3>📦 Shipping Address</h3>
            <div class="order-box">
              <p style="margin: 0; line-height: 1.8;">{{shipping_address}}</p>
            </div>
          </div>
          <div style="flex: 1;">
            <h3>💳 Billing Address</h3>
            <div class="order-box">
              <p style="margin: 0; line-height: 1.8;">{{billing_address}}</p>
            </div>
          </div>
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{order_url}}" class="btn">Track Your Order</a>
          <a href="{{store_url}}" class="btn btn-secondary" style="margin-left: 10px;">Continue Shopping</a>
        </div>
        
        <div class="alert alert-info">
          <strong>What happens next?</strong><br>
          • We'll prepare your order within 1-2 business days<br>
          • You'll receive a shipping confirmation with tracking details<br>
          • Estimated delivery: {{estimated_delivery}}
        </div>
      </div>
      
      <div class="email-footer">
        <h3 style="color: #4b5563;">Need Help?</h3>
        <p class="text-muted">
          Reply to this email or contact us at <a href="mailto:{{store_email}}">{{store_email}}</a><br>
          Call us: {{store_phone}}
        </p>
        <div class="divider"></div>
        <div class="social-links">
          <a href="{{facebook_url}}">Facebook</a>
          <a href="{{instagram_url}}">Instagram</a>
          <a href="{{twitter_url}}">Twitter</a>
        </div>
        <p class="text-muted" style="font-size: 12px; margin-top: 20px;">
          © {{current_year}} {{store_name}}. All rights reserved.<br>
          {{store_address}}
        </p>
      </div>
    `)
  },

  // ORDER SHIPPED
  order_shipped: {
    name: 'Order Shipped',
    subject: '📦 Your order is on its way! #{{order_number}}',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0;">📦 Shipped!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Your package is on its way to you
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 16px;">Hi {{customer_name}},</p>
        <p>Exciting news! Your order <strong>#{{order_number}}</strong> has been shipped and is making its way to you.</p>
        
        <div class="alert alert-success">
          <strong>📍 Track Your Package</strong><br>
          Tracking Number: <strong>{{tracking_number}}</strong><br>
          Carrier: {{carrier}}<br>
          Estimated Delivery: <strong>{{estimated_delivery}}</strong>
        </div>
        
        <div class="text-center" style="margin: 30px 0;">
          <a href="{{tracking_url}}" class="btn">Track Package</a>
        </div>
        
        <h2>Items Shipped</h2>
        {{#each items}}
        <div class="item-row">
          <div>
            <strong>{{name}}</strong><br>
            <span class="text-muted">Quantity: {{quantity}}</span>
          </div>
          <div style="text-align: right;">
            {{price}}
          </div>
        </div>
        {{/each}}
        
        <h2>Delivery Information</h2>
        <div class="order-box">
          <h3 style="margin-top: 0;">📍 Shipping to:</h3>
          <p style="line-height: 1.8;">{{shipping_address}}</p>
          <div class="divider"></div>
          <p class="text-muted">
            <strong>Delivery Instructions:</strong><br>
            {{delivery_instructions}}
          </p>
        </div>
        
        <div class="alert alert-info">
          <strong>Delivery Tips:</strong><br>
          • Someone should be available to receive the package<br>
          • Check your tracking for real-time updates<br>
          • Contact us if you need to change delivery details
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted">Thank you for your patience!</p>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.
        </p>
      </div>
    `)
  },

  // ORDER DELIVERED
  order_delivered: {
    name: 'Order Delivered',
    subject: '✅ Your order has been delivered! #{{order_number}}',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0;">✅ Delivered!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Your order has arrived
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 16px;">Hi {{customer_name}},</p>
        <p>Great news! Your order <strong>#{{order_number}}</strong> has been successfully delivered.</p>
        
        <div class="alert alert-success">
          <strong>✅ Delivery Confirmed</strong><br>
          Delivered on: {{delivery_date}}<br>
          Delivered to: {{delivery_location}}
        </div>
        
        <h2>How was your experience?</h2>
        <p>We'd love to hear your feedback! Your opinion helps us improve.</p>
        
        <div class="text-center" style="margin: 30px 0;">
          <a href="{{review_url}}" class="btn">Leave a Review</a>
          <a href="{{store_url}}" class="btn btn-secondary" style="margin-left: 10px;">Shop Again</a>
        </div>
        
        <div class="order-box">
          <h3 style="margin-top: 0;">🎁 Special Offer</h3>
          <p>As a thank you, here's <strong>10% off</strong> your next purchase!</p>
          <div style="background: #8B9F7E; color: white; padding: 10px; border-radius: 6px; text-align: center; margin: 15px 0;">
            <strong style="font-size: 20px;">THANKYOU10</strong>
          </div>
          <p class="text-muted text-center">Valid for 30 days</p>
        </div>
        
        <div class="alert alert-info">
          <strong>Need to return or exchange?</strong><br>
          No worries! You have 30 days to return items.<br>
          <a href="{{returns_url}}">Start a return</a>
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted">Thank you for shopping with us!</p>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.
        </p>
      </div>
    `)
  },

  // ORDER CANCELLED
  order_cancelled: {
    name: 'Order Cancelled',
    subject: 'Order Cancelled: #{{order_number}}',
    htmlContent: wrapEmailContent(`
      <div class="email-header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
        <h1 style="color: white; margin: 0;">Order Cancelled</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Order #{{order_number}} has been cancelled
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 16px;">Hi {{customer_name}},</p>
        <p>We're writing to confirm that your order <strong>#{{order_number}}</strong> has been cancelled.</p>
        
        <div class="alert alert-warning">
          <strong>Cancellation Details</strong><br>
          Order Number: #{{order_number}}<br>
          Cancellation Date: {{cancellation_date}}<br>
          Reason: {{cancellation_reason}}
        </div>
        
        <h2>Refund Information</h2>
        <div class="order-box">
          <p><strong>Refund Amount:</strong> {{refund_amount}}</p>
          <p><strong>Refund Method:</strong> {{refund_method}}</p>
          <p><strong>Processing Time:</strong> 3-5 business days</p>
          <p class="text-muted">
            The refund will be credited to your original payment method.
          </p>
        </div>
        
        <h2>Cancelled Items</h2>
        {{#each items}}
        <div class="item-row">
          <div>
            <strong>{{name}}</strong><br>
            <span class="text-muted">Quantity: {{quantity}}</span>
          </div>
          <div style="text-align: right;">
            {{price}}
          </div>
        </div>
        {{/each}}
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{store_url}}" class="btn">Continue Shopping</a>
        </div>
        
        <div class="alert alert-info">
          <strong>Changed your mind?</strong><br>
          These items are still available. You can reorder them anytime!
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted">
          Questions? Contact us at <a href="mailto:{{store_email}}">{{store_email}}</a>
        </p>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.
        </p>
      </div>
    `)
  },

  // ORDER REFUNDED
  order_refunded: {
    name: 'Order Refunded',
    subject: '💰 Refund Processed: #{{order_number}}',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0;">💰 Refund Processed</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Your refund has been issued
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 16px;">Hi {{customer_name}},</p>
        <p>Your refund for order <strong>#{{order_number}}</strong> has been successfully processed.</p>
        
        <div class="alert alert-success">
          <strong>✅ Refund Confirmed</strong><br>
          Refund Amount: <strong>{{refund_amount}}</strong><br>
          Transaction ID: {{transaction_id}}<br>
          Processing Date: {{refund_date}}
        </div>
        
        <div class="order-box">
          <h3 style="margin-top: 0;">Refund Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Original Order:</strong></td>
              <td>#{{order_number}}</td>
            </tr>
            <tr>
              <td><strong>Refund Method:</strong></td>
              <td>{{refund_method}}</td>
            </tr>
            <tr>
              <td><strong>Expected Timeline:</strong></td>
              <td>3-5 business days</td>
            </tr>
            <tr>
              <td><strong>Total Refunded:</strong></td>
              <td style="font-size: 18px; color: #059669;"><strong>{{refund_amount}}</strong></td>
            </tr>
          </table>
        </div>
        
        <h2>Refunded Items</h2>
        {{#each items}}
        <div class="item-row">
          <div>
            <strong>{{name}}</strong><br>
            <span class="text-muted">Quantity: {{quantity}}</span>
          </div>
          <div style="text-align: right;">
            {{amount}}
          </div>
        </div>
        {{/each}}
        
        <div class="alert alert-info">
          <strong>📝 Note:</strong><br>
          Your refund should appear in your account within 3-5 business days, depending on your bank's processing time.
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{store_url}}" class="btn">Shop Again</a>
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted">We hope to serve you again soon!</p>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.
        </p>
      </div>
    `)
  },

  // WELCOME EMAIL
  welcome_email: {
    name: 'Welcome Email',
    subject: 'Welcome to {{store_name}}! 🎉',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0;">Welcome! 🎉</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          We're thrilled to have you join our community
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 18px;">Hi {{customer_name}},</p>
        <p style="font-size: 16px;">
          Welcome to <strong>{{store_name}}</strong>! We're excited to have you as part of our growing family of happy customers.
        </p>
        
        <div class="alert alert-success">
          <strong>🎁 Special Welcome Gift!</strong><br>
          Here's <strong>15% off</strong> your first purchase as our welcome gift to you!
          <div style="background: #8B9F7E; color: white; padding: 12px; border-radius: 6px; text-align: center; margin: 15px 0;">
            <strong style="font-size: 24px;">WELCOME15</strong>
          </div>
          <p style="margin: 5px 0 0; font-size: 12px;">Valid for 30 days</p>
        </div>
        
        <h2>What Makes Us Special</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
          <div class="order-box">
            <h3 style="margin-top: 0;">✨ Quality Products</h3>
            <p class="text-muted">Carefully curated selection of premium items</p>
          </div>
          <div class="order-box">
            <h3 style="margin-top: 0;">🚚 Fast Shipping</h3>
            <p class="text-muted">Quick delivery to your doorstep</p>
          </div>
          <div class="order-box">
            <h3 style="margin-top: 0;">💝 Great Service</h3>
            <p class="text-muted">Dedicated support team here to help</p>
          </div>
          <div class="order-box">
            <h3 style="margin-top: 0;">🔄 Easy Returns</h3>
            <p class="text-muted">30-day hassle-free return policy</p>
          </div>
        </div>
        
        <h2>Get Started</h2>
        <p>Here are some things you can do with your new account:</p>
        <ul style="line-height: 2;">
          <li>Browse our latest collections</li>
          <li>Save items to your wishlist</li>
          <li>Track your orders</li>
          <li>Earn rewards points</li>
          <li>Get exclusive member-only deals</li>
        </ul>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{store_url}}" class="btn">Start Shopping</a>
          <a href="{{account_url}}" class="btn btn-secondary" style="margin-left: 10px;">My Account</a>
        </div>
        
        <div class="order-box" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
          <h3 style="margin-top: 0;">🌟 Join Our Community</h3>
          <p>Follow us on social media for:</p>
          <ul style="margin: 10px 0;">
            <li>Exclusive sneak peeks</li>
            <li>Special promotions</li>
            <li>Style inspiration</li>
            <li>Community events</li>
          </ul>
          <div class="text-center" style="margin-top: 15px;">
            <a href="{{facebook_url}}" style="margin: 0 10px;">Facebook</a>
            <a href="{{instagram_url}}" style="margin: 0 10px;">Instagram</a>
            <a href="{{twitter_url}}" style="margin: 0 10px;">Twitter</a>
          </div>
        </div>
      </div>
      
      <div class="email-footer">
        <h3 style="color: #4b5563;">Need Help Getting Started?</h3>
        <p class="text-muted">
          Our team is here to help! Reach out at <a href="mailto:{{store_email}}">{{store_email}}</a>
        </p>
        <div class="divider"></div>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.<br>
          {{store_address}}
        </p>
      </div>
    `)
  },

  // ABANDONED CART
  abandoned_cart: {
    name: 'Abandoned Cart',
    subject: '🛒 You left something behind...',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0;">You left something behind!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Your cart is waiting for you
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 16px;">Hi {{customer_name}},</p>
        <p>We noticed you left some great items in your cart. Don't let them get away!</p>
        
        <div class="alert alert-warning">
          <strong>⏰ Hurry!</strong> Your cart will expire in 24 hours.<br>
          Complete your purchase now to secure your items.
        </div>
        
        <h2>Your Cart Items</h2>
        {{#each items}}
        <div class="product-card">
          <div style="display: flex; gap: 20px;">
            <img src="{{image}}" alt="{{name}}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 6px;">
            <div style="flex: 1;">
              <h3 style="margin: 0 0 5px;">{{name}}</h3>
              <p class="text-muted" style="margin: 5px 0;">{{description}}</p>
              <p>Quantity: {{quantity}}</p>
            </div>
            <div style="text-align: right;">
              <strong style="font-size: 20px;">{{price}}</strong>
            </div>
          </div>
        </div>
        {{/each}}
        
        <div class="order-box" style="background: #f0fdf4;">
          <table style="width: 100%;">
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td style="text-align: right;">{{subtotal}}</td>
            </tr>
            <tr>
              <td><strong>Estimated Shipping:</strong></td>
              <td style="text-align: right;">{{shipping}}</td>
            </tr>
            <tr style="border-top: 2px solid #86efac;">
              <td style="padding-top: 10px;"><strong style="font-size: 18px;">Total:</strong></td>
              <td style="text-align: right; padding-top: 10px;">
                <strong style="font-size: 22px; color: #059669;">{{cart_total}}</strong>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="alert alert-success">
          <strong>💝 Special Offer!</strong><br>
          Complete your purchase now and get <strong>10% off</strong> with code:
          <strong>COMEBACK10</strong>
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{checkout_url}}" class="btn" style="font-size: 18px; padding: 16px 32px;">
            Complete My Purchase
          </a>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p class="text-muted">Having second thoughts?</p>
          <a href="{{save_for_later_url}}" style="color: #8B9F7E;">Save for later</a>
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted">
          Questions? We're here to help at <a href="mailto:{{store_email}}">{{store_email}}</a>
        </p>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.
        </p>
      </div>
    `)
  },

  // PASSWORD RESET
  password_reset: {
    name: 'Password Reset',
    subject: '🔐 Reset your password',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Secure your account
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 16px;">Hi {{customer_name}},</p>
        <p>We received a request to reset your password for your {{store_name}} account.</p>
        
        <div class="alert alert-warning">
          <strong>⚠️ Important:</strong> This link will expire in 24 hours for security reasons.
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{reset_url}}" class="btn" style="font-size: 16px; padding: 14px 28px;">
            Reset My Password
          </a>
        </div>
        
        <div class="order-box">
          <h3 style="margin-top: 0;">🔒 Security Tips</h3>
          <ul style="line-height: 1.8;">
            <li>Choose a strong, unique password</li>
            <li>Use a combination of letters, numbers, and symbols</li>
            <li>Never share your password with anyone</li>
            <li>Enable two-factor authentication for extra security</li>
          </ul>
        </div>
        
        <div class="alert alert-info">
          <strong>Didn't request this?</strong><br>
          If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
        </div>
        
        <p class="text-muted">
          Or copy and paste this link into your browser:<br>
          <code style="background: #f3f4f6; padding: 5px; border-radius: 4px; font-size: 12px;">{{reset_url}}</code>
        </p>
      </div>
      
      <div class="email-footer">
        <p class="text-muted">
          For security assistance, contact us at <a href="mailto:{{store_email}}">{{store_email}}</a>
        </p>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.
        </p>
      </div>
    `)
  },

  // ACCOUNT CREATED
  account_created: {
    name: 'Account Created',
    subject: '✅ Your account is ready!',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0;">Account Created! ✨</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Welcome to {{store_name}}
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 16px;">Hi {{customer_name}},</p>
        <p>Your account has been successfully created! You're now part of our exclusive community.</p>
        
        <div class="order-box">
          <h3 style="margin-top: 0;">📧 Account Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Email:</strong></td>
              <td>{{customer_email}}</td>
            </tr>
            <tr>
              <td><strong>Username:</strong></td>
              <td>{{username}}</td>
            </tr>
            <tr>
              <td><strong>Member Since:</strong></td>
              <td>{{created_date}}</td>
            </tr>
          </table>
        </div>
        
        <h2>Account Benefits</h2>
        <div style="display: grid; gap: 15px;">
          <div class="order-box">
            <strong>🛍️ Faster Checkout</strong><br>
            <span class="text-muted">Save your information for quick purchases</span>
          </div>
          <div class="order-box">
            <strong>📦 Order Tracking</strong><br>
            <span class="text-muted">View all your orders in one place</span>
          </div>
          <div class="order-box">
            <strong>❤️ Wishlist</strong><br>
            <span class="text-muted">Save items for later</span>
          </div>
          <div class="order-box">
            <strong>🎁 Exclusive Offers</strong><br>
            <span class="text-muted">Member-only deals and early access</span>
          </div>
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{account_url}}" class="btn">Access My Account</a>
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted">
          Questions? Contact us at <a href="mailto:{{store_email}}">{{store_email}}</a>
        </p>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.
        </p>
      </div>
    `)
  },

  // NEWSLETTER WELCOME
  newsletter_welcome: {
    name: 'Newsletter Welcome',
    subject: '📬 Welcome to our newsletter!',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0;">You're In! 📬</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Welcome to our newsletter community
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 16px;">Hi {{customer_name}},</p>
        <p>Thank you for subscribing! You're now part of our inner circle and will be the first to know about:</p>
        
        <ul style="line-height: 2; font-size: 16px;">
          <li>🎁 Exclusive discounts & promotions</li>
          <li>🆕 New product launches</li>
          <li>💡 Tips, trends & inspiration</li>
          <li>🎉 Special events & sales</li>
          <li>📰 Company news & updates</li>
        </ul>
        
        <div class="alert alert-success">
          <strong>🎁 Welcome Gift!</strong><br>
          Here's <strong>10% off</strong> your next purchase as a thank you for joining!
          <div style="background: #8B9F7E; color: white; padding: 12px; border-radius: 6px; text-align: center; margin: 15px 0;">
            <strong style="font-size: 24px;">NEWS10</strong>
          </div>
          <p style="margin: 5px 0 0; font-size: 12px;">Valid for 30 days</p>
        </div>
        
        <h2>What to Expect</h2>
        <div class="order-box">
          <p><strong>📅 Frequency:</strong> Weekly updates every Thursday</p>
          <p><strong>📧 Content:</strong> Curated products, tips, and exclusive offers</p>
          <p><strong>🎯 Personalized:</strong> Content tailored to your interests</p>
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{store_url}}" class="btn">Start Shopping</a>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <h3>Connect With Us</h3>
          <p class="text-muted">Join our community on social media</p>
          <div style="margin: 20px 0;">
            <a href="{{facebook_url}}" style="margin: 0 10px;">Facebook</a>
            <a href="{{instagram_url}}" style="margin: 0 10px;">Instagram</a>
            <a href="{{twitter_url}}" style="margin: 0 10px;">Twitter</a>
          </div>
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted" style="font-size: 12px;">
          You're receiving this because you subscribed to our newsletter.<br>
          <a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Update Preferences</a>
        </p>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.
        </p>
      </div>
    `)
  },

  // BACK IN STOCK
  back_in_stock: {
    name: 'Back in Stock',
    subject: '🎉 {{product_name}} is back in stock!',
    htmlContent: wrapEmailContent(`
      <div class="email-header">
        <h1 style="color: white; margin: 0;">It's Back! 🎉</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          The item you wanted is available again
        </p>
      </div>
      
      <div class="email-body">
        <p style="font-size: 16px;">Hi {{customer_name}},</p>
        <p>Great news! The item you were interested in is now back in stock and ready to ship.</p>
        
        <div class="alert alert-warning">
          <strong>⚡ Act Fast!</strong> Based on previous demand, this item tends to sell out quickly.
        </div>
        
        <div class="product-card" style="background: #f9fafb;">
          <div style="text-align: center;">
            <img src="{{product_image}}" alt="{{product_name}}" class="product-image" style="max-width: 300px;">
          </div>
          <h2 style="text-align: center; margin: 20px 0;">{{product_name}}</h2>
          <p style="text-align: center; color: #6b7280;">{{product_description}}</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; color: #059669;">{{product_price}}</span>
          </div>
          <div class="text-center">
            <a href="{{product_url}}" class="btn" style="padding: 16px 32px; font-size: 16px;">
              Shop Now
            </a>
          </div>
        </div>
        
        <h2>You Might Also Like</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          {{#each related_products}}
          <div style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <img src="{{image}}" alt="{{name}}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px;">
            <h4 style="margin: 10px 0 5px;">{{name}}</h4>
            <p style="color: #059669; font-weight: bold;">{{price}}</p>
          </div>
          {{/each}}
        </div>
        
        <div class="alert alert-info" style="margin-top: 30px;">
          <strong>💡 Pro Tip:</strong> Add it to your cart now and checkout when you're ready. Items in your cart are reserved for 60 minutes.
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted">Happy Shopping!</p>
        <p class="text-muted" style="font-size: 12px;">
          © {{current_year}} {{store_name}}. All rights reserved.
        </p>
      </div>
    `)
  },

  // LOW STOCK ALERT (Admin)
  low_stock_alert: {
    name: 'Low Stock Alert',
    subject: '⚠️ Low Stock Alert: {{product_name}}',
    htmlContent: wrapEmailContent(`
      <div class="email-header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <h1 style="color: white; margin: 0;">⚠️ Low Stock Alert</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Inventory Warning - Action Required
        </p>
      </div>
      
      <div class="email-body">
        <div class="alert alert-warning">
          <strong>⚠️ Immediate Attention Required</strong><br>
          The following product is running low on inventory and needs restocking.
        </div>
        
        <div class="order-box">
          <h2 style="margin-top: 0;">Product Details</h2>
          <table style="width: 100%;">
            <tr>
              <td><strong>Product Name:</strong></td>
              <td>{{product_name}}</td>
            </tr>
            <tr>
              <td><strong>SKU:</strong></td>
              <td>{{product_sku}}</td>
            </tr>
            <tr>
              <td><strong>Current Stock:</strong></td>
              <td><span class="badge badge-danger">{{current_stock}} units</span></td>
            </tr>
            <tr>
              <td><strong>Reorder Point:</strong></td>
              <td>{{reorder_point}} units</td>
            </tr>
            <tr>
              <td><strong>Avg. Daily Sales:</strong></td>
              <td>{{daily_sales}} units/day</td>
            </tr>
            <tr>
              <td><strong>Days Until Stockout:</strong></td>
              <td><span style="color: #dc2626; font-weight: bold;">{{days_remaining}} days</span></td>
            </tr>
          </table>
        </div>
        
        <h2>📊 Sales Performance</h2>
        <div class="order-box">
          <table style="width: 100%;">
            <tr>
              <td>Last 7 Days:</td>
              <td>{{week_sales}} units sold</td>
            </tr>
            <tr>
              <td>Last 30 Days:</td>
              <td>{{month_sales}} units sold</td>
            </tr>
            <tr>
              <td>Revenue Impact:</td>
              <td>{{revenue_impact}}</td>
            </tr>
          </table>
        </div>
        
        <h2>Recommended Actions</h2>
        <ul style="line-height: 2;">
          <li>✅ Review and place reorder with supplier immediately</li>
          <li>✅ Update product availability status if needed</li>
          <li>✅ Consider increasing reorder point</li>
          <li>✅ Check for pending orders containing this product</li>
        </ul>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{admin_product_url}}" class="btn">View in Admin</a>
          <a href="{{reorder_url}}" class="btn btn-secondary" style="margin-left: 10px;">Create Reorder</a>
        </div>
        
        <div class="alert alert-info">
          <strong>💡 Tip:</strong> Enable automatic reordering to prevent stockouts in the future.
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted" style="font-size: 12px;">
          This is an automated alert from {{store_name}} inventory system.<br>
          To update alert settings, visit your admin panel.
        </p>
      </div>
    `)
  },

  // NEW ORDER NOTIFICATION (Admin)
  new_order_notification: {
    name: 'New Order Notification',
    subject: '💰 New Order: #{{order_number}}',
    htmlContent: wrapEmailContent(`
      <div class="email-header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <h1 style="color: white; margin: 0;">💰 New Order!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">
          Order #{{order_number}} received
        </p>
      </div>
      
      <div class="email-body">
        <div class="alert alert-success">
          <strong>🎉 Cha-ching!</strong> You've received a new order worth <strong>{{order_total}}</strong>
        </div>
        
        <div class="order-box">
          <h2 style="margin-top: 0;">Order Summary</h2>
          <table style="width: 100%;">
            <tr>
              <td><strong>Order Number:</strong></td>
              <td>#{{order_number}}</td>
            </tr>
            <tr>
              <td><strong>Customer:</strong></td>
              <td>{{customer_name}}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>{{customer_email}}</td>
            </tr>
            <tr>
              <td><strong>Phone:</strong></td>
              <td>{{customer_phone}}</td>
            </tr>
            <tr>
              <td><strong>Order Date:</strong></td>
              <td>{{order_date}}</td>
            </tr>
            <tr>
              <td><strong>Total Amount:</strong></td>
              <td style="font-size: 20px; color: #059669;"><strong>{{order_total}}</strong></td>
            </tr>
          </table>
        </div>
        
        <h2>Items Ordered</h2>
        <table style="width: 100%; background: #f9fafb;">
          <thead>
            <tr>
              <th style="text-align: left;">Product</th>
              <th>SKU</th>
              <th>Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td><strong>{{name}}</strong></td>
              <td>{{sku}}</td>
              <td>{{quantity}}</td>
              <td style="text-align: right;">{{price}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
        
        <h2>Customer Information</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="order-box">
            <h3 style="margin-top: 0;">📦 Shipping Address</h3>
            <p style="margin: 0;">{{shipping_address}}</p>
          </div>
          <div class="order-box">
            <h3 style="margin-top: 0;">💳 Billing Address</h3>
            <p style="margin: 0;">{{billing_address}}</p>
          </div>
        </div>
        
        <div class="order-box" style="background: #fef3c7;">
          <h3 style="margin-top: 0;">📝 Order Notes</h3>
          <p style="margin: 0;">{{order_notes}}</p>
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{admin_order_url}}" class="btn" style="padding: 16px 32px;">
            Process Order
          </a>
        </div>
        
        <div class="alert alert-info">
          <strong>Next Steps:</strong><br>
          1. Review order details<br>
          2. Prepare items for shipping<br>
          3. Print shipping label<br>
          4. Update tracking information
        </div>
      </div>
      
      <div class="email-footer">
        <p class="text-muted" style="font-size: 12px;">
          This is an automated notification from {{store_name}}.<br>
          Order received at {{order_timestamp}}
        </p>
      </div>
    `)
  }
};