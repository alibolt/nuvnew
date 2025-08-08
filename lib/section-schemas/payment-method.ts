import { SectionSchema } from '@/types/template';

export const PaymentMethodSchema: SectionSchema = {
  type: 'payment-method',
  label: 'Payment Method',
  description: 'Secure payment form with Stripe integration',
  icon: 'CreditCard',
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
          defaultValue: 'Payment'
        },
        {
          type: 'text',
          name: 'subtitle',
          label: 'Subtitle',
          defaultValue: 'All transactions are secure and encrypted'
        },
        {
          type: 'checkbox',
          name: 'showSecurityBadges',
          label: 'Show Security Badges',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'securityText',
          label: 'Security Text',
          defaultValue: 'Your payment information is encrypted and secure',
          condition: (settings) => settings.showSecurityBadges
        }
      ]
    },
    {
      type: 'group',
      label: 'Test Mode',
      name: 'testMode',
      fields: [
        {
          type: 'checkbox',
          name: 'showTestModeWarning',
          label: 'Show Test Mode Warning',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'testModeText',
          label: 'Test Mode Text',
          defaultValue: 'Test mode - Use card 4242 4242 4242 4242',
          condition: (settings) => settings.showTestModeWarning
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
          defaultValue: '#ffffff'
        },
        {
          type: 'color',
          name: 'formBackgroundColor',
          label: 'Form Background Color',
          defaultValue: '#f9fafb'
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
          name: 'errorColor',
          label: 'Error Color',
          defaultValue: '#ef4444'
        },
        {
          type: 'color',
          name: 'successColor',
          label: 'Success Color',
          defaultValue: '#10b981'
        }
      ]
    }
  ],
  defaultSettings: {
    title: 'Payment',
    subtitle: 'All transactions are secure and encrypted',
    showSecurityBadges: true,
    securityText: 'Your payment information is encrypted and secure',
    showTestModeWarning: true,
    testModeText: 'Test mode - Use card 4242 4242 4242 4242',
    backgroundColor: '#ffffff',
    formBackgroundColor: '#f9fafb',
    primaryColor: '#000000',
    textColor: '#111827',
    mutedColor: '#6b7280',
    errorColor: '#ef4444',
    successColor: '#10b981'
  }
};