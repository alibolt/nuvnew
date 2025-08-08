'use client';

export function ImageWithText({ settings }: any) {
  // Get image position and size from settings
  const imagePosition = settings.imagePosition || 'left';
  const imageSize = settings.imageSize || 'medium';
  
  // Determine grid layout based on image position
  const isImageRight = imagePosition === 'right';
  
  // Determine image container size based on imageSize setting
  const getImageSizeClass = () => {
    switch (imageSize) {
      case 'small': return 'md:col-span-1'; // 1/3 width
      case 'large': return 'md:col-span-2'; // 2/3 width  
      case 'medium':
      default: return 'md:col-span-1'; // 1/2 width (equal)
    }
  };
  
  const getContentSizeClass = () => {
    switch (imageSize) {
      case 'small': return 'md:col-span-2'; // 2/3 width
      case 'large': return 'md:col-span-1'; // 1/3 width
      case 'medium':
      default: return 'md:col-span-1'; // 1/2 width (equal)
    }
  };

  return (
    <section 
      style={{
        padding: 'var(--theme-section-padding-mobile) 0',
        backgroundColor: 'var(--theme-background)',
        fontFamily: 'var(--theme-font-body)',
      }}
    >
      <div 
        className="mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        <div 
          className={`grid grid-cols-1 gap-8 md:gap-12 items-center ${
            imageSize === 'medium' ? 'md:grid-cols-2' : 'md:grid-cols-3'
          }`}
        >
          {/* Image */}
          <div 
            className={`${getImageSizeClass()} ${
              isImageRight ? 'md:order-2' : 'md:order-1'
            }`}
          >
            <div 
              className="relative overflow-hidden"
              style={{
                borderRadius: 'var(--theme-radius-lg)',
                boxShadow: 'var(--theme-shadow-lg)',
              }}
            >
              <img
                src={settings.image || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'}
                alt={settings.title || 'Image with text'}
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                style={{
                  transitionDuration: 'var(--theme-transition-duration)',
                }}
              />
            </div>
          </div>
          
          {/* Content */}
          <div 
            className={`${getContentSizeClass()} ${
              isImageRight ? 'md:order-1' : 'md:order-2'
            } space-y-6`}
          >
            {/* Title */}
            {settings.title && (
              <h2 
                style={{
                  fontFamily: 'var(--theme-font-heading)',
                  fontSize: 'var(--theme-text-3xl)',
                  fontWeight: 'var(--theme-font-weight-bold)',
                  color: 'var(--theme-text)',
                  lineHeight: 'var(--theme-line-height-tight)',
                }}
              >
                {settings.title}
              </h2>
            )}
            
            {/* Text Content */}
            {settings.text && (
              <div 
                className="prose prose-gray max-w-none"
                style={{
                  fontSize: 'var(--theme-text-base)',
                  lineHeight: 'var(--theme-line-height-relaxed)',
                  color: 'var(--theme-text-muted)',
                }}
                dangerouslySetInnerHTML={{ 
                  __html: settings.text.replace(/\n/g, '<br>')
                }}
              />
            )}
            
            {/* Button */}
            {settings.buttonText && settings.buttonLink && (
              <div>
                <a
                  href={settings.buttonLink}
                  className="inline-flex items-center justify-center font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-background)',
                    padding: 'var(--theme-spacing-component-gap-sm) var(--theme-spacing-component-gap-lg)',
                    borderRadius: 'var(--theme-radius-md)',
                    fontSize: 'var(--theme-text-base)',
                    fontWeight: 'var(--theme-font-weight-semibold)',
                    transitionDuration: 'var(--theme-transition-duration)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
                  }}
                >
                  {settings.buttonText}
                </a>
              </div>
            )}
          </div>
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