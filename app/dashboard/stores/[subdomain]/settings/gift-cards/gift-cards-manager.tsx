'use client';

import { useState, useEffect } from 'react';
import type { Store } from '@prisma/client';
import { 
  Gift, Plus, Search, Filter, Eye, Copy, Download,
  Calendar, DollarSign, Mail, User, Clock, CheckCircle,
  XCircle, AlertCircle, Loader2
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { toast } from 'sonner';

interface GiftCard {
  id: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  status: string;
  issuedAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  transactions?: any[];
}

export function GiftCardsManager({ store }: { store: Store }) {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state for new gift card
  const [formData, setFormData] = useState({
    initialBalance: 50,
    recipientEmail: '',
    recipientName: '',
    senderName: '',
    senderEmail: '',
    message: '',
    expirationDays: 365
  });

  useEffect(() => {
    fetchGiftCards();
  }, [statusFilter]);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/stores/${store.subdomain}/gift-cards?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGiftCards(data.giftCards || []);
      }
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      toast.error('Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/gift-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const newGiftCard = await response.json();
        toast.success('Gift card created successfully');
        setShowCreateModal(false);
        setFormData({
          initialBalance: 50,
          recipientEmail: '',
          recipientName: '',
          senderName: '',
          senderEmail: '',
          message: '',
          expirationDays: 365
        });
        await fetchGiftCards();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create gift card');
      }
    } catch (error) {
      console.error('Error creating gift card:', error);
      toast.error('Failed to create gift card');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'used':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'nuvi-badge-success';
      case 'used':
        return 'nuvi-badge-secondary';
      case 'expired':
        return 'nuvi-badge-error';
      default:
        return 'nuvi-badge-warning';
    }
  };

  return (
    <SettingsPageLayout
      title="Gift Cards"
      description="Manage gift cards for your store"
    >
      <div className="nuvi-space-y-lg">
        {/* Header Actions */}
        <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
          <div className="nuvi-flex nuvi-gap-md nuvi-flex-1">
            <div className="nuvi-relative nuvi-flex-1 nuvi-max-w-md">
              <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
              <input
                type="text"
                placeholder="Search by code, email, or name..."
                className="nuvi-input nuvi-pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchGiftCards()}
              />
            </div>
            <select 
              className="nuvi-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="used">Used</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Create Gift Card
          </button>
        </div>

        {/* Gift Cards List */}
        <div className="nuvi-card">
          <div className="nuvi-card-content">
            {loading ? (
              <div className="nuvi-text-center nuvi-py-xl">
                <Loader2 className="h-8 w-8 nuvi-animate-spin nuvi-mx-auto nuvi-mb-md" />
                <p className="nuvi-text-muted">Loading gift cards...</p>
              </div>
            ) : giftCards.length === 0 ? (
              <div className="nuvi-text-center nuvi-py-xl">
                <Gift className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No gift cards yet</h3>
                <p className="nuvi-text-muted nuvi-mb-lg">Create your first gift card to get started</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="nuvi-btn nuvi-btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Create Gift Card
                </button>
              </div>
            ) : (
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-w-full">
                  <thead>
                    <tr className="nuvi-border-b">
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Code</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Balance</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Recipient</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Status</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Issued</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Expires</th>
                      <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giftCards.map((giftCard) => (
                      <tr key={giftCard.id} className="nuvi-border-b hover:nuvi-bg-gray-50">
                        <td className="nuvi-py-md nuvi-px-md">
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            <code className="nuvi-text-sm nuvi-font-mono">{giftCard.code}</code>
                            <button
                              onClick={() => copyToClipboard(giftCard.code)}
                              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                              title="Copy code"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="nuvi-py-md nuvi-px-md">
                          <div>
                            <p className="nuvi-font-medium">
                              ${giftCard.currentBalance.toFixed(2)}
                            </p>
                            {giftCard.currentBalance < giftCard.initialBalance && (
                              <p className="nuvi-text-xs nuvi-text-muted">
                                of ${giftCard.initialBalance.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="nuvi-py-md nuvi-px-md">
                          {giftCard.recipientEmail ? (
                            <div>
                              <p className="nuvi-text-sm">{giftCard.recipientName || 'Unknown'}</p>
                              <p className="nuvi-text-xs nuvi-text-muted">{giftCard.recipientEmail}</p>
                            </div>
                          ) : (
                            <span className="nuvi-text-muted">-</span>
                          )}
                        </td>
                        <td className="nuvi-py-md nuvi-px-md">
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            {getStatusIcon(giftCard.status)}
                            <span className={`nuvi-badge ${getStatusBadgeClass(giftCard.status)}`}>
                              {giftCard.status}
                            </span>
                          </div>
                        </td>
                        <td className="nuvi-py-md nuvi-px-md">
                          <p className="nuvi-text-sm">
                            {new Date(giftCard.issuedAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="nuvi-py-md nuvi-px-md">
                          {giftCard.expiresAt ? (
                            <p className="nuvi-text-sm">
                              {new Date(giftCard.expiresAt).toLocaleDateString()}
                            </p>
                          ) : (
                            <span className="nuvi-text-muted">Never</span>
                          )}
                        </td>
                        <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create Gift Card Modal */}
        {showCreateModal && (
          <div className="nuvi-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="nuvi-modal" onClick={(e) => e.stopPropagation()}>
              <div className="nuvi-modal-header">
                <h3 className="nuvi-modal-title">Create Gift Card</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateGiftCard}>
                <div className="nuvi-modal-content">
                  <div className="nuvi-space-y-md">
                    {/* Amount */}
                    <div>
                      <label className="nuvi-label nuvi-required">
                        <DollarSign className="h-4 w-4" />
                        Amount
                      </label>
                      <div className="nuvi-input-group">
                        <span className="nuvi-input-addon">$</span>
                        <input
                          type="number"
                          className="nuvi-input"
                          min="1"
                          step="0.01"
                          value={formData.initialBalance}
                          onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    </div>

                    {/* Recipient Info */}
                    <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                      <div>
                        <label className="nuvi-label">
                          <User className="h-4 w-4" />
                          Recipient Name
                        </label>
                        <input
                          type="text"
                          className="nuvi-input"
                          value={formData.recipientName}
                          onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="nuvi-label">
                          <Mail className="h-4 w-4" />
                          Recipient Email
                        </label>
                        <input
                          type="email"
                          className="nuvi-input"
                          value={formData.recipientEmail}
                          onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    {/* Sender Info */}
                    <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                      <div>
                        <label className="nuvi-label">
                          <User className="h-4 w-4" />
                          Sender Name
                        </label>
                        <input
                          type="text"
                          className="nuvi-input"
                          value={formData.senderName}
                          onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div>
                        <label className="nuvi-label">
                          <Mail className="h-4 w-4" />
                          Sender Email
                        </label>
                        <input
                          type="email"
                          className="nuvi-input"
                          value={formData.senderEmail}
                          onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="nuvi-label">
                        <Gift className="h-4 w-4" />
                        Gift Message
                      </label>
                      <textarea
                        className="nuvi-input"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Happy Birthday! Enjoy your gift..."
                        maxLength={500}
                      />
                      <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                        {formData.message.length}/500 characters
                      </p>
                    </div>

                    {/* Expiration */}
                    <div>
                      <label className="nuvi-label">
                        <Calendar className="h-4 w-4" />
                        Expiration (days)
                      </label>
                      <input
                        type="number"
                        className="nuvi-input"
                        min="1"
                        max="3650"
                        value={formData.expirationDays}
                        onChange={(e) => setFormData({ ...formData, expirationDays: parseInt(e.target.value) || 365 })}
                      />
                      <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                        Gift card will expire {formData.expirationDays} days after creation
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="nuvi-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="nuvi-btn nuvi-btn-secondary"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="nuvi-btn nuvi-btn-primary"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 nuvi-animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Gift className="h-4 w-4" />
                        Create Gift Card
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Styles */}
        <style jsx>{`
          .nuvi-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
          }
          
          .nuvi-modal {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          
          .nuvi-modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .nuvi-modal-title {
            font-size: 1.125rem;
            font-weight: 600;
          }
          
          .nuvi-modal-content {
            padding: 1.5rem;
            overflow-y: auto;
            flex: 1;
          }
          
          .nuvi-modal-footer {
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
          }
        `}</style>
      </div>
    </SettingsPageLayout>
  );
}