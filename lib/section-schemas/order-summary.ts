import { SectionSchema } from '@/types/template';

export const OrderSummarySchema: SectionSchema = {
  type: 'order-summary',
  label: 'Order Summary',
  description: 'Shopping cart summary with pricing breakdown',
  icon: 'ShoppingCart',
  category: 'checkout',
  settings: [
    {
      type: 'group',
      label: 'Content',
      name: 'content',
      fields: [
        {
          type: 'text',
          name: 'title',
          label: 'Title',
          defaultValue: 'Order Summary'
        },
        {
          type: 'checkbox',
          name: 'showProductImages',
          label: 'Show Product Images',
          defaultValue: true
        },
        {
          type: 'checkbox',
          name: 'showDiscountCode',
          label: 'Show Discount Code Field',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'discountCodePlaceholder',
          label: 'Discount Code Placeholder',
          defaultValue: 'Discount code',
          condition: (settings) => settings.showDiscountCode
        }
      ]
    },
    {
      type: 'group',
      label: 'Pricing Display',
      name: 'pricing',
      fields: [
        {
          type: 'checkbox',
          name: 'showShipping',
          label: 'Show Shipping',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'shippingText',
          label: 'Shipping Label',
          defaultValue: 'Shipping',
          condition: (settings) => settings.showShipping
        },
        {
          type: 'checkbox',
          name: 'showTax',
          label: 'Show Tax',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'taxText',
          label: 'Tax Label',
          defaultValue: 'Tax',
          condition: (settings) => settings.showTax
        }
      ]
    },
    {
      type: 'group',
      label: 'Text Labels',
      name: 'labels',
      fields: [
        {
          type: 'text',
          name: 'emptyCartText',
          label: 'Empty Cart Text',
          defaultValue: 'Your cart is empty'
        },
        {
          type: 'text',
          name: 'subtotalText',
          label: 'Subtotal Label',
          defaultValue: 'Subtotal'
        },
        {
          type: 'text',
          name: 'totalText',
          label: 'Total Label',
          defaultValue: 'Total'
        }
      ]
    },
    {
      type: 'group',
      label: 'Style',
      name: 'style',
      fields: [
        {
          type: 'color',
          name: 'backgroundColor',
          label: 'Background Color',
          defaultValue: '#f9fafb'
        },
        {
          type: 'color',
          name: 'borderColor',
          label: 'Border Color',
          defaultValue: '#e5e7eb'
        },
        {
          type: 'color',
          name: 'primaryColor',
          label: 'Primary Color',
          defaultValue: '#000000'
        },
        {
          type: 'color',
          name: 'textColor',
          label: 'Text Color',
          defaultValue: '#111827'
        },
        {
          type: 'color',
          name: 'mutedColor',
          label: 'Muted Text Color',
          defaultValue: '#6b7280'
        },
        {
          type: 'color',
          name: 'successColor',
          label: 'Success Color',
          defaultValue: '#10b981'
        },
        {
          type: 'color',
          name: 'errorColor',
          label: 'Error Color',
          defaultValue: '#ef4444'
        }
      ]
    }
  ],
  defaultSettings: {
    title: 'Order Summary',
    showProductImages: true,
    showDiscountCode: true,
    discountCodePlaceholder: 'Discount code',
    showShipping: true,
    shippingText: 'Shipping',
    showTax: true,
    taxText: 'Tax',
    emptyCartText: 'Your cart is empty',
    subtotalText: 'Subtotal',
    totalText: 'Total',
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    primaryColor: '#000000',
    textColor: '#111827',
    mutedColor: '#6b7280',
    successColor: '#10b981',
    errorColor: '#ef4444'
  }
};