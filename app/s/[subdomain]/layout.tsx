import { CartProvider } from '@/lib/cart-context';
import { CustomerProvider } from '@/lib/customer-context';
import { TranslationProvider } from '@/lib/hooks/use-translations';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { generateThemeCSSVariables } from '@/lib/theme-utils';
import { Toaster } from '@/components/ui/toaster';

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  
  // Get store with theme settings
  const store = await prisma.store.findUnique({
    where: { subdomain },
    select: { 
      id: true, 
      subdomain: true,
      name: true,
      themeSettings: true,
      templates: {
        where: { enabled: true },
        orderBy: { updatedAt: 'desc' },
        take: 1
      }
    },
  });

  if (!store) {
    notFound();
  }

  // Get theme settings - prioritize store-level theme settings over template settings
  let themeSettings = {};
  
  // First try to get from store's themeSettings field
  if (store.themeSettings) {
    if (typeof store.themeSettings === 'string') {
      try {
        themeSettings = JSON.parse(store.themeSettings);
      } catch (error) {
        console.error('Failed to parse store theme settings:', error);
        themeSettings = {};
      }
    } else {
      themeSettings = store.themeSettings;
    }
  }
  // Fallback to template settings if no store theme settings
  else if (store.templates[0]?.settings) {
    if (typeof store.templates[0].settings === 'string') {
      try {
        themeSettings = JSON.parse(store.templates[0].settings);
      } catch (error) {
        console.error('Failed to parse template theme settings:', error);
        themeSettings = {};
      }
    } else {
      themeSettings = store.templates[0].settings;
    }
  }

  // Convert flat settings to nested object
  const nestedSettings: any = {};
  Object.entries(themeSettings).forEach(([key, value]) => {
    const parts = key.split('.');
    let current = nestedSettings;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  });

  // Generate CSS variables
  const cssVariables = generateThemeCSSVariables(nestedSettings);
  
  // Extract unique fonts
  const fonts = new Set<string>();
  if (nestedSettings.typography?.headingFont) {
    fonts.add(nestedSettings.typography.headingFont);
  }
  if (nestedSettings.typography?.bodyFont) {
    fonts.add(nestedSettings.typography.bodyFont);
  }

  // Generate Google Fonts URL
  let googleFontsUrl = '';
  if (fonts.size > 0) {
    const fontFamilies = Array.from(fonts)
      .map(font => `family=${font.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900`)
      .join('&');
    googleFontsUrl = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
  }

  return (
    <TranslationProvider subdomain={store.subdomain}>
      <CartProvider>
        <CustomerProvider subdomain={store.subdomain}>
        {/* Theme CSS Variables and Styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              ${googleFontsUrl ? `@import url('${googleFontsUrl}');` : ''}
              
              :root {
                ${cssVariables}
              }
              
              body {
                font-family: var(--theme-typography-body-font, 'Inter'), sans-serif !important;
                font-size: var(--theme-typography-base-font-size, 16px);
                line-height: var(--theme-typography-body-line-height, 1.5);
                color: var(--theme-colors-text, #1E293B);
                background-color: var(--theme-colors-background, #ffffff);
              }
              
              h1, h2, h3, h4, h5, h6 {
                font-family: var(--theme-typography-heading-font, 'Playfair Display'), serif !important;
                font-weight: var(--theme-typography-heading-weight, 700);
                line-height: var(--theme-typography-heading-line-height, 1.2);
                color: var(--theme-colors-heading, #0F172A);
              }
              
              /* Override any conflicting styles */
              * {
                font-family: inherit;
              }
              
              /* Ensure buttons use the theme fonts */
              button, input, select, textarea {
                font-family: var(--theme-typography-body-font, 'Inter'), sans-serif;
              }
              
              /* Apply global border radius to common elements */
              img {
                border-radius: var(--theme-borders-image-radius, 8px);
              }
              
              .card, .product-card {
                border-radius: var(--theme-borders-card-radius, 12px);
              }
              
              /* Product card specific styling */
              .product-card-component,
              .product-card-component > div,
              .product-card-container,
              [data-component="product-card"],
              [data-testid="product-card"] {
                border-radius: var(--theme-layout-border-radius, 8px) !important;
              }
              
              .product-card-component img,
              .product-card-container img {
                border-radius: var(--theme-layout-border-radius, 8px) !important;
              }
              
              button:not(.no-radius), .btn:not(.no-radius) {
                border-radius: var(--theme-buttons-button-radius, 8px) !important;
              }
              
              input:not(.no-radius), select:not(.no-radius), textarea:not(.no-radius) {
                border-radius: var(--theme-borders-input-radius, 8px) !important;
              }
            `
          }}
        />
        <div className="store-frontend">
          {children}
        </div>
        <Toaster />
        </CustomerProvider>
      </CartProvider>
    </TranslationProvider>
  );
}