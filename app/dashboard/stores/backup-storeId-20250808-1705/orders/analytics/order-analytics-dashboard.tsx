'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface OrderAnalyticsDashboardProps {
  currentPeriodOrders: any[];
  previousPeriodOrders: any[];
  allTimeOrders: any[];
  storeId: string;
}

export function OrderAnalyticsDashboard({
  currentPeriodOrders,
  previousPeriodOrders,
  allTimeOrders,
  storeId
}: OrderAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30d');

  // Calculate current period metrics
  const currentRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const currentOrderCount = currentPeriodOrders.length;
  const currentAOV = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
  const currentCustomers = new Set(currentPeriodOrders.map(order => order.customerId).filter(Boolean)).size;

  // Calculate previous period metrics
  const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const previousOrderCount = previousPeriodOrders.length;
  const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
  const previousCustomers = new Set(previousPeriodOrders.map(order => order.customerId).filter(Boolean)).size;

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = calculateChange(currentRevenue, previousRevenue);
  const orderChange = calculateChange(currentOrderCount, previousOrderCount);
  const aovChange = calculateChange(currentAOV, previousAOV);
  const customerChange = calculateChange(currentCustomers, previousCustomers);

  // Process daily data for charts
  const getDailyData = () => {
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayOrders = currentPeriodOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate < dayEnd;
      });

      const revenue = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      
      dailyData.push({
        date: dayStart.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: revenue,
        customers: new Set(dayOrders.map(o => o.customerId).filter(Boolean)).size
      });
    }
    return dailyData;
  };

  const dailyData = getDailyData();

  // Top products analysis
  const getTopProducts = () => {
    const productSales = {};
    
    currentPeriodOrders.forEach(order => {
      order.lineItems.forEach((item: any) => {
        const productId = item.productId;
        const productName = item.product?.name || item.title;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            name: productName,
            quantity: 0,
            revenue: 0,
            orders: new Set()
          };
        }
        
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.totalPrice;
        productSales[productId].orders.add(order.id);
      });
    });

    return Object.values(productSales)
      .map((product: any) => ({
        ...product,
        orderCount: product.orders.size
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const topProducts = getTopProducts();

  // Order status breakdown
  const getOrderStatusBreakdown = () => {
    const statusCounts = {};
    currentPeriodOrders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    return statusCounts;
  };

  const orderStatusBreakdown = getOrderStatusBreakdown();

  // Customer insights
  const getCustomerInsights = () => {
    const customerData = {};
    
    currentPeriodOrders.forEach(order => {
      const customerId = order.customerId || 'guest';
      const customerName = order.customer 
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : order.customerName;
      
      if (!customerData[customerId]) {
        customerData[customerId] = {
          name: customerName,
          email: order.customer?.email || order.customerEmail,
          orders: 0,
          revenue: 0,
          isGuest: !order.customerId
        };
      }
      
      customerData[customerId].orders += 1;
      customerData[customerId].revenue += order.totalPrice;
    });

    return Object.values(customerData)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const topCustomers = getCustomerInsights();

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number',
    prefix = ''
  }: {
    title: string;
    value: number;
    change: number;
    icon: any;
    format?: 'number' | 'currency' | 'percentage';
    prefix?: string;
  }) => {
    const formatValue = (val: number) => {
      if (format === 'currency') return `$${val.toFixed(2)}`;
      if (format === 'percentage') return `${val.toFixed(1)}%`;
      return val.toLocaleString();
    };

    const isPositive = change >= 0;

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {prefix}{formatValue(value)}
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-600 ml-1">vs last period</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Comparing to previous {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={currentRevenue}
          change={revenueChange}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Orders"
          value={currentOrderCount}
          change={orderChange}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Average Order Value"
          value={currentAOV}
          change={aovChange}
          icon={TrendingUp}
          format="currency"
        />
        <MetricCard
          title="Customers"
          value={currentCustomers}
          change={customerChange}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end space-x-1">
            {dailyData.map((day, index) => {
              const maxRevenue = Math.max(...dailyData.map(d => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${day.date}: $${day.revenue.toFixed(2)}`}
                  />
                  <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            {Object.entries(orderStatusBreakdown).map(([status, count]) => {
              const percentage = (count as number / currentOrderCount) * 100;
              const statusColors = {
                pending: 'bg-yellow-500',
                processing: 'bg-blue-500',
                completed: 'bg-green-500',
                cancelled: 'bg-red-500',
                open: 'bg-gray-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                    />
                    <span className="text-sm text-gray-700 capitalize">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{product.orderCount} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-4">
            {topCustomers.map((customer: any, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {customer.name}
                      {customer.isGuest && <span className="text-xs text-gray-500 ml-1">(Guest)</span>}
                    </p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${customer.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{customer.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPeriodOrders.slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.orderNumber.split('_').pop()?.substring(0, 7)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer 
                      ? `${order.customer.firstName} ${order.customer.lastName}`
                      : order.customerName
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                      ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}