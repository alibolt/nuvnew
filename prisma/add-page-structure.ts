import { prisma } from '../lib/prisma';

async function addPageStructure() {
  // Update schema to add page type to sections
  
  // First, let's create header and footer section types
  const theme = await prisma.theme.findUnique({
    where: { code: 'minimal' }
  });

  if (!theme) {
    console.error('Theme not found');
    return;
  }

  // Check if header section type exists
  const headerExists = await prisma.themeSection.findUnique({
    where: {
      themeId_type: {
        themeId: theme.id,
        type: 'header'
      }
    }
  });

  if (!headerExists) {
    // Create header section type
    await prisma.themeSection.create({
      data: {
        themeId: theme.id,
        type: 'header',
        name: 'Header',
        description: 'Site header with navigation',
        schema: JSON.stringify({
          layout: {
            type: 'select',
            label: 'Header Layout',
            options: ['left', 'centered', 'right'],
            default: 'centered'
          },
          showAnnouncement: {
            type: 'checkbox',
            label: 'Show Announcement Bar',
            default: true
          },
          announcementText: {
            type: 'text',
            label: 'Announcement Text',
            default: 'Free shipping on orders over $100',
            placeholder: 'Enter announcement text'
          },
          announcementLink: {
            type: 'url',
            label: 'Announcement Link (optional)',
            default: '',
            placeholder: '/collections/sale'
          },
          logoPosition: {
            type: 'select',
            label: 'Logo Position',
            options: ['left', 'center'],
            default: 'center'
          },
          menuItems: {
            type: 'navigation',
            label: 'Menu Items',
            default: [
              { label: 'Shop', link: '/collections/all' },
              { label: 'About', link: '/pages/about' },
              { label: 'Contact', link: '/pages/contact' }
            ]
          }
        }),
        limit: 1
      }
    });
  }

  // Check if footer section type exists
  const footerExists = await prisma.themeSection.findUnique({
    where: {
      themeId_type: {
        themeId: theme.id,
        type: 'footer'
      }
    }
  });

  if (!footerExists) {
    // Create footer section type
    await prisma.themeSection.create({
      data: {
        themeId: theme.id,
        type: 'footer',
        name: 'Footer',
        description: 'Site footer with links and information',
        schema: JSON.stringify({
          showNewsletter: {
            type: 'checkbox',
            label: 'Show Newsletter Signup',
            default: true
          },
          newsletterTitle: {
            type: 'text',
            label: 'Newsletter Title',
            default: 'Subscribe to our newsletter'
          },
          copyrightText: {
            type: 'text',
            label: 'Copyright Text',
            default: '© 2024 {store_name}. All rights reserved.'
          },
          column1Title: {
            type: 'text',
            label: 'Column 1 Title',
            default: 'Quick Links'
          },
          column1Links: {
            type: 'navigation',
            label: 'Column 1 Links',
            default: [
              { label: 'Search', link: '/search' },
              { label: 'About Us', link: '/pages/about' },
              { label: 'Contact', link: '/pages/contact' }
            ]
          },
          column2Title: {
            type: 'text',
            label: 'Column 2 Title',
            default: 'Customer Care'
          },
          column2Links: {
            type: 'navigation',
            label: 'Column 2 Links',
            default: [
              { label: 'Shipping Policy', link: '/policies/shipping' },
              { label: 'Refund Policy', link: '/policies/refund' },
              { label: 'Privacy Policy', link: '/policies/privacy' }
            ]
          },
          showSocial: {
            type: 'checkbox',
            label: 'Show Social Links',
            default: true
          }
        }),
        limit: 1
      }
    });
  }

  console.log('Page structure types created successfully');

  // Now add header and footer instances to the store
  const store = await prisma.store.findFirst();
  if (!store) {
    console.error('No store found');
    return;
  }

  // Check if header instance exists
  const headerInstance = await prisma.storeSectionInstance.findFirst({
    where: {
      storeId: store.id,
      sectionType: 'header'
    }
  });

  if (!headerInstance) {
    await prisma.storeSectionInstance.create({
      data: {
        storeId: store.id,
        sectionType: 'header',
        position: -1, // Header always at top
        enabled: true,
        settings: {
          layout: 'centered',
          showAnnouncement: true,
          announcementText: 'Free shipping on orders over $100',
          logoPosition: 'center',
          menuItems: [
            { label: 'Shop', link: '/collections/all' },
            { label: 'About', link: '/pages/about' },
            { label: 'Contact', link: '/pages/contact' }
          ]
        }
      }
    });
  }

  // Check if footer instance exists
  const footerInstance = await prisma.storeSectionInstance.findFirst({
    where: {
      storeId: store.id,
      sectionType: 'footer'
    }
  });

  if (!footerInstance) {
    await prisma.storeSectionInstance.create({
      data: {
        storeId: store.id,
        sectionType: 'footer',
        position: 999, // Footer always at bottom
        enabled: true,
        settings: {
          showNewsletter: true,
          newsletterTitle: 'Subscribe to our newsletter',
          copyrightText: '© 2024 {store_name}. All rights reserved.',
          column1Title: 'Quick Links',
          column1Links: [
            { label: 'Search', link: '/search' },
            { label: 'About Us', link: '/pages/about' },
            { label: 'Contact', link: '/pages/contact' }
          ],
          column2Title: 'Customer Care',
          column2Links: [
            { label: 'Shipping Policy', link: '/policies/shipping' },
            { label: 'Refund Policy', link: '/policies/refund' },
            { label: 'Privacy Policy', link: '/policies/privacy' }
          ],
          showSocial: true
        }
      }
    });
  }

  console.log('Header and footer instances created successfully');
}

addPageStructure()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });