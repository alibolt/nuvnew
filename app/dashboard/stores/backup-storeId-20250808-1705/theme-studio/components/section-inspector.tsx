'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  Eye, EyeOff, Type, Palette, Layout, Image, Link, Settings, 
  ChevronDown, ChevronRight, Monitor, Smartphone, Tablet,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  type: string;
  title: string;
  settings: any;
  enabled: boolean;
  position: number;
}

interface SectionInspectorProps {
  section: Section;
  onUpdate: (updates: Partial<Section>, skipHistory?: boolean) => void;
  onDelete?: () => void;
  compact?: boolean;
}

function SectionInspectorComponent({ section, onUpdate, onDelete, compact = false }: SectionInspectorProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'content': true,
    'style': compact ? false : true,
    'layout': compact ? false : true
  });
  const [menus, setMenus] = useState<Array<{ value: string; label: string }>>([
    { value: 'main-menu', label: 'Main Menu' },
    { value: 'footer-menu', label: 'Footer Menu' },
    { value: 'custom', label: 'Custom Menu Items' },
  ]);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Load menus for header section
  useEffect(() => {
    if (section.type === 'header') {
      // Extract store ID from URL
      const pathParts = window.location.pathname.split('/');
      const storeIdIndex = pathParts.indexOf('stores') + 1;
      const storeId = pathParts[storeIdIndex];
      
      if (storeId) {
        fetch(`/api/stores/${storeId}/menus`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const menuOptions = data.map(menu => ({
                value: menu.handle,
                label: menu.name
              }));
              setMenus([
                ...menuOptions,
                { value: 'custom', label: 'Custom Menu Items' }
              ]);
            }
          })
          .catch(err => {
            console.error('Failed to load menus:', err);
          });
      }
    }
  }, [section.type]);

  // Cleanup timeouts when section changes
  useEffect(() => {
    // Clear all pending debounced updates when section changes
    Object.values(debouncedUpdateRef.current).forEach(timeout => clearTimeout(timeout));
    debouncedUpdateRef.current = {};
  }, [section.id]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      Object.values(debouncedUpdateRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Immediate update for non-text inputs
  const handleSettingChange = (key: string, value: any) => {
    onUpdate({
      settings: {
        ...section.settings,
        [key]: value,
      },
    });
  };

  // Debounced update for text inputs - no dependencies to prevent re-creation
  const debouncedUpdateRef = useRef<{[key: string]: NodeJS.Timeout}>({});
  const onUpdateRef = useRef(onUpdate);
  const sectionRef = useRef(section);
  
  // Keep refs current
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    sectionRef.current = section;
  });
  
  const handleTextSettingChange = useCallback((key: string, value: any) => {
    // Clear existing timeout for this key
    if (debouncedUpdateRef.current[key]) {
      clearTimeout(debouncedUpdateRef.current[key]);
    }

    // Set new timeout for this specific key
    debouncedUpdateRef.current[key] = setTimeout(() => {
      onUpdateRef.current({
        settings: {
          ...sectionRef.current.settings,
          [key]: value,
        },
      }, true); // Skip history for text updates
      delete debouncedUpdateRef.current[key];
    }, 300); // 300ms delay
  }, []); // No dependencies!

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const SettingGroup = ({ title, icon: Icon, groupKey, children }: {
    title: string;
    icon: any;
    groupKey: string;
    children: React.ReactNode;
  }) => (
    <div className={cn("last:mb-0", compact ? "mb-2" : "border-b border-gray-200 mb-4")}>
      <button
        onClick={() => toggleGroup(groupKey)}
        className={cn(
          "w-full flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-md",
          compact ? "py-1.5 px-2 mb-1" : "p-3"
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn("p-1 rounded-md", compact ? "bg-blue-50" : "bg-blue-100")}>
            <Icon className={cn(compact ? "h-3 w-3" : "h-4 w-4", "text-blue-600")} />
          </div>
          <span className={cn(compact ? "text-xs" : "text-sm", "font-semibold text-gray-900")}>{title}</span>
        </div>
        {expandedGroups[groupKey] ? 
          <ChevronDown className={cn(compact ? "h-3 w-3" : "h-4 w-4", "text-gray-500")} /> : 
          <ChevronRight className={cn(compact ? "h-3 w-3" : "h-4 w-4", "text-gray-500")} />
        }
      </button>
      {expandedGroups[groupKey] && (
        <div className={cn(compact ? "px-2 pb-1 space-y-2" : "px-3 pb-3 space-y-4")}>
          {children}
        </div>
      )}
    </div>
  );

  const InputField = ({ label, type = 'text', value, onChange, placeholder, options, rows, useDebounce = false, fieldKey }: {
    label: string;
    type?: string;
    value: any;
    onChange: (value: any) => void;
    placeholder?: string;
    options?: { value: any; label: string }[];
    rows?: number;
    useDebounce?: boolean;
    fieldKey?: string;
  }) => {
    // Use provided value directly
    const displayValue = value;
    
    // Store ref to preserve focus during re-renders
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const wasFocused = useRef(false);
    
    // Preserve focus state across re-renders
    useEffect(() => {
      if (wasFocused.current && inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
        // Restore cursor position for text inputs
        if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }
    });

    return (
    <div className={cn(compact ? "mb-2" : "mb-3")}>
      {type !== 'checkbox' && (
        <label className={cn("block font-medium text-gray-700", compact ? "text-xs mb-1" : "text-sm mb-1.5")}>
          {label}
        </label>
      )}
      {type === 'select' ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn("w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm appearance-none bg-white", 
            compact ? "px-2.5 py-1 pr-7 text-xs" : "px-3 py-2 pr-8 text-sm"
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: compact ? 'right 0.4rem center' : 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: compact ? '0.8rem' : '1rem'
          }}
        >
          {options?.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          key={`${section.id}-${fieldKey || label.toLowerCase().replace(/\s+/g, '')}`}
          defaultValue={displayValue || ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn("w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none",
            compact ? "px-2.5 py-1 text-xs" : "px-3 py-2 text-sm"
          )}
          rows={compact ? (rows || 2) : (rows || 3)}
          placeholder={placeholder}
        />
      ) : type === 'color' ? (
        <div className="flex gap-3">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className={cn("border border-gray-300 rounded-lg cursor-pointer shadow-sm", compact ? "w-10 h-8" : "w-12 h-10")}
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => { wasFocused.current = true; }}
            onBlur={() => { wasFocused.current = false; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            className={cn("flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm",
              compact ? "px-2.5 py-1 text-xs" : "px-3 py-2 text-sm"
            )}
            placeholder={placeholder}
          />
        </div>
      ) : type === 'range' ? (
        <div className={cn(compact ? "space-y-2" : "space-y-3")}>
          <input
            type="range"
            min="0"
            max="100"
            value={value || 0}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={cn("w-full bg-gray-200 rounded-lg appearance-none cursor-pointer slider", compact ? "h-2" : "h-2")}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span className="font-medium text-gray-700">{value || 0}</span>
            <span>100</span>
          </div>
        </div>
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className={cn("text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2", compact ? "w-4 h-4" : "w-4 h-4")}
          />
          <span className={cn("text-gray-700 font-medium", compact ? "text-xs" : "text-sm")}>{label}</span>
        </label>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          key={`${section.id}-${fieldKey || label.toLowerCase().replace(/\s+/g, '')}`}
          type={type}
          defaultValue={displayValue || ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn("w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm",
            compact ? "px-2.5 py-1 text-xs" : "px-3 py-2 text-sm"
          )}
          placeholder={placeholder}
        />
      )}
    </div>
  );
  };

  const renderContentSettings = () => {
    // Use sectionType if type is not available
    const sectionType = section.type || (section as any).sectionType;
    
    switch (sectionType) {
      case 'announcement-bar':
        return (
          <div className="space-y-3">
            <InputField
              label="Announcement Text"
              fieldKey="text"
              value={section.settings?.text}
              onChange={(value) => handleTextSettingChange('text', value)}
              placeholder="Free shipping on orders over $50"
              useDebounce={true}
            />
            <InputField
              label="Link URL"
              value={section.settings?.link}
              onChange={(value) => handleSettingChange('link', value)}
              placeholder="/shipping"
            />
            <InputField
              label="Dismissible"
              type="checkbox"
              value={section.settings?.dismissible || false}
              onChange={(value) => handleSettingChange('dismissible', value)}
            />
          </div>
        );
      
      case 'hero':
        return (
          <div className="space-y-3">
            <InputField
              label="Background Image URL"
              fieldKey="image"
              value={section.settings?.image}
              onChange={(value) => handleTextSettingChange('image', value)}
              placeholder="https://example.com/hero-image.jpg"
              useDebounce={true}
            />
            <InputField
              label="Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Welcome to Our Store"
              useDebounce={true}
            />
            <InputField
              label="Subtitle"
              fieldKey="subtitle"
              type="textarea"
              value={section.settings?.subtitle}
              onChange={(value) => handleTextSettingChange('subtitle', value)}
              placeholder="Discover amazing products"
              rows={2}
              useDebounce={true}
            />
            <InputField
              label="Button Text"
              value={section.settings?.buttonText}
              onChange={(value) => handleSettingChange('buttonText', value)}
              placeholder="Shop Now"
            />
            <InputField
              label="Button Link"
              value={section.settings?.buttonLink}
              onChange={(value) => handleSettingChange('buttonLink', value)}
              placeholder="/collections/all"
            />
          </div>
        );
      
      case 'featured-products':
        return (
          <div className="space-y-3">
            <InputField
              label="Section Title"
              value={section.settings?.title}
              onChange={(value) => handleSettingChange('title', value)}
              placeholder="Featured Products"
            />
            <InputField
              label="Products to Show"
              type="select"
              value={section.settings?.productCount || 6}
              onChange={(value) => handleSettingChange('productCount', parseInt(value))}
              options={[
                { value: 3, label: '3 Products' },
                { value: 6, label: '6 Products' },
                { value: 9, label: '9 Products' },
              ]}
            />
          </div>
        );

      case 'header':
        return (
          <div className="space-y-3">
            <InputField
              label="Navigation Menu"
              type="select"
              value={section.settings?.menuHandle || 'main-menu'}
              onChange={(value) => handleSettingChange('menuHandle', value)}
              options={menus}
            />
            <InputField
              label="Show Search"
              type="checkbox"
              value={section.settings?.showSearch !== false}
              onChange={(value) => handleSettingChange('showSearch', value)}
            />
            <InputField
              label="Show Cart"
              type="checkbox"
              value={section.settings?.showCart !== false}
              onChange={(value) => handleSettingChange('showCart', value)}
            />
          </div>
        );

      case 'image-with-text':
        return (
          <div className="space-y-3">
            <InputField
              label="Image URL"
              fieldKey="image"
              value={section.settings?.image}
              onChange={(value) => handleTextSettingChange('image', value)}
              placeholder="https://example.com/image.jpg"
              useDebounce={true}
            />
            <InputField
              label="Heading"
              fieldKey="heading"
              value={section.settings?.heading}
              onChange={(value) => handleTextSettingChange('heading', value)}
              placeholder="Section heading"
              useDebounce={true}
            />
            <InputField
              label="Text Content"
              fieldKey="text"
              type="textarea"
              value={section.settings?.text}
              onChange={(value) => handleTextSettingChange('text', value)}
              placeholder="Enter your content"
              rows={3}
              useDebounce={true}
            />
            <InputField
              label="Button Text"
              value={section.settings?.buttonText}
              onChange={(value) => handleSettingChange('buttonText', value)}
              placeholder="Learn More"
            />
            <InputField
              label="Button Link"
              value={section.settings?.buttonLink}
              onChange={(value) => handleSettingChange('buttonLink', value)}
              placeholder="/about"
            />
          </div>
        );

      case 'rich-text':
        return (
          <div className="space-y-3">
            <InputField
              label="Heading"
              fieldKey="heading"
              value={section.settings?.heading}
              onChange={(value) => handleTextSettingChange('heading', value)}
              placeholder="Section heading"
              useDebounce={true}
            />
            <InputField
              label="Content"
              fieldKey="content"
              type="textarea"
              value={section.settings?.content}
              onChange={(value) => handleTextSettingChange('content', value)}
              placeholder="Enter your content here..."
              rows={5}
              useDebounce={true}
            />
          </div>
        );

      case 'newsletter':
        return (
          <div className="space-y-3">
            <InputField
              label="Heading"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Stay Updated"
              useDebounce={true}
            />
            <InputField
              label="Subtitle"
              fieldKey="subtitle"
              type="textarea"
              value={section.settings?.subtitle}
              onChange={(value) => handleTextSettingChange('subtitle', value)}
              placeholder="Subscribe to get special offers and new arrivals"
              rows={2}
              useDebounce={true}
            />
            <InputField
              label="Button Text"
              value={section.settings?.buttonText || 'Subscribe'}
              onChange={(value) => handleSettingChange('buttonText', value)}
              placeholder="Subscribe"
            />
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-1">
            <InputField
              label="Section Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="What Our Customers Say"
              useDebounce={true}
            />
            <InputField
              label="Layout"
              type="select"
              value={section.settings?.layout || 'grid'}
              onChange={(value) => handleSettingChange('layout', value)}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'carousel', label: 'Carousel' },
                { value: 'single', label: 'Single' },
              ]}
            />
            <InputField
              label="Columns (Desktop)"
              type="select"
              value={section.settings?.columns?.desktop || 3}
              onChange={(value) => handleSettingChange('columns', { ...section.settings?.columns, desktop: parseInt(value) })}
              options={[
                { value: 1, label: '1 Column' },
                { value: 2, label: '2 Columns' },
                { value: 3, label: '3 Columns' },
                { value: 4, label: '4 Columns' },
              ]}
            />
            <InputField
              label="Show Star Ratings"
              type="checkbox"
              value={section.settings?.showRatings !== false}
              onChange={(value) => handleSettingChange('showRatings', value)}
            />
            <InputField
              label="Show Customer Photos"
              type="checkbox"
              value={section.settings?.showPhotos || false}
              onChange={(value) => handleSettingChange('showPhotos', value)}
            />
          </div>
        );

      case 'collections':
        return (
          <div className="space-y-1">
            <InputField
              label="Section Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Shop by Collection"
              useDebounce={true}
            />
            <InputField
              label="Layout"
              type="select"
              value={section.settings?.layout || 'grid'}
              onChange={(value) => handleSettingChange('layout', value)}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
                { value: 'carousel', label: 'Carousel' },
              ]}
            />
            <InputField
              label="Columns (Desktop)"
              type="select"
              value={section.settings?.columns?.desktop || 4}
              onChange={(value) => handleSettingChange('columns', { ...section.settings?.columns, desktop: parseInt(value) })}
              options={[
                { value: 2, label: '2 Columns' },
                { value: 3, label: '3 Columns' },
                { value: 4, label: '4 Columns' },
                { value: 6, label: '6 Columns' },
              ]}
            />
            <InputField
              label="Show Collection Images"
              type="checkbox"
              value={section.settings?.showImages !== false}
              onChange={(value) => handleSettingChange('showImages', value)}
            />
            <InputField
              label="Show Product Count"
              type="checkbox"
              value={section.settings?.showProductCount || false}
              onChange={(value) => handleSettingChange('showProductCount', value)}
            />
          </div>
        );

      case 'product-grid':
        return (
          <div className="space-y-1">
            <InputField
              label="Section Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Our Products"
              useDebounce={true}
            />
            <InputField
              label="Products to Show"
              type="select"
              value={section.settings?.limit || 12}
              onChange={(value) => handleSettingChange('limit', parseInt(value))}
              options={[
                { value: 6, label: '6 Products' },
                { value: 9, label: '9 Products' },
                { value: 12, label: '12 Products' },
                { value: 18, label: '18 Products' },
                { value: 24, label: '24 Products' },
              ]}
            />
            <InputField
              label="Columns (Desktop)"
              type="select"
              value={section.settings?.columns?.desktop || 4}
              onChange={(value) => handleSettingChange('columns', { ...section.settings?.columns, desktop: parseInt(value) })}
              options={[
                { value: 2, label: '2 Columns' },
                { value: 3, label: '3 Columns' },
                { value: 4, label: '4 Columns' },
                { value: 5, label: '5 Columns' },
                { value: 6, label: '6 Columns' },
              ]}
            />
            <InputField
              label="Filter by Collection"
              type="select"
              value={section.settings?.collection || 'all'}
              onChange={(value) => handleSettingChange('collection', value)}
              options={[
                { value: 'all', label: 'All Products' },
                { value: 'featured', label: 'Featured' },
                { value: 'new', label: 'New Arrivals' },
                { value: 'sale', label: 'On Sale' },
              ]}
            />
            <InputField
              label="Show Quick Add"
              type="checkbox"
              value={section.settings?.showQuickAdd || false}
              onChange={(value) => handleSettingChange('showQuickAdd', value)}
            />
            <InputField
              label="Show Pagination"
              type="checkbox"
              value={section.settings?.showPagination !== false}
              onChange={(value) => handleSettingChange('showPagination', value)}
            />
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-3">
            <InputField
              label="Description"
              fieldKey="description"
              type="textarea"
              value={section.settings?.description}
              onChange={(value) => handleTextSettingChange('description', value)}
              placeholder="Store description"
              rows={3}
              useDebounce={true}
            />
            <InputField
              label="Show Social Links"
              type="checkbox"
              value={section.settings?.showSocialLinks !== false}
              onChange={(value) => handleSettingChange('showSocialLinks', value)}
            />
            <InputField
              label="Show Contact Info"
              type="checkbox"
              value={section.settings?.showContact !== false}
              onChange={(value) => handleSettingChange('showContact', value)}
            />
          </div>
        );

      case 'instagram-feed':
        return (
          <div className="space-y-1">
            <InputField
              label="Section Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Follow Us on Instagram"
              useDebounce={true}
            />
            <InputField
              label="Instagram Username"
              value={section.settings?.username}
              onChange={(value) => handleSettingChange('username', value)}
              placeholder="@yourstore"
            />
            <InputField
              label="Number of Posts"
              type="select"
              value={section.settings?.postCount || 6}
              onChange={(value) => handleSettingChange('postCount', parseInt(value))}
              options={[
                { value: 4, label: '4 Posts' },
                { value: 6, label: '6 Posts' },
                { value: 8, label: '8 Posts' },
                { value: 12, label: '12 Posts' },
              ]}
            />
            <InputField
              label="Layout"
              type="select"
              value={section.settings?.layout || 'grid'}
              onChange={(value) => handleSettingChange('layout', value)}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'carousel', label: 'Carousel' },
              ]}
            />
            <InputField
              label="Show Instagram Link"
              type="checkbox"
              value={section.settings?.showLink !== false}
              onChange={(value) => handleSettingChange('showLink', value)}
            />
          </div>
        );

      case 'contact-form':
        return (
          <div className="space-y-1">
            <InputField
              label="Form Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Get in Touch"
              useDebounce={true}
            />
            <InputField
              label="Description"
              fieldKey="description"
              type="textarea"
              value={section.settings?.description}
              onChange={(value) => handleTextSettingChange('description', value)}
              placeholder="We'd love to hear from you"
              rows={2}
              useDebounce={true}
            />
            <InputField
              label="Show Name Field"
              type="checkbox"
              value={section.settings?.showName !== false}
              onChange={(value) => handleSettingChange('showName', value)}
            />
            <InputField
              label="Show Phone Field"
              type="checkbox"
              value={section.settings?.showPhone || false}
              onChange={(value) => handleSettingChange('showPhone', value)}
            />
            <InputField
              label="Show Subject Field"
              type="checkbox"
              value={section.settings?.showSubject || false}
              onChange={(value) => handleSettingChange('showSubject', value)}
            />
            <InputField
              label="Email Recipient"
              value={section.settings?.recipient}
              onChange={(value) => handleSettingChange('recipient', value)}
              placeholder="contact@yourstore.com"
            />
            <InputField
              label="Success Message"
              fieldKey="successMessage"
              type="textarea"
              value={section.settings?.successMessage}
              onChange={(value) => handleTextSettingChange('successMessage', value)}
              placeholder="Thank you for your message! We'll get back to you soon."
              rows={2}
              useDebounce={true}
            />
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-1">
            <InputField
              label="Section Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Frequently Asked Questions"
              useDebounce={true}
            />
            <InputField
              label="Description"
              fieldKey="description"
              type="textarea"
              value={section.settings?.description}
              onChange={(value) => handleTextSettingChange('description', value)}
              placeholder="Find answers to common questions"
              rows={2}
              useDebounce={true}
            />
            <InputField
              label="Layout"
              type="select"
              value={section.settings?.layout || 'accordion'}
              onChange={(value) => handleSettingChange('layout', value)}
              options={[
                { value: 'accordion', label: 'Accordion' },
                { value: 'tabs', label: 'Tabs' },
                { value: 'list', label: 'Simple List' },
              ]}
            />
            <InputField
              label="Allow Multiple Open"
              type="checkbox"
              value={section.settings?.allowMultiple || false}
              onChange={(value) => handleSettingChange('allowMultiple', value)}
            />
            <InputField
              label="Show Search"
              type="checkbox"
              value={section.settings?.showSearch || false}
              onChange={(value) => handleSettingChange('showSearch', value)}
            />
          </div>
        );

      case 'logo-list':
        return (
          <div className="space-y-1">
            <InputField
              label="Section Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Trusted by Leading Brands"
              useDebounce={true}
            />
            <InputField
              label="Layout"
              type="select"
              value={section.settings?.layout || 'grid'}
              onChange={(value) => handleSettingChange('layout', value)}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'carousel', label: 'Carousel' },
                { value: 'inline', label: 'Inline' },
              ]}
            />
            <InputField
              label="Logos per Row (Desktop)"
              type="select"
              value={section.settings?.columns?.desktop || 6}
              onChange={(value) => handleSettingChange('columns', { ...section.settings?.columns, desktop: parseInt(value) })}
              options={[
                { value: 3, label: '3 Logos' },
                { value: 4, label: '4 Logos' },
                { value: 5, label: '5 Logos' },
                { value: 6, label: '6 Logos' },
                { value: 8, label: '8 Logos' },
              ]}
            />
            <InputField
              label="Logo Style"
              type="select"
              value={section.settings?.style || 'grayscale'}
              onChange={(value) => handleSettingChange('style', value)}
              options={[
                { value: 'grayscale', label: 'Grayscale' },
                { value: 'color', label: 'Full Color' },
                { value: 'hover-color', label: 'Color on Hover' },
              ]}
            />
            <InputField
              label="Auto Scroll (Carousel)"
              type="checkbox"
              value={section.settings?.autoScroll || false}
              onChange={(value) => handleSettingChange('autoScroll', value)}
            />
          </div>
        );

      case 'product-info':
        return (
          <div className="space-y-1">
            <InputField
              label="Show Product Title"
              type="checkbox"
              value={section.settings?.showTitle !== false}
              onChange={(value) => handleSettingChange('showTitle', value)}
            />
            <InputField
              label="Show Price"
              type="checkbox"
              value={section.settings?.showPrice !== false}
              onChange={(value) => handleSettingChange('showPrice', value)}
            />
            <InputField
              label="Show Compare Price"
              type="checkbox"
              value={section.settings?.showComparePrice !== false}
              onChange={(value) => handleSettingChange('showComparePrice', value)}
            />
            <InputField
              label="Show SKU"
              type="checkbox"
              value={section.settings?.showSku || false}
              onChange={(value) => handleSettingChange('showSku', value)}
            />
            <InputField
              label="Show Vendor"
              type="checkbox"
              value={section.settings?.showVendor || false}
              onChange={(value) => handleSettingChange('showVendor', value)}
            />
            <InputField
              label="Show Quantity Selector"
              type="checkbox"
              value={section.settings?.showQuantity !== false}
              onChange={(value) => handleSettingChange('showQuantity', value)}
            />
            <InputField
              label="Show Add to Cart Button"
              type="checkbox"
              value={section.settings?.showAddToCart !== false}
              onChange={(value) => handleSettingChange('showAddToCart', value)}
            />
            <InputField
              label="Show Buy Now Button"
              type="checkbox"
              value={section.settings?.showBuyNow || false}
              onChange={(value) => handleSettingChange('showBuyNow', value)}
            />
            <InputField
              label="Button Style"
              type="select"
              value={section.settings?.buttonStyle || 'primary'}
              onChange={(value) => handleSettingChange('buttonStyle', value)}
              options={[
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'outline', label: 'Outline' },
              ]}
            />
          </div>
        );

      case 'product-gallery':
        return (
          <div className="space-y-1">
            <InputField
              label="Gallery Layout"
              type="select"
              value={section.settings?.layout || 'thumbnails'}
              onChange={(value) => handleSettingChange('layout', value)}
              options={[
                { value: 'thumbnails', label: 'Thumbnails' },
                { value: 'dots', label: 'Dots' },
                { value: 'carousel', label: 'Carousel' },
                { value: 'grid', label: 'Grid' },
              ]}
            />
            <InputField
              label="Thumbnail Position"
              type="select"
              value={section.settings?.thumbnailPosition || 'bottom'}
              onChange={(value) => handleSettingChange('thumbnailPosition', value)}
              options={[
                { value: 'bottom', label: 'Bottom' },
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ]}
            />
            <InputField
              label="Enable Zoom"
              type="checkbox"
              value={section.settings?.enableZoom !== false}
              onChange={(value) => handleSettingChange('enableZoom', value)}
            />
            <InputField
              label="Enable Lightbox"
              type="checkbox"
              value={section.settings?.enableLightbox !== false}
              onChange={(value) => handleSettingChange('enableLightbox', value)}
            />
            <InputField
              label="Show Video Play Button"
              type="checkbox"
              value={section.settings?.showVideoButton !== false}
              onChange={(value) => handleSettingChange('showVideoButton', value)}
            />
          </div>
        );

      case 'product-description':
        return (
          <div className="space-y-1">
            <InputField
              label="Show Full Description"
              type="checkbox"
              value={section.settings?.showFullDescription !== false}
              onChange={(value) => handleSettingChange('showFullDescription', value)}
            />
            <InputField
              label="Enable Read More"
              type="checkbox"
              value={section.settings?.enableReadMore || false}
              onChange={(value) => handleSettingChange('enableReadMore', value)}
            />
            {section.settings?.enableReadMore && (
              <InputField
                label="Character Limit"
                type="number"
                value={section.settings?.characterLimit || 200}
                onChange={(value) => handleSettingChange('characterLimit', parseInt(value))}
                placeholder="200"
              />
            )}
            <InputField
              label="Show Specifications"
              type="checkbox"
              value={section.settings?.showSpecs || false}
              onChange={(value) => handleSettingChange('showSpecs', value)}
            />
            <InputField
              label="Show Shipping Info"
              type="checkbox"
              value={section.settings?.showShipping || false}
              onChange={(value) => handleSettingChange('showShipping', value)}
            />
            <InputField
              label="Show Return Policy"
              type="checkbox"
              value={section.settings?.showReturnPolicy || false}
              onChange={(value) => handleSettingChange('showReturnPolicy', value)}
            />
          </div>
        );

      case 'product-reviews':
        return (
          <div className="space-y-1">
            <InputField
              label="Section Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Customer Reviews"
              useDebounce={true}
            />
            <InputField
              label="Show Rating Summary"
              type="checkbox"
              value={section.settings?.showSummary !== false}
              onChange={(value) => handleSettingChange('showSummary', value)}
            />
            <InputField
              label="Reviews per Page"
              type="select"
              value={section.settings?.reviewsPerPage || 5}
              onChange={(value) => handleSettingChange('reviewsPerPage', parseInt(value))}
              options={[
                { value: 5, label: '5 Reviews' },
                { value: 10, label: '10 Reviews' },
                { value: 15, label: '15 Reviews' },
                { value: 20, label: '20 Reviews' },
              ]}
            />
            <InputField
              label="Enable Review Submission"
              type="checkbox"
              value={section.settings?.enableSubmission !== false}
              onChange={(value) => handleSettingChange('enableSubmission', value)}
            />
            <InputField
              label="Require Purchase for Review"
              type="checkbox"
              value={section.settings?.requirePurchase || false}
              onChange={(value) => handleSettingChange('requirePurchase', value)}
            />
            <InputField
              label="Show Photos in Reviews"
              type="checkbox"
              value={section.settings?.showPhotos || false}
              onChange={(value) => handleSettingChange('showPhotos', value)}
            />
            <InputField
              label="Enable Review Sorting"
              type="checkbox"
              value={section.settings?.enableSorting !== false}
              onChange={(value) => handleSettingChange('enableSorting', value)}
            />
          </div>
        );

      case 'related-products':
        return (
          <div className="space-y-1">
            <InputField
              label="Section Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="You May Also Like"
              useDebounce={true}
            />
            <InputField
              label="Number of Products"
              type="select"
              value={section.settings?.maxProducts || 4}
              onChange={(value) => handleSettingChange('maxProducts', parseInt(value))}
              options={[
                { value: 2, label: '2 Products' },
                { value: 3, label: '3 Products' },
                { value: 4, label: '4 Products' },
                { value: 6, label: '6 Products' },
                { value: 8, label: '8 Products' },
              ]}
            />
            <InputField
              label="Recommendation Logic"
              type="select"
              value={section.settings?.logic || 'related'}
              onChange={(value) => handleSettingChange('logic', value)}
              options={[
                { value: 'related', label: 'Related Products' },
                { value: 'category', label: 'Same Category' },
                { value: 'tags', label: 'Similar Tags' },
                { value: 'viewed', label: 'Recently Viewed' },
              ]}
            />
            <InputField
              label="Layout"
              type="select"
              value={section.settings?.layout || 'grid'}
              onChange={(value) => handleSettingChange('layout', value)}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'carousel', label: 'Carousel' },
                { value: 'list', label: 'List' },
              ]}
            />
            <InputField
              label="Show Quick Add"
              type="checkbox"
              value={section.settings?.showQuickAdd || false}
              onChange={(value) => handleSettingChange('showQuickAdd', value)}
            />
          </div>
        );

      case 'recently-viewed':
        return (
          <div className="space-y-1">
            <InputField
              label="Section Title"
              fieldKey="title"
              value={section.settings?.title}
              onChange={(value) => handleTextSettingChange('title', value)}
              placeholder="Recently Viewed"
              useDebounce={true}
            />
            <InputField
              label="Number of Products"
              type="select"
              value={section.settings?.maxProducts || 4}
              onChange={(value) => handleSettingChange('maxProducts', parseInt(value))}
              options={[
                { value: 2, label: '2 Products' },
                { value: 3, label: '3 Products' },
                { value: 4, label: '4 Products' },
                { value: 6, label: '6 Products' },
                { value: 8, label: '8 Products' },
              ]}
            />
            <InputField
              label="Storage Duration (Days)"
              type="select"
              value={section.settings?.storageDays || 30}
              onChange={(value) => handleSettingChange('storageDays', parseInt(value))}
              options={[
                { value: 7, label: '7 Days' },
                { value: 14, label: '14 Days' },
                { value: 30, label: '30 Days' },
                { value: 60, label: '60 Days' },
                { value: 90, label: '90 Days' },
              ]}
            />
            <InputField
              label="Layout"
              type="select"
              value={section.settings?.layout || 'carousel'}
              onChange={(value) => handleSettingChange('layout', value)}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'carousel', label: 'Carousel' },
                { value: 'list', label: 'List' },
              ]}
            />
            <InputField
              label="Hide if Empty"
              type="checkbox"
              value={section.settings?.hideIfEmpty !== false}
              onChange={(value) => handleSettingChange('hideIfEmpty', value)}
            />
          </div>
        );

      case 'collection-banner':
        return (
          <div className="space-y-1">
            <InputField
              label="Show Collection Title"
              type="checkbox"
              value={section.settings?.showTitle !== false}
              onChange={(value) => handleSettingChange('showTitle', value)}
            />
            <InputField
              label="Show Collection Description"
              type="checkbox"
              value={section.settings?.showDescription !== false}
              onChange={(value) => handleSettingChange('showDescription', value)}
            />
            <InputField
              label="Show Collection Image"
              type="checkbox"
              value={section.settings?.showImage !== false}
              onChange={(value) => handleSettingChange('showImage', value)}
            />
            <InputField
              label="Banner Height"
              type="select"
              value={section.settings?.height || 'medium'}
              onChange={(value) => handleSettingChange('height', value)}
              options={[
                { value: 'small', label: 'Small (200px)' },
                { value: 'medium', label: 'Medium (300px)' },
                { value: 'large', label: 'Large (400px)' },
                { value: 'full', label: 'Full Height' },
              ]}
            />
            <InputField
              label="Text Overlay"
              type="checkbox"
              value={section.settings?.textOverlay || false}
              onChange={(value) => handleSettingChange('textOverlay', value)}
            />
            {section.settings?.textOverlay && (
              <InputField
                label="Overlay Opacity"
                type="range"
                value={section.settings?.overlayOpacity || 50}
                onChange={(value) => handleSettingChange('overlayOpacity', value)}
              />
            )}
            <InputField
              label="Content Position"
              type="select"
              value={section.settings?.contentPosition || 'center'}
              onChange={(value) => handleSettingChange('contentPosition', value)}
              options={[
                { value: 'top-left', label: 'Top Left' },
                { value: 'top-center', label: 'Top Center' },
                { value: 'top-right', label: 'Top Right' },
                { value: 'center-left', label: 'Center Left' },
                { value: 'center', label: 'Center' },
                { value: 'center-right', label: 'Center Right' },
                { value: 'bottom-left', label: 'Bottom Left' },
                { value: 'bottom-center', label: 'Bottom Center' },
                { value: 'bottom-right', label: 'Bottom Right' },
              ]}
            />
          </div>
        );

      case 'collection-filters':
        return (
          <div className="space-y-1">
            <InputField
              label="Filter Position"
              type="select"
              value={section.settings?.position || 'sidebar'}
              onChange={(value) => handleSettingChange('position', value)}
              options={[
                { value: 'sidebar', label: 'Sidebar' },
                { value: 'top', label: 'Top Bar' },
                { value: 'drawer', label: 'Mobile Drawer' },
              ]}
            />
            <InputField
              label="Show Price Filter"
              type="checkbox"
              value={section.settings?.showPriceFilter !== false}
              onChange={(value) => handleSettingChange('showPriceFilter', value)}
            />
            <InputField
              label="Show Brand Filter"
              type="checkbox"
              value={section.settings?.showBrandFilter || false}
              onChange={(value) => handleSettingChange('showBrandFilter', value)}
            />
            <InputField
              label="Show Color Filter"
              type="checkbox"
              value={section.settings?.showColorFilter || false}
              onChange={(value) => handleSettingChange('showColorFilter', value)}
            />
            <InputField
              label="Show Size Filter"
              type="checkbox"
              value={section.settings?.showSizeFilter || false}
              onChange={(value) => handleSettingChange('showSizeFilter', value)}
            />
            <InputField
              label="Show Availability Filter"
              type="checkbox"
              value={section.settings?.showAvailabilityFilter || false}
              onChange={(value) => handleSettingChange('showAvailabilityFilter', value)}
            />
            <InputField
              label="Show Rating Filter"
              type="checkbox"
              value={section.settings?.showRatingFilter || false}
              onChange={(value) => handleSettingChange('showRatingFilter', value)}
            />
            <InputField
              label="Collapsible Filters"
              type="checkbox"
              value={section.settings?.collapsible !== false}
              onChange={(value) => handleSettingChange('collapsible', value)}
            />
            <InputField
              label="Show Clear All Button"
              type="checkbox"
              value={section.settings?.showClearAll !== false}
              onChange={(value) => handleSettingChange('showClearAll', value)}
            />
          </div>
        );

      case 'collection-grid':
        return (
          <div className="space-y-1">
            <InputField
              label="Products per Page"
              type="select"
              value={section.settings?.productsPerPage || 24}
              onChange={(value) => handleSettingChange('productsPerPage', parseInt(value))}
              options={[
                { value: 12, label: '12 Products' },
                { value: 18, label: '18 Products' },
                { value: 24, label: '24 Products' },
                { value: 36, label: '36 Products' },
                { value: 48, label: '48 Products' },
              ]}
            />
            <InputField
              label="Grid Columns (Desktop)"
              type="select"
              value={section.settings?.columns?.desktop || 4}
              onChange={(value) => handleSettingChange('columns', { ...section.settings?.columns, desktop: parseInt(value) })}
              options={[
                { value: 2, label: '2 Columns' },
                { value: 3, label: '3 Columns' },
                { value: 4, label: '4 Columns' },
                { value: 5, label: '5 Columns' },
                { value: 6, label: '6 Columns' },
              ]}
            />
            <InputField
              label="Grid Columns (Tablet)"
              type="select"
              value={section.settings?.columns?.tablet || 3}
              onChange={(value) => handleSettingChange('columns', { ...section.settings?.columns, tablet: parseInt(value) })}
              options={[
                { value: 2, label: '2 Columns' },
                { value: 3, label: '3 Columns' },
                { value: 4, label: '4 Columns' },
              ]}
            />
            <InputField
              label="Grid Columns (Mobile)"
              type="select"
              value={section.settings?.columns?.mobile || 2}
              onChange={(value) => handleSettingChange('columns', { ...section.settings?.columns, mobile: parseInt(value) })}
              options={[
                { value: 1, label: '1 Column' },
                { value: 2, label: '2 Columns' },
              ]}
            />
            <InputField
              label="Show Product Images"
              type="checkbox"
              value={section.settings?.showImages !== false}
              onChange={(value) => handleSettingChange('showImages', value)}
            />
            <InputField
              label="Show Product Prices"
              type="checkbox"
              value={section.settings?.showPrices !== false}
              onChange={(value) => handleSettingChange('showPrices', value)}
            />
            <InputField
              label="Show Quick Add Button"
              type="checkbox"
              value={section.settings?.showQuickAdd || false}
              onChange={(value) => handleSettingChange('showQuickAdd', value)}
            />
            <InputField
              label="Show Product Ratings"
              type="checkbox"
              value={section.settings?.showRatings || false}
              onChange={(value) => handleSettingChange('showRatings', value)}
            />
            <InputField
              label="Image Aspect Ratio"
              type="select"
              value={section.settings?.imageRatio || 'square'}
              onChange={(value) => handleSettingChange('imageRatio', value)}
              options={[
                { value: 'square', label: 'Square (1:1)' },
                { value: 'portrait', label: 'Portrait (3:4)' },
                { value: 'landscape', label: 'Landscape (4:3)' },
                { value: 'natural', label: 'Natural' },
              ]}
            />
          </div>
        );

      case 'collection-header':
        return (
          <div className="space-y-1">
            <InputField
              label="Show Collection Title"
              type="checkbox"
              value={section.settings?.showTitle !== false}
              onChange={(value) => handleSettingChange('showTitle', value)}
            />
            <InputField
              label="Show Product Count"
              type="checkbox"
              value={section.settings?.showProductCount !== false}
              onChange={(value) => handleSettingChange('showProductCount', value)}
            />
            <InputField
              label="Show Sort Options"
              type="checkbox"
              value={section.settings?.showSortOptions !== false}
              onChange={(value) => handleSettingChange('showSortOptions', value)}
            />
            <InputField
              label="Show View Toggle"
              type="checkbox"
              value={section.settings?.showViewToggle || false}
              onChange={(value) => handleSettingChange('showViewToggle', value)}
            />
            <InputField
              label="Available Sort Options"
              type="select"
              value={section.settings?.sortOptions || 'all'}
              onChange={(value) => handleSettingChange('sortOptions', value)}
              options={[
                { value: 'all', label: 'All Options' },
                { value: 'basic', label: 'Basic (Name, Price)' },
                { value: 'advanced', label: 'Advanced (Date, Rating)' },
              ]}
            />
            <InputField
              label="Default Sort Order"
              type="select"
              value={section.settings?.defaultSort || 'name-asc'}
              onChange={(value) => handleSettingChange('defaultSort', value)}
              options={[
                { value: 'name-asc', label: 'Name A-Z' },
                { value: 'name-desc', label: 'Name Z-A' },
                { value: 'price-asc', label: 'Price Low-High' },
                { value: 'price-desc', label: 'Price High-Low' },
                { value: 'date-desc', label: 'Newest First' },
                { value: 'date-asc', label: 'Oldest First' },
              ]}
            />
            <InputField
              label="Show Breadcrumbs"
              type="checkbox"
              value={section.settings?.showBreadcrumbs !== false}
              onChange={(value) => handleSettingChange('showBreadcrumbs', value)}
            />
          </div>
        );

      case 'collection-products':
        return (
          <div className="space-y-1">
            <InputField
              label="Display Mode"
              type="select"
              value={section.settings?.displayMode || 'grid'}
              onChange={(value) => handleSettingChange('displayMode', value)}
              options={[
                { value: 'grid', label: 'Grid View' },
                { value: 'list', label: 'List View' },
                { value: 'masonry', label: 'Masonry' },
              ]}
            />
            <InputField
              label="Products per Row"
              type="select"
              value={section.settings?.productsPerRow || 4}
              onChange={(value) => handleSettingChange('productsPerRow', parseInt(value))}
              options={[
                { value: 2, label: '2 Products' },
                { value: 3, label: '3 Products' },
                { value: 4, label: '4 Products' },
                { value: 5, label: '5 Products' },
                { value: 6, label: '6 Products' },
              ]}
            />
            <InputField
              label="Show Product Vendor"
              type="checkbox"
              value={section.settings?.showVendor || false}
              onChange={(value) => handleSettingChange('showVendor', value)}
            />
            <InputField
              label="Show Sale Badge"
              type="checkbox"
              value={section.settings?.showSaleBadge !== false}
              onChange={(value) => handleSettingChange('showSaleBadge', value)}
            />
            <InputField
              label="Show New Badge"
              type="checkbox"
              value={section.settings?.showNewBadge || false}
              onChange={(value) => handleSettingChange('showNewBadge', value)}
            />
            <InputField
              label="Enable Hover Effects"
              type="checkbox"
              value={section.settings?.enableHoverEffects !== false}
              onChange={(value) => handleSettingChange('enableHoverEffects', value)}
            />
            <InputField
              label="Show Second Image on Hover"
              type="checkbox"
              value={section.settings?.showSecondImage || false}
              onChange={(value) => handleSettingChange('showSecondImage', value)}
            />
            <InputField
              label="Enable Infinite Scroll"
              type="checkbox"
              value={section.settings?.infiniteScroll || false}
              onChange={(value) => handleSettingChange('infiniteScroll', value)}
            />
          </div>
        );

      case 'product-main':
        return (
          <div className="space-y-1">
            <InputField
              label="Layout Style"
              type="select"
              value={section.settings?.layout || 'split'}
              onChange={(value) => handleSettingChange('layout', value)}
              options={[
                { value: 'split', label: 'Split (Image + Info)' },
                { value: 'stacked', label: 'Stacked' },
                { value: 'full-width', label: 'Full Width' },
                { value: 'sidebar', label: 'Sidebar Layout' },
              ]}
            />
            <InputField
              label="Image Position"
              type="select"
              value={section.settings?.imagePosition || 'left'}
              onChange={(value) => handleSettingChange('imagePosition', value)}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
                { value: 'top', label: 'Top' },
              ]}
            />
            <InputField
              label="Sticky Product Info"
              type="checkbox"
              value={section.settings?.stickyInfo || false}
              onChange={(value) => handleSettingChange('stickyInfo', value)}
            />
            <InputField
              label="Show Breadcrumbs"
              type="checkbox"
              value={section.settings?.showBreadcrumbs !== false}
              onChange={(value) => handleSettingChange('showBreadcrumbs', value)}
            />
            <InputField
              label="Show Share Buttons"
              type="checkbox"
              value={section.settings?.showShareButtons || false}
              onChange={(value) => handleSettingChange('showShareButtons', value)}
            />
            <InputField
              label="Show Wishlist Button"
              type="checkbox"
              value={section.settings?.showWishlist || false}
              onChange={(value) => handleSettingChange('showWishlist', value)}
            />
            <InputField
              label="Enable Product Zoom"
              type="checkbox"
              value={section.settings?.enableZoom !== false}
              onChange={(value) => handleSettingChange('enableZoom', value)}
            />
            <InputField
              label="Show Product Videos"
              type="checkbox"
              value={section.settings?.showVideos !== false}
              onChange={(value) => handleSettingChange('showVideos', value)}
            />
            <InputField
              label="Show 360° View"
              type="checkbox"
              value={section.settings?.show360View || false}
              onChange={(value) => handleSettingChange('show360View', value)}
            />
            <InputField
              label="Mobile Layout"
              type="select"
              value={section.settings?.mobileLayout || 'stacked'}
              onChange={(value) => handleSettingChange('mobileLayout', value)}
              options={[
                { value: 'stacked', label: 'Stacked' },
                { value: 'tabs', label: 'Tabbed' },
                { value: 'accordion', label: 'Accordion' },
              ]}
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-6">
            <Type className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No content settings available</p>
          </div>
        );
    }
  };

  const renderStyleSettings = () => (
    <div className="space-y-1">
      <InputField
        label="Background Color"
        type="color"
        value={section.settings?.backgroundColor}
        onChange={(value) => handleSettingChange('backgroundColor', value)}
        placeholder="#ffffff"
      />
      <InputField
        label="Text Color"
        type="color"
        value={section.settings?.textColor}
        onChange={(value) => handleSettingChange('textColor', value)}
        placeholder="#000000"
      />
      <InputField
        label="Border Radius"
        type="range"
        value={section.settings?.borderRadius}
        onChange={(value) => handleSettingChange('borderRadius', value)}
      />
      <InputField
        label="Text Alignment"
        type="select"
        value={section.settings?.textAlign}
        onChange={(value) => handleSettingChange('textAlign', value)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
      />
      <InputField
        label="Font Size"
        type="select"
        value={section.settings?.fontSize}
        onChange={(value) => handleSettingChange('fontSize', value)}
        options={[
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ]}
      />
    </div>
  );

  const renderLayoutSettings = () => (
    <div className="space-y-1">
      <InputField
        label="Section Padding"
        type="select"
        value={section.settings?.padding}
        onChange={(value) => handleSettingChange('padding', value)}
        options={[
          { value: 'none', label: 'None' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ]}
      />
      <InputField
        label="Content Width"
        type="select"
        value={section.settings?.width}
        onChange={(value) => handleSettingChange('width', value)}
        options={[
          { value: 'full', label: 'Full Width' },
          { value: 'container', label: 'Container' },
          { value: 'narrow', label: 'Narrow' },
        ]}
      />
      <InputField
        label="Content Alignment"
        type="select"
        value={section.settings?.alignment}
        onChange={(value) => handleSettingChange('alignment', value)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
      />
      <InputField
        label="Minimum Height"
        type="select"
        value={section.settings?.minHeight}
        onChange={(value) => handleSettingChange('minHeight', value)}
        options={[
          { value: 'auto', label: 'Auto' },
          { value: 'small', label: 'Small (200px)' },
          { value: 'medium', label: 'Medium (400px)' },
          { value: 'large', label: 'Large (600px)' },
          { value: 'screen', label: 'Full Screen' },
        ]}
      />
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-1">
      <InputField
        label="Custom CSS Class"
        value={section.settings?.customClass}
        onChange={(value) => handleSettingChange('customClass', value)}
        placeholder="custom-class-name"
      />
      <InputField
        label="Animation"
        type="select"
        value={section.settings?.animation}
        onChange={(value) => handleSettingChange('animation', value)}
        options={[
          { value: 'none', label: 'None' },
          { value: 'fade-in', label: 'Fade In' },
          { value: 'slide-up', label: 'Slide Up' },
          { value: 'slide-left', label: 'Slide Left' },
          { value: 'zoom-in', label: 'Zoom In' },
        ]}
      />
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700">Hide on Mobile</label>
          <button
            onClick={() => handleSettingChange('hideOnMobile', !section.settings?.hideOnMobile)}
            className={cn(
              "w-10 h-6 rounded-full transition-colors relative",
              section.settings?.hideOnMobile ? "bg-primary" : "bg-gray-200"
            )}
          >
            <div className={cn(
              "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
              section.settings?.hideOnMobile ? "translate-x-5" : "translate-x-1"
            )} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <form 
      className={cn("h-full flex flex-col", compact ? "p-0" : "bg-white")} 
      style={compact ? { padding: '0 !important' } : {}}
      onSubmit={(e) => e.preventDefault()}
    >

      {/* Settings Groups */}
      <div className={cn("flex-1", compact ? "p-0" : "overflow-y-auto")} style={compact ? { padding: '0 !important' } : {}}>
        <SettingGroup title="Content" icon={Type} groupKey="content">
          {renderContentSettings()}
        </SettingGroup>
        
        <SettingGroup title="Style" icon={Palette} groupKey="style">
          {renderStyleSettings()}
        </SettingGroup>
        
        <SettingGroup title="Layout" icon={Layout} groupKey="layout">
          {renderLayoutSettings()}
        </SettingGroup>
        
      </div>
    </form>
  );
}

// Memoize component to prevent unnecessary re-renders
export const SectionInspector = memo(SectionInspectorComponent, (prevProps, nextProps) => {
  // Only re-render if section properties that affect UI have changed
  return (
    prevProps.section.id === nextProps.section.id &&
    JSON.stringify(prevProps.section.settings) === JSON.stringify(nextProps.section.settings) &&
    prevProps.section.enabled === nextProps.section.enabled &&
    prevProps.section.type === nextProps.section.type &&
    prevProps.section.sectionType === nextProps.section.sectionType &&
    prevProps.compact === nextProps.compact
  );
});