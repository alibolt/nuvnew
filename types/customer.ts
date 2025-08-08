// Shared Customer type definitions
export interface CustomerAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  phone?: string;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  
  // Authentication
  emailVerified?: boolean;
  acceptsMarketing?: boolean;
  
  // Addresses
  addresses?: CustomerAddress[];
  defaultAddress?: CustomerAddress;
  
  // Orders
  orders?: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: Date | string;
  }>;
  ordersCount?: number;
  totalSpent?: number;
  
  // Account
  tags?: string[];
  note?: string;
  
  // Timestamps
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastOrderAt?: Date | string;
  
  // Store relation
  storeId?: string;
}

// Customer session (for logged-in customers)
export interface CustomerSession {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

// Customer list item (for admin dashboard)
export interface CustomerListItem {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  ordersCount?: number;
  totalSpent?: number;
  createdAt?: Date | string;
  lastOrderAt?: Date | string;
}

// Customer registration data
export interface CustomerRegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

// Customer login data
export interface CustomerLoginData {
  email: string;
  password: string;
}