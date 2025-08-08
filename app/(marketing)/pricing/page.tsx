import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Sparkles, Rocket, Building2, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing Plans - Nuvi E-commerce Platform | Start Free, Scale As You Grow',
  description: 'Choose the perfect plan for your e-commerce business. Start with our free trial, upgrade anytime. No hidden fees, no transaction charges. Compare pricing plans.',
  keywords: 'e-commerce pricing, online store cost, e-commerce platform pricing, shopify pricing alternative, affordable e-commerce, no transaction fees',
  openGraph: {
    title: 'Nuvi Pricing - Transparent Pricing for Every Business Size',
    description: 'Start free with 30-day trial. No credit card required. Scale your plan as your business grows.',
    type: 'website',
    url: 'https://nuvi.com/pricing',
  },
  alternates: {
    canonical: 'https://nuvi.com/pricing',
  },
};

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for new businesses and entrepreneurs',
    popular: false,
    features: [
      { text: 'Up to 100 products', included: true },
      { text: 'Unlimited bandwidth', included: true },
      { text: 'SSL certificate included', included: true },
      { text: '2% transaction fee', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: true },
      { text: '10+ free themes', included: true },
      { text: 'Mobile responsive', included: true },
      { text: 'SEO tools', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Priority support', included: false },
      { text: 'API access', included: false },
      { text: 'Multi-currency', included: false },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/register',
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'For growing businesses ready to scale',
    popular: true,
    features: [
      { text: 'Up to 2,500 products', included: true },
      { text: 'Unlimited bandwidth', included: true },
      { text: 'SSL certificate included', included: true },
      { text: '1% transaction fee', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority email & chat support', included: true },
      { text: '50+ premium themes', included: true },
      { text: 'Mobile responsive', included: true },
      { text: 'Advanced SEO tools', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Abandoned cart recovery', included: true },
      { text: 'Email marketing (5k/month)', included: true },
      { text: 'API access', included: true },
      { text: 'Multi-currency', included: true },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/register',
  },
  {
    name: 'Business',
    price: '$199',
    period: '/month',
    description: 'For established businesses with advanced needs',
    popular: false,
    features: [
      { text: 'Unlimited products', included: true },
      { text: 'Unlimited bandwidth', included: true },
      { text: 'SSL certificate included', included: true },
      { text: '0.5% transaction fee', included: true },
      { text: 'Enterprise analytics', included: true },
      { text: '24/7 phone & chat support', included: true },
      { text: 'All themes + custom design', included: true },
      { text: 'Mobile responsive', included: true },
      { text: 'Enterprise SEO tools', included: true },
      { text: 'Multiple custom domains', included: true },
      { text: 'Advanced automation', included: true },
      { text: 'Email marketing (50k/month)', included: true },
      { text: 'Full API access', included: true },
      { text: 'Multi-currency & multi-language', included: true },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/register',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for large organizations',
    popular: false,
    features: [
      { text: 'Everything in Business', included: true },
      { text: 'Dedicated infrastructure', included: true },
      { text: 'No transaction fees', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Custom development', included: true },
      { text: 'Advanced security features', included: true },
      { text: 'Compliance support', included: true },
      { text: 'Priority feature requests', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
];

const faqs = [
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any differences.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans. Enterprise customers can also pay by invoice.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No, there are no setup fees or hidden charges. You only pay the monthly subscription and transaction fees (if applicable).',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Save 20% when you pay annually. That\'s 2 months free compared to monthly billing.',
  },
  {
    question: 'What happens after my free trial ends?',
    answer: 'After your 30-day free trial, you\'ll be prompted to choose a plan. Your store remains active, and you won\'t be charged until you select a paid plan.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel anytime. Your store will remain active until the end of your billing period, and you can export all your data.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            30-Day Free Trial
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 md:text-xl mb-8">
            Start free and scale as you grow. No hidden fees, no surprises. 
            Choose the plan that fits your business needs.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className="text-gray-600">Monthly</span>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#8B9F7E] transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
            <span className="text-gray-600">
              Annual 
              <span className="ml-2 text-[#8B9F7E] font-medium">Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-[#8B9F7E] shadow-xl' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-[#8B9F7E] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-light mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Link href={plan.ctaLink}>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-[#8B9F7E] hover:bg-[#7A8B6D]' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                  
                  <div className="space-y-3 pt-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-[#8B9F7E] flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Transaction Fees Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Compare Transaction Fees
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We believe in transparent pricing. Here's how our transaction fees compare to other platforms.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Platform</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Professional</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Business</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-[#8B9F7E]/5">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Nuvi</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">2%</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">1%</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">0.5%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600">Shopify</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">2.9% + 30¢</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">2.6% + 30¢</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">2.4% + 30¢</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600">WooCommerce</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">2.9% + 30¢</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">2.9% + 30¢</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">2.9% + 30¢</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              * Transaction fees shown are in addition to payment processor fees
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Got questions about our pricing? We've got answers.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-[#8B9F7E]" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to Start Your Free Trial?
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Join thousands of businesses already growing with Nuvi. 
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
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
                Talk to Sales
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
            "name": "Nuvi Pricing Plans",
            "description": "Compare Nuvi e-commerce platform pricing plans. Start free, scale as you grow.",
            "url": "https://nuvi.com/pricing",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": plans.map((plan, index) => ({
                "@type": "Offer",
                "position": index + 1,
                "name": plan.name,
                "price": plan.price.replace('$', ''),
                "priceCurrency": "USD",
                "description": plan.description,
                "url": `https://nuvi.com/pricing#${plan.name.toLowerCase()}`,
              }))
            }
          })
        }}
      />
    </div>
  );
}