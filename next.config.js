/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize bundle splitting and development performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@/components', 
      '@/lib',
      'lucide-react',
      '@radix-ui/react-*',
      '@prisma/client',
      'next-auth',
      'zod',
      'sonner',
      'react-hook-form'
    ],
    // Turbopack için deneysel destek (daha hızlı HMR)
    // turbo: true, // Next.js 13.5+ için
  },
  
  // Development modunda daha hızlı yenileme
  swcMinify: true,
  reactStrictMode: true,
  
  // Module aliases for faster resolution
  webpack: (config, { isServer, webpack }) => {
    // Ignore problematic packages on client-side
    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(puppeteer|puppeteer-extra|puppeteer-extra-plugin-stealth|clone-deep)$/,
        })
      );
    }
    
    // Add module aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib/prisma': isServer 
        ? '@/lib/prisma' 
        : '@/lib/prisma-client', // Use a client-safe version
    };
    
    // Optimize module resolution
    config.resolve.modules = [
      'node_modules',
      ...config.resolve.modules,
    ];
    
    // Enable caching for faster rebuilds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };
    
    // Development modunda source map'leri hızlandır
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'cheap-module-source-map';
    }
    
    return config;
  },
  
  // Allow external images
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**.shopify.com',
      },
      {
        protocol: 'https',
        hostname: '**.shopifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  
  // Reduce initial JS load
  productionBrowserSourceMaps: false,
  
  // Enable Incremental Static Regeneration
  staticPageGenerationTimeout: 60,
};

module.exports = nextConfig;