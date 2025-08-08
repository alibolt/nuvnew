'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, ExternalLink, Home, Package, Users, 
  FileText, ChevronDown, ChevronRight, Save, X, 
  Link as LinkIcon, Folder, Eye, EyeOff, Copy,
  CornerDownRight, Move, Hash, Globe, ShoppingBag,
  Sparkles, Zap, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MenuItem {
  id: string;
  title: string;
  url: string;
  type: 'page' | 'product' | 'collection' | 'blog' | 'external' | 'custom';
  target: '_self' | '_blank';
  isActive: boolean;
  isExpanded?: boolean;
  parentId?: string;
  position: number;
  children?: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  handle: string;
  location: 'header' | 'footer' | 'sidebar';
  items: MenuItem[];
}

interface MenuBuilderProps {
  menu?: Menu;
  subdomain: string;
  onSave: (menu: Menu) => void;
  onCancel: () => void;
  isEmbedded?: boolean; // Add flag to know if it's embedded in tab
}

interface LinkOption {
  value: string;
  label: string;
  url: string;
  type: 'page' | 'product' | 'collection' | 'blog';
}

export function MenuBuilder({ menu, storeId, onSave, onCancel, isEmbedded = false }: MenuBuilderProps) {
  // Default menu structure if menu is undefined
  const defaultMenu: Menu = {
    id: '',
    name: 'New Menu',
    handle: 'new-menu',
    location: 'header',
    items: []
  };
  
  const currentMenu = menu || defaultMenu;
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>(currentMenu.items || []);
  const [menuName, setMenuName] = useState(currentMenu.name || 'New Menu');
  const [menuLocation, setMenuLocation] = useState(currentMenu.location || 'header');
  
  // Update states when menu prop changes
  useEffect(() => {
    if (menu) {
      setMenuItems(menu.items || []);
      setMenuName(menu.name || 'New Menu');
      setMenuLocation(menu.location || 'header');
    }
  }, [menu]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Visual builder state
  const [builderMode, setBuilderMode] = useState<'visual' | 'list'>('visual');
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  
  // Quick templates
  const menuTemplates = [
    { 
      name: 'E-commerce Starter',
      icon: ShoppingBag,
      items: [
        { title: 'Shop', url: '/products', children: [
          { title: 'New Arrivals', url: '/collections/new' },
          { title: 'Best Sellers', url: '/collections/best-sellers' },
          { title: 'Sale', url: '/collections/sale' }
        ]},
        { title: 'About', url: '/about' },
        { title: 'Contact', url: '/contact' }
      ]
    },
    {
      name: 'Simple Navigation',
      icon: Zap,
      items: [
        { title: 'Home', url: '/' },
        { title: 'Products', url: '/products' },
        { title: 'About', url: '/about' },
        { title: 'Contact', url: '/contact' }
      ]
    }
  ];

  // Smart URL suggestions based on input
  const [urlSuggestions, setUrlSuggestions] = useState<string[]>([]);
  const commonUrls = [
    '/', '/products', '/collections', '/about', '/contact', '/blog',
    '/pages/shipping', '/pages/returns', '/pages/faq', '/pages/privacy',
    '/collections/new', '/collections/sale', '/products/featured'
  ];

  // AI-powered title generation
  const generateTitle = (url: string): string => {
    const cleanUrl = url.replace(/^\/+|\/+$/g, '');
    if (!cleanUrl) return 'Home';
    
    const parts = cleanUrl.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Smart replacements
    const replacements: Record<string, string> = {
      'faq': 'FAQ',
      'products': 'Shop',
      'collections': 'Collections',
      'about': 'About Us',
      'contact': 'Contact Us'
    };
    
    const title = replacements[lastPart] || 
      lastPart.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    
    return title;
  };

  // Detect URL type with icons
  const detectUrlType = (url: string): MenuItem['type'] => {
    if (url.startsWith('http://') || url.startsWith('https://')) return 'external';
    if (url.includes('/products/')) return 'product';
    if (url.includes('/collections/')) return 'collection';
    if (url.includes('/blogs/') || url.includes('/blog/')) return 'blog';
    if (url.includes('/pages/')) return 'page';
    return 'custom';
  };

  // Create new menu item
  const createMenuItem = (url: string, title?: string, parentId?: string | null): MenuItem => {
    const generatedTitle = title || generateTitle(url);
    const type = detectUrlType(url);
    const target = type === 'external' ? '_blank' : '_self';

    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: generatedTitle,
      url,
      type,
      target,
      isActive: true,
      isExpanded: true,
      parentId: parentId || undefined,
      position: 0,
      children: []
    };
  };

  // Add menu item with animation
  const addMenuItem = (url: string, title?: string, parentId?: string | null) => {
    const newItem = createMenuItem(url, title, parentId);
    
    if (parentId) {
      const addToParent = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newItem],
              isExpanded: true
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addToParent(item.children)
            };
          }
          return item;
        });
      };
      setMenuItems(addToParent(menuItems));
    } else {
      setMenuItems([...menuItems, newItem]);
    }
    
    // Select the new item
    setSelectedItem(newItem.id);
  };

  // Delete menu item and its children
  const deleteMenuItem = (itemId: string) => {
    const deleteFromItems = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => item.id !== itemId).map(item => ({
        ...item,
        children: item.children ? deleteFromItems(item.children) : []
      }));
    };
    setMenuItems(deleteFromItems(menuItems));
  };

  // Update menu item
  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    const updateInItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return {
            ...item,
            children: updateInItems(item.children)
          };
        }
        return item;
      });
    };
    setMenuItems(updateInItems(menuItems));
  };

  // Toggle item expanded state
  const toggleItemExpanded = (itemId: string) => {
    updateMenuItem(itemId, { isExpanded: !findItemById(itemId)?.isExpanded });
  };

  // Find item by ID
  const findItemById = (itemId: string): MenuItem | null => {
    const searchInItems = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.id === itemId) return item;
        if (item.children) {
          const found = searchInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return searchInItems(menuItems);
  };

  // Simple list item for list view
  const SimpleListItem = ({ item, onUpdate, onDelete, depth = 0 }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div style={{ marginLeft: `${depth * 24}px` }}>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
          {hasChildren && (
            <button
              onClick={() => onUpdate(item.id, { isExpanded: !item.isExpanded })}
              className="p-1"
            >
              {item.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          
          {isEditing ? (
            <>
              <Input
                value={item.title}
                onChange={(e) => onUpdate(item.id, { title: e.target.value })}
                className="h-8 flex-1"
              />
              <Input
                value={item.url}
                onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                className="h-8 flex-1"
              />
              <Button size="sm" onClick={() => setIsEditing(false)}>Save</Button>
            </>
          ) : (
            <>
              <div className="flex-1 cursor-pointer" onClick={() => setIsEditing(true)}>
                <span className="font-medium">{item.title}</span>
                <span className="text-sm text-gray-500 ml-2">{item.url}</span>
              </div>
              <button
                onClick={() => onUpdate(item.id, { isActive: !item.isActive })}
                className="p-1"
              >
                {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        
        {hasChildren && item.isExpanded && (
          <div className="mt-2">
            {item.children.map((child: any) => (
              <SimpleListItem 
                key={child.id} 
                item={child} 
                onUpdate={onUpdate} 
                onDelete={onDelete} 
                depth={depth + 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Preview menu component
  const PreviewMenu = ({ items, depth = 0 }: { items: MenuItem[]; depth?: number }) => {
    if (depth > 0) {
      return (
        <ul className="ml-4 mt-2 space-y-1">
          {items.map(item => (
            <li key={item.id}>
              <a
                href={item.url}
                target={item.target}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.title}
              </a>
              {item.children && item.children.length > 0 && (
                <PreviewMenu items={item.children.filter(child => child.isActive)} depth={depth + 1} />
              )}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul className="flex items-center gap-6">
        {items.map(item => (
          <li key={item.id} className="relative group">
            <a
              href={item.url}
              target={item.target}
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              {item.title}
              {item.children && item.children.length > 0 && (
                <ChevronDown className="inline-block ml-1 h-3 w-3" />
              )}
            </a>
            {item.children && item.children.length > 0 && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <PreviewMenu items={item.children.filter(child => child.isActive)} depth={depth + 1} />
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  // Duplicate menu item
  const duplicateMenuItem = (itemId: string) => {
    const item = findItemById(itemId);
    if (item) {
      const duplicate: MenuItem = {
        ...item,
        id: `item_${Date.now()}`,
        title: `${item.title} (Copy)`,
        children: []
      };
      
      if (item.parentId) {
        const addToParent = (items: MenuItem[]): MenuItem[] => {
          return items.map(menuItem => {
            if (menuItem.id === item.parentId) {
              return {
                ...menuItem,
                children: [...(menuItem.children || []), duplicate]
              };
            }
            if (menuItem.children) {
              return {
                ...menuItem,
                children: addToParent(menuItem.children)
              };
            }
            return menuItem;
          });
        };
        setMenuItems(addToParent(menuItems));
      } else {
        setMenuItems([...menuItems, duplicate]);
      }
    }
  };


  // Save menu
  const handleSave = () => {
    const updatedMenu: Menu = {
      ...menu,
      name: menuName,
      location: menuLocation,
      items: menuItems,
    };
    onSave(updatedMenu);
  };

  // Get icon for link type
  const getLinkTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return FileText;
      case 'product': return Package;
      case 'collection': return Folder;
      case 'blog': return FileText;
      case 'external': return ExternalLink;
      default: return LinkIcon;
    }
  };

  // Connect two items (make one child of another)
  const connectItems = (childId: string, parentId: string) => {
    if (childId === parentId) return;
    
    const child = findItemById(childId);
    if (!child) return;
    
    // Remove from current position
    const removeFromItems = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => item.id !== childId).map(item => ({
        ...item,
        children: item.children ? removeFromItems(item.children) : []
      }));
    };
    
    let updatedItems = removeFromItems(menuItems);
    
    // Add as child
    const addToParent = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...(item.children || []), { ...child, parentId }],
            isExpanded: true
          };
        }
        if (item.children) {
          return {
            ...item,
            children: addToParent(item.children)
          };
        }
        return item;
      });
    };
    
    setMenuItems(addToParent(updatedItems));
    setConnectMode(false);
    setSelectedItem(null);
  };

  // Visual menu item component
  const VisualMenuItem = ({ item, depth = 0 }: { item: MenuItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const Icon = getLinkTypeIcon(item.type);
    const isSelected = selectedItem === item.id;
    const isHovered = hoveredItem === item.id;
    
    return (
      <div className="relative">
        {/* Connection line for children */}
        {depth > 0 && (
          <div className="absolute left-6 -top-3 w-6 h-3 border-l-2 border-b-2 border-gray-300 rounded-bl-lg" />
        )}
        
        <div
          className={`group relative transition-all duration-200 ${
            isSelected ? 'scale-105' : ''
          }`}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div
            onClick={() => {
              if (connectMode && selectedItem && selectedItem !== item.id) {
                connectItems(selectedItem, item.id);
              } else {
                setSelectedItem(item.id);
                setConnectMode(false);
              }
            }}
            className={`relative bg-white border-2 rounded-xl p-4 cursor-pointer transition-all ${
              isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
            } ${
              connectMode && selectedItem && selectedItem !== item.id 
                ? 'border-dashed border-blue-400 bg-blue-50' 
                : ''
            } ${
              !item.isActive ? 'opacity-50' : ''
            }`}
          >
            {/* Type Icon */}
            <div className="absolute -top-3 -right-3 bg-white rounded-full p-2 border-2 border-gray-200">
              <Icon className="h-4 w-4 text-gray-600" />
            </div>
            
            {/* Content */}
            <div className="pr-8">
              <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-500 truncate">{item.url}</p>
            </div>
            
            {/* Quick Actions */}
            {isHovered && !connectMode && (
              <div className="absolute top-2 right-2 flex gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateMenuItem(item.id, { isActive: !item.isActive });
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {item.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMenuItem(item.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {/* Children indicator */}
            {hasChildren && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-100 text-xs text-gray-600 px-2 py-1 rounded-full">
                {item.children!.length} items
              </div>
            )}
          </div>
          
          {/* Add child button */}
          {isSelected && !connectMode && (
            <button
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) {
                  addMenuItem(url, undefined, item.id);
                }
              }}
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white rounded-full p-1 shadow-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Children */}
        {hasChildren && item.isExpanded && (
          <div className="ml-12 mt-6 space-y-4">
            {item.children!.map(child => (
              <VisualMenuItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Builder</h2>
          <p className="text-gray-600">Drag and drop to organize your navigation</p>
        </div>
        <div className="flex gap-2">
          {!isEmbedded && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} className="bg-gray-900 text-white hover:bg-gray-800">
            <Save className="h-4 w-4 mr-2" />
            Save Menu
          </Button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBuilderMode('visual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              builderMode === 'visual' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="inline-block h-4 w-4 mr-2" />
            Visual Builder
          </button>
          <button
            onClick={() => setBuilderMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              builderMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="inline-block h-4 w-4 mr-2" />
            List View
          </button>
        </div>
      </div>

      {/* Quick Templates */}
      {menuItems.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Start with a template</h3>
          <div className="grid grid-cols-2 gap-4">
            {menuTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.name}
                  onClick={() => {
                    const items = template.items.map((item, index) => 
                      createMenuItem(item.url, item.title)
                    );
                    // Add children if any
                    template.items.forEach((templateItem, index) => {
                      if (templateItem.children) {
                        items[index].children = templateItem.children.map(child => 
                          createMenuItem(child.url, child.title)
                        );
                      }
                    });
                    setMenuItems(items);
                  }}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <Icon className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {template.items.length} menu items
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {builderMode === 'visual' ? (
        <div className="space-y-6">
          {/* Visual Builder Toolbar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold">Visual Menu Builder</h3>
                <Badge variant="secondary">
                  {menuItems.length} items
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Quick Add */}
                <div className="relative">
                  <Input
                    placeholder="Type URL and press Enter"
                    className="w-64"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        addMenuItem(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length > 1) {
                        setUrlSuggestions(
                          commonUrls.filter(url => 
                            url.toLowerCase().includes(value.toLowerCase())
                          ).slice(0, 5)
                        );
                      } else {
                        setUrlSuggestions([]);
                      }
                    }}
                  />
                  
                  {/* URL Suggestions */}
                  {urlSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {urlSuggestions.map(url => (
                        <button
                          key={url}
                          onClick={() => {
                            addMenuItem(url);
                            setUrlSuggestions([]);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          {url}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Connect Mode Toggle */}
                <Button
                  variant={connectMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setConnectMode(!connectMode);
                    if (!connectMode) setSelectedItem(null);
                  }}
                >
                  <Move className="h-4 w-4 mr-1" />
                  {connectMode ? 'Cancel Connect' : 'Connect Items'}
                </Button>
              </div>
            </div>
            
            {connectMode && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Zap className="inline-block h-4 w-4 mr-1" />
                  Click an item to select it, then click another to make it a sub-item
                </p>
              </div>
            )}
          </div>

          {/* Visual Menu Tree */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-8 min-h-[400px]">
            {menuItems.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Start building your menu</p>
                  <p className="text-sm text-gray-400 mt-1">Type a URL above or choose a template</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {menuItems.map(item => (
                  <VisualMenuItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Live Preview</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <nav>
                <PreviewMenu items={menuItems.filter(item => item.isActive)} />
              </nav>
            </div>
          </div>
        </div>
      ) : (
        /* List View - Simplified version */
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-3">
            {menuItems.map(item => (
              <SimpleListItem key={item.id} item={item} onUpdate={updateMenuItem} onDelete={deleteMenuItem} />
            ))}
          </div>
          
          <button
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) addMenuItem(url);
            }}
            className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            <Plus className="h-5 w-5 mx-auto" />
            Add Menu Item
          </button>
        </div>
      )}
    </div>
  );
}