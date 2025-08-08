'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Menu, Edit, Trash2, ExternalLink, Save, X, 
  ChevronRight, Link as LinkIcon, Home, ShoppingBag, 
  FileText, MoreVertical, Eye, GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableMenuItem } from './sortable-menu-item';

interface MenuItem {
  id: string;
  label: string;
  link: string;
  position: number;
  target: '_self' | '_blank';
}

interface Menu {
  id: string;
  name: string;
  handle: string;
  items: MenuItem[];
}

interface SimpleMenuManagerProps {
  subdomain: string;
}

export function SimpleMenuManager({ subdomain }: { subdomain: string }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [menuName, setMenuName] = useState('');
  const [menuHandle, setMenuHandle] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Auto-generate handle from name
  const handleNameChange = (name: string) => {
    setMenuName(name);
    if (!isEditing) {
      const handle = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setMenuHandle(handle);
    }
  };

  // Load menus
  useEffect(() => {
    loadMenus();
  }, [subdomain]);

  const loadMenus = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/menus`);
      if (response.ok) {
        const data = await response.json();
        setMenus(data);
        
        // Set default main menu if no active menu
        if (!activeMenu && data.length > 0) {
          const mainMenu = data.find((m: Menu) => m.handle === 'main-menu') || data[0];
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
    setMenuHandle('');
    setMenuItems([]);
  };

  const startEditing = (menu: Menu) => {
    setIsEditing(true);
    setIsCreating(false);
    setActiveMenu(menu);
    setMenuName(menu.name);
    setMenuHandle(menu.handle);
    setMenuItems(menu.items || []);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setMenuName('');
    setMenuHandle('');
    setMenuItems([]);
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: `temp-${Date.now()}`,
      label: 'New Item',
      link: '/',
      position: menuItems.length,
      target: '_self'
    };
    setMenuItems([...menuItems, newItem]);
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    setMenuItems(updated);
  };

  const removeMenuItem = (index: number) => {
    const updated = menuItems.filter((_, i) => i !== index);
    setMenuItems(updated.map((item, i) => ({ ...item, position: i })));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = menuItems.findIndex((item) => item.id === active.id);
    const newIndex = menuItems.findIndex((item) => item.id === over.id);
    
    const reorderedItems = arrayMove(menuItems, oldIndex, newIndex);
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      position: index
    }));
    setMenuItems(updatedItems);
  };

  const saveMenu = async () => {
    if (!menuName.trim()) {
      toast.error('Menu name is required');
      return;
    }
    
    if (!menuHandle.trim()) {
      toast.error('Menu handle is required');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(menuHandle)) {
      toast.error('Handle can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setSaving(true);
    try {
      const menuData = {
        name: menuName,
        handle: menuHandle,
        items: menuItems.map((item, index) => ({
          label: item.label,
          link: item.link,
          target: item.target,
          position: index
        }))
      };

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
        loadMenus();
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
    <div className="nuvi-space-y-lg">
      {/* Header */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
        <div>
          <h1 className="nuvi-text-2xl nuvi-font-bold">Navigation</h1>
          <p className="nuvi-text-secondary">Manage your store's navigation menus</p>
        </div>
        <button
          onClick={startCreating}
          className="nuvi-btn nuvi-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Create Menu
        </button>
      </div>

      <div className="nuvi-grid nuvi-grid-cols-1 lg:nuvi-grid-cols-3 nuvi-gap-lg">
        {/* Menu List Sidebar */}
        <div className="lg:nuvi-col-span-1">
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Your Menus</h3>
              <p className="nuvi-text-sm nuvi-text-secondary">{menus.length} menu{menus.length !== 1 ? 's' : ''} total</p>
            </div>
            <div className="nuvi-card-content nuvi-p-0">
              <div className="nuvi-divide-y">
                {menus.map((menu) => (
                  <div
                    key={menu.id}
                    className={`nuvi-p-md nuvi-cursor-pointer nuvi-transition-colors hover:nuvi-bg-muted/50 ${
                      activeMenu?.id === menu.id ? 'nuvi-bg-primary/5 nuvi-border-r-4 nuvi-border-primary' : ''
                    }`}
                    onClick={() => setActiveMenu(menu)}
                  >
                    <div className="nuvi-flex nuvi-justify-between nuvi-items-start">
                      <div className="nuvi-flex-1">
                        <h4 className="nuvi-font-medium nuvi-text-sm">{menu.name}</h4>
                        <p className="nuvi-text-xs nuvi-text-secondary nuvi-mt-xs">
                          {menu.items?.length || 0} item{(menu.items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="nuvi-flex nuvi-gap-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(menu);
                          }}
                          className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                          title="Edit menu"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMenu(menu.id);
                          }}
                          className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs nuvi-text-destructive hover:nuvi-text-destructive"
                          title="Delete menu"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {menus.length === 0 && (
                  <div className="nuvi-p-lg nuvi-text-center">
                    <Menu className="h-12 w-12 nuvi-mx-auto nuvi-mb-md nuvi-text-muted" />
                    <p className="nuvi-text-secondary nuvi-mb-sm">No menus created yet</p>
                    <button
                      onClick={startCreating}
                      className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Create your first menu
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Editor */}
        <div className="lg:nuvi-col-span-2">
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
                <div className="nuvi-space-y-md nuvi-mb-lg">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Menu Name</label>
                    <input
                      type="text"
                      value={menuName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="nuvi-input"
                      placeholder="e.g. Main Menu"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Handle</label>
                    <input
                      type="text"
                      value={menuHandle}
                      onChange={(e) => setMenuHandle(e.target.value)}
                      className="nuvi-input"
                      placeholder="main-menu"
                    />
                    <p className="nuvi-text-xs nuvi-text-secondary nuvi-mt-xs">
                      Used for theme integration. Use lowercase letters, numbers, and hyphens only.
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="nuvi-mb-lg">
                  <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-md">
                    <h4 className="nuvi-font-medium">Menu Items</h4>
                    <button
                      onClick={addMenuItem}
                      className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </button>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={menuItems.map(item => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="nuvi-space-y-sm">
                        {menuItems.map((item, index) => (
                          <SortableMenuItem
                            key={item.id}
                            item={item}
                            index={index}
                            updateMenuItem={updateMenuItem}
                            removeMenuItem={removeMenuItem}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {menuItems.length === 0 && (
                    <div className="nuvi-text-center nuvi-py-xl">
                      <LinkIcon className="h-12 w-12 nuvi-mx-auto nuvi-mb-md nuvi-text-muted" />
                      <p className="nuvi-text-secondary nuvi-mb-sm">No menu items yet</p>
                      <button
                        onClick={addMenuItem}
                        className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                      >
                        Add your first menu item
                      </button>
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
                <div className="nuvi-border nuvi-rounded-lg nuvi-p-md nuvi-bg-muted/30">
                  <h4 className="nuvi-font-medium nuvi-mb-sm nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <Eye className="h-4 w-4" />
                    Preview
                  </h4>
                  <nav className="nuvi-flex nuvi-flex-wrap nuvi-gap-md">
                    {activeMenu.items?.map((item) => (
                      <a
                        key={item.id}
                        href={item.link}
                        target={item.target}
                        className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-text-foreground hover:nuvi-text-primary nuvi-transition-colors nuvi-text-sm"
                      >
                        {item.label}
                        {item.target === '_blank' && <ExternalLink className="h-3 w-3" />}
                      </a>
                    )) || <p className="nuvi-text-secondary">No menu items</p>}
                  </nav>
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
    </div>
  );
}