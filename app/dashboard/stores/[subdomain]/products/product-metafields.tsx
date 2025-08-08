'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Plus, Trash2, Save, Calendar, Hash, Type, Tag, Code } from 'lucide-react';
import { toast } from 'sonner';

interface MetafieldDefinition {
  id: string;
  name: string;
  namespace: string;
  key: string;
  type: string;
  description?: string;
}

interface Metafield {
  id?: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
  definitionId?: string;
  definition?: MetafieldDefinition;
}

interface ProductMetafieldsProps {
  subdomain: string;
  productId?: string;
  metafields?: Metafield[];
  metafieldDefinitions?: MetafieldDefinition[];
  onMetafieldsChange?: (metafields: Metafield[]) => void;
}

export function ProductMetafields({ 
  subdomain, 
  productId, 
  metafields: initialMetafields = [], 
  metafieldDefinitions = [],
  onMetafieldsChange 
}: ProductMetafieldsProps) {
  const [metafields, setMetafields] = useState<Metafield[]>(initialMetafields);
  const [showCustomField, setShowCustomField] = useState(false);
  const [customField, setCustomField] = useState<Partial<Metafield>>({
    namespace: '',
    key: '',
    value: '',
    type: 'single_line_text_field'
  });

  // Initialize metafields from definitions
  useEffect(() => {
    if (metafieldDefinitions.length > 0 && metafields.length === 0) {
      // Create empty metafields for each definition
      const newMetafields = metafieldDefinitions.map(def => {
        const existing = metafields.find(m => 
          m.namespace === def.namespace && m.key === def.key
        );
        
        if (existing) return existing;
        
        return {
          namespace: def.namespace,
          key: def.key,
          value: '',
          type: def.type === 'text' ? 'single_line_text_field' : 
                def.type === 'number' ? 'number_integer' :
                def.type === 'date' ? 'date' :
                def.type === 'boolean' ? 'boolean' :
                def.type === 'json' ? 'json' : 'single_line_text_field',
          definitionId: def.id,
          definition: def
        };
      });
      setMetafields(newMetafields);
    }
  }, [metafieldDefinitions]);

  const handleMetafieldChange = (index: number, value: string) => {
    const updated = [...metafields];
    updated[index] = { ...updated[index], value };
    setMetafields(updated);
    onMetafieldsChange?.(updated);
  };

  const handleAddCustomField = () => {
    if (!customField.namespace || !customField.key) {
      toast.error('Namespace and key are required');
      return;
    }

    const newField: Metafield = {
      namespace: customField.namespace!,
      key: customField.key!,
      value: customField.value || '',
      type: customField.type || 'single_line_text_field'
    };

    setMetafields([...metafields, newField]);
    onMetafieldsChange?.([...metafields, newField]);
    setCustomField({
      namespace: '',
      key: '',
      value: '',
      type: 'single_line_text_field'
    });
    setShowCustomField(false);
    toast.success('Custom field added');
  };

  const handleRemoveMetafield = (index: number) => {
    const updated = metafields.filter((_, i) => i !== index);
    setMetafields(updated);
    onMetafieldsChange?.(updated);
  };

  const saveMetafield = async (metafield: Metafield, index: number) => {
    if (!productId || !metafield.value) return;

    try {
      const response = await fetch(`/api/stores/${subdomain}/metafields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metafield,
          ownerType: 'Product',
          ownerId: productId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const updated = [...metafields];
        updated[index] = { ...updated[index], id: data.metafield.id };
        setMetafields(updated);
        toast.success('Metafield saved');
      } else {
        toast.error('Failed to save metafield');
      }
    } catch (error) {
      console.error('Error saving metafield:', error);
      toast.error('Error saving metafield');
    }
  };

  const renderFieldInput = (metafield: Metafield, index: number) => {
    const type = metafield.definition?.type || metafield.type;

    switch (type) {
      case 'boolean':
        return (
          <Switch
            checked={metafield.value === 'true'}
            onCheckedChange={(checked) => handleMetafieldChange(index, checked.toString())}
          />
        );
      
      case 'number':
      case 'number_integer':
      case 'number_decimal':
        return (
          <Input
            type="number"
            value={metafield.value}
            onChange={(e) => handleMetafieldChange(index, e.target.value)}
            placeholder="Enter number"
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={metafield.value}
            onChange={(e) => handleMetafieldChange(index, e.target.value)}
          />
        );
      
      case 'json':
        return (
          <Textarea
            value={metafield.value}
            onChange={(e) => handleMetafieldChange(index, e.target.value)}
            placeholder='{"key": "value"}'
            className="font-mono text-sm"
            rows={3}
          />
        );
      
      case 'multi_line_text_field':
      case 'text':
        return (
          <Textarea
            value={metafield.value}
            onChange={(e) => handleMetafieldChange(index, e.target.value)}
            placeholder="Enter text"
            rows={3}
          />
        );
      
      default:
        return (
          <Input
            value={metafield.value}
            onChange={(e) => handleMetafieldChange(index, e.target.value)}
            placeholder="Enter value"
          />
        );
    }
  };

  const typeIcons: Record<string, JSX.Element> = {
    text: <Type className="h-4 w-4" />,
    single_line_text_field: <Type className="h-4 w-4" />,
    multi_line_text_field: <Type className="h-4 w-4" />,
    number: <Hash className="h-4 w-4" />,
    number_integer: <Hash className="h-4 w-4" />,
    number_decimal: <Hash className="h-4 w-4" />,
    date: <Calendar className="h-4 w-4" />,
    boolean: <Tag className="h-4 w-4" />,
    json: <Code className="h-4 w-4" />
  };

  return (
    <div className="space-y-4">
      {/* Defined Fields */}
      {metafields.filter(m => m.definition).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metafields.filter(m => m.definition).map((metafield, index) => (
              <div key={`${metafield.namespace}.${metafield.key}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {typeIcons[metafield.definition?.type || metafield.type]}
                    {metafield.definition?.name || `${metafield.namespace}.${metafield.key}`}
                  </Label>
                  {productId && metafield.value && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveMetafield(metafield, index)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {metafield.definition?.description && (
                  <p className="text-sm text-gray-500">{metafield.definition.description}</p>
                )}
                {renderFieldInput(metafield, index)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Custom Fields */}
      {metafields.filter(m => !m.definition).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metafields.filter(m => !m.definition).map((metafield, index) => (
              <div key={`${metafield.namespace}.${metafield.key}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {typeIcons[metafield.type]}
                    {metafield.namespace}.{metafield.key}
                  </Label>
                  <div className="flex gap-2">
                    {productId && metafield.value && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveMetafield(metafield, metafields.indexOf(metafield))}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMetafield(metafields.indexOf(metafield))}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {renderFieldInput(metafield, metafields.indexOf(metafield))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Custom Field */}
      {!showCustomField ? (
        <Button
          variant="outline"
          onClick={() => setShowCustomField(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Field
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Custom Field</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Namespace</Label>
                <Input
                  value={customField.namespace}
                  onChange={(e) => setCustomField({ ...customField, namespace: e.target.value })}
                  placeholder="e.g., custom"
                />
              </div>
              <div className="space-y-2">
                <Label>Key</Label>
                <Input
                  value={customField.key}
                  onChange={(e) => setCustomField({ ...customField, key: e.target.value })}
                  placeholder="e.g., field_name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={customField.type}
                onValueChange={(value) => setCustomField({ ...customField, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_line_text_field">Text</SelectItem>
                  <SelectItem value="multi_line_text_field">Multi-line Text</SelectItem>
                  <SelectItem value="number_integer">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Initial Value</Label>
              <Input
                value={customField.value}
                onChange={(e) => setCustomField({ ...customField, value: e.target.value })}
                placeholder="Enter initial value"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddCustomField}>
                Add Field
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCustomField(false);
                  setCustomField({
                    namespace: '',
                    key: '',
                    value: '',
                    type: 'single_line_text_field'
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {metafields.length === 0 && !showCustomField && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No custom fields defined</p>
            <p className="text-sm mt-1">Add custom fields to store additional product information</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}