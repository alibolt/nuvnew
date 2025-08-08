'use client';

import { useEffect, useState, useMemo, memo } from 'react';
import { SectionRenderer } from '../section-renderer';
import { ThemeFontLoader, useThemeFonts } from '@/lib/theme-font-loader';
import { ThemeGlobalStyles } from '@/lib/theme-global-styles';
import { generateThemeCSSVariables } from '@/lib/theme-utils';
import { ThemeProvider } from '@/contexts/theme-context';

interface Section {
  id: string;
  type?: string;
  sectionType: string;
  settings: any;
  enabled: boolean;
  position: number;
  blocks?: any[];
}

interface RealtimePreviewWrapperProps {
  initialSections: Section[];
  globalSections?: {
    announcementBar: any | null;
    header: any | null;
    footer: any | null;
  };
  store: any;
  themeCode: string;
  isPreview?: boolean;
  pageData?: any;
}

export function RealtimePreviewWrapper({
  initialSections,
  globalSections,
  store,
  themeCode,
  isPreview = true,
  pageData
}: RealtimePreviewWrapperProps) {
  // Disabled to prevent excessive re-renders
  // console.log('[RealtimePreviewWrapper] Props received:', {
  //   initialSectionsCount: initialSections.length,
  //   hasGlobalSections: !!globalSections,
  //   hasHeader: !!globalSections?.header,
  //   hasFooter: !!globalSections?.footer,
  //   hasAnnouncementBar: !!globalSections?.announcementBar
  // });
  const [sections, setSections] = useState(initialSections);
  const [sectionSettings, setSectionSettings] = useState<Record<string, any>>({});
  const [selectorMode, setSelectorMode] = useState(false);
  const [themeSettings, setThemeSettings] = useState<Record<string, any>>(store.themeSettings || {});
  const [themeUpdateKey, setThemeUpdateKey] = useState(0); // Force re-render on theme changes
  
  // Using centralized CSS variable generation from theme-utils
  
  // Apply theme settings as CSS variables on mount and when they change
  useEffect(() => {
    if (themeSettings && Object.keys(themeSettings).length > 0) {
      const cssText = generateThemeCSSVariables(themeSettings);
      
      console.log('[RealtimePreview] Initial theme CSS variables:', cssText.substring(0, 500));
      
      // Apply CSS variables to the root element
      const style = document.createElement('style');
      style.id = 'theme-settings-initial';
      style.textContent = `:root { ${cssText} }`;
      
      // Remove existing style if any
      const existingStyle = document.getElementById('theme-settings-initial');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Add new style
      document.head.appendChild(style);
    }
  }, [themeSettings]);
  
  // Initialize blocks data from server-provided initial sections
  const initialBlocksData = initialSections.reduce((acc, section) => {
    // Always initialize blocksData for each section, even if empty
    acc[section.id] = section.blocks || [];
    return acc;
  }, {} as Record<string, any[]>);
  
  // Removed blocksData - now we only use sections state
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);
  const [fetchedSections, setFetchedSections] = useState<Set<string>>(new Set());

  // Fetch blocks for a section
  const fetchSectionBlocks = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/sections/${sectionId}/blocks?preview=true`);
      if (response.ok) {
        const data = await response.json();
        // Update sections state directly with fetched blocks
        setSections(prev => prev.map(section => 
          section.id === sectionId 
            ? { ...section, blocks: data.blocks || [] }
            : section
        ));
        
        // Send blocks data back to Theme Studio
        window.parent.postMessage({
          type: 'SECTION_BLOCKS_LOADED',
          sectionId: sectionId,
          blocks: data.blocks || []
        }, '*');
      }
    } catch (error) {
      console.error('Failed to fetch blocks for section:', sectionId, error);
    }
  };

  // Fetch blocks for sections that support them (only if not already loaded from server)
  useEffect(() => {
    const sectionsWithBlocks = sections.filter(section => 
      ['header', 'hero', 'footer', 'featured-products', 'cart', 'collection'].includes(section.sectionType)
    );
    
    sectionsWithBlocks.forEach(section => {
      // Only fetch if the section doesn't already have blocks and hasn't been fetched yet
      if (!section.id.startsWith('temp-') && 
          (!section.blocks || section.blocks.length === 0) && 
          !fetchedSections.has(section.id)) {
        fetchSectionBlocks(section.id);
        setFetchedSections(prev => new Set(prev).add(section.id));
      }
    });
  }, [sections.length]); // Only depend on sections length to avoid infinite loop

  // Scroll position management
  const getCurrentScrollPosition = () => {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  };

  const saveCurrentScrollPosition = () => {
    const scrollY = getCurrentScrollPosition();
    setSavedScrollPosition(scrollY);
    // Send scroll position to parent
    window.parent.postMessage({
      type: 'THEME_STUDIO_SCROLL_POSITION',
      scrollY: scrollY
    }, '*');
  };

  const restoreScrollPosition = (scrollY?: number) => {
    const targetScrollY = scrollY || savedScrollPosition;
    if (targetScrollY > 0) {
      window.scrollTo({
        top: targetScrollY,
        behavior: 'auto'
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    console.log('[RealtimePreview] scrollToSection called:', sectionId);
    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
    console.log('[RealtimePreview] Section element found:', !!sectionElement);
    
    if (sectionElement) {
      console.log('[RealtimePreview] Scrolling to element');
      sectionElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Add visual highlight effect
      const element = sectionElement as HTMLElement;
      element.classList.add('section-highlight');
      setTimeout(() => {
        element.classList.remove('section-highlight');
      }, 2000); // Highlight for 2 seconds
      
      // Save the new scroll position after scrolling
      setTimeout(() => {
        saveCurrentScrollPosition();
      }, 500); // Wait for scroll animation to complete
    } else {
      console.warn('[RealtimePreview] Section element not found for ID:', sectionId);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // console.log('Preview received message:', event.data);
      
      if (event.data.type === 'THEME_STUDIO_SELECTOR_MODE') {
        setSelectorMode(event.data.enabled);
        return;
      }

      if (event.data.type === 'THEME_SETTINGS_UPDATE') {
        const { cssVariables, settings } = event.data;
        
        console.log('[RealtimePreview] Received theme update:', {
          hasCssVariables: !!cssVariables,
          hasSettings: !!settings,
          borderRadius: settings?.layout?.borderRadius,
          fullSettings: settings,
          cssVariablesSnippet: cssVariables?.substring(0, 300)
        });
        
        // Update theme settings state
        if (settings) {
          setThemeSettings(settings);
          // Force re-render by updating key
          setThemeUpdateKey(prev => prev + 1);
        }
        
        if (cssVariables) {
          // Apply CSS variables to the root element
          const style = document.createElement('style');
          style.id = 'theme-settings-overrides';
          const styleContent = `
            :root { ${cssVariables} }
            
            /* Force border radius on all elements */
            input:not([type="checkbox"]):not([type="radio"]),
            textarea,
            select,
            button,
            .btn,
            .card,
            .panel,
            .modal,
            .dropdown,
            .search-input input,
            .search-input,
            [class*="search"] input,
            [data-block-type="search"] input,
            [class*="product-card"],
            .product-card,
            .group {
              border-radius: var(--theme-layout-border-radius, 8px) !important;
              border-top-left-radius: var(--theme-layout-border-radius, 8px) !important;
              border-top-right-radius: var(--theme-layout-border-radius, 8px) !important;
              border-bottom-left-radius: var(--theme-layout-border-radius, 8px) !important;
              border-bottom-right-radius: var(--theme-layout-border-radius, 8px) !important;
            }
            
            /* ProductCard specific overrides */
            .product-card-component {
              border-radius: var(--theme-layout-border-radius, 8px) !important;
              border-top-left-radius: var(--theme-layout-border-radius, 8px) !important;
              border-top-right-radius: var(--theme-layout-border-radius, 8px) !important;
              border-bottom-left-radius: var(--theme-layout-border-radius, 8px) !important;
              border-bottom-right-radius: var(--theme-layout-border-radius, 8px) !important;
            }
            
            .group.relative.overflow-hidden,
            .group.relative.overflow-hidden.transition-all,
            [data-border-radius] {
              border-radius: var(--theme-layout-border-radius, 8px) !important;
              border-top-left-radius: var(--theme-layout-border-radius, 8px) !important;
              border-top-right-radius: var(--theme-layout-border-radius, 8px) !important;
              border-bottom-left-radius: var(--theme-layout-border-radius, 8px) !important;
              border-bottom-right-radius: var(--theme-layout-border-radius, 8px) !important;
            }
            
            /* Special handling for none border radius */
            [data-border-radius="0"],
            [data-border-radius="0px"] {
              border-radius: 0 !important;
              border-top-left-radius: 0 !important;
              border-top-right-radius: 0 !important;
              border-bottom-left-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
            }
            
            /* Force immediate update with timestamp */
            body[data-css-timestamp="${Date.now()}"] * {
              transition: border-radius 0.1s ease;
            }
          `;
          style.textContent = styleContent;
          
          console.log('[RealtimePreview] Creating style element with content:', styleContent.substring(0, 500));
          
          // Remove existing override style if any
          const existingOverrideStyle = document.getElementById('theme-settings-overrides');
          if (existingOverrideStyle) {
            console.log('[RealtimePreview] Removing existing override style element');
            existingOverrideStyle.remove();
          }
          
          // Remove initial style as well since we're updating
          const existingInitialStyle = document.getElementById('theme-settings-initial');
          if (existingInitialStyle) {
            console.log('[RealtimePreview] Removing initial style element');
            existingInitialStyle.remove();
          }
          
          // Add new style with high priority
          document.head.appendChild(style);
          console.log('[RealtimePreview] Added new style element to head');
          
          // Add timestamp to body to trigger CSS refresh
          const timestamp = Date.now();
          document.body.setAttribute('data-css-timestamp', timestamp.toString());
          
          // Trigger custom event to notify components about CSS variable changes
          const cssVariableChangeEvent = new CustomEvent('cssVariablesUpdated', {
            detail: { cssVariables, timestamp }
          });
          window.dispatchEvent(cssVariableChangeEvent);
          
          // Debug: Check if CSS variables are actually applied
          setTimeout(() => {
            const computedStyle = getComputedStyle(document.documentElement);
            const borderRadiusValue = computedStyle.getPropertyValue('--theme-layout-border-radius');
            console.log('[RealtimePreview] Applied CSS Variables:', {
              containerWidth: computedStyle.getPropertyValue('--theme-layout-container-width'),
              fullWidth: computedStyle.getPropertyValue('--theme-layout-full-width'),
              borderRadius: borderRadiusValue,
              sectionPadding: computedStyle.getPropertyValue('--theme-layout-section-padding')
            });
            
            // Also check a search input if exists
            const searchInput = document.querySelector('input[type="text"]');
            if (searchInput) {
              const searchStyles = getComputedStyle(searchInput);
              console.log('[RealtimePreview] Search input border-radius:', searchStyles.borderRadius);
            }
          }, 100);
          
          // Force reflow to ensure styles are applied
          document.body.offsetHeight;
        }
        return;
      }

      if (event.data.type === 'THEME_STUDIO_GET_SCROLL_POSITION') {
        saveCurrentScrollPosition();
        return;
      }

      if (event.data.type === 'THEME_STUDIO_RESTORE_SCROLL_POSITION') {
        restoreScrollPosition(event.data.scrollY);
        return;
      }

      if (event.data.type === 'THEME_STUDIO_SCROLL_TO_SECTION') {
        scrollToSection(event.data.sectionId);
        return;
      }

      // Removed scroll restoration after updates to prevent conflicts
      
      if (event.data.type === 'THEME_STUDIO_REALTIME') {
        const { update } = event.data;
        
        switch (update.type) {
          case 'SECTION_UPDATE':
            // console.log('[RealtimePreview] SECTION_UPDATE received:', {
            //   sectionId: update.sectionId,
            //   hasBlocks: !!update.blocks,
            //   blocksCount: update.blocks?.length,
            //   updateData: update
            // });
            setSections(prev => prev.map(section => {
              if (section.id === update.sectionId) {
                const updatedSection = { 
                  ...section, 
                  settings: { ...section.settings, ...update.settings },
                  enabled: update.enabled !== undefined ? update.enabled : section.enabled,
                  blocks: update.blocks !== undefined ? update.blocks : section.blocks
                };
                // console.log('[RealtimePreview] Section updated:', {
                //   oldBlocks: section.blocks?.length,
                //   newBlocks: updatedSection.blocks?.length
                // });
                return updatedSection;
              }
              return section;
            }));
            // Don't save scroll position for real-time updates to prevent scroll jumping
            break;
            
          case 'SECTION_ADD':
            console.log('SECTION_ADD received:', update.section);
            setSections(prev => {
              const newSections = [...prev, update.section];
              return newSections.sort((a, b) => a.position - b.position);
            });
            // Fetch blocks for the new section if it supports them
            if (update.section && ['header', 'hero', 'footer', 'featured-products', 'cart', 'collection'].includes(update.section.sectionType)) {
              if (!update.section.id.startsWith('temp-')) {
                fetchSectionBlocks(update.section.id);
              }
            }
            break;
            
          case 'SECTION_DELETE':
            setSections(prev => prev.filter(s => s.id !== update.sectionId));
            // Clean up fetched sections tracking
            setFetchedSections(prev => {
              const newSet = new Set(prev);
              newSet.delete(update.sectionId);
              return newSet;
            });
            break;
            
          case 'SECTIONS_REORDER':
            if (update.sections) {
              setSections(update.sections);
            }
            break;

          case 'BLOCK_UPDATE':
            // Handle block updates - only update sections state
            if (update.sectionId && update.blockId && update.block) {
              // console.log('[RealtimePreview] BLOCK_UPDATE:', { sectionId: update.sectionId, blockId: update.blockId, block: update.block });
              
              // Helper function to update nested blocks
              const updateBlockInStructure = (blocks: any[]): any[] => {
                return blocks.map(block => {
                  if (block.id === update.blockId) {
                    // Replace the entire block with the updated one
                    return update.block;
                  }
                  // Check for nested blocks in container
                  if (block.type === 'container' && block.settings?.blocks) {
                    return {
                      ...block,
                      settings: {
                        ...block.settings,
                        blocks: updateBlockInStructure(block.settings.blocks)
                      }
                    };
                  }
                  return block;
                });
              };
              
              // Only update sections to avoid duplication
              setSections(prev => prev.map(section => 
                section.id === update.sectionId 
                  ? { 
                      ...section, 
                      blocks: updateBlockInStructure(section.blocks || [])
                    }
                  : section
              ));
            } else {
              console.warn('[RealtimePreview] BLOCK_UPDATE: Missing blockId or block data, skipping fallback fetch');
            }
            break;

          case 'BLOCK_ADD':
            // Handle block addition - only update sections state
            if (update.sectionId && update.block) {
              // console.log('[RealtimePreview] BLOCK_ADD:', { sectionId: update.sectionId, block: update.block });
              
              // Only update sections to avoid duplication
              setSections(prev => prev.map(section => 
                section.id === update.sectionId 
                  ? { 
                      ...section, 
                      blocks: [...(section.blocks || []), update.block]
                    }
                  : section
              ));
            }
            break;

          case 'BLOCK_DELETE':
            // Handle block deletion - only update sections state
            if (update.sectionId && update.blockId) {
              // console.log('[RealtimePreview] BLOCK_DELETE:', { sectionId: update.sectionId, blockId: update.blockId });
              
              // Only update sections to avoid duplication
              setSections(prev => prev.map(section => 
                section.id === update.sectionId 
                  ? { 
                      ...section, 
                      blocks: section.blocks?.filter(block => block.id !== update.blockId) || []
                    }
                  : section
              ));
            }
            break;
            
          case 'BLOCK_REORDER':
            // Handle block reordering - only update sections state
            if (update.sectionId && update.blockIds) {
              // console.log('[RealtimePreview] BLOCK_REORDER:', { sectionId: update.sectionId, blockIds: update.blockIds });
              
              // Only update sections to avoid duplication
              setSections(prev => prev.map(section => 
                section.id === update.sectionId 
                  ? { 
                      ...section, 
                      blocks: (() => {
                        const blockMap = new Map(section.blocks?.map(block => [block.id, block]) || []);
                        // Map blocks in new order and update their positions
                        return update.blockIds.map((id, index) => {
                          const block = blockMap.get(id);
                          if (block) {
                            return { ...block, position: index };
                          }
                          return null;
                        }).filter(Boolean);
                      })()
                    }
                  : section
              ));
            }
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Signal that the preview is ready to receive messages and send initial sections
    setTimeout(() => {
      window.parent.postMessage({
        type: 'THEME_STUDIO_PREVIEW_READY',
        sections: sections.map(s => ({
          id: s.id,
          type: s.sectionType,
          sectionType: s.sectionType,
          title: (s.sectionType || '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          settings: s.settings || {},
          enabled: s.enabled !== false,
          position: s.position,
          blocks: s.blocks || []
        }))
      }, '*');
      console.log('[RealtimePreview] Sent PREVIEW_READY with sections:', sections.length);
    }, 100);
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-save scroll position on scroll (less aggressive)
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let isUserScrolling = false;
    
    const handleScroll = () => {
      // Only save scroll position if user is actively scrolling
      if (!isUserScrolling) {
        isUserScrolling = true;
        setTimeout(() => { isUserScrolling = false; }, 1000);
      }
      
      // Debounce scroll position saving with longer delay
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (isUserScrolling) {
          saveCurrentScrollPosition();
        }
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Handle section click in selector mode
  const handleSectionClick = (section: Section, event: React.MouseEvent) => {
    if (selectorMode) {
      event.preventDefault();
      event.stopPropagation();
      
      // Send message to parent about section selection
      window.parent.postMessage({
        type: 'SECTION_SELECTED',
        sectionId: section.id,
        sectionType: section.sectionType
      }, '*');
    }
  };

  // Handle block click in selector mode
  const handleBlockClick = (section: Section, block: any, event: React.MouseEvent) => {
    console.log('[RealtimePreview] handleBlockClick called:', {
      selectorMode,
      sectionId: section.id,
      blockId: block?.id,
      blockType: block?.type
    });
    
    if (selectorMode) {
      event.preventDefault();
      event.stopPropagation();
      
      console.log('[RealtimePreview] Sending BLOCK_SELECTED message');
      
      // Send message to parent about block selection
      window.parent.postMessage({
        type: 'BLOCK_SELECTED',
        sectionId: section.id,
        sectionType: section.sectionType,
        blockId: block.id,
        blockType: block.type
      }, '*');
    }
  };

  // Memoize sorted sections and section extraction to prevent re-renders
  const { allSections, extractedGlobalSections, visibleSections } = useMemo(() => {
    const sorted = [...sections].sort((a, b) => a.position - b.position);
    const globalSectionTypes = ['announcement-bar', 'header', 'footer'];
    
    // Extract global sections from the sections array
    const extracted = {
      announcementBar: sorted.find(s => s.sectionType === 'announcement-bar') || globalSections?.announcementBar || null,
      header: sorted.find(s => s.sectionType === 'header') || globalSections?.header || null,
      footer: sorted.find(s => s.sectionType === 'footer') || globalSections?.footer || null
    };
    
    // Filter out global sections from content sections
    const visible = sorted.filter(s => !globalSectionTypes.includes(s.sectionType));
    
    return { allSections: sorted, extractedGlobalSections: extracted, visibleSections: visible };
  }, [sections, globalSections]);

  // Debug log disabled to prevent excessive re-renders
  // console.log('[RealtimePreviewWrapper] Sections to render:', visibleSections.map(s => ({
  //   id: s.id,
  //   type: s.sectionType,
  //   enabled: s.enabled,
  //   position: s.position,
  //   hasBlocks: !!s.blocks?.length,
  //   blocksCount: s.blocks?.length || 0
  // })));

  // Extract fonts from theme settings
  const themeFonts = useThemeFonts(themeSettings);
  
  // Memoize transparent header check to prevent re-computation
  const hasTransparentHeader = useMemo(() => 
    visibleSections.some(
      section => section.sectionType === 'hero-banner' && section.settings?.transparentHeader
    ), [visibleSections]);

  return (
    <ThemeProvider initialThemeSettings={themeSettings}>
      <ThemeFontLoader fonts={themeFonts} />
      <ThemeGlobalStyles themeSettings={themeSettings} />
      
      {/* Render global announcement bar */}
      {extractedGlobalSections.announcementBar && (
        <div 
          key={extractedGlobalSections.announcementBar.id}
          id={`section-${extractedGlobalSections.announcementBar.id}`}
          data-section-id={extractedGlobalSections.announcementBar.id}
          data-section-type={extractedGlobalSections.announcementBar.sectionType}
          className={selectorMode ? 'selector-mode' : ''}
          onClick={(e) => handleSectionClick(extractedGlobalSections.announcementBar, e)}
          style={{ 
            opacity: extractedGlobalSections.announcementBar.enabled ? 1 : 0.5,
            filter: extractedGlobalSections.announcementBar.enabled ? 'none' : 'grayscale(100%)',
            pointerEvents: extractedGlobalSections.announcementBar.enabled || selectorMode ? 'auto' : 'none',
            ...(selectorMode && {
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto'
            })
          }}
        >
          <SectionRenderer
            key={`announcement-${themeUpdateKey}`}
            section={extractedGlobalSections.announcementBar}
            store={store}
            themeCode={themeCode}
            pageData={pageData}
            isPreview={isPreview}
            onBlockClick={(sectionData, block, event) => handleBlockClick(extractedGlobalSections.announcementBar, block, event)}
            themeSettings={themeSettings}
          />
        </div>
      )}
      
      {/* Render global header */}
      {extractedGlobalSections.header && (
        <div 
          key={extractedGlobalSections.header.id}
          id={`section-${extractedGlobalSections.header.id}`}
          data-section-id={extractedGlobalSections.header.id}
          data-section-type={extractedGlobalSections.header.sectionType}
          className={selectorMode ? 'selector-mode' : ''}
          onClick={(e) => handleSectionClick(extractedGlobalSections.header, e)}
          style={{ 
            opacity: extractedGlobalSections.header.enabled ? 1 : 0.5,
            filter: extractedGlobalSections.header.enabled ? 'none' : 'grayscale(100%)',
            pointerEvents: extractedGlobalSections.header.enabled || selectorMode ? 'auto' : 'none',
            ...(selectorMode && {
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto'
            })
          }}
        >
          <SectionRenderer
            key={`header-${themeUpdateKey}`}
            section={{
              ...extractedGlobalSections.header,
              settings: {
                ...extractedGlobalSections.header.settings,
                transparentMode: hasTransparentHeader
              }
            }}
            store={store}
            themeCode={themeCode}
            pageData={pageData}
            isPreview={isPreview}
            onBlockClick={(sectionData, block, event) => handleBlockClick(extractedGlobalSections.header, block, event)}
            themeSettings={themeSettings}
          />
        </div>
      )}
      
      {/* Render page sections */}
      {visibleSections.map((section) => (
        <div 
          key={`${section.id}-${themeUpdateKey}`}
          id={`section-${section.id}`}
          data-section-id={section.id}
          data-section-type={section.sectionType}
          className={selectorMode ? 'selector-mode' : ''}
          onClick={(e) => handleSectionClick(section, e)}
          style={{ 
            opacity: section.enabled ? 1 : 0.5,
            filter: section.enabled ? 'none' : 'grayscale(100%)',
            pointerEvents: section.enabled || selectorMode ? 'auto' : 'none',
            ...(selectorMode && {
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
              position: 'relative'
            })
          }}
        >
          <SectionRenderer
            section={{
              ...section,
              blocks: section.blocks || []
            }}
            store={store}
            themeCode={themeCode}
            isPreview={isPreview}
            pageData={pageData}
            onBlockClick={(sectionData, block, event) => handleBlockClick(section, block, event)}
            themeSettings={themeSettings}
          />
        </div>
      ))}
      
      {/* Render global footer */}
      {extractedGlobalSections.footer && (
        <div 
          key={extractedGlobalSections.footer.id}
          id={`section-${extractedGlobalSections.footer.id}`}
          data-section-id={extractedGlobalSections.footer.id}
          data-section-type={extractedGlobalSections.footer.sectionType}
          className={selectorMode ? 'selector-mode' : ''}
          onClick={(e) => handleSectionClick(extractedGlobalSections.footer, e)}
          style={{ 
            opacity: extractedGlobalSections.footer.enabled ? 1 : 0.5,
            filter: extractedGlobalSections.footer.enabled ? 'none' : 'grayscale(100%)',
            pointerEvents: extractedGlobalSections.footer.enabled || selectorMode ? 'auto' : 'none',
            ...(selectorMode && {
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto'
            })
          }}
        >
          <SectionRenderer
            key={`footer-${themeUpdateKey}`}
            section={extractedGlobalSections.footer}
            store={store}
            themeCode={themeCode}
            pageData={pageData}
            isPreview={isPreview}
            onBlockClick={(sectionData, block, event) => handleBlockClick(extractedGlobalSections.footer, block, event)}
            themeSettings={themeSettings}
          />
        </div>
      )}
    </ThemeProvider>
  );
}