
'use client';

export function RichText({ settings }: any) {
  // Settings with defaults
  const content = settings.content || '<p>Add your text here</p>';
  const maxWidth = settings.maxWidth || 'medium';
  const textAlign = settings.textAlign || 'left';
  
  // Max width classes
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'narrow': return 'max-w-2xl';
      case 'wide': return 'max-w-6xl';
      case 'full': return 'max-w-full';
      case 'medium':
      default: return 'max-w-4xl';
    }
  };
  
  // Text alignment styles
  const getTextAlignStyle = () => {
    switch (textAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      case 'left':
      default: return 'text-left';
    }
  };

  return (
    <section 
      style={{
        padding: 'var(--theme-section-padding-mobile) 0',
        backgroundColor: 'var(--theme-background)',
        fontFamily: 'var(--theme-font-body)'
      }}
    >
      <div 
        className="mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)'
        }}
      >
        <div className={`${getMaxWidthClass()} mx-auto`}>
          <div
            className={`prose prose-lg max-w-none ${getTextAlignStyle()}`}
            style={{
              '--tw-prose-body': 'var(--theme-text)',
              '--tw-prose-headings': 'var(--theme-text)',
              '--tw-prose-lead': 'var(--theme-text-muted)',
              '--tw-prose-links': 'var(--theme-primary)',
              '--tw-prose-bold': 'var(--theme-text)',
              '--tw-prose-counters': 'var(--theme-text-muted)',
              '--tw-prose-bullets': 'var(--theme-text-muted)',
              '--tw-prose-hr': 'var(--theme-border)',
              '--tw-prose-quotes': 'var(--theme-text)',
              '--tw-prose-quote-borders': 'var(--theme-border)',
              '--tw-prose-captions': 'var(--theme-text-muted)',
              '--tw-prose-code': 'var(--theme-text)',
              '--tw-prose-pre-code': 'var(--theme-text-light)',
              '--tw-prose-pre-bg': 'var(--theme-surface)',
              '--tw-prose-th-borders': 'var(--theme-border)',
              '--tw-prose-td-borders': 'var(--theme-border-light)',
              fontSize: 'var(--theme-text-base)',
              lineHeight: 'var(--theme-line-height-relaxed)'
            } as any}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
      
      {/* Responsive padding */}
      <style jsx>{`
        @media (min-width: 768px) {
          section {
            padding: var(--theme-section-padding-tablet) 0;
          }
        }
        @media (min-width: 1024px) {
          section {
            padding: var(--theme-section-padding-desktop) 0;
          }
        }
      `}</style>
    </section>
  );
}
