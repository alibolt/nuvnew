'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Plus, Edit, Trash2, Package, 
  Mail, DollarSign, Clock, Check, X, AlertTriangle
} from 'lucide-react';

interface EmailPlan {
  id: string;
  name: string;
  monthlyLimit: number;
  price: number;
  features: string[];
  pricePerEmail: number;
  isActive: boolean;
}

// Server-side imports removed - authentication should be handled at a higher level
// import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";

function EmailPackageSettingsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<EmailPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<EmailPlan | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    monthlyLimit: 0,
    price: 0,
    features: [''],
    pricePerEmail: 0,
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/email-plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/email-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans })
      });

      if (response.ok) {
        setHasChanges(false);
        alert('Email plans updated successfully');
      } else {
        alert('Failed to update email plans');
      }
    } catch (error) {
      console.error('Error saving plans:', error);
      alert('Error updating email plans');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlan = () => {
    setFormData({
      name: '',
      monthlyLimit: 0,
      price: 0,
      features: [''],
      pricePerEmail: 0,
      isActive: true
    });
    setShowAddForm(true);
  };

  const handleEditPlan = (plan: EmailPlan) => {
    setFormData({
      name: plan.name,
      monthlyLimit: plan.monthlyLimit,
      price: plan.price,
      features: plan.features.length > 0 ? plan.features : [''],
      pricePerEmail: plan.pricePerEmail,
      isActive: plan.isActive
    });
    setEditingPlan(plan);
    setShowAddForm(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPlan: EmailPlan = {
      id: editingPlan?.id || formData.name.toLowerCase().replace(/\s+/g, '-'),
      name: formData.name,
      monthlyLimit: formData.monthlyLimit,
      price: formData.price,
      features: formData.features.filter(f => f.trim() !== ''),
      pricePerEmail: formData.pricePerEmail,
      isActive: formData.isActive
    };

    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? newPlan : p));
    } else {
      setPlans([...plans, newPlan]);
    }

    setHasChanges(true);
    setShowAddForm(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== planId));
      setHasChanges(true);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  if (loading) {
    return (
      <div className="nuvi-container nuvi-py-lg">
        <div className="nuvi-animate-pulse nuvi-space-y-lg">
          <div className="nuvi-h-8 nuvi-bg-muted nuvi-rounded nuvi-w-64"></div>
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-gap-lg">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="nuvi-h-64 nuvi-bg-muted nuvi-rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            onClick={() => router.push('/admin/email-packages')}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="nuvi-text-2xl nuvi-font-bold">Email Package Settings</h1>
            <p className="nuvi-text-secondary">Configure email plans and pricing</p>
          </div>
        </div>
        
        <div className="nuvi-flex nuvi-gap-md">
          <button
            onClick={handleAddPlan}
            className="nuvi-btn nuvi-btn-secondary"
          >
            <Plus className="h-4 w-4" />
            Add Plan
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="nuvi-btn nuvi-btn-primary"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="nuvi-alert nuvi-alert-warning nuvi-mb-lg">
          <AlertTriangle className="h-4 w-4" />
          <span>You have unsaved changes. Don't forget to save your changes.</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {plans.map((plan) => (
          <div key={plan.id} className={`nuvi-card nuvi-relative ${!plan.isActive ? 'nuvi-opacity-60' : ''}`}>
            <div className="nuvi-card-header">
              <div className="nuvi-flex nuvi-justify-between nuvi-items-start">
                <div>
                  <h3 className="nuvi-card-title">{plan.name}</h3>
                  <p className="nuvi-text-sm nuvi-text-secondary">
                    {plan.monthlyLimit === -1 ? 'Unlimited emails' : `${plan.monthlyLimit.toLocaleString()} emails/month`}
                  </p>
                </div>
                <div className="nuvi-flex nuvi-gap-xs">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="nuvi-card-content">
              <div className="nuvi-mb-md">
                <div className="nuvi-flex nuvi-items-baseline nuvi-gap-xs">
                  <span className="nuvi-text-2xl nuvi-font-bold">
                    ${plan.price}
                  </span>
                  <span className="nuvi-text-sm nuvi-text-secondary">/month</span>
                </div>
                {plan.pricePerEmail > 0 && (
                  <p className="nuvi-text-xs nuvi-text-secondary">
                    ${plan.pricePerEmail} per additional email
                  </p>
                )}
              </div>

              <div className="nuvi-space-y-xs">
                {plan.features.map((feature, index) => (
                  <div key={index} className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                    <Check className="h-3 w-3 nuvi-text-success nuvi-flex-shrink-0" />
                    <span className="nuvi-text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="nuvi-mt-md nuvi-pt-md nuvi-border-t nuvi-border-border">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                  <div className={`nuvi-w-2 nuvi-h-2 nuvi-rounded-full ${
                    plan.isActive ? 'nuvi-bg-green-500' : 'nuvi-bg-red-500'
                  }`}></div>
                  <span className="nuvi-text-sm nuvi-text-secondary">
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Plan Modal */}
      {showAddForm && (
        <div className="nuvi-fixed nuvi-inset-0 nuvi-bg-black/50 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-z-50">
          <div className="nuvi-bg-white nuvi-rounded-lg nuvi-p-lg nuvi-max-w-md nuvi-w-full nuvi-max-h-[90vh] nuvi-overflow-y-auto">
            <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-md">
              <h3 className="nuvi-text-lg nuvi-font-bold">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPlan(null);
                }}
                className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="nuvi-input"
                  required
                />
              </div>

              <div>
                <label className="nuvi-label">Monthly Email Limit</label>
                <input
                  type="number"
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({ ...formData, monthlyLimit: parseInt(e.target.value) || 0 })}
                  className="nuvi-input"
                  min="0"
                  placeholder="Enter -1 for unlimited"
                  required
                />
                <p className="nuvi-text-xs nuvi-text-secondary nuvi-mt-xs">
                  Enter -1 for unlimited emails
                </p>
              </div>

              <div>
                <label className="nuvi-label">Monthly Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="nuvi-input"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="nuvi-label">Price per Additional Email ($)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.pricePerEmail}
                  onChange={(e) => setFormData({ ...formData, pricePerEmail: parseFloat(e.target.value) || 0 })}
                  className="nuvi-input"
                  min="0"
                />
              </div>

              <div>
                <label className="nuvi-label">Features</label>
                <div className="nuvi-space-y-xs">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="nuvi-flex nuvi-gap-xs">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="nuvi-input nuvi-flex-1"
                        placeholder="Enter feature"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-error"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Feature
                  </button>
                </div>
              </div>

              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <label className="nuvi-label nuvi-mb-0">Active</label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="nuvi-checkbox"
                />
              </div>

              <div className="nuvi-flex nuvi-gap-md nuvi-pt-md">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPlan(null);
                  }}
                  className="nuvi-btn nuvi-btn-secondary nuvi-flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="nuvi-btn nuvi-btn-primary nuvi-flex-1"
                >
                  {editingPlan ? 'Update Plan' : 'Add Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailPackageSettings() {
  // Note: Authentication should be handled at a higher level or through middleware
  // For now, we'll render the content directly
  return <EmailPackageSettingsContent />;
}