'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { CheckIcon } from '@/components/icons/minimal-icons';

export function ContactForm({ settings, store }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Settings with defaults
  const title = settings.title || 'Get in Touch';
  const subtitle = settings.subtitle || 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.';
  const layout = settings.layout || 'split'; // split, centered, wide
  const showContactInfo = settings.showContactInfo !== false;
  const successMessage = settings.successMessage || 'Thank you for your message. We\'ll get back to you soon!';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate form submission
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      // Reset after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const inputClasses = "w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 transition-all";
  const inputStyle = {
    backgroundColor: 'var(--theme-background)',
    borderColor: 'var(--theme-border)',
    color: 'var(--theme-text)',
    fontSize: 'var(--theme-text-base)'
  };
  
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label 
            htmlFor="name" 
            className="block mb-2"
            style={{
              fontSize: 'var(--theme-text-sm)',
              fontWeight: 'var(--theme-font-weight-medium)',
              color: 'var(--theme-text)'
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
            className={inputClasses}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--theme-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--theme-border)';
              e.target.style.boxShadow = 'none';
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
              color: 'var(--theme-text)'
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
            className={inputClasses}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--theme-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--theme-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label 
            htmlFor="phone" 
            className="block mb-2"
            style={{
              fontSize: 'var(--theme-text-sm)',
              fontWeight: 'var(--theme-font-weight-medium)',
              color: 'var(--theme-text)'
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
            className={inputClasses}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--theme-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--theme-border)';
              e.target.style.boxShadow = 'none';
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
              color: 'var(--theme-text)'
            }}
          >
            Subject *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className={inputClasses}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--theme-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--theme-border)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="order">Order Support</option>
            <option value="product">Product Question</option>
            <option value="wholesale">Wholesale Inquiry</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div>
        <label 
          htmlFor="message" 
          className="block mb-2"
          style={{
            fontSize: 'var(--theme-text-sm)',
            fontWeight: 'var(--theme-font-weight-medium)',
            color: 'var(--theme-text)'
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
          className={`${inputClasses} resize-none`}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--theme-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--theme-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className="w-full md:w-auto inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: status === 'success' ? 'var(--theme-success)' : 'var(--theme-primary)',
          color: 'var(--theme-background)',
          padding: '0.875rem 2rem',
          borderRadius: 'var(--theme-radius-md)',
          fontSize: 'var(--theme-text-base)',
          fontWeight: 'var(--theme-font-weight-semibold)'
        }}
        onMouseEnter={(e) => {
          if (status === 'idle') {
            e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
          }
        }}
        onMouseLeave={(e) => {
          if (status === 'idle') {
            e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
          }
        }}
      >
        {status === 'loading' && 'Sending...'}
        {status === 'success' && (
          <>
            <CheckIcon size={20} />
            Sent Successfully
          </>
        )}
        {status === 'idle' && (
          <>
            <Send className="h-5 w-5" />
            Send Message
          </>
        )}
      </button>
      
      {status === 'success' && (
        <p 
          className="mt-4"
          style={{
            color: 'var(--theme-success)',
            fontSize: 'var(--theme-text-sm)'
          }}
        >
          {successMessage}
        </p>
      )}
    </form>
  );
  
  const renderContactInfo = () => (
    <div className="space-y-6">
      {store.email && (
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--theme-surface)' }}
          >
            <Mail className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <div>
            <h3 
              style={{
                fontSize: 'var(--theme-text-base)',
                fontWeight: 'var(--theme-font-weight-semibold)',
                color: 'var(--theme-text)',
                marginBottom: '0.25rem'
              }}
            >
              Email
            </h3>
            <a 
              href={`mailto:${store.email}`}
              className="hover:underline"
              style={{
                fontSize: 'var(--theme-text-sm)',
                color: 'var(--theme-text-muted)'
              }}
            >
              {store.email}
            </a>
          </div>
        </div>
      )}
      
      {store.phone && (
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--theme-surface)' }}
          >
            <Phone className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <div>
            <h3 
              style={{
                fontSize: 'var(--theme-text-base)',
                fontWeight: 'var(--theme-font-weight-semibold)',
                color: 'var(--theme-text)',
                marginBottom: '0.25rem'
              }}
            >
              Phone
            </h3>
            <a 
              href={`tel:${store.phone}`}
              className="hover:underline"
              style={{
                fontSize: 'var(--theme-text-sm)',
                color: 'var(--theme-text-muted)'
              }}
            >
              {store.phone}
            </a>
          </div>
        </div>
      )}
      
      {store.address && (
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--theme-surface)' }}
          >
            <MapPin className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <div>
            <h3 
              style={{
                fontSize: 'var(--theme-text-base)',
                fontWeight: 'var(--theme-font-weight-semibold)',
                color: 'var(--theme-text)',
                marginBottom: '0.25rem'
              }}
            >
              Address
            </h3>
            <p 
              style={{
                fontSize: 'var(--theme-text-sm)',
                color: 'var(--theme-text-muted)',
                lineHeight: 'var(--theme-line-height-relaxed)'
              }}
            >
              {store.address}
            </p>
          </div>
        </div>
      )}
      
      {/* Business Hours */}
      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--theme-surface)' }}>
        <h3 
          style={{
            fontSize: 'var(--theme-text-lg)',
            fontWeight: 'var(--theme-font-weight-semibold)',
            color: 'var(--theme-text)',
            marginBottom: '1rem'
          }}
        >
          Business Hours
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span style={{ color: 'var(--theme-text-muted)' }}>Monday - Friday</span>
            <span style={{ color: 'var(--theme-text)' }}>9:00 AM - 6:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--theme-text-muted)' }}>Saturday</span>
            <span style={{ color: 'var(--theme-text)' }}>10:00 AM - 4:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--theme-text-muted)' }}>Sunday</span>
            <span style={{ color: 'var(--theme-text)' }}>Closed</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section 
      style={{
        padding: 'var(--theme-section-padding-mobile) 0',
        backgroundColor: 'var(--theme-background)',
        fontFamily: 'var(--theme-font-body)'
      }}
    >
      <div 
        className="mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)'
        }}
      >
        {/* Header */}
        <div className={`mb-12 ${layout === 'centered' ? 'text-center' : ''}`}>
          {title && (
            <h2 
              style={{
                fontFamily: 'var(--theme-font-heading)',
                fontSize: 'var(--theme-text-3xl)',
                fontWeight: 'var(--theme-font-weight-bold)',
                color: 'var(--theme-text)',
                marginBottom: subtitle ? '1rem' : '3rem'
              }}
            >
              {title}
            </h2>
          )}
          
          {subtitle && (
            <p 
              className={layout === 'centered' ? 'max-w-2xl mx-auto' : 'max-w-3xl'}
              style={{
                fontSize: 'var(--theme-text-lg)',
                color: 'var(--theme-text-muted)',
                lineHeight: 'var(--theme-line-height-relaxed)'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Content */}
        {layout === 'split' && showContactInfo ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>{renderForm()}</div>
            <div>{renderContactInfo()}</div>
          </div>
        ) : layout === 'centered' ? (
          <div className="max-w-2xl mx-auto">
            {renderForm()}
          </div>
        ) : (
          <div>{renderForm()}</div>
        )}
      </div>
      
      {/* Responsive padding */}
      <style jsx>{`
        @media (min-width: 768px) {
          section {
            padding: var(--theme-section-padding-tablet) 0;
          }
        }
        @media (min-width: 1024px) {
          section {
            padding: var(--theme-section-padding-desktop) 0;
          }
        }
      `}</style>
    </section>
  );
}