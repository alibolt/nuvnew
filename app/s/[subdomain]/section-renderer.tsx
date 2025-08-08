'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, memo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { Store, Product } from '@prisma/client';
import { loadThemeSection } from '@/lib/services/theme-loader';
import { Loader2 } from 'lucide-react';

interface SectionRendererProps {
  section: {
    id: string;
    sectionType: string;
    settings: any;
    blocks?: any[];
  };
  store: Store & {
    products?: (Product & {
      category: any;
      variants: any[];
    })[];
  };
  themeCode?: string;
  isPreview?: boolean;
  pageData?: any;
  onBlockClick?: (section: any, block: any, event: React.MouseEvent) => void;
  themeSettings?: Record<string, any>;
}

// Dynamic section loader component
const DynamicSection = memo(({ 
  themeCode, 
  sectionType, 
  ...props 
}: { 
  themeCode: string; 
  sectionType: string;
  [key: string]: any;
}) => {
  const [SectionComponent, setSectionComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSection = async () => {
      try {
        const component = await loadThemeSection(themeCode, sectionType);
        if (mounted) {
          if (component) {
            setSectionComponent(() => component);
            setError(null);
          } else {
            setError(`Section "${sectionType}" not found in theme`);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(`Failed to load section: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    };

    loadSection();

    return () => {
      mounted = false;
    };
  }, [themeCode, sectionType]);

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg m-4">
        <p>{error}</p>
      </div>
    );
  }

  if (!SectionComponent) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return <SectionComponent {...props} />;
});

DynamicSection.displayName = 'DynamicSection';

// Main section renderer component
export const SectionRenderer = memo(function SectionRenderer({
  section,
  store,
  themeCode = 'commerce',
  isPreview = false,
  pageData,
  onBlockClick,
  themeSettings
}: SectionRendererProps) {
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement>(null);
  // Only enable editing mode when in development and preview mode
  const isEditing = process.env.NODE_ENV === 'development' && isPreview && searchParams?.get('edit') === 'true';

  // Handle section click in edit mode
  const handleSectionClick = (e: React.MouseEvent) => {
    if (!isEditing || !onBlockClick) return;
    
    e.stopPropagation();
    onBlockClick(section, null, e);
  };

  // Handle block click within section
  const handleBlockClick = (blockId: string, blockType: string, event: React.MouseEvent) => {
    // In preview mode, always allow block clicks if onBlockClick is provided
    if (!onBlockClick) return;
    
    console.log('[SectionRenderer] Block clicked:', { blockId, blockType, sectionId: section.id });
    
    event.stopPropagation();
    const block = section.blocks?.find((b: any) => b.id === blockId);
    if (block) {
      console.log('[SectionRenderer] Found block, calling onBlockClick');
      onBlockClick(section, block, event);
    } else {
      console.warn('[SectionRenderer] Block not found in section blocks');
    }
  };

  // Scroll to section if it's the target
  useEffect(() => {
    const targetSection = searchParams?.get('section');
    if (targetSection === section.id && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams, section.id]);

  if (!section.enabled && !isPreview) {
    return null;
  }

  const sectionProps = {
    section,
    settings: section.settings || {},
    blocks: section.blocks || [],
    store,
    isPreview,
    isEditing,
    pageData,
    onBlockClick: handleBlockClick,
    themeSettings,
  };
  
  // Debug logging for product sections
  if (section.sectionType === 'product' || pageData?.type === 'product') {
    console.log('[SectionRenderer] Product section props:', {
      sectionType: section.sectionType,
      pageDataType: pageData?.type,
      hasProduct: !!pageData?.product,
      productId: pageData?.product?.id,
      productName: pageData?.product?.name
    });
  }

  // In preview mode, don't wrap with section element to avoid double wrapping
  if (isPreview) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }>
        <DynamicSection
          themeCode={themeCode}
          sectionType={section.sectionType}
          {...sectionProps}
        />
      </Suspense>
    );
  }

  return (
    <section
      ref={sectionRef}
      id={`section-${section.id}`}
      className={`section-${section.sectionType} ${isEditing ? 'relative cursor-pointer hover:outline hover:outline-2 hover:outline-[var(--nuvi-primary)]' : ''}`}
      onClick={handleSectionClick}
      data-section-id={section.id}
      data-section-type={section.sectionType}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }>
        <DynamicSection
          themeCode={themeCode}
          sectionType={section.sectionType}
          {...sectionProps}
        />
      </Suspense>
    </section>
  );
});

export default SectionRenderer;