// Modern Component Library for Artisan Craft Theme
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StarIcon, CheckIcon, ChevronDownIcon, HeartIcon, ShoppingBagIcon } from '@/lib/theme-icons';
import { ArrowRight, Play, ExternalLink, Search, ShoppingBag, User, Heart } from 'lucide-react';
import { Block } from '@/types/blocks';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      style={{
        borderRadius: 'var(--theme-radius-md)',
      }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
}) => {
  const baseClasses = 'badge inline-flex items-center font-medium';
  
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    accent: 'badge-accent',
    success: 'badge-success',
    error: 'badge-error',
    info: 'badge-info',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
}) => {
  const baseClasses = 'card bg-white border border-gray-200 rounded-lg';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        baseClasses,
        hover && 'card-hover',
        paddingClasses[padding],
        className
      )}
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        borderRadius: 'var(--theme-radius-lg)',
        boxShadow: 'var(--theme-shadow-sm)',
      }}
    >
      {children}
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image?: string;
    badge?: string;
    rating?: number;
    reviewCount?: number;
  };
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  className,
}) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Card className={cn('group overflow-hidden', className)} hover padding="none">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title || 'Product image'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center ${product.image ? 'hidden fallback-icon' : ''}`}
          style={{ backgroundColor: 'var(--theme-border-light)' }}
        >
          <ShoppingBagIcon size="lg" className="opacity-40" />
        </div>
        
        {/* Badges */}
        {product.badge && (
          <Badge
            variant={hasDiscount ? 'error' : 'info'}
            className="absolute top-3 left-3"
          >
            {hasDiscount ? `-${discountPercent}%` : product.badge}
          </Badge>
        )}
        
        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onToggleWishlist?.(product.id)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Add to wishlist"
          >
            <HeartIcon size="sm" />
          </button>
        </div>
        
        {/* Quick Add Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            className="w-full"
            onClick={() => onAddToCart?.(product.id)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 
          className="font-medium line-clamp-2 mb-2"
          style={{ 
            color: 'var(--theme-text)',
            fontSize: 'var(--theme-text-base)',
          }}
        >
          {product.title}
        </h3>
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  size="sm"
                  fill={i < Math.floor(product.rating!) ? 'currentColor' : 'none'}
                  className={i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            {product.reviewCount && (
              <span 
                className="text-xs"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span 
            className="font-semibold"
            style={{ 
              color: 'var(--theme-text)',
              fontSize: 'var(--theme-text-lg)',
            }}
          >
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span 
              className="text-sm line-through"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              ${product.originalPrice!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--theme-text)' }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        
        <input
          className={cn(
            'input w-full',
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            error && 'input-error',
            className
          )}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>
      
      {hint && !error && (
        <p 
          className="mt-1 text-xs"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          {hint}
        </p>
      )}
      
      {error && (
        <p 
          className="mt-1 text-xs"
          style={{ color: 'var(--theme-error)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  hint,
  options,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--theme-text)' }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          className={cn(
            'input w-full pr-10 appearance-none',
            error && 'input-error',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon size="sm" />
        </div>
      </div>
      
      {hint && !error && (
        <p 
          className="mt-1 text-xs"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          {hint}
        </p>
      )}
      
      {error && (
        <p 
          className="mt-1 text-xs"
          style={{ color: 'var(--theme-error)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Loading Skeleton
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
}) => {
  return (
    <div
      className={cn('skeleton rounded', className)}
      style={{
        width: width || '100%',
        height: height || '1rem',
        backgroundColor: 'var(--theme-border-light)',
      }}
    />
  );
};

// Grid Component
interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 3,
  gap = 'md',
  className,
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };
  
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div
      className={cn(
        'grid',
        colsClasses[cols],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// Section Component
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'transparent' | 'surface' | 'muted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  background = 'transparent',
  padding = 'lg',
}) => {
  const backgroundStyles = {
    transparent: { backgroundColor: 'transparent' },
    surface: { backgroundColor: 'var(--theme-surface)' },
    muted: { backgroundColor: 'var(--theme-border-light)' },
  };
  
  const paddingClasses = {
    none: '',
    sm: 'py-8',
    md: 'py-16',
    lg: 'section',
  };

  return (
    <section
      className={cn(paddingClasses[padding], className)}
      style={backgroundStyles[background]}
    >
      <div className="container">
        {children}
      </div>
    </section>
  );
};

// ===============================
// HEADER BLOCK COMPONENTS
// ===============================

// Logo Block Component
export function LogoBlock({ block, storeData }: { block: Block; storeData?: any }) {
  const { type, src, text, alt, width, height, link, alignment, fontSize, fontWeight, color, letterSpacing } = block.settings;

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const fontSizeClasses = {
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const fontWeightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const letterSpacingClasses = {
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
    widest: 'tracking-widest'
  };

  return (
    <div className={`flex ${alignmentClasses[alignment]}`}>
      <Link href={link || '/'} className="hover:opacity-70 transition-opacity">
        {type === 'image' && src ? (
          <img
            src={src}
            alt={alt || 'Store Logo'}
            width={width}
            height={height}
            className="object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-lg font-medium">${storeData?.name || 'STORE'}</span>`;
              }
            }}
          />
        ) : (
          <span 
            className={`${fontSizeClasses[fontSize]} ${fontWeightClasses[fontWeight]} ${letterSpacingClasses[letterSpacing]}`}
            style={{ color }}
          >
            {text || storeData?.name || 'STORE'}
          </span>
        )}
      </Link>
    </div>
  );
}

// Navigation Block Component
export function NavigationBlock({ block }: { block: Block }) {
  const { 
    menuId, 
    style, 
    alignment, 
    showDropdowns, 
    fontSize, 
    fontWeight, 
    color, 
    hoverColor, 
    spacing 
  } = block.settings;

  // Mock menu items - in real implementation, this would come from API
  const menuItems = [
    { title: 'NEW ARRIVALS', url: '#' },
    { title: 'WOMEN', url: '#' },
    { title: 'MEN', url: '#' },
    { title: 'ACCESSORIES', url: '#' },
    { title: 'ABOUT', url: '#' }
  ];

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const styleClasses = {
    horizontal: 'flex-row space-x-8',
    vertical: 'flex-col space-y-4'
  };

  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  };

  const fontWeightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold'
  };

  const spacingClasses = {
    tight: style === 'horizontal' ? 'space-x-4' : 'space-y-2',
    normal: style === 'horizontal' ? 'space-x-8' : 'space-y-4',
    relaxed: style === 'horizontal' ? 'space-x-12' : 'space-y-6',
    loose: style === 'horizontal' ? 'space-x-16' : 'space-y-8'
  };

  return (
    <nav className={`hidden md:flex ${styleClasses[style]} ${alignmentClasses[alignment]} ${spacingClasses[spacing]}`}>
      {menuItems.map((item, index) => (
        <Link
          key={index}
          href={item.url}
          className={`${fontSizeClasses[fontSize]} ${fontWeightClasses[fontWeight]} tracking-wider hover:opacity-70 transition-colors relative group`}
          style={{ color }}
        >
          {item.title}
          <span className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full" style={{ backgroundColor: hoverColor }}></span>
        </Link>
      ))}
    </nav>
  );
}

// Search Block Component
export function SearchBlock({ block }: { block: Block }) {
  const { 
    placeholder, 
    showIcon, 
    width, 
    alignment, 
    borderRadius, 
    borderColor, 
    backgroundColor, 
    textColor 
  } = block.settings;

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const widthClasses = {
    small: 'w-48',
    medium: 'w-64',
    large: 'w-80',
    full: 'w-full'
  };

  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  return (
    <div className={`flex ${alignmentClasses[alignment]}`}>
      <div className="relative">
        {showIcon && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: textColor }} />
        )}
        <input
          type="text"
          placeholder={placeholder}
          className={`${widthClasses[width]} ${radiusClasses[borderRadius]} border px-4 py-2 ${showIcon ? 'pl-10' : ''} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          style={{
            backgroundColor,
            color: textColor,
            borderColor
          }}
        />
      </div>
    </div>
  );
}

// Cart Block Component
export function CartBlock({ block }: { block: Block }) {
  const { 
    showCount, 
    showTotal, 
    iconStyle, 
    iconSize, 
    color, 
    countColor, 
    countTextColor, 
    alignment 
  } = block.settings;

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  };

  return (
    <div className={`flex ${alignmentClasses[alignment]}`}>
      <Link href="/cart" className="relative p-2 hover:opacity-70 transition-colors">
        <ShoppingBag className={`${sizeClasses[iconSize]} ${iconStyle === 'filled' ? 'fill-current' : ''}`} style={{ color }} />
        {showCount && (
          <span 
            className="absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
            style={{ backgroundColor: countColor, color: countTextColor }}
          >
            0
          </span>
        )}
      </Link>
    </div>
  );
}

// Account Block Component
export function AccountBlock({ block }: { block: Block }) {
  const { iconStyle, iconSize, color, showLabel, labelText, alignment } = block.settings;

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`flex ${alignmentClasses[alignment]}`}>
      <Link href="/account" className="flex items-center gap-2 p-2 hover:opacity-70 transition-colors">
        <User className={`${sizeClasses[iconSize]} ${iconStyle === 'filled' ? 'fill-current' : ''}`} style={{ color }} />
        {showLabel && (
          <span className="text-sm" style={{ color }}>{labelText}</span>
        )}
      </Link>
    </div>
  );
}

// Wishlist Block Component
export function WishlistBlock({ block }: { block: Block }) {
  const { showCount, iconStyle, iconSize, color, countColor, alignment } = block.settings;

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`flex ${alignmentClasses[alignment]}`}>
      <Link href="/wishlist" className="relative p-2 hover:opacity-70 transition-colors">
        <Heart className={`${sizeClasses[iconSize]} ${iconStyle === 'filled' ? 'fill-current' : ''}`} style={{ color }} />
        {showCount && (
          <span 
            className="absolute -top-1 -right-1 text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium"
            style={{ backgroundColor: countColor, color: '#ffffff' }}
          >
            0
          </span>
        )}
      </Link>
    </div>
  );
}

// Header Block Renderer
export function renderHeaderBlock(block: Block, storeData?: any) {
  switch (block.type) {
    case 'logo':
      return <LogoBlock key={block.id} block={block} storeData={storeData} />;
    case 'navigation':
      return <NavigationBlock key={block.id} block={block} />;
    case 'search':
      return <SearchBlock key={block.id} block={block} />;
    case 'cart':
      return <CartBlock key={block.id} block={block} />;
    case 'account':
      return <AccountBlock key={block.id} block={block} />;
    case 'wishlist':
      return <WishlistBlock key={block.id} block={block} />;
    default:
      return null;
  }
}

// ===============================
// HERO BLOCK COMPONENTS
// ===============================

// Individual block renderers for the hero section
export function HeroTitleBlock({ block }: { block: Block }) {
  const { content, fontSize, fontWeight, textAlign, color, letterSpacing } = block.settings;

  const fontSizeClasses = {
    small: 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
    medium: 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
    large: 'text-5xl md:text-6xl lg:text-7xl xl:text-8xl',
    xl: 'text-6xl md:text-7xl lg:text-8xl xl:text-9xl'
  };

  const fontWeightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const letterSpacingClasses = {
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
    widest: 'tracking-widest'
  };

  return (
    <h1 
      className={`${fontSizeClasses[fontSize]} ${fontWeightClasses[fontWeight]} ${alignmentClasses[textAlign]} ${letterSpacingClasses[letterSpacing]} mb-8 leading-none`}
      style={{ color }}
    >
      {content.split(' ').map((word: string, index: number) => (
        <span key={index} className="block">
          {word}
        </span>
      ))}
    </h1>
  );
}

export function HeroSubtitleBlock({ block }: { block: Block }) {
  const { content, fontSize, fontWeight, textAlign, color, opacity, maxWidth } = block.settings;

  const fontSizeClasses = {
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl'
  };

  const fontWeightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  const maxWidthClasses = {
    none: '',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <p 
      className={`${fontSizeClasses[fontSize]} ${fontWeightClasses[fontWeight]} ${alignmentClasses[textAlign]} ${maxWidthClasses[maxWidth]} mb-12 leading-relaxed`}
      style={{ color, opacity: opacity / 100 }}
    >
      {content}
    </p>
  );
}

export function HeroBackgroundBlock({ block }: { block: Block }) {
  const { 
    type, 
    imageUrl, 
    videoUrl, 
    backgroundColor, 
    position, 
    size, 
    overlay, 
    overlayColor, 
    overlayOpacity, 
    parallax 
  } = block.settings;

  const backgroundStyles: React.CSSProperties = {};

  if (type === 'image' && imageUrl) {
    backgroundStyles.backgroundImage = `url(${imageUrl})`;
    backgroundStyles.backgroundPosition = position;
    backgroundStyles.backgroundSize = size;
    backgroundStyles.backgroundRepeat = 'no-repeat';
    backgroundStyles.backgroundAttachment = parallax ? 'fixed' : 'scroll';
  } else if (type === 'color') {
    backgroundStyles.backgroundColor = backgroundColor;
  }

  return (
    <>
      {/* Background */}
      {type !== 'video' && (
        <div 
          className="absolute inset-0"
          style={backgroundStyles}
        />
      )}

      {/* Video Background */}
      {type === 'video' && videoUrl && (
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      {overlay && (type === 'image' || type === 'video') && (
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: overlayColor,
            opacity: overlayOpacity / 100 
          }}
        />
      )}
    </>
  );
}

export function HeroButtonBlock({ block }: { block: Block }) {
  const { 
    text, 
    url, 
    style, 
    size, 
    icon, 
    iconPosition, 
    openInNewTab, 
    borderRadius 
  } = block.settings;

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-sm',
    xl: 'px-10 py-5 text-base'
  };

  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const getIcon = () => {
    switch (icon) {
      case 'arrow-right':
        return <ArrowRight className="h-4 w-4" />;
      case 'play':
        return <Play className="h-4 w-4" />;
      case 'external-link':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const IconComponent = getIcon();

  const buttonClasses = `
    group inline-flex items-center gap-3 
    ${sizeClasses[size]} 
    ${radiusClasses[borderRadius]}
    tracking-widest font-light transition-all duration-300
    ${style === 'filled' ? '' : 'border'}
    ${style === 'text' ? 'border-transparent' : ''}
  `;

  return (
    <Link
      href={url}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className={buttonClasses.trim()}
      style={{
        color: style === 'filled' ? '#ffffff' : '#ffffff',
        backgroundColor: style === 'filled' ? '#ffffff' : 'transparent',
        borderColor: style === 'text' ? 'transparent' : '#ffffff'
      }}
    >
      {icon === 'play' && iconPosition === 'left' && IconComponent}
      {text}
      {icon === 'arrow-right' && iconPosition === 'right' && IconComponent}
      {icon === 'external-link' && iconPosition === 'right' && IconComponent}
    </Link>
  );
}

// Block renderer that handles all hero block types
export function renderHeroBlock(block: Block) {
  switch (block.type) {
    case 'hero-title':
      return <HeroTitleBlock key={block.id} block={block} />;
    case 'hero-subtitle':
      return <HeroSubtitleBlock key={block.id} block={block} />;
    case 'hero-background':
      return <HeroBackgroundBlock key={block.id} block={block} />;
    case 'hero-button':
      return <HeroButtonBlock key={block.id} block={block} />;
    default:
      return null;
  }
}

// Block renderer that handles all footer block types
export function renderFooterBlock(block: Block) {
  switch (block.type) {
    case 'footer-newsletter':
      return <FooterNewsletterBlock key={block.id} block={block} />;
    case 'footer-links':
      return <FooterLinksBlock key={block.id} block={block} />;
    case 'footer-social':
      return <FooterSocialBlock key={block.id} block={block} />;
    case 'footer-contact':
      return <FooterContactBlock key={block.id} block={block} />;
    case 'footer-copyright':
      return <FooterCopyrightBlock key={block.id} block={block} />;
    default:
      return null;
  }
}

// Footer Block Components
function FooterNewsletterBlock({ block }: { block: Block }) {
  const { title, subtitle, placeholder } = block.settings;
  
  return (
    <div className="text-center mb-20">
      <h3 className="text-2xl md:text-3xl font-light tracking-wider mb-4">
        {title || 'STAY CONNECTED'}
      </h3>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        {subtitle || 'Subscribe to receive updates on new arrivals and exclusive offers'}
      </p>
      <div className="flex max-w-md mx-auto">
        <input
          type="email"
          placeholder={placeholder || 'Enter your email'}
          className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
        />
        <button className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors">
          SUBSCRIBE
        </button>
      </div>
    </div>
  );
}

function FooterLinksBlock({ block }: { block: Block }) {
  const { links } = block.settings;
  
  if (!links || !Array.isArray(links)) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {links.map((section: any, index: number) => (
        <div key={index}>
          <h5 className="text-sm font-medium tracking-wider mb-4">
            {section.title}
          </h5>
          <ul className="space-y-3">
            {section.links?.map((link: any, linkIndex: number) => (
              <li key={linkIndex}>
                <Link
                  href={link.url || '#'}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FooterSocialBlock({ block }: { block: Block }) {
  const { platforms } = block.settings;
  
  if (!platforms) return null;
  
  return (
    <div className="flex justify-center space-x-6">
      {platforms.facebook && (
        <Link
          href={platforms.facebook}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </Link>
      )}
      {platforms.twitter && (
        <Link
          href={platforms.twitter}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </Link>
      )}
      {platforms.instagram && (
        <Link
          href={platforms.instagram}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.281C4.198 14.553 3.5 13.026 3.5 11.265c0-1.76.698-3.288 1.626-4.442.875-.791 2.026-1.281 3.323-1.281 1.297 0 2.448.49 3.323 1.281.928 1.154 1.626 2.682 1.626 4.442 0 1.761-.698 3.288-1.626 4.442-.875.791-2.026 1.281-3.323 1.281zm7.068 0c-1.297 0-2.448-.49-3.323-1.281-.928-1.154-1.626-2.681-1.626-4.442 0-1.76.698-3.288 1.626-4.442.875-.791 2.026-1.281 3.323-1.281 1.297 0 2.448.49 3.323 1.281.928 1.154 1.626 2.682 1.626 4.442 0 1.761-.698 3.288-1.626 4.442-.875.791-2.026 1.281-3.323 1.281z"/>
          </svg>
        </Link>
      )}
    </div>
  );
}

function FooterContactBlock({ block }: { block: Block }) {
  const { title, email, phone, address } = block.settings;
  
  return (
    <div className="lg:col-span-2">
      <h4 className="text-xl font-light tracking-wider mb-6">
        {title || 'CONTACT'}
      </h4>
      <div className="space-y-3">
        {email && (
          <div className="flex items-center space-x-3">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center space-x-3">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm text-gray-600">{phone}</span>
          </div>
        )}
        {address && (
          <div className="flex items-center space-x-3">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-600">{address}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FooterCopyrightBlock({ block }: { block: Block }) {
  const { text } = block.settings;
  
  return (
    <div className="flex flex-col md:flex-row justify-center items-center pt-8 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        {text || `© ${new Date().getFullYear()} All rights reserved.`}
      </p>
    </div>
  );
}