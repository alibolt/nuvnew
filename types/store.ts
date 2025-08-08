// Shared Store type definitions
export interface Store {
  id: string;
  name: string;
  subdomain: string;
  domain?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  
  // Status
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive?: boolean;
  
  // Settings
  currency?: string;
  currencySymbol?: string;
  timezone?: string;
  locale?: string;
  
  // Contact
  email?: string;
  phone?: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  
  // Theme
  themeId?: string;
  theme?: {
    id: string;
    name: string;
    version?: string;
  };
  
  // Timestamps
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Relations
  ownerId?: string;
  owner?: {
    id: string;
    email: string;
    name?: string;
  };
  
  // Features
  features?: {
    blog?: boolean;
    reviews?: boolean;
    wishlist?: boolean;
    giftCards?: boolean;
    loyalty?: boolean;
  };
  
  // Analytics
  analytics?: {
    totalOrders?: number;
    totalRevenue?: number;
    totalCustomers?: number;
    totalProducts?: number;
  };
}

// Store settings
export interface StoreSettings {
  general?: {
    storeName?: string;
    storeEmail?: string;
    storePhone?: string;
    timezone?: string;
    weightUnit?: 'kg' | 'lb' | 'oz' | 'g';
  };
  
  checkout?: {
    requirePhone?: boolean;
    requireCompany?: boolean;
    allowGuestCheckout?: boolean;
    autoArchiveOrders?: boolean;
  };
  
  taxes?: {
    taxesIncluded?: boolean;
    automaticTaxes?: boolean;
    taxRate?: number;
  };
  
  shipping?: {
    freeShippingThreshold?: number;
    defaultShippingRate?: number;
  };
  
  payments?: {
    providers?: Array<{
      name: string;
      enabled: boolean;
      config?: Record<string, any>;
    }>;
  };
}

// Store list item (for admin dashboard)
export interface StoreListItem {
  id: string;
  name: string;
  subdomain: string;
  status?: string;
  logo?: string;
  createdAt?: Date | string;
  analytics?: {
    totalOrders?: number;
    totalRevenue?: number;
  };
}