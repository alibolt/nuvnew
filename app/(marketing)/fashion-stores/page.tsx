import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, Palette, Camera, ShoppingBag, TrendingUp, 
  Globe, Smartphone, Instagram, Star, CheckCircle2,
  ArrowRight, Users, BarChart, Zap
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'E-commerce Platform for Fashion Stores - Nuvi',
  description: 'Create stunning online fashion stores with Nuvi. Beautiful templates, Instagram integration, size guides, and everything you need to sell fashion online.',
  keywords: 'fashion e-commerce, online fashion store, clothing store builder, fashion website builder, boutique online store, fashion retail platform',
  openGraph: {
    title: 'Build Your Fashion Store Online - Nuvi E-commerce',
    description: 'The perfect e-commerce platform for fashion brands and boutiques. Start selling in style.',
    type: 'website',
    url: 'https://nuvi.com/fashion-stores',
    images: [{
      url: 'https://nuvi.com/og-fashion.png',
      width: 1200,
      height: 630,
      alt: 'Fashion E-commerce with Nuvi',
    }],
  },
  alternates: {
    canonical: 'https://nuvi.com/fashion-stores',
  },
};

const features = [
  {
    icon: Palette,
    title: 'Fashion-First Templates',
    description: 'Stunning, conversion-optimized templates designed specifically for fashion brands',
  },
  {
    icon: Camera,
    title: 'Rich Media Galleries',
    description: 'Showcase products with zoom, 360° views, and video support for maximum impact',
  },
  {
    icon: Instagram,
    title: 'Instagram Shopping',
    description: 'Sync your catalog with Instagram and sell directly on social media',
  },
  {
    icon: ShoppingBag,
    title: 'Smart Size Guides',
    description: 'Reduce returns with interactive size charts and fit recommendations',
  },
  {
    icon: Globe,
    title: 'Global Selling',
    description: 'Multi-currency, multi-language support to reach customers worldwide',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: '70% of fashion purchases happen on mobile - we\'ve got you covered',
  },
];

const successStories = [
  {
    brand: 'Luna Boutique',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop',
    quote: 'Nuvi transformed our boutique. We went from local to global in 6 months!',
    author: 'Maria Santos',
    role: 'Founder',
    metrics: {
      revenue: '+250%',
      conversion: '+45%',
      global: '28 countries',
    },
  },
  {
    brand: 'Urban Threads',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop',
    quote: 'The Instagram integration alone doubled our sales. Game changer!',
    author: 'James Chen',
    role: 'CEO',
    metrics: {
      revenue: '+180%',
      conversion: '+60%',
      global: '15 countries',
    },
  },
  {
    brand: 'Vintage Vibes',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=400&fit=crop',
    quote: 'Finally, an e-commerce platform that understands fashion retail.',
    author: 'Sophie Martin',
    role: 'Creative Director',
    metrics: {
      revenue: '+320%',
      conversion: '+55%',
      global: '42 countries',
    },
  },
];

const fashionFeatures = [
  'Lookbook creator',
  'Wishlist functionality',
  'Advanced filtering (size, color, style)',
  'Product recommendations',
  'Customer reviews with photos',
  'Virtual try-on integration',
  'Influencer collaboration tools',
  'Pre-order management',
  'Flash sale timers',
  'Stock alerts',
  'Gift cards & loyalty programs',
  'Wholesale portal',
];

export default function FashionStoresPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50"></div>
        <div className="relative container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                For Fashion Brands
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-6">
                Build Your Fashion Empire
                <span className="block text-[#8B9F7E] mt-2">Online</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                The e-commerce platform designed for fashion. Beautiful stores, 
                powerful features, and everything you need to sell in style.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/start-free-trial">
                  <Button size="lg" className="bg-[#8B9F7E] hover:bg-[#7A8B6D]">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline">
                    Watch Fashion Demo
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Trusted by 5,000+ fashion brands</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#8B9F7E] text-[#8B9F7E]" />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">4.9/5 rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Image
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop"
                    alt="Fashion Store Example 1"
                    width={400}
                    height={500}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop"
                    alt="Fashion Store Example 2"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop"
                    alt="Fashion Store Example 3"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=500&fit=crop"
                    alt="Fashion Store Example 4"
                    width={400}
                    height={500}
                    className="rounded-lg shadow-xl"
                  />
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-xl p-4 z-10">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-[#8B9F7E]" />
                  <div>
                    <p className="text-2xl font-bold">+240%</p>
                    <p className="text-sm text-gray-600">Avg. Sales Growth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything Fashion Brands Need to Succeed
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Purpose-built features that understand the unique needs of fashion retail
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-gray-200 hover:border-[#8B9F7E]/30 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <Icon className="h-12 w-12 text-[#8B9F7E] mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fashion Brands Thriving with Nuvi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how fashion retailers are transforming their business with our platform
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {successStories.map((story, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={story.image}
                    alt={story.brand}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-6 text-white text-2xl font-bold">
                    {story.brand}
                  </h3>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-4 italic">"{story.quote}"</p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">{story.author}</p>
                      <p className="text-sm text-gray-500">{story.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-[#8B9F7E] font-bold">{story.metrics.revenue}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#8B9F7E] font-bold">{story.metrics.conversion}</p>
                      <p className="text-xs text-gray-500">Conversion</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#8B9F7E] font-bold">{story.metrics.global}</p>
                      <p className="text-xs text-gray-500">Reach</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fashion-Specific Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Features Designed for Fashion Retail
              </h2>
              <p className="text-gray-600 mb-8">
                We understand fashion. That's why we've built features that address 
                the unique challenges of selling clothing and accessories online.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {fashionFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/features">
                  <Button variant="outline">
                    Explore All Features
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=800&fit=crop"
                alt="Fashion E-commerce Features"
                width={600}
                height={800}
                className="rounded-lg shadow-2xl"
              />
              {/* Feature Callouts */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">Instagram Ready</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">Mobile Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Integration */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <Instagram className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sell Where Your Customers Shop
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seamlessly integrate with Instagram Shopping and turn your social media 
              followers into customers with shoppable posts and stories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <BarChart className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Sync Catalog</h3>
                <p className="text-sm text-gray-600">
                  Automatically sync your products with Instagram Shopping
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Zap className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Tag Products</h3>
                <p className="text-sm text-gray-600">
                  Tag products in posts and stories for instant shopping
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <TrendingUp className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Track Sales</h3>
                <p className="text-sm text-gray-600">
                  Monitor Instagram sales performance in your dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Fashion Brands Choose Nuvi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how we compare to other platforms for fashion e-commerce
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
                  <tr>
                    <td className="px-6 py-4">Fashion-specific templates</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">Limited</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4">Instagram Shopping</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">Extra cost</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Size guides & charts</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">Basic only</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4">Lookbook creator</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">—</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Multi-angle product views</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">Limited</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to Take Your Fashion Brand Online?
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Join thousands of fashion brands already selling in style with Nuvi. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/start-free-trial">
              <Button size="lg" className="bg-white text-[#8B9F7E] hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/10"
              >
                Talk to Fashion Expert
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">
            No credit card required • 30-day free trial • Fashion-focused support
          </p>
        </div>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Fashion E-commerce Platform - Nuvi",
            "description": "E-commerce platform designed for fashion brands and boutiques",
            "url": "https://nuvi.com/fashion-stores",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Nuvi for Fashion",
              "applicationCategory": "BusinessApplication",
              "applicationSubCategory": "E-commerce Platform",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "priceValidUntil": "2025-12-31"
              }
            }
          })
        }}
      />
    </div>
  );
}