'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { industryTemplates } from '@/lib/industry-templates';
import { Check, Lock } from 'lucide-react';

export function CreateStoreForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    industry: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create store');
      } else {
        // Redirect to the newly created store's dashboard instead of My Stores
        router.push(`/dashboard/stores/${formData.subdomain}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubdomainChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, subdomain: sanitized });
  };

  return (
    <form onSubmit={handleSubmit} className="nuvi-space-y-lg">
      {/* Industry Selection */}
      <div className="nuvi-form-group">
        <label className="nuvi-label">
          Choose Your Industry
        </label>
        <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
          Select an industry template to get started with pre-configured settings
        </p>
        <div className="flex flex-wrap gap-2">
          {industryTemplates.map((industry) => (
            <button
              key={industry.id}
              type="button"
              disabled={!industry.available}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${formData.industry === industry.id 
                  ? 'bg-[var(--nuvi-primary)] text-white' 
                  : industry.available
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
              onClick={() => industry.available && setFormData({ ...formData, industry: industry.id })}
            >
              <span className="text-base">{industry.icon}</span>
              <span>{industry.name}</span>
              {!industry.available && <Lock className="w-3 h-3" />}
              {formData.industry === industry.id && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      <div className="nuvi-form-group">
        <label htmlFor="name" className="nuvi-label">
          Store Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="nuvi-input"
          placeholder="My Awesome Store"
          required
        />
      </div>

      <div className="nuvi-form-group">
        <label htmlFor="subdomain" className="nuvi-label">
          Store URL
        </label>
        <div className="nuvi-flex nuvi-rounded-md">
          <input
            type="text"
            id="subdomain"
            value={formData.subdomain}
            onChange={(e) => handleSubdomainChange(e.target.value)}
            className="nuvi-input nuvi-rounded-r-none"
            placeholder="mystore"
            pattern="[a-z0-9\-]+"
            required
          />
          <span className="nuvi-inline-flex nuvi-items-center nuvi-px-sm nuvi-rounded-r-md nuvi-border nuvi-border-l-0 nuvi-bg-muted nuvi-text-secondary nuvi-text-sm">
            .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}
          </span>
        </div>
        <p className="nuvi-text-sm nuvi-text-secondary nuvi-mt-xs">
          Only lowercase letters, numbers, and hyphens allowed
        </p>
      </div>

      {error && (
        <div className="nuvi-alert nuvi-alert-destructive">
          <p className="nuvi-text-sm">{error}</p>
        </div>
      )}

      <div className="nuvi-flex nuvi-justify-end nuvi-gap-sm">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="nuvi-btn nuvi-btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="nuvi-btn nuvi-btn-primary"
        >
          {loading ? 'Creating...' : 'Create Store'}
        </button>
      </div>
    </form>
  );
}