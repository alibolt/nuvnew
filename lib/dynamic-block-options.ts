// Dynamic options loader for block settings
import { getBlockType } from './block-types';
// Theme block schemas will be loaded when themes are available

export interface DynamicOption {
  value: string;
  label: string;
}

export interface BlockSettingOptions {
  [settingKey: string]: DynamicOption[];
}

// Cache for dynamic options to avoid repeated API calls
const optionsCache = new Map<string, { data: DynamicOption[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fetch dynamic options for a specific setting
export async function fetchDynamicOptions(
  subdomain: string,
  settingKey: string,
  blockType: string
): Promise<DynamicOption[]> {
  const cacheKey = `${subdomain}-${blockType}-${settingKey}`;
  const cached = optionsCache.get(cacheKey);
  
  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    let options: DynamicOption[] = [];

    // Load different options based on setting key
    switch (settingKey) {
      case 'menu_handle':
      case 'menuHandle':
      case 'menuId':
        options = await fetchMenuOptions(subdomain);
        break;
      case 'collection_id':
      case 'collectionId':
      case 'categoryId':
      case 'selectedCollections':
        options = await fetchCollectionOptions(subdomain);
        break;
      case 'product_id':
      case 'selectedProducts':
        options = await fetchProductOptions(subdomain);
        break;
      default:
        return [];
    }

    // Cache the result
    optionsCache.set(cacheKey, {
      data: options,
      timestamp: Date.now()
    });

    return options;
  } catch (error) {
    console.error('Failed to fetch dynamic options:', error);
    return [];
  }
}

// Fetch menu options from dashboard
async function fetchMenuOptions(subdomain: string): Promise<DynamicOption[]> {
  try {
    const response = await fetch(`/api/stores/${subdomain}/menus`);
    if (!response.ok) {
      console.error('Failed to fetch menus:', response.status);
      return [{ value: 'custom', label: 'Custom Menu Items' }];
    }

    const data = await response.json();
    console.log('📋 Menus API Response:', { data, isArray: Array.isArray(data) });
    
    const options: DynamicOption[] = [
      { value: 'custom', label: 'Custom Menu Items' }
    ];

    // Handle API response format
    let menus = [];
    if (data.success && data.data && Array.isArray(data.data)) {
      // Standard API response format
      menus = data.data;
    } else if (Array.isArray(data)) {
      // Direct array response
      menus = data;
    } else if (data.menus && Array.isArray(data.menus)) {
      // Legacy format
      menus = data.menus;
    } else {
      console.warn('Menus API returned unexpected format:', data);
      return options;
    }

    menus.forEach((menu: any) => {
      options.push({
        value: menu.handle,
        label: menu.name
      });
    });

    return options;
  } catch (error) {
    console.error('Failed to fetch menu options:', error);
    return [{ value: 'custom', label: 'Custom Menu Items' }];
  }
}

// Fetch collection options (using categories endpoint)
async function fetchCollectionOptions(subdomain: string): Promise<DynamicOption[]> {
  try {
    const response = await fetch(`/api/stores/${subdomain}/categories?public=true`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    console.log('📦 Categories API Response:', { data, isArray: Array.isArray(data) });
    
    let categories = [];
    if (data.success && data.data && Array.isArray(data.data)) {
      // Standard API response format
      categories = data.data;
    } else if (Array.isArray(data)) {
      // Direct array response
      categories = data;
    } else if (data.categories && Array.isArray(data.categories)) {
      // Legacy format
      categories = data.categories;
    } else {
      console.warn('Categories API returned unexpected format:', data);
      return [];
    }
    
    return categories.map((category: any) => ({
      value: category.id,
      label: category.name
    }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// Fetch product options
async function fetchProductOptions(subdomain: string): Promise<DynamicOption[]> {
  try {
    const response = await fetch(`/api/stores/${subdomain}/products?limit=50`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    console.log('🛍️ Products API Response:', { data, isArray: Array.isArray(data) });
    
    let products = [];
    if (data.success && data.data && Array.isArray(data.data)) {
      // Standard API response format
      products = data.data;
    } else if (Array.isArray(data)) {
      // Direct array response
      products = data;
    } else if (data.products && Array.isArray(data.products)) {
      // Legacy format
      products = data.products;
    } else {
      console.warn('Products API returned unexpected format:', data);
      return [];
    }
    
    return products.map((product: any) => ({
      value: product.id,
      label: product.name || product.title // Handle both name and title
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

// Clear cache when store data changes
export function clearOptionsCache(subdomain?: string) {
  if (subdomain) {
    // Clear only for specific subdomain
    for (const key of optionsCache.keys()) {
      if (key.startsWith(subdomain)) {
        optionsCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    optionsCache.clear();
  }
}

// Check if a setting key requires dynamic options
export function requiresDynamicOptions(settingKey: string): boolean {
  return ['menu_handle', 'menuHandle', 'menuId', 'collection_id', 'collectionId', 'categoryId', 'product_id', 'selectedCollections', 'selectedProducts'].includes(settingKey);
}

// Get block settings with proper schema
export async function getBlockSettings(blockType: any): Promise<any[]> {
  if (!blockType) return [];
  
  // Check if we have simplified block settings for this block type
  const { simplifiedBlockSettings } = await import('./simplified-block-settings');
  const blockId = blockType.id || blockType.type;
  
  console.log('🔧 getBlockSettings called for block:', blockId, blockType);
  
  if (simplifiedBlockSettings[blockId as keyof typeof simplifiedBlockSettings]) {
    // Use simplified block settings
    const simplified = simplifiedBlockSettings[blockId as keyof typeof simplifiedBlockSettings];
    const settings: any[] = [];
    
    console.log('📋 Using simplified block settings for', blockId, ':', Object.keys(simplified));
    
    Object.entries(simplified).forEach(([key, setting]: [string, any]) => {
      // Check if setting has dynamic options
      if (setting.dynamic) {
        settings.push({
          key,
          type: setting.type || 'text',
          label: setting.label || key,
          default: setting.default,
          options: setting.options,
          dynamic: setting.dynamic,
          placeholder: setting.placeholder,
          required: setting.required,
          min: setting.min,
          max: setting.max,
          step: setting.step,
          conditional: setting.conditional,
          showIf: setting.showIf,
          condition: setting.condition
        });
      } else {
        settings.push({
          key,
          type: setting.type || 'text',
          label: setting.label || key,
          default: setting.default,
          options: setting.options,
          placeholder: setting.placeholder,
          required: setting.required,
          min: setting.min,
          max: setting.max,
          step: setting.step,
          conditional: setting.conditional,
          showIf: setting.showIf,
          condition: setting.condition
        });
      }
    });
    
    return settings;
  }
  
  // Theme-specific schemas will be loaded when themes are available
  
  // Fallback to block type settings
  if (blockType.settings) {
    // Convert block type settings to inspector format
    const settings: any[] = [];
    
    Object.entries(blockType.settings).forEach(([key, setting]: [string, any]) => {
      settings.push({
        key,
        type: setting.type || 'text',
        label: setting.label || key,
        default: setting.default,
        options: setting.options,
        placeholder: setting.placeholder,
        required: setting.required,
        min: setting.min,
        max: setting.max,
        step: setting.step,
        conditional: setting.conditional,
        dynamic: setting.dynamic
      });
    });
    
    return settings;
  }
  
  return [];
}