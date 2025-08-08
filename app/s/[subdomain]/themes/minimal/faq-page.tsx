'use client';

import { useState } from 'react';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';

interface FAQPageProps {
  settings?: any;
  pageData?: {
    page?: {
      title: string;
      content: string;
    };
  };
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export function FAQPage({ settings: sectionSettings, pageData }: FAQPageProps) {
  const { settings } = useTheme();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const page = pageData?.page;
  const title = sectionSettings?.title || page?.title || 'Frequently Asked Questions';
  const content = sectionSettings?.content || page?.content || '';
  const showTitle = sectionSettings?.showTitle ?? true;

  // Parse FAQ items from content or use default items
  const defaultFAQs: FAQItem[] = sectionSettings?.faqs || [
    {
      id: '1',
      question: 'How do I track my order?',
      answer: 'Once your order has been shipped, you will receive an email with tracking information. You can also track your order by logging into your account and viewing your order history.'
    },
    {
      id: '2',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all items in their original condition. Items must be unworn, unwashed, and have all tags attached. Please visit our returns page for more information.'
    },
    {
      id: '3',
      question: 'How long does shipping take?',
      answer: 'Standard shipping typically takes 5-7 business days. Express shipping options are available at checkout for faster delivery.'
    },
    {
      id: '4',
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location.'
    },
    {
      id: '5',
      question: 'How do I contact customer service?',
      answer: 'You can reach our customer service team via email at support@store.com or through our contact form. We typically respond within 24 hours.'
    }
  ];

  // Try to parse FAQs from page content if it's structured
  const parseFAQsFromContent = (content: string): FAQItem[] => {
    // Simple parser - looks for H3 tags as questions and following content as answers
    if (!content) return defaultFAQs;
    
    // For now, return default FAQs
    // TODO: Implement proper FAQ parsing from structured content
    return defaultFAQs;
  };

  const faqs = sectionSettings?.faqs || parseFAQsFromContent(content);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: 'var(--theme-background)',
      }}
    >
      <div 
        className="container mx-auto max-w-3xl"
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

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div 
              key={faq.id}
              className="border rounded-lg overflow-hidden transition-all"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-background)',
              }}
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:bg-gray-50"
                style={{
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                <h3 
                  className="pr-4"
                  style={{
                    fontSize: 'var(--theme-text-base)',
                    fontWeight: 'var(--theme-font-weight-medium)',
                    color: 'var(--theme-text)',
                  }}
                >
                  {faq.question}
                </h3>
                <MinimalIcons.ChevronDown
                  size={20}
                  className={`transition-transform ${openItems.includes(faq.id) ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
              </button>
              
              {openItems.includes(faq.id) && (
                <div 
                  className="px-6 pb-4"
                  style={{
                    fontSize: 'var(--theme-text-base)',
                    color: 'var(--theme-text-secondary)',
                    fontFamily: 'var(--theme-font-body)',
                    lineHeight: 'var(--theme-line-height-relaxed)',
                  }}
                >
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div 
          className="mt-12 text-center p-8 rounded-lg"
          style={{
            backgroundColor: 'var(--theme-background-alt)',
          }}
        >
          <h3 
            className="mb-2"
            style={{
              fontSize: 'var(--theme-text-xl)',
              fontFamily: 'var(--theme-font-heading)',
              fontWeight: 'var(--theme-font-weight-medium)',
              color: 'var(--theme-text)',
            }}
          >
            Still have questions?
          </h3>
          <p 
            className="mb-4"
            style={{
              fontSize: 'var(--theme-text-base)',
              color: 'var(--theme-text-secondary)',
              fontFamily: 'var(--theme-font-body)',
            }}
          >
            We're here to help! Contact our support team.
          </p>
          <a
            href="/pages/contact"
            className="inline-block px-6 py-3 rounded-lg transition-all"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'white',
              fontSize: 'var(--theme-text-base)',
              fontFamily: 'var(--theme-font-body)',
              fontWeight: 'var(--theme-font-weight-medium)',
            }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}