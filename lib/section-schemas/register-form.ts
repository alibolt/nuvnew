import { SectionSchema } from '@/types/section-schema';

export const registerFormSchema: SectionSchema = {
  type: 'register-form',
  label: 'Register Form',
  category: 'authentication',
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
          defaultValue: 'Create Account'
        },
        {
          type: 'text',
          name: 'subtitle',
          label: 'Subtitle',
          defaultValue: 'Join us and enjoy exclusive benefits!'
        },
        {
          type: 'checkbox',
          name: 'showLoginLink',
          label: 'Show Login Link',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'loginLinkText',
          label: 'Login Link Text',
          defaultValue: 'Already have an account? Sign in',
          condition: (settings) => settings.showLoginLink
        },
        {
          type: 'checkbox',
          name: 'showMarketingConsent',
          label: 'Show Marketing Consent',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'marketingConsentText',
          label: 'Marketing Consent Text',
          defaultValue: 'I would like to receive exclusive offers and promotions',
          condition: (settings) => settings.showMarketingConsent
        },
        {
          type: 'text',
          name: 'redirectUrl',
          label: 'Redirect URL After Registration',
          defaultValue: '/account'
        },
        {
          type: 'checkbox',
          name: 'requirePhone',
          label: 'Require Phone Number',
          defaultValue: false
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
          name: 'formBackgroundColor',
          label: 'Form Background Color',
          defaultValue: '#ffffff'
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
        }
      ]
    }
  ],
  defaultSettings: {
    title: 'Create Account',
    subtitle: 'Join us and enjoy exclusive benefits!',
    showLoginLink: true,
    loginLinkText: 'Already have an account? Sign in',
    showMarketingConsent: true,
    marketingConsentText: 'I would like to receive exclusive offers and promotions',
    redirectUrl: '/account',
    backgroundColor: '#f9fafb',
    formBackgroundColor: '#ffffff',
    primaryColor: '#000000',
    textColor: '#111827',
    requirePhone: false
  }
};