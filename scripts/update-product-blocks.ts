import { prisma } from '@/lib/prisma';

async function updateProductBlocks() {
  console.log('Starting product blocks update...');

  try {
    // Find all product sections that don't have blocks
    const productSections = await prisma.storeSectionInstance.findMany({
      where: {
        sectionType: 'product',
        blocks: {
          none: {}
        }
      },
      include: {
        template: true
      }
    });

    console.log(`Found ${productSections.length} product sections without blocks`);

    // Define the blocks structure
    const productBlocks = [
      {
        type: "breadcrumbs",
        position: 0,
        enabled: true,
        settings: {
          show_home: true,
          separator: "/"
        }
      },
      {
        type: "container",
        position: 1,
        enabled: true,
        settings: {
          containerWidth: "default",
          layout: "two-column",
          columnGap: "large",
          blocks: [
            {
              id: "product-gallery-1",
              type: "product-gallery",
              settings: {
                gallery_layout: "thumbnails",
                enable_zoom: true,
                media_size: "medium",
                media_fit: "contain"
              }
            },
            {
              id: "product-info-container",
              type: "container",
              settings: {
                layout: "stack",
                gap: "medium",
                blocks: [
                  {
                    id: "product-title-1",
                    type: "product-title",
                    settings: {
                      text_size: "2xl"
                    }
                  },
                  {
                    id: "product-price-1",
                    type: "product-price",
                    settings: {
                      show_compare_price: true,
                      show_tax_info: true
                    }
                  },
                  {
                    id: "product-description-1",
                    type: "product-description",
                    settings: {
                      truncate_length: 200,
                      show_read_more: true
                    }
                  },
                  {
                    id: "product-variants-1",
                    type: "product-variants",
                    settings: {
                      show_variant_labels: true,
                      variant_style: "buttons"
                    }
                  },
                  {
                    id: "product-form-1",
                    type: "product-form",
                    settings: {
                      show_quantity_selector: true,
                      show_dynamic_checkout: true,
                      add_to_cart_text: "Add to Cart"
                    }
                  },
                  {
                    id: "product-info-1",
                    type: "product-info",
                    settings: {
                      show_sku: true,
                      show_vendor: false,
                      show_type: true,
                      show_availability: true
                    }
                  },
                  {
                    id: "trust-badges-1",
                    type: "trust-badges",
                    settings: {
                      badges: ["secure-checkout", "free-shipping", "money-back"]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ];

    // Update each section with blocks
    for (const section of productSections) {
      console.log(`Updating section ${section.id} for store ${section.template.storeId}`);
      
      await prisma.sectionBlock.createMany({
        data: productBlocks.map(block => ({
          sectionId: section.id,
          type: block.type,
          position: block.position,
          enabled: block.enabled,
          settings: block.settings
        }))
      });
    }

    console.log('Product blocks update completed successfully');
  } catch (error) {
    console.error('Error updating product blocks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateProductBlocks();