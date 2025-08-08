
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, Target, Eye, Heart, Globe, Zap, Award, TrendingUp, 
  Shield, CheckCircle2, ArrowRight, Calendar, Building2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Nuvi - Our Story, Mission & Team | E-commerce Platform',
  description: 'Learn about Nuvi\'s mission to democratize e-commerce. Meet our team and discover how we\'re helping thousands of entrepreneurs build successful online stores.',
  keywords: 'about nuvi, e-commerce team, company mission, e-commerce platform story, nuvi values, meet the team',
  openGraph: {
    title: 'About Nuvi - Empowering E-commerce Entrepreneurs Since 2025',
    description: 'Discover the story behind Nuvi and our mission to make e-commerce accessible to everyone.',
    type: 'website',
    url: 'https://nuvi.com/about',
  },
  alternates: {
    canonical: 'https://nuvi.com/about',
  },
};

const values = [
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Every decision we make starts with our customers. Your success is our success.',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'E-commerce should be accessible to everyone, regardless of technical skill or budget.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We constantly push boundaries to bring cutting-edge technology to your fingertips.',
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'Your data and your customers\' data are protected with enterprise-grade security.',
  },
];

const milestones = [
  {
    year: '2025',
    title: 'Founded',
    description: 'Started with a vision to make e-commerce accessible to everyone.',
  },
  {
    year: '2025',
    title: 'First Customers',
    description: 'Launched our beta and onboarded our first 10 customers.',
  },
  {
    year: '2025',
    title: 'Product Market Fit',
    description: 'Found our niche helping small businesses compete online.',
  },
  {
    year: 'Future',
    title: 'The Journey Continues',
    description: 'Growing steadily with our customers, one store at a time.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              Est. 2025
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-6">
              Empowering Entrepreneurs to
              <br />
              <span className="text-[#8B9F7E]">Build Their Dreams</span>
            </h1>
            
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 md:text-xl mb-8">
              We're a small but mighty startup on a mission: to democratize e-commerce and help 
              entrepreneurs succeed without the complexity and high costs of traditional platforms.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold text-[#8B9F7E]">100+</div>
                <p className="text-gray-600 mt-1">Active Stores</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#8B9F7E]">$1M+</div>
                <p className="text-gray-600 mt-1">GMV Processed</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#8B9F7E]">15+</div>
                <p className="text-gray-600 mt-1">Countries Served</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#8B9F7E]">99.9%</div>
                <p className="text-gray-600 mt-1">Uptime SLA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Card className="border-[#8B9F7E]/20">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-[#8B9F7E] mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  To be the world's most trusted and innovative e-commerce platform, 
                  enabling millions of entrepreneurs to turn their ideas into thriving businesses.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-[#8B9F7E]/20">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-[#8B9F7E] mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To democratize e-commerce by providing powerful, easy-to-use tools 
                  that help entrepreneurs succeed in the digital economy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Story</h2>
            
            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                Nuvi started in 2025 when our founder, Ali, saw how difficult and expensive it was 
                for small businesses to sell online. After helping several local artisans struggle 
                with existing platforms, we knew there had to be a better way.
              </p>
              
              <p className="mt-4">
                We're still a small startup, but that's our strength. We can move fast, listen closely 
                to our customers, and build exactly what they need without corporate bureaucracy. Every 
                feature request gets reviewed by our entire team, and we often ship updates within days.
              </p>
              
              <p className="mt-4">
                While we're young, we're ambitious. We're building Nuvi to be the platform we wished 
                existed when we started - powerful enough for growth, simple enough for beginners, and 
                affordable for everyone. Join us on this journey as we reshape e-commerce together.
              </p>
            </div>

            {/* Timeline */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-center mb-8">Our Journey</h3>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-[#8B9F7E] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {milestone.year.slice(-2)}
                      </div>
                    </div>
                    <div className="flex-grow pb-8 border-l-2 border-gray-200 pl-8 -mt-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-lg mb-1">{milestone.title}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core values guide every decision we make and shape how we build our product and company.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B9F7E]/10 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-[#8B9F7E]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Small Team, Big Dreams</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're a passionate startup team focused on one thing: making e-commerce accessible to everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <Zap className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Agile & Fast</h3>
                <p className="text-gray-600">
                  As a startup, we move quickly to implement features our customers need most.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <Users className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Customer Focused</h3>
                <p className="text-gray-600">
                  Every team member talks directly with customers to understand their needs.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <TrendingUp className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Growing Together</h3>
                <p className="text-gray-600">
                  We're growing alongside our customers, building the platform they deserve.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 max-w-3xl mx-auto">
              While we may be a small team today, our ambitions are large. We're building Nuvi 
              to compete with the biggest platforms by focusing on what matters most: our customers' 
              success. Every line of code, every feature, and every decision is made with your 
              growth in mind.
            </p>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Join Us on Our Mission
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Whether you're looking to start your own store or join our team, 
            we'd love to have you be part of the Nuvi story.
          </p>
          <div className="flex justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#8B9F7E] hover:bg-gray-100">
                Start Your Store Today
                <ArrowRight className="ml-2 h-4 w-4" />
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
            "@type": "AboutPage",
            "name": "About Nuvi",
            "description": "Learn about Nuvi's mission to democratize e-commerce",
            "url": "https://nuvi.com/about",
            "mainEntity": {
              "@type": "Organization",
              "name": "Nuvi",
              "description": "E-commerce platform empowering entrepreneurs worldwide",
              "foundingDate": "2025",
              "founders": [{
                "@type": "Person",
                "name": "Ali Özkan"
              }],
              "employees": {
                "@type": "QuantitativeValue",
                "minValue": 2,
                "maxValue": 10
              }
            }
          })
        }}
      />
    </div>
  );
}
