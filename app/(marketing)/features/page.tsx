import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brush, Package, CreditCard, BarChart, Rocket, Sparkles,
  ShoppingCart, Globe, Shield, Zap, Cloud, Users,
  Search, Mail, Smartphone, Lock, TrendingUp, HeartHandshake,
  ArrowRight, CheckCircle2, Store, Palette, Code2, 
  Languages, DollarSign, Headphones, FileText, Camera
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nuvi Features - Everything You Need to Build a Successful Online Store',
  description: 'Explore Nuvi\'s comprehensive e-commerce features: AI-powered tools, drag-and-drop builder, secure payments, SEO optimization, analytics, and 24/7 support.',
  keywords: 'e-commerce features, online store builder features, nuvi features, e-commerce tools, store builder capabilities, no-code features',
  openGraph: {
    title: 'Nuvi Features - Complete E-commerce Solution',
    description: 'All the tools and features you need to create, manage, and grow your online store. No coding required.',
    type: 'website',
    url: 'https://nuvi.com/features',
  },
  alternates: {
    canonical: 'https://nuvi.com/features',
  },
};

const featureCategories = [
  {
    title: 'Store Design & Customization',
    description: 'Create beautiful, professional stores without any coding knowledge',
    icon: Brush,
    features: [
      {
        title: 'Visual Theme Studio',
        description: 'Drag-and-drop builder with real-time preview. Customize every pixel of your store.',
        icon: Palette,
      },
      {
        title: '50+ Professional Templates',
        description: 'Industry-specific designs optimized for conversion. Mobile-responsive by default.',
        icon: Store,
      },
      {
        title: 'Custom Branding',
        description: 'Upload your logo, choose colors, fonts, and create a consistent brand experience.',
        icon: Brush,
      },
      {
        title: 'Advanced CSS Editor',
        description: 'For developers: Add custom CSS and JavaScript for complete control.',
        icon: Code2,
      },
    ],
  },
  {
    title: 'Product Management',
    description: 'Powerful tools to showcase and manage your inventory',
    icon: Package,
    features: [
      {
        title: 'Unlimited Products',
        description: 'Add as many products as you need with variants, SKUs, and inventory tracking.',
        icon: Package,
      },
      {
        title: 'Bulk Import/Export',
        description: 'Upload thousands of products at once via CSV. Export for backup or migration.',
        icon: FileText,
      },
      {
        title: 'Rich Media Galleries',
        description: 'Multiple images, 360° views, videos, and zoom functionality for each product.',
        icon: Camera,
      },
      {
        title: 'Smart Collections',
        description: 'Auto-organize products based on rules. Create seasonal or themed collections easily.',
        icon: Sparkles,
      },
    ],
  },
  {
    title: 'Sales & Marketing',
    description: 'Convert visitors into customers with powerful marketing tools',
    icon: TrendingUp,
    features: [
      {
        title: 'SEO Optimization',
        description: 'Built-in SEO tools, automatic sitemaps, meta tags, and schema markup.',
        icon: Search,
      },
      {
        title: 'Email Marketing',
        description: 'Send newsletters, abandoned cart emails, and promotional campaigns.',
        icon: Mail,
      },
      {
        title: 'Discount & Coupons',
        description: 'Create percentage, fixed amount, or free shipping discounts. Schedule sales.',
        icon: DollarSign,
      },
      {
        title: 'AI Content Generator',
        description: 'Generate product descriptions, blog posts, and marketing copy with AI.',
        icon: Sparkles,
      },
    ],
  },
  {
    title: 'Payments & Checkout',
    description: 'Secure, fast, and flexible payment processing',
    icon: CreditCard,
    features: [
      {
        title: '100+ Payment Methods',
        description: 'Accept credit cards, PayPal, Apple Pay, crypto, and local payment methods.',
        icon: CreditCard,
      },
      {
        title: 'One-Page Checkout',
        description: 'Optimized checkout flow reduces cart abandonment. Guest checkout available.',
        icon: ShoppingCart,
      },
      {
        title: 'Multi-Currency',
        description: 'Sell globally with automatic currency conversion and localized pricing.',
        icon: Globe,
      },
      {
        title: 'PCI Compliant',
        description: 'Bank-level security with SSL encryption and fraud protection built-in.',
        icon: Lock,
      },
    ],
  },
  {
    title: 'Analytics & Insights',
    description: 'Data-driven decisions to grow your business',
    icon: BarChart,
    features: [
      {
        title: 'Real-Time Dashboard',
        description: 'Monitor sales, traffic, and customer behavior as it happens.',
        icon: BarChart,
      },
      {
        title: 'Advanced Reports',
        description: 'Sales reports, customer analytics, product performance, and more.',
        icon: FileText,
      },
      {
        title: 'Conversion Tracking',
        description: 'Track every step of the customer journey. Optimize for better results.',
        icon: TrendingUp,
      },
      {
        title: 'Google Analytics',
        description: 'Seamless integration with GA4 and other analytics platforms.',
        icon: BarChart,
      },
    ],
  },
  {
    title: 'Operations & Support',
    description: 'Everything you need to run your business smoothly',
    icon: HeartHandshake,
    features: [
      {
        title: '24/7 Support',
        description: 'Get help when you need it via chat, email, or phone. Expert assistance always available.',
        icon: Headphones,
      },
      {
        title: 'Mobile App',
        description: 'Manage your store on the go. Process orders, update inventory from anywhere.',
        icon: Smartphone,
      },
      {
        title: 'Multi-Language',
        description: 'Create stores in multiple languages. Reach customers in their native language.',
        icon: Languages,
      },
      {
        title: 'Cloud Hosting',
        description: '99.9% uptime guarantee. Fast loading times with global CDN.',
        icon: Cloud,
      },
    ],
  },
];

const comparisonData = [
  { feature: 'Drag & Drop Builder', nuvi: true, others: 'Limited' },
  { feature: 'Transaction Fees', nuvi: '0.5-2%', others: '2.9%+' },
  { feature: 'Free Templates', nuvi: '50+', others: '10-20' },
  { feature: 'AI Tools', nuvi: true, others: 'Paid addon' },
  { feature: '24/7 Support', nuvi: true, others: 'Business plans only' },
  { feature: 'Mobile App', nuvi: true, others: true },
  { feature: 'Multi-currency', nuvi: true, others: 'Extra fee' },
  { feature: 'SEO Tools', nuvi: true, others: 'Basic' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            All-in-One Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-4">
            Everything You Need to
            <br />
            <span className="text-[#8B9F7E]">Succeed Online</span>
          </h1>
          
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 md:text-xl mb-8">
            From beautiful storefronts to powerful analytics, Nuvi provides all the tools 
            you need to create, manage, and grow your e-commerce business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[#8B9F7E] hover:bg-[#7A8B6D]">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, categoryIndex) => (
        <section 
          key={categoryIndex} 
          className={`py-16 md:py-24 ${categoryIndex % 2 === 1 ? 'bg-gray-50' : ''}`}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B9F7E]/10 rounded-full mb-6">
                <category.icon className="h-8 w-8 text-[#8B9F7E]" />
              </div>
              <h2 className="text-3xl font-bold mb-4">{category.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {category.description}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {category.features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-gray-200 hover:border-[#8B9F7E]/30 transition-all hover:shadow-lg">
                    <CardHeader>
                      <Icon className="h-10 w-10 text-[#8B9F7E] mb-3" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Nuvi?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how Nuvi compares to other e-commerce platforms
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#8B9F7E] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Feature</th>
                    <th className="px-6 py-4 text-center">Nuvi</th>
                    <th className="px-6 py-4 text-center">Others</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.nuvi === 'boolean' ? (
                          row.nuvi ? (
                            <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mx-auto" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )
                        ) : (
                          <span className="text-[#8B9F7E] font-medium">{row.nuvi}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {typeof row.others === 'boolean' ? (
                          row.others ? (
                            <CheckCircle2 className="h-5 w-5 text-gray-400 mx-auto" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )
                        ) : (
                          row.others
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Integrates with Your Favorite Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect Nuvi with the tools you already use to streamline your workflow
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-5xl mx-auto items-center">
            {['Google Analytics', 'Mailchimp', 'Facebook', 'Instagram', 'Stripe', 'PayPal', 
              'Slack', 'Zapier', 'QuickBooks', 'Xero', 'Klaviyo', 'TikTok'].map((partner) => (
              <div key={partner} className="text-center">
                <div className="h-20 w-20 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-xs text-gray-600">{partner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            See All Features in Action
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Start your free trial today and discover how Nuvi can transform your business. 
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#8B9F7E] hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/10"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Nuvi Features",
            "description": "Comprehensive e-commerce features for building successful online stores",
            "url": "https://nuvi.com/features",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": featureCategories.flatMap((category, catIndex) => 
                category.features.map((feature, featIndex) => ({
                  "@type": "ListItem",
                  "position": catIndex * 4 + featIndex + 1,
                  "name": feature.title,
                  "description": feature.description
                }))
              )
            }
          })
        }}
      />
    </div>
  );
}