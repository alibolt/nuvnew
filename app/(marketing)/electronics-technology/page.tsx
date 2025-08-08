import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Cpu, Smartphone, Shield, Zap, BarChart3, 
  Globe, Package, Wrench, Star, CheckCircle2,
  ArrowRight, Users, TrendingUp, Headphones, Laptop, Camera
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'E-commerce for Electronics & Technology Stores - Nuvi',
  description: 'Build your electronics and tech store online. Perfect for computer shops, phone retailers, and gadget stores. Advanced product specs, comparison tools, and tech support features.',
  keywords: 'electronics e-commerce, tech store builder, computer shop online, phone store website, gadget retail platform, electronics website builder',
  openGraph: {
    title: 'Launch Your Electronics Store Online - Nuvi E-commerce',
    description: 'The complete e-commerce platform for electronics retailers and technology stores.',
    type: 'website',
    url: 'https://nuvi.com/electronics-technology',
    images: [{
      url: 'https://nuvi.com/og-electronics.png',
      width: 1200,
      height: 630,
      alt: 'Electronics E-commerce with Nuvi',
    }],
  },
  alternates: {
    canonical: 'https://nuvi.com/electronics-technology',
  },
};

const features = [
  {
    icon: Cpu,
    title: 'Technical Specifications',
    description: 'Detailed spec sheets, comparison tables, and technical documentation support',
  },
  {
    icon: BarChart3,
    title: 'Product Comparison',
    description: 'Let customers compare multiple products side-by-side with smart filtering',
  },
  {
    icon: Package,
    title: 'Bundle Builder',
    description: 'Create custom PC builds, accessory bundles, and package deals',
  },
  {
    icon: Wrench,
    title: 'Warranty Management',
    description: 'Track warranties, extended protection plans, and service contracts',
  },
  {
    icon: Headphones,
    title: 'Tech Support Integration',
    description: 'Built-in support ticketing, live chat, and knowledge base',
  },
  {
    icon: Shield,
    title: 'Trade-In Program',
    description: 'Accept trade-ins with automated valuation and credit system',
  },
];

const successStories = [
  {
    brand: 'TechHub Electronics',
    image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=600&h=400&fit=crop',
    quote: 'The comparison tools increased our conversion rate by 65%. Customers love it!',
    author: 'Michael Chen',
    role: 'CEO',
    metrics: {
      revenue: '+380%',
      conversion: '+65%',
      aov: '+$125',
    },
  },
  {
    brand: 'Mobile World',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop',
    quote: 'Trade-in program brought in 40% more customers. Game-changing feature!',
    author: 'Sarah Ahmed',
    role: 'Operations Director',
    metrics: {
      revenue: '+290%',
      conversion: '+48%',
      aov: '+$85',
    },
  },
  {
    brand: 'Gaming Central',
    image: 'https://images.unsplash.com/photo-1593152167544-085d3b9c4938?w=600&h=400&fit=crop',
    quote: 'PC builder tool is amazing. Customers spend 3x more time on our site now.',
    author: 'David Kim',
    role: 'Founder',
    metrics: {
      revenue: '+420%',
      conversion: '+72%',
      aov: '+$200',
    },
  },
];

const techFeatures = [
  'Spec comparison matrix',
  'Compatibility checker',
  'Stock availability alerts',
  'Pre-order management',
  'Serial number tracking',
  'Digital download delivery',
  'RMA processing',
  'B2B wholesale portal',
  'Price match guarantee',
  'Installation booking',
  'Extended warranty sales',
  'Financing options',
];

export default function ElectronicsTechnologyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="relative container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Cpu className="h-4 w-4" />
                For Tech Retailers
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-6">
                Power Your Tech Store
                <span className="block text-[#8B9F7E] mt-2">Online</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                The e-commerce platform built for electronics retailers. Advanced features, 
                technical tools, and everything you need to sell tech online.
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
                    Watch Tech Demo
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Trusted by 2,500+ tech stores</p>
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
                    src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=500&fit=crop"
                    alt="Electronics Store Example 1"
                    width={400}
                    height={500}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&h=300&fit=crop"
                    alt="Electronics Store Example 2"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop"
                    alt="Electronics Store Example 3"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=500&fit=crop"
                    alt="Electronics Store Example 4"
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
                    <p className="text-2xl font-bold">+340%</p>
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
              Built for Electronics Retail
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for selling technology products online
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tech Stores Thriving with Nuvi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how electronics retailers are transforming their business
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
                      <p className="text-[#8B9F7E] font-bold">{story.metrics.aov}</p>
                      <p className="text-xs text-gray-500">AOV</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech-Specific Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Everything Tech Retailers Need
              </h2>
              <p className="text-gray-600 mb-8">
                We understand electronics retail. That's why we've built features that 
                address the unique challenges of selling technology products online.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {techFeatures.map((feature, index) => (
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
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=800&fit=crop"
                alt="Tech E-commerce Features"
                width={600}
                height={800}
                className="rounded-lg shadow-2xl"
              />
              {/* Feature Callouts */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">Comparison Tool</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">Bundle Builder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Comparison Feature */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <BarChart3 className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Advanced Product Comparison
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Help customers make informed decisions with side-by-side comparisons, 
              technical specifications, and smart recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Laptop className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Spec Tables</h3>
                <p className="text-sm text-gray-600">
                  Detailed technical specifications in easy-to-read format
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Camera className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Visual Compare</h3>
                <p className="text-sm text-gray-600">
                  Side-by-side product images and 360° views
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Zap className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Smart Filters</h3>
                <p className="text-sm text-gray-600">
                  Filter by specs, price, brand, and compatibility
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PC Builder Tool */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              PC Builder & Bundle Creator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Let customers build custom PCs or create their perfect tech setup with our 
              interactive builder tools.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 text-center">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">47%</div>
                  <p className="text-gray-700">Higher AOV</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">3x</div>
                  <p className="text-gray-700">Time on Site</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">-32%</div>
                  <p className="text-gray-700">Return Rate</p>
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
            Ready to Power Up Your Tech Business?
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Join thousands of electronics retailers already selling smarter with Nuvi. 
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
                Talk to Tech Expert
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">
            No credit card required • 30-day free trial • Tech-focused support
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
            "name": "Electronics & Technology E-commerce Platform - Nuvi",
            "description": "E-commerce platform designed for electronics retailers and technology stores",
            "url": "https://nuvi.com/electronics-technology",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Nuvi for Electronics",
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