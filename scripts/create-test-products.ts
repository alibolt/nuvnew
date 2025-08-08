import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Product categories with realistic product names
const productCategories = [
  {
    category: 'Electronics',
    products: [
      { name: 'Wireless Bluetooth Headphones', basePrice: 79.99 },
      { name: 'Smart Watch Pro', basePrice: 299.99 },
      { name: 'USB-C Hub Adapter', basePrice: 49.99 },
      { name: 'Portable Power Bank 20000mAh', basePrice: 39.99 },
      { name: 'Wireless Gaming Mouse', basePrice: 69.99 }
    ]
  },
  {
    category: 'Clothing',
    products: [
      { name: 'Classic Cotton T-Shirt', basePrice: 24.99 },
      { name: 'Slim Fit Jeans', basePrice: 89.99 },
      { name: 'Hooded Sweatshirt', basePrice: 54.99 },
      { name: 'Running Shoes', basePrice: 129.99 },
      { name: 'Leather Jacket', basePrice: 249.99 }
    ]
  },
  {
    category: 'Home & Kitchen',
    products: [
      { name: 'Stainless Steel Water Bottle', basePrice: 29.99 },
      { name: 'Non-Stick Cookware Set', basePrice: 149.99 },
      { name: 'Coffee Maker Machine', basePrice: 89.99 },
      { name: 'LED Desk Lamp', basePrice: 34.99 },
      { name: 'Vacuum Cleaner Robot', basePrice: 399.99 }
    ]
  },
  {
    category: 'Beauty & Personal Care',
    products: [
      { name: 'Facial Cleansing Brush', basePrice: 49.99 },
      { name: 'Hair Dryer Professional', basePrice: 79.99 },
      { name: 'Skincare Gift Set', basePrice: 59.99 },
      { name: 'Electric Toothbrush', basePrice: 99.99 },
      { name: 'Perfume Collection', basePrice: 89.99 }
    ]
  },
  {
    category: 'Sports & Outdoors',
    products: [
      { name: 'Yoga Mat Premium', basePrice: 39.99 },
      { name: 'Camping Tent 4-Person', basePrice: 199.99 },
      { name: 'Mountain Bike Helmet', basePrice: 69.99 },
      { name: 'Fitness Resistance Bands Set', basePrice: 29.99 },
      { name: 'Hiking Backpack 50L', basePrice: 119.99 }
    ]
  }
];

// Variant options
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colorOptions = ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Brown'];
const storageOptions = ['32GB', '64GB', '128GB', '256GB', '512GB'];
const materialOptions = ['Cotton', 'Polyester', 'Leather', 'Wool', 'Synthetic'];

async function createTestProducts() {
  try {
    console.log('🚀 Starting test product creation...');

    // Get the first store
    const store = await prisma.store.findFirst();

    if (!store) {
      console.error('❌ No store found. Please create a store first.');
      return;
    }

    console.log(`📦 Found store: ${store.name}`);
    
    let totalProductsCreated = 0;
    let totalVariantsCreated = 0;

    for (const category of productCategories) {
      console.log(`\n📂 Creating products in ${category.category} category...`);

      for (const productData of category.products) {
        // Generate product description
        const description = faker.commerce.productDescription();
        
        // Create product
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            description,
            productType: 'physical',
            tags: faker.helpers.arrayElements([
              'featured',
              'bestseller',
              'new-arrival',
              'sale',
              'limited-edition',
              'eco-friendly',
              'premium'
            ], faker.number.int({ min: 1, max: 3 })),
            isActive: faker.helpers.arrayElement([true, true, true, false]), // 75% active
            images: [
              `https://via.placeholder.com/800x800/4F46E5/ffffff?text=${encodeURIComponent(productData.name)}`,
              `https://via.placeholder.com/800x800/7C3AED/ffffff?text=${encodeURIComponent(productData.name + ' 2')}`,
              `https://via.placeholder.com/800x800/EC4899/ffffff?text=${encodeURIComponent(productData.name + ' 3')}`
            ],
            storeId: store.id,
            metaTitle: productData.name,
            metaDescription: description.substring(0, 160),
            slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            requiresShipping: true,
            weight: faker.number.float({ min: 0.1, max: 5, precision: 0.1 }),
            weightUnit: 'lb',
            trackQuantity: true,
            continueSellingWhenOutOfStock: faker.datatype.boolean(0.2)
          }
        });

        // Determine variant options based on product type
        let variantOptions: { name: string; values: string[] }[] = [];
        
        if (category.category === 'Clothing' || productData.name.includes('Shirt') || productData.name.includes('Jacket')) {
          variantOptions = [
            { name: 'Size', values: faker.helpers.arrayElements(sizeOptions, 4) },
            { name: 'Color', values: faker.helpers.arrayElements(colorOptions, 3) }
          ];
        } else if (category.category === 'Electronics') {
          if (productData.name.includes('Watch') || productData.name.includes('Phone')) {
            variantOptions = [
              { name: 'Color', values: faker.helpers.arrayElements(colorOptions, 3) }
            ];
          }
          if (productData.name.includes('Power Bank') || productData.name.includes('Storage')) {
            variantOptions.push({ name: 'Capacity', values: ['10000mAh', '20000mAh', '30000mAh'] });
          }
        } else if (category.category === 'Home & Kitchen') {
          variantOptions = [
            { name: 'Color', values: faker.helpers.arrayElements(colorOptions, 2) }
          ];
        } else if (category.category === 'Beauty & Personal Care') {
          variantOptions = [
            { name: 'Size', values: ['Small', 'Medium', 'Large'] }
          ];
        } else if (category.category === 'Sports & Outdoors') {
          if (productData.name.includes('Tent') || productData.name.includes('Backpack')) {
            variantOptions = [
              { name: 'Color', values: faker.helpers.arrayElements(colorOptions, 2) },
              { name: 'Size', values: ['Small', 'Medium', 'Large'] }
            ];
          } else {
            variantOptions = [
              { name: 'Color', values: faker.helpers.arrayElements(colorOptions, 3) }
            ];
          }
        }

        // If no specific variants, create a single default variant
        if (variantOptions.length === 0) {
          const variant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: 'Default',
              price: productData.basePrice,
              compareAtPrice: faker.datatype.boolean(0.3) ? productData.basePrice * 1.2 : null,
              stock: faker.number.int({ min: 0, max: 500 }),
              sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
              weight: faker.number.float({ min: 0.1, max: 5, precision: 0.1 }),
              weightUnit: 'lb',
              trackQuantity: true,
              options: {}
            }
          });
          totalVariantsCreated++;
        } else {
          // Create variants based on combinations
          const combinations = generateCombinations(variantOptions);
          
          for (const combo of combinations) {
            const variantName = combo.join(' / ');
            const priceMultiplier = faker.number.float({ min: 0.9, max: 1.1, precision: 0.01 });
            
            const variant = await prisma.productVariant.create({
              data: {
                productId: product.id,
                name: variantName,
                price: productData.basePrice * priceMultiplier,
                compareAtPrice: faker.datatype.boolean(0.3) ? productData.basePrice * priceMultiplier * 1.2 : null,
                stock: faker.number.int({ min: 0, max: 200 }),
                sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
                weight: faker.number.float({ min: 0.1, max: 5, precision: 0.1 }),
                weightUnit: 'lb',
                trackQuantity: true,
                options: combo.reduce((acc, value, index) => ({
                  ...acc,
                  [variantOptions[index].name]: value
                }), {})
              }
            });
            totalVariantsCreated++;
          }
        }

        totalProductsCreated++;
        console.log(`✅ Created product: ${productData.name}`);
      }
    }

    console.log(`\n🎉 Successfully created ${totalProductsCreated} products with ${totalVariantsCreated} variants!`);

  } catch (error) {
    console.error('❌ Error creating test products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate variant combinations
function generateCombinations(options: { name: string; values: string[] }[]): string[][] {
  if (options.length === 0) return [[]];
  
  const [first, ...rest] = options;
  const subCombinations = generateCombinations(rest);
  
  return first.values.flatMap(value =>
    subCombinations.map(combo => [value, ...combo])
  );
}

// Run the script
createTestProducts();