'use client';

import { SectionRenderer } from './section-renderer';
import { themeStyles, componentStyles } from '@/themes/commerce/styles/theme-styles';
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
  const themeCode = store.themeCode || 'commerce';
  
  // Check if any section has transparent header setting
  const hasTransparentHeader = sections?.some(
    section => section.sectionType === 'hero-banner' && section.settings?.transparentHeader
  );

  return (
    <>
      {/* Theme Base Styles */}
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      
      {/* Theme Component Styles */}
      <style dangerouslySetInnerHTML={{ __html: componentStyles }} />
      
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