// Minimal Theme - Centralized Settings Schema
// Bu dosya tüm tema ayarlarının merkezi yapısını tanımlar

export interface ThemeSettings {
  // Renkler - Tüm tema boyunca kullanılacak
  colors: {
    // Ana renkler
    primary: string;         // Butonlar, linkler, vurgular
    secondary: string;       // İkincil vurgular
    accent: string;         // Özel vurgular (badge, tag vb.)
    
    // Arka plan renkleri
    background: string;      // Ana arka plan
    surface: string;        // Kartlar, paneller
    
    // Metin renkleri
    text: string;           // Ana metin
    textMuted: string;      // İkincil metin
    textLight: string;      // Açık metin (üst başlıklar vb.)
    
    // Durum renkleri
    success: string;
    error: string;
    warning: string;
    info: string;
    
    // Border renkleri
    border: string;
    borderLight: string;
  };
  
  // Tipografi - Font aileleri ve boyutları
  typography: {
    // Font aileleri
    headingFont: string;    // Başlıklar için
    bodyFont: string;       // Gövde metni için
    
    // Font boyutları (rem cinsinden)
    fontSize: {
      xs: string;      // 0.75rem
      sm: string;      // 0.875rem
      base: string;    // 1rem
      lg: string;      // 1.125rem
      xl: string;      // 1.25rem
      '2xl': string;   // 1.5rem
      '3xl': string;   // 1.875rem
      '4xl': string;   // 2.25rem
      '5xl': string;   // 3rem
      '6xl': string;   // 3.75rem
    };
    
    // Line heights
    lineHeight: {
      tight: string;   // 1.25
      normal: string;  // 1.5
      relaxed: string; // 1.75
      loose: string;   // 2
    };
    
    // Font weights
    fontWeight: {
      light: string;   // 300
      normal: string;  // 400
      medium: string;  // 500
      semibold: string; // 600
      bold: string;    // 700
    };
  };
  
  // Spacing sistemi - Padding, margin, gap değerleri
  spacing: {
    // Section spacing
    sectionPadding: {
      mobile: string;   // Mobil cihazlar için
      tablet: string;   // Tablet için
      desktop: string;  // Desktop için
    };
    
    // Container settings
    container: {
      maxWidth: string;      // Max genişlik (1280px vb.)
      padding: string;       // Yan padding
    };
    
    // Component spacing
    componentGap: {
      sm: string;      // Küçük aralık
      md: string;      // Orta aralık
      lg: string;      // Büyük aralık
    };
  };
  
  // Buton stilleri
  buttons: {
    // Stil varyantları
    style: 'rounded' | 'square' | 'pill';
    
    // Boyutlar
    size: {
      sm: {
        padding: string;
        fontSize: string;
      };
      md: {
        padding: string;
        fontSize: string;
      };
      lg: {
        padding: string;
        fontSize: string;
      };
    };
    
    // Hover efektleri
    hoverEffect: 'none' | 'lighten' | 'darken' | 'shadow';
  };
  
  // Layout ayarları
  layout: {
    // Genel layout tipi
    type: 'full-width' | 'boxed';
    
    // Border radius değerleri
    borderRadius: {
      none: string;     // 0
      sm: string;       // 0.125rem
      md: string;       // 0.375rem
      lg: string;       // 0.5rem
      xl: string;       // 0.75rem
      full: string;     // 9999px
    };
    
    // Gölgeler
    shadows: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  
  // Animasyon ayarları
  animations: {
    // Section animasyonları
    sectionAnimation: 'none' | 'fade' | 'slide-up' | 'slide-left' | 'zoom';
    
    // Animasyon hızı
    duration: 'fast' | 'normal' | 'slow';
    
    // Hover transitions
    transitionDuration: string; // ms cinsinden
  };
  
  // Header özel ayarları
  header: {
    // Header stili
    style: 'transparent' | 'solid' | 'border';
    
    // Sticky header
    sticky: boolean;
    
    // Header yüksekliği
    height: {
      mobile: string;
      desktop: string;
    };
    
    // Announcement bar
    announcement: {
      enabled: boolean;
      text: string;
      backgroundColor: string;
      textColor: string;
    };
  };
  
  // Footer özel ayarları
  footer: {
    // Footer stili
    style: 'minimal' | 'columns' | 'centered';
    
    // Arka plan
    backgroundColor: string;
    textColor: string;
  };
}

// Varsayılan tema ayarları - Minimal için
export const defaultThemeSettings: ThemeSettings = {
  colors: {
    primary: '#000000',
    secondary: '#666666',
    accent: '#8B9F7E',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#000000',
    textMuted: '#666666',
    textLight: '#999999',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
  },
  
  typography: {
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  spacing: {
    sectionPadding: {
      mobile: '3rem',
      tablet: '4rem',
      desktop: '5rem',
    },
    
    container: {
      maxWidth: '1280px',
      padding: '1rem',
    },
    
    componentGap: {
      sm: '1rem',
      md: '2rem',
      lg: '3rem',
    },
  },
  
  buttons: {
    style: 'square',
    
    size: {
      sm: {
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
      },
      md: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
      },
      lg: {
        padding: '1rem 2rem',
        fontSize: '1.125rem',
      },
    },
    
    hoverEffect: 'darken',
  },
  
  layout: {
    type: 'full-width',
    
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  },
  
  animations: {
    sectionAnimation: 'fade',
    duration: 'normal',
    transitionDuration: '300',
  },
  
  header: {
    style: 'solid',
    sticky: true,
    height: {
      mobile: '60px',
      desktop: '80px',
    },
    announcement: {
      enabled: false,
      text: '',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
    },
  },
  
  footer: {
    style: 'minimal',
    backgroundColor: '#FAFAFA',
    textColor: '#000000',
  },
};

// CSS değişkenlerini oluştur
export function generateCSSVariables(settings: ThemeSettings): string {
  return `
    /* Colors */
    --theme-primary: ${settings.colors.primary};
    --theme-secondary: ${settings.colors.secondary};
    --theme-accent: ${settings.colors.accent};
    --theme-background: ${settings.colors.background};
    --theme-surface: ${settings.colors.surface};
    --theme-text: ${settings.colors.text};
    --theme-text-muted: ${settings.colors.textMuted};
    --theme-text-light: ${settings.colors.textLight};
    --theme-success: ${settings.colors.success};
    --theme-error: ${settings.colors.error};
    --theme-warning: ${settings.colors.warning};
    --theme-info: ${settings.colors.info};
    --theme-border: ${settings.colors.border};
    --theme-border-light: ${settings.colors.borderLight};
    
    /* Typography */
    --theme-font-heading: ${settings.typography.headingFont};
    --theme-font-body: ${settings.typography.bodyFont};
    
    /* Font Sizes */
    --theme-text-xs: ${settings.typography.fontSize.xs};
    --theme-text-sm: ${settings.typography.fontSize.sm};
    --theme-text-base: ${settings.typography.fontSize.base};
    --theme-text-lg: ${settings.typography.fontSize.lg};
    --theme-text-xl: ${settings.typography.fontSize.xl};
    --theme-text-2xl: ${settings.typography.fontSize['2xl']};
    --theme-text-3xl: ${settings.typography.fontSize['3xl']};
    --theme-text-4xl: ${settings.typography.fontSize['4xl']};
    --theme-text-5xl: ${settings.typography.fontSize['5xl']};
    --theme-text-6xl: ${settings.typography.fontSize['6xl']};
    
    /* Spacing */
    --theme-section-padding-mobile: ${settings.spacing.sectionPadding.mobile};
    --theme-section-padding-tablet: ${settings.spacing.sectionPadding.tablet};
    --theme-section-padding-desktop: ${settings.spacing.sectionPadding.desktop};
    --theme-container-max-width: ${settings.spacing.container.maxWidth};
    --theme-container-padding: ${settings.spacing.container.padding};
    
    /* Border Radius */
    --theme-radius-none: ${settings.layout.borderRadius.none};
    --theme-radius-sm: ${settings.layout.borderRadius.sm};
    --theme-radius-md: ${settings.layout.borderRadius.md};
    --theme-radius-lg: ${settings.layout.borderRadius.lg};
    --theme-radius-xl: ${settings.layout.borderRadius.xl};
    --theme-radius-full: ${settings.layout.borderRadius.full};
    
    /* Shadows */
    --theme-shadow-none: ${settings.layout.shadows.none};
    --theme-shadow-sm: ${settings.layout.shadows.sm};
    --theme-shadow-md: ${settings.layout.shadows.md};
    --theme-shadow-lg: ${settings.layout.shadows.lg};
    --theme-shadow-xl: ${settings.layout.shadows.xl};
    
    /* Animation */
    --theme-transition-duration: ${settings.animations.transitionDuration}ms;
  `;
}