// Modern Icon Library for Commerce Theme
import React from 'react';

interface IconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Shopping & E-commerce Icons
export const ShoppingBagIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const CartIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// UI & Navigation Icons
export const MenuIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Feature Icons
export const TruckIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const GiftIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

// Social Icons
export const FacebookIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const TwitterIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// Product Icons
export const StarIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5, fill = 'none' }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const TagIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export const FilterIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// Alert & Status Icons
export const CheckIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const AlertCircleIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// Communication Icons
export const MailIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const MessageCircleIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

// Payment Icons
export const CreditCardIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

// Layout Icons  
export const GridIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const ListIcon: React.FC<IconProps> = ({ className = '', size = 'md', strokeWidth = 1.5 }) => (
  <svg 
    className={`icon ${className}`} 
    width={sizeMap[size]} 
    height={sizeMap[size]} 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);