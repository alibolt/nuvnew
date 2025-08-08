'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { ChevronDownIcon, TruckIcon, HeartIcon, StarIcon } from '@/components/icons/minimal-icons';
import { cn } from '@/lib/utils';

interface ProductDescriptionProps {
  product: any;
  settings: {
    showDescription?: boolean;
    showSpecifications?: boolean;
    showShipping?: boolean;
    showReturns?: boolean;
    tabStyle?: 'tabs' | 'accordion';
  };
}

export function ProductDescription({ product, settings }: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState('description');
  const [openAccordions, setOpenAccordions] = useState<string[]>(['description']);

  const showDescription = settings.showDescription ?? true;
  const showSpecifications = settings.showSpecifications ?? true;
  const showShipping = settings.showShipping ?? true;
  const showReturns = settings.showReturns ?? true;
  const tabStyle = settings.tabStyle || 'tabs';

  const toggleAccordion = (section: string) => {
    setOpenAccordions(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const sections = [
    {
      id: 'description',
      title: 'Description',
      show: showDescription,
      content: (
        <div 
          className="prose prose-sm max-w-none"
          style={{ 
            color: 'var(--theme-text)',
            fontSize: 'var(--theme-text-base)'
          }}
          dangerouslySetInnerHTML={{ 
            __html: product.description || 'No description available.' 
          }}
        />
      )
    },
    {
      id: 'specifications',
      title: 'Specifications',
      show: showSpecifications,
      content: (
        <div className="space-y-3">
          {product.variants?.[0] && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.variants[0].weight && (
                <div>
                  <span style={{ color: 'var(--theme-text-muted)' }}>Weight:</span>
                  <span className="ml-2" style={{ color: 'var(--theme-text)' }}>
                    {product.variants[0].weight}g
                  </span>
                </div>
              )}
              {product.variants[0].dimensions && (
                <div>
                  <span style={{ color: 'var(--theme-text-muted)' }}>Dimensions:</span>
                  <span className="ml-2" style={{ color: 'var(--theme-text)' }}>
                    {product.variants[0].dimensions}
                  </span>
                </div>
              )}
              {product.material && (
                <div>
                  <span style={{ color: 'var(--theme-text-muted)' }}>Material:</span>
                  <span className="ml-2" style={{ color: 'var(--theme-text)' }}>
                    {product.material}
                  </span>
                </div>
              )}
              {product.origin && (
                <div>
                  <span style={{ color: 'var(--theme-text-muted)' }}>Origin:</span>
                  <span className="ml-2" style={{ color: 'var(--theme-text)' }}>
                    {product.origin}
                  </span>
                </div>
              )}
            </div>
          )}
          {(!product.variants?.[0]?.weight && !product.variants?.[0]?.dimensions && !product.material && !product.origin) && (
            <p style={{ color: 'var(--theme-text-muted)', fontSize: 'var(--theme-text-sm)' }}>
              No specifications available.
            </p>
          )}
        </div>
      )
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      show: showShipping,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span style={{ color: 'var(--theme-accent)' }}>
              <TruckIcon className="w-5 h-5 mt-0.5" />
            </span>
            <div>
              <h4 className="font-medium mb-1" style={{ color: 'var(--theme-text)' }}>
                Free Standard Shipping
              </h4>
              <p style={{ color: 'var(--theme-text-muted)', fontSize: 'var(--theme-text-sm)' }}>
                On orders over $50. Delivered in 5-7 business days.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 mt-0.5" style={{ color: 'var(--theme-accent)' }} />
            <div>
              <h4 className="font-medium mb-1" style={{ color: 'var(--theme-text)' }}>
                Express Delivery
              </h4>
              <p style={{ color: 'var(--theme-text-muted)', fontSize: 'var(--theme-text-sm)' }}>
                $15 express shipping. Delivered in 2-3 business days.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'returns',
      title: 'Returns & Exchanges',
      show: showReturns,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span style={{ color: 'var(--theme-accent)' }}>
              <HeartIcon className="w-5 h-5 mt-0.5" />
            </span>
            <div>
              <h4 className="font-medium mb-1" style={{ color: 'var(--theme-text)' }}>
                30-Day Returns
              </h4>
              <p style={{ color: 'var(--theme-text-muted)', fontSize: 'var(--theme-text-sm)' }}>
                Return items within 30 days for a full refund or exchange.
              </p>
            </div>
          </div>
          <div className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
            <ul className="space-y-1 ml-8 list-disc">
              <li>Items must be in original condition</li>
              <li>Return shipping is free for defective items</li>
              <li>Exchanges processed within 3-5 business days</li>
            </ul>
          </div>
        </div>
      )
    }
  ].filter(section => section.show);

  if (sections.length === 0) {
    return null;
  }

  if (tabStyle === 'accordion') {
    return (
      <div 
        className="space-y-4"
        style={{ fontFamily: 'var(--theme-font-body)' }}
      >
        {sections.map((section) => (
          <div 
            key={section.id}
            className="border rounded-lg overflow-hidden"
            style={{ 
              borderColor: 'var(--theme-border)',
              borderRadius: 'var(--theme-radius-lg)'
            }}
          >
            <button
              onClick={() => toggleAccordion(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              style={{ 
                backgroundColor: openAccordions.includes(section.id) ? 'var(--theme-surface)' : 'transparent'
              }}
            >
              <h3 
                className="font-medium"
                style={{ 
                  fontSize: 'var(--theme-text-base)',
                  color: 'var(--theme-text)'
                }}
              >
                {section.title}
              </h3>
              <ChevronDownIcon 
                className={cn(
                  "transition-transform",
                  openAccordions.includes(section.id) && "rotate-180"
                )}
                size={20}
                color="var(--theme-text-muted)"
              />
            </button>
            {openAccordions.includes(section.id) && (
              <div className="px-6 pb-6">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className="space-y-6"
      style={{ fontFamily: 'var(--theme-font-body)' }}
    >
      {/* Tab Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
        <nav className="flex space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={cn(
                "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === section.id
                  ? "border-[var(--theme-primary)] text-[var(--theme-primary)]"
                  : "border-transparent hover:border-gray-300"
              )}
              style={{
                color: activeTab === section.id ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
                fontSize: 'var(--theme-text-sm)'
              }}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {sections.find(section => section.id === activeTab)?.content}
      </div>
    </div>
  );
}