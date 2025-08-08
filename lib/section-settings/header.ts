// Header Section Settings - Focused on header-specific features
import { BaseSectionSettings, CommonStyleOverrides, SectionPreset } from './section-settings-base';

// Header-specific content settings
export interface HeaderContentSettings {
  // Logo Configuration
  logo: {
    type: 'text' | 'image';
    position: 'left' | 'center' | 'right';
    image?: string;
    text?: string;
    height?: {
      mobile: string;
      desktop: string;
    };
  };
  
  // Navigation
  navigation: {
    menuHandle: string;
    style: 'inline' | 'dropdown' | 'mega';
    alignment: 'left' | 'center' | 'right' | 'justified';
    showOnMobile: boolean;
  };
  
  // Actions
  actions: {
    search: {
      enabled: boolean;
      placeholder?: string;
    };
    account: {
      enabled: boolean;
      loggedInText?: string;
      loggedOutText?: string;
    };
    wishlist: {
      enabled: boolean;
    };
    cart: {
      enabled: boolean;
      style: 'icon-only' | 'icon-count' | 'icon-price';
    };
  };
}

// Header behavior settings
export interface HeaderBehaviorSettings {
  // Sticky behavior
  sticky: {
    enabled: boolean;
    hideOnScrollDown?: boolean;
    changeBgOnScroll?: boolean;
  };
  
  // Transparency
  transparent: {
    enabled: boolean;
    textColor?: string;
    onlyOnHomepage?: boolean;
  };
  
  // Mobile
  mobile: {
    menuStyle: 'drawer' | 'fullscreen' | 'dropdown';
    menuPosition?: 'left' | 'right';
    showLogo: boolean;
    centerLogo?: boolean;
  };
}

// Complete header settings
export interface HeaderSectionSettings extends BaseSectionSettings {
  content: HeaderContentSettings;
  behavior: HeaderBehaviorSettings;
  style?: Partial<CommonStyleOverrides> & {
    height?: {
      mobile: string;
      desktop: string;
    };
    padding?: {
      mobile: string;
      desktop: string;
    };
  };
}

// Header presets
export const HEADER_PRESETS: SectionPreset<HeaderSectionSettings>[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean design with left logo and inline menu',
    category: 'simple',
    settings: {
      content: {
        logo: {
          type: 'text',
          position: 'left',
        },
        navigation: {
          menuHandle: 'main-menu',
          style: 'inline',
          alignment: 'right',
          showOnMobile: false,
        },
        actions: {
          search: { enabled: false },
          account: { enabled: false },
          wishlist: { enabled: false },
          cart: { enabled: true, style: 'icon-count' },
        },
      },
      behavior: {
        sticky: { enabled: true },
        transparent: { enabled: false },
        mobile: {
          menuStyle: 'drawer',
          menuPosition: 'left',
          showLogo: true,
        },
      },
    },
  },
  {
    id: 'centered',
    name: 'Centered',
    description: 'Logo center with menu on both sides',
    category: 'elegant',
    settings: {
      content: {
        logo: {
          type: 'text',
          position: 'center',
        },
        navigation: {
          menuHandle: 'main-menu',
          style: 'inline',
          alignment: 'justified',
          showOnMobile: false,
        },
        actions: {
          search: { enabled: true },
          account: { enabled: true },
          wishlist: { enabled: false },
          cart: { enabled: true, style: 'icon-count' },
        },
      },
      behavior: {
        sticky: { enabled: true, changeBgOnScroll: true },
        transparent: { enabled: false },
        mobile: {
          menuStyle: 'drawer',
          menuPosition: 'left',
          showLogo: true,
          centerLogo: true,
        },
      },
    },
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Pro',
    description: 'Full featured with mega menu and all actions',
    category: 'professional',
    settings: {
      content: {
        logo: {
          type: 'image',
          position: 'left',
        },
        navigation: {
          menuHandle: 'main-menu',
          style: 'mega',
          alignment: 'left',
          showOnMobile: false,
        },
        actions: {
          search: { 
            enabled: true,
            placeholder: 'Search products...'
          },
          account: { 
            enabled: true,
            loggedInText: 'My Account',
            loggedOutText: 'Sign In'
          },
          wishlist: { enabled: true },
          cart: { 
            enabled: true, 
            style: 'icon-price' 
          },
        },
      },
      behavior: {
        sticky: { 
          enabled: true,
          hideOnScrollDown: true,
          changeBgOnScroll: true
        },
        transparent: { enabled: false },
        mobile: {
          menuStyle: 'fullscreen',
          menuPosition: 'left',
          showLogo: true,
        },
      },
      style: {
        height: {
          mobile: '60px',
          desktop: '90px',
        },
      },
    },
  },
  {
    id: 'transparent',
    name: 'Transparent Modern',
    description: 'Transparent header with modern animations',
    category: 'modern',
    settings: {
      content: {
        logo: {
          type: 'text',
          position: 'left',
        },
        navigation: {
          menuHandle: 'main-menu',
          style: 'inline',
          alignment: 'center',
          showOnMobile: false,
        },
        actions: {
          search: { enabled: true },
          account: { enabled: true },
          wishlist: { enabled: false },
          cart: { enabled: true, style: 'icon-only' },
        },
      },
      behavior: {
        sticky: { 
          enabled: true,
          changeBgOnScroll: true
        },
        transparent: { 
          enabled: true,
          textColor: '#ffffff',
          onlyOnHomepage: true
        },
        mobile: {
          menuStyle: 'drawer',
          menuPosition: 'right',
          showLogo: true,
        },
      },
      style: {
        backgroundColor: 'transparent',
      },
    },
  },
];

// Default header settings
export const DEFAULT_HEADER_SETTINGS: HeaderSectionSettings = {
  enabled: true,
  content: {
    logo: {
      type: 'text',
      position: 'left',
    },
    navigation: {
      menuHandle: 'main-menu',
      style: 'inline',
      alignment: 'right',
      showOnMobile: false,
    },
    actions: {
      search: { enabled: true },
      account: { enabled: true },
      wishlist: { enabled: false },
      cart: { enabled: true, style: 'icon-count' },
    },
  },
  behavior: {
    sticky: { enabled: true },
    transparent: { enabled: false },
    mobile: {
      menuStyle: 'drawer',
      menuPosition: 'left',
      showLogo: true,
    },
  },
};