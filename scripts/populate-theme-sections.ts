import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateThemeSections() {
  try {
    // First, get the minimal theme
    const theme = await prisma.theme.findUnique({
      where: { code: 'minimal' }
    });

    if (!theme) {
      console.error('Minimal theme not found!');
      return;
    }

    console.log('Found theme:', theme.name);

    // Define all sections for minimal theme
    const sections = [
      // Layout & Structure
      {
        type: 'hero',
        name: 'Hero Banner',
        description: 'Eye-catching banner with call-to-action',
        category: 'Layout',
        defaultSettings: {
          heading: 'Welcome to our store',
          subheading: 'Discover our amazing products',
          buttonText: 'Shop Now',
          buttonLink: '/collections/all',
          backgroundColor: '#ffffff',
          textColor: '#000000',
        },
      },
      {
        type: 'header',
        name: 'Header',
        description: 'Navigation and branding section',
        category: 'Layout',
        defaultSettings: {
          layout: 'centered',
          showAnnouncement: true,
          announcementText: 'Free shipping on orders over $100',
        },
      },
      {
        type: 'footer',
        name: 'Footer',
        description: 'Bottom section with links and info',
        category: 'Layout',
        defaultSettings: {
          showSocial: true,
          showNewsletter: true,
          copyright: '© 2024 Your Store. All rights reserved.',
        },
      },
      // Products
      {
        type: 'featured-products',
        name: 'Featured Products',
        description: 'Showcase your best products',
        category: 'Products',
        defaultSettings: {
          title: 'Featured Products',
          productCount: 6,
          layout: 'grid',
          showQuickView: true,
        },
      },
      {
        type: 'product-grid',
        name: 'Product Grid',
        description: 'Display products in a customizable grid',
        category: 'Products',
        defaultSettings: {
          title: 'Our Products',
          columns: 3,
          showFilters: true,
          productCount: 12,
        },
      },
      {
        type: 'collections',
        name: 'Collections',
        description: 'Highlight product collections',
        category: 'Products',
        defaultSettings: {
          title: 'Shop by Collection',
          layout: 'carousel',
          showDescription: true,
        },
      },
      // Content
      {
        type: 'image-with-text',
        name: 'Image with Text',
        description: 'Combine images with descriptive text',
        category: 'Content',
        defaultSettings: {
          heading: 'About Us',
          text: 'Tell your story here...',
          imagePosition: 'left',
          buttonText: 'Learn More',
        },
      },
      {
        type: 'rich-text',
        name: 'Rich Text',
        description: 'Add formatted text content',
        category: 'Content',
        defaultSettings: {
          content: '<p>Add your text content here...</p>',
          textAlign: 'left',
          maxWidth: 'container',
        },
      },
      // Marketing
      {
        type: 'newsletter',
        name: 'Newsletter Signup',
        description: 'Collect email subscriptions',
        category: 'Marketing',
        defaultSettings: {
          heading: 'Subscribe to our newsletter',
          subheading: 'Get the latest updates and offers',
          buttonText: 'Subscribe',
          incentive: '10% off your first order',
        },
      },
      // Social Proof
      {
        type: 'testimonials',
        name: 'Testimonials',
        description: 'Display customer reviews',
        category: 'Social Proof',
        defaultSettings: {
          heading: 'What our customers say',
          layout: 'carousel',
          showRatings: true,
          autoplay: true,
        },
      },
      {
        type: 'logo-list',
        name: 'Logo List',
        description: 'Show partner or brand logos',
        category: 'Social Proof',
        defaultSettings: {
          heading: 'Trusted by',
          layout: 'grid',
          grayscale: true,
          animate: true,
        },
      },
      {
        type: 'instagram-feed',
        name: 'Instagram Feed',
        description: 'Display Instagram posts',
        category: 'Social Proof',
        defaultSettings: {
          title: 'Follow us @yourstore',
          postCount: 6,
          showCaptions: false,
          openInNewTab: true,
        },
      },
    ];

    // Delete existing sections for this theme
    await prisma.themeSection.deleteMany({
      where: { themeId: theme.id }
    });

    // Create new sections
    for (const section of sections) {
      await prisma.themeSection.create({
        data: {
          themeId: theme.id,
          type: section.type,
          name: section.name,
          description: section.description,
          schema: {
            category: section.category,
            defaultSettings: section.defaultSettings,
            isRequired: ['header', 'footer'].includes(section.type),
          }
        }
      });
      console.log(`Created section: ${section.name}`);
    }

    console.log('✅ Theme sections populated successfully!');
  } catch (error) {
    console.error('Error populating theme sections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateThemeSections();