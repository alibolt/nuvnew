'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, CheckCircle2, TrendingDown, DollarSign, 
  Zap, Users, Lock, Palette, Globe, BarChart,
  AlertCircle, Package, CreditCard, Star, Gift
} from 'lucide-react';

const comparisonData = [
  {
    feature: 'Monthly Price',
    shopify: '$29-299+',
    nuvi: '$29-199',
    highlight: true,
  },
  {
    feature: 'Transaction Fees',
    shopify: '2.4-2.9% + 30¢',
    nuvi: '0.5-2%',
    highlight: true,
  },
  {
    feature: 'Free Themes',
    shopify: '10',
    nuvi: '50+',
  },
  {
    feature: 'Abandoned Cart Recovery',
    shopify: 'Pro plan only',
    nuvi: 'All plans',
  },
  {
    feature: 'Staff Accounts',
    shopify: '2-15',
    nuvi: 'Unlimited',
  },
  {
    feature: 'API Calls',
    shopify: 'Limited',
    nuvi: 'Unlimited',
  },
  {
    feature: '24/7 Support',
    shopify: 'Plus plan only',
    nuvi: 'All plans',
  },
  {
    feature: 'Multi-currency',
    shopify: 'Extra fee',
    nuvi: 'Included',
  },
];

const painPoints = [
  {
    icon: DollarSign,
    title: 'High Transaction Fees',
    description: 'Shopify takes 2.9% + 30¢ per transaction. We charge as low as 0.5%.',
    savings: 'Save up to $5,000/month',
  },
  {
    icon: TrendingDown,
    title: 'Expensive Apps',
    description: 'Stop paying for basic features. Everything is included with Nuvi.',
    savings: 'Save $200-500/month on apps',
  },
  {
    icon: Lock,
    title: 'Platform Lock-in',
    description: 'Own your data and infrastructure. No vendor lock-in with Nuvi.',
    savings: 'Full data portability',
  },
  {
    icon: Users,
    title: 'Limited Customization',
    description: 'Break free from Shopify\'s restrictions. Customize everything.',
    savings: 'Unlimited flexibility',
  },
];

const migrationSteps = [
  {
    step: 1,
    title: 'Free Consultation',
    description: 'Our migration experts analyze your Shopify store and create a custom migration plan.',
  },
  {
    step: 2,
    title: 'Data Migration',
    description: 'We migrate all your products, customers, orders, and content automatically.',
  },
  {
    step: 3,
    title: 'Design Transfer',
    description: 'Recreate your store design or choose from our premium themes.',
  },
  {
    step: 4,
    title: 'Testing & Launch',
    description: 'Thorough testing before seamlessly switching your domain.',
  },
];

const testimonials = [
  {
    name: 'David Park',
    company: 'TechStyle Fashion',
    previousPlatform: 'Shopify Plus',
    quote: 'We were paying $2,000/month on Shopify Plus. Now we pay $199 on Nuvi with better features.',
    savings: 'Saving $21,600/year',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  },
  {
    name: 'Sarah Johnson',
    company: 'Organic Beauty Co',
    previousPlatform: 'Shopify',
    quote: 'The migration was seamless. Nuvi\'s team handled everything, and we were live in 48 hours.',
    savings: 'Saving $8,400/year',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    name: 'Mike Chen',
    company: 'Sports Gear Pro',
    previousPlatform: 'Shopify',
    quote: 'Transaction fees alone were killing our margins. Nuvi saved us thousands every month.',
    savings: 'Saving $15,000/year',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
];

export default function SwitchFromShopifyClient() {
  const [savings, setSavings] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('50000');

  // Calculate savings based on revenue
  const calculateSavings = () => {
    const revenue = parseFloat(monthlyRevenue) || 0;
    const shopifyFees = revenue * 0.029 + 100; // 2.9% + monthly fee
    const nuviFees = revenue * 0.01 + 79; // 1% + monthly fee
    const monthlySavings = shopifyFees - nuviFees;
    const yearlySavings = monthlySavings * 12;
    return {
      monthly: monthlySavings.toFixed(0),
      yearly: yearlySavings.toFixed(0),
    };
  };

  const calculatedSavings = calculateSavings();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <AlertCircle className="h-4 w-4" />
              Limited Time: Free Migration + 3 Months Free
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Tired of Shopify's
              <span className="block text-[#8B9F7E] mt-2">High Fees?</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              Join 5,000+ stores that switched to Nuvi and saved an average of 
              <span className="text-[#8B9F7E] font-bold"> $12,000/year</span> on 
              platform fees while getting better features.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/start-free-trial">
                <Button size="lg" className="bg-[#8B9F7E] hover:bg-[#7A8B6D] text-white">
                  Start Free Migration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Calculate Your Savings
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-600 border-2 border-gray-800"></div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#8B9F7E] text-[#8B9F7E]" />
                  ))}
                </div>
                <p className="text-sm text-gray-400">5,000+ stores switched</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="max-w-3xl mx-auto shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6">
                Calculate Your Savings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Monthly Revenue
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="10000"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>$10k</span>
                    <span className="font-bold text-lg text-gray-900">
                      ${parseInt(monthlyRevenue).toLocaleString()}
                    </span>
                    <span>$500k</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Shopify Fees</p>
                    <p className="text-2xl font-bold text-red-600">
                      ${(parseFloat(monthlyRevenue) * 0.029 + 100).toFixed(0)}/mo
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Nuvi Fees</p>
                    <p className="text-2xl font-bold text-[#8B9F7E]">
                      ${(parseFloat(monthlyRevenue) * 0.01 + 79).toFixed(0)}/mo
                    </p>
                  </div>
                  <div className="text-center p-4 bg-[#8B9F7E]/10 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">You Save</p>
                    <p className="text-2xl font-bold text-[#8B9F7E]">
                      ${calculatedSavings.monthly}/mo
                    </p>
                    <p className="text-sm text-gray-600">
                      ${calculatedSavings.yearly}/year
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Stores Are Leaving Shopify
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't let high fees and limitations hold your business back
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {painPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-50 rounded-lg">
                        <Icon className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
                        <p className="text-gray-600 mb-3">{point.description}</p>
                        <p className="text-[#8B9F7E] font-semibold">{point.savings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Side-by-Side Comparison
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See why Nuvi is the smarter choice for growing businesses
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-6 py-4 text-left">Feature</th>
                    <th className="px-6 py-4 text-center">
                      <div className="text-red-400">Shopify</div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="text-[#8B9F7E]">Nuvi</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className={row.highlight ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{row.shopify}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={row.highlight ? 'text-[#8B9F7E] font-bold' : ''}>
                          {row.nuvi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Process */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Seamless Migration Process
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our expert team handles everything. Most migrations complete in 48-72 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {migrationSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-[#8B9F7E] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-6 p-6 bg-[#8B9F7E]/10 rounded-lg">
              <Gift className="h-12 w-12 text-[#8B9F7E]" />
              <div className="text-left">
                <h3 className="font-bold text-lg">Free Migration Included</h3>
                <p className="text-gray-600">Worth $2,000 - Limited time offer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Success Stories from Switchers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real businesses, real savings, real results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Previously on: {testimonial.previousPlatform}</p>
                    <p className="text-[#8B9F7E] font-bold">{testimonial.savings}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Common Questions About Switching
            </h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Will I lose my SEO rankings?</h3>
                  <p className="text-gray-600">
                    No! We maintain all your URLs, meta tags, and implement proper 301 redirects 
                    to preserve your SEO rankings.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How long does migration take?</h3>
                  <p className="text-gray-600">
                    Most migrations complete in 48-72 hours. Larger stores may take up to a week. 
                    Your current store stays live during migration.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What about my custom apps?</h3>
                  <p className="text-gray-600">
                    Most Shopify app functionality is built into Nuvi. For custom needs, 
                    our API allows easy integration or custom development.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Can I keep my domain?</h3>
                  <p className="text-gray-600">
                    Yes! We'll help you transfer your domain or update DNS settings. 
                    Your customers won't notice any difference.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to Save Thousands?
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Join 5,000+ smart store owners who made the switch. 
            Free migration, better features, lower costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/start-free-trial">
              <Button size="lg" className="bg-white text-[#8B9F7E] hover:bg-gray-100">
                Start Free Migration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/10"
              >
                Talk to Migration Expert
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">
            Limited time: Free migration + 3 months free
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
            "name": "Switch from Shopify to Nuvi",
            "description": "Migrate from Shopify and save on fees",
            "url": "https://nuvi.com/switch-from-shopify",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Nuvi",
              "applicationCategory": "E-commerce Platform",
              "competitorOf": {
                "@type": "SoftwareApplication",
                "name": "Shopify"
              }
            }
          })
        }}
      />
    </div>
  );
}