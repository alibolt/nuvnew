export type CollectionType = 'manual' | 'automatic';

export type CollectionSortOrder = 
  | 'manual'
  | 'best-selling'
  | 'title-asc'
  | 'title-desc'
  | 'price-asc'
  | 'price-desc'
  | 'created-desc'
  | 'created-asc';

export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal';

export type ConditionField = 
  | 'product_title'
  | 'product_type'
  | 'product_vendor'
  | 'product_price'
  | 'product_tag'
  | 'product_compare_at_price'
  | 'product_weight'
  | 'product_inventory_quantity'
  | 'variant_title'
  | 'variant_compare_at_price'
  | 'variant_weight'
  | 'variant_inventory_quantity';

export interface CollectionCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number;
}

export interface CollectionConditionGroup {
  conditions: CollectionCondition[];
  conjunction: 'AND' | 'OR';
}

export interface CollectionRules {
  groups: CollectionConditionGroup[];
  disjunctive: boolean; // true = any condition (OR), false = all conditions (AND)
}