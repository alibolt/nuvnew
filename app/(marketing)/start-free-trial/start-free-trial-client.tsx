'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, ArrowRight, Sparkles, Shield, CreditCard, 
  Clock, Users, Store, BarChart, Headphones, Zap,
  TrendingUp, Gift, Award, Star
} from 'lucide-react';

const benefits = [
  {
    icon: CreditCard,
    title: 'No Credit Card Required',
    description: 'Start your trial instantly without payment details',
  },
  {
    icon: Clock,
    title: '30 Full Days Free',
    description: 'Plenty of time to build and test your store',
  },
  {
    icon: Sparkles,
    title: 'All Features Included',
    description: 'Access every feature, no limitations',
  },
  {
    icon: Shield,
    title: 'Risk-Free Guarantee',
    description: 'Cancel anytime, no questions asked',
  },
];

const features = [
  'Drag & drop store builder',
  '50+ professional templates',
  'Unlimited products',
  'Secure payment processing',
  'SEO optimization tools',
  'Mobile responsive design',
  'Real-time analytics',
  '24/7 customer support',
  'Email marketing tools',
  'Multi-currency support',
  'Inventory management',
  'Order tracking',
];

const testimonials = [
  {
    name: 'Jessica Chen',
    role: 'Fashion Boutique Owner',
    content: 'I launched my store in just 3 days during the trial. The drag-and-drop builder made it so easy!',
    rating: 5,
    revenue: '$12,000/month',
  },
  {
    name: 'Marcus Johnson',
    role: 'Electronics Store',
    content: 'The free trial gave me confidence to switch from my old platform. Best decision ever!',
    rating: 5,
    revenue: '$28,000/month',
  },
  {
    name: 'Sofia Rodriguez',
    role: 'Handmade Jewelry',
    content: 'I was skeptical about another platform, but the trial proved Nuvi was exactly what I needed.',
    rating: 5,
    revenue: '$8,500/month',
  },
];

export default function StartFreeTrialClient() {
  const [formData, setFormData] = useState({
    email: '',
    storeName: '',
    fullName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Redirect to registration
    window.location.href = `/register?email=${encodeURIComponent(formData.email)}&store=${encodeURIComponent(formData.storeName)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Gift className="h-4 w-4" />
                Limited Time Offer
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-6">
                Start Your
                <span className="text-[#8B9F7E] block">30-Day Free Trial</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Build your dream online store today. No credit card required, 
                no hidden fees. Just pure e-commerce power at your fingertips.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">10,000+ Active Stores</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm font-medium">SSL Secured</span>
                </div>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm">{benefit.title}</h3>
                        <p className="text-xs text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Form */}
            <div>
              <Card className="shadow-xl border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">Create Your Free Account</h2>
                    <p className="text-gray-600">Get started in less than 60 seconds</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="storeName" className="block text-sm font-medium mb-2">
                        Store Name
                      </label>
                      <Input
                        id="storeName"
                        name="storeName"
                        type="text"
                        value={formData.storeName}
                        onChange={handleChange}
                        placeholder="My Awesome Store"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your store URL will be: {formData.storeName.toLowerCase().replace(/\s+/g, '-') || 'your-store'}.nuvi.com
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-[#8B9F7E] hover:bg-[#7A8B6D] h-12"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Creating Your Trial...'
                      ) : (
                        <>
                          Start Free Trial
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-gray-600 mt-4">
                      By starting your trial, you agree to our{' '}
                      <Link href="/terms" className="text-[#8B9F7E] hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-[#8B9F7E] hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </form>

                  {/* What's Included */}
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="font-semibold mb-3 text-center">What's Included in Your Trial:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {features.slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#8B9F7E] flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center mt-3">
                      <Link href="/features" className="text-[#8B9F7E] text-sm hover:underline">
                        View all features →
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Money Back Guarantee */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 text-sm">
                  <Shield className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="font-medium">30-Day Money-Back Guarantee</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Not satisfied? Get a full refund within 30 days
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Succeed Online
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access all premium features during your trial. No limitations, no hidden restrictions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/features">
              <Button variant="outline" size="lg">
                Explore All Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Join Thousands of Successful Store Owners
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what entrepreneurs are saying about their Nuvi experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#8B9F7E] text-[#8B9F7E]" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8B9F7E] font-bold text-sm">{testimonial.revenue}</p>
                      <p className="text-xs text-gray-500">monthly revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <p className="text-white/80">Active Stores</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$50M+</div>
              <p className="text-white/80">Processed Monthly</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <p className="text-white/80">Uptime SLA</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-white/80">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-2">Do I need a credit card to start?</h3>
                <p className="text-gray-600">
                  No! You can start your 30-day free trial without entering any payment information. 
                  We'll only ask for payment details when you're ready to upgrade.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-2">What happens after the trial ends?</h3>
                <p className="text-gray-600">
                  Your store remains active but becomes view-only. You can upgrade anytime to continue 
                  accepting orders. All your data is preserved for 90 days.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-2">Can I cancel during the trial?</h3>
                <p className="text-gray-600">
                  Yes! You can cancel anytime during your trial period. Since there's no payment on file, 
                  you won't be charged anything.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-2">Are all features really included?</h3>
                <p className="text-gray-600">
                  Absolutely! You get access to every feature Nuvi offers, including premium themes, 
                  advanced analytics, and priority support. No limitations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Online Empire?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join 10,000+ entrepreneurs who started with a free trial and never looked back.
          </p>
          <Button 
            size="lg" 
            className="bg-[#8B9F7E] hover:bg-[#7A8B6D] text-lg px-8 py-6"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Start Your Free Trial Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-gray-600">
            No credit card required • 30-day free trial • Cancel anytime
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
            "name": "Start Free Trial - Nuvi",
            "description": "Start your 30-day free trial with Nuvi e-commerce platform",
            "url": "https://nuvi.com/start-free-trial",
            "mainEntity": {
              "@type": "Offer",
              "name": "30-Day Free Trial",
              "price": "0",
              "priceCurrency": "USD",
              "eligibleDuration": {
                "@type": "QuantitativeValue",
                "value": "30",
                "unitCode": "DAY"
              },
              "seller": {
                "@type": "Organization",
                "name": "Nuvi"
              }
            }
          })
        }}
      />
    </div>
  );
}