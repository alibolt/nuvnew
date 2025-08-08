'use client';

import { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import { CollectionConditionGroup, CollectionCondition, ConditionField, ConditionOperator } from '@/types/collection';

interface ConditionBuilderProps {
  conditions: CollectionConditionGroup[];
  onChange: (conditions: CollectionConditionGroup[]) => void;
}

const FIELD_OPTIONS: { value: ConditionField; label: string; type: 'text' | 'number' }[] = [
  { value: 'product_title', label: 'Product title', type: 'text' },
  { value: 'product_type', label: 'Product type', type: 'text' },
  { value: 'product_vendor', label: 'Product vendor', type: 'text' },
  { value: 'product_tag', label: 'Product tag', type: 'text' },
  { value: 'product_price', label: 'Product price', type: 'number' },
  { value: 'product_compare_at_price', label: 'Compare at price', type: 'number' },
  { value: 'product_weight', label: 'Product weight', type: 'number' },
  { value: 'product_inventory_quantity', label: 'Inventory quantity', type: 'number' },
];

const TEXT_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'is equal to' },
  { value: 'not_equals', label: 'is not equal to' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
];

const NUMBER_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'is equal to' },
  { value: 'not_equals', label: 'is not equal to' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
  { value: 'greater_than_or_equal', label: 'is greater than or equal to' },
  { value: 'less_than_or_equal', label: 'is less than or equal to' },
];

export function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps) {
  const [disjunctive, setDisjunctive] = useState(false);

  const addConditionGroup = () => {
    const newGroup: CollectionConditionGroup = {
      conditions: [{
        field: 'product_title',
        operator: 'contains',
        value: ''
      }],
      conjunction: 'AND'
    };
    onChange([...conditions, newGroup]);
  };

  const updateConditionGroup = (index: number, group: CollectionConditionGroup) => {
    const updated = [...conditions];
    updated[index] = group;
    onChange(updated);
  };

  const removeConditionGroup = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const addCondition = (groupIndex: number) => {
    const group = conditions[groupIndex];
    const newCondition: CollectionCondition = {
      field: 'product_title',
      operator: 'contains',
      value: ''
    };
    updateConditionGroup(groupIndex, {
      ...group,
      conditions: [...group.conditions, newCondition]
    });
  };

  const updateCondition = (groupIndex: number, conditionIndex: number, condition: CollectionCondition) => {
    const group = conditions[groupIndex];
    const updatedConditions = [...group.conditions];
    updatedConditions[conditionIndex] = condition;
    updateConditionGroup(groupIndex, {
      ...group,
      conditions: updatedConditions
    });
  };

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    const group = conditions[groupIndex];
    updateConditionGroup(groupIndex, {
      ...group,
      conditions: group.conditions.filter((_, i) => i !== conditionIndex)
    });
  };

  const getOperatorsForField = (field: ConditionField) => {
    const fieldOption = FIELD_OPTIONS.find(f => f.value === field);
    return fieldOption?.type === 'number' ? NUMBER_OPERATORS : TEXT_OPERATORS;
  };

  if (conditions.length === 0) {
    return (
      <div className="nuvi-text-center nuvi-py-lg">
        <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
          Products must match conditions to be automatically added
        </p>
        <button
          type="button"
          onClick={addConditionGroup}
          className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
        >
          <Plus className="h-4 w-4" />
          Add Condition
        </button>
      </div>
    );
  }

  return (
    <div className="nuvi-space-y-md">
      {/* Conjunction selector */}
      <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-md">
        <label className="nuvi-text-sm">Products must match:</label>
        <select
          className="nuvi-input nuvi-input-sm nuvi-w-auto"
          value={disjunctive ? 'any' : 'all'}
          onChange={(e) => setDisjunctive(e.target.value === 'any')}
        >
          <option value="all">All conditions</option>
          <option value="any">Any condition</option>
        </select>
      </div>

      {/* Condition groups */}
      {conditions.map((group, groupIndex) => (
        <div key={groupIndex} className="nuvi-card nuvi-card-sm">
          <div className="nuvi-card-content nuvi-space-y-sm">
            {group.conditions.map((condition, conditionIndex) => (
              <div key={conditionIndex} className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                {conditionIndex > 0 && (
                  <select
                    className="nuvi-input nuvi-input-sm nuvi-w-24"
                    value={group.conjunction}
                    onChange={(e) => updateConditionGroup(groupIndex, {
                      ...group,
                      conjunction: e.target.value as 'AND' | 'OR'
                    })}
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                )}
                
                <select
                  className="nuvi-input nuvi-input-sm nuvi-flex-1"
                  value={condition.field}
                  onChange={(e) => {
                    const newField = e.target.value as ConditionField;
                    const operators = getOperatorsForField(newField);
                    updateCondition(groupIndex, conditionIndex, {
                      ...condition,
                      field: newField,
                      operator: operators[0].value
                    });
                  }}
                >
                  {FIELD_OPTIONS.map(field => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>

                <select
                  className="nuvi-input nuvi-input-sm nuvi-w-48"
                  value={condition.operator}
                  onChange={(e) => updateCondition(groupIndex, conditionIndex, {
                    ...condition,
                    operator: e.target.value as ConditionOperator
                  })}
                >
                  {getOperatorsForField(condition.field).map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                <input
                  type={FIELD_OPTIONS.find(f => f.value === condition.field)?.type || 'text'}
                  className="nuvi-input nuvi-input-sm nuvi-flex-1"
                  value={condition.value}
                  onChange={(e) => updateCondition(groupIndex, conditionIndex, {
                    ...condition,
                    value: e.target.value
                  })}
                  placeholder="Enter value"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (group.conditions.length > 1) {
                      removeCondition(groupIndex, conditionIndex);
                    } else {
                      removeConditionGroup(groupIndex);
                    }
                  }}
                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addCondition(groupIndex)}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
            >
              <Plus className="h-4 w-4" />
              Add another condition
            </button>
          </div>
        </div>
      ))}

      {/* Add group button */}
      {conditions.length > 0 && disjunctive && (
        <div className="nuvi-text-center">
          <div className="nuvi-text-sm nuvi-text-muted nuvi-mb-sm">OR</div>
          <button
            type="button"
            onClick={addConditionGroup}
            className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
          >
            <Plus className="h-4 w-4" />
            Add another condition
          </button>
        </div>
      )}
    </div>
  );
}