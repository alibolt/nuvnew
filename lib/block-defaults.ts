// Block default settings helper
export function getDefaultBlockSettings(blockType: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    // Content Blocks
    heading: {
      text: 'Heading',
      level: 'h2',
      size: 'text-2xl',
      color: 'text-gray-900',
      alignment: 'left',
      margin: 'mb-4',
      fontWeight: 'font-bold'
    },
    
    text: {
      text: 'Text content',
      size: 'text-base',
      color: 'text-gray-700',
      alignment: 'left',
      margin: 'mb-4',
      fontWeight: 'font-normal',
      lineHeight: 'leading-relaxed'
    },
    
    image: {
      src: '/placeholder-image.svg',
      alt: 'Image',
      width: 800,
      height: 600,
      aspectRatio: 'aspect-video',
      objectFit: 'object-cover',
      alignment: 'center',
      margin: 'mb-4',
      borderRadius: 'rounded-lg'
    },
    
    button: {
      text: 'Button',
      href: '#',
      variant: 'primary',
      size: 'medium',
      alignment: 'left',
      margin: 'mb-4',
      fullWidth: false,
      openInNewTab: false
    },
    
    spacer: {
      height: 'h-8',
      showInPreview: true
    },
    
    divider: {
      style: 'solid',
      color: 'border-gray-300',
      thickness: 'border-t',
      margin: 'my-6',
      width: 'w-full'
    },
    
    // Brand/Header Blocks
    logo: {
      type: 'image',
      src: '/logo.svg',
      text: 'STORE',
      alt: 'Store Logo',
      width: 120,
      height: 40,
      link: '/',
      alignment: 'left'
    },
    
    navigation: {
      items: [
        { text: 'Home', href: '/' },
        { text: 'Products', href: '/products' },
        { text: 'About', href: '/about' },
        { text: 'Contact', href: '/contact' }
      ],
      layout: 'horizontal',
      alignment: 'left',
      spacing: 'normal',
      color: 'text-gray-700',
      hoverColor: 'hover:text-gray-900',
      fontSize: 'text-base',
      fontWeight: 'font-medium'
    },
    
    'navigation-menu': {
      menuSource: 'dashboard',
      menuHandle: 'main-menu',
      menuItems: [
        { 
          id: 'home', 
          title: 'Home', 
          href: '/',
          type: 'link'
        },
        { 
          id: 'shop', 
          title: 'Shop',
          type: 'dropdown',
          items: [
            { id: 'all', title: 'All Products', href: '/collections/all' },
            { id: 'new', title: 'New Arrivals', href: '/collections/new' }
          ]
        },
        { 
          id: 'about', 
          title: 'About', 
          href: '/pages/about',
          type: 'link'
        },
        { 
          id: 'contact', 
          title: 'Contact', 
          href: '/pages/contact',
          type: 'link'
        }
      ],
      alignment: 'horizontal',
      textSize: 'base',
      spacing: 'normal',
      hoverEffect: 'underline'
    },
    
    search: {
      placeholder: 'Search products...',
      size: 'medium',
      showIcon: true,
      iconPosition: 'left',
      backgroundColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-900',
      placeholderColor: 'placeholder-gray-500',
      borderRadius: 'rounded-lg',
      width: 'w-full'
    },
    
    cart: {
      showIcon: true,
      showCount: true,
      showText: false,
      text: 'Cart',
      count: 0,
      color: 'text-gray-700',
      hoverColor: 'hover:text-gray-900',
      backgroundColor: 'bg-transparent',
      hoverBackgroundColor: 'hover:bg-gray-100',
      size: 'medium',
      borderRadius: 'rounded-lg',
      link: '/cart'
    },
    
    // Product Blocks
    'product-card': {
      showImage: true,
      showTitle: true,
      showPrice: true,
      showRating: true,
      showWishlist: true,
      showAddToCart: true,
      imageAspectRatio: 'aspect-square',
      titleLines: 2,
      priceColor: 'text-gray-900',
      originalPriceColor: 'text-gray-500',
      cardPadding: 'p-4',
      cardBorder: 'border border-gray-200',
      cardBorderRadius: 'rounded-lg',
      cardHover: 'hover:shadow-lg',
      spacing: 'space-y-3'
    },
    
    'category-item': {
      showImage: true,
      showTitle: true,
      showDescription: true,
      showProductCount: true,
      imageAspectRatio: 'aspect-square',
      titleSize: 'text-lg',
      titleColor: 'text-gray-900',
      descriptionSize: 'text-sm',
      descriptionColor: 'text-gray-600',
      cardPadding: 'p-4',
      cardBorder: 'border border-gray-200',
      cardBorderRadius: 'rounded-lg',
      cardHover: 'hover:shadow-lg',
      spacing: 'space-y-2',
      textAlignment: 'text-center'
    },
    
    'value-prop': {
      icon: 'truck',
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50',
      iconColor: 'text-blue-600',
      titleColor: 'text-gray-900',
      descriptionColor: 'text-gray-600',
      iconSize: 'h-8 w-8',
      titleSize: 'text-lg',
      descriptionSize: 'text-sm',
      alignment: 'center',
      spacing: 'space-y-2',
      padding: 'p-4',
      backgroundColor: 'bg-gray-50',
      borderRadius: 'rounded-lg'
    },
    
    // Content Blocks
    newsletter: {
      title: 'Subscribe to our newsletter',
      description: 'Get the latest updates and exclusive offers',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
      showIcon: true,
      layout: 'vertical',
      titleSize: 'text-xl',
      titleColor: 'text-gray-900',
      descriptionSize: 'text-base',
      descriptionColor: 'text-gray-600',
      backgroundColor: 'bg-gray-50',
      borderRadius: 'rounded-lg',
      padding: 'p-6',
      spacing: 'space-y-4',
      inputBorder: 'border-gray-300',
      inputBorderRadius: 'rounded-md',
      buttonVariant: 'primary'
    },
    
    'footer-column': {
      title: 'Quick Links',
      links: [
        { text: 'Home', href: '/' },
        { text: 'About', href: '/about' },
        { text: 'Products', href: '/products' },
        { text: 'Contact', href: '/contact' }
      ],
      titleSize: 'text-lg',
      titleColor: 'text-gray-900',
      titleMargin: 'mb-4',
      linkSize: 'text-sm',
      linkColor: 'text-gray-600',
      linkHoverColor: 'hover:text-gray-900',
      spacing: 'space-y-2'
    },
    
    'hero-text': {
      headline: 'Welcome to Our Store',
      subheading: 'Discover amazing products at great prices',
      ctaText: 'Shop Now',
      ctaHref: '/products',
      showCta: true,
      headlineSize: 'text-4xl md:text-5xl lg:text-6xl',
      headlineColor: 'text-gray-900',
      subheadingSize: 'text-xl md:text-2xl',
      subheadingColor: 'text-gray-600',
      alignment: 'center',
      spacing: 'space-y-6',
      ctaVariant: 'primary',
      ctaSize: 'large'
    },
    
    // Layout Blocks
    container: {
      layout: 'horizontal',
      alignment: 'center',
      gap: '4',
      padding: '0',
      maxWidth: 'none',
      // Pre-configured blocks for better UX
      blocks: [
        {
          id: `default-text-${Date.now()}`,
          type: 'text',
          position: 0,
          enabled: true,
          settings: {
            text: 'Add content here'
          }
        }
      ]
    },
    
    columns: {
      columnCount: 2,
      gap: 'gap-4',
      alignment: 'stretch',
      verticalAlignment: 'top',
      responsiveBreakpoint: 'md',
      columns: [],
      equalHeight: false,
      padding: 'p-0',
      backgroundColor: 'bg-transparent',
      borderRadius: 'rounded-none'
    },
    
    grid: {
      columns: 3,
      gap: 'gap-4',
      aspectRatio: 'aspect-auto',
      responsiveColumns: {
        sm: 1,
        md: 2,
        lg: 3,
        xl: 3
      },
      items: [],
      padding: 'p-0',
      backgroundColor: 'bg-transparent',
      borderRadius: 'rounded-none'
    },
    
    // Brand-specific blocks
    'svg-logo': {
      width: 40,
      height: 40,
      color: '#7FA068',
      strokeWidth: 1.5,
      centerColor: '#7FA068',
      pathColor: '#2B2B2B',
      pathStrokeWidth: 2,
      opacity: 1,
      link: '/',
      className: ''
    },
    
    'brand-logo': {
      type: 'svg',
      text: 'COTTON YARN',
      src: '/logo.svg',
      width: 40,
      height: 40,
      fontSize: 'text-xl',
      fontWeight: 'font-medium',
      textColor: 'text-charcoal',
      letterSpacing: '-tracking-wide',
      link: '/',
      showIcon: true,
      iconSize: 40,
      iconColor: '#7FA068',
      iconStrokeWidth: 1.5,
      gap: 'gap-4',
      alignment: 'left',
      hoverColor: 'hover:text-sage'
    },
    
    icon: {
      iconType: 'lucide',
      iconName: 'package',
      customSvg: null,
      size: 24,
      color: 'currentColor',
      strokeWidth: 1.5,
      className: '',
      title: '',
      description: '',
      link: null,
      backgroundColor: 'transparent',
      borderRadius: 'rounded-none',
      padding: 'p-0',
      alignment: 'left',
      showTitle: false,
      showDescription: false,
      spacing: 'space-y-2'
    },
    
    'payment-icons': {
      methods: ['visa', 'mastercard', 'paypal', 'apple-pay'],
      layout: 'horizontal',
      iconWidth: 40,
      iconHeight: 24,
      gap: 'gap-3',
      backgroundColor: 'bg-gray-50',
      borderRadius: 'rounded',
      padding: 'p-2',
      borderColor: 'border-gray-200',
      borderWidth: 'border',
      alignment: 'left',
      title: '',
      titleSize: 'text-sm',
      titleColor: 'text-gray-600',
      titleMargin: 'mb-3',
      showTitle: false
    },
    
    pattern: {
      patternType: 'circles',
      color: '#7FA068',
      opacity: 0.3,
      position: 'top-right',
      size: 'large',
      customSvg: null,
      zIndex: -1,
      rotate: 0,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      blendMode: 'normal'
    },
    
    // Social Proof Blocks
    testimonial: {
      content: "The quality of the products exceeded my expectations. Fast shipping and excellent customer service. Will definitely order again!",
      author: "Sarah Johnson",
      role: "Verified Buyer",
      company: "",
      rating: 5,
      image: "",
      showRating: true,
      showImage: true,
      showQuoteIcon: true,
      imagePosition: 'top',
      imageSize: 'medium',
      textAlign: 'left'
    },
  };
  
  return defaults[blockType] || {};
}

// Helper function to get block settings schema
export function getBlockSettingsSchema(blockType: string): Record<string, any> {
  const schemas: Record<string, Record<string, any>> = {
    heading: {
      text: { type: 'text', label: 'Heading Text', required: true },
      level: { 
        type: 'select', 
        label: 'Heading Level',
        options: [
          { value: 'h1', label: 'H1' },
          { value: 'h2', label: 'H2' },
          { value: 'h3', label: 'H3' },
          { value: 'h4', label: 'H4' },
          { value: 'h5', label: 'H5' },
          { value: 'h6', label: 'H6' }
        ]
      },
      size: {
        type: 'select',
        label: 'Size',
        options: [
          { value: 'text-sm', label: 'Small' },
          { value: 'text-base', label: 'Base' },
          { value: 'text-lg', label: 'Large' },
          { value: 'text-xl', label: 'XL' },
          { value: 'text-2xl', label: '2XL' },
          { value: 'text-3xl', label: '3XL' },
          { value: 'text-4xl', label: '4XL' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      fontWeight: {
        type: 'select',
        label: 'Font Weight',
        options: [
          { value: 'font-normal', label: 'Normal' },
          { value: 'font-medium', label: 'Medium' },
          { value: 'font-semibold', label: 'Semi Bold' },
          { value: 'font-bold', label: 'Bold' }
        ]
      }
    },
    
    text: {
      text: { type: 'textarea', label: 'Text Content', required: true },
      size: {
        type: 'select',
        label: 'Size',
        options: [
          { value: 'text-sm', label: 'Small' },
          { value: 'text-base', label: 'Base' },
          { value: 'text-lg', label: 'Large' },
          { value: 'text-xl', label: 'XL' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justify' }
        ]
      }
    },
    
    image: {
      src: { type: 'image', label: 'Image', required: true },
      alt: { type: 'text', label: 'Alt Text', required: true },
      aspectRatio: {
        type: 'select',
        label: 'Aspect Ratio',
        options: [
          { value: 'aspect-square', label: 'Square (1:1)' },
          { value: 'aspect-video', label: 'Video (16:9)' },
          { value: 'aspect-[4/3]', label: 'Standard (4:3)' },
          { value: 'aspect-[3/2]', label: 'Classic (3:2)' }
        ]
      },
      objectFit: {
        type: 'select',
        label: 'Object Fit',
        options: [
          { value: 'object-cover', label: 'Cover' },
          { value: 'object-contain', label: 'Contain' },
          { value: 'object-fill', label: 'Fill' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      link: { type: 'url', label: 'Link URL' },
      caption: { type: 'text', label: 'Caption' }
    },
    
    button: {
      text: { type: 'text', label: 'Button Text', required: true },
      href: { type: 'url', label: 'Link URL', required: true },
      variant: {
        type: 'select',
        label: 'Style',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' },
          { value: 'ghost', label: 'Ghost' },
          { value: 'danger', label: 'Danger' }
        ]
      },
      size: {
        type: 'select',
        label: 'Size',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      fullWidth: { type: 'checkbox', label: 'Full Width' },
      openInNewTab: { type: 'checkbox', label: 'Open in New Tab' }
    },
    
    navigation: {
      menuId: { type: 'text', label: 'Menu ID', placeholder: 'main-menu' },
      layout: {
        type: 'select',
        label: 'Layout',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      spacing: {
        type: 'select',
        label: 'Spacing',
        options: [
          { value: 'tight', label: 'Tight' },
          { value: 'normal', label: 'Normal' },
          { value: 'relaxed', label: 'Relaxed' },
          { value: 'loose', label: 'Loose' }
        ]
      },
      fontSize: {
        type: 'select',
        label: 'Font Size',
        options: [
          { value: 'text-sm', label: 'Small' },
          { value: 'text-base', label: 'Base' },
          { value: 'text-lg', label: 'Large' }
        ]
      },
      fontWeight: {
        type: 'select',
        label: 'Font Weight',
        options: [
          { value: 'font-normal', label: 'Normal' },
          { value: 'font-medium', label: 'Medium' },
          { value: 'font-semibold', label: 'Semi Bold' },
          { value: 'font-bold', label: 'Bold' }
        ]
      },
      megaMenuItems: { type: 'text', label: 'Mega Menu Items', placeholder: 'Shop, Collections' }
    }
  };

  return schemas[blockType] || {};
}

export default getDefaultBlockSettings;