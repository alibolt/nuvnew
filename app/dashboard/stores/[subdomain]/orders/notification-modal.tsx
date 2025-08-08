'use client';

import { useState } from 'react';
import { X, Mail, Send, Clock } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  subdomain: string;
}

export function NotificationModal({ isOpen, onClose, order, subdomain }: NotificationModalProps) {
  const [formData, setFormData] = useState({
    type: 'order_confirmation',
    recipient: order?.customerEmail || '',
    customMessage: '',
    includeOrderDetails: true,
    includeShippingInfo: false,
    includeTrackingInfo: false,
    trackingNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const notificationTypes = [
    { value: 'order_confirmation', label: 'Order Confirmation' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'order_shipped', label: 'Order Shipped' },
    { value: 'order_delivered', label: 'Order Delivered' },
    { value: 'order_cancelled', label: 'Order Cancelled' },
    { value: 'custom', label: 'Custom Message' }
  ];

  const handleSendNotification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/orders/${order.id}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Notification sent successfully!');
        loadNotificationHistory();
      } else {
        const error = await response.json();
        alert(`Failed to send notification: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/orders/${order.id}/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Send Notification</h2>
              <p className="text-sm text-gray-500">Order #{order?.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {!showHistory ? (
            <div className="space-y-6">
              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[var(--nuvi-border)] rounded text-xs font-medium bg-[var(--nuvi-surface)] text-[var(--nuvi-text-primary)] focus:border-[var(--nuvi-primary)] focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[var(--nuvi-border)] rounded text-xs font-medium bg-[var(--nuvi-surface)] text-[var(--nuvi-text-primary)] focus:border-[var(--nuvi-primary)] focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
              </div>

              {/* Custom Message */}
              {formData.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message
                  </label>
                  <textarea
                    value={formData.customMessage}
                    onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-1.5 border border-[var(--nuvi-border)] rounded text-xs font-medium bg-[var(--nuvi-surface)] text-[var(--nuvi-text-primary)] focus:border-[var(--nuvi-primary)] focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your custom message..."
                  />
                </div>
              )}

              {/* Tracking Number */}
              {(formData.type === 'order_shipped' || formData.includeTrackingInfo) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[var(--nuvi-border)] rounded text-xs font-medium bg-[var(--nuvi-surface)] text-[var(--nuvi-text-primary)] focus:border-[var(--nuvi-primary)] focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tracking number"
                  />
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Include in Email:</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.includeOrderDetails}
                      onChange={(e) => setFormData({ ...formData, includeOrderDetails: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Order details and items</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.includeShippingInfo}
                      onChange={(e) => setFormData({ ...formData, includeShippingInfo: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Shipping information</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.includeTrackingInfo}
                      onChange={(e) => setFormData({ ...formData, includeTrackingInfo: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Tracking information</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Email Preview:</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>To:</strong> {formData.recipient}</p>
                  <p><strong>Subject:</strong> {
                    formData.type === 'order_confirmation' ? `Order Confirmation #${order?.orderNumber}` :
                    formData.type === 'payment_received' ? `Payment Received for Order #${order?.orderNumber}` :
                    formData.type === 'order_shipped' ? `Your Order #${order?.orderNumber} Has Shipped` :
                    formData.type === 'order_delivered' ? `Your Order #${order?.orderNumber} Has Been Delivered` :
                    formData.type === 'order_cancelled' ? `Order #${order?.orderNumber} Has Been Cancelled` :
                    `Update on Your Order #${order?.orderNumber}`
                  }</p>
                  {formData.customMessage && (
                    <p><strong>Message:</strong> {formData.customMessage}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Notification History</h3>
                <button
                  onClick={() => loadNotificationHistory()}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Refresh
                </button>
              </div>
              
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification: any, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{notification.subject}</p>
                          <p className="text-sm text-gray-600">To: {notification.recipient}</p>
                          <p className="text-sm text-gray-500">
                            Sent {new Date(notification.sentAt).toLocaleString()}
                            {notification.sentBy && ` by ${notification.sentBy}`}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full
                          ${notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                            notification.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {notification.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) loadNotificationHistory();
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <Clock className="h-4 w-4" />
            {showHistory ? 'Back to Send' : 'View History'}
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium border border-[var(--nuvi-border)] bg-[var(--nuvi-surface)] hover:bg-[var(--nuvi-muted)] text-[var(--nuvi-text-secondary)] hover:text-[var(--nuvi-text-primary)] rounded transition-all"
            >
              Close
            </button>
            {!showHistory && (
              <button
                onClick={handleSendNotification}
                disabled={isLoading || !formData.recipient}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                {isLoading ? 'Sending...' : 'Send Notification'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}