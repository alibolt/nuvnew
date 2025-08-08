'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Search, User, Package, CreditCard, Truck, Save, X } from 'lucide-react';

interface CreateOrderFormProps {
  storeId: string;
  products: any[];
  customers: any[];
  store: any;
}

export function CreateOrderForm({ storeId, products, customers, store }: CreateOrderFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [orderData, setOrderData] = useState({
    customerId: '',
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    lineItems: [] as any[],
    shippingAddress: {
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      country: 'US'
    },
    billingAddress: {
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      country: 'US'
    },
    useBillingAsSame: true,
    notes: '',
    tags: '',
    discountCode: '',
    discountAmount: 0,
    shippingCost: 0,
    taxRate: 0,
    paymentStatus: 'pending',
    fulfillmentStatus: 'unfulfilled'
  });

  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // Calculate totals
  const subtotal = orderData.lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = orderData.discountAmount;
  const shipping = orderData.shippingCost;
  const tax = subtotal * (orderData.taxRate / 100);
  const total = subtotal - discount + shipping + tax;

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    const primaryAddress = customer.addresses?.[0] || {};
    
    setOrderData({
      ...orderData,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: customer.phone || '',
      shippingAddress: {
        name: `${customer.firstName} ${customer.lastName}`,
        address1: primaryAddress.address1 || '',
        address2: primaryAddress.address2 || '',
        city: primaryAddress.city || '',
        state: primaryAddress.state || '',
        zip: primaryAddress.zip || '',
        country: primaryAddress.country || 'US'
      },
      billingAddress: orderData.useBillingAsSame ? {
        name: `${customer.firstName} ${customer.lastName}`,
        address1: primaryAddress.address1 || '',
        address2: primaryAddress.address2 || '',
        city: primaryAddress.city || '',
        state: primaryAddress.state || '',
        zip: primaryAddress.zip || '',
        country: primaryAddress.country || 'US'
      } : orderData.billingAddress
    });
    setShowCustomerSearch(false);
    setCustomerSearch('');
  };

  // Handle product addition
  const handleAddProduct = (product: any, variant: any) => {
    const existingItemIndex = orderData.lineItems.findIndex(
      item => item.productId === product.id && item.variantId === variant.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...orderData.lineItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderData({ ...orderData, lineItems: updatedItems });
    } else {
      // Add new item
      const newItem = {
        productId: product.id,
        variantId: variant.id,
        title: product.name,
        variantTitle: variant.name !== 'Default' ? variant.name : '',
        sku: variant.sku,
        price: variant.price,
        quantity: 1,
        image: product.images?.[0] || null
      };
      setOrderData({ ...orderData, lineItems: [...orderData.lineItems, newItem] });
    }
    setShowProductSearch(false);
    setProductSearch('');
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item
      const updatedItems = orderData.lineItems.filter((_, i) => i !== index);
      setOrderData({ ...orderData, lineItems: updatedItems });
    } else {
      // Update quantity
      const updatedItems = [...orderData.lineItems];
      updatedItems[index].quantity = newQuantity;
      setOrderData({ ...orderData, lineItems: updatedItems });
    }
  };

  // Handle address sync
  const handleBillingAddressSync = (useSame: boolean) => {
    setOrderData({
      ...orderData,
      useBillingAsSame: useSame,
      billingAddress: useSame ? { ...orderData.shippingAddress } : orderData.billingAddress
    });
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (orderData.lineItems.length === 0) {
      alert('Please add at least one product to the order');
      return;
    }

    if (!orderData.customerEmail || !orderData.customerName) {
      alert('Please fill in customer information');
      return;
    }

    setIsLoading(true);
    try {
      const orderPayload = {
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerId: orderData.customerId || null,
        lineItems: orderData.lineItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          title: item.title,
          variantTitle: item.variantTitle,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.useBillingAsSame ? orderData.shippingAddress : orderData.billingAddress,
        subtotalPrice: subtotal,
        totalDiscount: discount,
        totalShipping: shipping,
        totalTax: tax,
        totalPrice: total,
        currency: store.currency || 'USD',
        financialStatus: orderData.paymentStatus,
        fulfillmentStatus: orderData.fulfillmentStatus,
        note: orderData.notes,
        tags: orderData.tags ? orderData.tags.split(',').map(tag => tag.trim()) : [],
        discountCodes: orderData.discountCode ? [{ code: orderData.discountCode, amount: discount }] : []
      };

      const response = await fetch(`/api/stores/${storeId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/dashboard/stores/${storeId}/orders/${result.order.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to create order: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products and customers
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Customer Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
        </div>
        
        <div className="space-y-4">
          {/* Customer Search */}
          <div className="relative">
            <button
              onClick={() => setShowCustomerSearch(!showCustomerSearch)}
              className="w-full p-3 border border-gray-300 rounded-md text-left flex items-center justify-between"
            >
              <span className={orderData.customerName ? 'text-gray-900' : 'text-gray-500'}>
                {orderData.customerName || 'Select existing customer or enter new customer info'}
              </span>
              <Search className="h-4 w-4 text-gray-400" />
            </button>
            
            {showCustomerSearch && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    autoFocus
                  />
                </div>
                <div className="border-t border-gray-200">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100"
                    >
                      <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCustomerSearch(false)}
                    className="w-full p-3 text-left text-blue-600 hover:bg-blue-50"
                  >
                    + Create new customer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Manual Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={orderData.customerName}
              onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
              placeholder="Customer Name *"
              className="p-3 border border-gray-300 rounded-md"
            />
            <input
              type="email"
              value={orderData.customerEmail}
              onChange={(e) => setOrderData({ ...orderData, customerEmail: e.target.value })}
              placeholder="Customer Email *"
              className="p-3 border border-gray-300 rounded-md"
            />
            <input
              type="tel"
              value={orderData.customerPhone}
              onChange={(e) => setOrderData({ ...orderData, customerPhone: e.target.value })}
              placeholder="Phone Number"
              className="p-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
          </div>
          <button
            onClick={() => setShowProductSearch(!showProductSearch)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Product Search */}
        {showProductSearch && (
          <div className="mb-4 border border-gray-300 rounded-md">
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full p-2 border border-gray-300 rounded-md"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-3 border-b border-gray-100">
                  <div className="font-medium mb-2">{product.name}</div>
                  <div className="space-y-2">
                    {product.variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => handleAddProduct(product, variant)}
                        className="flex items-center justify-between w-full p-2 bg-gray-50 rounded-md hover:bg-gray-100"
                      >
                        <div className="text-left">
                          <div className="text-sm">{variant.name}</div>
                          <div className="text-xs text-gray-500">
                            SKU: {variant.sku} | Stock: {variant.stock}
                          </div>
                        </div>
                        <div className="font-medium">${variant.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-3">
          {orderData.lineItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items added yet. Click "Add Product" to get started.
            </div>
          ) : (
            orderData.lineItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-md">
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  {item.variantTitle && (
                    <div className="text-sm text-gray-500">{item.variantTitle}</div>
                  )}
                  <div className="text-xs text-gray-400">SKU: {item.sku}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                </div>
                <button
                  onClick={() => handleQuantityChange(index, 0)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Shipping & Billing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={orderData.shippingAddress.name}
              onChange={(e) => setOrderData({
                ...orderData,
                shippingAddress: { ...orderData.shippingAddress, name: e.target.value }
              })}
              placeholder="Full Name"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={orderData.shippingAddress.address1}
              onChange={(e) => setOrderData({
                ...orderData,
                shippingAddress: { ...orderData.shippingAddress, address1: e.target.value }
              })}
              placeholder="Address Line 1"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={orderData.shippingAddress.address2}
              onChange={(e) => setOrderData({
                ...orderData,
                shippingAddress: { ...orderData.shippingAddress, address2: e.target.value }
              })}
              placeholder="Address Line 2 (Optional)"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={orderData.shippingAddress.city}
                onChange={(e) => setOrderData({
                  ...orderData,
                  shippingAddress: { ...orderData.shippingAddress, city: e.target.value }
                })}
                placeholder="City"
                className="p-3 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={orderData.shippingAddress.state}
                onChange={(e) => setOrderData({
                  ...orderData,
                  shippingAddress: { ...orderData.shippingAddress, state: e.target.value }
                })}
                placeholder="State"
                className="p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={orderData.shippingAddress.zip}
                onChange={(e) => setOrderData({
                  ...orderData,
                  shippingAddress: { ...orderData.shippingAddress, zip: e.target.value }
                })}
                placeholder="ZIP Code"
                className="p-3 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={orderData.shippingAddress.country}
                onChange={(e) => setOrderData({
                  ...orderData,
                  shippingAddress: { ...orderData.shippingAddress, country: e.target.value }
                })}
                placeholder="Country"
                className="p-3 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          </div>
          
          <div className="space-y-4">
            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={orderData.discountCode}
                  onChange={(e) => setOrderData({ ...orderData, discountCode: e.target.value })}
                  placeholder="Enter discount code"
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="number"
                  value={orderData.discountAmount}
                  onChange={(e) => setOrderData({ ...orderData, discountAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="Amount"
                  className="w-20 p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Shipping */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost</label>
              <input
                type="number"
                value={orderData.shippingCost}
                onChange={(e) => setOrderData({ ...orderData, shippingCost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Tax */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                value={orderData.taxRate}
                onChange={(e) => setOrderData({ ...orderData, taxRate: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={orderData.paymentStatus}
                  onChange={(e) => setOrderData({ ...orderData, paymentStatus: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="authorized">Authorized</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fulfillment Status</label>
                <select
                  value={orderData.fulfillmentStatus}
                  onChange={(e) => setOrderData({ ...orderData, fulfillmentStatus: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="unfulfilled">Unfulfilled</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="partial">Partially Fulfilled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={orderData.notes}
              onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
              rows={3}
              placeholder="Add notes about this order..."
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              value={orderData.tags}
              onChange={(e) => setOrderData({ ...orderData, tags: e.target.value })}
              placeholder="Enter tags separated by commas"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={isLoading || orderData.lineItems.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}