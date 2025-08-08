import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Coffee, ShoppingBag, Truck, Clock, Leaf, 
  Globe, Smartphone, ThermometerSun, Star, CheckCircle2,
  ArrowRight, Users, Calendar, Award, Timer, Package
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'E-commerce for Food & Beverage Businesses - Nuvi',
  description: 'Sell food and beverages online with Nuvi. Perfect for restaurants, cafes, bakeries, and gourmet stores. Order management, delivery tracking, and fresh inventory tools.',
  keywords: 'food e-commerce, restaurant online ordering, bakery website, food delivery platform, beverage store online, gourmet food website',
  openGraph: {
    title: 'Sell Food & Beverages Online - Nuvi E-commerce',
    description: 'The complete e-commerce platform for food retailers, restaurants, and beverage brands.',
    type: 'website',
    url: 'https://nuvi.com/food-beverage',
    images: [{
      url: 'https://nuvi.com/og-food.png',
      width: 1200,
      height: 630,
      alt: 'Food & Beverage E-commerce with Nuvi',
    }],
  },
  alternates: {
    canonical: 'https://nuvi.com/food-beverage',
  },
};

const features = [
  {
    icon: Clock,
    title: 'Order Scheduling',
    description: 'Accept pre-orders, schedule deliveries, and manage pickup times effortlessly',
  },
  {
    icon: ThermometerSun,
    title: 'Fresh Inventory',
    description: 'Track expiration dates, manage perishables, and automate stock rotation',
  },
  {
    icon: Truck,
    title: 'Delivery Zones',
    description: 'Set delivery areas, calculate shipping by distance, and optimize routes',
  },
  {
    icon: Coffee,
    title: 'Menu Management',
    description: 'Easy menu updates, modifiers, special requests, and dietary filters',
  },
  {
    icon: Calendar,
    title: 'Subscription Orders',
    description: 'Weekly meal plans, coffee subscriptions, and recurring deliveries',
  },
  {
    icon: Leaf,
    title: 'Dietary Labels',
    description: 'Highlight vegan, gluten-free, organic, and allergen information',
  },
];

const successStories = [
  {
    brand: 'Artisan Bakery Co',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
    quote: 'Online orders now make up 60% of our revenue. The scheduling system is perfect!',
    author: 'Emma Thompson',
    role: 'Owner',
    metrics: {
      revenue: '+450%',
      orders: '+300/day',
      waste: '-40%',
    },
  },
  {
    brand: 'Fresh Meal Prep',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
    quote: 'Subscription management made our weekly meal prep business scalable.',
    author: 'Carlos Rodriguez',
    role: 'CEO',
    metrics: {
      revenue: '+580%',
      orders: '+500/day',
      waste: '-55%',
    },
  },
  {
    brand: 'Gourmet Coffee Roasters',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
    quote: 'The subscription feature doubled our customer lifetime value in 6 months.',
    author: 'Lisa Park',
    role: 'Founder',
    metrics: {
      revenue: '+320%',
      orders: '+200/day',
      waste: '-30%',
    },
  },
];

const foodFeatures = [
  'Nutritional information display',
  'Recipe & pairing suggestions',
  'Batch & lot tracking',
  'Temperature-controlled logistics',
  'Special dietary filters',
  'Portion size options',
  'Gift basket builder',
  'Catering order forms',
  'Loyalty rewards program',
  'Multi-location inventory',
  'Seasonal menu management',
  'Real-time order tracking',
];

export default function FoodBeveragePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50"></div>
        <div className="relative container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Coffee className="h-4 w-4" />
                For Food & Beverage
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-6">
                Serve Your Food
                <span className="block text-[#8B9F7E] mt-2">Online</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                The e-commerce platform designed for food businesses. Fresh inventory 
                management, order scheduling, and everything you need to sell food online.
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
                    Watch Food Demo
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-yellow-200 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Trusted by 4,000+ food businesses</p>
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
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=500&fit=crop"
                    alt="Food Store Example 1"
                    width={400}
                    height={500}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop"
                    alt="Food Store Example 2"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"
                    alt="Food Store Example 3"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-xl"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=500&fit=crop"
                    alt="Food Store Example 4"
                    width={400}
                    height={500}
                    className="rounded-lg shadow-xl"
                  />
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-xl p-4 z-10">
                <div className="flex items-center gap-3">
                  <Timer className="h-8 w-8 text-[#8B9F7E]" />
                  <div>
                    <p className="text-2xl font-bold">15 min</p>
                    <p className="text-sm text-gray-600">Avg. Order Time</p>
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
              Features for Food Success
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage orders, inventory, and deliveries for your food business
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Food Businesses Thriving with Nuvi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how food retailers are growing their business online
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
                      <p className="text-[#8B9F7E] font-bold">{story.metrics.orders}</p>
                      <p className="text-xs text-gray-500">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#8B9F7E] font-bold">{story.metrics.waste}</p>
                      <p className="text-xs text-gray-500">Food Waste</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Food-Specific Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for Food Businesses
              </h2>
              <p className="text-gray-600 mb-8">
                We understand the unique challenges of selling food online. From managing 
                perishable inventory to coordinating deliveries, we've got you covered.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {foodFeatures.map((feature, index) => (
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
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop"
                alt="Food E-commerce Features"
                width={600}
                height={800}
                className="rounded-lg shadow-2xl"
              />
              {/* Feature Callouts */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">Order Scheduling</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">Smart Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fresh Inventory Management */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <ThermometerSun className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fresh Inventory Management
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Keep track of expiration dates, manage stock rotation, and reduce food waste 
              with our intelligent inventory system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Timer className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Expiry Tracking</h3>
                <p className="text-sm text-gray-600">
                  Automatic alerts for products nearing expiration
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Package className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">FIFO System</h3>
                <p className="text-sm text-gray-600">
                  First-in-first-out inventory rotation
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <Award className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Quality Control</h3>
                <p className="text-sm text-gray-600">
                  Track temperature logs and quality checks
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription & Meal Plans */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Subscription & Meal Plans
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Build recurring revenue with meal subscriptions, weekly deliveries, 
              and custom meal plans.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl p-8 text-center">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">78%</div>
                  <p className="text-gray-700">Customer Retention</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">3.2x</div>
                  <p className="text-gray-700">Higher LTV</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#8B9F7E] mb-2">45%</div>
                  <p className="text-gray-700">Revenue from Subs</p>
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
            Ready to Grow Your Food Business Online?
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Join thousands of food businesses already thriving with Nuvi. 
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
                Talk to Food Expert
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">
            No credit card required • 30-day free trial • Food-focused support
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
            "name": "Food & Beverage E-commerce Platform - Nuvi",
            "description": "E-commerce platform designed for food businesses, restaurants, and beverage brands",
            "url": "https://nuvi.com/food-beverage",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Nuvi for Food",
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