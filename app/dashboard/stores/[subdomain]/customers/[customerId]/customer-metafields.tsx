'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
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

interface CustomerMetafieldsProps {
  subdomain: string;
  customerId: string;
  metafields?: Metafield[];
  metafieldDefinitions?: MetafieldDefinition[];
}

export function CustomerMetafields({ 
  subdomain, 
  customerId, 
  metafields: initialMetafields = [], 
  metafieldDefinitions = []
}: CustomerMetafieldsProps) {
  const [metafields, setMetafields] = useState<Metafield[]>(
    metafieldDefinitions.map(def => {
      const existing = initialMetafields.find(m => 
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
    }).concat(initialMetafields.filter(m => !m.definition))
  );

  const [showAddField, setShowAddField] = useState(false);
  const [customField, setCustomField] = useState<Partial<Metafield>>({
    namespace: 'custom',
    key: '',
    value: '',
    type: 'single_line_text_field'
  });

  const handleMetafieldChange = (index: number, value: string) => {
    const updated = [...metafields];
    updated[index] = { ...updated[index], value };
    setMetafields(updated);
  };

  const handleSaveMetafield = async (metafield: Metafield, index: number) => {
    if (!metafield.value) {
      toast.error('Please enter a value');
      return;
    }

    try {
      const response = await fetch(`/api/stores/${subdomain}/metafields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metafield,
          ownerType: 'Customer',
          ownerId: customerId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const updated = [...metafields];
        updated[index] = { ...updated[index], id: data.metafield.id };
        setMetafields(updated);
        toast.success('Custom field saved');
      } else {
        toast.error('Failed to save custom field');
      }
    } catch (error) {
      console.error('Error saving metafield:', error);
      toast.error('Error saving custom field');
    }
  };

  const handleAddCustomField = () => {
    if (!customField.key) {
      toast.error('Field key is required');
      return;
    }

    const newField: Metafield = {
      namespace: customField.namespace || 'custom',
      key: customField.key!,
      value: customField.value || '',
      type: customField.type || 'single_line_text_field'
    };

    setMetafields([...metafields, newField]);
    setCustomField({
      namespace: 'custom',
      key: '',
      value: '',
      type: 'single_line_text_field'
    });
    setShowAddField(false);
    toast.success('Custom field added');
  };

  const handleRemoveMetafield = (index: number) => {
    setMetafields(metafields.filter((_, i) => i !== index));
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
    number: <Hash className="h-4 w-4" />,
    number_integer: <Hash className="h-4 w-4" />,
    date: <Calendar className="h-4 w-4" />,
    boolean: <Tag className="h-4 w-4" />,
    json: <Code className="h-4 w-4" />
  };

  return (
    <div className="space-y-4">
      {metafields.length > 0 ? (
        <div className="space-y-4">
          {metafields.map((metafield, index) => (
            <Card key={`${metafield.namespace}.${metafield.key}-${index}`} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {typeIcons[metafield.definition?.type || metafield.type]}
                    {metafield.definition?.name || `${metafield.namespace}.${metafield.key}`}
                  </Label>
                  <div className="flex gap-2">
                    {metafield.value && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveMetafield(metafield, index)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                    {!metafield.definition && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMetafield(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                {metafield.definition?.description && (
                  <p className="text-sm text-gray-500">{metafield.definition.description}</p>
                )}
                {renderFieldInput(metafield, index)}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-gray-500">
          <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No custom fields defined</p>
          <p className="text-sm mt-1">Add custom fields to store additional customer information</p>
        </Card>
      )}

      {!showAddField ? (
        <Button
          variant="outline"
          onClick={() => setShowAddField(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Field
        </Button>
      ) : (
        <Card className="p-4">
          <div className="space-y-4">
            <h4 className="font-medium">Add Custom Field</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Namespace</Label>
                <Input
                  value={customField.namespace}
                  onChange={(e) => setCustomField({ ...customField, namespace: e.target.value })}
                  placeholder="e.g., custom"
                />
              </div>
              <div>
                <Label>Key</Label>
                <Input
                  value={customField.key}
                  onChange={(e) => setCustomField({ ...customField, key: e.target.value })}
                  placeholder="e.g., loyalty_tier"
                />
              </div>
            </div>
            
            <div>
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
                  <SelectItem value="number_integer">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddCustomField}>
                Add Field
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddField(false);
                  setCustomField({
                    namespace: 'custom',
                    key: '',
                    value: '',
                    type: 'single_line_text_field'
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}