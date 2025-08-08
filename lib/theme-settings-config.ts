// Theme Settings Configuration Schema
// Professional schema-based system like sections

import { 
  Palette, Type, Layout, Sparkles, Monitor, Zap, 
  Globe, Play, Settings, Grid, Layers, MoreHorizontal,
  Smartphone, Tablet
} from 'lucide-react';

export interface ThemeFieldConfig {
  key: string;
  label: string;
  type: 'color' | 'font' | 'select' | 'number' | 'toggle' | 'slider' | 'spacing' | 'responsive' | 'text' | 'textarea';
  description?: string;
  defaultValue: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  responsive?: boolean;
  group?: string;
  placeholder?: string;
}

export interface ThemeGroupConfig {
  key: string;
  label: string;
  icon: any;
  description: string;
  expanded?: boolean;
  fields: ThemeFieldConfig[];
}

// Professional Theme Settings Configuration
export const themeSettingsConfig: ThemeGroupConfig[] = [
  {
    key: 'colors',
    label: 'Colors',
    icon: Palette,
    description: 'Brand colors and color palette',
    expanded: true,
    fields: [
      // Brand Colors
      {
        key: 'colors.primary',
        label: 'Primary Color',
        type: 'color',
        description: 'Main brand color for buttons, links and highlights',
        defaultValue: '#000000',
        group: 'brand',
      },
      {
        key: 'colors.secondary',
        label: 'Secondary Color',
        type: 'color',
        description: 'Secondary brand color for accents',
        defaultValue: '#666666',
        group: 'brand',
      },
      {
        key: 'colors.accent',
        label: 'Accent Color',
        type: 'color',
        description: 'Accent color for special elements',
        defaultValue: '#8B9F7E',
        group: 'brand',
      },
      
      // Base Colors
      {
        key: 'colors.background',
        label: 'Background',
        type: 'color',
        description: 'Main background color',
        defaultValue: '#FFFFFF',
        group: 'base',
      },
      {
        key: 'colors.surface',
        label: 'Surface',
        type: 'color',
        description: 'Cards and panel background',
        defaultValue: '#F9FAFB',
        group: 'base',
      },
      {
        key: 'colors.border',
        label: 'Border',
        type: 'color',
        description: 'Border and divider color',
        defaultValue: '#E5E7EB',
        group: 'base',
      },
      {
        key: 'colors.borderLight',
        label: 'Border Light',
        type: 'color',
        description: 'Light border color',
        defaultValue: '#F3F4F6',
        group: 'base',
      },
      
      // Text Colors
      {
        key: 'colors.text',
        label: 'Primary Text',
        type: 'color',
        description: 'Main text color',
        defaultValue: '#000000',
        group: 'text',
      },
      {
        key: 'colors.textMuted',
        label: 'Muted Text',
        type: 'color',
        description: 'Secondary text color',
        defaultValue: '#666666',
        group: 'text',
      },
      {
        key: 'colors.textLight',
        label: 'Light Text',
        type: 'color',
        description: 'Light text color',
        defaultValue: '#999999',
        group: 'text',
      },
      
      // Status Colors
      {
        key: 'colors.success',
        label: 'Success',
        type: 'color',
        description: 'Success state color',
        defaultValue: '#10B981',
        group: 'status',
      },
      {
        key: 'colors.error',
        label: 'Error',
        type: 'color',
        description: 'Error state color',
        defaultValue: '#EF4444',
        group: 'status',
      },
      {
        key: 'colors.warning',
        label: 'Warning',
        type: 'color',
        description: 'Warning state color',
        defaultValue: '#F59E0B',
        group: 'status',
      },
      {
        key: 'colors.info',
        label: 'Info',
        type: 'color',
        description: 'Info state color',
        defaultValue: '#3B82F6',
        group: 'status',
      },
    ],
  },
  
  {
    key: 'typography',
    label: 'Typography',
    icon: Type,
    description: 'Font families, sizes and weights',
    fields: [
      {
        key: 'typography.headingFont',
        label: 'Heading Font',
        type: 'font',
        description: 'Font family for headings',
        defaultValue: "'Playfair Display', serif",
        options: [
          { value: "'Inter', sans-serif", label: 'Inter' },
          { value: "'Playfair Display', serif", label: 'Playfair Display' },
          { value: "'Montserrat', sans-serif", label: 'Montserrat' },
          { value: "'Roboto', sans-serif", label: 'Roboto' },
          { value: "'Open Sans', sans-serif", label: 'Open Sans' },
          { value: "'Lato', sans-serif", label: 'Lato' },
          { value: "'Raleway', sans-serif", label: 'Raleway' },
          { value: "'Poppins', sans-serif", label: 'Poppins' },
          { value: "'Source Serif Pro', serif", label: 'Source Serif Pro' },
          { value: "'Crimson Text', serif", label: 'Crimson Text' },
        ],
      },
      {
        key: 'typography.bodyFont',
        label: 'Body Font',
        type: 'font',
        description: 'Font family for body text',
        defaultValue: "'Inter', sans-serif",
        options: [
          { value: "'Inter', sans-serif", label: 'Inter' },
          { value: "'Playfair Display', serif", label: 'Playfair Display' },
          { value: "'Montserrat', sans-serif", label: 'Montserrat' },
          { value: "'Roboto', sans-serif", label: 'Roboto' },
          { value: "'Open Sans', sans-serif", label: 'Open Sans' },
          { value: "'Lato', sans-serif", label: 'Lato' },
          { value: "'Raleway', sans-serif", label: 'Raleway' },
          { value: "'Poppins', sans-serif", label: 'Poppins' },
          { value: "'Nunito', sans-serif", label: 'Nunito' },
          { value: "'Work Sans', sans-serif", label: 'Work Sans' },
        ],
      },
      
      // Font Sizes
      {
        key: 'typography.fontSize.xs',
        label: 'Extra Small',
        type: 'number',
        description: 'Font size for tiny text',
        defaultValue: 0.75,
        unit: 'rem',
        min: 0.5,
        max: 1,
        step: 0.05,
        group: 'sizes',
      },
      {
        key: 'typography.fontSize.sm',
        label: 'Small',
        type: 'number',
        description: 'Font size for small text',
        defaultValue: 0.875,
        unit: 'rem',
        min: 0.6,
        max: 1.2,
        step: 0.05,
        group: 'sizes',
      },
      {
        key: 'typography.fontSize.base',
        label: 'Base',
        type: 'number',
        description: 'Base font size',
        defaultValue: 1,
        unit: 'rem',
        min: 0.8,
        max: 1.4,
        step: 0.05,
        group: 'sizes',
      },
      {
        key: 'typography.fontSize.lg',
        label: 'Large',
        type: 'number',
        description: 'Font size for large text',
        defaultValue: 1.125,
        unit: 'rem',
        min: 1,
        max: 1.6,
        step: 0.05,
        group: 'sizes',
      },
      {
        key: 'typography.fontSize.xl',
        label: 'Extra Large',
        type: 'number',
        description: 'Font size for extra large text',
        defaultValue: 1.25,
        unit: 'rem',
        min: 1.1,
        max: 1.8,
        step: 0.05,
        group: 'sizes',
      },
      {
        key: 'typography.fontSize.2xl',
        label: '2X Large',
        type: 'number',
        description: 'Font size for 2x large text',
        defaultValue: 1.5,
        unit: 'rem',
        min: 1.2,
        max: 2.2,
        step: 0.1,
        group: 'sizes',
      },
      {
        key: 'typography.fontSize.3xl',
        label: '3X Large',
        type: 'number',
        description: 'Font size for 3x large text',
        defaultValue: 1.875,
        unit: 'rem',
        min: 1.5,
        max: 2.8,
        step: 0.1,
        group: 'sizes',
      },
      {
        key: 'typography.fontSize.4xl',
        label: '4X Large',
        type: 'number',
        description: 'Font size for 4x large text',
        defaultValue: 2.25,
        unit: 'rem',
        min: 1.8,
        max: 3.5,
        step: 0.1,
        group: 'sizes',
      },
      
      // Font Weights
      {
        key: 'typography.fontWeight.light',
        label: 'Light Weight',
        type: 'select',
        description: 'Light font weight',
        defaultValue: '300',
        options: [
          { value: '200', label: '200 - Extra Light' },
          { value: '300', label: '300 - Light' },
        ],
        group: 'weights',
      },
      {
        key: 'typography.fontWeight.normal',
        label: 'Normal Weight',
        type: 'select',
        description: 'Normal font weight',
        defaultValue: '400',
        options: [
          { value: '400', label: '400 - Normal' },
          { value: '450', label: '450 - Medium' },
        ],
        group: 'weights',
      },
      {
        key: 'typography.fontWeight.medium',
        label: 'Medium Weight',
        type: 'select',
        description: 'Medium font weight',
        defaultValue: '500',
        options: [
          { value: '500', label: '500 - Medium' },
          { value: '550', label: '550 - Semi Medium' },
        ],
        group: 'weights',
      },
      {
        key: 'typography.fontWeight.semibold',
        label: 'Semibold Weight',
        type: 'select',
        description: 'Semibold font weight',
        defaultValue: '600',
        options: [
          { value: '600', label: '600 - Semibold' },
          { value: '650', label: '650 - Bold Light' },
        ],
        group: 'weights',
      },
      {
        key: 'typography.fontWeight.bold',
        label: 'Bold Weight',
        type: 'select',
        description: 'Bold font weight',
        defaultValue: '700',
        options: [
          { value: '700', label: '700 - Bold' },
          { value: '800', label: '800 - Extra Bold' },
          { value: '900', label: '900 - Black' },
        ],
        group: 'weights',
      },
      
      // Line Heights
      {
        key: 'typography.lineHeight.tight',
        label: 'Tight Line Height',
        type: 'number',
        description: 'Tight line height for headings',
        defaultValue: 1.25,
        min: 1,
        max: 1.5,
        step: 0.05,
        group: 'lineHeight',
      },
      {
        key: 'typography.lineHeight.normal',
        label: 'Normal Line Height',
        type: 'number',
        description: 'Normal line height for body text',
        defaultValue: 1.5,
        min: 1.2,
        max: 1.8,
        step: 0.1,
        group: 'lineHeight',
      },
      {
        key: 'typography.lineHeight.relaxed',
        label: 'Relaxed Line Height',
        type: 'number',
        description: 'Relaxed line height for long text',
        defaultValue: 1.75,
        min: 1.5,
        max: 2.2,
        step: 0.1,
        group: 'lineHeight',
      },
    ],
  },
  
  {
    key: 'spacing',
    label: 'Spacing',
    icon: Layout,
    description: 'Padding, margins and layout spacing',
    fields: [
      // Section Padding (Responsive)
      {
        key: 'spacing.sectionPadding.mobile',
        label: 'Section Padding Mobile',
        type: 'number',
        description: 'Section padding for mobile devices',
        defaultValue: 3,
        unit: 'rem',
        min: 1,
        max: 8,
        step: 0.5,
        group: 'sections',
      },
      {
        key: 'spacing.sectionPadding.tablet',
        label: 'Section Padding Tablet',
        type: 'number',
        description: 'Section padding for tablet devices',
        defaultValue: 4,
        unit: 'rem',
        min: 2,
        max: 10,
        step: 0.5,
        group: 'sections',
      },
      {
        key: 'spacing.sectionPadding.desktop',
        label: 'Section Padding Desktop',
        type: 'number',
        description: 'Section padding for desktop devices',
        defaultValue: 5,
        unit: 'rem',
        min: 3,
        max: 12,
        step: 0.5,
        group: 'sections',
      },
      
      // Container Settings
      {
        key: 'spacing.container.maxWidth',
        label: 'Container Max Width',
        type: 'number',
        description: 'Maximum width of content containers',
        defaultValue: 1280,
        unit: 'px',
        min: 960,
        max: 1920,
        step: 40,
        group: 'container',
      },
      {
        key: 'spacing.container.padding',
        label: 'Container Padding',
        type: 'number',
        description: 'Side padding of containers',
        defaultValue: 1,
        unit: 'rem',
        min: 0.5,
        max: 3,
        step: 0.25,
        group: 'container',
      },
      
      // Component Gaps
      {
        key: 'spacing.componentGap.sm',
        label: 'Small Gap',
        type: 'number',
        description: 'Small spacing between components',
        defaultValue: 1,
        unit: 'rem',
        min: 0.25,
        max: 2,
        step: 0.25,
        group: 'gaps',
      },
      {
        key: 'spacing.componentGap.md',
        label: 'Medium Gap',
        type: 'number',
        description: 'Medium spacing between components',
        defaultValue: 2,
        unit: 'rem',
        min: 1,
        max: 4,
        step: 0.5,
        group: 'gaps',
      },
      {
        key: 'spacing.componentGap.lg',
        label: 'Large Gap',
        type: 'number',
        description: 'Large spacing between components',
        defaultValue: 3,
        unit: 'rem',
        min: 2,
        max: 6,
        step: 0.5,
        group: 'gaps',
      },
    ],
  },
  
  {
    key: 'buttons',
    label: 'Buttons',
    icon: Zap,
    description: 'Button styles and behavior',
    fields: [
      {
        key: 'buttons.style',
        label: 'Button Style',
        type: 'select',
        description: 'Default button corner style',
        defaultValue: 'square',
        options: [
          { value: 'square', label: 'Square (No Radius)' },
          { value: 'rounded', label: 'Rounded Corners' },
          { value: 'pill', label: 'Pill Shape' },
        ],
      },
      {
        key: 'buttons.hoverEffect',
        label: 'Hover Effect',
        type: 'select',
        description: 'Button hover animation',
        defaultValue: 'darken',
        options: [
          { value: 'none', label: 'No Effect' },
          { value: 'lighten', label: 'Lighten Color' },
          { value: 'darken', label: 'Darken Color' },
          { value: 'shadow', label: 'Add Shadow' },
          { value: 'scale', label: 'Scale Up' },
        ],
      },
      
      // Button Sizes
      {
        key: 'buttons.size.sm.padding',
        label: 'Small Button Padding',
        type: 'spacing',
        description: 'Padding for small buttons',
        defaultValue: '0.5rem 1rem',
        group: 'sizes',
      },
      {
        key: 'buttons.size.sm.fontSize',
        label: 'Small Button Font Size',
        type: 'number',
        description: 'Font size for small buttons',
        defaultValue: 0.875,
        unit: 'rem',
        min: 0.7,
        max: 1,
        step: 0.05,
        group: 'sizes',
      },
      {
        key: 'buttons.size.md.padding',
        label: 'Medium Button Padding',
        type: 'spacing',
        description: 'Padding for medium buttons',
        defaultValue: '0.75rem 1.5rem',
        group: 'sizes',
      },
      {
        key: 'buttons.size.md.fontSize',
        label: 'Medium Button Font Size',
        type: 'number',
        description: 'Font size for medium buttons',
        defaultValue: 1,
        unit: 'rem',
        min: 0.8,
        max: 1.2,
        step: 0.05,
        group: 'sizes',
      },
      {
        key: 'buttons.size.lg.padding',
        label: 'Large Button Padding',
        type: 'spacing',
        description: 'Padding for large buttons',
        defaultValue: '1rem 2rem',
        group: 'sizes',
      },
      {
        key: 'buttons.size.lg.fontSize',
        label: 'Large Button Font Size',
        type: 'number',
        description: 'Font size for large buttons',
        defaultValue: 1.125,
        unit: 'rem',
        min: 1,
        max: 1.4,
        step: 0.05,
        group: 'sizes',
      },
    ],
  },
  
  {
    key: 'layout',
    label: 'Layout',
    icon: Monitor,
    description: 'Layout type, borders and shadows',
    fields: [
      {
        key: 'layout.type',
        label: 'Layout Type',
        type: 'select',
        description: 'Overall layout structure',
        defaultValue: 'full-width',
        options: [
          { value: 'full-width', label: 'Full Width' },
          { value: 'boxed', label: 'Boxed Layout' },
        ],
      },
      
      // Border Radius
      {
        key: 'layout.borderRadius.none',
        label: 'No Radius',
        type: 'number',
        description: 'No border radius',
        defaultValue: 0,
        unit: 'px',
        min: 0,
        max: 0,
        group: 'radius',
      },
      {
        key: 'layout.borderRadius.sm',
        label: 'Small Radius',
        type: 'number',
        description: 'Small border radius',
        defaultValue: 0.125,
        unit: 'rem',
        min: 0,
        max: 0.5,
        step: 0.025,
        group: 'radius',
      },
      {
        key: 'layout.borderRadius.md',
        label: 'Medium Radius',
        type: 'number',
        description: 'Medium border radius',
        defaultValue: 0.375,
        unit: 'rem',
        min: 0.2,
        max: 0.8,
        step: 0.025,
        group: 'radius',
      },
      {
        key: 'layout.borderRadius.lg',
        label: 'Large Radius',
        type: 'number',
        description: 'Large border radius',
        defaultValue: 0.5,
        unit: 'rem',
        min: 0.3,
        max: 1.2,
        step: 0.05,
        group: 'radius',
      },
      {
        key: 'layout.borderRadius.xl',
        label: 'Extra Large Radius',
        type: 'number',
        description: 'Extra large border radius',
        defaultValue: 0.75,
        unit: 'rem',
        min: 0.5,
        max: 2,
        step: 0.05,
        group: 'radius',
      },
    ],
  },
  
  {
    key: 'animations',
    label: 'Animations',
    icon: Play,
    description: 'Transitions and animations',
    fields: [
      {
        key: 'animations.sectionAnimation',
        label: 'Section Animation',
        type: 'select',
        description: 'Animation when sections come into view',
        defaultValue: 'fade',
        options: [
          { value: 'none', label: 'No Animation' },
          { value: 'fade', label: 'Fade In' },
          { value: 'slide-up', label: 'Slide Up' },
          { value: 'slide-left', label: 'Slide from Left' },
          { value: 'slide-right', label: 'Slide from Right' },
          { value: 'zoom', label: 'Zoom In' },
        ],
      },
      {
        key: 'animations.duration',
        label: 'Animation Speed',
        type: 'select',
        description: 'Overall animation speed',
        defaultValue: 'normal',
        options: [
          { value: 'fast', label: 'Fast (200ms)' },
          { value: 'normal', label: 'Normal (300ms)' },
          { value: 'slow', label: 'Slow (500ms)' },
          { value: 'slower', label: 'Slower (700ms)' },
        ],
      },
      {
        key: 'animations.transitionDuration',
        label: 'Transition Duration',
        type: 'number',
        description: 'Duration for hover and state transitions',
        defaultValue: 300,
        unit: 'ms',
        min: 100,
        max: 1000,
        step: 50,
      },
      {
        key: 'animations.easingFunction',
        label: 'Easing Function',
        type: 'select',
        description: 'Animation timing function',
        defaultValue: 'ease-in-out',
        options: [
          { value: 'ease', label: 'Ease' },
          { value: 'ease-in', label: 'Ease In' },
          { value: 'ease-out', label: 'Ease Out' },
          { value: 'ease-in-out', label: 'Ease In Out' },
          { value: 'linear', label: 'Linear' },
          { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Custom Curve' },
        ],
      },
    ],
  },
  
  {
    key: 'header',
    label: 'Header',
    icon: Layout,
    description: 'Header styling and behavior',
    fields: [
      {
        key: 'header.style',
        label: 'Header Style',
        type: 'select',
        description: 'Header background style',
        defaultValue: 'solid',
        options: [
          { value: 'transparent', label: 'Transparent' },
          { value: 'solid', label: 'Solid Background' },
          { value: 'border', label: 'Border Bottom' },
          { value: 'shadow', label: 'Drop Shadow' },
        ],
      },
      {
        key: 'header.sticky',
        label: 'Sticky Header',
        type: 'toggle',
        description: 'Keep header visible when scrolling',
        defaultValue: true,
      },
      {
        key: 'header.height.mobile',
        label: 'Mobile Height',
        type: 'number',
        description: 'Header height on mobile devices',
        defaultValue: 60,
        unit: 'px',
        min: 50,
        max: 100,
        step: 5,
        group: 'heights',
      },
      {
        key: 'header.height.desktop',
        label: 'Desktop Height',
        type: 'number',
        description: 'Header height on desktop devices',
        defaultValue: 80,
        unit: 'px',
        min: 60,
        max: 120,
        step: 5,
        group: 'heights',
      },
      
      // Announcement Bar
      {
        key: 'header.announcement.enabled',
        label: 'Announcement Bar',
        type: 'toggle',
        description: 'Show announcement bar above header',
        defaultValue: false,
        group: 'announcement',
      },
      {
        key: 'header.announcement.text',
        label: 'Announcement Text',
        type: 'text',
        description: 'Announcement bar message',
        defaultValue: '',
        placeholder: 'e.g., Free shipping on orders over $50',
        group: 'announcement',
      },
      {
        key: 'header.announcement.backgroundColor',
        label: 'Announcement Background',
        type: 'color',
        description: 'Announcement bar background color',
        defaultValue: '#000000',
        group: 'announcement',
      },
      {
        key: 'header.announcement.textColor',
        label: 'Announcement Text Color',
        type: 'color',
        description: 'Announcement bar text color',
        defaultValue: '#FFFFFF',
        group: 'announcement',
      },
    ],
  },
  
  {
    key: 'footer',
    label: 'Footer',
    icon: Layout,
    description: 'Footer styling and layout',
    fields: [
      {
        key: 'footer.style',
        label: 'Footer Style',
        type: 'select',
        description: 'Footer layout style',
        defaultValue: 'minimal',
        options: [
          { value: 'minimal', label: 'Minimal (Logo + Links)' },
          { value: 'columns', label: 'Multi-column Layout' },
          { value: 'centered', label: 'Centered Layout' },
          { value: 'newsletter', label: 'Newsletter Focus' },
        ],
      },
      {
        key: 'footer.backgroundColor',
        label: 'Background Color',
        type: 'color',
        description: 'Footer background color',
        defaultValue: '#FAFAFA',
      },
      {
        key: 'footer.textColor',
        label: 'Text Color',
        type: 'color',
        description: 'Footer text color',
        defaultValue: '#000000',
      },
      {
        key: 'footer.showSocial',
        label: 'Show Social Links',
        type: 'toggle',
        description: 'Display social media links',
        defaultValue: true,
      },
      {
        key: 'footer.showNewsletter',
        label: 'Show Newsletter',
        type: 'toggle',
        description: 'Display newsletter signup',
        defaultValue: false,
      },
      {
        key: 'footer.showPayment',
        label: 'Show Payment Icons',
        type: 'toggle',
        description: 'Display payment method icons',
        defaultValue: true,
      },
    ],
  },
];

// Helper functions for the schema
export const getFieldByKey = (key: string): ThemeFieldConfig | undefined => {
  for (const group of themeSettingsConfig) {
    const field = group.fields.find(f => f.key === key);
    if (field) return field;
  }
  return undefined;
};

export const getGroupByKey = (key: string): ThemeGroupConfig | undefined => {
  return themeSettingsConfig.find(g => g.key === key);
};

export const getAllFields = (): ThemeFieldConfig[] => {
  return themeSettingsConfig.flatMap(group => group.fields);
};

export const getFieldsByGroup = (groupKey: string): ThemeFieldConfig[] => {
  const group = getGroupByKey(groupKey);
  return group ? group.fields : [];
};

// Generate default values from schema
export const generateDefaultSettings = () => {
  const settings: any = {};
  
  for (const group of themeSettingsConfig) {
    for (const field of group.fields) {
      const keys = field.key.split('.');
      let current = settings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = field.defaultValue;
    }
  }
  
  return settings;
};