// Seed script for minimal theme sections
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMinimalFashionSections() {
  console.log('Seeding minimal theme sections...');
  
  // Find minimal theme
  const theme = await prisma.theme.findFirst({
    where: { code: 'minimal' }
  });
  
  if (!theme) {
    console.error('Minimal theme not found!');
    return;
  }
  
  const sections = [
    {
      type: 'hero',
      name: 'Hero Banner',
      description: 'Full-width hero section with background image and call-to-action',
      schema: {
        category: 'layout',
        defaultSettings: {
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d76e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
          title: 'Welcome to Our Store',
          subtitle: '',
          buttonText: 'Shop Now',
          buttonLink: '/collections',
          height: 'large',
          contentAlignment: 'center',
          overlayOpacity: 30
        }
      },
      limit: 1
    },
    {
      type: 'header',
      name: 'Header',
      description: 'Site header with logo, navigation, and cart',
      schema: {
        category: 'layout',
        isRequired: true,
        defaultSettings: {
          logoType: 'text',
          logoText: '',
          logoImage: '',
          showSearch: true,
          showAccount: true,
          showCart: true,
          cartStyle: 'icon-count'
        }
      },
      limit: 1
    },
    {
      type: 'footer',
      name: 'Footer',
      description: 'Site footer with links and information',
      schema: {
        category: 'layout',
        isRequired: true,
        defaultSettings: {}
      },
      limit: 1
    },
    {
      type: 'featured-products',
      name: 'Featured Products',
      description: 'Display featured products in a grid',
      schema: {
        category: 'products',
        defaultSettings: {
          title: 'Featured Products',
          maxProducts: 6,
          productsPerRow: {
            mobile: 2,
            tablet: 3,
            desktop: 4
          },
          showPrice: true,
          showAddToCart: true
        }
      }
    },
    {
      type: 'product-grid',
      name: 'Product Grid',
      description: 'Display products in a customizable grid layout',
      schema: {
        category: 'products',
        defaultSettings: {
          title: 'Our Products',
          maxProducts: 8,
          productsPerRow: {
            mobile: 2,
            tablet: 3,
            desktop: 4
          },
          showPrice: true,
          showAddToCart: true
        }
      }
    },
    {
      type: 'collections',
      name: 'Collections',
      description: 'Display product collections',
      schema: {
        category: 'products',
        defaultSettings: {
          title: 'Shop by Collection',
          layout: 'grid',
          columns: {
            mobile: 2,
            tablet: 3,
            desktop: 4
          }
        }
      }
    },
    {
      type: 'image-with-text',
      name: 'Image with Text',
      description: 'Two-column layout with image and text content',
      schema: {
        category: 'content',
        defaultSettings: {
          title: '',
          text: '',
          buttonText: '',
          buttonLink: '',
          imagePosition: 'left',
          imageSize: 'medium'
        }
      }
    },
    {
      type: 'newsletter',
      name: 'Newsletter',
      description: 'Email signup form',
      schema: {
        category: 'marketing',
        defaultSettings: {
          title: 'Subscribe to our newsletter',
          subtitle: 'Get the latest updates on new products and upcoming sales',
          buttonText: 'Subscribe',
          successMessage: 'Thank you for subscribing!',
          layout: 'centered'
        }
      }
    },
    {
      type: 'testimonials',
      name: 'Testimonials',
      description: 'Customer reviews and testimonials',
      schema: {
        category: 'social',
        defaultSettings: {
          title: 'What Our Customers Say',
          layout: 'grid',
          columns: {
            mobile: 1,
            tablet: 2,
            desktop: 3
          }
        }
      }
    },
    {
      type: 'instagram-feed',
      name: 'Instagram Feed',
      description: 'Display Instagram posts',
      schema: {
        category: 'social',
        defaultSettings: {
          title: 'Follow us on Instagram',
          subtitle: '',
          username: '@yourstore',
          buttonText: 'Follow Us',
          buttonLink: 'https://instagram.com',
          imageCount: 6,
          columns: {
            mobile: 2,
            tablet: 3,
            desktop: 6
          }
        }
      }
    },
    {
      type: 'rich-text',
      name: 'Rich Text',
      description: 'Add custom formatted text content',
      schema: {
        category: 'content',
        defaultSettings: {
          content: '<p>Add your text here</p>',
          maxWidth: 'medium',
          textAlign: 'left'
        }
      }
    },
    {
      type: 'logo-list',
      name: 'Logo List',
      description: 'Display partner or brand logos',
      schema: {
        category: 'social',
        defaultSettings: {
          title: 'As Featured In'
        }
      }
    },
    {
      type: 'faq',
      name: 'FAQ',
      description: 'Frequently asked questions with expandable answers',
      schema: {
        category: 'content',
        defaultSettings: {
          title: 'Frequently Asked Questions',
          subtitle: '',
          layout: 'centered',
          showContactCTA: true
        }
      }
    },
    {
      type: 'contact-form',
      name: 'Contact Form',
      description: 'Contact form with business information',
      schema: {
        category: 'content',
        defaultSettings: {
          title: 'Get in Touch',
          subtitle: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
          layout: 'split',
          showContactInfo: true,
          successMessage: 'Thank you for your message. We\'ll get back to you soon!'
        }
      }
    },
    // Product page sections
    {
      type: 'product-gallery',
      name: 'Product Gallery',
      description: 'Product image gallery',
      schema: {
        category: 'products',
        defaultSettings: {}
      }
    },
    {
      type: 'product-info',
      name: 'Product Information',
      description: 'Product details and add to cart',
      schema: {
        category: 'products',
        defaultSettings: {}
      }
    },
    {
      type: 'product-description',
      name: 'Product Description',
      description: 'Detailed product description',
      schema: {
        category: 'products',
        defaultSettings: {}
      }
    },
    {
      type: 'product-reviews',
      name: 'Product Reviews',
      description: 'Customer reviews for products',
      schema: {
        category: 'products',
        defaultSettings: {}
      }
    },
    {
      type: 'related-products',
      name: 'Related Products',
      description: 'Display related or recommended products',
      schema: {
        category: 'products',
        defaultSettings: {
          title: 'You May Also Like',
          maxProducts: 4
        }
      }
    },
    {
      type: 'recently-viewed',
      name: 'Recently Viewed',
      description: 'Show recently viewed products',
      schema: {
        category: 'products',
        defaultSettings: {
          title: 'Recently Viewed',
          maxProducts: 4
        }
      }
    }
  ];
  
  // Create or update sections
  for (const section of sections) {
    await prisma.themeSection.upsert({
      where: {
        themeId_type: {
          themeId: theme.id,
          type: section.type
        }
      },
      update: {
        name: section.name,
        description: section.description,
        schema: section.schema,
        limit: section.limit
      },
      create: {
        themeId: theme.id,
        type: section.type,
        name: section.name,
        description: section.description,
        schema: section.schema,
        limit: section.limit
      }
    });
    
    console.log(`✓ ${section.type} section`);
  }
  
  console.log('Minimal sections seeded successfully!');
}

// Run the seed
seedMinimalFashionSections()
  .catch((error) => {
    console.error('Error seeding sections:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });