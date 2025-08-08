import { SectionSchema } from '@/types/template';

export const CheckoutFormSchema: SectionSchema = {
  type: 'checkout-form',
  label: 'Checkout Form',
  description: 'Customer information and shipping address form',
  icon: 'FileText',
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
          defaultValue: 'Contact Information'
        },
        {
          type: 'text',
          name: 'subtitle',
          label: 'Subtitle',
          defaultValue: 'We\'ll use this information to send you order updates'
        }
      ]
    },
    {
      type: 'group',
      label: 'Form Fields',
      name: 'fields',
      fields: [
        {
          type: 'checkbox',
          name: 'requireEmail',
          label: 'Require Email',
          defaultValue: true
        },
        {
          type: 'checkbox',
          name: 'requirePhone',
          label: 'Require Phone Number',
          defaultValue: true
        },
        {
          type: 'checkbox',
          name: 'requireCompany',
          label: 'Require Company Name',
          defaultValue: false
        },
        {
          type: 'checkbox',
          name: 'requireAddress2',
          label: 'Require Address Line 2',
          defaultValue: false
        },
        {
          type: 'checkbox',
          name: 'showNewsletterSignup',
          label: 'Show Newsletter Signup',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'newsletterText',
          label: 'Newsletter Text',
          defaultValue: 'Email me with news and offers',
          condition: (settings) => settings.showNewsletterSignup
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
          name: 'borderColor',
          label: 'Border Color',
          defaultValue: '#e5e7eb'
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
    title: 'Contact Information',
    subtitle: 'We\'ll use this information to send you order updates',
    requireEmail: true,
    requirePhone: true,
    requireCompany: false,
    requireAddress2: false,
    showNewsletterSignup: true,
    newsletterText: 'Email me with news and offers',
    backgroundColor: '#ffffff',
    formBackgroundColor: '#f9fafb',
    primaryColor: '#000000',
    textColor: '#111827',
    borderColor: '#e5e7eb',
    errorColor: '#ef4444'
  }
};