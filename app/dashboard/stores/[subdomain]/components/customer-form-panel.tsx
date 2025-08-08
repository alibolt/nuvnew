'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
}

interface CustomerFormPanelProps {
  store: StoreData;
  customerId?: string;
  isEdit?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function CustomerFormPanel({ 
  store, 
  customerId, 
  isEdit = false, 
  onSave, 
  onCancel 
}: CustomerFormPanelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive' | 'banned'>('active');
  
  // Address fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('US');
  
  // Load customer data if editing
  useEffect(() => {
    if (isEdit && customerId) {
      loadCustomer();
    }
  }, [isEdit, customerId]);

  const loadCustomer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setEmail(data.email || '');
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhone(data.phone || '');
        setAcceptsMarketing(data.acceptsMarketing || false);
        setStatus(data.status || 'active');
        // Load address if available
        if (data.addresses && data.addresses.length > 0) {
          const primaryAddress = data.addresses[0];
          setAddress(primaryAddress.address || '');
          setCity(primaryAddress.city || '');
          setState(primaryAddress.state || '');
          setZip(primaryAddress.zip || '');
          setCountry(primaryAddress.country || 'US');
        }
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setIsSaving(true);
    
    try {
      const payload = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        acceptsMarketing,
        status,
        // Include address if provided
        ...(address.trim() && {
          addresses: [{
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            zip: zip.trim(),
            country,
            isDefault: true
          }]
        })
      };

      const url = isEdit 
        ? `/api/stores/${store.subdomain}/customers/${customerId}`
        : `/api/stores/${store.subdomain}/customers`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.text();
        alert(`Failed to save customer: ${error}`);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-h-96">
        <div className="nuvi-loading-spinner nuvi-loading-lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            type="button"
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">
              {isEdit ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <p className="nuvi-text-secondary nuvi-text-sm">
              {isEdit ? 'Update customer information' : 'Add a new customer to your store'}
            </p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button
            type="button"
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {/* Main Content */}
        <div className="nuvi-lg:col-span-2 nuvi-space-y-lg">
          {/* Customer Information */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Customer Information</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                <div>
                  <label className="nuvi-label">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="nuvi-input"
                  />
                </div>
                
                <div>
                  <label className="nuvi-label">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="nuvi-input"
                  />
                </div>
              </div>

              <div>
                <label className="nuvi-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="nuvi-input"
                  required
                />
              </div>

              <div>
                <label className="nuvi-label">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="nuvi-input"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Address</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="nuvi-input"
                />
              </div>

              <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                <div>
                  <label className="nuvi-label">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="nuvi-input"
                  />
                </div>
                
                <div>
                  <label className="nuvi-label">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NY"
                    className="nuvi-input"
                  />
                </div>
                
                <div>
                  <label className="nuvi-label">ZIP Code</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="10001"
                    className="nuvi-input"
                  />
                </div>
              </div>

              <div>
                <label className="nuvi-label">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="nuvi-select"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="nuvi-space-y-lg">
          {/* Customer Status */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Customer Status</h3>
            </div>
            <div className="nuvi-card-content">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="nuvi-select nuvi-w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
              <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                Customer status affects their ability to log in and place orders
              </p>
            </div>
          </div>

          {/* Marketing */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Email Marketing</h3>
            </div>
            <div className="nuvi-card-content">
              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  checked={acceptsMarketing}
                  onChange={(e) => setAcceptsMarketing(e.target.checked)}
                  className="nuvi-checkbox"
                />
                <span>Customer accepts marketing emails</span>
              </label>
              <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                Customer agreed to receive marketing emails
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Customer Tags</h3>
            </div>
            <div className="nuvi-card-content">
              <p className="nuvi-text-sm nuvi-text-muted">
                Tags help you organize and filter customers
              </p>
              <div className="nuvi-mt-sm">
                <input
                  type="text"
                  placeholder="VIP, Wholesale, etc."
                  className="nuvi-input"
                  disabled
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  Tags feature coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}