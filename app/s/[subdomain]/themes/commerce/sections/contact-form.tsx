'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  settings: {
    title?: string;
    subtitle?: string;
    layout?: 'simple' | 'split' | 'with-info';
    showContactInfo?: boolean;
    email?: string;
    phone?: string;
    address?: string;
    businessHours?: string;
    formFields?: {
      name: boolean;
      email: boolean;
      phone: boolean;
      subject: boolean;
      message: boolean;
      orderNumber?: boolean;
    };
    successMessage?: string;
    buttonText?: string;
    backgroundColor?: string;
    textColor?: string;
    formBackgroundColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };
  store?: any;
  isPreview?: boolean;
}

export function ContactForm({ settings, store, isPreview }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    orderNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    title = 'Contact Us',
    subtitle = 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
    layout = 'simple',
    showContactInfo = true,
    email = store?.contactEmail || 'contact@example.com',
    phone = store?.phone || '+1 (555) 123-4567',
    address = store?.address || '123 Main St, City, State 12345',
    businessHours = 'Mon-Fri: 9AM-5PM',
    formFields = {
      name: true,
      email: true,
      phone: false,
      subject: true,
      message: true,
      orderNumber: false
    },
    successMessage = 'Thank you for your message! We\'ll get back to you soon.',
    buttonText = 'Send Message',
    backgroundColor = '#f9fafb',
    textColor = '#111827',
    formBackgroundColor = '#ffffff',
    buttonColor = '#000000',
    buttonTextColor = '#ffffff'
  } = settings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPreview) {
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/stores/${store?.subdomain}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          orderNumber: ''
        });
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
        setSubmitStatus('error');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.name && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>
        )}

        {formFields.email && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
        )}

        {formFields.phone && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        )}

        {formFields.orderNumber && (
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium mb-2">
              Order Number
            </label>
            <input
              type="text"
              id="orderNumber"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ORD-12345"
            />
          </div>
        )}
      </div>

      {formFields.subject && (
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="How can we help?"
          />
        </div>
      )}

      {formFields.message && (
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Tell us more..."
          />
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-3 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            backgroundColor: buttonColor,
            color: buttonTextColor
          }}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              {buttonText}
            </>
          )}
        </button>
      </div>

      {submitStatus === 'success' && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-lg">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
    </form>
  );

  const renderContactInfo = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-6">Get in Touch</h3>
        
        <div className="space-y-6">
          {email && (
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Email</p>
                <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                  {email}
                </a>
              </div>
            </div>
          )}

          {phone && (
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Phone</p>
                <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                  {phone}
                </a>
              </div>
            </div>
          )}

          {address && (
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-gray-600">{address}</p>
              </div>
            </div>
          )}

          {businessHours && (
            <div>
              <p className="font-medium mb-2">Business Hours</p>
              <p className="text-gray-600">{businessHours}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (layout === 'split') {
    return (
      <section className="py-16" style={{ backgroundColor }}>
        <div 
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left side - Contact Info */}
            <div style={{ color: textColor }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              {subtitle && <p className="text-lg opacity-80 mb-8">{subtitle}</p>}
              {showContactInfo && renderContactInfo()}
            </div>

            {/* Right side - Form */}
            <div 
              className="bg-white p-8 rounded-xl shadow-sm"
              style={{ backgroundColor: formBackgroundColor }}
            >
              {renderForm()}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'with-info') {
    return (
      <section className="py-16" style={{ backgroundColor, color: textColor }}>
        <div 
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            {subtitle && <p className="text-lg opacity-80 max-w-2xl mx-auto">{subtitle}</p>}
          </div>

          {/* Contact Info Cards */}
          {showContactInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {email && (
                <div className="text-center p-6 bg-white rounded-lg shadow-sm" style={{ backgroundColor: formBackgroundColor }}>
                  <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                    {email}
                  </a>
                </div>
              )}

              {phone && (
                <div className="text-center p-6 bg-white rounded-lg shadow-sm" style={{ backgroundColor: formBackgroundColor }}>
                  <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                    {phone}
                  </a>
                </div>
              )}

              {address && (
                <div className="text-center p-6 bg-white rounded-lg shadow-sm" style={{ backgroundColor: formBackgroundColor }}>
                  <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Visit Us</h3>
                  <p className="text-gray-600">{address}</p>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <div 
            className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm"
            style={{ backgroundColor: formBackgroundColor }}
          >
            {renderForm()}
          </div>
        </div>
      </section>
    );
  }

  // Simple layout (default)
  return (
    <section className="py-16" style={{ backgroundColor, color: textColor }}>
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            {subtitle && <p className="text-lg opacity-80">{subtitle}</p>}
          </div>

          {/* Form */}
          <div 
            className="bg-white p-8 rounded-xl shadow-sm"
            style={{ backgroundColor: formBackgroundColor }}
          >
            {renderForm()}
          </div>
        </div>
      </div>
    </section>
  );
}