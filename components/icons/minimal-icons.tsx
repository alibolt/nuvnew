// Minimal Theme - Custom Icon Library
// Elegant and minimalistic SVG icons

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

// Shopping & E-commerce Icons
export const BagIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9H21L19 21H5L3 9Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"/>
    <path d="M8 9V6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6V9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const CartIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 13V17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const HeartIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor', filled = false }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} className={className}>
    <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SearchIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth}/>
    <path d="M21 21L16.65 16.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const UserIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth}/>
    <path d="M4 21V17C4 15.8954 4.89543 15 6 15H18C19.1046 15 20 15.8954 20 17V21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

// Navigation Icons
export const MenuIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 12H21M3 6H21M3 18H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const CloseIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const ArrowRightIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArrowLeftIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChevronDownIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 9L12 15L18 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Social Media Icons (Minimal versions)
export const InstagramMinimalIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" stroke={color} strokeWidth={strokeWidth}/>
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth}/>
    <circle cx="17.5" cy="6.5" r="1.5" fill={color}/>
  </svg>
);

export const FacebookMinimalIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 22V12H6V9H9V6.5C9 3.5 10.5 2 13.5 2H16V5H14C12.9 5 12 5.9 12 7V9H16L15.5 12H12V22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const TwitterMinimalIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M23 3C22 3.5 21 4 20 4C19 3 18 2 16.5 2C13.5 2 11.5 4.5 12 7.5C8 7.5 4.5 5.5 2 2.5C1.5 3.5 1.5 5 2 6.5C2.5 8 3.5 9 4.5 9.5C3.5 9.5 2.5 9 2 8.5C2 11.5 3.5 13.5 6 14C5.5 14 4.5 14 4 13.5C4.5 16 6.5 17.5 9 17.5C7 19 4.5 20 2 19.5C4.5 21 7.5 22 11 22C19 22 23 14 23 7V6C24 5.5 24.5 4.5 25 3.5C24 4 23 4 22 4L23 3Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Feature Icons
export const TruckIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M1 3H16V16H1V3Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"/>
    <path d="M16 8H20L23 11V16H16V8Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"/>
    <circle cx="5.5" cy="19.5" r="2.5" stroke={color} strokeWidth={strokeWidth}/>
    <circle cx="18.5" cy="19.5" r="2.5" stroke={color} strokeWidth={strokeWidth}/>
  </svg>
);

export const RefreshIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M1 4V10H7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 20V14H17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.49 9C19.79 5.91 17.15 3.5 13.92 2.68C9.71 1.56 5.39 3.26 3.12 6.5L1 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.51 15C4.21 18.09 6.85 20.5 10.08 21.32C14.29 22.44 18.61 20.74 20.88 17.5L23 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ShieldIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L4 7V12C4 16.5 7 20.26 12 21C17 20.26 20 16.5 20 12V7L12 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"/>
  </svg>
);

export const StarIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor', filled = false }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} className={className}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"/>
  </svg>
);

// UI Elements
export const PlusIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 5V19M5 12H19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const MinusIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12H19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const CheckIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20 6L9 17L4 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const InfoIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth}/>
    <path d="M12 16V12M12 8H12.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

// Filter & Sort
export const FilterIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"/>
  </svg>
);

export const GridIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth={strokeWidth}/>
    <rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth={strokeWidth}/>
    <rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth={strokeWidth}/>
    <rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth={strokeWidth}/>
  </svg>
);

export const ListIcon = ({ className = '', size = 24, strokeWidth = 1.5, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

// Export all icons as a collection
export const MinimalIcons = {
  // Shopping
  Bag: BagIcon,
  Cart: CartIcon,
  Heart: HeartIcon,
  Search: SearchIcon,
  User: UserIcon,
  
  // Navigation
  Menu: MenuIcon,
  Close: CloseIcon,
  ArrowRight: ArrowRightIcon,
  ArrowLeft: ArrowLeftIcon,
  ChevronDown: ChevronDownIcon,
  
  // Social
  Instagram: InstagramMinimalIcon,
  Facebook: FacebookMinimalIcon,
  Twitter: TwitterMinimalIcon,
  
  // Features
  Truck: TruckIcon,
  Refresh: RefreshIcon,
  Shield: ShieldIcon,
  Star: StarIcon,
  
  // UI
  Plus: PlusIcon,
  Minus: MinusIcon,
  Check: CheckIcon,
  Info: InfoIcon,
  
  // Layout
  Filter: FilterIcon,
  Grid: GridIcon,
  List: ListIcon,
};