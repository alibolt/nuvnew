'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, Phone, MapPin, Clock, MessageSquare, 
  HeadphonesIcon, Building2, CheckCircle
} from 'lucide-react';

const contactMethods = [
  {
    icon: HeadphonesIcon,
    title: 'Customer Support',
    description: '24/7 support for existing customers',
    action: 'support@nuvi.com',
    actionType: 'email',
  },
  {
    icon: MessageSquare,
    title: 'Sales Inquiries',
    description: 'Talk to our sales team about enterprise plans',
    action: 'sales@nuvi.com',
    actionType: 'email',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Mon-Fri 9AM-6PM EST',
    action: '+1 (555) 123-4567',
    actionType: 'phone',
  },
  {
    icon: Building2,
    title: 'Partnerships',
    description: 'Explore partnership opportunities',
    action: 'partners@nuvi.com',
    actionType: 'email',
  },
];

const offices = [
  {
    city: 'San Francisco',
    address: '123 Market Street, Suite 500',
    location: 'San Francisco, CA 94105',
    country: 'United States',
  },
  {
    city: 'London',
    address: '456 Oxford Street',
    location: 'London W1C 1AP',
    country: 'United Kingdom',
  },
  {
    city: 'Singapore',
    address: '789 Orchard Road',
    location: 'Singapore 238839',
    country: 'Singapore',
  },
];

export default function ContactPageClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Mail className="h-4 w-4" />
            Get in Touch
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-4">
            How Can We
            <br />
            <span className="text-[#8B9F7E]">Help You Today?</span>
          </h1>
          
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 md:text-xl">
            Whether you have questions about features, pricing, or need support, 
            our team is ready to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Icon className="h-10 w-10 text-[#8B9F7E] mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                    {method.actionType === 'email' ? (
                      <a 
                        href={`mailto:${method.action}`}
                        className="text-[#8B9F7E] hover:underline text-sm font-medium"
                      >
                        {method.action}
                      </a>
                    ) : (
                      <a 
                        href={`tel:${method.action.replace(/\s/g, '')}`}
                        className="text-[#8B9F7E] hover:underline text-sm font-medium"
                      >
                        {method.action}
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                      Company Name
                    </label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B9F7E]"
                    >
                      <option value="">Select a topic</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help..."
                      className="resize-none"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-[#8B9F7E] hover:bg-[#7A8B6D]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              ) : (
                <Card className="border-[#8B9F7E]/20 bg-[#8B9F7E]/5">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-[#8B9F7E] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                    <p className="text-gray-600">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                    <Button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: '',
                          email: '',
                          company: '',
                          subject: '',
                          message: '',
                        });
                      }}
                      className="mt-4"
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Office Locations */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Office Locations</h2>
              <p className="text-gray-600 mb-8">
                Visit us at one of our global offices or schedule a virtual meeting.
              </p>
              
              <div className="space-y-6">
                {offices.map((office, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 text-[#8B9F7E] mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{office.city}</h3>
                          <p className="text-gray-600 text-sm">
                            {office.address}<br />
                            {office.location}<br />
                            {office.country}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Business Hours */}
              <Card className="mt-6 bg-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-[#8B9F7E] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                        <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                        <p>Sunday: Closed</p>
                        <p className="mt-2 text-[#8B9F7E]">24/7 Support available for all paid plans</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Looking for Quick Answers?</h2>
          <p className="text-gray-600 mb-6">
            Check out our comprehensive FAQ section for instant answers to common questions.
          </p>
          <Button variant="outline" size="lg">
            Visit FAQ
          </Button>
        </div>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Nuvi",
            "description": "Contact Nuvi for sales, support, or general inquiries",
            "url": "https://nuvi.com/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "Nuvi",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+1-555-123-4567",
                  "contactType": "sales",
                  "email": "sales@nuvi.com",
                  "availableLanguage": ["English"],
                  "areaServed": "Worldwide"
                },
                {
                  "@type": "ContactPoint",
                  "email": "support@nuvi.com",
                  "contactType": "customer support",
                  "availableLanguage": ["English"],
                  "areaServed": "Worldwide"
                }
              ]
            }
          })
        }}
      />
    </div>
  );
}