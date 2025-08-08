# Product Variant System Implementation Guide

## Overview
This guide provides a comprehensive understanding of the Shopify-style product variant system implemented in the Nuvi SaaS platform.

## Database Structure

### Core Models

#### Product Model
```prisma
model Product {
  id                            String           @id @default(cuid())
  name                          String
  description                   String?
  productType                   String           @default("physical") // physical, digital, service
  isActive                      Boolean          @default(true)
  storeId                       String
  categoryId                    String?
  templateId                    String?
  metaTitle                     String?
  metaDescription               String?
  slug                          String?
  tags                          Json             @default("[]")
  images                        Json             @default("[]")
  requiresShipping              Boolean          @default(true)
  weight                        Float?
  weightUnit                    String?
  dimensions                    Json?
  trackQuantity                 Boolean          @default(true)
  continueSellingWhenOutOfStock Boolean          @default(false)
  variants                      ProductVariant[]
  // ... other relations
}
```

#### ProductVariant Model
```prisma
model ProductVariant {
  id                            String         @id @default(cuid())
  name                          String
  sku                           String?        @unique
  barcode                       String?
  price                         Float
  compareAtPrice                Float?
  cost                          Float?
  stock                         Int            @default(0)
  weight                        Float?
  weightUnit                    String?
  trackQuantity                 Boolean        @default(true)
  continueSellingWhenOutOfStock Boolean        @default(false)
  options                       Json           // Stores variant options like {"Size": "Large", "Color": "Blue"}
  productId                     String
  images                        ProductImage[]
  product                       Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  // ... other relations
}
```

#### ProductImage Model
```prisma
model ProductImage {
  id        String         @id @default(cuid())
  url       String
  variantId String
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
}
```

### Key Relationships
- **Product → ProductVariant**: One-to-many relationship (cascading delete)
- **ProductVariant → ProductImage**: One-to-many relationship (cascading delete)
- **Options Storage**: Variant options are stored as JSON in the `options` field

## Current Implementation

### 1. Product Form (Frontend)
Location: `/app/dashboard/stores/[subdomain]/products/new/product-form.tsx`

**Key Features:**
- Dynamic variant option creation (Size, Color, etc.)
- Automatic variant combination generation
- Individual variant pricing, inventory, and SKU management
- Variant-specific image upload
- Real-time variant preview

**Variant Option Management:**
```typescript
interface VariantOption {
  name: string;        // e.g., "Size", "Color"
  values: string[];    // e.g., ["Small", "Medium", "Large"]
}

interface VariantCombination {
  id: string;
  options: Record<string, string>;  // e.g., {"Size": "Large", "Color": "Blue"}
  price: string;
  compareAtPrice: string;
  cost: string;
  stock: string;
  sku: string;
  barcode: string;
  weight: string;
  weightUnit: 'kg' | 'lb' | 'oz' | 'g';
  images: File[];
  imageUrls: string[];
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
}
```

### 2. API Endpoints

#### Create Product with Variants
**POST** `/api/stores/[subdomain]/products`
```typescript
{
  name: string;
  description?: string;
  productType: 'physical' | 'digital' | 'service';
  variants: [{
    name: string;
    price: number;
    compareAtPrice?: number;
    cost?: number;
    stock: number;
    sku?: string;
    barcode?: string;
    options: Record<string, string>;
    images?: string[];
    trackQuantity: boolean;
    continueSellingWhenOutOfStock: boolean;
  }]
}
```

#### Update Product with Variants
**PUT** `/api/stores/[subdomain]/products/[productId]`
- Handles variant creation, update, and deletion
- Preserves existing variant IDs for updates
- Automatically removes variants not included in the update

#### Individual Variant Management
- **GET** `/api/stores/[subdomain]/products/[productId]/variants` - List all variants
- **POST** `/api/stores/[subdomain]/products/[productId]/variants` - Create new variant
- **GET** `/api/stores/[subdomain]/products/[productId]/variants/[variantId]` - Get single variant
- **PUT** `/api/stores/[subdomain]/products/[productId]/variants/[variantId]` - Update variant
- **DELETE** `/api/stores/[subdomain]/products/[productId]/variants/[variantId]` - Delete variant (prevents deletion of last variant)

### 3. Storefront Display
Location: `/app/s/[subdomain]/products/[productSlug]/page.tsx`

**Data Transformation:**
- Variants are fetched with the product
- Options are parsed from JSON
- Images are associated with specific variants
- Inventory tracking respects variant-level settings

## Implementation Best Practices

### 1. Variant Option Structure
```typescript
// Good: Consistent option naming
{ "Size": "Large", "Color": "Blue" }

// Bad: Inconsistent naming
{ "size": "L", "colour": "blue" }
```

### 2. Variant Combination Generation
```typescript
const generateCombinations = (options: VariantOption[]): Record<string, string>[] => {
  if (options.length === 0) return [{}];
  
  const [first, ...rest] = options;
  const restCombinations = generateCombinations(rest);
  
  return first.values.flatMap(value => 
    restCombinations.map(combo => ({
      ...combo,
      [first.name]: value
    }))
  );
};
```

### 3. Inventory Management
- Track inventory at the variant level
- Support "continue selling when out of stock" per variant
- Default variant required (when no options specified)

### 4. Price Management
- Each variant has independent pricing
- Support for compare-at pricing (sale prices)
- Cost tracking for profit calculations

## Common Use Cases

### 1. Simple Product (No Variants)
```typescript
{
  name: "Basic T-Shirt",
  variants: [{
    name: "Default",
    price: 19.99,
    stock: 100,
    options: {}
  }]
}
```

### 2. Size Variants
```typescript
{
  name: "Classic T-Shirt",
  variants: [
    { name: "Small", price: 19.99, stock: 50, options: { "Size": "Small" } },
    { name: "Medium", price: 19.99, stock: 75, options: { "Size": "Medium" } },
    { name: "Large", price: 19.99, stock: 60, options: { "Size": "Large" } }
  ]
}
```

### 3. Multi-Option Variants (Size + Color)
```typescript
{
  name: "Premium T-Shirt",
  variants: [
    { name: "Small / Black", price: 24.99, stock: 30, options: { "Size": "Small", "Color": "Black" } },
    { name: "Small / White", price: 24.99, stock: 25, options: { "Size": "Small", "Color": "White" } },
    { name: "Medium / Black", price: 24.99, stock: 40, options: { "Size": "Medium", "Color": "Black" } },
    { name: "Medium / White", price: 24.99, stock: 35, options: { "Size": "Medium", "Color": "White" } }
  ]
}
```

## API Response Format

### Product with Variants (Storefront)
```json
{
  "id": "product123",
  "title": "Premium T-Shirt",
  "description": "High-quality cotton t-shirt",
  "variants": [
    {
      "id": "variant123",
      "title": "Small / Black",
      "price": 24.99,
      "compareAtPrice": 29.99,
      "inventory": 30,
      "options": {
        "Size": "Small",
        "Color": "Black"
      },
      "images": [
        { "id": "img123", "url": "https://..." }
      ]
    }
  ]
}
```

## Future Enhancements

### 1. Variant Metafields
Add custom fields to variants for additional data storage.

### 2. Variant Import/Export
Bulk variant management through CSV import/export.

### 3. Variant Templates
Pre-defined variant option sets for common product types.

### 4. Advanced Inventory
- Location-based inventory
- Reserved inventory for pending orders
- Low stock alerts per variant

### 5. Variant Analytics
- Best-selling variants
- Variant performance comparison
- Stock movement reports

## Migration Considerations

### From Single Product to Variants
1. Create a default variant with existing product data
2. Maintain backward compatibility with existing orders
3. Update cart/checkout to handle variant selection

### Database Migrations
```sql
-- Ensure all products have at least one variant
INSERT INTO ProductVariant (productId, name, price, stock, options)
SELECT id, 'Default', price, stock, '{}'
FROM Product
WHERE id NOT IN (SELECT DISTINCT productId FROM ProductVariant);
```

## Testing Checklist

- [ ] Create product with single variant
- [ ] Create product with multiple options
- [ ] Update variant prices and inventory
- [ ] Delete variants (except last one)
- [ ] Upload variant-specific images
- [ ] Test inventory tracking toggle
- [ ] Verify option combination generation
- [ ] Test variant display on storefront
- [ ] Validate cart/checkout with variants
- [ ] Check order creation with variant data

## Troubleshooting

### Common Issues

1. **Options not displaying correctly**
   - Ensure options are stored as proper JSON
   - Check option parsing in frontend

2. **Variant combinations missing**
   - Verify option value arrays are populated
   - Check combination generation logic

3. **Images not associating with variants**
   - Confirm variant ID is passed correctly
   - Check ProductImage creation in transaction

4. **Inventory not updating**
   - Verify trackQuantity flag per variant
   - Check stock update logic in order fulfillment