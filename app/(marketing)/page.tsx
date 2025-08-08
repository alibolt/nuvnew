'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, ShoppingCart, Brush, BarChart, Sparkles, Zap, Shield,
  Globe, Rocket, Users, CreditCard, Package, Headphones, ArrowRight,
  TrendingUp, Award, Clock, CheckCircle2, Star, MessageSquare
} from 'lucide-react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    setEmail('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with enhanced SEO content */}
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="container mx-auto text-center px-4 md:px-6">
            <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Launching Q1 2025
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-4">
              Create Your Own E-commerce Store
              <br />
              <span className="text-[#8B9F7E]">in Minutes, Not Months</span>
            </h1>
            
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 md:text-xl mb-8">
              Nuvi is the all-in-one e-commerce platform that empowers entrepreneurs to build, customize, and scale their online business with AI-powered tools and no-code simplicity.
            </p>

            {/* Email Signup Form */}
            <div className="max-w-md mx-auto">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12"
                    disabled={isSubmitting}
                    aria-label="Email address"
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-[#8B9F7E] hover:bg-[#7A8B6D] h-12 px-8"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Joining...' : 'Get Early Access'}
                  </Button>
                </form>
              ) : (
                <div className="bg-[#8B9F7E]/10 border border-[#8B9F7E]/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#8B9F7E] flex-shrink-0" />
                  <p className="text-[#8B9F7E] text-sm">
                    Thanks for joining! We'll notify you as soon as we launch.
                  </p>
                </div>
              )}
              <p className="mt-3 text-sm text-gray-500">
                Join 2,847 entrepreneurs waiting for launch
              </p>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#8B9F7E]" />
                <span className="text-sm text-gray-600">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#8B9F7E]" />
                <span className="text-sm text-gray-600">PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#8B9F7E]" />
                <span className="text-sm text-gray-600">Global CDN</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  Why Choose Nuvi for Your E-commerce Business?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">No Technical Skills Required</h3>
                      <p className="text-gray-600">Build professional online stores without writing a single line of code</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">All-in-One Solution</h3>
                      <p className="text-gray-600">Everything you need from hosting to payments in one platform</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Scale Without Limits</h3>
                      <p className="text-gray-600">From your first sale to enterprise-level operations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">AI-Powered Growth</h3>
                      <p className="text-gray-600">Smart recommendations and automation to boost your sales</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-[#8B9F7E]/20 to-[#8B9F7E]/10 rounded-2xl flex items-center justify-center">
                  <Image
                    src="/nuvi-banner.svg"
                    alt="Nuvi E-commerce Platform Dashboard Preview"
                    width={600}
                    height={400}
                    className="rounded-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid with Enhanced Content */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Powerful Features for Modern E-commerce</h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                Everything you need to create, manage, and grow your online store successfully
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card className="border-gray-200 hover:border-[#8B9F7E]/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#8B9F7E]/10 rounded-lg">
                      <Brush className="h-6 w-6 text-[#8B9F7E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">Visual Theme Studio</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Design beautiful stores with our drag-and-drop builder. Choose from 50+ professional templates and customize every detail.
                      </p>
                      <Link href="#" className="text-sm text-[#8B9F7E] font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                        Learn more <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200 hover:border-[#8B9F7E]/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#8B9F7E]/10 rounded-lg">
                      <Package className="h-6 w-6 text-[#8B9F7E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">Product Management</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Manage unlimited products with variants, inventory tracking, and bulk import/export capabilities.
                      </p>
                      <Link href="#" className="text-sm text-[#8B9F7E] font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                        Learn more <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200 hover:border-[#8B9F7E]/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#8B9F7E]/10 rounded-lg">
                      <CreditCard className="h-6 w-6 text-[#8B9F7E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">Secure Payments</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Accept payments globally with 100+ payment methods. Built-in fraud protection and PCI compliance.
                      </p>
                      <Link href="#" className="text-sm text-[#8B9F7E] font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                        Learn more <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200 hover:border-[#8B9F7E]/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#8B9F7E]/10 rounded-lg">
                      <BarChart className="h-6 w-6 text-[#8B9F7E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">Analytics & Reports</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Real-time insights into sales, traffic, and customer behavior. Make data-driven decisions to grow faster.
                      </p>
                      <Link href="#" className="text-sm text-[#8B9F7E] font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                        Learn more <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200 hover:border-[#8B9F7E]/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#8B9F7E]/10 rounded-lg">
                      <Rocket className="h-6 w-6 text-[#8B9F7E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">SEO Optimization</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Built-in SEO tools with automatic sitemap generation, meta tags, and schema markup for better rankings.
                      </p>
                      <Link href="#" className="text-sm text-[#8B9F7E] font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                        Learn more <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200 hover:border-[#8B9F7E]/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#8B9F7E]/10 rounded-lg">
                      <Sparkles className="h-6 w-6 text-[#8B9F7E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">AI Assistant</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Generate product descriptions, blog posts, and marketing copy with our AI-powered content assistant.
                      </p>
                      <Link href="#" className="text-sm text-[#8B9F7E] font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                        Learn more <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Perfect for Every Business Type</h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                Whether you're selling fashion, electronics, handmade goods, or digital products, Nuvi adapts to your needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👗</span>
                </div>
                <h3 className="font-semibold mb-2">Fashion & Apparel</h3>
                <p className="text-sm text-gray-600">Showcase collections with stunning galleries and size guides</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💻</span>
                </div>
                <h3 className="font-semibold mb-2">Electronics</h3>
                <p className="text-sm text-gray-600">Compare specs and features with advanced product filters</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-semibold mb-2">Handmade & Crafts</h3>
                <p className="text-sm text-gray-600">Tell your story and connect with customers personally</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-semibold mb-2">Digital Products</h3>
                <p className="text-sm text-gray-600">Sell downloads, courses, and subscriptions effortlessly</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 md:py-24 bg-[#8B9F7E]/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#8B9F7E] mb-2">99.9%</div>
                <p className="text-gray-600">Uptime Guarantee</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#8B9F7E] mb-2">50+</div>
                <p className="text-gray-600">Professional Templates</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#8B9F7E] mb-2">100+</div>
                <p className="text-gray-600">Payment Methods</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#8B9F7E] mb-2">24/7</div>
                <p className="text-gray-600">Customer Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Preview */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Early Feedback from Beta Users</h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                See what entrepreneurs are saying about their experience with Nuvi
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#8B9F7E] text-[#8B9F7E]" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Setting up my store took less than an hour. The Theme Studio is incredibly intuitive and the results look professional."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-sm">Sarah Chen</p>
                      <p className="text-xs text-gray-500">Fashion Boutique Owner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#8B9F7E] text-[#8B9F7E]" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "The AI assistant helped me write product descriptions that actually convert. My sales increased by 40% in the first month."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-sm">Michael Torres</p>
                      <p className="text-xs text-gray-500">Electronics Store Owner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#8B9F7E] text-[#8B9F7E]" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Finally, an e-commerce platform that grows with my business. Started small and now handling thousands of orders monthly."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-sm">Emma Wilson</p>
                      <p className="text-xs text-gray-500">Handmade Jewelry Artist</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                Get answers to common questions about Nuvi
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#8B9F7E]" />
                  Do I need technical skills to use Nuvi?
                </h3>
                <p className="text-gray-600">
                  No, Nuvi is designed for everyone. Our visual builder and AI assistant help you create professional stores without any coding knowledge.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#8B9F7E]" />
                  What's included in the pricing?
                </h3>
                <p className="text-gray-600">
                  All plans include hosting, SSL certificate, unlimited bandwidth, customer support, and access to all features. No hidden fees or transaction charges.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#8B9F7E]" />
                  Can I migrate my existing store?
                </h3>
                <p className="text-gray-600">
                  Yes! We offer free migration assistance for stores coming from Shopify, WooCommerce, and other major platforms.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#8B9F7E]" />
                  Is there a free trial?
                </h3>
                <p className="text-gray-600">
                  Early access users get a 30-day free trial with full access to all features. No credit card required to start.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D]">
          <div className="container mx-auto text-center px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Ready to Start Your E-commerce Journey?
            </h2>
            <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
              Join thousands of entrepreneurs who are building their dream stores with Nuvi. Get early access and exclusive launch benefits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-[#8B9F7E] bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Early Access
              </a>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white border-2 border-white/30 rounded-lg hover:bg-white/10 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/80">
              ✓ 30-day free trial &nbsp;&nbsp; ✓ No credit card required &nbsp;&nbsp; ✓ Cancel anytime
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}