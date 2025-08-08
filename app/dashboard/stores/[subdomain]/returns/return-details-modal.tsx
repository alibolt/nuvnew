'use client';

import { useState } from 'react';
import { 
  X, 
  Package, 
  DollarSign, 
  Calendar, 
  User, 
  MapPin, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Truck,
  Eye
} from 'lucide-react';

interface ReturnDetailsModalProps {
  return: any;
  subdomain: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function ReturnDetailsModal({ return: returnItem, subdomain, onClose, onUpdate }: ReturnDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(returnItem.status);
  const [adminNote, setAdminNote] = useState('');
  const [refundAmount, setRefundAmount] = useState(returnItem.refundAmount || 0);
  const [trackingNumber, setTrackingNumber] = useState(returnItem.trackingNumber || '');

  const handleUpdateReturn = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/returns`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnId: returnItem.id,
          status,
          adminNote,
          refundAmount: parseFloat(refundAmount.toString()),
          trackingNumber
        }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert('Failed to update return');
      }
    } catch (error) {
      console.error('Error updating return:', error);
      alert('Failed to update return');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'received':
        return 'bg-purple-100 text-purple-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'refund':
        return <DollarSign className="h-4 w-4" />;
      case 'exchange':
        return <Package className="h-4 w-4" />;
      case 'store_credit':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Return Details #{returnItem.id.slice(-8)}
            </h2>
            <p className="text-sm text-gray-500">
              Order #{returnItem.orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="received">Received</option>
                    <option value="processed">Processed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Return Type</label>
                <div className="mt-1 flex items-center gap-2">
                  {getTypeIcon(returnItem.returnType)}
                  <span className="text-sm text-gray-900 capitalize">
                    {returnItem.returnType.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                  <Calendar className="h-4 w-4" />
                  {new Date(returnItem.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Customer</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <User className="h-4 w-4" />
                    {returnItem.customerName}
                  </div>
                  <p className="text-sm text-gray-500 ml-6">{returnItem.customerEmail}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Refund Amount</label>
                <div className="mt-1">
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Tracking Number</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Current Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnItem.status)}`}>
                    {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Original Amount</label>
                <div className="mt-1 text-sm text-gray-900">
                  ${returnItem.refundAmount?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Items Count</label>
                <div className="mt-1 text-sm text-gray-900">
                  {returnItem.returnItems?.length || 0} items
                </div>
              </div>
            </div>
          </div>

          {/* Return Items */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Return Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Refund
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {returnItem.returnItems?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.lineItem?.title || 'Unknown Item'}
                        </div>
                        {item.lineItem?.sku && (
                          <div className="text-sm text-gray-500">SKU: {item.lineItem.sku}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {item.reason.replace('_', ' ')}
                        </span>
                        {item.note && (
                          <div className="text-xs text-gray-500 mt-1">{item.note}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        ${item.refundAmount?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Notes and Admin Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Note</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  {returnItem.customerNote || 'No customer note provided.'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Note</h3>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add admin note..."
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status History */}
          {returnItem.statusHistory && returnItem.statusHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
              <div className="space-y-3">
                {returnItem.statusHistory.map((history: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(history.status)}`}>
                          {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(history.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                      )}
                      {history.updatedBy && (
                        <p className="text-xs text-gray-500 mt-1">by {history.updatedBy}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date(returnItem.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateReturn}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Return'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}