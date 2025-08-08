'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Menu, Edit, Trash2, ExternalLink, Save, X, 
  ChevronRight, Link as LinkIcon, GripVertical, Eye,
  ChevronDown, Folder, FolderOpen, Info
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  CollisionDetection,
  pointerWithin,
  rectIntersection,
  getFirstCollision
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement
} from '@dnd-kit/modifiers';
import { NestedMenuItemCompact } from './nested-menu-item-compact';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  link: string;
  position: number;
  target?: '_self' | '_blank';
  parentId?: string | null;
  children?: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  handle: string;
  items: MenuItem[];
}

interface NestedMenuManagerProps {
  subdomain: string;
}

const MAX_MENU_DEPTH = 3; // Maximum 3 levels

export function NestedMenuManager({ subdomain }: NestedMenuManagerProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Form states
  const [menuName, setMenuName] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate handle from name
  const generateHandle = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Load menus
  useEffect(() => {
    loadMenus();
  }, [subdomain]);

  const loadMenus = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/menus`);
      if (response.ok) {
        const result = await response.json();
        // Handle API response format { success: true, data: [...] }
        const menusData = result.data || result;
        // Ensure data is an array
        const menusArray = Array.isArray(menusData) ? menusData : [];
        setMenus(menusArray);
        
        // If we were editing a menu, find and set the updated version
        if (activeMenu) {
          const updatedMenu = menusArray.find((m: Menu) => m.id === activeMenu.id);
          if (updatedMenu) {
            setActiveMenu(updatedMenu);
          }
        } else if (menusArray.length > 0) {
          // Set default main menu if no active menu
          const mainMenu = menusArray.find((m: Menu) => m.handle === 'main-menu') || menusArray[0];
          setActiveMenu(mainMenu);
        }
      }
    } catch (error) {
      console.error('Error loading menus:', error);
      toast.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const startCreating = () => {
    setIsCreating(true);
    setIsEditing(false);
    setMenuName('');
    setMenuItems([]);
  };

  const startEditing = (menu: Menu) => {
    setIsEditing(true);
    setIsCreating(false);
    setActiveMenu(menu);
    setMenuName(menu.name);
    
    console.log('Raw menu data:', menu);
    console.log('Menu items before build:', menu.items);
    
    // Convert flat items to nested structure
    const nestedItems = buildNestedMenuStructure(menu.items || []);
    console.log('Nested items after build:', nestedItems);
    
    setMenuItems(nestedItems);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setMenuName('');
    setMenuItems([]);
  };

  // Build nested menu structure from flat array
  const buildNestedMenuStructure = (items: MenuItem[]): MenuItem[] => {
    // If items already have nested structure, flatten first
    const flattenItems = (items: MenuItem[], result: MenuItem[] = []): MenuItem[] => {
      items.forEach(item => {
        result.push({
          id: item.id,
          label: item.label,
          link: item.link,
          position: item.position,
          target: item.target,
          parentId: item.parentId
        });
        if (item.children && item.children.length > 0) {
          flattenItems(item.children, result);
        }
      });
      return result;
    };

    // Check if items are already nested
    const hasNestedStructure = items.some(item => item.children && item.children.length > 0);
    const flatItems = hasNestedStructure ? flattenItems(items) : items;
    
    console.log('Flat items:', flatItems);

    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // First pass: create all items
    flatItems.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    flatItems.forEach(item => {
      const mappedItem = itemMap.get(item.id)!;
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(mappedItem);
      } else {
        rootItems.push(mappedItem);
      }
    });

    // Sort by position
    const sortByPosition = (items: MenuItem[]) => {
      items.sort((a, b) => a.position - b.position);
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortByPosition(item.children);
        }
      });
    };

    sortByPosition(rootItems);
    console.log('Built nested structure:', rootItems);
    return rootItems;
  };

  // Flatten nested menu structure
  const flattenMenuStructure = (items: MenuItem[], parentId: string | null = null): MenuItem[] => {
    const result: MenuItem[] = [];
    
    items.forEach((item, index) => {
      const flatItem: MenuItem = {
        ...item,
        parentId,
        position: index,
        children: undefined
      };
      result.push(flatItem);
      
      if (item.children && item.children.length > 0) {
        result.push(...flattenMenuStructure(item.children, item.id));
      }
    });
    
    return result;
  };

  const addMenuItem = (parentId?: string) => {
    const newItem: MenuItem = {
      id: `temp-${Date.now()}`,
      label: 'New Item',
      link: '/',
      position: parentId ? 0 : menuItems.length,
      target: '_self',
      parentId: parentId || null,
      children: []
    };

    if (parentId) {
      // Add as child
      const updateItemChildren = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newItem]
            };
          }
          if (item.children) {
            return {
              ...item,
              children: updateItemChildren(item.children)
            };
          }
          return item;
        });
      };
      setMenuItems(updateItemChildren(menuItems));
    } else {
      // Add as root item
      setMenuItems([...menuItems, newItem]);
    }
  };

  const updateMenuItem = (itemId: string, field: keyof MenuItem, value: any) => {
    setMenuItems(prevItems => {
      const updateItemRecursive = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, [field]: value };
          }
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: updateItemRecursive(item.children)
            };
          }
          return item;
        });
      };
      return updateItemRecursive(prevItems);
    });
  };

  const removeMenuItem = (itemId: string) => {
    const removeItemRecursive = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => item.id !== itemId)
        .map(item => {
          if (item.children) {
            return {
              ...item,
              children: removeItemRecursive(item.children)
            };
          }
          return item;
        });
    };
    setMenuItems(removeItemRecursive(menuItems));
  };

  // Get item depth in tree
  const getItemDepth = (itemId: string, items: MenuItem[] = menuItems, depth: number = 0): number => {
    for (const item of items) {
      if (item.id === itemId) return depth;
      if (item.children) {
        const childDepth = getItemDepth(itemId, item.children, depth + 1);
        if (childDepth >= 0) return childDepth;
      }
    }
    return -1;
  };

  // Find item by ID
  const findItem = (itemId: string, items: MenuItem[] = menuItems): MenuItem | null => {
    for (const item of items) {
      if (item.id === itemId) return item;
      if (item.children) {
        const found = findItem(itemId, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag over for visual feedback
  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string || null);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setOverId(null);
    
    if (!over || active.id === over.id) return;
    
    const activeItem = findItem(active.id as string);
    const overItem = findItem(over.id as string);
    
    if (!activeItem || !overItem) return;
    
    // Check if we're dropping into a container
    if (over.data.current?.type === 'container') {
      // Move item to be a child of the container
      const targetDepth = getItemDepth(over.id as string) + 1;
      
      if (targetDepth >= MAX_MENU_DEPTH) {
        toast.error(`Maximum menu depth is ${MAX_MENU_DEPTH} levels`);
        return;
      }
      
      // Move logic here
      moveItemToNewParent(active.id as string, over.id as string);
    } else {
      // Reorder within same level
      reorderItems(active.id as string, over.id as string);
    }
  };

  const moveItemToNewParent = (itemId: string, newParentId: string) => {
    // Implementation for moving item to new parent
    const item = findItem(itemId);
    if (!item) return;
    
    // Remove from current position
    const removeFromParent = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(i => i.id !== itemId)
        .map(i => ({
          ...i,
          children: i.children ? removeFromParent(i.children) : []
        }));
    };
    
    // Add to new parent
    const addToParent = (items: MenuItem[]): MenuItem[] => {
      return items.map(i => {
        if (i.id === newParentId) {
          return {
            ...i,
            children: [...(i.children || []), { ...item, parentId: newParentId }]
          };
        }
        if (i.children) {
          return {
            ...i,
            children: addToParent(i.children)
          };
        }
        return i;
      });
    };
    
    let newItems = removeFromParent(menuItems);
    newItems = addToParent(newItems);
    setMenuItems(newItems);
  };

  const reorderItems = (activeId: string, overId: string) => {
    // Find parent of both items
    const findParentId = (itemId: string, items: MenuItem[] = menuItems, parentId: string | null = null): string | null => {
      for (const item of items) {
        if (item.id === itemId) return parentId;
        if (item.children) {
          const found = findParentId(itemId, item.children, item.id);
          if (found !== null) return found;
        }
      }
      return null;
    };
    
    const activeParentId = findParentId(activeId);
    const overParentId = findParentId(overId);
    
    if (activeParentId !== overParentId) {
      // Different parents - move to new parent instead
      moveItemToNewParent(activeId, overParentId || 'root');
      return;
    }
    
    // Same parent - just reorder
    const reorderAtLevel = (items: MenuItem[]): MenuItem[] => {
      const parentItems = activeParentId 
        ? items.find(i => i.id === activeParentId)?.children || []
        : items;
      
      const oldIndex = parentItems.findIndex(i => i.id === activeId);
      const newIndex = parentItems.findIndex(i => i.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(parentItems, oldIndex, newIndex);
        
        if (activeParentId) {
          return items.map(item => {
            if (item.id === activeParentId) {
              return { ...item, children: reordered };
            }
            if (item.children) {
              return { ...item, children: reorderAtLevel(item.children) };
            }
            return item;
          });
        } else {
          return reordered;
        }
      }
      
      return items.map(item => ({
        ...item,
        children: item.children ? reorderAtLevel(item.children) : []
      }));
    };
    
    setMenuItems(reorderAtLevel(menuItems));
  };

  const saveMenu = async () => {
    if (!menuName.trim()) {
      toast.error('Menu name is required');
      return;
    }

    setSaving(true);
    try {
      // Generate handle from name
      const handle = generateHandle(menuName);
      
      // Flatten the nested structure for API
      const flatItems = flattenMenuStructure(menuItems);
      
      // Don't flatten - send nested structure directly
      const menuData = {
        name: menuName,
        handle: handle,
        items: menuItems.map((item, index) => ({
          label: item.label,
          link: item.link,
          target: item.target || '_self',
          position: index,
          children: item.children || []
        }))
      };
      
      console.log('Saving menu with data:', menuData);
      console.log('Menu items before save:', menuItems);

      let response;
      if (isEditing && activeMenu) {
        response = await fetch(`/api/stores/${subdomain}/menus/${activeMenu.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menuData)
        });
      } else {
        response = await fetch(`/api/stores/${subdomain}/menus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menuData)
        });
      }

      if (response.ok) {
        toast.success(isEditing ? 'Menu updated successfully' : 'Menu created successfully');
        cancelForm();
        await loadMenus(); // Wait for menus to reload
      } else {
        const errorData = await response.text();
        toast.error(errorData || 'Failed to save menu');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error('Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  const deleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu?')) return;

    try {
      const response = await fetch(`/api/stores/${subdomain}/menus/${menuId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Menu deleted');
        loadMenus();
        if (activeMenu?.id === menuId) {
          setActiveMenu(null);
        }
      } else {
        toast.error('Failed to delete menu');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error('Failed to delete menu');
    }
  };

  if (loading) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-py-xl">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
          <div className="nuvi-loading-spinner"></div>
          <span className="nuvi-text-secondary">Loading menus...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-6">
        <div>
          <h1 className="nuvi-text-2xl nuvi-font-bold">Navigation</h1>
          <p className="nuvi-text-secondary">Manage your store's navigation menus with nested support</p>
        </div>
        <button
          onClick={startCreating}
          className="nuvi-btn nuvi-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Create Menu
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Menu List Sidebar */}
        <div className="col-span-1">
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Your Menus</h3>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mt-1">{menus.length} total</p>
            </div>
            <div className="nuvi-card-content nuvi-p-0">
              <div>
                {menus.map((menu, index) => (
                  <div
                    key={menu.id}
                    className={cn(
                      "px-8 py-5 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group",
                      activeMenu?.id === menu.id ? "bg-blue-50 dark:bg-blue-900/20" : "",
                      index !== 0 && "border-t border-gray-200 dark:border-gray-700"
                    )}
                    onClick={() => setActiveMenu(menu)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{menu.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {menu.items?.length || 0} items
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(menu);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Edit menu"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMenu(menu.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete menu"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {menus.length === 0 && (
                  <div className="nuvi-p-8 nuvi-text-center">
                    <Menu className="h-10 w-10 nuvi-mx-auto nuvi-mb-3 nuvi-text-muted" />
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-4">No menus yet</p>
                    <button
                      onClick={startCreating}
                      className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Create menu
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Editor - Main Content */}
        <div className="col-span-2">
          {(isCreating || isEditing) && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                  <h3 className="nuvi-card-title">
                    {isEditing ? 'Edit Menu' : 'Create Menu'}
                  </h3>
                  <button
                    onClick={cancelForm}
                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="nuvi-card-content">
                {/* Menu Info */}
                <div className="nuvi-mb-lg">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Menu Name</label>
                    <input
                      type="text"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                      className="nuvi-input"
                      placeholder="e.g. Main Menu"
                    />
                  </div>
                </div>

                {/* Menu Items with Nested Support */}
                <div className="nuvi-mb-lg">
                  <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-md">
                    <h4 className="nuvi-font-medium">Menu Items</h4>
                    <button
                      onClick={() => addMenuItem()}
                      className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </button>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    {/* Menu Items Container - No Border */}
                    <div className="nuvi-space-y-0.5">
                      <SortableContext
                        items={menuItems.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="nuvi-space-y-0.5">
                          {menuItems.map((item) => (
                            <NestedMenuItemCompact
                              key={`${item.id}-${item.label}`} // Add label to key to force re-render
                              item={item}
                              depth={0}
                              onUpdate={updateMenuItem}
                              onDelete={removeMenuItem}
                              onAddChild={addMenuItem}
                              maxDepth={MAX_MENU_DEPTH}
                              isOver={overId === item.id}
                              isDragging={activeId === item.id}
                              subdomain={subdomain}
                            />
                          ))}
                        </div>
                      </SortableContext>
                      
                      {/* Minimal Instructions */}
                      {menuItems.length > 0 && (
                        <div className="nuvi-text-[9px] nuvi-text-gray-400/60 nuvi-mt-1 nuvi-text-center">
                          drag • edit • {MAX_MENU_DEPTH} levels
                        </div>
                      )}
                    </div>

                    <DragOverlay>
                      {activeId ? (
                        <div className="nuvi-bg-white nuvi-shadow-lg nuvi-rounded-md nuvi-p-sm nuvi-opacity-80">
                          <span className="nuvi-text-sm">{findItem(activeId)?.label}</span>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>

                  {menuItems.length === 0 && (
                    <div className="nuvi-py-8">
                      <div className="nuvi-text-center">
                        <LinkIcon className="h-12 w-12 nuvi-mx-auto nuvi-mb-md nuvi-text-muted" />
                        <p className="nuvi-text-secondary nuvi-mb-sm">No menu items yet</p>
                        <button
                          onClick={() => addMenuItem()}
                          className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                        >
                          Add your first menu item
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="nuvi-flex nuvi-gap-sm nuvi-pt-md nuvi-border-t">
                  <button
                    onClick={saveMenu}
                    disabled={saving}
                    className="nuvi-btn nuvi-btn-primary"
                  >
                    {saving ? (
                      <>
                        <div className="nuvi-loading-spinner nuvi-w-4 nuvi-h-4"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEditing ? 'Save Menu' : 'Create Menu'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={cancelForm}
                    className="nuvi-btn nuvi-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Menu Preview */}
          {!isCreating && !isEditing && activeMenu && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                  <div>
                    <h3 className="nuvi-card-title">{activeMenu.name}</h3>
                    <p className="nuvi-text-secondary">{activeMenu.items?.length || 0} item{(activeMenu.items?.length || 0) !== 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={() => startEditing(activeMenu)}
                    className="nuvi-btn nuvi-btn-primary"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Menu
                  </button>
                </div>
              </div>

              <div className="nuvi-card-content">
                {/* Menu Preview */}
                <div className="nuvi-space-y-4">
                  {/* Preview Header */}
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-pb-3 nuvi-border-b nuvi-border-gray-200 dark:nuvi-border-gray-700">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-2">
                      <div className="nuvi-p-2 nuvi-bg-gray-100 dark:nuvi-bg-gray-800 nuvi-rounded-lg">
                        <Eye className="h-4 w-4 nuvi-text-gray-600 dark:nuvi-text-gray-400" />
                      </div>
                      <div>
                        <h4 className="nuvi-font-medium nuvi-text-sm">Live Preview</h4>
                        <p className="nuvi-text-xs nuvi-text-gray-500">How it looks on your store</p>
                      </div>
                    </div>
                    <span className="nuvi-text-xs nuvi-px-2 nuvi-py-1 nuvi-bg-green-100 nuvi-text-green-700 dark:nuvi-bg-green-900/20 dark:nuvi-text-green-400 nuvi-rounded-full">
                      Active
                    </span>
                  </div>
                  
                  {/* Menu Items Preview */}
                  <div className="nuvi-bg-gradient-to-br nuvi-from-gray-50 nuvi-to-gray-100/50 dark:nuvi-from-gray-900 dark:nuvi-to-gray-800/50 nuvi-rounded-xl nuvi-p-4">
                    {activeMenu.items && activeMenu.items.length > 0 ? (
                      <nav className="nuvi-space-y-1">
                        {activeMenu.items.map((item) => (
                          <MenuPreviewItem key={`preview-${item.id}-${item.label}`} item={item} depth={0} />
                        ))}
                      </nav>
                    ) : (
                      <div className="nuvi-text-center nuvi-py-8">
                        <Menu className="h-8 w-8 nuvi-mx-auto nuvi-mb-2 nuvi-text-gray-400" />
                        <p className="nuvi-text-sm nuvi-text-gray-500">No menu items to preview</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Usage Info */}
                  <div className="nuvi-bg-blue-50 dark:nuvi-bg-blue-900/10 nuvi-rounded-lg nuvi-p-3">
                    <div className="nuvi-flex nuvi-gap-2">
                      <Info className="h-4 w-4 nuvi-text-blue-600 dark:nuvi-text-blue-400 nuvi-mt-0.5 nuvi-flex-shrink-0" />
                      <div className="nuvi-text-xs nuvi-text-blue-700 dark:nuvi-text-blue-300">
                        <p className="nuvi-font-medium nuvi-mb-1">Usage</p>
                        <code className="nuvi-bg-blue-100 dark:nuvi-bg-blue-900/30 nuvi-px-1 nuvi-py-0.5 nuvi-rounded">
                          handle: {activeMenu.handle}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isCreating && !isEditing && !activeMenu && (
            <div className="nuvi-card nuvi-text-center">
              <div className="nuvi-card-content nuvi-py-xl">
                <Menu className="h-16 w-16 nuvi-mx-auto nuvi-mb-md nuvi-text-muted" />
                <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No menu selected</h3>
                <p className="nuvi-text-secondary nuvi-mb-lg">Select a menu from the sidebar or create a new one to get started</p>
                <button
                  onClick={startCreating}
                  className="nuvi-btn nuvi-btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Menu Preview Item Component  
function MenuPreviewItem({ item, depth }: { item: MenuItem; depth: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  
  return (
    <div className="relative">
      <div 
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md",
          "hover:bg-white dark:hover:bg-gray-800 transition-all"
        )}
        style={{ paddingLeft: `${depth * 28 + 8}px` }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            type="button"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-400" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}
        
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0",
          hasChildren && "text-purple-600 dark:text-purple-400"
        )}>
          {hasChildren ? (
            <Folder className="h-4 w-4" />
          ) : (
            <LinkIcon className="h-3.5 w-3.5 text-gray-400" />
          )}
        </div>
        
        {/* Label and Link */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm truncate",
              hasChildren ? "font-medium text-gray-800 dark:text-gray-200" : "text-gray-700 dark:text-gray-300"
            )}>
              {item.label}
            </span>
            {item.target === '_blank' && (
              <ExternalLink className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
            )}
          </div>
          {!hasChildren && (
            <span className="text-[10px] text-gray-400 truncate block">
              {item.link}
            </span>
          )}
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Tree lines for each child */}
          {item.children!.map((child, index) => (
            <div key={`preview-${child.id}-${child.label}`} className="relative">
              {/* Vertical line */}
              {index < item.children!.length - 1 && (
                <div 
                  className="absolute top-0 h-full w-px bg-gray-300 dark:bg-gray-600"
                  style={{ 
                    left: `${(depth + 1) * 28 + 16}px`,
                    top: '12px'
                  }}
                />
              )}
              
              {/* Horizontal line */}
              <div 
                className="absolute h-px bg-gray-300 dark:bg-gray-600"
                style={{ 
                  left: `${(depth + 1) * 28 + 16}px`,
                  width: '12px',
                  top: '12px'
                }}
              />
              
              <MenuPreviewItem item={child} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}