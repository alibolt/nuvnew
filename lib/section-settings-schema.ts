// Section-specific settings schemas
// Merkezi ayarlardan bağımsız, sadece içeriğe odaklı ayarlar

// Style overrides for sections
export interface SectionStyleOverrides {
  // Typography
  headingSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  bodySize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  textAlign?: 'left' | 'center' | 'right';
  
  // Colors
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  
  // Spacing
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  containerWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  
  // Effects
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Advanced
  customCSS?: string;
}

export interface HeroSectionSettings {
  // İçerik
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  
  // Layout (merkezi değil, section'a özel)
  height: 'small' | 'medium' | 'large' | 'fullscreen';
  contentAlignment: 'left' | 'center' | 'right';
  overlayOpacity: number; // 0-100
  
  // Style overrides
  styleOverrides?: SectionStyleOverrides;
}

export interface ProductGridSectionSettings {
  // İçerik
  title: string;
  collection?: string; // Hangi koleksiyondan ürünler gösterilecek
  
  // Layout
  productsPerRow: {
    mobile: 1 | 2;
    tablet: 2 | 3;
    desktop: 3 | 4 | 5 | 6;
  };
  maxProducts: number;
  showPrice: boolean;
  showAddToCart: boolean;
}

export interface NewsletterSectionSettings {
  // İçerik
  title: string;
  subtitle: string;
  buttonText: string;
  successMessage: string;
  
  // Layout
  layout: 'centered' | 'left' | 'right';
  showIcon: boolean;
}

export interface ImageTextSectionSettings {
  // İçerik
  image: string;
  title: string;
  text: string;
  buttonText?: string;
  buttonLink?: string;
  
  // Layout
  imagePosition: 'left' | 'right';
  imageSize: 'small' | 'medium' | 'large';
}

export interface TestimonialsSectionSettings {
  // İçerik
  title: string;
  testimonials: Array<{
    id: string;
    quote: string;
    author: string;
    role?: string;
    image?: string;
  }>;
  
  // Layout
  layout: 'grid' | 'carousel' | 'single';
  columns: {
    mobile: 1;
    tablet: 1 | 2;
    desktop: 1 | 2 | 3;
  };
}

export interface CollectionsSectionSettings {
  // İçerik
  title: string;
  collections: Array<{
    id: string;
    title: string;
    image: string;
    link: string;
  }>;
  
  // Layout
  layout: 'grid' | 'carousel';
  columns: {
    mobile: 1 | 2;
    tablet: 2 | 3;
    desktop: 3 | 4;
  };
}

export interface LogoListSectionSettings {
  // İçerik
  title: string;
  logos: Array<{
    id: string;
    image: string;
    alt: string;
    link?: string;
  }>;
  
  // Layout
  layout: 'grid' | 'carousel';
  columns: {
    mobile: 2 | 3;
    tablet: 4 | 5;
    desktop: 5 | 6 | 7 | 8;
  };
}

export interface RichTextSectionSettings {
  // İçerik
  content: string; // HTML content
  
  // Layout
  maxWidth: 'narrow' | 'medium' | 'wide' | 'full';
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

export interface InstagramSectionSettings {
  // İçerik
  title: string;
  accessToken?: string; // Instagram API token
  images?: string[]; // Manuel resimler (API yoksa)
  
  // Layout
  columns: {
    mobile: 2 | 3;
    tablet: 3 | 4;
    desktop: 4 | 5 | 6;
  };
  showFollowButton: boolean;
}

export interface HeaderSectionSettings {
  // Logo
  logoType: 'text' | 'image';
  logoText?: string;
  logoImage?: string;
  logoHeight: {
    mobile: string;
    desktop: string;
  };
  logoPosition: 'left' | 'center' | 'right';
  
  // Navigation
  menuHandle?: string; // Selected menu handle (e.g., 'main-menu')
  menuItems: Array<{
    id: string;
    label: string;
    link: string;
    megaMenu?: boolean;
    subItems?: Array<{
      label: string;
      link: string;
    }>;
  }>; // Fallback if no menu selected
  
  // Actions
  showSearch: boolean;
  showAccount: boolean;
  showCart: boolean;
  cartStyle: 'icon' | 'icon-count' | 'icon-price';
  
  // Mobile
  mobileMenuStyle: 'drawer' | 'fullscreen' | 'dropdown';
  mobileLogoAlignment: 'left' | 'center' | 'right';
}

export interface FooterSectionSettings {
  // Layout
  style: 'simple' | 'detailed';
  
  // Content
  description: string;
  showSocialLinks: boolean;
  showContact: boolean;
  
  // Quick Links (editable by user)
  quickLinks: Array<{
    id: string;
    label: string;
    url: string;
  }>;
  
  // Legal Links
  showPrivacyPolicy: boolean;
  showTermsOfService: boolean;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export interface AnnouncementBarSectionSettings {
  // Content
  text: string;
  link?: string;
  linkText?: string;
  
  // Style
  backgroundColor: string;
  textColor: string;
  position: 'top' | 'bottom';
  sticky: boolean;
  dismissible: boolean;
  
  // Animation
  scrolling: boolean;
  scrollSpeed: 'slow' | 'normal' | 'fast';
  
  // Display
  showOnMobile: boolean;
  showOnDesktop: boolean;
  
  // Schedule
  startDate?: string;
  endDate?: string;
}

// Tüm section ayarları için tip
export type SectionSettings = 
  | HeroSectionSettings
  | ProductGridSectionSettings
  | NewsletterSectionSettings
  | ImageTextSectionSettings
  | TestimonialsSectionSettings
  | CollectionsSectionSettings
  | LogoListSectionSettings
  | RichTextSectionSettings
  | InstagramSectionSettings
  | HeaderSectionSettings
  | FooterSectionSettings
  | AnnouncementBarSectionSettings;

// Section tipine göre varsayılan ayarlar
export const defaultSectionSettings = {
  hero: {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    title: 'Welcome to Our Store',
    subtitle: 'Discover our latest collection',
    buttonText: 'Shop Now',
    buttonLink: '/collections/all',
    height: 'large',
    contentAlignment: 'center',
    overlayOpacity: 30,
  } as HeroSectionSettings,
  
  'product-grid': {
    title: 'Featured Products',
    productsPerRow: {
      mobile: 2,
      tablet: 3,
      desktop: 4,
    },
    maxProducts: 8,
    showPrice: true,
    showAddToCart: true,
  } as ProductGridSectionSettings,
  
  newsletter: {
    title: 'Subscribe to Our Newsletter',
    subtitle: 'Get the latest updates and exclusive offers',
    buttonText: 'Subscribe',
    successMessage: 'Thank you for subscribing!',
    layout: 'centered',
    showIcon: true,
  } as NewsletterSectionSettings,
  
  'image-text': {
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
    title: 'Our Story',
    text: 'Share your brand story with your customers.',
    imagePosition: 'left',
    imageSize: 'medium',
  } as ImageTextSectionSettings,
  
  testimonials: {
    title: 'What Our Customers Say',
    testimonials: [],
    layout: 'grid',
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
    },
  } as TestimonialsSectionSettings,
  
  collections: {
    title: 'Shop by Collection',
    collections: [],
    layout: 'grid',
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 4,
    },
  } as CollectionsSectionSettings,
  
  'logo-list': {
    title: 'As Featured In',
    logos: [],
    layout: 'carousel',
    columns: {
      mobile: 3,
      tablet: 5,
      desktop: 6,
    },
  } as LogoListSectionSettings,
  
  'rich-text': {
    content: '<p>Add your content here</p>',
    maxWidth: 'medium',
    textAlign: 'center',
  } as RichTextSectionSettings,
  
  instagram: {
    title: 'Follow Us on Instagram',
    images: [],
    columns: {
      mobile: 3,
      tablet: 4,
      desktop: 6,
    },
    showFollowButton: true,
  } as InstagramSectionSettings,
  
  header: {
    logoType: 'text',
    logoHeight: {
      mobile: '30px',
      desktop: '40px',
    },
    logoPosition: 'left',
    menuHandle: 'main-menu', // Default menu
    menuItems: [
      { id: '1', label: 'Shop', link: '/' },
      { id: '2', label: 'Collections', link: '/collections' },
      { id: '3', label: 'About', link: '/about' },
      { id: '4', label: 'Contact', link: '/contact' },
    ],
    showSearch: true,
    showAccount: true,
    showCart: true,
    cartStyle: 'icon-count',
    mobileMenuStyle: 'drawer',
    mobileLogoAlignment: 'center',
  } as HeaderSectionSettings,
  
  footer: {
    style: 'simple',
    description: 'Discover our latest collection of premium fashion pieces.',
    showSocialLinks: true,
    showContact: true,
    quickLinks: [
      { id: '1', label: 'About Us', url: '/about' },
      { id: '2', label: 'Shipping', url: '/shipping' },
      { id: '3', label: 'Returns', url: '/returns' },
      { id: '4', label: 'FAQ', url: '/faq' },
    ],
    showPrivacyPolicy: true,
    showTermsOfService: true,
    privacyPolicyUrl: '/privacy',
    termsOfServiceUrl: '/terms',
  } as FooterSectionSettings,
  
  'announcement-bar': {
    text: 'Free shipping on orders over $50!',
    link: '/shipping',
    linkText: 'Learn more',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    position: 'top',
    sticky: true,
    dismissible: true,
    scrolling: false,
    scrollSpeed: 'normal',
    showOnMobile: true,
    showOnDesktop: true,
  } as AnnouncementBarSectionSettings,
};