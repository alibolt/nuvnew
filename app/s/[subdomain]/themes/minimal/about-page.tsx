'use client';

import { useTheme } from '../../theme-provider';

interface AboutPageProps {
  settings?: any;
  pageData?: {
    page?: {
      title: string;
      content: string;
    };
  };
  store?: {
    name: string;
    description?: string;
  };
}

export function AboutPage({ settings: sectionSettings, pageData, store }: AboutPageProps) {
  const { settings } = useTheme();
  
  const page = pageData?.page;
  const title = sectionSettings?.title || page?.title || 'About Us';
  const content = sectionSettings?.content || page?.content || '';
  const showTitle = sectionSettings?.showTitle ?? true;
  
  // Section-specific settings
  const showStats = sectionSettings?.showStats ?? true;
  const showTeam = sectionSettings?.showTeam ?? false;
  const showValues = sectionSettings?.showValues ?? true;

  const stats = sectionSettings?.stats || [
    { label: 'Years in Business', value: '10+' },
    { label: 'Happy Customers', value: '50K+' },
    { label: 'Products', value: '1000+' },
    { label: 'Team Members', value: '25' },
  ];

  const values = sectionSettings?.values || [
    {
      title: 'Quality First',
      description: 'We source only the finest materials and work with skilled craftspeople.',
    },
    {
      title: 'Sustainable Practices',
      description: 'Committed to reducing our environmental impact at every step.',
    },
    {
      title: 'Customer Focus',
      description: 'Your satisfaction is our top priority, always.',
    },
  ];

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: 'var(--theme-background)',
      }}
    >
      <div 
        className="container mx-auto max-w-5xl"
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
            }}
          >
            {title}
          </h1>
        )}

        {content && (
          <div 
            className="prose prose-lg max-w-none mx-auto mb-16"
            style={{
              fontFamily: 'var(--theme-font-body)',
              color: 'var(--theme-text)',
              lineHeight: 'var(--theme-line-height-relaxed)',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {/* Stats Section */}
        {showStats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="mb-2"
                  style={{
                    fontSize: 'var(--theme-text-3xl)',
                    fontFamily: 'var(--theme-font-heading)',
                    fontWeight: 'var(--theme-font-weight-light)',
                    color: 'var(--theme-primary)',
                  }}
                >
                  {stat.value}
                </div>
                <div 
                  style={{
                    fontSize: 'var(--theme-text-sm)',
                    color: 'var(--theme-text-secondary)',
                    fontFamily: 'var(--theme-font-body)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Values Section */}
        {showValues && values.length > 0 && (
          <div>
            <h2 
              className="mb-8 text-center"
              style={{
                fontSize: 'var(--theme-text-2xl)',
                fontFamily: 'var(--theme-font-heading)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
              }}
            >
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-lg"
                  style={{
                    backgroundColor: 'var(--theme-background-alt)',
                  }}
                >
                  <h3 
                    className="mb-3"
                    style={{
                      fontSize: 'var(--theme-text-lg)',
                      fontFamily: 'var(--theme-font-heading)',
                      fontWeight: 'var(--theme-font-weight-medium)',
                      color: 'var(--theme-text)',
                    }}
                  >
                    {value.title}
                  </h3>
                  <p 
                    style={{
                      fontSize: 'var(--theme-text-base)',
                      color: 'var(--theme-text-secondary)',
                      fontFamily: 'var(--theme-font-body)',
                      lineHeight: 'var(--theme-line-height-relaxed)',
                    }}
                  >
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
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