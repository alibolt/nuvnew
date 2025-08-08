# Email Editor Discount Block Test Guide

## Summary
The discount block feature has been successfully implemented for the email editor. Users can now:

1. **Add a discount block** to their email templates
2. **Select from existing discounts** in their store
3. **Customize the appearance** of the discount block
4. **Preview the discount** in the email builder

## Implementation Details

### Files Modified:
1. **EmailTemplateBuilder.tsx** 
   - Added DISCOUNT to BLOCK_TYPES
   - Added discount block to BLOCK_LIBRARY with Tag icon
   - Implemented discount block rendering in BlockRenderer
   - Added discount settings in BlockSettings component
   - Updated HTML generation for discount blocks

2. **DiscountPicker.tsx** (Already created)
   - Component for selecting discounts from store
   - Shows active discounts with details
   - Search and filter functionality

### Features Added:

#### Visual Discount Block
- Shows discount code prominently
- Displays description
- Optional expiry date
- Customizable colors (background & text)
- Responsive design

#### Discount Picker Modal
- Lists all active store discounts
- Shows discount details (type, value, usage limits, expiry)
- Search functionality
- Visual indicators for discount types

#### Settings Panel
- Background color picker
- Text color picker  
- Show/hide expiry date toggle
- Manual code entry (if not selecting from store)
- Description field

## How to Test:

1. **Navigate to Email Templates:**
   - Go to Dashboard > Store > Marketing > Email Templates

2. **Create or Edit a Template:**
   - Click "Create Email Template" or edit an existing one
   - This opens the Email Template Builder

3. **Add a Discount Block:**
   - From the sidebar, find "Store" category
   - Click or drag the "Discount" block to your template

4. **Configure the Discount:**
   - Option 1: Select from existing store discounts using the picker
   - Option 2: Manually enter a discount code and description

5. **Customize Appearance:**
   - Click on the discount block to select it
   - In the Settings panel, adjust:
     - Background color (default: #8B9F7E - Nuvi green)
     - Text color (default: white)
     - Show expiry date toggle

6. **Preview:**
   - Click Preview button to see how it looks
   - The discount will appear as a styled card with the code prominently displayed

## Default Styling:
- Background: Nuvi brand green (#8B9F7E)
- Text: White (#ffffff)
- Padding: 20px 30px
- Border radius: 8px
- Centered alignment

## HTML Output Example:
```html
<div style="text-align: center;">
  <div style="display: inline-block; background: #8B9F7E; color: #ffffff; padding: 20px 30px; border-radius: 8px; text-align: center;">
    <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Save 10% on your next purchase</p>
    <p style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">SAVE10</p>
    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">Expires: 12/31/2024</p>
  </div>
</div>
```

## Notes:
- The discount block integrates seamlessly with the existing email builder
- It works with both drag-and-drop and click-to-add methods
- The block is fully responsive and renders well in email clients
- Colors can be customized to match brand guidelines