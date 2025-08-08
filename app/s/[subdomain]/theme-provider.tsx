'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeSettings, defaultThemeSettings, generateCSSVariables } from '@/lib/theme-settings-schema';

interface ThemeContextType {
  themeCode: string;
  settings: ThemeSettings;
  styles: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeCode: 'default',
  settings: defaultThemeSettings,
  styles: {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({
  children,
  themeCode,
  settings,
  styles,
}: {
  children: React.ReactNode;
  themeCode: string;
  settings: ThemeSettings;
  styles: Record<string, string>;
}) {
  // Merge default settings with provided settings
  const mergedSettings = {
    ...defaultThemeSettings,
    ...settings,
    colors: { ...defaultThemeSettings.colors, ...settings?.colors },
    typography: { ...defaultThemeSettings.typography, ...settings?.typography },
    spacing: { ...defaultThemeSettings.spacing, ...settings?.spacing },
    buttons: { ...defaultThemeSettings.buttons, ...settings?.buttons },
    layout: { ...defaultThemeSettings.layout, ...settings?.layout },
    animations: { ...defaultThemeSettings.animations, ...settings?.animations },
    header: { 
      ...defaultThemeSettings.header, 
      ...settings?.header,
      announcement: {
        ...defaultThemeSettings.header.announcement,
        ...settings?.header?.announcement
      }
    },
    footer: { ...defaultThemeSettings.footer, ...settings?.footer },
  };
  
  const [dynamicSettings, setDynamicSettings] = useState(mergedSettings);
  const [dynamicCSS, setDynamicCSS] = useState('');
  
  // Generate CSS variables from theme settings
  const cssVariables = generateCSSVariables(dynamicSettings);
  
  // Listen for theme studio updates
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'THEME_STUDIO_UPDATE') {
        if (event.data.settings) {
          // Save scroll position before updating
          const scrollY = window.scrollY;
          
          // Merge incoming settings with defaults
          const mergedNewSettings = {
            ...defaultThemeSettings,
            ...event.data.settings,
            colors: { ...defaultThemeSettings.colors, ...event.data.settings?.colors },
            typography: { ...defaultThemeSettings.typography, ...event.data.settings?.typography },
            spacing: { ...defaultThemeSettings.spacing, ...event.data.settings?.spacing },
            buttons: { ...defaultThemeSettings.buttons, ...event.data.settings?.buttons },
            layout: { ...defaultThemeSettings.layout, ...event.data.settings?.layout },
            animations: { ...defaultThemeSettings.animations, ...event.data.settings?.animations },
            header: { 
              ...defaultThemeSettings.header, 
              ...event.data.settings?.header,
              announcement: {
                ...defaultThemeSettings.header.announcement,
                ...event.data.settings?.header?.announcement
              }
            },
            footer: { ...defaultThemeSettings.footer, ...event.data.settings?.footer },
          };
          setDynamicSettings(mergedNewSettings);
          
          // Restore scroll position after DOM updates
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.scrollTo(0, scrollY);
            });
          });
        }
        if (event.data.cssVariables) {
          setDynamicCSS(event.data.cssVariables);
        }
      }
      
      // Handle navigation messages from theme studio
      if (event.data.type === 'THEME_STUDIO_NAVIGATE') {
        const { pageType, url } = event.data;
        console.log('[Theme Provider] Navigation requested:', { pageType, url });
        // In a full implementation, this would update page content without reloading
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Listen for section clicks in preview mode
  useEffect(() => {
    // Only add click listener if we're in preview mode (inside iframe)
    const isInIframe = window !== window.parent;
    
    if (!isInIframe) return;
    
    const handleSectionClick = (event: MouseEvent) => {
      // Find the section element by traversing up the DOM tree
      let target = event.target as Element;
      let sectionElement: Element | null = null;
      
      // Traverse up to find element with data-clickable-section
      while (target && target !== document.documentElement) {
        if (target.hasAttribute && target.hasAttribute('data-clickable-section')) {
          sectionElement = target;
          break;
        }
        target = target.parentElement as Element;
      }
      
      if (sectionElement) {
        const sectionId = sectionElement.getAttribute('data-section-id');
        const sectionType = sectionElement.getAttribute('data-section-type');
        
        if (sectionId) {
          // Prevent default link clicks and other actions when selecting sections
          event.preventDefault();
          event.stopPropagation();
          
          // Send section selection to parent theme studio
          window.parent.postMessage({
            type: 'SECTION_SELECTED',
            sectionId,
            sectionType
          }, '*');
          
          // Add visual feedback for click
          sectionElement.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
          setTimeout(() => {
            sectionElement?.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
          }, 200);
        }
      }
    };
    
    // Use capture phase to intercept clicks before they reach child elements
    document.addEventListener('click', handleSectionClick, true);
    
    return () => {
      document.removeEventListener('click', handleSectionClick, true);
    };
  }, []);
  
  return (
    <ThemeContext.Provider value={{ themeCode, settings: dynamicSettings, styles }}>
      {/* Base theme CSS variables */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              ${cssVariables}
              ${Object.entries(styles)
                .map(([key, value]) => `${key}: ${value};`)
                .join('\n')}
            }
          `,
        }}
      />
      
      {/* Dynamic CSS from Theme Studio */}
      {dynamicCSS && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                ${dynamicCSS}
              }
            `,
          }}
        />
      )}
      
      {children}
    </ThemeContext.Provider>
  );
}