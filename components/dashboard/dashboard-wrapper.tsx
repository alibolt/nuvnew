'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Session } from 'next-auth';
import { 
  Package, ShoppingCart, DollarSign, Users, TrendingUp, Palette, Puzzle, Settings, 
  BarChart, FileText, Megaphone, BarChart3, FolderTree, Store, Mail, 
  ChevronDown, UserCog, Plus, LogOut, Search, Bot, X, Send, Sparkles,
  Globe, Home, Layers, Building2, Zap, TrendingDown, Tag, Cpu, Monitor,
  CreditCard, Share2, ShoppingBag, PenTool, Image, Menu, Check, ExternalLink
} from 'lucide-react';
import { CommandPalette } from './command-palette';
import { ContextAwareSuggestions } from './context-aware-suggestions';
import { SettingsModal, useSettingsModal } from './settings-modal';
import type { Store as StoreType } from '@/types/store';

interface DashboardWrapperProps {
  store?: Store;
  allStores?: Store[];
  session: Session;
  children: React.ReactNode;
  activeTab?: string;
  hideTabNavigation?: boolean;
}

export function DashboardWrapper({ 
  store, 
  allStores, 
  session, 
  children, 
  activeTab,
  hideTabNavigation = false 
}: DashboardWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen: isSettingsOpen, openSettings, closeSettings } = useSettingsModal();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [installedApps, setInstalledApps] = useState<any[]>([]);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [showConversationList, setShowConversationList] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentStore, setCurrentStore] = useState(store);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAdmin = session.user.role?.toLowerCase() === 'admin';
  
  // LocalStorage keys for store/admin specific data
  const chatHistoryKey = `ai-conversations-${store?.id || 'admin'}`;
  const currentConvKey = `ai-current-conv-${store?.id || 'admin'}`;

  // Fetch installed apps for submenu
  useEffect(() => {
    if (store && !isAdmin) {
      fetchInstalledApps();
    }
  }, [store, isAdmin]);

  const fetchInstalledApps = async () => {
    if (!store) return;
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/apps`);
      if (response.ok) {
        const data = await response.json();
        const apps = data.success && data.data ? data.data.apps : data.apps;
        setInstalledApps(apps || []);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  // Add keyboard shortcut for Command Palette and handle click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Close dropdowns when clicking outside
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown="store"]')) {
        setIsStoreDropdownOpen(false);
      }
      if (!target.closest('[data-dropdown="user"]')) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(chatHistoryKey);
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
      }
      
      const savedCurrentConv = localStorage.getItem(currentConvKey);
      if (savedCurrentConv) {
        setCurrentConversationId(savedCurrentConv);
      } else {
        // Create first conversation
        createNewConversation();
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      createNewConversation();
    }
  }, [chatHistoryKey]);

  // Save conversations when they change
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem(chatHistoryKey, JSON.stringify(conversations));
        localStorage.setItem(currentConvKey, currentConversationId);
      } catch (error) {
        console.error('Failed to save conversations:', error);
      }
    }
  }, [conversations, currentConversationId, chatHistoryKey, currentConvKey]);

  // Load messages for current conversation
  useEffect(() => {
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (currentConv) {
      setAiMessages(currentConv.messages || []);
    }
  }, [currentConversationId, conversations]);

  // Save messages to current conversation
  useEffect(() => {
    if (currentConversationId && aiMessages.length > 0) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          // Update title from first user message
          let title = conv.title;
          if (title === 'New Conversation' && aiMessages.length > 0) {
            const firstUserMsg = aiMessages.find(m => m.role === 'user');
            if (firstUserMsg) {
              title = firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
            }
          }
          return { ...conv, messages: aiMessages, title, updatedAt: new Date().toISOString() };
        }
        return conv;
      }));
    }
  }, [aiMessages, currentConversationId]);

  // Auto-expand parent menu when navigating to a child page
  useEffect(() => {
    if (pathname) {
      // Check if current path is themes (Online Store)
      if (pathname.includes('/themes')) {
        if (!expandedMenus.includes('sales-channels')) {
          setExpandedMenus(prev => [...prev, 'sales-channels']);
        }
      }
      // Check for marketing paths
      else if (pathname.includes('/marketing/')) {
        if (!expandedMenus.includes('marketing')) {
          setExpandedMenus(prev => [...prev, 'marketing']);
        }
      }
      // Check for content paths
      else if (pathname.includes('/content/')) {
        if (!expandedMenus.includes('content')) {
          setExpandedMenus(prev => [...prev, 'content']);
        }
      }
      // Check for sales channels paths
      else if (pathname.includes('/sales-channels/')) {
        if (!expandedMenus.includes('sales-channels')) {
          setExpandedMenus(prev => [...prev, 'sales-channels']);
        }
      }
    }
  }, [pathname]);

  // Create new conversation
  const createNewConversation = () => {
    const newConv = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations(prev => [...prev, newConv]);
    setCurrentConversationId(newConv.id);
    setAiMessages([]);
    return newConv;
  };

  // Switch conversation
  const switchConversation = (convId: string) => {
    setCurrentConversationId(convId);
    setShowConversationList(false);
  };

  // Delete conversation
  const deleteConversation = (convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (convId === currentConversationId) {
      const remaining = conversations.filter(c => c.id !== convId);
      if (remaining.length > 0) {
        setCurrentConversationId(remaining[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  // Clear all conversations
  const clearAllConversations = () => {
    setConversations([]);
    localStorage.removeItem(chatHistoryKey);
    localStorage.removeItem(currentConvKey);
    createNewConversation();
  };

  // Check if message is an AI command
  const checkAICommand = async (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Product creation commands
    if (lowerInput.includes('create product') || lowerInput.includes('add product') || lowerInput.includes('new product')) {
      const match = input.match(/(?:create|add|new)\s+product\s+(?:called|named)?\s*"?([^"]+)"?(?:\s+(?:price|for|at)\s+\$?(\d+(?:\.\d{2})?))?\s*(?:with\s+description\s+"?([^"]+)"?)?/i);
      
      if (match) {
        const [, name, price, description] = match;
        return {
          type: 'action',
          action: 'create_product',
          data: {
            name: name?.trim(),
            price: price ? parseFloat(price) : null,
            description: description?.trim()
          }
        };
      }
    }
    
    // Discount creation commands  
    if (lowerInput.includes('create discount') || lowerInput.includes('create coupon') || lowerInput.includes('add discount')) {
      const match = input.match(/(?:create|add)\s+(?:discount|coupon)(?:\s+(?:code)?\s+"?([^"]+)"?)?\s+(?:for\s+)?(\d+)%?\s*(?:off)?/i);
      
      if (match) {
        const [, code, value] = match;
        return {
          type: 'action',
          action: 'create_discount',
          data: {
            code: code?.trim() || `SAVE${Math.floor(Math.random() * 100)}`,
            value: value ? parseFloat(value) : 10,
            type: 'percentage'
          }
        };
      }
    }
    
    // Store analysis commands
    if (lowerInput.includes('analyze store') || lowerInput.includes('store analysis') || lowerInput.includes('store performance')) {
      return {
        type: 'action',
        action: 'analyze_store',
        data: {}
      };
    }
    
    // Bulk operations
    if (lowerInput.includes('bulk update') || lowerInput.includes('update all') || lowerInput.includes('all product')) {
      // Price updates
      if (lowerInput.includes('price')) {
        const match = input.match(/(?:increase|decrease|raise|lower)\s+(?:all\s+)?prices?\s+(?:by\s+)?(\d+)%/i);
        if (match) {
          const [, value] = match;
          const isIncrease = lowerInput.includes('increase') || lowerInput.includes('raise');
          return {
            type: 'action',
            action: 'bulk_update_products',
            data: {
              operation: 'price_change',
              filters: {},
              updates: {
                changeType: 'percentage',
                value: isIncrease ? parseFloat(value) : -parseFloat(value)
              }
            }
          };
        }
      }
    }
    
    // Activate/Deactivate products
    if (lowerInput.includes('activate all') || lowerInput.includes('deactivate all') || lowerInput.includes('disable all') || lowerInput.includes('enable all')) {
      const isActivate = lowerInput.includes('activate') || lowerInput.includes('enable');
      
      // Check for specific filters
      let filters: any = {};
      if (lowerInput.includes('draft')) filters.isActive = false;
      if (lowerInput.includes('out of stock')) filters.outOfStock = true;
      if (lowerInput.includes('category')) {
        const categoryMatch = input.match(/category\s+["']?([^"']+)["']?/i);
        if (categoryMatch) filters.categoryName = categoryMatch[1];
      }
      
      return {
        type: 'action',
        action: 'bulk_update_products',
        data: {
          operation: isActivate ? 'activate' : 'deactivate',
          filters,
          updates: {}
        }
      };
    }
    
    // Add/Remove tags
    if (lowerInput.includes('add tag') || lowerInput.includes('remove tag')) {
      const isAdd = lowerInput.includes('add tag');
      const tagMatch = input.match(/(?:add|remove)\s+tag\s+["']?([^"']+)["']?\s+(?:to|from)\s+all/i);
      
      if (tagMatch) {
        const [, tag] = tagMatch;
        let filters: any = {};
        
        // Check for category filter
        if (lowerInput.includes('category')) {
          const categoryMatch = input.match(/category\s+["']?([^"']+)["']?/i);
          if (categoryMatch) filters.categoryName = categoryMatch[1];
        }
        
        // Check for specific product types
        if (lowerInput.includes('recent')) filters.recent = true;
        if (lowerInput.includes('featured')) filters.featured = true;
        
        return {
          type: 'action',
          action: 'bulk_update_products',
          data: {
            operation: isAdd ? 'add_tag' : 'remove_tag',
            filters,
            updates: { tag: tag.trim() }
          }
        };
      }
    }
    
    // Export products
    if (lowerInput.includes('export product') || lowerInput.includes('download product')) {
      return {
        type: 'action',
        action: 'export_products',
        data: {
          format: lowerInput.includes('csv') ? 'csv' : 'json'
        }
      };
    }
    
    // Translation commands
    if (lowerInput.includes('translate')) {
      // Batch translate all products/categories/pages
      if (lowerInput.includes('all product') || lowerInput.includes('all category') || lowerInput.includes('all page')) {
        let contentType = 'product';
        if (lowerInput.includes('category') || lowerInput.includes('categories')) contentType = 'category';
        if (lowerInput.includes('page')) contentType = 'page';
        
        // Extract target language
        let targetLanguage = 'tr'; // Default to Turkish
        const langMatch = input.match(/to\s+(turkish|english|spanish|french|german|italian|portuguese|russian|chinese|japanese|korean|arabic|hindi|dutch|swedish|polish)/i);
        if (langMatch) {
          const langMap: Record<string, string> = {
            'turkish': 'tr', 'english': 'en', 'spanish': 'es', 'french': 'fr',
            'german': 'de', 'italian': 'it', 'portuguese': 'pt', 'russian': 'ru',
            'chinese': 'zh', 'japanese': 'ja', 'korean': 'ko', 'arabic': 'ar',
            'hindi': 'hi', 'dutch': 'nl', 'swedish': 'sv', 'polish': 'pl'
          };
          targetLanguage = langMap[langMatch[1].toLowerCase()] || 'tr';
        }
        
        // Check for category filter
        let filter: any = {};
        if (lowerInput.includes('in category')) {
          const categoryMatch = input.match(/in\s+category\s+["']?([^"']+)["']?/i);
          if (categoryMatch) filter.categoryName = categoryMatch[1];
        }
        
        return {
          type: 'action',
          action: 'batch_translate',
          data: {
            contentType,
            targetLanguage,
            limit: 50, // Translate up to 50 items at once
            filter
          }
        };
      }
      
      // Translate specific item
      const itemMatch = input.match(/translate\s+(?:product|category|page)\s+["']?([^"']+)["']?\s+to\s+(\w+)/i);
      if (itemMatch) {
        const [, itemName, targetLang] = itemMatch;
        let contentType = 'product';
        if (lowerInput.includes('category')) contentType = 'category';
        if (lowerInput.includes('page')) contentType = 'page';
        
        // Map language names to codes
        const langMap: Record<string, string> = {
          'turkish': 'tr', 'english': 'en', 'spanish': 'es', 'french': 'fr',
          'german': 'de', 'italian': 'it', 'portuguese': 'pt', 'russian': 'ru',
          'chinese': 'zh', 'japanese': 'ja', 'korean': 'ko', 'arabic': 'ar',
          'hindi': 'hi', 'dutch': 'nl', 'swedish': 'sv', 'polish': 'pl'
        };
        
        return {
          type: 'action',
          action: 'translate_content',
          data: {
            contentType,
            itemName: itemName.trim(),
            targetLanguage: langMap[targetLang.toLowerCase()] || targetLang.toLowerCase()
          }
        };
      }
    }
    
    // Show untranslated content
    if (lowerInput.includes('untranslated') || lowerInput.includes('not translated')) {
      let contentType = 'product';
      if (lowerInput.includes('category') || lowerInput.includes('categories')) contentType = 'category';
      if (lowerInput.includes('page')) contentType = 'page';
      
      return {
        type: 'action',
        action: 'batch_translate',
        data: {
          contentType,
          targetLanguage: 'tr',
          limit: 10,
          filter: { untranslated: true }
        }
      };
    }
    
    // Analytics and insights
    if (lowerInput.includes('analytics') || lowerInput.includes('insights') || 
        lowerInput.includes('dashboard') || lowerInput.includes('performance') ||
        lowerInput.includes('how is my store') || lowerInput.includes('store analysis') ||
        lowerInput.includes('sales report') || lowerInput.includes('store stats')) {
      return {
        type: 'insights',
        action: 'show_insights'
      };
    }
    
    // Settings updates
    if (lowerInput.includes('update') || lowerInput.includes('change') || lowerInput.includes('set')) {
      const settingsData: any = {};
      
      // Currency updates
      if (lowerInput.includes('currency')) {
        const currencyMatch = input.match(/(?:to|as)\s+([A-Z]{3}|USD|EUR|GBP|TRY|JPY|CNY)/i);
        if (currencyMatch) {
          settingsData.currency = currencyMatch[1].toUpperCase();
        }
      }
      
      // Store name
      if (lowerInput.includes('store name') || lowerInput.includes('shop name')) {
        const nameMatch = input.match(/(?:name|to)\s+["']?([^"']+)["']?$/i);
        if (nameMatch) {
          settingsData.name = nameMatch[1].trim();
        }
      }
      
      // Email
      if (lowerInput.includes('email')) {
        const emailMatch = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) {
          settingsData.email = emailMatch[1];
        }
      }
      
      // Phone
      if (lowerInput.includes('phone')) {
        const phoneMatch = input.match(/(?:to|as)\s+([\d\s\-\+\(\)]+)/);
        if (phoneMatch) {
          settingsData.phone = phoneMatch[1].trim();
        }
      }
      
      // Tax rate
      if (lowerInput.includes('tax')) {
        const taxMatch = input.match(/(\d+(?:\.\d+)?)\s*%?/);
        if (taxMatch) {
          settingsData.taxRate = parseFloat(taxMatch[1]);
        }
      }
      
      // Shipping rate
      if (lowerInput.includes('shipping')) {
        const shippingMatch = input.match(/(?:\$|€|£)?(\d+(?:\.\d+)?)/);
        if (shippingMatch) {
          settingsData.shippingRate = parseFloat(shippingMatch[1]);
        }
      }
      
      // Timezone
      if (lowerInput.includes('timezone') || lowerInput.includes('time zone')) {
        const timezoneMatch = input.match(/(?:to|as)\s+["']?([^"']+)["']?$/i);
        if (timezoneMatch) {
          settingsData.timezone = timezoneMatch[1].trim();
        }
      }
      
      // Weight unit
      if (lowerInput.includes('weight unit')) {
        if (lowerInput.includes('kg') || lowerInput.includes('kilogram')) {
          settingsData.weightUnit = 'kg';
        } else if (lowerInput.includes('lb') || lowerInput.includes('pound')) {
          settingsData.weightUnit = 'lb';
        } else if (lowerInput.includes('g') || lowerInput.includes('gram')) {
          settingsData.weightUnit = 'g';
        } else if (lowerInput.includes('oz') || lowerInput.includes('ounce')) {
          settingsData.weightUnit = 'oz';
        }
      }
      
      // Social media
      if (lowerInput.includes('facebook')) {
        const fbMatch = input.match(/(?:facebook|fb)\s+(?:to|as)?\s*["']?([^"'\s]+)["']?/i);
        if (fbMatch) {
          settingsData.facebook = fbMatch[1];
        }
      }
      
      if (lowerInput.includes('instagram')) {
        const igMatch = input.match(/(?:instagram|ig)\s+(?:to|as)?\s*["']?([^"'\s]+)["']?/i);
        if (igMatch) {
          settingsData.instagram = igMatch[1];
        }
      }
      
      // Maintenance mode
      if (lowerInput.includes('maintenance mode')) {
        if (lowerInput.includes('enable') || lowerInput.includes('activate')) {
          settingsData.enableMaintenanceMode = true;
        } else if (lowerInput.includes('disable') || lowerInput.includes('deactivate')) {
          settingsData.enableMaintenanceMode = false;
        }
      }
      
      // Password protection
      if (lowerInput.includes('password protection')) {
        if (lowerInput.includes('enable') || lowerInput.includes('activate')) {
          settingsData.enablePasswordProtection = true;
        } else if (lowerInput.includes('disable') || lowerInput.includes('deactivate')) {
          settingsData.enablePasswordProtection = false;
        }
      }
      
      if (Object.keys(settingsData).length > 0) {
        return {
          type: 'action',
          action: 'update_settings',
          data: settingsData
        };
      }
    }
    
    return null;
  };

  // Execute AI action
  const executeAIAction = async (command: any) => {
    if (!store) {
      return {
        success: false,
        message: 'No store selected. Please select a store first.'
      };
    }

    try {
      // Handle navigation actions differently
      if (command.action === 'create_product') {
        // Generate AI content for the product
        const response = await fetch('/api/ai/groq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'product_description',
            prompt: command.data.name || 'New Product',
            data: {
              productType: 'physical',
              keywords: '',
              tone: 'professional'
            }
          }),
        });

        const aiResult = await response.json();
        const description = aiResult.data?.result || '';

        // Store AI generated data in sessionStorage
        const aiProductData = {
          name: command.data.name || '',
          description: description,
          price: command.data.price || 0,
          isAIGenerated: true,
          generatedAt: new Date().toISOString()
        };
        
        sessionStorage.setItem('aiProductData', JSON.stringify(aiProductData));
        
        // Navigate to products page with create view
        router.push(`/dashboard/stores/${store.subdomain}/products?tab=products&view=create`);
        
        return {
          success: true,
          message: `Opening product editor with AI-generated content for "${command.data.name}"...`
        };
      }
      
      if (command.action === 'create_discount') {
        // Store discount data in sessionStorage
        const aiDiscountData = {
          code: command.data.code,
          value: command.data.value,
          type: command.data.type || 'percentage',
          isAIGenerated: true,
          generatedAt: new Date().toISOString()
        };
        
        sessionStorage.setItem('aiDiscountData', JSON.stringify(aiDiscountData));
        
        // Navigate to marketing discounts page
        router.push(`/dashboard/stores/${store.subdomain}/marketing/discounts`);
        
        return {
          success: true,
          message: `Opening discount editor with code "${command.data.code}" for ${command.data.value}% off...`
        };
      }
      
      // For other actions, call the API
      const response = await fetch('/api/ai/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: command.action,
          subdomain: store.subdomain,
          data: command.data
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Handle different action results
        if (command.action === 'export_products' && result.data) {
          // Download the file
          const { format, content, filename } = result.data;
          const blob = new Blob([format === 'json' ? JSON.stringify(content, null, 2) : content], {
            type: format === 'csv' ? 'text/csv' : 'application/json'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else if (command.action === 'update_product' || command.action === 'bulk_update_products') {
          // Refresh page for product updates
          setTimeout(() => window.location.reload(), 1500);
        }
      }
      
      return result;
    } catch (error) {
      console.error('AI action error:', error);
      return {
        success: false,
        message: 'Failed to execute action. Please try again.'
      };
    }
  };

  // AI Assistant mesaj gönderme
  const sendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMessage = {
      role: 'user',
      content: aiInput,
      timestamp: new Date().toISOString(),
    };

    setAiMessages(prev => [...prev, userMessage]);
    const currentInput = aiInput;
    setAiInput('');
    setAiLoading(true);

    try {
      // Check if this is an AI command
      const command = await checkAICommand(currentInput);
      
      if (command && command.type === 'action') {
        // Execute the action
        const actionResult = await executeAIAction(command);
        
        const aiResponse = {
          role: 'assistant',
          content: actionResult.message || 'Action completed successfully!',
          timestamp: new Date().toISOString(),
          model: 'action-executor',
        };
        
        setAiMessages(prev => [...prev, aiResponse]);
        setAiLoading(false);
        return;
      }
      
      // Handle insights command
      if (command && command.type === 'insights') {
        const loadingMsg = {
          role: 'assistant',
          content: '📊 Analyzing your store performance...',
          timestamp: new Date().toISOString(),
          model: 'insights-analyzer',
        };
        setAiMessages(prev => [...prev, loadingMsg]);
        
        const response = await fetch(`/api/ai/insights?subdomain=${store.subdomain}`);
        
        if (response.ok) {
          const insights = await response.json();
          
          // Format insights message
          let message = '## 📈 Store Performance Dashboard\n\n';
          
          // Today's Performance
          message += '### Today\'s Performance\n';
          message += `💰 **Revenue:** $${insights.overview.revenue.today.toFixed(2)} (${insights.overview.revenue.growth > 0 ? '+' : ''}${insights.overview.revenue.growth}%)\n`;
          message += `📦 **Orders:** ${insights.overview.orders.today} (${insights.overview.orders.growth > 0 ? '+' : ''}${insights.overview.orders.growth}%)\n`;
          message += `👥 **New Customers:** ${insights.overview.customers.today} (${insights.overview.customers.growth > 0 ? '+' : ''}${insights.overview.customers.growth}%)\n\n`;
          
          // Key Metrics
          message += '### Key Metrics\n';
          message += `📊 **Conversion Rate:** ${insights.performance.conversionRate}%\n`;
          message += `💵 **Average Order Value:** $${insights.performance.averageOrderValue}\n`;
          message += `🔄 **Repeat Customer Rate:** ${insights.overview.customers.repeatRate}%\n\n`;
          
          // Alerts
          if (insights.alerts.critical.length > 0) {
            message += '### 🚨 Critical Alerts\n';
            insights.alerts.critical.forEach((alert: any) => {
              message += `- ${alert.message} → ${alert.action}\n`;
            });
            message += '\n';
          }
          
          if (insights.alerts.warnings.length > 0) {
            message += '### ⚠️ Warnings\n';
            insights.alerts.warnings.forEach((alert: any) => {
              message += `- ${alert.message} → ${alert.action}\n`;
            });
            message += '\n';
          }
          
          // Top Products
          if (insights.performance.topProducts.length > 0) {
            message += '### 🏆 Top Products\n';
            insights.performance.topProducts.slice(0, 3).forEach((product: any, index: number) => {
              message += `${index + 1}. **${product.name}** - ${product.unitsSold} sold, $${product.revenue.toFixed(2)}\n`;
            });
            message += '\n';
          }
          
          // Recommendations
          if (insights.recommendations.length > 0) {
            message += '### 💡 AI Recommendations\n';
            insights.recommendations.forEach((rec: string) => {
              message += `${rec}\n`;
            });
            message += '\n';
          }
          
          // Replace loading message with actual insights
          setAiMessages(prev => prev.slice(0, -1).concat({
            role: 'assistant',
            content: message,
            timestamp: new Date().toISOString(),
            model: 'insights-analyzer',
          }));
        } else {
          setAiMessages(prev => prev.slice(0, -1).concat({
            role: 'assistant',
            content: 'Failed to fetch store insights. Please try again.',
            timestamp: new Date().toISOString(),
            model: 'insights-analyzer',
          }));
        }
        
        setAiLoading(false);
        return;
      }

      // Regular AI chat if not a command
      const response = await fetch('/api/ai/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'chat',
          prompt: currentInput,
          language: 'en',
          data: {
            storeContext: store ? {
              name: store.name,
              subdomain: store.subdomain,
              productCount: store._count?.products || 0,
              orderCount: store._count?.orders || 0,
            } : null
          }
        }),
      });

      const data = await response.json();
      
      // API yanıtını kontrol et  
      if (!response.ok) {
        console.error('API Error:', data);
        
        // Hata durumunda demo yanıt ver
        const demoResponse = getDemoResponse(currentInput, store);
        const aiResponse = {
          role: 'assistant',
          content: demoResponse,
          timestamp: new Date().toISOString(),
          model: 'demo',
        };
        setAiMessages(prev => [...prev, aiResponse]);
        return;
      }
      
      if (data.loading) {
        // Model yükleniyorsa tekrar dene
        setTimeout(() => sendAiMessage(), 5000);
        return;
      }

      const aiResponse = {
        role: 'assistant',
        content: data.data?.result || data.error || 'Sorry, an error occurred.',
        timestamp: new Date().toISOString(),
        model: data.data?.usage?.model || 'huggingface',
      };

      setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI message error:', error);
      // Hata durumunda hata mesajı göster
      const aiResponse = {
        role: 'assistant',
        content: 'Sorry, I cannot generate a response right now. Please try again later or ask a different question.',
        timestamp: new Date().toISOString(),
        model: 'error',
      };
      setAiMessages(prev => [...prev, aiResponse]);
    } finally {
      setAiLoading(false);
    }
  };

  // Demo responses (used when API key is not available)
  const getDemoResponse = (input: string, storeData: any) => {
    const msg = input.toLowerCase();
    
    if (msg.includes('store') && (msg.includes('status') || msg.includes('overview') || msg.includes('performing'))) {
      return `📊 Store Overview:
      
📦 Total Products: ${storeData?._count?.products || 24} items
📋 Total Orders: ${storeData?._count?.orders || 156} orders  
💰 This Month Sales: $12,450
📈 Compared to Last Month: +23%

✨ Recommendations:
• Highlight your best-selling products
• Check low-stock items
• Consider launching a new customer campaign`;
    }
    
    if (msg.includes('social') || msg.includes('campaign')) {
      return `📱 Social Media Campaign Suggestion:

🎯 Campaign: "Winter Collection Launch"

📝 Instagram Post Copy:
"❄️ Winter is here, time to shine! 20% off our new collection. Special gift for first 50 orders! 

✨ Featured items:
• Wool coats
• Leather boots  
• Cashmere scarves

🛍️ Shop now → [link]
#WinterFashion #NewCollection #Sale"

💡 Tips:
• Best posting time: 7-9 PM
• Add product tags in Stories
• Consider influencer partnerships`;
    }
    
    if (msg.includes('stock') || msg.includes('inventory')) {
      return `📦 Inventory Analysis:

⚠️ Critical Stock (less than 5):
• Leather Bag - Black: 3 units
• Women's Boots - Size 8: 2 units
• Wool Sweater - Size L: 4 units

📈 Fast Moving Items:
• Winter Jacket: 15 units/week
• Glove Set: 12 units/week

💡 Recommendations:
• Restock critical items immediately
• Increase seasonal products
• Maintain stock for popular sizes`;
    }
    
    if (msg.includes('discount') || msg.includes('sale')) {
      return `🎯 Discount Campaign Suggestion:

🏷️ "Weekend Special"
• 15% off at checkout
• 20% off orders over $100
• Second item 30% off

📅 Timing:
• Friday 6 PM - Sunday 11:59 PM
• SMS and email notifications
• Homepage banner

🎁 Additional Incentives:
• Free shipping (orders over $50)
• Gift wrapping service
• Double loyalty points

📊 Expected Results:
• 40% traffic increase
• 25% conversion boost`;
    }
    
    // Default response
    return `Hello! 👋 I'm Nuvi AI, your e-commerce assistant.

I'm here to help grow your store! I can assist you with:

📊 **Analytics & Reporting**
• Store performance analysis
• Sales trends and insights

📝 **Content Creation**
• SEO-optimized product descriptions
• Compelling titles and tags

📧 **Marketing**
• Email campaign copy
• SMS notifications
• Social media posts

🎯 **Strategy**
• Campaign planning
• Pricing suggestions
• Customer segmentation

💬 You can ask me:
"Write a description for my new product"
"Suggest a Black Friday campaign"
"Create an Instagram story copy"

Let's get started! What would you like to do?`;
  };

  const handleAdminNav = (path: string) => {
    router.push(path);
  };

  const handleStoreNav = (path: string) => {
    if (store) {
      router.push(`/dashboard/stores/${store.subdomain}/${path}`);
    }
  };

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, path: '/admin' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'stores', label: 'Stores', icon: Store, path: '/admin/stores' },
    { id: 'email-packages', label: 'Email Packages', icon: Mail, path: '/admin/email-packages' },
    { id: 'blog', label: 'Blog', icon: FileText, path: '/admin/blog' },
    { id: 'finance', label: 'Finance', icon: DollarSign, path: '/admin/finance' },
    { id: 'pricing', label: 'Pricing Plans', icon: DollarSign, path: '/admin/pricing' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const storeTabs = [
    { id: 'overview', label: 'Overview', icon: Home, action: () => handleStoreNav('overview') },
    
    // Core Commerce
    { id: 'divider-commerce', label: '--- COMMERCE ---', isDivider: true },
    { id: 'products', label: 'Products', icon: Package, action: () => handleStoreNav('products') },
    { id: 'categories', label: 'Categories', icon: FolderTree, action: () => handleStoreNav('categories') },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, action: () => handleStoreNav('orders') },
    { id: 'customers', label: 'Customers', icon: Users, action: () => handleStoreNav('customers') },
    
    // Marketing & Growth
    { id: 'divider-growth', label: '--- GROWTH ---', isDivider: true },
    { 
      id: 'marketing', 
      label: 'Marketing', 
      icon: Megaphone, 
      action: () => handleStoreNav('marketing'),
      subItems: [
        { id: 'campaigns', label: 'Campaigns', icon: Zap, action: () => handleStoreNav('marketing/campaigns') },
        { id: 'discounts', label: 'Discounts', icon: Tag, action: () => handleStoreNav('marketing/discounts') },
        { id: 'automations', label: 'Automations', icon: Cpu, action: () => handleStoreNav('marketing/automations') },
      ]
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, action: () => handleStoreNav('analytics') },
    
    // Sales Channels
    { id: 'divider-channels', label: '--- SALES CHANNELS ---', isDivider: true },
    { 
      id: 'sales-channels', 
      label: 'Sales Channels', 
      icon: Globe, 
      subItems: [
        { id: 'online-store', label: 'Online Store', icon: Monitor, action: () => handleStoreNav('themes') },
        { id: 'pos', label: 'Point of Sale', icon: CreditCard, action: () => handleStoreNav('sales-channels/pos') },
        { id: 'social-commerce', label: 'Social Commerce', icon: Share2, action: () => handleStoreNav('sales-channels/social') },
        { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, action: () => handleStoreNav('sales-channels/marketplace') },
      ]
    },
    
    // Content Management
    { id: 'divider-content', label: '--- CONTENT ---', isDivider: true },
    { 
      id: 'content', 
      label: 'Content', 
      icon: FileText, 
      subItems: [
        { id: 'pages', label: 'Pages', icon: FileText, action: () => handleStoreNav('content/pages') },
        { id: 'blogs', label: 'Blogs', icon: PenTool, action: () => handleStoreNav('content/blogs') },
        { id: 'media', label: 'Media', icon: Image, action: () => handleStoreNav('content/media') },
        { id: 'menus', label: 'Navigation', icon: Menu, action: () => handleStoreNav('content/menus') },
      ]
    },
    
    // Apps & Extensions
    { id: 'divider-apps', label: '--- APPS ---', isDivider: true },
    { 
      id: 'apps', 
      label: 'Apps', 
      icon: Puzzle, 
      action: () => handleStoreNav('apps'),
      subItems: installedApps.length > 0 ? [
        ...installedApps.map(install => ({
          id: install.app.code,
          label: install.app.name,
          action: () => {
            // Special handling for apps with custom pages
            if (install.app.code === 'shopify-import') {
              handleStoreNav('apps/shopify-import');
            } else {
              handleStoreNav(`apps?app=${install.app.code}`);
            }
          }
        })),
        { id: 'divider', label: '---', action: () => {} },
        { id: 'app-store', label: 'Browse Apps', action: () => handleStoreNav('apps') }
      ] : undefined
    }
  ];

  // Determine active tab based on pathname
  const currentTab = pathname.split('/').pop() || 'overview';
  
  // Check if a parent menu should be highlighted based on current path
  const isParentMenuActive = (tabId: string): boolean => {
    if (!pathname) return false;
    
    // Special cases for parent menus with subItems
    if (tabId === 'sales-channels') {
      return pathname.includes('/themes') || pathname.includes('/sales-channels/');
    }
    if (tabId === 'marketing') {
      return pathname.includes('/marketing/');
    }
    if (tabId === 'content') {
      return pathname.includes('/content/');
    }
    if (tabId === 'apps') {
      return pathname.includes('/apps/');
    }
    
    // Default: check if current tab matches
    return currentTab === tabId;
  };

  // Check if we're on settings page
  const isSettingsPage = pathname?.includes('/settings');

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb', position: 'relative' }}>
      {/* Sidebar - Hidden on Settings page */}
      {!isSettingsPage && (
        <aside 
          style={{
            width: sidebarCollapsed ? '64px' : '220px',
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.2s',
            position: 'relative',
          }}
        >
        {/* Navigation */}
        <nav style={{ flex: 1, padding: '6px', overflowY: 'auto' }}>
          {isAdmin ? (
            adminTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleAdminNav(tab.path)}
                style={{
                  width: '100%',
                  padding: sidebarCollapsed ? '10px' : '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  transition: 'all 0.2s',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={sidebarCollapsed ? tab.label : undefined}
              >
                <tab.icon size={16} style={{ color: activeTab === tab.id ? '#111827' : '#6b7280', flexShrink: 0 }} />
                {!sidebarCollapsed && (
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: activeTab === tab.id ? '500' : '400',
                    color: activeTab === tab.id ? '#111827' : '#374151'
                  }}>
                    {tab.label}
                  </span>
                )}
              </button>
            ))
          ) : (
            storeTabs.map(tab => {
              // Render divider - hide when sidebar is collapsed
              if (tab.isDivider) {
                if (sidebarCollapsed) {
                  return null; // Don't render dividers when collapsed
                }
                return (
                  <div key={tab.id} style={{
                    padding: '8px 10px 4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#9ca3af',
                    letterSpacing: '0.05em',
                    marginTop: tab.id === 'divider-commerce' ? '4px' : '12px',
                    marginBottom: '4px',
                    borderTop: tab.id !== 'divider-commerce' ? '1px solid #f3f4f6' : 'none',
                    paddingTop: tab.id !== 'divider-commerce' ? '12px' : '8px',
                  }}>
                    {tab.label.replace(/---/g, '').trim()}
                  </div>
                );
              }
              
              return (
                <div key={tab.id}>
                <button
                  onClick={() => {
                    if (tab.subItems) {
                      setExpandedMenus(prev => 
                        prev.includes(tab.id) 
                          ? prev.filter(id => id !== tab.id)
                          : [...prev, tab.id]
                      );
                    } else if (tab.path) {
                      router.push(tab.path);
                    } else if (tab.action) {
                      tab.action();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: sidebarCollapsed ? '10px' : '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: 'none',
                    backgroundColor: isParentMenuActive(tab.id) ? '#f3f4f6' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '2px',
                    transition: 'all 0.2s',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isParentMenuActive(tab.id)) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isParentMenuActive(tab.id)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  {tab.icon && <tab.icon size={16} style={{ color: isParentMenuActive(tab.id) ? '#111827' : '#6b7280', flexShrink: 0 }} />}
                  {!sidebarCollapsed && (
                    <>
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: isParentMenuActive(tab.id) ? '500' : '400',
                        color: isParentMenuActive(tab.id) ? '#111827' : '#374151',
                        flex: 1,
                        textAlign: 'left'
                      }}>
                        {tab.label}
                      </span>
                      {tab.subItems && (
                        <ChevronDown 
                          size={12} 
                          style={{ 
                            color: '#6b7280',
                            transform: expandedMenus.includes(tab.id) ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      )}
                    </>
                  )}
                </button>
                
                {/* Sub Items */}
                {!sidebarCollapsed && tab.subItems && expandedMenus.includes(tab.id) && (
                  <div style={{ 
                    marginLeft: '26px', 
                    marginTop: '2px',
                    paddingLeft: '4px',
                    borderLeft: '2px solid #f3f4f6',
                    marginBottom: '4px',
                  }}>
                    {tab.subItems.map(subItem => {
                      // Render divider
                      if (subItem.id === 'divider') {
                        return (
                          <div 
                            key={subItem.id} 
                            style={{ 
                              height: '1px', 
                              backgroundColor: '#e5e7eb', 
                              margin: '4px 0',
                              width: 'calc(100% - 8px)' 
                            }} 
                          />
                        );
                      }
                      
                      return (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          if (subItem.path) {
                            router.push(subItem.path);
                          } else if (subItem.action) {
                            subItem.action();
                          }
                        }}
                        style={{
                          width: 'calc(100% - 4px)',
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: 'none',
                          borderRadius: '6px',
                          backgroundColor: pathname.includes(subItem.id) ? '#e5e7eb' : 'transparent',
                          color: pathname.includes(subItem.id) ? '#111827' : '#6b7280',
                          fontSize: '12px',
                          fontWeight: pathname.includes(subItem.id) ? '500' : '400',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textAlign: 'left',
                          marginBottom: '2px'
                        }}
                        onMouseEnter={(e) => {
                          if (!pathname.includes(subItem.id)) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!pathname.includes(subItem.id)) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {subItem.icon && <subItem.icon size={14} style={{ color: pathname.includes(subItem.id) ? '#111827' : '#9ca3af' }} />}
                        {subItem.label}
                      </button>
                      );
                    })}
                  </div>
                )}
              </div>
              );
            })
          )}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <ChevronDown 
            size={14} 
            style={{ 
              transform: sidebarCollapsed ? 'rotate(-90deg)' : 'rotate(90deg)',
              transition: 'transform 0.2s'
            }} 
          />
        </button>
        </aside>
      )}

      {/* Main Content Area */}
      <div 
        className="dashboard-content"
        style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
      }}>
        {/* Top Header */}
        <header style={{
          height: '48px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          {/* Left side with menu toggle and store selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                padding: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#6b7280'
              }}
            >
              <Menu size={18} />
            </button>

            {/* Store Selector Dropdown */}
            {!isAdmin && (
              <div style={{ position: 'relative' }} data-dropdown="store">
                <button
                  onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    minWidth: '140px'
                  }}
                >
                  <Store size={14} />
                  <span style={{ flex: 1, textAlign: 'left' }}>
                    {store?.name || 'Select Store'}
                  </span>
                  <ChevronDown size={14} style={{
                    transform: isStoreDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }} />
                </button>

                {isStoreDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    minWidth: '200px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000
                  }}>
                    {allStores?.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          router.push(`/dashboard/stores/${s.subdomain}`);
                          setIsStoreDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          background: store?.id === s.id ? '#f3f4f6' : 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          textAlign: 'left',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          if (store?.id !== s.id) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (store?.id !== s.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '500' }}>{s.name}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                            {s.subdomain}.lvh.me
                          </div>
                        </div>
                        {store?.id === s.id && (
                          <Check size={14} style={{ color: '#10b981' }} />
                        )}
                      </button>
                    ))}
                    <div style={{
                      borderTop: '1px solid #e5e7eb',
                      padding: '8px 12px'
                    }}>
                      <button
                        onClick={() => {
                          router.push('/dashboard/stores/new');
                          setIsStoreDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: '#6366f1',
                          fontWeight: '500',
                          padding: 0
                        }}
                      >
                        <Plus size={14} />
                        Create New Store
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Actions - Icon Only */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* View Store - Icon Only */}
            <button
              onClick={() => window.open(`http://${store?.subdomain}.lvh.me:3000`, '_blank')}
              style={{
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              title="View Store"
            >
              <ExternalLink size={16} />
            </button>

            {/* Theme Studio - Icon Only */}
            <button
              onClick={() => router.push(`/dashboard/stores/${store?.subdomain}/theme-studio`)}
              style={{
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              title="Theme Studio"
            >
              <Palette size={16} />
            </button>

            {/* Divider */}
            <div style={{ 
              width: '1px', 
              height: '20px', 
              backgroundColor: '#e5e7eb',
              margin: '0 4px'
            }} />

            {/* Search - Icon Only */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              style={{
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              title="Search (⌘K)"
            >
              <Search size={16} />
            </button>

            {/* AI Assistant - Icon Only */}
            <button
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
              style={{
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              title="AI Assistant"
            >
              <Sparkles size={16} />
            </button>

            {/* Settings - Icon Only */}
            {!isSettingsPage && (
              <button
                onClick={() => router.push(`/dashboard/stores/${store?.subdomain}/settings`)}
                style={{
                  padding: '8px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                title="Settings"
              >
                <Settings size={16} />
              </button>
            )}

            {/* User Menu */}
            <div style={{ position: 'relative' }} data-dropdown="user">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginLeft: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {session?.user?.email?.[0].toUpperCase() || 'U'}
              </button>

              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px',
                  zIndex: 1000
                }}>
                  {/* User Info */}
                  <div style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#111827' }}>
                      {session?.user?.name || session?.user?.email?.split('@')[0]}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {session?.user?.email}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '4px' }}>
                    <button
                      onClick={() => {
                        router.push('/dashboard/account');
                        setIsUserMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        background: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#374151',
                        textAlign: 'left',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <UserCog size={14} />
                      Account Settings
                    </button>

                    {!isAdmin && (
                      <button
                        onClick={() => {
                          router.push('/dashboard/billing');
                          setIsUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: 'none',
                          background: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: '#374151',
                          textAlign: 'left',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <CreditCard size={14} />
                        Billing & Plans
                      </button>
                    )}
                  </div>

                  {/* Sign Out */}
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    padding: '4px'
                  }}>
                    <button
                      onClick={() => {
                        router.push('/api/auth/signout');
                        setIsUserMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        background: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#dc2626',
                        textAlign: 'left',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
        }}>
          {children}
        </main>
      </div>

      {/* AI Assistant Sidebar */}
      <div style={{
        width: aiAssistantOpen ? '25%' : '0',
        minWidth: aiAssistantOpen ? '320px' : '0',
        height: '100vh',
        backgroundColor: 'white',
        borderLeft: aiAssistantOpen ? '1px solid #e5e7eb' : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        overflow: 'hidden',
      }}>
        {aiAssistantOpen && (
          <>
        {/* Conversation List Dropdown */}
        {showConversationList && (
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '16px',
            right: '16px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            zIndex: 100,
            maxHeight: '300px',
            overflow: 'auto',
          }}>
            <div style={{ padding: '8px' }}>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#6b7280',
                padding: '4px 8px',
                marginBottom: '4px'
              }}>
                Recent Conversations ({conversations.length})
              </div>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: conv.id === currentConversationId ? '#f3f4f6' : 'transparent',
                  }}
                  onClick={() => switchConversation(conv.id)}
                  onMouseEnter={(e) => {
                    if (conv.id !== currentConversationId) {
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (conv.id !== currentConversationId) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {conv.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {conv.messages?.length || 0} messages • {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    style={{
                      padding: '2px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {conversations.length > 3 && (
                <button
                  onClick={clearAllConversations}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  Clear All Conversations
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Assistant Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowConversationList(!showConversationList)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              <ChevronDown size={14} />
              {conversations.find(c => c.id === currentConversationId)?.title || 'New Conversation'}
            </button>
            
            <button
              onClick={createNewConversation}
              title="New conversation"
              style={{
                padding: '4px 8px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              + New
            </button>
          </div>
          <button
            onClick={() => setAiAssistantOpen(false)}
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* AI Assistant Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
        }}>
          {aiMessages.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
              {/* AI Avatar */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Bot size={32} style={{ color: 'white' }} />
              </div>
              
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#111827',
              }}>
                Hey {session.user.name?.split(' ')[0] || 'there'}
              </h3>
              
              <p style={{
                fontSize: '18px',
                color: '#7c3aed',
                marginBottom: '24px',
              }}>
                How can I help?
              </p>

              {/* Quick Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                maxWidth: '300px',
              }}>
                <button
                  onClick={() => {
                    setAiInput("How is my store performing?");
                    setTimeout(() => sendAiMessage(), 100);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#7c3aed';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <span style={{ fontSize: '12px' }}>●</span> What's new?
                </button>
              </div>

              {/* Example Tasks */}
              <div style={{
                marginTop: '40px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginBottom: '4px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {activeTab === 'products' && 'Product Management'}
                  {activeTab === 'orders' && 'Order Management'}
                  {activeTab === 'customers' && 'Customer Insights'}
                  {activeTab === 'marketing' && 'Marketing Tools'}
                  {activeTab === 'analytics' && 'Analytics & Reports'}
                  {activeTab === 'settings' && 'Store Configuration'}
                  {activeTab === 'themes' && 'Theme Customization'}
                  {(!activeTab || activeTab === 'overview') && 'Quick Actions'}
                </div>
                <ContextAwareSuggestions 
                  activeTab={activeTab}
                  setAiInput={setAiInput}
                  sendAiMessage={sendAiMessage}
                />
              </div>
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              gap: '16px',
              paddingBottom: '16px'
            }}>
              {aiMessages.map((message, index) => (
                <div 
                  key={index} 
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: message.role === 'user' 
                      ? '#e5e7eb' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {message.role === 'user' ? (
                      <Users size={16} style={{ color: '#6b7280' }} />
                    ) : (
                      <Bot size={16} style={{ color: 'white' }} />
                    )}
                  </div>
                  
                  {/* Message */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      padding: '12px',
                      background: message.role === 'user' ? '#f3f4f6' : '#f9fafb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: '#374151',
                    }}>
                      {message.content}
                      {message.model && (
                        <div style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          color: '#9ca3af',
                        }}>
                          Model: {message.model}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {aiLoading && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Bot size={16} style={{ color: 'white' }} />
                  </div>
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#6b7280',
                  }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ animation: 'bounce 1.4s infinite' }}>●</span>
                      <span style={{ animation: 'bounce 1.4s infinite 0.2s' }}>●</span>
                      <span style={{ animation: 'bounce 1.4s infinite 0.4s' }}>●</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Assistant Input */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#fafafa',
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask anything..."
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'none',
                minHeight: '44px',
                maxHeight: '120px',
                outline: 'none',
                backgroundColor: 'white',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendAiMessage();
                }
              }}
            />
            <button
              onClick={sendAiMessage}
              style={{
                padding: '10px',
                background: aiInput.trim() && !aiLoading ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
                border: 'none',
                borderRadius: '8px',
                cursor: aiInput.trim() && !aiLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              disabled={!aiInput.trim() || aiLoading}
            >
              <Send size={20} style={{ color: 'white' }} />
            </button>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Command Palette */}
      {store && (
        <CommandPalette 
          store={store}
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}
      
      {/* Settings Modal */}
      {store && (
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          subdomain={store.subdomain}
        />
      )}
    </div>
  );
}