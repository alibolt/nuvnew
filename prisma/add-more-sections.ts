import { prisma } from '../lib/prisma';

async function addMoreSections() {
  const theme = await prisma.theme.findUnique({
    where: { code: 'commerce' }
  });

  if (!theme) {
    console.error('Commerce theme not found');
    return;
  }

  console.log('Adding more sections to Commerce theme...');

  // New sections to add
  const newSections = [
    {
      type: 'product-grid',
      name: 'Product Grid',
      description: 'Display products in a customizable grid layout',
      schema: {
        title: {
          type: 'text',
          label: 'Section Title',
          default: 'Our Products'
        },
        subtitle: {
          type: 'text',
          label: 'Section Subtitle',
          default: 'Browse our latest collection'
        },
        collection: {
          type: 'select',
          label: 'Collection to Display',
          options: ['all', 'featured', 'new-arrivals', 'sale'],
          default: 'all'
        },
        productsPerRow: {
          type: 'range',
          label: 'Products Per Row',
          min: 2,
          max: 5,
          default: 4
        },
        rows: {
          type: 'range',
          label: 'Number of Rows',
          min: 1,
          max: 4,
          default: 2
        },
        showPrice: {
          type: 'checkbox',
          label: 'Show Price',
          default: true
        },
        showAddToCart: {
          type: 'checkbox',
          label: 'Show Add to Cart Button',
          default: true
        }
      }
    },
    {
      type: 'banner-slider',
      name: 'Banner Slider',
      description: 'Full-width image carousel with text overlays',
      schema: {
        slides: {
          type: 'array',
          label: 'Slides',
          default: [
            {
              image: 'https://via.placeholder.com/1920x600',
              title: 'Summer Collection',
              subtitle: 'Discover the latest trends',
              buttonText: 'Shop Now',
              buttonLink: '/collections/summer'
            }
          ]
        },
        autoplay: {
          type: 'checkbox',
          label: 'Enable Autoplay',
          default: true
        },
        autoplaySpeed: {
          type: 'range',
          label: 'Autoplay Speed (seconds)',
          min: 3,
          max: 10,
          default: 5
        },
        showArrows: {
          type: 'checkbox',
          label: 'Show Navigation Arrows',
          default: true
        },
        showDots: {
          type: 'checkbox',
          label: 'Show Navigation Dots',
          default: true
        }
      }
    },
    {
      type: 'countdown-timer',
      name: 'Countdown Timer',
      description: 'Countdown timer for sales and special events',
      schema: {
        title: {
          type: 'text',
          label: 'Title',
          default: 'Sale Ends In'
        },
        endDate: {
          type: 'text',
          label: 'End Date (YYYY-MM-DD HH:MM)',
          default: '2024-12-31 23:59'
        },
        backgroundColor: {
          type: 'color',
          label: 'Background Color',
          default: '#000000'
        },
        textColor: {
          type: 'color',
          label: 'Text Color',
          default: '#FFFFFF'
        },
        showDays: {
          type: 'checkbox',
          label: 'Show Days',
          default: true
        }
      }
    },
    {
      type: 'video-hero',
      name: 'Video Hero',
      description: 'Full-width video background with overlay text',
      schema: {
        videoUrl: {
          type: 'url',
          label: 'Video URL (YouTube/Vimeo)',
          default: '',
          placeholder: 'https://www.youtube.com/watch?v=...'
        },
        videoFile: {
          type: 'url',
          label: 'Or Upload Video File URL',
          default: '',
          placeholder: 'https://example.com/video.mp4'
        },
        title: {
          type: 'text',
          label: 'Title',
          default: 'Welcome to Our Store'
        },
        subtitle: {
          type: 'textarea',
          label: 'Subtitle',
          default: 'Discover amazing products'
        },
        buttonText: {
          type: 'text',
          label: 'Button Text',
          default: 'Shop Now'
        },
        buttonLink: {
          type: 'url',
          label: 'Button Link',
          default: '/collections/all'
        },
        overlayOpacity: {
          type: 'range',
          label: 'Overlay Opacity',
          min: 0,
          max: 100,
          default: 50
        }
      }
    },
    {
      type: 'faq',
      name: 'FAQ Section',
      description: 'Frequently asked questions with collapsible answers',
      schema: {
        title: {
          type: 'text',
          label: 'Section Title',
          default: 'Frequently Asked Questions'
        },
        faqs: {
          type: 'array',
          label: 'Questions',
          default: [
            {
              question: 'What is your return policy?',
              answer: 'We offer a 30-day return policy for all items.'
            },
            {
              question: 'How long does shipping take?',
              answer: 'Standard shipping takes 5-7 business days.'
            }
          ]
        },
        backgroundColor: {
          type: 'color',
          label: 'Background Color',
          default: '#F8F8F8'
        }
      }
    },
    {
      type: 'contact-form',
      name: 'Contact Form',
      description: 'Contact form with customizable fields',
      schema: {
        title: {
          type: 'text',
          label: 'Form Title',
          default: 'Get in Touch'
        },
        subtitle: {
          type: 'textarea',
          label: 'Form Description',
          default: 'Have a question? We\'d love to hear from you.'
        },
        showPhone: {
          type: 'checkbox',
          label: 'Show Phone Field',
          default: false
        },
        showSubject: {
          type: 'checkbox',
          label: 'Show Subject Field',
          default: true
        },
        submitButtonText: {
          type: 'text',
          label: 'Submit Button Text',
          default: 'Send Message'
        }
      }
    },
    {
      type: 'map',
      name: 'Store Map',
      description: 'Display store location on a map',
      schema: {
        title: {
          type: 'text',
          label: 'Section Title',
          default: 'Visit Our Store'
        },
        address: {
          type: 'textarea',
          label: 'Store Address',
          default: '123 Main Street, City, Country'
        },
        mapStyle: {
          type: 'select',
          label: 'Map Style',
          options: ['standard', 'satellite', 'terrain'],
          default: 'standard'
        },
        zoom: {
          type: 'range',
          label: 'Zoom Level',
          min: 10,
          max: 20,
          default: 15
        }
      }
    },
    {
      type: 'gallery',
      name: 'Image Gallery',
      description: 'Grid or masonry style image gallery',
      schema: {
        title: {
          type: 'text',
          label: 'Gallery Title',
          default: 'Gallery'
        },
        layout: {
          type: 'select',
          label: 'Layout Style',
          options: ['grid', 'masonry', 'carousel'],
          default: 'grid'
        },
        images: {
          type: 'array',
          label: 'Gallery Images',
          default: []
        },
        columns: {
          type: 'range',
          label: 'Columns',
          min: 2,
          max: 6,
          default: 4
        },
        spacing: {
          type: 'range',
          label: 'Image Spacing (px)',
          min: 0,
          max: 30,
          default: 10
        }
      }
    },
    {
      type: 'announcement-bar',
      name: 'Announcement Bar',
      description: 'Scrolling announcement bar with multiple messages',
      schema: {
        messages: {
          type: 'array',
          label: 'Announcement Messages',
          default: [
            { text: 'Free shipping on orders over $100', link: '' },
            { text: '20% off sale items', link: '/collections/sale' }
          ]
        },
        backgroundColor: {
          type: 'color',
          label: 'Background Color',
          default: '#000000'
        },
        textColor: {
          type: 'color',
          label: 'Text Color',
          default: '#FFFFFF'
        },
        scrollSpeed: {
          type: 'range',
          label: 'Scroll Speed',
          min: 1,
          max: 10,
          default: 5
        }
      }
    },
    {
      type: 'size-guide',
      name: 'Size Guide',
      description: 'Product size guide with charts',
      schema: {
        title: {
          type: 'text',
          label: 'Title',
          default: 'Size Guide'
        },
        showMeasurementGuide: {
          type: 'checkbox',
          label: 'Show How to Measure Guide',
          default: true
        },
        sizeChart: {
          type: 'array',
          label: 'Size Chart Data',
          default: [
            { size: 'XS', chest: '32-34', waist: '24-26', hips: '34-36' },
            { size: 'S', chest: '34-36', waist: '26-28', hips: '36-38' },
            { size: 'M', chest: '36-38', waist: '28-30', hips: '38-40' },
            { size: 'L', chest: '38-40', waist: '30-32', hips: '40-42' },
            { size: 'XL', chest: '40-42', waist: '32-34', hips: '42-44' }
          ]
        }
      }
    }
  ];

  // Create each section
  for (const section of newSections) {
    try {
      // Check if section already exists
      const exists = await prisma.themeSection.findUnique({
        where: {
          themeId_type: {
            themeId: theme.id,
            type: section.type
          }
        }
      });

      if (!exists) {
        await prisma.themeSection.create({
          data: {
            themeId: theme.id,
            type: section.type,
            name: section.name,
            description: section.description,
            schema: JSON.stringify(section.schema),
            limit: section.type === 'header' || section.type === 'footer' ? 1 : null
          }
        });
        console.log(`✅ Created section: ${section.name}`);
      } else {
        console.log(`⏭️  Section already exists: ${section.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating section ${section.name}:`, error);
    }
  }

  console.log('Done adding sections!');
}

addMoreSections()
  .catch(console.error)
  .finally(() => prisma.$disconnect());