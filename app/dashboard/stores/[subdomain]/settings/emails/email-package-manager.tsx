'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, Check, X, Crown, Zap, Rocket, Building2, 
  AlertCircle, TrendingUp, Clock, Shield
} from 'lucide-react';

interface EmailPackage {
  planId: string;
  planName: string;
  isActive: boolean;
  expiresAt?: string;
  billingCycle: string;
}

interface EmailUsage {
  currentUsage: number;
  monthlyLimit: number;
  remainingEmails: number;
  resetDate: string;
}

interface EmailPlan {
  id: string;
  name: string;
  monthlyLimit: number;
  price: number;
  features: string[];
  pricePerEmail: number;
}

export function EmailPackageManager({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [currentPackage, setCurrentPackage] = useState<EmailPackage | null>(null);
  const [usage, setUsage] = useState<EmailUsage | null>(null);
  const [availablePlans, setAvailablePlans] = useState<EmailPlan[]>([]);

  useEffect(() => {
    fetchEmailPackageInfo();
  }, [subdomain]);

  const fetchEmailPackageInfo = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/email/package`);
      if (response.ok) {
        const data = await response.json();
        setCurrentPackage(data.currentPackage);
        setUsage(data.usage);
        setAvailablePlans(data.availablePlans);
      }
    } catch (error) {
      console.error('Error fetching email package info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string, billingCycle: 'monthly' | 'annually' = 'monthly') => {
    setUpgrading(planId);
    
    try {
      const response = await fetch(`/api/stores/${subdomain}/email/package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
      });

      if (response.ok) {
        await fetchEmailPackageInfo();
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to upgrade email package');
      }
    } catch (error) {
      console.error('Error upgrading package:', error);
      alert('An error occurred while upgrading');
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your email package? This will revert you to the free plan.')) {
      return;
    }

    try {
      const response = await fetch(`/api/stores/${subdomain}/email/package`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEmailPackageInfo();
        router.refresh();
      } else {
        alert('Failed to cancel email package');
      }
    } catch (error) {
      console.error('Error cancelling package:', error);
      alert('An error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUsagePercentage = () => {
    if (!usage || usage.monthlyLimit === -1) return 0;
    return Math.min((usage.currentUsage / usage.monthlyLimit) * 100, 100);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return Mail;
      case 'starter': return Zap;
      case 'professional': return Rocket;
      case 'enterprise': return Building2;
      default: return Mail;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'nuvi-text-gray-600';
      case 'starter': return 'nuvi-text-blue-600';
      case 'professional': return 'nuvi-text-purple-600';
      case 'enterprise': return 'nuvi-text-amber-600';
      default: return 'nuvi-text-gray-600';
    }
  };

  const getPlanBorder = (planId: string) => {
    switch (planId) {
      case 'free': return 'nuvi-border-gray-200';
      case 'starter': return 'nuvi-border-blue-200';
      case 'professional': return 'nuvi-border-purple-200';
      case 'enterprise': return 'nuvi-border-amber-200';
      default: return 'nuvi-border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="nuvi-animate-pulse nuvi-space-y-lg">
        <div className="nuvi-h-32 nuvi-bg-muted nuvi-rounded-lg"></div>
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-lg">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="nuvi-h-64 nuvi-bg-muted nuvi-rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="nuvi-space-y-lg">
      {/* Current Package & Usage */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Current Email Package</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-2 nuvi-gap-lg">
            {/* Package Info */}
            <div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-md">
                {currentPackage && (() => {
                  const Icon = getPlanIcon(currentPackage.planId);
                  return <Icon className={`h-6 w-6 ${getPlanColor(currentPackage.planId)}`} />;
                })()}
                <div>
                  <h4 className="nuvi-font-medium">{currentPackage?.planName}</h4>
                  <p className="nuvi-text-sm nuvi-text-secondary">
                    {currentPackage?.isActive ? 'Active' : 'Inactive'} • 
                    {currentPackage?.billingCycle === 'monthly' ? ' Monthly billing' : ' Annual billing'}
                  </p>
                </div>
              </div>

              {currentPackage?.expiresAt && (
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-text-sm">
                  <Clock className="h-4 w-4 nuvi-text-muted" />
                  <span>Expires {formatDate(currentPackage.expiresAt)}</span>
                </div>
              )}

              {currentPackage?.planId !== 'free' && (
                <button
                  onClick={handleCancel}
                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-text-error nuvi-mt-md"
                >
                  Cancel Subscription
                </button>
              )}
            </div>

            {/* Usage Stats */}
            <div>
              <h4 className="nuvi-font-medium nuvi-mb-md">This Month's Usage</h4>
              <div className="nuvi-space-y-md">
                <div>
                  <div className="nuvi-flex nuvi-justify-between nuvi-text-sm nuvi-mb-xs">
                    <span>Emails Sent</span>
                    <span>
                      {usage?.currentUsage || 0}
                      {usage?.monthlyLimit !== -1 && ` / ${usage?.monthlyLimit}`}
                    </span>
                  </div>
                  {usage?.monthlyLimit !== -1 && (
                    <div className="nuvi-w-full nuvi-bg-gray-200 nuvi-rounded-full nuvi-h-2">
                      <div 
                        className="nuvi-bg-primary nuvi-h-2 nuvi-rounded-full"
                        style={{ width: `${getUsagePercentage()}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md nuvi-text-sm">
                  <div>
                    <p className="nuvi-text-secondary">Remaining</p>
                    <p className="nuvi-font-medium">
                      {usage?.remainingEmails === -1 ? 'Unlimited' : usage?.remainingEmails}
                    </p>
                  </div>
                  <div>
                    <p className="nuvi-text-secondary">Resets</p>
                    <p className="nuvi-font-medium">
                      {usage?.resetDate && formatDate(usage.resetDate)}
                    </p>
                  </div>
                </div>

                {usage && usage.remainingEmails !== -1 && usage.remainingEmails < 10 && (
                  <div className="nuvi-alert nuvi-alert-warning">
                    <AlertCircle className="h-4 w-4" />
                    <span>You're running low on emails. Consider upgrading your plan.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Email Plans</h3>
          <p className="nuvi-text-sm nuvi-text-secondary">
            Powered by Resend - Premium email delivery service
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-lg">
            {availablePlans.map((plan) => {
              const Icon = getPlanIcon(plan.id);
              const isCurrentPlan = currentPackage?.planId === plan.id;
              const isPopular = plan.id === 'starter';
              
              return (
                <div 
                  key={plan.id} 
                  className={`nuvi-relative nuvi-p-6 nuvi-border nuvi-rounded-lg nuvi-transition ${
                    isCurrentPlan 
                      ? `${getPlanBorder(plan.id)} nuvi-bg-primary/5` 
                      : 'nuvi-border-border hover:nuvi-border-primary'
                  }`}
                >
                  {isPopular && (
                    <div className="nuvi-absolute nuvi-top-0 nuvi-left-1/2 nuvi-transform -nuvi-translate-x-1/2 -nuvi-translate-y-1/2">
                      <span className="nuvi-bg-primary nuvi-text-white nuvi-px-sm nuvi-py-xs nuvi-text-xs nuvi-rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="nuvi-text-center">
                    <Icon className={`h-8 w-8 nuvi-mx-auto nuvi-mb-md ${getPlanColor(plan.id)}`} />
                    <h4 className="nuvi-font-medium nuvi-mb-sm">{plan.name}</h4>
                    
                    <div className="nuvi-mb-md">
                      <span className="nuvi-text-2xl nuvi-font-bold">
                        ${plan.price}
                      </span>
                      <span className="nuvi-text-sm nuvi-text-secondary">/month</span>
                    </div>

                    <div className="nuvi-mb-md">
                      <p className="nuvi-text-sm nuvi-text-secondary">
                        {plan.monthlyLimit === -1 ? 'Unlimited emails' : `${plan.monthlyLimit.toLocaleString()} emails/month`}
                      </p>
                      {plan.pricePerEmail > 0 && (
                        <p className="nuvi-text-xs nuvi-text-secondary">
                          ${plan.pricePerEmail} per additional email
                        </p>
                      )}
                    </div>

                    <ul className="nuvi-space-y-xs nuvi-text-sm nuvi-text-left nuvi-mb-md">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                          <Check className="h-3 w-3 nuvi-text-success nuvi-flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <div className="nuvi-btn nuvi-btn-sm nuvi-w-full nuvi-bg-gray-100 nuvi-text-gray-600 nuvi-cursor-not-allowed">
                        <Check className="h-4 w-4" />
                        Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgrading === plan.id}
                        className={`nuvi-btn nuvi-btn-sm nuvi-w-full ${
                          plan.id === 'free' 
                            ? 'nuvi-btn-secondary' 
                            : 'nuvi-btn-primary'
                        }`}
                      >
                        {upgrading === plan.id ? (
                          'Upgrading...'
                        ) : plan.id === 'free' ? (
                          'Downgrade'
                        ) : currentPackage?.planId === 'free' ? (
                          'Upgrade'
                        ) : (
                          'Switch Plan'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="nuvi-mt-lg nuvi-p-md nuvi-bg-blue-50 nuvi-rounded-lg nuvi-border nuvi-border-blue-200">
            <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
              <Shield className="h-5 w-5 nuvi-text-blue-600 nuvi-mt-xs" />
              <div>
                <h4 className="nuvi-font-medium nuvi-text-blue-900 nuvi-mb-xs">
                  Premium Email Delivery by Resend
                </h4>
                <p className="nuvi-text-sm nuvi-text-blue-700">
                  All our email plans are powered by Resend, ensuring 99.9% delivery rates, 
                  advanced analytics, and enterprise-grade security for your customer communications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}