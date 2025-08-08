import { SectionSchema } from '@/types/section-schema';

export const loginFormSchema: SectionSchema = {
  type: 'login-form',
  label: 'Login Form',
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
          defaultValue: 'Sign In'
        },
        {
          type: 'text',
          name: 'subtitle',
          label: 'Subtitle',
          defaultValue: 'Welcome back! Please sign in to your account.'
        },
        {
          type: 'checkbox',
          name: 'showRegisterLink',
          label: 'Show Register Link',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'registerLinkText',
          label: 'Register Link Text',
          defaultValue: "Don't have an account? Sign up",
          condition: (settings) => settings.showRegisterLink
        },
        {
          type: 'checkbox',
          name: 'showForgotPassword',
          label: 'Show Forgot Password Link',
          defaultValue: true
        },
        {
          type: 'text',
          name: 'forgotPasswordText',
          label: 'Forgot Password Text',
          defaultValue: 'Forgot your password?',
          condition: (settings) => settings.showForgotPassword
        },
        {
          type: 'text',
          name: 'redirectUrl',
          label: 'Redirect URL After Login',
          defaultValue: '/account'
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
    title: 'Sign In',
    subtitle: 'Welcome back! Please sign in to your account.',
    showRegisterLink: true,
    registerLinkText: "Don't have an account? Sign up",
    showForgotPassword: true,
    forgotPasswordText: 'Forgot your password?',
    redirectUrl: '/account',
    backgroundColor: '#f9fafb',
    formBackgroundColor: '#ffffff',
    primaryColor: '#000000',
    textColor: '#111827'
  }
};