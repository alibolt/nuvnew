import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, Heart, Camera, ShoppingBag, TrendingUp, 
  Globe, Smartphone, Instagram, Star, CheckCircle2,
  ArrowRight, Users, Palette, Shield, Youtube, Flower2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'E-commerce for Beauty & Cosmetics Brands - Nuvi',
  description: 'Create stunning beauty and cosmetics online stores. Perfect for makeup brands, skincare lines, and beauty retailers. Instagram integration, influencer tools, and more.',
  keywords: 'beauty e-commerce, cosmetics online store, makeup store builder, skincare website, beauty brand platform, cosmetics retail',
  openGraph: {
    title: 'Build Your Beauty Empire Online - Nuvi E-commerce',
    description: 'The perfect e-commerce platform for beauty brands, cosmetics retailers, and skincare businesses.',
    type: 'website',
    url: 'https://nuvi.com/beauty-cosmetics',
    images: [{
      url: 'https://nuvi.com/og-beauty.png',
      width: 1200,
      height: 630,
      alt: 'Beauty E-commerce with Nuvi',
    }],
  },
  alternates: {
    canonical: 'https://nuvi.com/beauty-cosmetics',
  },
};

const features = [
  {
    icon: Camera,
    title: 'Beauty-First Design',
    description: 'Gorgeous templates designed specifically for beauty brands with high-impact visuals',
  },
  {
    icon: Palette,
    title: 'Virtual Try-On',
    description: 'AR-powered virtual makeup try-on to boost conversions and reduce returns',
  },
  {
    icon: Instagram,
    title: 'Influencer Tools',
    description: 'Built-in affiliate tracking, influencer storefronts, and commission management',
  },
  {
    icon: Heart,
    title: 'Subscription Box',
    description: 'Recurring orders for beauty boxes, skincare routines, and loyalty programs',
  },
  {
    icon: Youtube,
    title: 'Tutorial Integration',
    description: 'Embed makeup tutorials and how-to videos directly on product pages',
  },
  {
    icon: Shield,
    title: 'Ingredient Lists',
    description: 'Detailed ingredient displays with allergen warnings and certifications',
  },
];

const successStories = [
  {
    brand: 'Glow Beauty Co',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop',
    quote: 'Virtual try-on increased our conversion rate by 85%. Game changer for online beauty sales!',
    author: 'Jessica Lee',
    role: 'Founder & CEO',
    metrics: {
      revenue: '+320%',
      conversion: '+85%',
      retention: '92%',
    },
  },
  {
    brand: 'Pure Skincare Lab',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop',
    quote: 'The subscription feature transformed our business model. 70% of customers now subscribe!',
    author: 'Dr. Sarah Chen',
    role: 'Founder',
    metrics: {
      revenue: '+450%',
      conversion: '+65%',
      retention: '88%',
    },
  },
  {
    brand: 'Luxe Cosmetics',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=400&fit=crop',
    quote: 'Influencer integration helped us reach millions. Sales from influencers up 200%!',
    author: 'Maria Santos',
    role: 'Marketing Director',
    metrics: {
      revenue: '+280%',
      conversion: '+70%',
      retention: '85%',
    },
  },
];

const beautyFeatures = [
  'Shade finder tools',
  'Skin type quiz builder',
  'Before/after galleries',
  'Product bundle builder',
  'Sample size options',
  'Loyalty points system',
  'Beauty advisor chat',
  'Ingredient glossary',
  'Cruelty-free badges',
  'Vegan/organic filters',
  'Gift with purchase',
  'Limited edition alerts',
];

export default function BeautyCosmeticsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50"></div>
        <div className="relative container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Flower2 className="h-4 w-4" />
                For Beauty Brands
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-6">
                Beauty E-commerce
                <span className="block text-[#8B9F7E] mt-2">That Glows</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                The e-commerce platform built for beauty brands. Stunning designs, 
                powerful features, and everything you need to shine online.
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
                    Watch Beauty Demo
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Trusted by 3,000+ beauty brands</p>
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
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop"
                    alt="Beauty Store Example 1"
                    width={400}
                    height={500}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=400&h=300&fit=crop"
                    alt="Beauty Store Example 2"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400&h=300&fit=crop"
                    alt="Beauty Store Example 3"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400&h=500&fit=crop"
                    alt="Beauty Store Example 4"
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
                    <p className="text-2xl font-bold">+320%</p>
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
              Features Designed for Beauty Success
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to create an engaging beauty shopping experience
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Beauty Brands Thriving with Nuvi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how beauty businesses are transforming their online presence
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
                      <p className="text-[#8B9F7E] font-bold">{story.metrics.retention}</p>
                      <p className="text-xs text-gray-500">Retention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Beauty-Specific Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for Beauty Retail
              </h2>
              <p className="text-gray-600 mb-8">
                We understand beauty. That's why we've built features that address 
                the unique needs of cosmetics and skincare brands.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {beautyFeatures.map((feature, index) => (
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
                src="https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=600&h=800&fit=crop"
                alt="Beauty E-commerce Features"
                width={600}
                height={800}
                className="rounded-lg shadow-2xl"
              />
              {/* Feature Callouts */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">AR Try-On</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">Subscription Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Influencer Integration */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <Instagram className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Influencer Marketing Built-In
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Partner with beauty influencers and track every sale with our 
              integrated affiliate system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Users className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Custom Storefronts</h3>
                <p className="text-sm text-gray-600">
                  Give influencers their own branded pages with curated products
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <ShoppingBag className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Affiliate Tracking</h3>
                <p className="text-sm text-gray-600">
                  Track sales, calculate commissions, and automate payouts
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <TrendingUp className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Performance Analytics</h3>
                <p className="text-sm text-gray-600">
                  See which influencers drive the most sales and engagement
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Try-On */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Virtual Try-On Technology
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Let customers try makeup virtually before buying. Reduce returns and boost confidence.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-8 text-center">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">85%</div>
                  <p className="text-gray-700">Higher Conversion</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">-60%</div>
                  <p className="text-gray-700">Fewer Returns</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">3x</div>
                  <p className="text-gray-700">Engagement Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to Make Your Beauty Brand Shine Online?
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Join thousands of beauty brands already selling with style on Nuvi. 
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
                Talk to Beauty Expert
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">
            No credit card required • 30-day free trial • Beauty-focused support
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
            "name": "Beauty & Cosmetics E-commerce Platform - Nuvi",
            "description": "E-commerce platform designed for beauty brands and cosmetics retailers",
            "url": "https://nuvi.com/beauty-cosmetics",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Nuvi for Beauty",
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