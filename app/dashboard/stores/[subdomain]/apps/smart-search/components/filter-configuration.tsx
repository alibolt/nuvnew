'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Filter, GripVertical, Plus, X, Sliders, DollarSign, 
  Tag, Package, Star, Calendar, Palette, Hash 
} from 'lucide-react';
import { toast } from 'sonner';

interface FilterConfigurationProps {
  subdomain: string;
  settings: any;
  onSave: (settings: any) => void;
}

interface FilterType {
  id: string;
  name: string;
  type: 'range' | 'select' | 'multiselect' | 'boolean';
  icon: any;
  field: string;
  enabled: boolean;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  displayFormat?: string;
}

const defaultFilters: FilterType[] = [
  {
    id: 'price',
    name: 'Price Range',
    type: 'range',
    icon: DollarSign,
    field: 'price',
    enabled: true,
    min: 0,
    max: 1000,
    step: 10,
    displayFormat: 'currency'
  },
  {
    id: 'category',
    name: 'Category',
    type: 'multiselect',
    icon: Package,
    field: 'category',
    enabled: true,
    options: []
  },
  {
    id: 'tags',
    name: 'Tags',
    type: 'multiselect',
    icon: Tag,
    field: 'tags',
    enabled: true,
    options: []
  },
  {
    id: 'rating',
    name: 'Rating',
    type: 'select',
    icon: Star,
    field: 'rating',
    enabled: true,
    options: [
      { label: '4 stars & up', value: '4' },
      { label: '3 stars & up', value: '3' },
      { label: '2 stars & up', value: '2' },
      { label: '1 star & up', value: '1' },
    ]
  },
  {
    id: 'availability',
    name: 'Availability',
    type: 'boolean',
    icon: Package,
    field: 'inStock',
    enabled: true
  },
  {
    id: 'color',
    name: 'Color',
    type: 'multiselect',
    icon: Palette,
    field: 'color',
    enabled: false,
    options: []
  },
  {
    id: 'size',
    name: 'Size',
    type: 'multiselect',
    icon: Hash,
    field: 'size',
    enabled: false,
    options: []
  },
  {
    id: 'brand',
    name: 'Brand',
    type: 'multiselect',
    icon: Tag,
    field: 'brand',
    enabled: false,
    options: []
  }
];

export function FilterConfiguration({ subdomain, settings, onSave }: FilterConfigurationProps) {
  const [filters, setFilters] = useState<FilterType[]>(
    settings?.filters || defaultFilters
  );
  const [filterLayout, setFilterLayout] = useState(settings?.filterLayout || 'sidebar');
  const [filterPosition, setFilterPosition] = useState(settings?.filterPosition || 'left');
  const [showFilterCount, setShowFilterCount] = useState(settings?.showFilterCount ?? true);
  const [collapsibleFilters, setCollapsibleFilters] = useState(settings?.collapsibleFilters ?? true);
  const [stickyFilters, setStickyFilters] = useState(settings?.stickyFilters ?? true);
  const [saving, setSaving] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFilters(items);
  };

  const toggleFilter = (filterId: string) => {
    setFilters(filters.map(filter => 
      filter.id === filterId 
        ? { ...filter, enabled: !filter.enabled }
        : filter
    ));
  };

  const updateFilter = (filterId: string, updates: Partial<FilterType>) => {
    setFilters(filters.map(filter => 
      filter.id === filterId 
        ? { ...filter, ...updates }
        : filter
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const filterSettings = {
        filters,
        filterLayout,
        filterPosition,
        showFilterCount,
        collapsibleFilters,
        stickyFilters
      };
      
      await onSave(filterSettings);
      toast.success('Filter configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save filter configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Filter Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-layout">Filter Layout</Label>
              <Select
                value={filterLayout}
                onValueChange={setFilterLayout}
              >
                <SelectTrigger id="filter-layout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="horizontal">Horizontal Bar</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="modal">Modal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterLayout === 'sidebar' && (
              <div className="space-y-2">
                <Label htmlFor="filter-position">Sidebar Position</Label>
                <Select
                  value={filterPosition}
                  onValueChange={setFilterPosition}
                >
                  <SelectTrigger id="filter-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-count">Show Result Count</Label>
                <p className="text-sm text-muted-foreground">
                  Display number of results for each filter option
                </p>
              </div>
              <Switch
                id="show-count"
                checked={showFilterCount}
                onCheckedChange={setShowFilterCount}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="collapsible">Collapsible Filters</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to expand/collapse filter groups
                </p>
              </div>
              <Switch
                id="collapsible"
                checked={collapsibleFilters}
                onCheckedChange={setCollapsibleFilters}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sticky">Sticky Filters</Label>
                <p className="text-sm text-muted-foreground">
                  Keep filters visible while scrolling
                </p>
              </div>
              <Switch
                id="sticky"
                checked={stickyFilters}
                onCheckedChange={setStickyFilters}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Active Filters
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enable filters and arrange them in the order you want them to appear
          </p>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="filters">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {filters.map((filter, index) => {
                    const Icon = filter.icon;
                    return (
                      <Draggable
                        key={filter.id}
                        draggableId={filter.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-4 border rounded-lg transition-colors ${
                              snapshot.isDragging ? 'bg-muted' : 'bg-background'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab"
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{filter.name}</span>
                                  <Badge variant={filter.enabled ? 'default' : 'outline'}>
                                    {filter.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Field: {filter.field}
                                </p>
                              </div>
                              <Switch
                                checked={filter.enabled}
                                onCheckedChange={() => toggleFilter(filter.id)}
                              />
                            </div>

                            {filter.enabled && filter.type === 'range' && (
                              <div className="mt-3 pl-11 grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Min</Label>
                                  <Input
                                    type="number"
                                    value={filter.min}
                                    onChange={(e) => updateFilter(filter.id, { 
                                      min: Number(e.target.value) 
                                    })}
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Max</Label>
                                  <Input
                                    type="number"
                                    value={filter.max}
                                    onChange={(e) => updateFilter(filter.id, { 
                                      max: Number(e.target.value) 
                                    })}
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Step</Label>
                                  <Input
                                    type="number"
                                    value={filter.step}
                                    onChange={(e) => updateFilter(filter.id, { 
                                      step: Number(e.target.value) 
                                    })}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Filter Configuration'}
        </Button>
      </div>
    </div>
  );
}