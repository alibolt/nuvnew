'use client';

import { useTheme } from '../../theme-provider';

interface PageContentProps {
  settings?: any;
  pageData?: {
    page?: {
      title: string;
      content: string;
    };
  };
}

export function PageContent({ settings: sectionSettings, pageData }: PageContentProps) {
  const { settings } = useTheme();
  
  const page = pageData?.page;
  const title = sectionSettings?.title || page?.title || '';
  const content = sectionSettings?.content || page?.content || '';
  const showTitle = sectionSettings?.showTitle ?? true;
  const containerWidth = sectionSettings?.containerWidth || 'narrow';

  const getContainerClass = () => {
    switch (containerWidth) {
      case 'narrow':
        return 'max-w-3xl';
      case 'medium':
        return 'max-w-5xl';
      case 'wide':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-none';
      default:
        return 'max-w-3xl';
    }
  };

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: 'var(--theme-background)',
      }}
    >
      <div 
        className={`container mx-auto ${getContainerClass()}`}
        style={{
          padding: '0 var(--theme-container-padding)',
        }}
      >
        {showTitle && title && (
          <h1 
            className="mb-8 text-center"
            style={{
              fontSize: 'var(--theme-text-3xl)',
              fontFamily: 'var(--theme-font-heading)',
              fontWeight: 'var(--theme-font-weight-light)',
              color: 'var(--theme-text)',
              lineHeight: 'var(--theme-line-height-tight)',
            }}
          >
            {title}
          </h1>
        )}

        {content && (
          <div 
            className="prose prose-lg max-w-none mx-auto"
            style={{
              fontFamily: 'var(--theme-font-body)',
              color: 'var(--theme-text)',
              lineHeight: 'var(--theme-line-height-relaxed)',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {/* Custom styling for prose elements */}
        <style jsx>{`
          .prose {
            --tw-prose-body: var(--theme-text);
            --tw-prose-headings: var(--theme-text);
            --tw-prose-lead: var(--theme-text-secondary);
            --tw-prose-links: var(--theme-primary);
            --tw-prose-bold: var(--theme-text);
            --tw-prose-counters: var(--theme-text-secondary);
            --tw-prose-bullets: var(--theme-text-secondary);
            --tw-prose-hr: var(--theme-border);
            --tw-prose-quotes: var(--theme-text);
            --tw-prose-quote-borders: var(--theme-border);
            --tw-prose-captions: var(--theme-text-secondary);
            --tw-prose-code: var(--theme-text);
            --tw-prose-pre-code: var(--theme-text);
            --tw-prose-pre-bg: var(--theme-background-alt);
            --tw-prose-th-borders: var(--theme-border);
            --tw-prose-td-borders: var(--theme-border);
          }
          
          .prose :where(h1, h2, h3, h4, h5, h6) {
            font-family: var(--theme-font-heading);
            font-weight: var(--theme-font-weight-medium);
          }
          
          .prose :where(a):not(:where([class~="not-prose"] *)) {
            text-decoration: none;
            transition: opacity var(--theme-transition-duration);
          }
          
          .prose :where(a):not(:where([class~="not-prose"] *)):hover {
            opacity: 0.7;
          }
        `}</style>
      </div>
    </section>
  );
}