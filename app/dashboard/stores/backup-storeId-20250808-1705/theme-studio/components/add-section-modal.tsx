'use client';

import { useState } from 'react';
import { X, Layout, Type, Image, Package, Users, MessageSquare, Mail, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddSectionModalProps {
  onAdd: (section: any) => void;
  onClose: () => void;
}

const sectionTypes = [
  {
    id: 'hero',
    name: 'Hero Banner',
    description: 'Large banner with heading and call-to-action',
    icon: Image,
    defaultSettings: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover amazing products',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      backgroundImage: '',
      textAlign: 'center',
      height: 500,
    },
  },
  {
    id: 'featured-products',
    name: 'Featured Products',
    description: 'Showcase your best products',
    icon: Package,
    defaultSettings: {
      title: 'Featured Products',
      subtitle: 'Our best sellers',
      productCount: 4,
      columns: 4,
      showPrice: true,
      showAddToCart: true,
    },
  },
  {
    id: 'collections',
    name: 'Collections',
    description: 'Display product categories',
    icon: Grid,
    defaultSettings: {
      title: 'Shop by Category',
      columns: 3,
      showTitle: true,
      showProductCount: true,
    },
  },
  {
    id: 'image-with-text',
    name: 'Image with Text',
    description: 'Content section with image',
    icon: Layout,
    defaultSettings: {
      title: 'Our Story',
      content: 'Share your brand story here...',
      image: '',
      imagePosition: 'left',
      buttonText: 'Learn More',
      buttonLink: '/about',
    },
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Email signup form',
    icon: Mail,
    defaultSettings: {
      title: 'Subscribe to Our Newsletter',
      subtitle: 'Get the latest updates and exclusive offers',
      buttonText: 'Subscribe',
      placeholder: 'Enter your email',
      backgroundColor: '#f5f5f5',
    },
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer reviews and feedback',
    icon: MessageSquare,
    defaultSettings: {
      title: 'What Our Customers Say',
      columns: 3,
      autoplay: false,
    },
  },
  {
    id: 'rich-text',
    name: 'Rich Text',
    description: 'Custom content block',
    icon: Type,
    defaultSettings: {
      content: '<p>Add your custom content here...</p>',
      textAlign: 'left',
    },
  },
  {
    id: 'logo-list',
    name: 'Logo List',
    description: 'Partner or brand logos',
    icon: Users,
    defaultSettings: {
      title: 'Trusted By',
      columns: 5,
      grayscale: true,
    },
  },
];

export function AddSectionModal({ onAdd, onClose }: AddSectionModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState('');

  const handleAdd = () => {
    if (!selectedType) return;

    const sectionType = sectionTypes.find(t => t.id === selectedType);
    if (!sectionType) return;

    onAdd({
      type: selectedType,
      title: sectionName || sectionType.name,
      settings: { ...sectionType.defaultSettings },
      enabled: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add Section</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Section Name */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Section Name</label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="e.g. Summer Collection"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Section Types */}
          <div className="space-y-2">
            <label className="text-sm font-medium mb-2 block">Choose Section Type</label>
            <div className="grid grid-cols-2 gap-3">
              {sectionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "p-4 border rounded-lg text-left transition-all hover:border-primary",
                      selectedType === type.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{type.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedType}
            className={cn(
              "px-4 py-2 text-sm rounded-lg transition-colors",
              selectedType
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
}