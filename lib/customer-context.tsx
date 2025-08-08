'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  acceptsMarketing: boolean;
  status: string;
  orders?: any[];
  _count?: {
    orders: number;
  };
}

interface CustomerContextType {
  customer: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children, subdomain }: { children: React.ReactNode; subdomain: string }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if we're in preview mode
  const isPreviewMode = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/preview') || 
     window.location.search.includes('preview=true') ||
     window.parent !== window); // iframe context

  // Fetch current customer data
  const fetchCustomer = useCallback(async () => {
    // Skip customer fetch in preview mode
    if (isPreviewMode) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/stores/${subdomain}/customers/auth/me`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [subdomain, isPreviewMode]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const login = async (email: string, password: string) => {
    if (isPreviewMode) {
      throw new Error('Authentication not available in preview mode');
    }

    const response = await fetch(`/api/stores/${subdomain}/customers/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setCustomer(data.customer);
    router.refresh();
  };

  const register = async (registerData: RegisterData) => {
    if (isPreviewMode) {
      throw new Error('Authentication not available in preview mode');
    }

    const response = await fetch(`/api/stores/${subdomain}/customers/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    setCustomer(data.customer);
    router.refresh();
  };

  const logout = async () => {
    if (isPreviewMode) {
      throw new Error('Authentication not available in preview mode');
    }

    await fetch(`/api/stores/${subdomain}/customers/auth/logout`, {
      method: 'POST',
    });
    
    setCustomer(null);
    router.push('/');
    router.refresh();
  };

  const updateProfile = async (profileData: Partial<Customer>) => {
    if (isPreviewMode) {
      throw new Error('Authentication not available in preview mode');
    }

    const response = await fetch(`/api/stores/${subdomain}/customers/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Update failed');
    }

    const data = await response.json();
    setCustomer(data.customer);
  };

  const refreshCustomer = async () => {
    await fetchCustomer();
  };

  return (
    <CustomerContext.Provider 
      value={{ 
        customer, 
        loading, 
        login, 
        register, 
        logout, 
        updateProfile,
        refreshCustomer
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}