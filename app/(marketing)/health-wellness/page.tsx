import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, Shield, Activity, Leaf, Calendar, 
  Globe, Smartphone, Award, Star, CheckCircle2,
  ArrowRight, Users, TrendingUp, BookOpen, Lock, Stethoscope
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'E-commerce for Health & Wellness Brands - Nuvi',
  description: 'Create your health and wellness online store. Perfect for supplements, fitness products, natural remedies, and wellness brands. Subscription management and compliance tools included.',
  keywords: 'health e-commerce, wellness store online, supplement website builder, fitness product store, natural health shop, wellness brand platform',
  openGraph: {
    title: 'Build Your Health & Wellness Store - Nuvi E-commerce',
    description: 'The trusted e-commerce platform for health, wellness, and supplement brands.',
    type: 'website',
    url: 'https://nuvi.com/health-wellness',
    images: [{
      url: 'https://nuvi.com/og-health.png',
      width: 1200,
      height: 630,
      alt: 'Health & Wellness E-commerce with Nuvi',
    }],
  },
  alternates: {
    canonical: 'https://nuvi.com/health-wellness',
  },
};

const features = [
  {
    icon: Shield,
    title: 'Compliance Ready',
    description: 'FDA disclaimers, age verification, and regulatory compliance built-in',
  },
  {
    icon: Calendar,
    title: 'Subscription Management',
    description: 'Recurring orders for vitamins, supplements, and wellness products',
  },
  {
    icon: BookOpen,
    title: 'Education Hub',
    description: 'Blog integration, ingredient glossary, and educational content',
  },
  {
    icon: Stethoscope,
    title: 'Consultation Booking',
    description: 'Schedule virtual consultations and health assessments',
  },
  {
    icon: Activity,
    title: 'Wellness Tracking',
    description: 'Customer portals with progress tracking and goal setting',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'HIPAA-compliant options for health data and consultations',
  },
];

const successStories = [
  {
    brand: 'Pure Vitality Supplements',
    image: 'https://images.unsplash.com/photo-1550831858-3c2581fed470?w=600&h=400&fit=crop',
    quote: 'Subscription revenue grew 400% in the first year. The compliance features saved us!',
    author: 'Dr. Jennifer Moore',
    role: 'Founder',
    metrics: {
      revenue: '+420%',
      subscribers: '15,000+',
      retention: '89%',
    },
  },
  {
    brand: 'Mindful Wellness Co',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    quote: 'The education hub feature helped us build trust and increase conversions by 55%.',
    author: 'Michael Zhang',
    role: 'CEO',
    metrics: {
      revenue: '+350%',
      subscribers: '8,000+',
      retention: '92%',
    },
  },
  {
    brand: 'Natural Health Store',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop',
    quote: 'Finally, an e-commerce platform that understands health compliance requirements.',
    author: 'Sarah Williams',
    role: 'Operations Director',
    metrics: {
      revenue: '+280%',
      subscribers: '12,000+',
      retention: '85%',
    },
  },
];

const healthFeatures = [
  'Ingredient transparency',
  'Dosage calculators',
  'Drug interaction warnings',
  'Certificate display (GMP, NSF)',
  'Auto-ship discounts',
  'Bundle recommendations',
  'Health quiz builder',
  'Practitioner portals',
  'Lab result integration',
  'Wellness goal tracking',
  'Review authenticity',
  'Referral programs',
];

export default function HealthWellnessPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"></div>
        <div className="relative container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="h-4 w-4" />
                For Health & Wellness
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-6">
                Wellness Commerce
                <span className="block text-[#8B9F7E] mt-2">Made Simple</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                The e-commerce platform trusted by health and wellness brands. 
                Compliance-ready, subscription-focused, and built for growth.
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
                    Watch Health Demo
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-green-200 to-emerald-200 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Trusted by 3,500+ wellness brands</p>
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
                    src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=500&fit=crop"
                    alt="Health Store Example 1"
                    width={400}
                    height={500}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=300&fit=crop"
                    alt="Health Store Example 2"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=400&h=300&fit=crop"
                    alt="Health Store Example 3"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=500&fit=crop"
                    alt="Health Store Example 4"
                    width={400}
                    height={500}
                    className="rounded-lg shadow-xl"
                  />
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-xl p-4 z-10">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-[#8B9F7E]" />
                  <div>
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-sm text-gray-600">Retention Rate</p>
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
              Features for Health & Wellness Success
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to build trust, ensure compliance, and grow your wellness brand
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Wellness Brands Thriving with Nuvi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how health and wellness businesses are transforming their online presence
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
                      <p className="text-[#8B9F7E] font-bold">{story.metrics.subscribers}</p>
                      <p className="text-xs text-gray-500">Subscribers</p>
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

      {/* Health-Specific Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for Health Compliance
              </h2>
              <p className="text-gray-600 mb-8">
                Navigate health regulations with confidence. Our platform includes all the 
                features you need to stay compliant while growing your wellness business.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {healthFeatures.map((feature, index) => (
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
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=800&fit=crop"
                alt="Health E-commerce Features"
                width={600}
                height={800}
                className="rounded-lg shadow-2xl"
              />
              {/* Feature Callouts */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">FDA Compliant</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">Auto-Ship Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Focus */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <Calendar className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Subscription-First Platform
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Build recurring revenue with flexible subscription options. Perfect for 
              vitamins, supplements, and wellness products.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Users className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Flexible Plans</h3>
                <p className="text-sm text-gray-600">
                  Weekly, monthly, or custom delivery schedules
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Award className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Loyalty Rewards</h3>
                <p className="text-sm text-gray-600">
                  Points, discounts, and VIP tiers for subscribers
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <TrendingUp className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Smart Analytics</h3>
                <p className="text-sm text-gray-600">
                  Track retention, LTV, and churn metrics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Hub */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Educate to Elevate Sales
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Build trust through education. Create content hubs, ingredient guides, 
              and wellness resources that convert browsers into buyers.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8 text-center">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">55%</div>
                  <p className="text-gray-700">Higher Conversion</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">3.5x</div>
                  <p className="text-gray-700">Time on Site</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">72%</div>
                  <p className="text-gray-700">Trust Score</p>
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
            Ready to Grow Your Wellness Brand?
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Join thousands of health and wellness brands already thriving with Nuvi. 
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
                Talk to Wellness Expert
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">
            No credit card required • 30-day free trial • Health-focused support
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
            "name": "Health & Wellness E-commerce Platform - Nuvi",
            "description": "E-commerce platform designed for health, wellness, and supplement brands",
            "url": "https://nuvi.com/health-wellness",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Nuvi for Health",
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