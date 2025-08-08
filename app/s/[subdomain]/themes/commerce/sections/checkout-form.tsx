'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, MapPin, Building, AlertCircle } from 'lucide-react';

interface CheckoutFormProps {
  settings: {
    title?: string;
    subtitle?: string;
    requireEmail?: boolean;
    requirePhone?: boolean;
    requireCompany?: boolean;
    requireAddress2?: boolean;
    showNewsletterSignup?: boolean;
    newsletterText?: string;
    backgroundColor?: string;
    formBackgroundColor?: string;
    primaryColor?: string;
    textColor?: string;
    borderColor?: string;
    errorColor?: string;
  };
  store?: any;
  pageData?: any;
  isPreview?: boolean;
  onFormDataChange?: (data: any) => void;
}

export interface CheckoutFormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  acceptsMarketing: boolean;
}

export function CheckoutForm({ settings, store, pageData, isPreview, onFormDataChange }: CheckoutFormProps) {
  const {
    title = 'Contact Information',
    subtitle = 'We\'ll use this information to send you order updates',
    requireEmail = true,
    requirePhone = true,
    requireCompany = false,
    requireAddress2 = false,
    showNewsletterSignup = true,
    newsletterText = 'Email me with news and offers',
    backgroundColor = '#ffffff',
    formBackgroundColor = '#f9fafb',
    primaryColor = '#000000',
    textColor = '#111827',
    borderColor = '#e5e7eb',
    errorColor = '#ef4444'
  } = settings;

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    acceptsMarketing: false
  });

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Load saved customer data if available
  useEffect(() => {
    if (!isPreview && typeof window !== 'undefined') {
      const savedCustomer = localStorage.getItem(`customer_${store?.subdomain}`);
      if (savedCustomer) {
        try {
          const customer = JSON.parse(savedCustomer);
          setFormData(prev => ({
            ...prev,
            email: customer.email || '',
            firstName: customer.firstName || '',
            lastName: customer.lastName || '',
            phone: customer.phone || ''
          }));
        } catch (e) {
          console.error('Error loading customer data:', e);
        }
      }

      // Load saved checkout data
      const savedCheckout = sessionStorage.getItem(`checkout_${store?.subdomain}`);
      if (savedCheckout) {
        try {
          const checkoutData = JSON.parse(savedCheckout);
          setFormData(prev => ({ ...prev, ...checkoutData }));
        } catch (e) {
          console.error('Error loading checkout data:', e);
        }
      }
    }
  }, [store?.subdomain, isPreview]);

  // Save form data to session storage and notify parent
  useEffect(() => {
    if (!isPreview && typeof window !== 'undefined') {
      sessionStorage.setItem(`checkout_${store?.subdomain}`, JSON.stringify(formData));
    }
    
    // Notify parent component of form data changes
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData, store?.subdomain, isPreview, onFormDataChange]);

  const validateField = (field: keyof CheckoutFormData, value: string): string => {
    switch (field) {
      case 'email':
        if (requireEmail && !value) return 'Email is required';
        if (value && !/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
        break;
      case 'phone':
        if (requirePhone && !value) return 'Phone number is required';
        break;
      case 'firstName':
        if (!value) return 'First name is required';
        break;
      case 'lastName':
        if (!value) return 'Last name is required';
        break;
      case 'company':
        if (requireCompany && !value) return 'Company name is required';
        break;
      case 'address1':
        if (!value) return 'Address is required';
        break;
      case 'address2':
        if (requireAddress2 && !value) return 'Apartment/Suite is required';
        break;
      case 'city':
        if (!value) return 'City is required';
        break;
      case 'state':
        if (!value) return 'State/Province is required';
        break;
      case 'postalCode':
        if (!value) return 'Postal code is required';
        break;
    }
    return '';
  };

  const handleChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate on change if field was touched
    if (touched.has(field) && typeof value === 'string') {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof CheckoutFormData) => {
    setTouched(prev => new Set(prev).add(field));
    const value = formData[field];
    if (typeof value === 'string') {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const inputClasses = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors";
  const labelClasses = "block text-sm font-medium mb-2";

  return (
    <section style={{ backgroundColor }}>
      <div className="py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: textColor }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <div 
            className="p-6 rounded-lg"
            style={{ backgroundColor: formBackgroundColor, borderColor, borderWidth: '1px', borderStyle: 'solid' }}
          >
            <h3 className="text-lg font-medium mb-4" style={{ color: textColor }}>
              Contact Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className={labelClasses} style={{ color: textColor }}>
                  Email {requireEmail && <span style={{ color: errorColor }}>*</span>}
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={inputClasses}
                    style={{ 
                      borderColor: errors.email && touched.has('email') ? errorColor : borderColor,
                      paddingLeft: '2.75rem'
                    }}
                    placeholder="you@example.com"
                  />
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.email && touched.has('email') && (
                  <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className={labelClasses} style={{ color: textColor }}>
                  Phone {requirePhone && <span style={{ color: errorColor }}>*</span>}
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    className={inputClasses}
                    style={{ 
                      borderColor: errors.phone && touched.has('phone') ? errorColor : borderColor,
                      paddingLeft: '2.75rem'
                    }}
                    placeholder="+1 (555) 123-4567"
                  />
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.phone && touched.has('phone') && (
                  <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {showNewsletterSignup && (
                <div className="flex items-start gap-3">
                  <input
                    id="acceptsMarketing"
                    type="checkbox"
                    checked={formData.acceptsMarketing}
                    onChange={(e) => handleChange('acceptsMarketing', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <label htmlFor="acceptsMarketing" className="text-sm" style={{ color: textColor }}>
                    {newsletterText}
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div 
            className="p-6 rounded-lg"
            style={{ backgroundColor: formBackgroundColor, borderColor, borderWidth: '1px', borderStyle: 'solid' }}
          >
            <h3 className="text-lg font-medium mb-4" style={{ color: textColor }}>
              Shipping Address
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className={labelClasses} style={{ color: textColor }}>
                    First Name <span style={{ color: errorColor }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      className={inputClasses}
                      style={{ 
                        borderColor: errors.firstName && touched.has('firstName') ? errorColor : borderColor,
                        paddingLeft: '2.75rem'
                      }}
                      placeholder="John"
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.firstName && touched.has('firstName') && (
                    <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                      <AlertCircle className="h-4 w-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className={labelClasses} style={{ color: textColor }}>
                    Last Name <span style={{ color: errorColor }}>*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    className={inputClasses}
                    style={{ 
                      borderColor: errors.lastName && touched.has('lastName') ? errorColor : borderColor
                    }}
                    placeholder="Doe"
                  />
                  {errors.lastName && touched.has('lastName') && (
                    <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                      <AlertCircle className="h-4 w-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {(requireCompany || formData.company) && (
                <div>
                  <label htmlFor="company" className={labelClasses} style={{ color: textColor }}>
                    Company {requireCompany && <span style={{ color: errorColor }}>*</span>}
                  </label>
                  <div className="relative">
                    <input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      onBlur={() => handleBlur('company')}
                      className={inputClasses}
                      style={{ 
                        borderColor: errors.company && touched.has('company') ? errorColor : borderColor,
                        paddingLeft: '2.75rem'
                      }}
                      placeholder="Company name (optional)"
                    />
                    <Building className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.company && touched.has('company') && (
                    <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                      <AlertCircle className="h-4 w-4" />
                      {errors.company}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="address1" className={labelClasses} style={{ color: textColor }}>
                  Address <span style={{ color: errorColor }}>*</span>
                </label>
                <div className="relative">
                  <input
                    id="address1"
                    type="text"
                    value={formData.address1}
                    onChange={(e) => handleChange('address1', e.target.value)}
                    onBlur={() => handleBlur('address1')}
                    className={inputClasses}
                    style={{ 
                      borderColor: errors.address1 && touched.has('address1') ? errorColor : borderColor,
                      paddingLeft: '2.75rem'
                    }}
                    placeholder="123 Main Street"
                  />
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.address1 && touched.has('address1') && (
                  <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                    <AlertCircle className="h-4 w-4" />
                    {errors.address1}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="address2" className={labelClasses} style={{ color: textColor }}>
                  Apartment, suite, etc. {requireAddress2 && <span style={{ color: errorColor }}>*</span>}
                </label>
                <input
                  id="address2"
                  type="text"
                  value={formData.address2}
                  onChange={(e) => handleChange('address2', e.target.value)}
                  onBlur={() => handleBlur('address2')}
                  className={inputClasses}
                  style={{ 
                    borderColor: errors.address2 && touched.has('address2') ? errorColor : borderColor
                  }}
                  placeholder="Apartment 4B"
                />
                {errors.address2 && touched.has('address2') && (
                  <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                    <AlertCircle className="h-4 w-4" />
                    {errors.address2}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className={labelClasses} style={{ color: textColor }}>
                    City <span style={{ color: errorColor }}>*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    onBlur={() => handleBlur('city')}
                    className={inputClasses}
                    style={{ 
                      borderColor: errors.city && touched.has('city') ? errorColor : borderColor
                    }}
                    placeholder="New York"
                  />
                  {errors.city && touched.has('city') && (
                    <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                      <AlertCircle className="h-4 w-4" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className={labelClasses} style={{ color: textColor }}>
                    State / Province <span style={{ color: errorColor }}>*</span>
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    onBlur={() => handleBlur('state')}
                    className={inputClasses}
                    style={{ 
                      borderColor: errors.state && touched.has('state') ? errorColor : borderColor
                    }}
                    placeholder="NY"
                  />
                  {errors.state && touched.has('state') && (
                    <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                      <AlertCircle className="h-4 w-4" />
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className={labelClasses} style={{ color: textColor }}>
                    ZIP / Postal Code <span style={{ color: errorColor }}>*</span>
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    onBlur={() => handleBlur('postalCode')}
                    className={inputClasses}
                    style={{ 
                      borderColor: errors.postalCode && touched.has('postalCode') ? errorColor : borderColor
                    }}
                    placeholder="10001"
                  />
                  {errors.postalCode && touched.has('postalCode') && (
                    <p className="mt-1 text-sm flex items-center gap-1" style={{ color: errorColor }}>
                      <AlertCircle className="h-4 w-4" />
                      {errors.postalCode}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className={labelClasses} style={{ color: textColor }}>
                    Country <span style={{ color: errorColor }}>*</span>
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className={inputClasses}
                    style={{ borderColor }}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="FR">France</option>
                    <option value="DE">Germany</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="NL">Netherlands</option>
                    <option value="JP">Japan</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}