import { SectionSchema } from '@/types/template';

export const ShippingMethodsSchema: SectionSchema = {
  type: 'shipping-methods',
  label: 'Shipping Methods',
  description: 'Shipping options selector with rates and delivery estimates',
  icon: 'Truck',
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
          defaultValue: 'Shipping Method'
        },
        {
          type: 'text',
          name: 'subtitle',
          label: 'Subtitle',
          defaultValue: 'Choose your preferred shipping option'
        },
        {
          type: 'checkbox',
          name: 'showEstimatedDelivery',
          label: 'Show Estimated Delivery',
          defaultValue: true
        },
        {
          type: 'checkbox',
          name: 'showMethodDescription',
          label: 'Show Method Description',
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
          defaultValue: '#ffffff'
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
          name: 'selectedBorderColor',
          label: 'Selected Border Color',
          defaultValue: '#000000'
        }
      ]
    }
  ],
  defaultSettings: {
    title: 'Shipping Method',
    subtitle: 'Choose your preferred shipping option',
    showEstimatedDelivery: true,
    showMethodDescription: true,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    primaryColor: '#000000',
    textColor: '#111827',
    mutedColor: '#6b7280',
    selectedBorderColor: '#000000'
  }
};