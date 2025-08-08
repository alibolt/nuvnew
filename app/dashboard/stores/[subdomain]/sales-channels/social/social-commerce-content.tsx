'use client';

import { useState, useEffect } from 'react';
import { 
  Instagram, Facebook, Youtube, Twitter, MessageCircle, 
  ShoppingBag, TrendingUp, Users, Package, DollarSign,
  Link2, Settings, Plus, Check, X, ExternalLink, 
  BarChart3, Eye, Heart, Share2, Calendar, Clock,
  AlertCircle, ArrowRight, Zap, Target, Hash, Loader2,
  RefreshCw, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import '@/app/styles/admin-theme.css';

interface SocialCommerceContentProps {
  subdomain: string;
  storeId: string;
}

interface SocialChannel {
  id: string;
  platform: string;
  connected: boolean;
  username?: string;
  followers?: number;
  products?: number;
  sales?: number;
  engagement?: number;
  lastSync?: string;
  accessToken?: string;
}

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  image?: string;
  products: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  sales: number;
  revenue: number;
  date: string;
  status: 'scheduled' | 'published' | 'draft';
}

export function SocialCommerceContent({ subdomain, storeId }: SocialCommerceContentProps) {
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string>('');
  const [syncingPlatform, setSyncingPlatform] = useState<string>('');

  useEffect(() => {
    loadSocialChannels();
  }, [subdomain]);

  const loadSocialChannels = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/social-channels`);
      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
        
        // Load posts for connected channels
        const connectedChannels = data.channels.filter((ch: SocialChannel) => ch.connected);
        if (connectedChannels.length > 0) {
          await loadSocialPosts(connectedChannels);
        }
      }
    } catch (error) {
      console.error('Error loading social channels:', error);
      toast.error('Failed to load social channels');
    } finally {
      setLoading(false);
    }
  };

  const loadSocialPosts = async (connectedChannels: SocialChannel[]) => {
    // This would fetch real posts from Instagram/Facebook Graph API
    // For now, using mock data
    setPosts([
      {
        id: '1',
        platform: 'instagram',
        content: 'New collection drop! 🎉 Check out our summer essentials',
        image: '/api/placeholder/400/400',
        products: 5,
        likes: 1234,
        comments: 89,
        shares: 45,
        clicks: 567,
        sales: 12,
        revenue: 1456.00,
        date: '2024-01-15',
        status: 'published'
      }
    ]);
  };

  const handleConnect = async (platform: string) => {
    setConnectingPlatform(platform);
    try {
      const response = await fetch(`/api/stores/${subdomain}/social-channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, action: 'connect' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          // Open OAuth popup
          const authWindow = window.open(
            data.authUrl,
            `${platform}_auth`,
            'width=600,height=700'
          );

          // Listen for auth completion
          const checkAuth = setInterval(() => {
            if (authWindow?.closed) {
              clearInterval(checkAuth);
              loadSocialChannels(); // Refresh channels
              toast.success(`${platform} connected successfully!`);
            }
          }, 1000);
        }
      } else {
        toast.error(`Failed to connect ${platform}`);
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      toast.error(`Failed to connect ${platform}`);
    } finally {
      setConnectingPlatform('');
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;

    try {
      const response = await fetch(`/api/stores/${subdomain}/social-channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, action: 'disconnect' })
      });

      if (response.ok) {
        await loadSocialChannels();
        toast.success(`${platform} disconnected successfully`);
      }
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast.error(`Failed to disconnect ${platform}`);
    }
  };

  const handleSync = async (platform: string) => {
    setSyncingPlatform(platform);
    try {
      const response = await fetch(`/api/stores/${subdomain}/social-channels/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });

      if (response.ok) {
        await loadSocialChannels();
        toast.success(`${platform} synced successfully`);
      }
    } catch (error) {
      console.error('Error syncing platform:', error);
      toast.error(`Failed to sync ${platform}`);
    } finally {
      setSyncingPlatform('');
    }
  };

  const channelConfig = {
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      color: '#E4405F',
      features: ['Shopping Tags', 'Stories', 'Reels', 'Live Shopping']
    },
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      features: ['Facebook Shop', 'Marketplace', 'Live Shopping', 'Ads Integration']
    },
    tiktok: {
      name: 'TikTok',
      icon: MessageCircle,
      color: '#000000',
      features: ['TikTok Shop', 'Live Shopping', 'Product Showcase', 'Influencer Collabs'],
      comingSoon: true
    },
    pinterest: {
      name: 'Pinterest',
      icon: Target,
      color: '#E60023',
      features: ['Shopping Pins', 'Try On', 'Shopping Ads', 'Catalogs'],
      comingSoon: true
    },
    youtube: {
      name: 'YouTube',
      icon: Youtube,
      color: '#FF0000',
      features: ['Product Shelf', 'Shopping Tags', 'Live Shopping', 'Shorts'],
      comingSoon: true
    },
    twitter: {
      name: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      features: ['Shop Module', 'Product Drops', 'Twitter Shopping', 'Live Shopping'],
      comingSoon: true
    }
  };

  const connectedChannels = channels.filter(ch => ch.connected);
  const totalFollowers = connectedChannels.reduce((sum, ch) => sum + (ch.followers || 0), 0);
  const totalSales = connectedChannels.reduce((sum, ch) => sum + (ch.sales || 0), 0);
  const totalProducts = connectedChannels[0]?.products || 0;
  const avgEngagement = connectedChannels.length > 0 
    ? (connectedChannels.reduce((sum, ch) => sum + (ch.engagement || 0), 0) / connectedChannels.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Social Commerce</h1>
          <p className="text-gray-600 mt-1">
            Sell directly on social media platforms
          </p>
        </div>
        <button className="nuvi-btn nuvi-btn-primary">
          <Plus size={16} className="mr-2" />
          Create Post
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="nuvi-card">
          <div className="nuvi-card-content">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-blue-500" size={20} />
              <span className="text-xs text-green-500 font-medium">+12%</span>
            </div>
            <div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Followers</div>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-content">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="text-green-500" size={20} />
              <span className="text-xs text-green-500 font-medium">+8%</span>
            </div>
            <div className="text-2xl font-bold">{totalSales}</div>
            <div className="text-sm text-gray-500">Social Sales</div>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-content">
            <div className="flex items-center justify-between mb-2">
              <Package className="text-purple-500" size={20} />
            </div>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <div className="text-sm text-gray-500">Listed Products</div>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-content">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-orange-500" size={20} />
              <span className="text-xs text-green-500 font-medium">+1.2%</span>
            </div>
            <div className="text-2xl font-bold">{avgEngagement}%</div>
            <div className="text-sm text-gray-500">Avg Engagement</div>
          </div>
        </div>
      </div>

      {/* Connected Channels */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h2 className="nuvi-card-title">Sales Channels</h2>
        </div>
        <div className="nuvi-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(channelConfig).map(([key, config]) => {
              const channel = channels.find(ch => ch.id === key);
              const isConnected = channel?.connected || false;
              const Icon = config.icon;

              return (
                <div
                  key={key}
                  className={`nuvi-card ${isConnected ? 'border-green-200 bg-green-50' : ''} ${
                    config.comingSoon ? 'opacity-60' : ''
                  }`}
                >
                  <div className="nuvi-card-content">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: config.color + '20' }}
                        >
                          <Icon size={20} style={{ color: config.color }} />
                        </div>
                        <div>
                          <h3 className="font-medium">{config.name}</h3>
                          {isConnected && channel?.username && (
                            <p className="text-sm text-gray-500">{channel.username}</p>
                          )}
                        </div>
                      </div>
                      {isConnected && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Connected
                        </span>
                      )}
                      {config.comingSoon && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    {isConnected ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Followers:</span>
                            <p className="font-medium">{channel?.followers?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Products:</span>
                            <p className="font-medium">{channel?.products || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Sales:</span>
                            <p className="font-medium">{channel?.sales || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Engagement:</span>
                            <p className="font-medium">{channel?.engagement || 0}%</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Last synced: {channel?.lastSync || 'Never'}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => handleSync(key)}
                            disabled={syncingPlatform === key}
                            className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm flex-1"
                          >
                            {syncingPlatform === key ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw size={14} className="mr-1" />
                                Sync
                              </>
                            )}
                          </button>
                          <button className="nuvi-btn nuvi-btn-outline nuvi-btn-sm">
                            <Settings size={14} />
                          </button>
                          <button 
                            onClick={() => handleDisconnect(key)}
                            className="nuvi-btn nuvi-btn-danger nuvi-btn-sm"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-600 mb-3">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {config.features.slice(0, 3).map(feature => (
                              <span
                                key={feature}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnect(key)}
                          disabled={config.comingSoon || connectingPlatform === key}
                          className="nuvi-btn nuvi-btn-primary nuvi-btn-sm w-full"
                        >
                          {connectingPlatform === key ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-2" />
                              Connecting...
                            </>
                          ) : config.comingSoon ? (
                            'Coming Soon'
                          ) : (
                            `Connect ${config.name}`
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Posts Performance */}
      {posts.length > 0 && (
        <div className="nuvi-card">
          <div className="nuvi-card-header flex justify-between items-center">
            <h2 className="nuvi-card-title">Recent Posts Performance</h2>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm"
            >
              <option value="all">All Channels</option>
              {connectedChannels.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {channelConfig[ch.id as keyof typeof channelConfig]?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts
                  .filter(post => selectedChannel === 'all' || post.platform === selectedChannel)
                  .map(post => {
                    const config = channelConfig[post.platform as keyof typeof channelConfig];
                    const Icon = config?.icon || ShoppingBag;
                    return (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {post.image && (
                              <div className="w-10 h-10 bg-gray-200 rounded" />
                            )}
                            <div className="max-w-xs">
                              <p className="text-sm font-medium truncate">{post.content}</p>
                              <p className="text-xs text-gray-500">{post.date}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Icon size={16} style={{ color: config?.color }} />
                            <span className="text-sm">{config?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Heart size={14} />
                              {post.likes.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle size={14} />
                              {post.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 size={14} />
                              {post.shares}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium">{post.clicks}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium">{post.sales}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium">${post.revenue.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="nuvi-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="nuvi-card-content">
            <Zap className="text-yellow-500 mb-2" size={20} />
            <h3 className="font-medium mb-1">Schedule Posts</h3>
            <p className="text-sm text-gray-600">Plan and schedule your social media content</p>
          </div>
        </div>
        
        <div className="nuvi-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="nuvi-card-content">
            <Hash className="text-blue-500 mb-2" size={20} />
            <h3 className="font-medium mb-1">Hashtag Research</h3>
            <p className="text-sm text-gray-600">Find trending hashtags for better reach</p>
          </div>
        </div>
        
        <div className="nuvi-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="nuvi-card-content">
            <BarChart3 className="text-green-500 mb-2" size={20} />
            <h3 className="font-medium mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">View detailed social commerce analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}