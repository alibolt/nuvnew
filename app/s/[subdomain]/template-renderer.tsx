'use client';

import { useState, useEffect } from 'react';
import { SectionRenderer } from './section-renderer';
import { ThemeCSSVariables } from '@/components/theme-css-variables';

interface TemplateRendererProps {
  store: any;
  sections: any[];
  isPreview?: boolean;
  pageData?: any;
  globalSections?: any;
  themeSettings?: any;
}

export function TemplateRenderer({ 
  store,
  sections,
  isPreview = false,
  pageData,
  globalSections,
  themeSettings
}: TemplateRendererProps) {
  const themeCode = store.themeCode || 'base';
  const [themeStyles, setThemeStyles] = useState('');
  const [componentStyles, setComponentStyles] = useState('');
  
  // Load theme styles dynamically
  useEffect(() => {
    const loadStyles = async () => {
      try {
        // Try using client-safe loader first
        const { clientThemeLoader } = await import('@/lib/theme-registry/client-theme-loader');
        const styles = await clientThemeLoader.loadStyles(themeCode);
        
        if (styles) {
          setThemeStyles(styles.themeStyles || '');
          setComponentStyles(styles.componentStyles || '');
        } else {
          // Fallback to direct import
          const stylesModule = await import(`@/themes/${themeCode}/styles/theme-styles`);
          setThemeStyles(stylesModule.themeStyles || '');
          setComponentStyles(stylesModule.componentStyles || '');
        }
      } catch (error) {
        console.error('Failed to load theme styles:', error);
        // Try base theme as fallback
        if (themeCode !== 'base') {
          try {
            const baseStyles = await import(`@/themes/base/styles/theme-styles`);
            setThemeStyles(baseStyles.themeStyles || '');
            setComponentStyles(baseStyles.componentStyles || '');
          } catch {
            setThemeStyles('');
            setComponentStyles('');
          }
        } else {
          setThemeStyles('');
          setComponentStyles('');
        }
      }
    };
    loadStyles();
  }, [themeCode]);
  
  // Check if any section has transparent header setting
  const hasTransparentHeader = sections?.some(
    section => section.sectionType === 'hero-banner' && section.settings?.transparentHeader
  );

  return (
    <>
      {/* Theme Base Styles */}
      {themeStyles && <style dangerouslySetInnerHTML={{ __html: themeStyles }} />}
      
      {/* Theme Component Styles */}
      {componentStyles && <style dangerouslySetInnerHTML={{ __html: componentStyles }} />}
      
      {/* Theme CSS Variables */}
      {themeSettings && <ThemeCSSVariables themeSettings={themeSettings} />}
      
      {/* Render Announcement Bar (Global Section) */}
      {globalSections?.announcementBar && (
        <SectionRenderer 
          key="global-announcement"
          section={globalSections.announcementBar}
          store={store}
          themeCode={themeCode}
          isPreview={isPreview}
          pageData={pageData}
          themeSettings={themeSettings}
        />
      )}
      
      {/* Render Header (Global Section) */}
      {globalSections?.header && (
        <SectionRenderer 
          key="global-header"
          section={{
            ...globalSections.header,
            settings: {
              ...globalSections.header.settings,
              transparentMode: hasTransparentHeader
            }
          }}
          store={store}
          themeCode={themeCode}
          isPreview={isPreview}
          pageData={pageData}
          themeSettings={themeSettings}
        />
      )}
      
      {/* Render Page Sections */}
      {sections?.map((section: any) => (
        <SectionRenderer 
          key={section.id}
          section={section}
          store={store}
          themeCode={themeCode}
          isPreview={isPreview}
          pageData={pageData}
          themeSettings={themeSettings}
        />
      ))}
      
      {/* Render Footer (Global Section) */}
      {globalSections?.footer && (
        <SectionRenderer 
          key="global-footer"
          section={globalSections.footer}
          store={store}
          themeCode={themeCode}
          isPreview={isPreview}
          pageData={pageData}
          themeSettings={themeSettings}
        />
      )}
    </>
  );
}