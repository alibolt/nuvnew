import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, X, Minus, ArrowRight, Info,
  DollarSign, Zap, Users, Globe, Shield, BarChart
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compare E-commerce Platforms - Nuvi vs Shopify vs WooCommerce vs BigCommerce',
  description: 'Detailed comparison of top e-commerce platforms. Compare features, pricing, and capabilities to find the best platform for your online store.',
  keywords: 'e-commerce platform comparison, nuvi vs shopify, shopify vs woocommerce, best e-commerce platform, compare online store builders',
  openGraph: {
    title: 'E-commerce Platform Comparison - Find Your Perfect Match',
    description: 'Compare Nuvi with Shopify, WooCommerce, BigCommerce and more.',
    type: 'website',
    url: 'https://nuvi.com/compare',
  },
  alternates: {
    canonical: 'https://nuvi.com/compare',
  },
};

const platforms = ['Nuvi', 'Shopify', 'WooCommerce', 'BigCommerce'];

const comparisonCategories = [
  {
    category: 'Pricing & Fees',
    icon: DollarSign,
    features: [
      {
        name: 'Starting Price',
        nuvi: '$29/mo',
        shopify: '$29/mo',
        woocommerce: '$15-30/mo*',
        bigcommerce: '$39/mo',
      },
      {
        name: 'Transaction Fees',
        nuvi: '0.5-2%',
        shopify: '2.4-2.9% + 30¢',
        woocommerce: 'Varies by gateway',
        bigcommerce: '0%**',
      },
      {
        name: 'Free Trial',
        nuvi: '30 days',
        shopify: '14 days',
        woocommerce: 'N/A',
        bigcommerce: '15 days',
      },
      {
        name: 'Credit Card Required',
        nuvi: false,
        shopify: true,
        woocommerce: 'N/A',
        bigcommerce: true,
      },
    ],
  },
  {
    category: 'Features & Functionality',
    icon: Zap,
    features: [
      {
        name: 'Drag & Drop Builder',
        nuvi: true,
        shopify: 'Limited',
        woocommerce: 'Plugin required',
        bigcommerce: 'Limited',
      },
      {
        name: 'Free Themes',
        nuvi: '50+',
        shopify: '10',
        woocommerce: '20+',
        bigcommerce: '12',
      },
      {
        name: 'Built-in Blogging',
        nuvi: true,
        shopify: 'Basic',
        woocommerce: true,
        bigcommerce: 'Basic',
      },
      {
        name: 'AI Tools',
        nuvi: true,
        shopify: 'Limited',
        woocommerce: false,
        bigcommerce: false,
      },
      {
        name: 'Mobile App',
        nuvi: true,
        shopify: true,
        woocommerce: 'Third-party',
        bigcommerce: true,
      },
    ],
  },
  {
    category: 'Sales & Marketing',
    icon: BarChart,
    features: [
      {
        name: 'Abandoned Cart Recovery',
        nuvi: 'All plans',
        shopify: '$79+ plans',
        woocommerce: 'Plugin required',
        bigcommerce: 'All plans',
      },
      {
        name: 'Email Marketing',
        nuvi: 'Built-in',
        shopify: 'App required',
        woocommerce: 'Plugin required',
        bigcommerce: 'Limited',
      },
      {
        name: 'Multi-channel Selling',
        nuvi: true,
        shopify: true,
        woocommerce: 'Plugin required',
        bigcommerce: true,
      },
      {
        name: 'SEO Tools',
        nuvi: 'Advanced',
        shopify: 'Basic',
        woocommerce: 'Plugin required',
        bigcommerce: 'Advanced',
      },
    ],
  },
  {
    category: 'Technical & Support',
    icon: Shield,
    features: [
      {
        name: 'Hosting Included',
        nuvi: true,
        shopify: true,
        woocommerce: false,
        bigcommerce: true,
      },
      {
        name: '24/7 Support',
        nuvi: 'All plans',
        shopify: 'Plus only',
        woocommerce: 'Community',
        bigcommerce: 'All plans',
      },
      {
        name: 'SSL Certificate',
        nuvi: 'Free',
        shopify: 'Free',
        woocommerce: 'Extra cost',
        bigcommerce: 'Free',
      },
      {
        name: 'API Access',
        nuvi: 'Unlimited',
        shopify: 'Rate limited',
        woocommerce: 'Full access',
        bigcommerce: 'Rate limited',
      },
    ],
  },
  {
    category: 'Scalability',
    icon: Globe,
    features: [
      {
        name: 'Product Limit',
        nuvi: 'Unlimited',
        shopify: 'Unlimited',
        woocommerce: 'Server dependent',
        bigcommerce: 'Unlimited',
      },
      {
        name: 'Bandwidth',
        nuvi: 'Unlimited',
        shopify: 'Unlimited',
        woocommerce: 'Host dependent',
        bigcommerce: 'Unlimited',
      },
      {
        name: 'Staff Accounts',
        nuvi: 'Unlimited',
        shopify: '2-15',
        woocommerce: 'Unlimited',
        bigcommerce: '1-15',
      },
      {
        name: 'Multi-language',
        nuvi: true,
        shopify: 'App required',
        woocommerce: 'Plugin required',
        bigcommerce: 'Limited',
      },
    ],
  },
];

const renderFeatureValue = (value: any) => {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mx-auto" />
    ) : (
      <X className="h-5 w-5 text-gray-400 mx-auto" />
    );
  }
  
  if (value === 'N/A') {
    return <Minus className="h-5 w-5 text-gray-400 mx-auto" />;
  }
  
  return <span className="text-sm">{value}</span>;
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-6">
            Compare E-commerce Platforms
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Make an informed decision. See how Nuvi stacks up against other 
            popular e-commerce platforms.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/start-free-trial">
              <Button size="lg" className="bg-[#8B9F7E] hover:bg-[#7A8B6D]">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 bg-[#8B9F7E]/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose Nuvi?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <DollarSign className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Lower Total Cost</h3>
                  <p className="text-sm text-gray-600">
                    Save up to 70% compared to Shopify with our transparent pricing
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Zap className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">All-Inclusive Features</h3>
                  <p className="text-sm text-gray-600">
                    Everything included - no expensive apps or add-ons needed
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-10 w-10 text-[#8B9F7E] mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Better Support</h3>
                  <p className="text-sm text-gray-600">
                    24/7 support on all plans, not just enterprise
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {comparisonCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div key={categoryIndex} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className="h-6 w-6 text-[#8B9F7E]" />
                    <h2 className="text-2xl font-bold">{category.category}</h2>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                              Feature
                            </th>
                            {platforms.map((platform) => (
                              <th 
                                key={platform} 
                                className={`px-6 py-4 text-center text-sm font-medium ${
                                  platform === 'Nuvi' ? 'bg-[#8B9F7E]/10 text-[#8B9F7E]' : 'text-gray-700'
                                }`}
                              >
                                {platform}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {category.features.map((feature, featureIndex) => (
                            <tr key={featureIndex} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {feature.name}
                              </td>
                              <td className="px-6 py-4 text-center bg-[#8B9F7E]/5">
                                {renderFeatureValue(feature.nuvi)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {renderFeatureValue(feature.shopify)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {renderFeatureValue(feature.woocommerce)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {renderFeatureValue(feature.bigcommerce)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footnotes */}
          <div className="max-w-4xl mx-auto mt-8 space-y-2 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <span className="font-semibold">*</span>
              WooCommerce requires separate hosting, domain, and SSL certificate
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">**</span>
              BigCommerce has no platform transaction fees but payment gateway fees still apply
            </p>
          </div>
        </div>
      </section>

      {/* Platform Deep Dives */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Platform Deep Dives
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Nuvi vs Shopify */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Nuvi vs Shopify</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>70% lower transaction fees</strong> - Keep more of your revenue
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>All features included</strong> - No expensive app subscriptions
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Better support</strong> - 24/7 support on all plans
                    </p>
                  </div>
                </div>
                <Link href="/switch-from-shopify">
                  <Button variant="outline" className="w-full">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nuvi vs WooCommerce */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Nuvi vs WooCommerce</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>All-in-one solution</strong> - No hosting or maintenance hassles
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Built-in features</strong> - No plugin compatibility issues
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Professional support</strong> - Not just community forums
                    </p>
                  </div>
                </div>
                <Link href="/switch-from-woocommerce">
                  <Button variant="outline" className="w-full">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nuvi vs BigCommerce */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Nuvi vs BigCommerce</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Lower starting price</strong> - $29/mo vs $39/mo
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Better design tools</strong> - True drag-and-drop builder
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>More themes</strong> - 50+ free themes vs 12
                    </p>
                  </div>
                </div>
                <Link href="/switch-from-bigcommerce">
                  <Button variant="outline" className="w-full">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Custom Solutions */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Need a Custom Solution?</h3>
                <p className="text-sm text-gray-600 mb-6">
                  If you're using Magento, custom-built solutions, or other platforms, 
                  our migration team can help you switch seamlessly.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Free migration assistance</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Custom data mapping</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#8B9F7E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">SEO preservation</p>
                  </div>
                </div>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Tool */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Still Not Sure Which Platform Is Right for You?
            </h2>
            <p className="text-gray-600 mb-8">
              Use our interactive comparison tool to find the perfect match for your business needs.
            </p>
            
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-6">Quick Recommendation</h3>
                
                <div className="space-y-6 text-left">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Choose Nuvi if you want:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Lower transaction fees and total cost of ownership</li>
                      <li>• All-inclusive features without extra apps</li>
                      <li>• True drag-and-drop design flexibility</li>
                      <li>• 24/7 support on all plans</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Consider alternatives if:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• You need very specific third-party app integrations</li>
                      <li>• You want to self-host (WooCommerce)</li>
                      <li>• You're already heavily invested in another ecosystem</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link href="/start-free-trial">
                    <Button size="lg" className="bg-[#8B9F7E] hover:bg-[#7A8B6D]">
                      Try Nuvi Free for 30 Days
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <p className="mt-3 text-sm text-gray-600">
                    No credit card required • Full access • Free migration
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            See the Difference for Yourself
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Join thousands of businesses that chose Nuvi for better features, 
            lower costs, and superior support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/start-free-trial">
              <Button size="lg" className="bg-white text-[#8B9F7E] hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/10"
              >
                Watch Demo
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
            "name": "E-commerce Platform Comparison",
            "description": "Compare Nuvi with other e-commerce platforms",
            "url": "https://nuvi.com/compare",
            "mainEntity": {
              "@type": "Table",
              "about": "E-commerce platform feature comparison"
            }
          })
        }}
      />
    </div>
  );
}