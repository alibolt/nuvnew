// Hero Section Settings - Focused on hero-specific features
import { BaseSectionSettings, CommonStyleOverrides, SectionPreset } from './section-settings-base';

// Hero-specific content settings
export interface HeroContentSettings {
  // Background
  background: {
    type: 'image' | 'video' | 'color' | 'gradient';
    image?: string;
    video?: string;
    color?: string;
    gradient?: {
      from: string;
      to: string;
      direction: 'to-r' | 'to-br' | 'to-b' | 'to-bl' | 'to-l';
    };
    overlay?: {
      enabled: boolean;
      opacity: number;
      color: string;
    };
  };
  
  // Content
  content: {
    badge?: {
      text: string;
      style: 'default' | 'outline' | 'filled';
    };
    title: string;
    subtitle?: string;
    description?: string;
    buttons: {
      primary?: {
        text: string;
        link: string;
        style: 'solid' | 'outline';
      };
      secondary?: {
        text: string;
        link: string;
        style: 'solid' | 'outline' | 'ghost';
      };
    };
  };
  
  // Layout
  layout: {
    height: 'small' | 'medium' | 'large' | 'fullscreen';
    contentPosition: 'left' | 'center' | 'right';
    contentAlignment: 'top' | 'center' | 'bottom';
    maxContentWidth?: 'narrow' | 'medium' | 'wide';
  };
}

// Hero behavior settings  
export interface HeroBehaviorSettings {
  // Animations
  animation: {
    enabled: boolean;
    type: 'fade' | 'slide-up' | 'slide-down' | 'zoom' | 'parallax';
    duration: 'fast' | 'normal' | 'slow';
    delay?: number;
  };
  
  // Parallax effect
  parallax: {
    enabled: boolean;
    speed: 'slow' | 'medium' | 'fast';
  };
  
  // Auto-scroll hint
  scrollHint: {
    enabled: boolean;
    style: 'arrow' | 'text' | 'animated-arrow';
  };
}

// Complete hero settings
export interface HeroSectionSettings extends BaseSectionSettings {
  content: HeroContentSettings;
  behavior: HeroBehaviorSettings;
  style?: Partial<CommonStyleOverrides>;
}

// Hero presets
export const HERO_PRESETS: SectionPreset<HeroSectionSettings>[] = [
  {
    id: 'minimal',
    name: 'Minimal Text',
    description: 'Clean centered text on solid background',
    category: 'simple',
    settings: {
      content: {
        background: {
          type: 'color',
          color: '#f8f9fa',
        },
        content: {
          title: 'Welcome to Our Store',
          subtitle: 'Discover amazing products',
          buttons: {
            primary: {
              text: 'Shop Now',
              link: '/products',
              style: 'solid',
            },
          },
        },
        layout: {
          height: 'medium',
          contentPosition: 'center',
          contentAlignment: 'center',
        },
      },
      behavior: {
        animation: {
          enabled: true,
          type: 'fade',
          duration: 'normal',
        },
        parallax: { enabled: false },
        scrollHint: { enabled: false },
      },
    },
  },
  {
    id: 'image-overlay',
    name: 'Image with Overlay',
    description: 'Large image with dark overlay and white text',
    category: 'visual',
    settings: {
      content: {
        background: {
          type: 'image',
          overlay: {
            enabled: true,
            opacity: 50,
            color: '#000000',
          },
        },
        content: {
          badge: {
            text: 'New Collection',
            style: 'outline',
          },
          title: 'Premium Quality Products',
          subtitle: 'Crafted with care for modern lifestyle',
          description: 'Discover our handpicked selection of premium products designed to enhance your daily life.',
          buttons: {
            primary: {
              text: 'Explore Collection',
              link: '/collections',
              style: 'solid',
            },
            secondary: {
              text: 'Learn More',
              link: '/about',
              style: 'outline',
            },
          },
        },
        layout: {
          height: 'large',
          contentPosition: 'left',
          contentAlignment: 'center',
          maxContentWidth: 'medium',
        },
      },
      behavior: {
        animation: {
          enabled: true,
          type: 'slide-up',
          duration: 'normal',
        },
        parallax: { enabled: true, speed: 'slow' },
        scrollHint: { enabled: true, style: 'animated-arrow' },
      },
      style: {
        textColor: '#ffffff',
      },
    },
  },
  {
    id: 'gradient-modern',
    name: 'Modern Gradient',
    description: 'Contemporary gradient background with modern typography',
    category: 'modern',
    settings: {
      content: {
        background: {
          type: 'gradient',
          gradient: {
            from: '#667eea',
            to: '#764ba2',
            direction: 'to-br',
          },
        },
        content: {
          title: 'Innovation Meets Design',
          subtitle: 'The future is here',
          description: 'Experience the perfect blend of cutting-edge technology and timeless design.',
          buttons: {
            primary: {
              text: 'Get Started',
              link: '/start',
              style: 'solid',
            },
          },
        },
        layout: {
          height: 'fullscreen',
          contentPosition: 'center',
          contentAlignment: 'center',
        },
      },
      behavior: {
        animation: {
          enabled: true,
          type: 'zoom',
          duration: 'slow',
        },
        parallax: { enabled: false },
        scrollHint: { enabled: true, style: 'arrow' },
      },
      style: {
        textColor: '#ffffff',
      },
    },
  },
  {
    id: 'video-background',
    name: 'Video Background',
    description: 'Immersive video background with minimal overlay',
    category: 'immersive',
    settings: {
      content: {
        background: {
          type: 'video',
          overlay: {
            enabled: true,
            opacity: 30,
            color: '#000000',
          },
        },
        content: {
          title: 'See It In Action',
          subtitle: 'Experience the difference',
          buttons: {
            primary: {
              text: 'Watch Demo',
              link: '/demo',
              style: 'outline',
            },
          },
        },
        layout: {
          height: 'fullscreen',
          contentPosition: 'center',
          contentAlignment: 'center',
        },
      },
      behavior: {
        animation: {
          enabled: true,
          type: 'fade',
          duration: 'slow',
          delay: 500,
        },
        parallax: { enabled: false },
        scrollHint: { enabled: false },
      },
      style: {
        textColor: '#ffffff',
      },
    },
  },
];

// Default hero settings
export const DEFAULT_HERO_SETTINGS: HeroSectionSettings = {
  enabled: true,
  content: {
    background: {
      type: 'color',
      color: '#f8f9fa',
    },
    content: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover amazing products',
      buttons: {
        primary: {
          text: 'Shop Now',
          link: '/products',
          style: 'solid',
        },
      },
    },
    layout: {
      height: 'medium',
      contentPosition: 'center',
      contentAlignment: 'center',
    },
  },
  behavior: {
    animation: {
      enabled: true,
      type: 'fade',
      duration: 'normal',
    },
    parallax: { enabled: false },
    scrollHint: { enabled: false },
  },
};