'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@/components/icons/minimal-icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export function FAQ({ settings }: any) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  
  // Settings with defaults
  const title = settings.title || 'Frequently Asked Questions';
  const subtitle = settings.subtitle || '';
  const layout = settings.layout || 'centered'; // centered, two-column
  
  // Default FAQs if none provided
  const defaultFAQs: FAQItem[] = [
    {
      id: '1',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unworn items with original tags. Items must be returned in their original packaging. Refunds will be processed within 5-7 business days after we receive your return.'
    },
    {
      id: '2',
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping (2-3 business days) and overnight shipping are also available at checkout. International shipping times vary by destination.'
    },
    {
      id: '3',
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times are calculated at checkout based on your location.'
    },
    {
      id: '4',
      question: 'How do I track my order?',
      answer: 'Once your order ships, you will receive a confirmation email with a tracking number. You can track your package directly on our website or through the carrier\'s website.'
    },
    {
      id: '5',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are secured with SSL encryption.'
    }
  ];
  
  const faqs = settings.faqs && settings.faqs.length > 0 ? settings.faqs : defaultFAQs;
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  const renderFAQItem = (faq: FAQItem) => (
    <div 
      key={faq.id}
      className="border-b transition-all"
      style={{ 
        borderColor: 'var(--theme-border)',
        marginBottom: '1rem'
      }}
    >
      <button
        onClick={() => toggleItem(faq.id)}
        className="w-full py-4 flex items-start justify-between text-left transition-colors hover:opacity-80"
        style={{
          color: 'var(--theme-text)',
          fontSize: 'var(--theme-text-lg)',
          fontWeight: 'var(--theme-font-weight-medium)'
        }}
      >
        <span className="pr-8 flex-1">{faq.question}</span>
        <ChevronDownIcon 
          className={`flex-shrink-0 transition-transform duration-200 ${
            openItems.includes(faq.id) ? 'rotate-180' : ''
          }`}
          size={20}
          color="var(--theme-text-muted)"
        />
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          openItems.includes(faq.id) ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <div 
          style={{
            color: 'var(--theme-text-muted)',
            fontSize: 'var(--theme-text-base)',
            lineHeight: 'var(--theme-line-height-relaxed)'
          }}
        >
          {faq.answer}
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
              className="max-w-2xl mx-auto"
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
        
        {/* FAQ Items */}
        {layout === 'two-column' && faqs.length > 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              {faqs.slice(0, Math.ceil(faqs.length / 2)).map(renderFAQItem)}
            </div>
            <div>
              {faqs.slice(Math.ceil(faqs.length / 2)).map(renderFAQItem)}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {faqs.map(renderFAQItem)}
          </div>
        )}
        
        {/* Contact CTA */}
        {settings.showContactCTA !== false && (
          <div 
            className="text-center mt-12 pt-8"
            style={{ borderTop: `1px solid var(--theme-border)` }}
          >
            <p 
              style={{
                fontSize: 'var(--theme-text-base)',
                color: 'var(--theme-text-muted)',
                marginBottom: '1rem'
              }}
            >
              Can't find what you're looking for?
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-background)',
                padding: 'var(--theme-spacing-component-gap-sm) var(--theme-spacing-component-gap-md)',
                borderRadius: 'var(--theme-radius-md)',
                fontSize: 'var(--theme-text-base)',
                fontWeight: 'var(--theme-font-weight-semibold)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
              }}
            >
              Contact Support
            </a>
          </div>
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