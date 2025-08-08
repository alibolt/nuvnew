'use client';

import { useEffect } from 'react';
import { SectionRenderer } from './section-renderer';
import type { PageTemplate } from '@/lib/page-templates';
import { ThemeFontLoader } from '@/lib/theme-font-loader';
import { ProductProvider } from '@/contexts/product-context';
import { trackProductView } from '@/themes/commerce/sections/recently-viewed';
import { generateThemeCSSVariables } from '@/lib/theme-utils';
import { ThemeStyles } from '@/components/theme-styles-provider';

interface PageRendererProps {
  pageData: any;
  store: any;
  themeCode: string;
  globalSections?: {
    announcementBar?: any | null;
    header: any | null;
    footer: any | null;
  };
  themeSettings?: Record<string, any>;
}

export function PageRenderer({ pageData, store, themeCode, globalSections, themeSettings = {} }: PageRendererProps) {
  const { template, type } = pageData;
  
  console.log('[PageRenderer] Rendering page:', {
    pageType: type,
    hasGlobalSections: !!globalSections,
    headerBlocks: globalSections?.header?.blocks?.length || 0,
    footerBlocks: globalSections?.footer?.blocks?.length || 0,
    themeSettings,
    fonts: {
      heading: themeSettings?.typography?.headingFont,
      body: themeSettings?.typography?.bodyFont
    }
  });
  
  // Extract fonts from theme settings
  const themeFonts: string[] = [];
  if (themeSettings?.typography?.headingFont) {
    themeFonts.push(themeSettings.typography.headingFont);
  }
  if (themeSettings?.typography?.bodyFont) {
    themeFonts.push(themeSettings.typography.bodyFont);
  }
  
  // Fallback to default fonts if none found
  if (themeFonts.length === 0) {
    themeFonts.push('Inter', 'Playfair Display');
  }
  
  // Using centralized CSS variable generation from theme-utils
  
  // Apply theme settings as CSS variables
  useEffect(() => {
    if (themeSettings) {
      const cssVariables = generateThemeCSSVariables(themeSettings);
      const root = document.documentElement;
      
      // Parse CSS variables string and apply to root
      const lines = cssVariables.split('\n');
      lines.forEach(line => {
        const match = line.match(/^(.+?):\s*(.+?);$/);
        if (match) {
          root.style.setProperty(match[1], match[2]);
        }
      });
    }
  }, [themeSettings]);
  
  // Track product views
  useEffect(() => {
    if (type === 'product' && pageData.product?.id && store?.subdomain) {
      trackProductView(pageData.product.id, store.subdomain);
    }
  }, [type, pageData.product?.id, store?.subdomain]);
  
  if (!template || !template.sections) {
    return (
      <div className="page-container error">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Template Not Found</h1>
          <p className="text-gray-600">The page template for this {type || 'page'} could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Wrap with ProductProvider if it's a product page
  const content = (
    <>
      <ThemeFontLoader fonts={themeFonts} />
      <ThemeStyles settings={themeSettings} />
      <div className="page-container" data-page-type={type || template.templateType}>
        {/* Global sections - announcement bar always comes first */}
        {globalSections?.announcementBar && (
          <SectionRenderer
            key="global-announcement-bar"
            section={globalSections.announcementBar}
            store={store}
            themeCode={themeCode}
            pageData={pageData}
            isPreview={false}
          />
        )}
        {globalSections?.header && (
          <SectionRenderer
            key="global-header"
            section={globalSections.header}
            store={store}
            themeCode={themeCode}
            pageData={pageData}
            isPreview={false}
          />
        )}
        
        {/* Render page content sections (excluding global ones) */}
        {template.sections
          .filter((section: any) => !['announcement-bar', 'header', 'footer'].includes(section.sectionType))
          .map((section: any, index: number) => {
            return (
              <SectionRenderer
                key={`${section.sectionType}-${section.id}-${index}`}
                section={{
                  id: section.id,
                  sectionType: section.sectionType,
                  settings: section.settings || {},
                  enabled: section.enabled,
                  position: section.position,
                  blocks: section.blocks || []
                }}
                store={store}
                themeCode={themeCode}
                pageData={pageData}
                isPreview={false}
              />
            );
          })}
        
        {/* Render global footer */}
        {globalSections?.footer && (
          <SectionRenderer
            key="global-footer"
            section={globalSections.footer}
            store={store}
            themeCode={themeCode}
            pageData={pageData}
            isPreview={false}
          />
        )}
      </div>
    </>
  );

  // Wrap with ProductProvider for product pages
  if (type === 'product' && pageData.product) {
    return <ProductProvider product={pageData.product}>{content}</ProductProvider>;
  }

  return content;
}

