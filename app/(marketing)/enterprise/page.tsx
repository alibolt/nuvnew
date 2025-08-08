import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, Shield, Zap, Globe, Users, BarChart,
  Lock, Cloud, Headphones, CheckCircle2, ArrowRight,
  Server, Key, FileCheck, Settings, TrendingUp, Award
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Enterprise E-commerce Solutions - Nuvi Platform',
  description: 'Enterprise-grade e-commerce platform with advanced security, custom integrations, dedicated support, and unlimited scalability for large businesses.',
  keywords: 'enterprise e-commerce, enterprise online store, corporate e-commerce platform, b2b e-commerce, wholesale platform, enterprise retail',
  openGraph: {
    title: 'Nuvi Enterprise - E-commerce at Scale',
    description: 'Purpose-built for large organizations. Advanced features, security, and support.',
    type: 'website',
    url: 'https://nuvi.com/enterprise',
    images: [{
      url: 'https://nuvi.com/og-enterprise.png',
      width: 1200,
      height: 630,
      alt: 'Nuvi Enterprise Solutions',
    }],
  },
  alternates: {
    canonical: 'https://nuvi.com/enterprise',
  },
};

const enterpriseFeatures = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 certified, GDPR compliant, PCI DSS Level 1, and custom security protocols',
  },
  {
    icon: Server,
    title: 'Dedicated Infrastructure',
    description: 'Isolated cloud environments with 99.99% uptime SLA and global CDN',
  },
  {
    icon: Key,
    title: 'Advanced Access Control',
    description: 'SSO, SAML, role-based permissions, and multi-factor authentication',
  },
  {
    icon: Settings,
    title: 'Custom Integrations',
    description: 'API-first architecture with unlimited integrations to your existing systems',
  },
  {
    icon: Users,
    title: 'Dedicated Success Team',
    description: '24/7 priority support with dedicated account manager and technical team',
  },
  {
    icon: FileCheck,
    title: 'Compliance Ready',
    description: 'Meet industry regulations with built-in compliance tools and reporting',
  },
];

const stats = [
  { value: '500+', label: 'Enterprise Clients' },
  { value: '$2B+', label: 'Annual GMV' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '150M+', label: 'Orders Processed' },
];

const capabilities = [
  'Unlimited products & SKUs',
  'Multi-store management',
  'B2B & B2C capabilities',
  'Advanced pricing rules',
  'Custom workflows',
  'Bulk operations',
  'API rate limits removed',
  'White-label options',
  'Custom reporting',
  'Advanced analytics',
  'A/B testing tools',
  'Headless commerce',
];

const integrations = [
  { name: 'SAP', category: 'ERP' },
  { name: 'Oracle', category: 'ERP' },
  { name: 'Salesforce', category: 'CRM' },
  { name: 'Microsoft Dynamics', category: 'CRM' },
  { name: 'NetSuite', category: 'ERP' },
  { name: 'HubSpot', category: 'Marketing' },
  { name: 'Adobe Commerce', category: 'Marketing' },
  { name: 'Workday', category: 'HR' },
];

const caseStudies = [
  {
    company: 'Global Fashion Corp',
    industry: 'Fashion Retail',
    challenge: 'Needed to consolidate 15 regional stores into one platform',
    solution: 'Unified multi-store architecture with regional customization',
    results: {
      efficiency: '+60%',
      revenue: '+$45M',
      time: '90 days',
    },
  },
  {
    company: 'TechGear Industries',
    industry: 'Electronics',
    challenge: 'Complex B2B and B2C requirements with 100K+ SKUs',
    solution: 'Custom pricing engine with advanced catalog management',
    results: {
      efficiency: '+75%',
      revenue: '+$120M',
      time: '120 days',
    },
  },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Building2 className="h-4 w-4" />
                Enterprise Solutions
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">
                E-commerce Built for
                <span className="block text-[#8B9F7E] mt-2">Enterprise Scale</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Powerful, secure, and infinitely scalable. The e-commerce platform 
                trusted by Fortune 500 companies and industry leaders worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/contact">
                  <Button size="lg" className="bg-[#8B9F7E] hover:bg-[#7A8B6D] text-white">
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Request Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm">SOC 2 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm">ISO 27001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#8B9F7E]" />
                  <span className="text-sm">GDPR Compliant</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
                <h3 className="text-xl font-semibold mb-6">Trusted by Industry Leaders</h3>
                <div className="grid grid-cols-2 gap-6">
                  {['Fortune 500 Retailer', 'Global Fashion Brand', 'Tech Giant', 'Luxury Group'].map((company, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 text-center">
                      <div className="h-12 bg-gray-600 rounded mb-2"></div>
                      <p className="text-xs text-gray-400">{company}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[#8B9F7E]">$2B+</p>
                      <p className="text-xs text-gray-400">Annual GMV</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#8B9F7E]">500+</p>
                      <p className="text-xs text-gray-400">Enterprise Clients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-[#8B9F7E] mb-2">{stat.value}</div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built from the ground up to meet the demanding needs of large organizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {enterpriseFeatures.map((feature, index) => {
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

      {/* Capabilities */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Unlimited Capabilities
              </h2>
              <p className="text-gray-600 mb-8">
                Remove all limitations and unlock the full potential of your e-commerce operations 
                with enterprise-exclusive features and capabilities.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] flex-shrink-0" />
                    <span className="text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-8">
              <h3 className="text-xl font-semibold mb-6">Enterprise Architecture</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Cloud className="h-6 w-6 text-[#8B9F7E] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Global Infrastructure</h4>
                    <p className="text-sm text-gray-600">
                      Multi-region deployment with automatic failover and data replication
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="h-6 w-6 text-[#8B9F7E] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Infinite Scalability</h4>
                    <p className="text-sm text-gray-600">
                      Auto-scaling infrastructure that handles millions of concurrent users
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <BarChart className="h-6 w-6 text-[#8B9F7E] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Real-Time Analytics</h4>
                    <p className="text-sm text-gray-600">
                      Advanced analytics with custom dashboards and data warehousing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Ecosystem */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Seamless Integration Ecosystem
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with your existing enterprise systems through our extensive integration network
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-16 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{integration.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              + 100s more integrations available through our API
            </p>
            <Link href="/integrations">
              <Button variant="outline">
                View All Integrations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise Success Stories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how leading organizations transform their e-commerce with Nuvi
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {caseStudies.map((study, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{study.company}</h3>
                      <p className="text-gray-600 mb-4">{study.industry}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Challenge</h4>
                          <p className="text-gray-600">{study.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Solution</h4>
                          <p className="text-gray-600">{study.solution}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold mb-4">Results</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Efficiency Gain</span>
                          <span className="text-2xl font-bold text-[#8B9F7E]">{study.results.efficiency}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Revenue Impact</span>
                          <span className="text-2xl font-bold text-[#8B9F7E]">{study.results.revenue}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Implementation</span>
                          <span className="text-2xl font-bold text-[#8B9F7E]">{study.results.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support & Services */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              White-Glove Support & Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your success is our priority. Get dedicated support every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <Headphones className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Dedicated Account Team</h3>
                <p className="text-gray-600 mb-4">
                  Your own success manager, technical architect, and support team
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 24/7 priority support</li>
                  <li>• &lt; 1 hour response time</li>
                  <li>• Direct phone line</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Users className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professional Services</h3>
                <p className="text-gray-600 mb-4">
                  Expert implementation and custom development services
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Migration assistance</li>
                  <li>• Custom development</li>
                  <li>• Training programs</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <TrendingUp className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Strategic Consulting</h3>
                <p className="text-gray-600 mb-4">
                  Ongoing optimization and growth strategies
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Quarterly reviews</li>
                  <li>• Performance optimization</li>
                  <li>• Growth planning</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Scale Your E-commerce?
          </h2>
          <p className="max-w-xl mx-auto text-lg text-gray-300 mb-8">
            Let's discuss how Nuvi can transform your enterprise e-commerce operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-[#8B9F7E] hover:bg-[#7A8B6D] text-white">
                Contact Enterprise Sales
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Response within 24 hours • Custom pricing • Dedicated onboarding
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
            "name": "Enterprise E-commerce Solutions - Nuvi",
            "description": "Enterprise-grade e-commerce platform for large organizations",
            "url": "https://nuvi.com/enterprise",
            "mainEntity": {
              "@type": "Product",
              "name": "Nuvi Enterprise",
              "description": "Enterprise e-commerce platform",
              "brand": {
                "@type": "Brand",
                "name": "Nuvi"
              },
              "offers": {
                "@type": "Offer",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "price": "Custom",
                  "priceCurrency": "USD"
                }
              }
            }
          })
        }}
      />
    </div>
  );
}