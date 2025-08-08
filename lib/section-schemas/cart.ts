import { SectionSchema } from '@/types/section-schema';

export const cartSchema: SectionSchema = {
  type: 'cart',
  label: 'Shopping Cart',
  category: 'commerce',
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
          defaultValue: 'Shopping Cart'
        },
        {
          type: 'text',
          name: 'emptyCartMessage',
          label: 'Empty Cart Message',
          defaultValue: 'Your cart is empty'
        },
        {
          type: 'text',
          name: 'emptyCartButtonText',
          label: 'Empty Cart Button Text',
          defaultValue: 'Continue Shopping'
        },
        {
          type: 'text',
          name: 'emptyCartButtonLink',
          label: 'Empty Cart Button Link',
          defaultValue: '/collections/all'
        }
      ]
    },
    {
      type: 'group',
      label: 'Features',
      name: 'features',
      fields: [
        {
          type: 'checkbox',
          name: 'showRecommendations',
          label: 'Show Product Recommendations',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'recommendationsTitle',
          label: 'Recommendations Title',
          defaultValue: 'You May Also Like',
          condition: (settings) => settings.showRecommendations
        },
        {
          type: 'checkbox',
          name: 'showShippingCalculator',
          label: 'Show Shipping Calculator',
          defaultValue: true
        },
        {
          type: 'checkbox',
          name: 'showCouponCode',
          label: 'Show Coupon Code Field',
          defaultValue: true
        },
        {
          type: 'checkbox',
          name: 'showOrderNotes',
          label: 'Show Order Notes Field',
          defaultValue: true
        },
        {
          type: 'checkbox',
          name: 'showTrustBadges',
          label: 'Show Trust Badges',
          defaultValue: true
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
          name: 'textColor',
          label: 'Text Color',
          defaultValue: '#111827'
        },
        {
          type: 'color',
          name: 'primaryColor',
          label: 'Primary Color',
          defaultValue: '#000000'
        },
        {
          type: 'color',
          name: 'secondaryColor',
          label: 'Secondary Color',
          defaultValue: '#6b7280'
        }
      ]
    }
  ],
  defaultSettings: {
    title: 'Shopping Cart',
    emptyCartMessage: 'Your cart is empty',
    emptyCartButtonText: 'Continue Shopping',
    emptyCartButtonLink: '/collections/all',
    showRecommendations: true,
    recommendationsTitle: 'You May Also Like',
    showShippingCalculator: true,
    showCouponCode: true,
    showOrderNotes: true,
    showTrustBadges: true,
    backgroundColor: '#f9fafb',
    textColor: '#111827',
    primaryColor: '#000000',
    secondaryColor: '#6b7280'
  }
};