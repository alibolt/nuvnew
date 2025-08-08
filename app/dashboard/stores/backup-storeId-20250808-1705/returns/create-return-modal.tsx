'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Plus, 
  Minus, 
  DollarSign, 
  RefreshCw, 
  CreditCard 
} from 'lucide-react';

interface CreateReturnModalProps {
  storeId: string;
  recentOrders: any[];
  onClose: () => void;
  onCreate: () => void;
}

interface ReturnItem {
  lineItemId: string;
  quantity: number;
  reason: string;
  condition: string;
  note?: string;
}

export function CreateReturnModal({ storeId, recentOrders, onClose, onCreate }: CreateReturnModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [returnType, setReturnType] = useState<'refund' | 'exchange' | 'store_credit'>('refund');
  const [returnReason, setReturnReason] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [refundShipping, setRefundShipping] = useState(false);
  const [restockItems, setRestockItems] = useState(true);

  const reasons = [
    { value: 'defective', label: 'Defective/Damaged' },
    { value: 'wrong_item', label: 'Wrong Item Sent' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'changed_mind', label: 'Changed Mind' },
    { value: 'damaged_shipping', label: 'Damaged in Shipping' },
    { value: 'other', label: 'Other' }
  ];

  const conditions = [
    { value: 'new', label: 'New/Unused' },
    { value: 'used', label: 'Used' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'defective', label: 'Defective' }
  ];

  // Filter orders based on search
  const filteredOrders = recentOrders.filter(order => {
    const searchTerm = orderSearch.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(searchTerm) ||
      order.customer?.email?.toLowerCase().includes(searchTerm) ||
      `${order.customer?.firstName} ${order.customer?.lastName}`.toLowerCase().includes(searchTerm)
    );
  });

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    setReturnItems([]);
  };

  const handleAddReturnItem = (lineItem: any) => {
    const existingItem = returnItems.find(item => item.lineItemId === lineItem.id);
    if (existingItem) {
      // Increase quantity if not exceeding order quantity
      if (existingItem.quantity < lineItem.quantity) {
        setReturnItems(returnItems.map(item => 
          item.lineItemId === lineItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      // Add new return item
      setReturnItems([...returnItems, {
        lineItemId: lineItem.id,
        quantity: 1,
        reason: 'defective',
        condition: 'used',
        note: ''
      }]);
    }
  };

  const handleRemoveReturnItem = (lineItemId: string) => {
    setReturnItems(returnItems.filter(item => item.lineItemId !== lineItemId));
  };

  const handleUpdateReturnItem = (lineItemId: string, updates: Partial<ReturnItem>) => {
    setReturnItems(returnItems.map(item => 
      item.lineItemId === lineItemId 
        ? { ...item, ...updates }
        : item
    ));
  };

  const calculateRefundAmount = () => {
    if (!selectedOrder) return 0;
    
    let total = 0;
    returnItems.forEach(returnItem => {
      const lineItem = selectedOrder.lineItems.find((li: any) => li.id === returnItem.lineItemId);
      if (lineItem) {
        total += lineItem.price * returnItem.quantity;
      }
    });

    if (refundShipping) {
      total += selectedOrder.totalShipping || 0;
    }

    return total;
  };

  const handleCreateReturn = async () => {
    if (!selectedOrder || returnItems.length === 0) {
      alert('Please select an order and add return items');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`/api/stores/${storeId}/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          returnItems,
          returnReason,
          customerNote,
          returnType,
          restockItems,
          refundShipping,
          refundAmount: calculateRefundAmount()
        }),
      });

      if (response.ok) {
        onCreate();
      } else {
        const error = await response.json();
        alert(`Failed to create return: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating return:', error);
      alert('Failed to create return');
    } finally {
      setIsCreating(false);
    }
  };

  const getReturnTypeIcon = (type: string) => {
    switch (type) {
      case 'refund':
        return <DollarSign className="h-4 w-4" />;
      case 'exchange':
        return <RefreshCw className="h-4 w-4" />;
      case 'store_credit':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Return</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!selectedOrder ? (
            /* Order Selection */
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Order</h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order number, customer name, or email..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                />
              </div>

              {/* Orders List */}
              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {orderSearch ? 'No orders found matching your search.' : 'No recent orders available.'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => handleOrderSelect(order)}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">
                              {order.customer?.firstName} {order.customer?.lastName} ({order.customer?.email})
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.lineItems?.length || 0} items • ${order.totalPrice?.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Return Creation Form */
            <div className="space-y-6">
              {/* Selected Order Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Order #{selectedOrder.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName} ({selectedOrder.customer?.email})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Change Order
                  </button>
                </div>
              </div>

              {/* Return Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Return Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'refund', label: 'Refund', icon: 'refund' },
                    { value: 'exchange', label: 'Exchange', icon: 'exchange' },
                    { value: 'store_credit', label: 'Store Credit', icon: 'store_credit' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setReturnType(type.value as any)}
                      className={`p-3 border rounded-lg flex items-center gap-2 ${
                        returnType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {getReturnTypeIcon(type.icon)}
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Items to Return</h3>
                <div className="border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ordered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Return Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.lineItems?.map((lineItem: any) => {
                        const returnItem = returnItems.find(item => item.lineItemId === lineItem.id);
                        return (
                          <tr key={lineItem.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {lineItem.product?.images?.[0] && (
                                  <img
                                    src={lineItem.product.images[0]}
                                    alt=""
                                    className="h-10 w-10 rounded object-cover mr-3"
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {lineItem.product?.name || lineItem.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ${lineItem.price?.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lineItem.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {returnItem ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (returnItem.quantity > 1) {
                                        handleUpdateReturnItem(lineItem.id, { quantity: returnItem.quantity - 1 });
                                      } else {
                                        handleRemoveReturnItem(lineItem.id);
                                      }
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-8 text-center text-sm">{returnItem.quantity}</span>
                                  <button
                                    onClick={() => {
                                      if (returnItem.quantity < lineItem.quantity) {
                                        handleUpdateReturnItem(lineItem.id, { quantity: returnItem.quantity + 1 });
                                      }
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                    disabled={returnItem.quantity >= lineItem.quantity}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">0</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {returnItem ? (
                                <button
                                  onClick={() => handleRemoveReturnItem(lineItem.id)}
                                  className="text-red-600 hover:text-red-900 text-sm"
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAddReturnItem(lineItem)}
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  Add to Return
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Return Item Details */}
              {returnItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Return Details</h3>
                  <div className="space-y-4">
                    {returnItems.map((returnItem) => {
                      const lineItem = selectedOrder.lineItems.find((li: any) => li.id === returnItem.lineItemId);
                      return (
                        <div key={returnItem.lineItemId} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">
                            {lineItem?.product?.name || lineItem?.title} (Qty: {returnItem.quantity})
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Reason</label>
                              <select
                                value={returnItem.reason}
                                onChange={(e) => handleUpdateReturnItem(returnItem.lineItemId, { reason: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                {reasons.map((reason) => (
                                  <option key={reason.value} value={reason.value}>
                                    {reason.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Condition</label>
                              <select
                                value={returnItem.condition}
                                onChange={(e) => handleUpdateReturnItem(returnItem.lineItemId, { condition: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                {conditions.map((condition) => (
                                  <option key={condition.value} value={condition.value}>
                                    {condition.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="text-sm font-medium text-gray-700">Note (Optional)</label>
                            <input
                              type="text"
                              value={returnItem.note || ''}
                              onChange={(e) => handleUpdateReturnItem(returnItem.lineItemId, { note: e.target.value })}
                              placeholder="Additional details about this item..."
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Additional Options */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Return Reason</label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Overall reason for this return..."
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer Note</label>
                  <textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Customer's message or additional details..."
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={refundShipping}
                    onChange={(e) => setRefundShipping(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Refund shipping cost</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={restockItems}
                    onChange={(e) => setRestockItems(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Restock returned items</span>
                </label>
              </div>

              {/* Refund Summary */}
              {returnItems.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Refund Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span>${(calculateRefundAmount() - (refundShipping ? selectedOrder.totalShipping || 0 : 0)).toFixed(2)}</span>
                    </div>
                    {refundShipping && (
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${(selectedOrder.totalShipping || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-lg border-t pt-1">
                      <span>Total Refund:</span>
                      <span>${calculateRefundAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          {selectedOrder && returnItems.length > 0 && (
            <button
              onClick={handleCreateReturn}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Return'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}