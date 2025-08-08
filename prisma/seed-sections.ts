import { prisma } from '../lib/prisma';

async function seedSections() {
  // Find the commerce theme
  const theme = await prisma.theme.findUnique({
    where: { code: 'commerce' }
  });

  if (!theme) {
    console.error('Commerce theme not found');
    return;
  }

  // Define section templates
  const sections = [
    {
      themeId: theme.id,
      type: 'hero',
      name: 'Hero Banner',
      description: 'Full-width hero section with image and text overlay',
      schema: JSON.stringify({
        heading: {
          type: 'text',
          label: 'Heading',
          default: 'Summer Collection',
          placeholder: 'Enter your heading text',
          info: 'This will be the main title of your hero section'
        },
        subheading: {
          type: 'text',
          label: 'Subheading',
          default: 'Discover our latest arrivals',
          placeholder: 'Enter your subheading text'
        },
        buttonText: {
          type: 'text',
          label: 'Button Text',
          default: 'Shop Now',
          placeholder: 'e.g., Shop Now, Learn More'
        },
        buttonLink: {
          type: 'url',
          label: 'Button Link',
          default: '/collections/all',
          placeholder: '/collections/all',
          info: 'Where should the button link to?'
        },
        image: {
          type: 'image',
          label: 'Background Image',
          default: '/api/placeholder/1920/800',
          info: 'Recommended size: 1920x800 pixels'
        },
        mobileImage: {
          type: 'image',
          label: 'Mobile Background Image (Optional)',
          default: '',
          info: 'Use a different image for mobile devices'
        },
        height: {
          type: 'select',
          label: 'Section Height',
          options: ['small', 'medium', 'large', 'fullscreen'],
          default: 'large',
          info: 'Choose how tall the hero section should be'
        },
        textAlignment: {
          type: 'select',
          label: 'Text Alignment',
          options: ['left', 'center', 'right'],
          default: 'center'
        },
        overlayOpacity: {
          type: 'range',
          label: 'Overlay Opacity',
          min: 0,
          max: 100,
          default: 20,
          info: 'Adjust the darkness of the overlay'
        },
        showButton: {
          type: 'checkbox',
          label: 'Show button',
          default: true
        }
      }),
      limit: 1
    },
    {
      themeId: theme.id,
      type: 'featured-products',
      name: 'Featured Products',
      description: 'Showcase selected products in a grid',
      schema: JSON.stringify({
        title: {
          type: 'text',
          label: 'Section Title',
          default: 'Featured Products'
        },
        subtitle: {
          type: 'text',
          label: 'Section Subtitle',
          default: ''
        },
        productCount: {
          type: 'range',
          label: 'Number of Products',
          min: 2,
          max: 12,
          default: 6
        },
        columns: {
          type: 'select',
          label: 'Products per Row',
          options: ['2', '3', '4'],
          default: '3'
        }
      })
    },
    {
      themeId: theme.id,
      type: 'collections',
      name: 'Collection List',
      description: 'Display collections in a grid layout',
      schema: JSON.stringify({
        title: {
          type: 'text',
          label: 'Section Title',
          default: 'Shop by Collection'
        },
        collections: {
          type: 'collection-list',
          label: 'Collections',
          limit: 6,
          default: []
        }
      })
    },
    {
      themeId: theme.id,
      type: 'image-with-text',
      name: 'Image with Text',
      description: 'Side-by-side image and text content',
      schema: JSON.stringify({
        heading: {
          type: 'text',
          label: 'Heading',
          default: 'Our Story'
        },
        content: {
          type: 'richtext',
          label: 'Content',
          default: '<p>Share your brand story with customers.</p>'
        },
        buttonText: {
          type: 'text',
          label: 'Button Text',
          default: 'Learn More'
        },
        buttonLink: {
          type: 'url',
          label: 'Button Link',
          default: '/about'
        },
        image: {
          type: 'image',
          label: 'Image',
          default: '/api/placeholder/800/600'
        },
        imagePosition: {
          type: 'select',
          label: 'Image Position',
          options: ['left', 'right'],
          default: 'left'
        }
      })
    },
    {
      themeId: theme.id,
      type: 'testimonials',
      name: 'Testimonials',
      description: 'Customer reviews and testimonials',
      schema: JSON.stringify({
        title: {
          type: 'text',
          label: 'Section Title',
          default: 'What Our Customers Say'
        },
        testimonials: {
          type: 'blocks',
          blocks: {
            testimonial: {
              name: 'Testimonial',
              settings: {
                quote: {
                  type: 'textarea',
                  label: 'Quote',
                  default: ''
                },
                author: {
                  type: 'text',
                  label: 'Author Name',
                  default: ''
                },
                rating: {
                  type: 'range',
                  label: 'Rating',
                  min: 1,
                  max: 5,
                  default: 5
                }
              }
            }
          },
          default: []
        }
      })
    },
    {
      themeId: theme.id,
      type: 'newsletter',
      name: 'Newsletter Signup',
      description: 'Email subscription form',
      schema: JSON.stringify({
        heading: {
          type: 'text',
          label: 'Heading',
          default: 'Stay in Style'
        },
        subheading: {
          type: 'text',
          label: 'Subheading',
          default: 'Subscribe to our newsletter and get 10% off your first order'
        },
        buttonText: {
          type: 'text',
          label: 'Button Text',
          default: 'Subscribe'
        },
        backgroundColor: {
          type: 'color',
          label: 'Background Color',
          default: '#000000'
        }
      }),
      limit: 1
    },
    {
      themeId: theme.id,
      type: 'instagram-feed',
      name: 'Instagram Feed',
      description: 'Display recent Instagram posts',
      schema: JSON.stringify({
        heading: {
          type: 'text',
          label: 'Heading',
          default: 'Follow Us on Instagram'
        },
        username: {
          type: 'text',
          label: 'Instagram Username',
          default: '@minimalfashion'
        },
        postCount: {
          type: 'range',
          label: 'Number of Posts',
          min: 4,
          max: 12,
          default: 6
        }
      }),
      limit: 1
    },
    {
      themeId: theme.id,
      type: 'rich-text',
      name: 'Rich Text',
      description: 'Flexible text content section',
      schema: JSON.stringify({
        content: {
          type: 'richtext',
          label: 'Content',
          default: '<h2>Add your content here</h2><p>Use this text to share information about your brand.</p>'
        },
        textAlignment: {
          type: 'select',
          label: 'Text Alignment',
          options: ['left', 'center', 'right'],
          default: 'center'
        },
        maxWidth: {
          type: 'select',
          label: 'Content Width',
          options: ['small', 'medium', 'large', 'full'],
          default: 'medium'
        }
      })
    },
    {
      themeId: theme.id,
      type: 'logo-list',
      name: 'Logo List',
      description: 'Display brand logos or payment icons',
      schema: JSON.stringify({
        heading: {
          type: 'text',
          label: 'Heading',
          default: 'As Seen In'
        },
        logos: {
          type: 'blocks',
          blocks: {
            logo: {
              name: 'Logo',
              settings: {
                image: {
                  type: 'image',
                  label: 'Logo Image',
                  default: '/api/placeholder/200/100'
                },
                link: {
                  type: 'url',
                  label: 'Link (optional)',
                  default: ''
                }
              }
            }
          },
          default: []
        }
      })
    }
  ];

  // Create sections
  for (const section of sections) {
    await prisma.themeSection.create({
      data: section
    });
  }

  console.log('Section templates created successfully');
}

seedSections()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });