'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Type, Image, ShoppingBag, Grid, Link2, Square as SquareIcon,
  Columns, Heart, Star, Package, Tag,
  Mail, Phone, MapPin, Globe, Facebook, Instagram, Twitter,
  Plus, Trash2, Copy, Move, Settings, Eye, Code,
  ChevronUp, ChevronDown, Upload, Palette, AlignLeft,
  AlignCenter, AlignRight, Bold, Italic, Underline,
  Save, Undo, Redo, Loader2, X, Search, Check,
  Minus, Hash, MousePointer, Layers, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductPicker } from './ProductPicker';
import { DiscountPicker } from './DiscountPicker';
import { ImagePickerModal } from '@/components/ui/image-picker-modal';

// Block types
export const BLOCK_TYPES = {
  // Content blocks
  TEXT: 'text',
  HEADING: 'heading',
  BUTTON: 'button',
  IMAGE: 'image',
  DIVIDER: 'divider',
  SPACER: 'spacer',
  
  // Layout blocks
  COLUMNS: 'columns',
  SECTION: 'section',
  
  // Store blocks
  LOGO: 'logo',
  PRODUCT: 'product',
  PRODUCTS: 'products',
  COLLECTION: 'collection',
  DISCOUNT: 'discount',
  
  // Social & Contact
  SOCIAL: 'social',
  CONTACT: 'contact',
  FOOTER: 'footer'
} as const;

// Block definitions
const BLOCK_LIBRARY = [
  {
    category: 'Content',
    blocks: [
      { type: BLOCK_TYPES.HEADING, label: 'Heading', icon: Type, description: 'Add a title or heading' },
      { type: BLOCK_TYPES.TEXT, label: 'Text', icon: AlignLeft, description: 'Add paragraph text' },
      { type: BLOCK_TYPES.BUTTON, label: 'Button', icon: MousePointer, description: 'Add a call-to-action button' },
      { type: BLOCK_TYPES.IMAGE, label: 'Image', icon: Image, description: 'Add an image' },
      { type: BLOCK_TYPES.DIVIDER, label: 'Divider', icon: Minus, description: 'Add a horizontal line' },
      { type: BLOCK_TYPES.SPACER, label: 'Spacer', icon: Layers, description: 'Add vertical spacing' }
    ]
  },
  {
    category: 'Layout',
    blocks: [
      { type: BLOCK_TYPES.COLUMNS, label: '2 Columns', icon: Columns, description: 'Create a 2-column layout' },
      { type: BLOCK_TYPES.SECTION, label: 'Section', icon: SquareIcon, description: 'Group content in a section' }
    ]
  },
  {
    category: 'Store',
    blocks: [
      { type: BLOCK_TYPES.LOGO, label: 'Store Logo', icon: Star, description: 'Your store logo' },
      { type: BLOCK_TYPES.PRODUCT, label: 'Product', icon: Package, description: 'Feature a single product' },
      { type: BLOCK_TYPES.PRODUCTS, label: 'Product Grid', icon: Grid, description: 'Show multiple products' },
      { type: BLOCK_TYPES.COLLECTION, label: 'Collection', icon: ShoppingBag, description: 'Feature a collection' },
      { type: BLOCK_TYPES.DISCOUNT, label: 'Discount', icon: Tag, description: 'Add a discount code' }
    ]
  },
  {
    category: 'Footer',
    blocks: [
      { type: BLOCK_TYPES.SOCIAL, label: 'Social Links', icon: Heart, description: 'Social media links' },
      { type: BLOCK_TYPES.CONTACT, label: 'Contact Info', icon: Phone, description: 'Contact information' },
      { type: BLOCK_TYPES.FOOTER, label: 'Footer', icon: Hash, description: 'Email footer' }
    ]
  }
];

// Template variables
const TEMPLATE_VARIABLES = {
  customer: [
    { var: '{{customer_name}}', desc: 'Customer\'s full name' },
    { var: '{{customer_email}}', desc: 'Customer\'s email' },
    { var: '{{customer_phone}}', desc: 'Customer\'s phone' }
  ],
  order: [
    { var: '{{order_number}}', desc: 'Order number' },
    { var: '{{order_date}}', desc: 'Order date' },
    { var: '{{order_total}}', desc: 'Order total amount' },
    { var: '{{order_status}}', desc: 'Order status' }
  ],
  store: [
    { var: '{{store_name}}', desc: 'Your store name' },
    { var: '{{store_url}}', desc: 'Store website URL' },
    { var: '{{store_email}}', desc: 'Store email' },
    { var: '{{store_phone}}', desc: 'Store phone' }
  ],
  product: [
    { var: '{{product_name}}', desc: 'Product name' },
    { var: '{{product_price}}', desc: 'Product price' },
    { var: '{{product_url}}', desc: 'Product page URL' }
  ]
};

interface Block {
  id: string;
  type: string;
  content?: any;
  settings?: any;
  children?: Block[];
}

interface EmailTemplateBuilderProps {
  template: any;
  store: any;
  onSave: (content: string, blocks?: any[]) => Promise<void>;
  onBack: () => void;
}

export function EmailTemplateBuilder({ template, store, onSave, onBack }: EmailTemplateBuilderProps) {
  // Initialize blocks from template if available
  const [blocks, setBlocks] = useState<Block[]>(() => {
    // Try to load blocks from template
    if (template?.blocks) {
      try {
        const savedBlocks = typeof template.blocks === 'string' 
          ? JSON.parse(template.blocks) 
          : template.blocks;
        if (Array.isArray(savedBlocks) && savedBlocks.length > 0) {
          return savedBlocks;
        }
      } catch (e) {
        console.error('Failed to parse saved blocks:', e);
      }
    }
    
    // If no blocks but has HTML content, create a starter template
    if (template?.htmlContent && !template?.blocks) {
      console.log('Creating starter blocks for HTML template');
      return [
        {
          id: `block_${Date.now()}_header`,
          type: BLOCK_TYPES.SECTION,
          content: {
            backgroundColor: '#f8f9fa',
            padding: '40px 20px'
          },
          children: [
            {
              id: `block_${Date.now()}_logo`,
              type: BLOCK_TYPES.LOGO,
              content: {
                width: 150,
                align: 'center'
              }
            }
          ]
        },
        {
          id: `block_${Date.now()}_main`,
          type: BLOCK_TYPES.SECTION,
          content: {
            backgroundColor: '#ffffff',
            padding: '40px 20px'
          },
          children: [
            {
              id: `block_${Date.now()}_heading`,
              type: BLOCK_TYPES.HEADING,
              content: {
                text: 'Welcome to our Email Builder',
                level: 'h1',
                align: 'center',
                color: '#333333'
              }
            },
            {
              id: `block_${Date.now()}_text`,
              type: BLOCK_TYPES.TEXT,
              content: {
                text: 'This template has been converted from HTML. Start building your email by adding blocks from the left sidebar, or switch to the Settings tab to edit the raw HTML.',
                align: 'center',
                color: '#666666'
              }
            },
            {
              id: `block_${Date.now()}_button`,
              type: BLOCK_TYPES.BUTTON,
              content: {
                text: 'Get Started',
                url: '{{store_url}}',
                backgroundColor: '#8B9F7E',
                color: '#ffffff',
                align: 'center'
              }
            }
          ]
        },
        {
          id: `block_${Date.now()}_footer`,
          type: BLOCK_TYPES.FOOTER,
          content: {
            storeName: store?.name || 'Your Store',
            address: store?.address || '',
            showSocial: true,
            showUnsubscribe: true
          }
        }
      ];
    }
    
    return [];
  });
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [history, setHistory] = useState<Block[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings' | 'variables' | 'html'>('blocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [rawHtmlContent, setRawHtmlContent] = useState(template?.htmlContent || '');

  // Initialize blocks from template content if available
  useEffect(() => {
    if (template?.htmlContent) {
      // Parse existing template if needed
      // For now, start with empty blocks
    }
  }, [template]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
      // Delete key: Delete selected block
      if (e.key === 'Delete' && selectedBlock) {
        e.preventDefault();
        deleteBlock(selectedBlock.id);
      }
      // Escape: Deselect block
      if (e.key === 'Escape') {
        setSelectedBlock(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlock, historyIndex]);

  // Save to history
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...blocks]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1]);
      toast.success('Undone');
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1]);
      toast.success('Redone');
    }
  };

  // Add block
  const addBlock = (type: string, index?: number) => {
    const newBlock: Block = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: getDefaultContent(type),
      settings: {
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
        background: '#ffffff',
        align: 'left'
      }
    };

    if (type === BLOCK_TYPES.COLUMNS) {
      newBlock.children = [
        {
          id: `col_${Date.now()}_1`,
          type: 'column',
          content: {},
          children: []
        },
        {
          id: `col_${Date.now()}_2`,
          type: 'column',
          content: {},
          children: []
        }
      ];
    }

    saveToHistory();
    const newBlocks = [...blocks];
    if (index !== undefined) {
      newBlocks.splice(index, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    setBlocks(newBlocks);
    setSelectedBlock(newBlock);
    toast.success('Block added');
  };

  // Get default content for block type
  const getDefaultContent = (type: string) => {
    switch(type) {
      case BLOCK_TYPES.HEADING:
        return { text: 'Enter heading text', level: 'h2' };
      case BLOCK_TYPES.TEXT:
        return { text: 'Enter your text here. You can use {{variables}} to insert dynamic content.' };
      case BLOCK_TYPES.BUTTON:
        return { text: 'Click Here', url: '#', style: 'primary' };
      case BLOCK_TYPES.IMAGE:
        return { url: '', alt: 'Image' };
      case BLOCK_TYPES.LOGO:
        return { url: store?.logo || '', alt: store?.name || 'Logo' };
      case BLOCK_TYPES.SOCIAL:
        return { 
          facebook: store?.socialLinks?.facebook || '',
          twitter: store?.socialLinks?.twitter || '',
          instagram: store?.socialLinks?.instagram || ''
        };
      case BLOCK_TYPES.DISCOUNT:
        return {
          discountId: '',
          code: 'SAVE10',
          description: 'Save 10% on your next purchase',
          backgroundColor: '#8B9F7E',
          textColor: '#ffffff',
          showExpiry: true,
          align: 'center'
        };
      default:
        return {};
    }
  };

  // Delete block with smooth animation
  const deleteBlock = (blockId: string) => {
    const blockToDelete = blocks.find(b => b.id === blockId);
    if (!blockToDelete) return;

    // Show confirmation for important blocks
    const importantTypes = [BLOCK_TYPES.PRODUCT, BLOCK_TYPES.PRODUCTS, BLOCK_TYPES.COLLECTION];
    if (importantTypes.includes(blockToDelete.type)) {
      if (!confirm('Are you sure you want to delete this block?')) {
        return;
      }
    }

    saveToHistory();
    setBlocks(blocks.filter(b => b.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
    toast.success('Block deleted');
  };

  // Duplicate block
  const duplicateBlock = (block: Block) => {
    const newBlock = {
      ...block,
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: { ...block.content },
      settings: { ...block.settings }
    };
    
    saveToHistory();
    const index = blocks.findIndex(b => b.id === block.id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setSelectedBlock(newBlock);
    toast.success('Block duplicated');
  };

  // Move block
  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }

    saveToHistory();
    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // Update block content
  const updateBlockContent = useCallback((blockId: string, content: any) => {
    setBlocks(prevBlocks => prevBlocks.map(block => 
      block.id === blockId ? { ...block, content } : block
    ));
  }, []);

  // Update block settings
  const updateBlockSettings = useCallback((blockId: string, settings: any) => {
    setBlocks(prevBlocks => prevBlocks.map(block => 
      block.id === blockId ? { ...block, settings: { ...block.settings, ...settings } } : block
    ));
  }, []);

  // Copy variable to clipboard
  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVariable(variable);
    toast.success(`Copied: ${variable}`);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, blockType: string) => {
    setDraggedBlock(blockType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverIndex(index);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedBlock) {
      addBlock(draggedBlock, index);
    }
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  // Filter blocks based on search
  const filteredBlocks = BLOCK_LIBRARY.map(category => ({
    ...category,
    blocks: category.blocks.filter(block => 
      block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.blocks.length > 0);

  // Generate HTML from blocks
  const generateHTML = () => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f4f4f4; }
          .email-container { max-width: 600px; margin: 0 auto; background: white; }
          .block { position: relative; }
          h1, h2, h3 { margin: 0 0 10px 0; color: #333; }
          p { margin: 0 0 10px 0; line-height: 1.6; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: ${store?.theme?.primaryColor || '#8B9F7E'}; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; }
          .button:hover { opacity: 0.9; }
          img { max-width: 100%; height: auto; }
          .divider { border-top: 1px solid #e0e0e0; margin: 20px 0; }
          .columns { display: table; width: 100%; }
          .column { display: table-cell; width: 50%; padding: 10px; vertical-align: top; }
          @media (max-width: 600px) {
            .columns { display: block; }
            .column { display: block; width: 100%; }
          }
          .social-links { text-align: center; padding: 20px; }
          .social-links a { display: inline-block; margin: 0 10px; color: #666; text-decoration: none; }
          .footer { background: #f8f8f8; padding: 30px; text-align: center; color: #999; font-size: 14px; }
          .footer a { color: #999; }
        </style>
      </head>
      <body>
        <div class="email-container">
    `;

    blocks.forEach(block => {
      html += renderBlockHTML(block);
    });

    html += `
        </div>
      </body>
      </html>
    `;

    return html;
  };

  // Render block as HTML
  const renderBlockHTML = (block: Block): string => {
    const { padding, background, align } = block.settings || {};
    const style = `padding: ${padding?.top || 20}px ${padding?.right || 20}px ${padding?.bottom || 20}px ${padding?.left || 20}px; background: ${background || 'transparent'}; text-align: ${align || 'left'};`;

    switch(block.type) {
      case BLOCK_TYPES.HEADING:
        const HeadingTag = block.content.level || 'h2';
        return `<div class="block" style="${style}"><${HeadingTag}>${block.content.text || ''}</${HeadingTag}></div>`;
      
      case BLOCK_TYPES.TEXT:
        return `<div class="block" style="${style}"><p>${block.content.text || ''}</p></div>`;
      
      case BLOCK_TYPES.BUTTON:
        return `<div class="block" style="${style}"><a href="${block.content.url || '#'}" class="button">${block.content.text || 'Button'}</a></div>`;
      
      case BLOCK_TYPES.IMAGE:
        return `<div class="block" style="${style}"><img src="${block.content.url || ''}" alt="${block.content.alt || 'Image'}" /></div>`;
      
      case BLOCK_TYPES.DIVIDER:
        return `<div class="divider"></div>`;
      
      case BLOCK_TYPES.SPACER:
        return `<div style="height: ${block.settings?.height || 40}px;"></div>`;
      
      case BLOCK_TYPES.COLUMNS:
        return `
          <div class="columns" style="${style}">
            ${block.children?.map(child => `<div class="column">${renderBlockHTML(child)}</div>`).join('') || ''}
          </div>
        `;
      
      case BLOCK_TYPES.LOGO:
        return `<div class="block" style="${style}"><img src="${block.content.url}" alt="${block.content.alt}" style="max-width: 200px;" /></div>`;
      
      case BLOCK_TYPES.SOCIAL:
        return `
          <div class="social-links" style="${style}">
            ${block.content.facebook ? `<a href="${block.content.facebook}">Facebook</a>` : ''}
            ${block.content.twitter ? `<a href="${block.content.twitter}">Twitter</a>` : ''}
            ${block.content.instagram ? `<a href="${block.content.instagram}">Instagram</a>` : ''}
          </div>
        `;
      
      case BLOCK_TYPES.CONTACT:
        return `
          <div style="${style}; text-align: center; color: #666; font-size: 14px;">
            ${block.content.phone ? `<p style="margin: 5px 0;">📞 ${block.content.phone}</p>` : ''}
            ${block.content.email ? `<p style="margin: 5px 0;">✉️ <a href="mailto:${block.content.email}" style="color: #666;">${block.content.email}</a></p>` : ''}
            ${block.content.address ? `<p style="margin: 5px 0;">📍 ${block.content.address}</p>` : ''}
            ${block.content.website ? `<p style="margin: 5px 0;">🌐 <a href="${block.content.website}" style="color: #666;">${block.content.website}</a></p>` : ''}
          </div>
        `;
      
      case BLOCK_TYPES.DISCOUNT:
        const discountContent = block.content;
        const expiryDate = discountContent.expiresAt ? new Date(discountContent.expiresAt).toLocaleDateString() : '';
        return `
          <div style="${style}; text-align: ${discountContent.align || 'center'};">
            <div style="display: inline-block; background: ${discountContent.backgroundColor || '#8B9F7E'}; color: ${discountContent.textColor || '#ffffff'}; padding: 20px 30px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">${discountContent.description || 'Special Offer'}</p>
              <p style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">${discountContent.code || 'SAVE10'}</p>
              ${discountContent.showExpiry && expiryDate ? `<p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">Expires: ${expiryDate}</p>` : ''}
            </div>
          </div>
        `;
      
      case BLOCK_TYPES.FOOTER:
        return `
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${store?.name || 'Your Store'}. All rights reserved.</p>
            <p>${store?.address || ''}</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
          </div>
        `;
      
      default:
        return '';
    }
  };

  // Save template
  const handleSave = async () => {
    if (blocks.length === 0) {
      toast.error('Please add at least one block to the template');
      return;
    }

    setSaving(true);
    try {
      const html = generateHTML();
      // Save both HTML and blocks structure
      await onSave(html, blocks);
      toast.success('Template saved successfully');
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };
  
  // Modified handleSave to support HTML editing
  const handleSaveWithHtml = async () => {
    // If in HTML mode and HTML has been edited, save that instead
    if (activeTab === 'html' && rawHtmlContent !== template?.htmlContent) {
      setSaving(true);
      try {
        // Save the raw HTML content without blocks (since it's manually edited HTML)
        await onSave(rawHtmlContent, []);
        toast.success('Template saved successfully with HTML changes');
        return;
      } catch (error) {
        toast.error('Failed to save template');
        return;
      } finally {
        setSaving(false);
      }
    }
    
    // Otherwise use the normal save
    handleSave();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="w-[360px] min-w-[360px] bg-white border-r flex flex-col shadow-sm">
        {/* Sidebar Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">{template?.name || 'Email Template'}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHelp(!showHelp)} 
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
              <button 
                onClick={onBack} 
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                activeTab === 'blocks' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-50'
              }`}
            >
              Blocks
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                activeTab === 'settings' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-50'
              }`}
              disabled={!selectedBlock}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                activeTab === 'variables' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-50'
              }`}
            >
              Variables
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                activeTab === 'html' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-50'
              }`}
            >
              HTML
            </button>
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="p-4 bg-blue-50 border-b text-sm">
            <p className="font-medium mb-2">Quick Tips:</p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• Drag blocks from the sidebar to add them</li>
              <li>• Click on a block to select and edit it</li>
              <li>• Use Ctrl+Z to undo, Ctrl+Shift+Z to redo</li>
              <li>• Press Delete to remove selected block</li>
              <li>• Click on variables to copy them</li>
            </ul>
          </div>
        )}

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Blocks Tab */}
          {activeTab === 'blocks' && (
            <div>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Block Library */}
              {filteredBlocks.map(category => (
                <div key={category.category} className="mb-6">
                  <h4 className="font-medium text-sm text-gray-600 mb-3">
                    {category.category}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {category.blocks.map(block => {
                      const IconComponent = block.icon;
                      return (
                        <button
                          key={block.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, block.type)}
                          onClick={() => addBlock(block.type)}
                          className="p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-move group bg-white"
                          title={block.description}
                        >
                          <IconComponent className="h-5 w-5 mx-auto mb-1 text-gray-600 group-hover:text-primary" />
                          <p className="text-xs font-medium">{block.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && selectedBlock && (
            <BlockSettings 
              key={selectedBlock.id}
              block={selectedBlock}
              onUpdate={(settings) => updateBlockSettings(selectedBlock.id, settings)}
              onContentUpdate={(content) => updateBlockContent(selectedBlock.id, content)}
            />
          )}

          {/* Variables Tab */}
          {activeTab === 'variables' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Click to copy variables to clipboard
              </p>
              {Object.entries(TEMPLATE_VARIABLES).map(([category, variables]) => (
                <div key={category} className="mb-6">
                  <h4 className="font-medium text-sm capitalize mb-3">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {variables.map(({ var: variable, desc }) => (
                      <button
                        key={variable}
                        onClick={() => copyVariable(variable)}
                        className={`w-full text-left p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all ${
                          copiedVariable === variable ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <code className="text-xs font-mono text-primary">
                              {variable}
                            </code>
                            <p className="text-xs text-gray-500 mt-1">{desc}</p>
                          </div>
                          {copiedVariable === variable && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* HTML Tab */}
          {activeTab === 'html' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Advanced Mode:</strong> Edit the raw HTML of your email template. Changes here will override the visual blocks.
                </p>
              </div>
              <div className="flex-1 p-4">
                <label className="block text-sm font-medium mb-2">HTML Content</label>
                <textarea
                  value={rawHtmlContent}
                  onChange={(e) => setRawHtmlContent(e.target.value)}
                  className="w-full h-[400px] px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Enter your HTML content here..."
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      // Convert HTML back to blocks (simple conversion)
                      toast.info('HTML saved. The visual editor will show a basic representation.');
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    Apply HTML Changes
                  </button>
                  <button
                    onClick={() => setRawHtmlContent(template?.htmlContent || '')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="btn btn-ghost btn-sm"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="btn btn-ghost btn-sm"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="h-4 w-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`btn btn-sm ${previewMode ? 'btn-primary' : 'btn-ghost'}`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {blocks.length} block{blocks.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleSaveWithHtml}
                disabled={saving || blocks.length === 0}
                className="btn btn-primary btn-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Template
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="max-w-3xl mx-auto">
            {previewMode ? (
              /* Preview Mode */
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <iframe
                  srcDoc={generateHTML()}
                  className="w-full h-[800px] border-0"
                  title="Email Preview"
                />
              </div>
            ) : (
              /* Edit Mode */
              <div className="bg-white shadow-lg rounded-lg min-h-[600px]">
                {blocks.length === 0 ? (
                  /* Empty State */
                  <div
                    className="p-24 text-center border-2 border-dashed border-gray-300 rounded-lg"
                    onDragOver={(e) => handleDragOver(e, 0)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 0)}
                  >
                    <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Start building your email
                    </h3>
                    <p className="text-sm text-gray-500">
                      Drag blocks here or click on them in the sidebar
                    </p>
                  </div>
                ) : (
                  /* Block List */
                  <div className="p-4">
                    {blocks.map((block, index) => (
                      <div key={block.id}>
                        {/* Drop Zone */}
                        <div
                          className={`h-2 transition-all ${
                            dragOverIndex === index 
                              ? 'bg-primary/20 h-8' 
                              : ''
                          }`}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                        />
                        
                        {/* Block */}
                        <div
                          className={`relative group transition-all ${
                            selectedBlock?.id === block.id 
                              ? 'ring-2 ring-primary rounded' 
                              : hoveredBlock === block.id
                              ? 'ring-1 ring-gray-300 rounded'
                              : ''
                          }`}
                          onMouseEnter={() => setHoveredBlock(block.id)}
                          onMouseLeave={() => setHoveredBlock(null)}
                          onClick={() => setSelectedBlock(block)}
                        >
                          {/* Block Controls */}
                          {(selectedBlock?.id === block.id || hoveredBlock === block.id) && (
                            <div className="absolute -top-10 right-0 flex gap-1 bg-white shadow-lg rounded p-1 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(block.id, 'up');
                                }}
                                disabled={index === 0}
                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                                title="Move up"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(block.id, 'down');
                                }}
                                disabled={index === blocks.length - 1}
                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                                title="Move down"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateBlock(block);
                                }}
                                className="p-1 rounded hover:bg-gray-100"
                                title="Duplicate"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBlock(block.id);
                                }}
                                className="p-1 rounded hover:bg-gray-100 text-red-500"
                                title="Delete (Del)"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          
                          {/* Block Content */}
                          <BlockRenderer 
                            key={`render-${block.id}`}
                            block={block} 
                            store={store}
                            onUpdate={(content) => updateBlockContent(block.id, content)}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {/* Final Drop Zone */}
                    <div
                      className={`h-2 transition-all ${
                        dragOverIndex === blocks.length 
                          ? 'bg-primary/20 h-8' 
                          : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, blocks.length)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, blocks.length)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Block Settings Component
const BlockSettings = React.memo(function BlockSettings({ block, onUpdate, onContentUpdate }: any) {
  const { settings = {}, content = {} } = block;
  const [localContent, setLocalContent] = React.useState(content);
  const [localSettings, setLocalSettings] = React.useState(settings);

  // Update local state when block changes
  React.useEffect(() => {
    setLocalContent(content);
    setLocalSettings(settings);
  }, [block.id, content, settings]);

  // Handle content changes
  const handleContentChange = (field: string, value: any) => {
    const newContent = { ...localContent, [field]: value };
    setLocalContent(newContent);
    onContentUpdate(newContent);
  };

  // Handle settings changes
  const handleSettingsChange = (newSettings: any) => {
    const merged = { ...localSettings, ...newSettings };
    setLocalSettings(merged);
    onUpdate(merged);
  };

  return (
    <div className="space-y-4">
      {/* Content Settings */}
      {block.type === BLOCK_TYPES.HEADING && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Heading Text</label>
            <input
              type="text"
              value={localContent.text || ''}
              onChange={(e) => handleContentChange('text', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Heading Level</label>
            <select
              value={localContent.level || 'h2'}
              onChange={(e) => handleContentChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="h1">H1 - Largest</option>
              <option value="h2">H2 - Large</option>
              <option value="h3">H3 - Medium</option>
            </select>
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.TEXT && (
        <div>
          <label className="block text-sm font-medium mb-2">Text Content</label>
          <textarea
            value={localContent.text || ''}
            onChange={(e) => handleContentChange('text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={4}
          />
        </div>
      )}

      {block.type === BLOCK_TYPES.BUTTON && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Button Text</label>
            <input
              type="text"
              value={localContent.text || ''}
              onChange={(e) => handleContentChange('text', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Button URL</label>
            <input
              type="text"
              value={localContent.url || ''}
              onChange={(e) => handleContentChange('url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.IMAGE && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="text"
              value={localContent.url || ''}
              onChange={(e) => handleContentChange('url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Alt Text</label>
            <input
              type="text"
              value={localContent.alt || ''}
              onChange={(e) => handleContentChange('alt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.DISCOUNT && (
        <>
          {!localContent.discountId && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Discount Code</label>
                <input
                  type="text"
                  value={localContent.code || ''}
                  onChange={(e) => handleContentChange('code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="SAVE10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={localContent.description || ''}
                  onChange={(e) => handleContentChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Save 10% on your next purchase"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <input
              type="color"
              value={localContent.backgroundColor || '#8B9F7E'}
              onChange={(e) => handleContentChange('backgroundColor', e.target.value)}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Text Color</label>
            <input
              type="color"
              value={localContent.textColor || '#ffffff'}
              onChange={(e) => handleContentChange('textColor', e.target.value)}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showExpiry"
              checked={localContent.showExpiry || false}
              onChange={(e) => handleContentChange('showExpiry', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="showExpiry" className="text-sm">Show expiry date</label>
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.SOCIAL && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Facebook URL</label>
            <input
              type="text"
              value={localContent.facebook || ''}
              onChange={(e) => handleContentChange('facebook', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Twitter URL</label>
            <input
              type="text"
              value={localContent.twitter || ''}
              onChange={(e) => handleContentChange('twitter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Instagram URL</label>
            <input
              type="text"
              value={localContent.instagram || ''}
              onChange={(e) => handleContentChange('instagram', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.CONTACT && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="text"
              value={localContent.phone || ''}
              onChange={(e) => handleContentChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={localContent.email || ''}
              onChange={(e) => handleContentChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="contact@yourstore.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              type="text"
              value={localContent.address || ''}
              onChange={(e) => handleContentChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="123 Main St, City, State 12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="text"
              value={localContent.website || ''}
              onChange={(e) => handleContentChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://yourstore.com"
            />
          </div>
        </>
      )}

      {/* Layout Settings */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3">Layout</h4>
        
        {/* Alignment */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-2">Alignment</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleSettingsChange({ align: 'left' })}
              className={`flex-1 p-2 rounded border ${
                localSettings.align === 'left' ? 'border-primary bg-primary/10' : 'border-gray-200'
              }`}
            >
              <AlignLeft className="h-4 w-4 mx-auto" />
            </button>
            <button
              type="button"
              onClick={() => handleSettingsChange({ align: 'center' })}
              className={`flex-1 p-2 rounded border ${
                localSettings.align === 'center' ? 'border-primary bg-primary/10' : 'border-gray-200'
              }`}
            >
              <AlignCenter className="h-4 w-4 mx-auto" />
            </button>
            <button
              type="button"
              onClick={() => handleSettingsChange({ align: 'right' })}
              className={`flex-1 p-2 rounded border ${
                localSettings.align === 'right' ? 'border-primary bg-primary/10' : 'border-gray-200'
              }`}
            >
              <AlignRight className="h-4 w-4 mx-auto" />
            </button>
          </div>
        </div>

        {/* Padding */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">Padding</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={localSettings.padding?.top || 20}
              onChange={(e) => handleSettingsChange({ 
                padding: { ...localSettings.padding, top: parseInt(e.target.value) || 0 }
              })}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Top"
            />
            <input
              type="number"
              value={localSettings.padding?.bottom || 20}
              onChange={(e) => handleSettingsChange({ 
                padding: { ...localSettings.padding, bottom: parseInt(e.target.value) || 0 }
              })}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Bottom"
            />
            <input
              type="number"
              value={localSettings.padding?.left || 20}
              onChange={(e) => handleSettingsChange({ 
                padding: { ...localSettings.padding, left: parseInt(e.target.value) || 0 }
              })}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Left"
            />
            <input
              type="number"
              value={localSettings.padding?.right || 20}
              onChange={(e) => handleSettingsChange({ 
                padding: { ...localSettings.padding, right: parseInt(e.target.value) || 0 }
              })}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Right"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// Block Renderer Component
function BlockRenderer({ block, store, onUpdate }: any) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerField, setImagePickerField] = useState<string>('url');
  
  const handleImageSelect = (imageUrl: string) => {
    onUpdate({ ...block.content, [imagePickerField]: imageUrl });
    setShowImagePicker(false);
  };
  
  const openImagePicker = (field: string = 'url') => {
    setImagePickerField(field);
    setShowImagePicker(true);
  };
  
  const renderBlock = () => {
    switch(block.type) {
      case BLOCK_TYPES.HEADING:
        const HeadingTag = block.content.level || 'h2';
        return (
          <div className="p-4">
            {HeadingTag === 'h1' && <h1 className="text-2xl font-bold">{block.content.text || 'Heading'}</h1>}
            {HeadingTag === 'h2' && <h2 className="text-xl font-semibold">{block.content.text || 'Heading'}</h2>}
            {HeadingTag === 'h3' && <h3 className="text-lg font-medium">{block.content.text || 'Heading'}</h3>}
          </div>
        );
      
      case BLOCK_TYPES.TEXT:
        return (
          <div className="p-4">
            <p className="text-gray-600">{block.content.text || 'Enter your text here'}</p>
          </div>
        );
      
      case BLOCK_TYPES.BUTTON:
        return (
          <div className="p-4 text-center">
            <button className="btn btn-primary">
              {block.content.text || 'Button'}
            </button>
          </div>
        );
      
      case BLOCK_TYPES.IMAGE:
        return (
          <div className="p-4">
            {block.content.url ? (
              <img 
                src={block.content.url} 
                alt={block.content.alt || 'Image'} 
                className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openImagePicker('url')}
              />
            ) : (
              <div 
                className="bg-gray-200 h-48 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => openImagePicker('url')}
              >
                <div className="text-center">
                  <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to select image</p>
                </div>
              </div>
            )}
          </div>
        );
      
      case BLOCK_TYPES.DIVIDER:
        return <hr className="my-4 border-gray-300" />;
      
      case BLOCK_TYPES.SPACER:
        return <div style={{ height: block.settings?.height || 40 }} />;
      
      case BLOCK_TYPES.LOGO:
        return (
          <div className="p-4 text-center">
            {block.content.url ? (
              <img 
                src={block.content.url} 
                alt={block.content.alt || 'Logo'} 
                className="max-w-[200px] h-auto mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openImagePicker('url')}
              />
            ) : (
              <div 
                className="inline-block bg-gray-200 px-12 py-6 rounded cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => openImagePicker('url')}
              >
                <div className="text-center">
                  <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to select logo</p>
                </div>
              </div>
            )}
          </div>
        );
      
      case BLOCK_TYPES.PRODUCT:
        return (
          <div className="p-4">
            <div className="border rounded-lg p-4">
              <ProductPicker 
                store={store} 
                onSelectProduct={(product) => onUpdate({ ...block.content, product })}
                type="product"
              />
              {block.content.product && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                  <div className="flex gap-4">
                    {(() => {
                      const product = block.content.product;
                      let imageUrl = product.image || product.featuredImage;
                      if (!imageUrl && product.images?.length > 0) {
                        imageUrl = typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url;
                      }
                      if (!imageUrl && product.variants?.[0]?.images?.length > 0) {
                        imageUrl = product.variants[0].images[0]?.url || product.variants[0].images[0];
                      }
                      return imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.name || product.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      ) : null;
                    })()}
                    <div>
                      <p className="font-medium">{block.content.product.name || block.content.product.title}</p>
                      <p className="text-sm text-gray-500">
                        ${block.content.product.price || block.content.product.variants?.[0]?.price || '0.00'}
                      </p>
                      <a href="#" className="text-primary text-sm underline mt-2 inline-block">View Product →</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case BLOCK_TYPES.PRODUCTS:
        return (
          <div className="p-4">
            <div className="border rounded-lg p-4">
              <ProductPicker 
                store={store} 
                onSelectProducts={(products) => onUpdate({ ...block.content, products })}
                type="product"
                multiple={true}
              />
              {block.content.products && block.content.products.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected Products ({block.content.products.length}):</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {block.content.products.map((product: any) => (
                      <div key={product.id} className="border rounded-lg p-3 bg-gray-50">
                        {(product.image || product.images?.[0]) && (
                          <img 
                            src={product.image || product.images[0]} 
                            alt={product.name || product.title}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <p className="text-sm font-medium line-clamp-1">
                          {product.name || product.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${product.price || product.variants?.[0]?.price || '0.00'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case BLOCK_TYPES.COLLECTION:
        return (
          <div className="p-4">
            <div className="border rounded-lg p-4">
              <ProductPicker 
                store={store} 
                onSelectCollection={(collection) => onUpdate({ ...block.content, collection })}
                type="collection"
              />
              {block.content.collection && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Grid className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="font-medium">{block.content.collection.name || block.content.collection.title}</p>
                      <p className="text-sm text-gray-500">
                        {block.content.collection.productCount || 0} products
                      </p>
                      <a href="#" className="text-primary text-sm underline mt-1 inline-block">
                        View Collection →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case BLOCK_TYPES.DISCOUNT:
        return (
          <div className="p-4">
            <div className="border rounded-lg p-4">
              <DiscountPicker 
                store={store} 
                onSelectDiscount={(discount) => onUpdate({ 
                  ...block.content, 
                  discountId: discount.id,
                  code: discount.code,
                  description: discount.description,
                  discountType: discount.discountType,
                  discountValue: discount.discountValue,
                  expiresAt: discount.expiresAt
                })}
                selectedDiscountId={block.content.discountId}
              />
              {!block.content.discountId && block.content.code && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                  <div 
                    style={{ 
                      textAlign: block.content.align || 'center',
                      background: block.content.backgroundColor || '#8B9F7E',
                      color: block.content.textColor || '#ffffff',
                      padding: '20px',
                      borderRadius: '8px'
                    }}
                  >
                    <p className="text-sm mb-2" style={{ opacity: 0.9 }}>
                      {block.content.description || 'Special Offer'}
                    </p>
                    <p className="text-2xl font-bold tracking-wide">
                      {block.content.code || 'SAVE10'}
                    </p>
                    {block.content.showExpiry && block.content.expiresAt && (
                      <p className="text-xs mt-2" style={{ opacity: 0.8 }}>
                        Expires: {new Date(block.content.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case BLOCK_TYPES.SOCIAL:
        return (
          <div className="p-4 text-center">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Follow us on social media</p>
              <div className="flex justify-center gap-4">
                {block.content.facebook && (
                  <a href={block.content.facebook} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <Facebook className="h-5 w-5 text-gray-600" />
                  </a>
                )}
                {block.content.twitter && (
                  <a href={block.content.twitter} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <Twitter className="h-5 w-5 text-gray-600" />
                  </a>
                )}
                {block.content.instagram && (
                  <a href={block.content.instagram} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <Instagram className="h-5 w-5 text-gray-600" />
                  </a>
                )}
                {!block.content.facebook && !block.content.twitter && !block.content.instagram && (
                  <div className="text-sm text-gray-500">Add social links in settings</div>
                )}
              </div>
            </div>
          </div>
        );
      
      case BLOCK_TYPES.CONTACT:
        return (
          <div className="p-4">
            <div className="space-y-2 text-center">
              {block.content.phone && (
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{block.content.phone}</span>
                </div>
              )}
              {block.content.email && (
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{block.content.email}</span>
                </div>
              )}
              {block.content.address && (
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{block.content.address}</span>
                </div>
              )}
              {block.content.website && (
                <div className="flex items-center justify-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{block.content.website}</span>
                </div>
              )}
              {!block.content.phone && !block.content.email && !block.content.address && !block.content.website && (
                <p className="text-sm text-gray-500">Add contact info in settings</p>
              )}
            </div>
          </div>
        );
      
      case BLOCK_TYPES.FOOTER:
        return (
          <div className="p-4 bg-gray-100 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} {store?.name || 'Your Store'}</p>
            <p className="mt-2">
              <a href="#" className="underline">Unsubscribe</a>
            </p>
          </div>
        );
      
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            {block.type} block
          </div>
        );
    }
  };

  return (
    <>
      <div style={{ textAlign: block.settings?.align || 'left' }}>
        {renderBlock()}
      </div>
      
      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePickerModal
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={handleImageSelect}
          subdomain={store?.subdomain || ''}
          currentValue={block.content[imagePickerField]}
          title="Select Image"
          description="Choose an image from your media library or upload a new one"
          context="email"
        />
      )}
    </>
  );
}