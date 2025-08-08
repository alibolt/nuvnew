'use client';

import { useState } from 'react';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';

interface ContactPageProps {
  settings?: any;
  pageData?: {
    page?: {
      title: string;
      content: string;
    };
  };
  store?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export function ContactPage({ settings: sectionSettings, pageData, store }: ContactPageProps) {
  const { settings } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const page = pageData?.page;
  const title = sectionSettings?.title || page?.title || 'Contact Us';
  const content = sectionSettings?.content || page?.content || '';
  const showTitle = sectionSettings?.showTitle ?? true;
  
  const showPhone = sectionSettings?.showPhone ?? true;
  const showEmail = sectionSettings?.showEmail ?? true;
  const showAddress = sectionSettings?.showAddress ?? true;
  const showContactInfo = showPhone || showEmail || showAddress;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement actual form submission
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: 'var(--theme-background)',
      }}
    >
      <div 
        className="container mx-auto max-w-6xl"
        style={{
          padding: '0 var(--theme-container-padding)',
        }}
      >
        {showTitle && title && (
          <h1 
            className="mb-8 text-center"
            style={{
              fontSize: 'var(--theme-text-3xl)',
              fontFamily: 'var(--theme-font-heading)',
              fontWeight: 'var(--theme-font-weight-light)',
              color: 'var(--theme-text)',
            }}
          >
            {title}
          </h1>
        )}

        {content && (
          <div 
            className="prose prose-lg max-w-none mx-auto mb-12 text-center"
            style={{
              fontFamily: 'var(--theme-font-body)',
              color: 'var(--theme-text)',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          {showContactInfo && (
            <div className="lg:col-span-1">
              <h2 
                className="mb-6"
                style={{
                  fontSize: 'var(--theme-text-xl)',
                  fontFamily: 'var(--theme-font-heading)',
                  fontWeight: 'var(--theme-font-weight-medium)',
                  color: 'var(--theme-text)',
                }}
              >
                Get in Touch
              </h2>

              <div className="space-y-6">
                {showEmail && store?.email && (
                  <div className="flex items-start gap-4">
                    <MinimalIcons.Mail 
                      size={20} 
                      className="mt-1"
                      style={{ color: 'var(--theme-primary)' }}
                    />
                    <div>
                      <h3 
                        className="font-medium mb-1"
                        style={{
                          fontSize: 'var(--theme-text-sm)',
                          color: 'var(--theme-text)',
                          fontFamily: 'var(--theme-font-body)',
                        }}
                      >
                        Email
                      </h3>
                      <a 
                        href={`mailto:${store.email}`}
                        className="transition-opacity hover:opacity-70"
                        style={{
                          fontSize: 'var(--theme-text-base)',
                          color: 'var(--theme-text-secondary)',
                          fontFamily: 'var(--theme-font-body)',
                        }}
                      >
                        {store.email}
                      </a>
                    </div>
                  </div>
                )}

                {showPhone && store?.phone && (
                  <div className="flex items-start gap-4">
                    <MinimalIcons.Phone 
                      size={20} 
                      className="mt-1"
                      style={{ color: 'var(--theme-primary)' }}
                    />
                    <div>
                      <h3 
                        className="font-medium mb-1"
                        style={{
                          fontSize: 'var(--theme-text-sm)',
                          color: 'var(--theme-text)',
                          fontFamily: 'var(--theme-font-body)',
                        }}
                      >
                        Phone
                      </h3>
                      <a 
                        href={`tel:${store.phone}`}
                        className="transition-opacity hover:opacity-70"
                        style={{
                          fontSize: 'var(--theme-text-base)',
                          color: 'var(--theme-text-secondary)',
                          fontFamily: 'var(--theme-font-body)',
                        }}
                      >
                        {store.phone}
                      </a>
                    </div>
                  </div>
                )}

                {showAddress && store?.address && (
                  <div className="flex items-start gap-4">
                    <MinimalIcons.MapPin 
                      size={20} 
                      className="mt-1"
                      style={{ color: 'var(--theme-primary)' }}
                    />
                    <div>
                      <h3 
                        className="font-medium mb-1"
                        style={{
                          fontSize: 'var(--theme-text-sm)',
                          color: 'var(--theme-text)',
                          fontFamily: 'var(--theme-font-body)',
                        }}
                      >
                        Address
                      </h3>
                      <p 
                        style={{
                          fontSize: 'var(--theme-text-base)',
                          color: 'var(--theme-text-secondary)',
                          fontFamily: 'var(--theme-font-body)',
                        }}
                      >
                        {store.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Form */}
          <div className={showContactInfo ? 'lg:col-span-2' : 'lg:col-span-3 max-w-2xl mx-auto w-full'}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div 
                  className="p-4 rounded-lg bg-green-50 text-green-700 text-sm"
                  style={{ fontFamily: 'var(--theme-font-body)' }}
                >
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              {error && (
                <div 
                  className="p-4 rounded-lg bg-red-50 text-red-700 text-sm"
                  style={{ fontFamily: 'var(--theme-font-body)' }}
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="name" 
                    className="block mb-2"
                    style={{
                      fontSize: 'var(--theme-text-sm)',
                      fontWeight: 'var(--theme-font-weight-medium)',
                      color: 'var(--theme-text)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--theme-background)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)',
                      fontSize: 'var(--theme-text-base)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="email" 
                    className="block mb-2"
                    style={{
                      fontSize: 'var(--theme-text-sm)',
                      fontWeight: 'var(--theme-font-weight-medium)',
                      color: 'var(--theme-text)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--theme-background)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)',
                      fontSize: 'var(--theme-text-base)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="phone" 
                    className="block mb-2"
                    style={{
                      fontSize: 'var(--theme-text-sm)',
                      fontWeight: 'var(--theme-font-weight-medium)',
                      color: 'var(--theme-text)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--theme-background)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)',
                      fontSize: 'var(--theme-text-base)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="subject" 
                    className="block mb-2"
                    style={{
                      fontSize: 'var(--theme-text-sm)',
                      fontWeight: 'var(--theme-font-weight-medium)',
                      color: 'var(--theme-text)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--theme-background)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)',
                      fontSize: 'var(--theme-text-base)',
                      fontFamily: 'var(--theme-font-body)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="message" 
                  className="block mb-2"
                  style={{
                    fontSize: 'var(--theme-text-sm)',
                    fontWeight: 'var(--theme-font-weight-medium)',
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 resize-none"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    fontSize: 'var(--theme-text-base)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: 'white',
                  fontSize: 'var(--theme-text-base)',
                  fontFamily: 'var(--theme-font-body)',
                  fontWeight: 'var(--theme-font-weight-medium)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <MinimalIcons.Loader className="animate-spin" size={20} />
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}