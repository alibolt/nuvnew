'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, 
  Tag, MessageSquare, Shield, Heart
} from 'lucide-react';

interface CustomerFormProps {
  subdomain: string;
  customer?: any; // For editing existing customers
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface CustomerFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  notes: string;
  tags: string[];
  acceptsMarketing: boolean;
  status: string;
}

const initialFormData: CustomerFormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  notes: '',
  tags: [],
  acceptsMarketing: false,
  status: 'active',
};

export function CustomerForm({ subdomain, customer, onSuccess, onCancel }: CustomerFormProps) {
  const router = useRouter();
  const isEditing = !!customer;
  
  const [formData, setFormData] = useState<CustomerFormData>(() => {
    if (customer) {
      return {
        email: customer.email || '',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
        gender: customer.gender || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || '',
        zipCode: customer.zipCode || '',
        notes: customer.notes || '',
        tags: customer.tags || [],
        acceptsMarketing: customer.acceptsMarketing || false,
        status: customer.status || 'active',
      };
    }
    return initialFormData;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const url = isEditing 
        ? `/api/stores/${subdomain}/customers/${customer.id}`
        : `/api/stores/${subdomain}/customers`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save customer');
      }

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="nuvi-animate-slide-up">
      {/* Header */}
      <div className="nuvi-page-header">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            onClick={handleCancel}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="nuvi-page-title">
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <p className="nuvi-page-description">
              {isEditing ? 'Update customer information' : 'Create a new customer profile'}
            </p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-gap-md">
          <button
            type="button"
            onClick={handleCancel}
            className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customer-form"
            className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="nuvi-btn-loading" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? 'Update Customer' : 'Create Customer'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form id="customer-form" onSubmit={handleSubmit} className="nuvi-space-y-lg">
        {errors.submit && (
          <div className="nuvi-alert nuvi-alert-error">
            {errors.submit}
          </div>
        )}

        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
          {/* Personal Information */}
          <div className="nuvi-lg:col-span-2">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <User className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Personal Information</h3>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                {/* Email */}
                <div className="nuvi-form-group">
                  <label className="nuvi-label nuvi-required">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`nuvi-input ${errors.email ? 'nuvi-input-error' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="customer@example.com"
                    required
                  />
                  {errors.email && (
                    <p className="nuvi-text-error nuvi-text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Name */}
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">First Name</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Last Name</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="nuvi-form-group">
                  <label className="nuvi-label">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="nuvi-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Demographics */}
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="nuvi-input"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Gender</label>
                    <select
                      className="nuvi-select"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="nuvi-card nuvi-mt-lg">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <MapPin className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Address Information</h3>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Address</label>
                  <input
                    type="text"
                    className="nuvi-input"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">City</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="New York"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">State/Province</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Country</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="United States"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">ZIP/Postal Code</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="nuvi-space-y-lg">
            {/* Status & Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <Shield className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Status & Settings</h3>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Status</label>
                  <select
                    className="nuvi-select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-cursor-pointer">
                    <input
                      type="checkbox"
                      className="nuvi-checkbox"
                      checked={formData.acceptsMarketing}
                      onChange={(e) => handleInputChange('acceptsMarketing', e.target.checked)}
                    />
                    <Heart className="h-4 w-4" />
                    <span>Accepts Marketing</span>
                  </label>
                  <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                    Customer agrees to receive promotional emails
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <Tag className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Tags</h3>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-flex nuvi-gap-sm">
                  <input
                    type="text"
                    className="nuvi-input nuvi-flex-1"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                  >
                    Add
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="nuvi-flex nuvi-flex-wrap nuvi-gap-xs">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="nuvi-badge nuvi-badge-secondary nuvi-badge-removable"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <span className="nuvi-badge-remove">×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <MessageSquare className="h-5 w-5" />
                  <h3 className="nuvi-card-title">Notes</h3>
                </div>
              </div>
              <div className="nuvi-card-content">
                <textarea
                  className="nuvi-input"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add notes about this customer..."
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}