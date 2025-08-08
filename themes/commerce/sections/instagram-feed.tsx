'use client';

import React, { useState, useEffect } from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';

interface InstagramPost {
  id: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
  caption?: string;
  timestamp?: string;
}

interface InstagramFeedProps {
  settings: {
    title?: string;
    subtitle?: string;
    username?: string;
    accessToken?: string;
    images?: string[]; // Manual images fallback
    columns?: string;
    showCaption?: boolean;
    showFollowButton?: boolean;
    followButtonText?: string;
    instagramUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    titleColor?: string;
    imageAspectRatio?: 'square' | 'portrait' | 'landscape';
    hoverEffect?: 'none' | 'overlay' | 'zoom';
    maxPosts?: number;
  };
  isPreview?: boolean;
}

export function InstagramFeed({ settings, isPreview }: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock posts for preview
  const mockPosts: InstagramPost[] = Array.from({ length: 6 }, (_, i) => ({
    id: `mock-${i + 1}`,
    media_url: `/placeholder-instagram-${(i % 3) + 1}.jpg`,
    media_type: 'IMAGE',
    permalink: '#',
    caption: `Amazing product showcase #fashion #style #shopping`,
    timestamp: new Date().toISOString()
  }));

  // Default manual images if no access token
  const defaultImages = [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    'https://images.unsplash.com/photo-1445205170230-053b83016050',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    'https://images.unsplash.com/photo-1552874869-5c39ec9288dc'
  ];

  useEffect(() => {
    if (settings.accessToken && !isPreview) {
      fetchInstagramPosts();
    }
  }, [settings.accessToken, isPreview]);

  const fetchInstagramPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call Instagram Basic Display API
      // For now, we'll simulate the API call
      console.log('Fetching Instagram posts with token:', settings.accessToken);
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just use mock data
      // In production, you'd make a real API call here
      setPosts(mockPosts);
    } catch (err) {
      console.error('Error fetching Instagram posts:', err);
      setError('Failed to load Instagram feed');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayPosts = () => {
    if (posts.length > 0) {
      return posts.slice(0, settings.maxPosts || 6);
    }
    
    if (settings.images && settings.images.length > 0) {
      return settings.images.slice(0, settings.maxPosts || 6).map((img, i) => ({
        id: `manual-${i}`,
        media_url: img,
        media_type: 'IMAGE' as const,
        permalink: settings.instagramUrl || '#'
      }));
    }
    
    if (isPreview) {
      return mockPosts;
    }
    
    return defaultImages.slice(0, settings.maxPosts || 6).map((img, i) => ({
      id: `default-${i}`,
      media_url: img,
      media_type: 'IMAGE' as const,
      permalink: settings.instagramUrl || '#'
    }));
  };

  const displayPosts = getDisplayPosts();

  const getColumnsClass = () => {
    switch (settings.columns) {
      case '2': return 'grid-cols-2';
      case '3': return 'grid-cols-2 sm:grid-cols-3';
      case '4': return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
      case '5': return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
      case '6': return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6';
      default: return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6';
    }
  };

  const getAspectRatioClass = () => {
    switch (settings.imageAspectRatio) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      default: return 'aspect-square';
    }
  };

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Instagram feed...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && !isPreview) {
    return (
      <section className="py-16" style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}>
          <div className="text-center">
            <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-16"
      style={{ 
        backgroundColor: settings.backgroundColor || '#ffffff',
        color: settings.textColor || '#111827'
      }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          {settings.title && (
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: settings.titleColor || settings.textColor || '#111827' }}
            >
              {settings.title}
            </h2>
          )}
          {settings.subtitle && (
            <p className="text-lg opacity-80 max-w-2xl mx-auto mb-4">
              {settings.subtitle}
            </p>
          )}
          {settings.username && (
            <p className="text-lg font-medium mb-6">
              <Instagram className="inline-block h-5 w-5 mr-2" />
              @{settings.username}
            </p>
          )}
        </div>

        {/* Instagram Grid */}
        <div className={`grid ${getColumnsClass()} gap-2 sm:gap-4`}>
          {displayPosts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative block overflow-hidden bg-gray-100 ${getAspectRatioClass()}`}
            >
              <img
                src={post.media_url}
                alt={post.caption || 'Instagram post'}
                className={`w-full h-full object-cover ${
                  settings.hoverEffect === 'zoom' ? 'group-hover:scale-110 transition-transform duration-500' : ''
                }`}
              />
              
              {/* Overlay on hover */}
              {settings.hoverEffect === 'overlay' && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-5 w-5 fill-current" />
                        <span className="text-sm">2.3k</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-5 w-5 fill-current" />
                        <span className="text-sm">45</span>
                      </div>
                    </div>
                    {settings.showCaption && post.caption && (
                      <p className="mt-2 text-xs px-4 line-clamp-2">
                        {post.caption}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* External link icon */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
            </a>
          ))}
        </div>

        {/* Follow Button */}
        {settings.showFollowButton && (
          <div className="text-center mt-12">
            <a
              href={settings.instagramUrl || `https://instagram.com/${settings.username || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Instagram className="mr-2 h-5 w-5" />
              {settings.followButtonText || 'Follow us on Instagram'}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}export default InstagramUfeed;
