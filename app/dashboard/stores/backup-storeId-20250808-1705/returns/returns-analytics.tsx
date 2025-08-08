'use client';

import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  BarChart3,
  PieChart,
  Users,
  AlertTriangle
} from 'lucide-react';

interface ReturnsAnalyticsProps {
  storeId: string;
  returns: any[];
  onBack: () => void;
}

export function ReturnsAnalytics({ storeId, returns, onBack }: ReturnsAnalyticsProps) {
  const [timeframe, setTimeframe] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Filter returns by timeframe
  const filteredReturns = useMemo(() => {
    const days = parseInt(timeframe);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return returns.filter(returnItem => 
      new Date(returnItem.createdAt) >= cutoffDate
    );
  }, [returns, timeframe]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalReturns = filteredReturns.length;
    const totalRefunded = filteredReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const avgRefundAmount = totalReturns > 0 ? totalRefunded / totalReturns : 0;

    // Status breakdown
    const statusBreakdown = filteredReturns.reduce((acc, returnItem) => {
      acc[returnItem.status] = (acc[returnItem.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Return type breakdown
    const typeBreakdown = filteredReturns.reduce((acc, returnItem) => {
      acc[returnItem.returnType] = (acc[returnItem.returnType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Reason breakdown
    const reasonBreakdown = filteredReturns.reduce((acc, returnItem) => {
      returnItem.returnItems?.forEach((item: any) => {
        acc[item.reason] = (acc[item.reason] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthReturns = returns.filter(r => {
        const returnDate = new Date(r.createdAt);
        return returnDate >= monthStart && returnDate <= monthEnd;
      });

      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthReturns.length,
        amount: monthReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0)
      });
    }

    // Processing time analysis
    const processingTimes = filteredReturns
      .filter(r => r.status === 'completed' && r.statusHistory?.length > 1)
      .map(r => {
        const created = new Date(r.createdAt);
        const completed = new Date(r.statusHistory[r.statusHistory.length - 1].timestamp);
        return Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)); // days
      });

    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;

    // Top return reasons
    const topReasons = Object.entries(reasonBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({
        reason: reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        percentage: ((count / Object.values(reasonBreakdown).reduce((sum, c) => sum + c, 0)) * 100).toFixed(1)
      }));

    // Customer analysis
    const customerReturns = filteredReturns.reduce((acc, returnItem) => {
      const customerId = returnItem.customerId || 'guest';
      acc[customerId] = (acc[customerId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repeatCustomers = Object.values(customerReturns).filter(count => count > 1).length;
    const totalCustomers = Object.keys(customerReturns).length;

    return {
      totalReturns,
      totalRefunded,
      avgRefundAmount,
      avgProcessingTime,
      statusBreakdown,
      typeBreakdown,
      reasonBreakdown,
      monthlyTrend,
      topReasons,
      repeatCustomers,
      totalCustomers,
      processingTimes
    };
  }, [filteredReturns, returns]);

  // Calculate comparison with previous period
  const previousPeriodReturns = useMemo(() => {
    const days = parseInt(timeframe);
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2));
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - days);
    
    return returns.filter(returnItem => {
      const returnDate = new Date(returnItem.createdAt);
      return returnDate >= previousPeriodStart && returnDate <= previousPeriodEnd;
    });
  }, [returns, timeframe]);

  const comparison = useMemo(() => {
    const prevTotal = previousPeriodReturns.length;
    const prevRefunded = previousPeriodReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    
    const returnsChange = prevTotal > 0 ? ((analytics.totalReturns - prevTotal) / prevTotal) * 100 : 0;
    const refundedChange = prevRefunded > 0 ? ((analytics.totalRefunded - prevRefunded) / prevRefunded) * 100 : 0;
    
    return {
      returnsChange,
      refundedChange
    };
  }, [analytics, previousPeriodReturns]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'received': return 'bg-purple-100 text-purple-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <div className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Returns
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Returns Analytics</h1>
            <p className="text-gray-500">Detailed insights into your return patterns</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalReturns}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center gap-1">
            {getChangeIcon(comparison.returnsChange)}
            <span className={`text-sm ${getChangeColor(comparison.returnsChange)}`}>
              {Math.abs(comparison.returnsChange).toFixed(1)}% vs previous period
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunded</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalRefunded.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-2 flex items-center gap-1">
            {getChangeIcon(comparison.refundedChange)}
            <span className={`text-sm ${getChangeColor(comparison.refundedChange)}`}>
              {Math.abs(comparison.refundedChange).toFixed(1)}% vs previous period
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Refund Amount</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.avgRefundAmount.toFixed(2)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              {analytics.totalReturns} returns processed
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.avgProcessingTime.toFixed(1)} days</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              From request to completion
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trend</h3>
          <div className="space-y-3">
            {analytics.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{month.month}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{month.count} returns</div>
                    <div className="text-xs text-gray-500">${month.amount.toFixed(2)}</div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.max(5, (month.count / Math.max(...analytics.monthlyTrend.map(m => m.count))) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.max(5, (count / analytics.totalReturns) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10">
                    {((count / analytics.totalReturns) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Return Reasons */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Return Reasons</h3>
          <div className="space-y-3">
            {analytics.topReasons.map((reason, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{reason.reason}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{reason.count}</span>
                  <span className="text-xs text-gray-500">({reason.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return Types */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Return Types</h3>
          <div className="space-y-3">
            {Object.entries(analytics.typeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {type === 'refund' && <DollarSign className="h-4 w-4 text-red-500" />}
                  {type === 'exchange' && <RefreshCw className="h-4 w-4 text-blue-500" />}
                  {type === 'store_credit' && <Package className="h-4 w-4 text-green-500" />}
                  <span className="text-sm text-gray-700 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">
                    ({((count / analytics.totalReturns) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="text-sm font-medium text-gray-900">{analytics.totalCustomers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Repeat Returners</span>
              <span className="text-sm font-medium text-gray-900">{analytics.repeatCustomers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Repeat Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.totalCustomers > 0 ? ((analytics.repeatCustomers / analytics.totalCustomers) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Monitor customers with multiple returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Time Distribution */}
      {analytics.processingTimes.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Time Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.processingTimes.filter(t => t <= 3).length}
              </div>
              <div className="text-sm text-gray-600">≤ 3 days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.processingTimes.filter(t => t > 3 && t <= 7).length}
              </div>
              <div className="text-sm text-gray-600">4-7 days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analytics.processingTimes.filter(t => t > 7 && t <= 14).length}
              </div>
              <div className="text-sm text-gray-600">8-14 days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics.processingTimes.filter(t => t > 14).length}
              </div>
              <div className="text-sm text-gray-600">> 14 days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}