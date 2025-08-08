import { Product, ProductVariant } from '@prisma/client';
import { CollectionRules, CollectionCondition, CollectionConditionGroup } from '@/types/collection';

type ProductWithVariants = Product & {
  variants: ProductVariant[];
  tags?: string[];
};

export class CollectionMatcher {
  /**
   * Check if a product matches the collection rules
   */
  static matchesRules(product: ProductWithVariants, rules: CollectionRules): boolean {
    if (!rules || !rules.groups || rules.groups.length === 0) {
      return true; // No rules means all products match
    }

    // If disjunctive is true, ANY group needs to match (OR)
    // If disjunctive is false, ALL groups need to match (AND)
    const groupResults = rules.groups.map(group => this.matchesGroup(product, group));
    
    return rules.disjunctive 
      ? groupResults.some(result => result) // OR
      : groupResults.every(result => result); // AND
  }

  /**
   * Check if a product matches a condition group
   */
  private static matchesGroup(product: ProductWithVariants, group: CollectionConditionGroup): boolean {
    if (!group.conditions || group.conditions.length === 0) {
      return true;
    }

    const conditionResults = group.conditions.map(condition => 
      this.matchesCondition(product, condition)
    );

    // If conjunction is AND, all conditions must match
    // If conjunction is OR, any condition must match
    return group.conjunction === 'AND'
      ? conditionResults.every(result => result)
      : conditionResults.some(result => result);
  }

  /**
   * Check if a product matches a single condition
   */
  private static matchesCondition(product: ProductWithVariants, condition: CollectionCondition): boolean {
    const fieldValue = this.getFieldValue(product, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      
      case 'not_equals':
        return fieldValue !== conditionValue;
      
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(conditionValue).toLowerCase());
      
      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(conditionValue).toLowerCase());
      
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      
      case 'greater_than_or_equal':
        return Number(fieldValue) >= Number(conditionValue);
      
      case 'less_than_or_equal':
        return Number(fieldValue) <= Number(conditionValue);
      
      default:
        return false;
    }
  }

  /**
   * Get the value of a field from a product
   */
  private static getFieldValue(product: ProductWithVariants, field: string): any {
    switch (field) {
      case 'product_title':
        return product.name;
      
      case 'product_type':
        return product.type || '';
      
      case 'product_vendor':
        return product.vendor || '';
      
      case 'product_price':
        // Get the lowest variant price
        return Math.min(...product.variants.map(v => v.price));
      
      case 'product_tag':
        // Check if any tag matches
        return product.tags || [];
      
      case 'product_compare_at_price':
        // Get the lowest compare at price
        const compareAtPrices = product.variants
          .map(v => v.compareAtPrice)
          .filter(p => p !== null);
        return compareAtPrices.length > 0 ? Math.min(...compareAtPrices) : null;
      
      case 'product_weight':
        // Get the lowest variant weight
        const weights = product.variants
          .map(v => v.weight)
          .filter(w => w !== null);
        return weights.length > 0 ? Math.min(...weights) : null;
      
      case 'product_inventory_quantity':
        // Sum all variant quantities
        return product.variants.reduce((sum, v) => sum + (v.inventory || 0), 0);
      
      case 'variant_title':
        // Check if any variant title matches
        return product.variants.map(v => v.title);
      
      case 'variant_compare_at_price':
        // Check if any variant has this compare at price
        return product.variants.map(v => v.compareAtPrice);
      
      case 'variant_weight':
        // Check if any variant has this weight
        return product.variants.map(v => v.weight);
      
      case 'variant_inventory_quantity':
        // Check if any variant has this inventory
        return product.variants.map(v => v.inventory);
      
      default:
        return null;
    }
  }

  /**
   * Sort products according to the collection sort order
   */
  static sortProducts(products: ProductWithVariants[], sortOrder: string): ProductWithVariants[] {
    const sorted = [...products];
    
    switch (sortOrder) {
      case 'title-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
      case 'title-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = Math.min(...a.variants.map(v => v.price));
          const priceB = Math.min(...b.variants.map(v => v.price));
          return priceA - priceB;
        });
      
      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = Math.min(...a.variants.map(v => v.price));
          const priceB = Math.min(...b.variants.map(v => v.price));
          return priceB - priceA;
        });
      
      case 'created-desc':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      case 'created-asc':
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      case 'best-selling':
        // This would require sales data
        // For now, return as is
        return sorted;
      
      case 'manual':
      default:
        // Manual sorting would use a position field
        return sorted;
    }
  }
}