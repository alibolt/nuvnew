'use client';

import { useState, useEffect } from 'react';
import { 
  Store, Users, Package, DollarSign, TrendingUp, 
  ShoppingCart, Star, Clock, AlertCircle, CheckCircle,
  Settings, Plus, Filter, Search, Download, Upload,
  BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight,
  Truck, CreditCard, Shield, Award, Globe, Building
} from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceContentProps {
  subdomain: string;
  storeId: string;
}

interface Vendor {
  id: string;
  name: string;
  logo?: string;
  category: string;
  rating: number;
  products: number;
  sales: number;
  revenue: number;
  commission: number;
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
  lastActive: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  nextPayout: number;
}

interface MarketplaceStats {
  totalVendors: number;
  activeVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  avgRating: number;
  pendingPayouts: number;
}

interface VendorApplication {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  category: string;
  website?: string;
  description: string;
  expectedProducts: number;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function MarketplaceContent({ subdomain, storeId }: MarketplaceContentProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'vendors' | 'applications' | 'payments' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      // Simulated data - in production, this would come from API
      setStats({
        totalVendors: 24,
        activeVendors: 21,
        totalProducts: 1456,
        totalOrders: 3489,
        totalRevenue: 145670.00,
        totalCommission: 14567.00,
        avgRating: 4.6,
        pendingPayouts: 5670.00
      });

      setVendors([
        {
          id: '1',
          name: 'Fashion Boutique Co.',
          category: 'Fashion',
          rating: 4.8,
          products: 145,
          sales: 523,
          revenue: 45670.00,
          commission: 4567.00,
          status: 'active',
          joinedDate: '2023-06-15',
          lastActive: '2 hours ago',
          paymentStatus: 'paid',
          nextPayout: 0
        },
        {
          id: '2',
          name: 'Tech Gadgets Store',
          category: 'Electronics',
          rating: 4.6,
          products: 89,
          sales: 342,
          revenue: 67890.00,
          commission: 6789.00,
          status: 'active',
          joinedDate: '2023-08-20',
          lastActive: '1 day ago',
          paymentStatus: 'pending',
          nextPayout: 6789.00
        },
        {
          id: '3',
          name: 'Home Decor Plus',
          category: 'Home & Garden',
          rating: 4.9,
          products: 234,
          sales: 189,
          revenue: 23450.00,
          commission: 2345.00,
          status: 'active',
          joinedDate: '2023-09-10',
          lastActive: '5 hours ago',
          paymentStatus: 'pending',
          nextPayout: 2345.00
        },
        {
          id: '4',
          name: 'Beauty Essentials',
          category: 'Beauty',
          rating: 4.7,
          products: 67,
          sales: 412,
          revenue: 18900.00,
          commission: 1890.00,
          status: 'active',
          joinedDate: '2023-10-05',
          lastActive: '3 hours ago',
          paymentStatus: 'paid',
          nextPayout: 0
        },
        {
          id: '5',
          name: 'Sports Zone',
          category: 'Sports',
          rating: 4.5,
          products: 156,
          sales: 278,
          revenue: 34560.00,
          commission: 3456.00,
          status: 'pending',
          joinedDate: '2024-01-10',
          lastActive: '1 week ago',
          paymentStatus: 'overdue',
          nextPayout: 3456.00
        }
      ]);

      setApplications([
        {
          id: '1',
          businessName: 'Artisan Crafts',
          contactName: 'John Smith',
          email: 'john@artisancrafts.com',
          category: 'Handmade',
          website: 'www.artisancrafts.com',
          description: 'Handmade jewelry and accessories',
          expectedProducts: 50,
          appliedDate: '2024-01-12',
          status: 'pending'
        },
        {
          id: '2',
          businessName: 'Organic Foods Co',
          contactName: 'Sarah Johnson',
          email: 'sarah@organicfoods.com',
          category: 'Food & Beverage',
          description: 'Organic and natural food products',
          expectedProducts: 120,
          appliedDate: '2024-01-11',
          status: 'pending'
        },
        {
          id: '3',
          businessName: 'Pet Paradise',
          contactName: 'Mike Davis',
          email: 'mike@petparadise.com',
          category: 'Pet Supplies',
          website: 'www.petparadise.com',
          description: 'Premium pet food and accessories',
          expectedProducts: 200,
          appliedDate: '2024-01-10',
          status: 'pending'
        }
      ]);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast.error('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    // Create new vendor from application
    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name: application.businessName,
      category: application.category,
      rating: 0,
      products: 0,
      sales: 0,
      revenue: 0,
      commission: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
      paymentStatus: 'pending',
      nextPayout: 0
    };

    setVendors(prev => [...prev, newVendor]);
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, status: 'approved' as const } : app
    ));
    
    toast.success(`${application.businessName} has been approved as a vendor`);
  };

  const handleRejectVendor = async (applicationId: string) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, status: 'rejected' as const } : app
    ));
    toast.error('Application rejected');
  };

  const handleSuspendVendor = async (vendorId: string) => {
    setVendors(prev => prev.map(vendor => 
      vendor.id === vendorId ? { ...vendor, status: 'suspended' as const } : vendor
    ));
    toast.warning('Vendor suspended');
  };

  const handlePayoutVendor = async (vendorId: string) => {
    setVendors(prev => prev.map(vendor => 
      vendor.id === vendorId ? { ...vendor, paymentStatus: 'paid' as const, nextPayout: 0 } : vendor
    ));
    toast.success('Payout processed successfully');
  };

  const filteredVendors = vendors.filter(vendor => {
    if (filterStatus !== 'all' && vendor.status !== filterStatus) return false;
    if (searchTerm && !vendor.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-gray-600 mt-1">
            Manage your multi-vendor marketplace
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download size={16} />
            Export Data
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
            <Plus size={16} />
            Invite Vendor
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <Store className="text-blue-500" size={20} />
              <span className="text-xs text-green-500 font-medium">+3 this month</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <div className="text-sm text-gray-500">Total Vendors</div>
            <div className="text-xs text-gray-400 mt-1">{stats.activeVendors} active</div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <Package className="text-purple-500" size={20} />
              <span className="text-xs text-green-500 font-medium">+12%</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Listed Products</div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-green-500" size={20} />
              <span className="text-xs text-green-500 font-medium">+8%</span>
            </div>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-xs text-gray-400 mt-1">${stats.totalCommission.toLocaleString()} commission</div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="text-orange-500" size={20} />
              {stats.pendingPayouts > 0 && (
                <span className="text-xs text-orange-500 font-medium">Pending</span>
              )}
            </div>
            <div className="text-2xl font-bold">${stats.pendingPayouts.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Pending Payouts</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'vendors', label: 'Vendors', icon: Store },
            { id: 'applications', label: 'Applications', icon: Users, badge: pendingApplications.length },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                selectedTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <PieChart size={48} className="text-gray-400" />
                <p className="ml-3 text-gray-500">Revenue chart by vendor</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Sales Trend</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <BarChart3 size={48} className="text-gray-400" />
                <p className="ml-3 text-gray-500">Monthly sales trend</p>
              </div>
            </div>
          </div>

          {/* Top Vendors */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Top Performing Vendors</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {vendors.slice(0, 3).map(vendor => (
                  <div key={vendor.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-gray-500">{vendor.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${vendor.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{vendor.sales} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'vendors' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Vendors Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVendors.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-gray-500">{vendor.category}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-600">{vendor.rating}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{vendor.products}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{vendor.sales}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">${vendor.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">${vendor.commission.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 block">10%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vendor.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : vendor.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-600 hover:text-gray-900">
                          <Settings size={16} />
                        </button>
                        {vendor.status === 'active' && (
                          <button 
                            onClick={() => handleSuspendVendor(vendor.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <AlertCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'applications' && (
        <div className="space-y-4">
          {pendingApplications.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Applications</h3>
              <p className="text-gray-600">All vendor applications have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map(application => (
                <div key={application.id} className="bg-white rounded-lg border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{application.businessName}</h3>
                      <p className="text-gray-600">{application.category}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                      Pending Review
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{application.contactName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-sm">{application.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expected Products</p>
                      <p className="font-medium">{application.expectedProducts}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applied</p>
                      <p className="font-medium">{application.appliedDate}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{application.description}</p>
                  </div>
                  
                  {application.website && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Website</p>
                      <a href={`https://${application.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        {application.website}
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveVendor(application.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectVendor(application.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                      Request More Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-3">This Month</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales</span>
                  <span className="font-medium">$45,670</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission (10%)</span>
                  <span className="font-medium">$4,567</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Net Payout</span>
                  <span className="font-semibold">$41,103</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-3">Pending Payouts</h3>
              <div className="space-y-3">
                {vendors.filter(v => v.paymentStatus === 'pending').slice(0, 3).map(vendor => (
                  <div key={vendor.id} className="flex justify-between items-center">
                    <span className="text-sm">{vendor.name}</span>
                    <span className="font-medium">${vendor.nextPayout.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-3">Payment Schedule</h3>
              <p className="text-gray-600 mb-3">Next payout: January 15, 2024</p>
              <button className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                Process Payouts Now
              </button>
            </div>
          </div>

          {/* Vendor Payments Table */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Vendor Payments</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Net Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendors.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{vendor.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">Jan 1 - Jan 31</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">${vendor.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">${vendor.commission.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">
                        ${(vendor.revenue - vendor.commission).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vendor.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : vendor.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {vendor.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {vendor.paymentStatus === 'pending' && (
                        <button
                          onClick={() => handlePayoutVendor(vendor.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'settings' && (
        <div className="space-y-6">
          {/* Commission Settings */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Commission Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Default Commission Rate</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-24 px-3 py-2 border rounded-lg"
                  />
                  <span>%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Applied to all new vendors by default</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category-Specific Rates</label>
                <div className="space-y-2">
                  {['Electronics', 'Fashion', 'Food & Beverage', 'Home & Garden'].map(category => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue="10"
                          className="w-20 px-2 py-1 border rounded text-sm"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Requirements */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Vendor Requirements</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Require business verification</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Minimum 10 products to start selling</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Require product approval before listing</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Auto-approve trusted vendors' products</span>
              </label>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Payment Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payout Schedule</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Weekly (Every Monday)</option>
                  <option>Bi-weekly (1st and 15th)</option>
                  <option>Monthly (Last day)</option>
                  <option>Manual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Payout Amount</label>
                <div className="flex items-center gap-2">
                  <span>$</span>
                  <input
                    type="number"
                    defaultValue="100"
                    className="w-32 px-3 py-2 border rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Payouts below this amount will be held until next cycle</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}