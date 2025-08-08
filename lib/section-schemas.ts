import { SectionSchema } from '@/types/section-schema';
import { loadThemeSchema } from '@/lib/services/theme-loader';

// Import platform-level schemas only
import { loginFormSchema } from './section-schemas/login-form';
import { registerFormSchema } from './section-schemas/register-form';
import { cartSchema } from './section-schemas/cart';
import { CheckoutFormSchema } from './section-schemas/checkout-form';
import { OrderSummarySchema } from './section-schemas/order-summary';
import { ShippingMethodsSchema } from './section-schemas/shipping-methods';
import { PaymentMethodSchema } from './section-schemas/payment-method';

// Cache for loaded schemas
const schemaCache = new Map<string, SectionSchema | null>();

// Platform-level schemas only (authentication, checkout, core functionality)
export const builtInSchemas: Record<string, SectionSchema> = {
  'login-form': loginFormSchema,
  'register-form': registerFormSchema,
  'cart': cartSchema,
  'checkout-form': CheckoutFormSchema,
  'order-summary': OrderSummarySchema,
  'shipping-methods': ShippingMethodsSchema,
  'payment-method': PaymentMethodSchema,
};

export async function getSectionSchema(
  sectionType: string, 
  themeName: string = 'default'
): Promise<SectionSchema | null> {
  const cacheKey = `${themeName}:${sectionType}`;
  
  // Return cached schema if available
  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey)!;
  }

  // First, try to load from theme-specific schemas using theme loader
  if (themeName && themeName !== 'default') {
    try {
      const schema = await loadThemeSchema(themeName, sectionType);
      if (schema) {
        console.log(`[getSectionSchema] Found theme-specific schema for ${themeName}/${sectionType}`);
        schemaCache.set(cacheKey, schema);
        return schema;
      }
    } catch (error) {
      console.log(`[getSectionSchema] No theme-specific schema found for ${themeName}/${sectionType}, falling back to built-in`);
    }
  }

  // Fall back to built-in schemas
  if (builtInSchemas[sectionType]) {
    const schema = builtInSchemas[sectionType];
    console.log(`[getSectionSchema] Using built-in schema for ${sectionType}`);
    schemaCache.set(cacheKey, schema);
    return schema;
  }

  // No schema found
  console.warn(`Schema not found for section: ${sectionType}`);
  schemaCache.set(cacheKey, null);
  return null;
}

// Common global settings for all sections
export const globalSettingsGroup = {
  animation: {
    title: "Animation",
    icon: "Zap",
    fields: [
      {
        key: "enableAnimation",
        label: "Enable Animation",
        type: "toggle",
        default: true
      },
      {
        key: "animationType",
        label: "Animation Type",
        type: "select",
        default: "fade",
        options: [
          { value: "none", label: "None" },
          { value: "fade", label: "Fade In" },
          { value: "slide-up", label: "Slide Up" },
          { value: "slide-down", label: "Slide Down" },
          { value: "slide-left", label: "Slide Left" },
          { value: "slide-right", label: "Slide Right" },
          { value: "zoom", label: "Zoom In" },
          { value: "blur", label: "Blur In" }
        ]
      },
      {
        key: "animationDuration",
        label: "Animation Duration",
        type: "range",
        default: 500,
        min: 100,
        max: 2000,
        step: 100,
        unit: "ms"
      },
      {
        key: "animationDelay",
        label: "Animation Delay",
        type: "range",
        default: 0,
        min: 0,
        max: 1000,
        step: 50,
        unit: "ms"
      },
      {
        key: "animationStagger",
        label: "Stagger Children",
        type: "toggle",
        default: false,
        description: "Animate child elements with delay"
      }
    ]
  },
  visibility: {
    title: "Visibility",
    icon: "Eye",
    fields: [
      {
        key: "hideOnMobile",
        label: "Hide on Mobile",
        type: "toggle",
        default: false
      },
      {
        key: "hideOnTablet",
        label: "Hide on Tablet",
        type: "toggle",
        default: false
      },
      {
        key: "hideOnDesktop",
        label: "Hide on Desktop",
        type: "toggle",
        default: false
      },
      {
        key: "lazyLoad",
        label: "Lazy Load",
        type: "toggle",
        default: true,
        description: "Load section when scrolled into view"
      }
    ]
  },
  advanced: {
    title: "Advanced",
    icon: "Settings",
    fields: [
      {
        key: "customClass",
        label: "Custom CSS Class",
        type: "text",
        default: "",
        placeholder: "custom-section"
      },
      {
        key: "customId",
        label: "Custom ID",
        type: "text",
        default: "",
        placeholder: "section-id"
      },
      {
        key: "dataAttributes",
        label: "Data Attributes",
        type: "textarea",
        default: "",
        placeholder: "data-section=\"hero\"\ndata-theme=\"dark\""
      }
    ]
  }
};

// Fallback generic schema for sections without custom schemas
export const GenericSchema: SectionSchema = {
  style: {
    title: "Style",
    icon: "Palette",
    fields: [
      {
        key: "backgroundColor",
        label: "Background Color",
        type: "color",
        default: "#ffffff"
      },
      {
        key: "textColor", 
        label: "Text Color",
        type: "color",
        default: "#000000"
      }
    ]
  },
  layout: {
    title: "Layout",
    icon: "Layout", 
    fields: [
      {
        key: "sectionSpacing",
        label: "Section Spacing",
        type: "select",
        default: "medium",
        options: [
          { value: "none", label: "None" },
          { value: "small", label: "Small (32px)" },
          { value: "medium", label: "Medium (48-64px)" },
          { value: "large", label: "Large (64-80px)" },
          { value: "xl", label: "Extra Large (80-96px)" }
        ]
      },
      {
        key: "padding",
        label: "Inner Padding",
        type: "select",
        default: "medium",
        options: [
          { value: "none", label: "None" },
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "xl", label: "Extra Large" }
        ]
      },
      {
        key: "width",
        label: "Content Width", 
        type: "select",
        default: "container",
        options: [
          { value: "full", label: "Full Width" },
          { value: "container", label: "Container" },
          { value: "narrow", label: "Narrow" }
        ]
      },
      {
        key: "alignment",
        label: "Content Alignment",
        type: "select", 
        default: "center",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" }
        ]
      },
      {
        key: "minHeight",
        label: "Minimum Height",
        type: "select",
        default: "auto", 
        options: [
          { value: "auto", label: "Auto" },
          { value: "small", label: "Small (200px)" },
          { value: "medium", label: "Medium (400px)" },
          { value: "large", label: "Large (600px)" },
          { value: "screen", label: "Full Screen" }
        ]
      }
    ]
  },
  ...globalSettingsGroup
};

// Clear schema cache (useful for development)
export function clearSchemaCache() {
  schemaCache.clear();
}

// Preload schemas for better performance
export async function preloadSchemas(
  sectionTypes: string[], 
  themeName: string = 'default'
) {
  // No themes available, do nothing
  console.warn('No themes available for preloading schemas');
}