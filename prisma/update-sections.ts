import { prisma } from '../lib/prisma';

async function updateSections() {
  // Find the commerce theme
  const theme = await prisma.theme.findUnique({
    where: { code: 'commerce' }
  });

  if (!theme) {
    console.error('Commerce theme not found');
    return;
  }

  // Update hero section with new schema
  await prisma.themeSection.update({
    where: {
      themeId_type: {
        themeId: theme.id,
        type: 'hero'
      }
    },
    data: {
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
      })
    }
  });

  console.log('Hero section schema updated successfully');
}

updateSections()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });