# Nuvi SaaS Theme Development Guide

## Table of Contents
1. [Overview](#overview)
2. [Theme Architecture](#theme-architecture)
3. [Getting Started](#getting-started)
4. [Creating Your First Theme](#creating-your-first-theme)
5. [Section Development](#section-development)
6. [Block Development](#block-development)
7. [Theme Configuration](#theme-configuration)
8. [API Integration](#api-integration)
9. [Testing Your Theme](#testing-your-theme)
10. [Best Practices](#best-practices)
11. [Deployment & Distribution](#deployment--distribution)

## Overview

The Nuvi SaaS theme system is a powerful, flexible framework for creating customizable e-commerce store themes. It follows a **section-based architecture** similar to Shopify's theme system, where each page is composed of configurable sections, and each section can contain customizable blocks.

### Key Concepts

- **Theme**: A complete visual design package containing sections, blocks, and styling
- **Section**: Large page components (hero, header, footer, product grid, etc.)
- **Block**: Smaller components within sections (logo, navigation, buttons, text, etc.)
- **Template**: Page-specific layouts (homepage, product page, collection page, etc.)
- **Schema**: Configuration definitions that make sections and blocks editable in Theme Studio

## Theme Architecture

### File Structure

```
app/s/[subdomain]/themes/[theme-name]/
├── theme.config.ts              # Theme metadata and configuration
├── sections/
│   ├── index.ts                 # Section registry and exports
│   ├── header.tsx               # Header section component
│   ├── hero.tsx                 # Hero section component
│   ├── footer.tsx               # Footer section component
│   ├── featured-products.tsx    # Featured products section
│   └── ...                      # Additional sections
├── blocks/
│   ├── index.ts                 # Block registry and exports
│   ├── logo.tsx                 # Logo block component
│   ├── navigation.tsx           # Navigation block component
│   ├── search.tsx               # Search block component
│   └── ...                      # Additional blocks
├── styles/
│   ├── globals.css              # Global theme styles
│   ├── sections.css             # Section-specific styles
│   └── blocks.css               # Block-specific styles
├── assets/
│   ├── images/                  # Theme images
│   ├── fonts/                   # Theme fonts
│   └── icons/                   # Theme icons
└── templates/
    ├── homepage.ts              # Homepage template configuration
    ├── product.ts               # Product page template configuration
    ├── collection.ts            # Collection page template configuration
    └── ...                      # Additional page templates
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Basic knowledge of React and TypeScript
- Understanding of CSS/Tailwind CSS
- Familiarity with Next.js (helpful but not required)

### Development Environment Setup

1. **Clone the repository and install dependencies:**
   ```bash
   git clone [repository-url]
   cd nuvi-saas
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access Theme Studio:**
   Navigate to `http://localhost:3000/dashboard/stores/[subdomain]/theme-studio`

## Creating Your First Theme

### Step 1: Theme Directory Setup

Create your theme directory:

```bash
mkdir -p app/s/[subdomain]/themes/my-theme/{sections,blocks,styles,assets,templates}
```

### Step 2: Theme Configuration

Create `theme.config.ts`:

```typescript
// app/s/[subdomain]/themes/my-theme/theme.config.ts
import { ThemeConfig } from '@/types/theme';

export const themeConfig: ThemeConfig = {
  name: 'My Theme',
  version: '1.0.0',
  description: 'A beautiful, modern e-commerce theme',
  author: 'Your Name',
  
  // Theme features and capabilities
  features: {
    multipleLayouts: true,
    darkMode: true,
    rtlSupport: false,
    animations: true,
  },
  
  // Supported page types
  templates: [
    'homepage',
    'product.default',
    'collection.default',
    'page.about',
    'page.contact'
  ],
  
  // Global theme settings
  settings: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      text: '#1F2937',
      background: '#FFFFFF'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: 16
    },
    layout: {
      containerMaxWidth: '1200px',
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      }
    }
  }
};
```

### Step 3: Create Global Styles

Create `styles/globals.css`:

```css
/* app/s/[subdomain]/themes/my-theme/styles/globals.css */

:root {
  /* Theme Colors */
  --theme-primary: #3B82F6;
  --theme-secondary: #10B981;
  --theme-accent: #F59E0B;
  --theme-text: #1F2937;
  --theme-background: #FFFFFF;
  
  /* Theme Typography */
  --theme-font-heading: 'Inter', sans-serif;
  --theme-font-body: 'Inter', sans-serif;
  --theme-font-size-base: 16px;
  
  /* Theme Spacing */
  --theme-spacing-xs: 4px;
  --theme-spacing-sm: 8px;
  --theme-spacing-md: 16px;
  --theme-spacing-lg: 24px;
  --theme-spacing-xl: 32px;
  
  /* Theme Layout */
  --theme-container-max-width: 1200px;
}

/* Base theme styles */
.theme-my-theme {
  font-family: var(--theme-font-body);
  font-size: var(--theme-font-size-base);
  color: var(--theme-text);
  background-color: var(--theme-background);
}

.theme-my-theme h1,
.theme-my-theme h2,
.theme-my-theme h3,
.theme-my-theme h4,
.theme-my-theme h5,
.theme-my-theme h6 {
  font-family: var(--theme-font-heading);
}

.theme-container {
  max-width: var(--theme-container-max-width);
  margin: 0 auto;
  padding: 0 var(--theme-spacing-md);
}
```

## Section Development

### Basic Section Structure

Every section is a React component that follows this pattern:

```typescript
// app/s/[subdomain]/themes/my-theme/sections/hero.tsx
import React from 'react';
import { SectionProps } from '@/types/section';
import { BlockRenderer } from '../block-renderer';

interface HeroSectionProps extends SectionProps {
  // Section-specific props
}

export default function HeroSection({ 
  section, 
  blocks = [], 
  isEditing = false,
  onBlockUpdate,
  onBlockDelete,
  ...props 
}: HeroSectionProps) {
  const { settings } = section;
  
  return (
    <section 
      className={`hero-section theme-section ${settings.className || ''}`}
      style={{
        backgroundColor: settings.backgroundColor,
        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
        minHeight: settings.height || '600px',
        ...settings.customStyles
      }}
    >
      <div className="theme-container">
        <div className="hero-content">
          {blocks.map((block, index) => (
            <BlockRenderer
              key={block.id}
              block={block}
              index={index}
              isEditing={isEditing}
              onUpdate={onBlockUpdate}
              onDelete={onBlockDelete}
              sectionContext={section}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Section Schema for Theme Studio
export const HeroSchema = {
  name: 'Hero Section',
  description: 'A large banner section for showcasing key content',
  category: 'content',
  presets: [
    {
      name: 'Hero with Text',
      settings: {
        height: '600px',
        backgroundColor: '#f8fafc',
        textAlign: 'center'
      },
      blocks: [
        {
          type: 'heading',
          settings: {
            text: 'Welcome to Our Store',
            size: 'large'
          }
        },
        {
          type: 'text',
          settings: {
            text: 'Discover amazing products'
          }
        },
        {
          type: 'button',
          settings: {
            text: 'Shop Now',
            style: 'primary'
          }
        }
      ]
    }
  ],
  settings: [
    {
      type: 'header',
      content: 'Layout'
    },
    {
      type: 'range',
      id: 'height',
      label: 'Section Height',
      min: 300,
      max: 1000,
      step: 50,
      unit: 'px',
      default: 600
    },
    {
      type: 'select',
      id: 'textAlign',
      label: 'Text Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ],
      default: 'center'
    },
    {
      type: 'header',
      content: 'Background'
    },
    {
      type: 'color',
      id: 'backgroundColor',
      label: 'Background Color',
      default: '#ffffff'
    },
    {
      type: 'image_picker',
      id: 'backgroundImage',
      label: 'Background Image'
    },
    {
      type: 'header',
      content: 'Advanced'
    },
    {
      type: 'text',
      id: 'className',
      label: 'CSS Classes',
      placeholder: 'custom-hero my-class'
    }
  ],
  blocks: [
    {
      type: 'heading',
      name: 'Heading',
      limit: 2
    },
    {
      type: 'text',
      name: 'Text',
      limit: 3
    },
    {
      type: 'button',
      name: 'Button',
      limit: 2
    },
    {
      type: 'image',
      name: 'Image',
      limit: 1
    }
  ]
};
```

### Section Registry

Register your sections in `sections/index.ts`:

```typescript
// app/s/[subdomain]/themes/my-theme/sections/index.ts
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const HeroSection = dynamic(() => import('./hero'));
const HeaderSection = dynamic(() => import('./header'));
const FooterSection = dynamic(() => import('./footer'));

// Section registry
export const sections = {
  hero: HeroSection,
  header: HeaderSection,
  footer: FooterSection,
};

// Schema registry
export { HeroSchema } from './hero';
export { HeaderSchema } from './header';
export { FooterSchema } from './footer';

// Section metadata
export const sectionMetadata = {
  hero: {
    component: 'hero',
    schema: 'HeroSchema',
    category: 'content',
    maxPerTemplate: 1,
    position: 'anywhere'
  },
  header: {
    component: 'header',
    schema: 'HeaderSchema',
    category: 'layout',
    maxPerTemplate: 1,
    position: 'top'
  },
  footer: {
    component: 'footer',
    schema: 'FooterSchema',
    category: 'layout',
    maxPerTemplate: 1,
    position: 'bottom'
  }
};
```

## Block Development

### Basic Block Structure

```typescript
// app/s/[subdomain]/themes/my-theme/blocks/heading.tsx
import React from 'react';
import { BlockProps } from '@/types/block';

interface HeadingBlockProps extends BlockProps {
  // Block-specific props
}

export default function HeadingBlock({ 
  block, 
  isEditing = false,
  onUpdate,
  onDelete,
  sectionContext,
  ...props 
}: HeadingBlockProps) {
  const { settings } = block;
  
  const HeadingTag = settings.tag || 'h2';
  
  return (
    <div className={`heading-block ${settings.className || ''}`}>
      <HeadingTag
        className={`heading heading-${settings.size || 'medium'}`}
        style={{
          color: settings.color,
          textAlign: settings.textAlign,
          fontSize: settings.fontSize,
          ...settings.customStyles
        }}
      >
        {settings.text || 'Heading Text'}
      </HeadingTag>
      
      {isEditing && (
        <div className="block-controls">
          <button onClick={() => onUpdate?.(block.id, { ...settings })}>
            Edit
          </button>
          <button onClick={() => onDelete?.(block.id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Block Schema
export const HeadingSchema = {
  name: 'Heading',
  description: 'Add a heading to your section',
  icon: 'Type',
  category: 'content',
  settings: [
    {
      type: 'text',
      id: 'text',
      label: 'Heading Text',
      default: 'Your heading here'
    },
    {
      type: 'select',
      id: 'tag',
      label: 'Heading Tag',
      options: [
        { value: 'h1', label: 'H1' },
        { value: 'h2', label: 'H2' },
        { value: 'h3', label: 'H3' },
        { value: 'h4', label: 'H4' },
        { value: 'h5', label: 'H5' },
        { value: 'h6', label: 'H6' }
      ],
      default: 'h2'
    },
    {
      type: 'select',
      id: 'size',
      label: 'Size',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'xlarge', label: 'Extra Large' }
      ],
      default: 'medium'
    },
    {
      type: 'color',
      id: 'color',
      label: 'Text Color',
      default: '#1F2937'
    },
    {
      type: 'select',
      id: 'textAlign',
      label: 'Text Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ],
      default: 'left'
    }
  ]
};
```

### Block Registry

Register your blocks in `blocks/index.ts`:

```typescript
// app/s/[subdomain]/themes/my-theme/blocks/index.ts
import dynamic from 'next/dynamic';

// Dynamic imports
const HeadingBlock = dynamic(() => import('./heading'));
const TextBlock = dynamic(() => import('./text'));
const ButtonBlock = dynamic(() => import('./button'));
const ImageBlock = dynamic(() => import('./image'));

// Block registry
export const blocks = {
  heading: HeadingBlock,
  text: TextBlock,
  button: ButtonBlock,
  image: ImageBlock,
};

// Schema registry
export { HeadingSchema } from './heading';
export { TextSchema } from './text';
export { ButtonSchema } from './button';
export { ImageSchema } from './image';

// Block metadata
export const blockMetadata = {
  heading: {
    component: 'heading',
    schema: 'HeadingSchema',
    category: 'content',
    icon: 'Type'
  },
  text: {
    component: 'text',
    schema: 'TextSchema',
    category: 'content',
    icon: 'FileText'
  },
  button: {
    component: 'button',
    schema: 'ButtonSchema',
    category: 'interactive',
    icon: 'MousePointer'
  },
  image: {
    component: 'image',
    schema: 'ImageSchema',
    category: 'media',
    icon: 'Image'
  }
};
```

## Theme Configuration

### Template Configuration

Define templates for different page types:

```typescript
// app/s/[subdomain]/themes/my-theme/templates/homepage.ts
import { TemplateConfig } from '@/types/template';

export const homepageTemplate: TemplateConfig = {
  name: 'Homepage',
  handle: 'homepage',
  description: 'Main store homepage',
  
  // Default sections for new stores
  defaultSections: [
    {
      type: 'header',
      position: 0,
      settings: {
        sticky: true,
        transparent: false
      },
      blocks: [
        { type: 'logo', settings: { position: 'left' } },
        { type: 'navigation', settings: { style: 'horizontal' } },
        { type: 'search', settings: { style: 'icon' } },
        { type: 'cart', settings: { style: 'icon' } }
      ]
    },
    {
      type: 'hero',
      position: 1,
      settings: {
        height: '600px',
        textAlign: 'center'
      },
      blocks: [
        { 
          type: 'heading', 
          settings: { 
            text: 'Welcome to Our Store',
            size: 'xlarge'
          } 
        },
        { 
          type: 'text', 
          settings: { 
            text: 'Discover amazing products at great prices'
          } 
        },
        { 
          type: 'button', 
          settings: { 
            text: 'Shop Now',
            style: 'primary'
          } 
        }
      ]
    },
    {
      type: 'featured-products',
      position: 2,
      settings: {
        title: 'Featured Products',
        limit: 8,
        layout: 'grid'
      }
    },
    {
      type: 'footer',
      position: 3,
      settings: {
        showNewsletter: true,
        showSocial: true
      }
    }
  ],
  
  // Available sections for this template
  availableSections: [
    'header',
    'hero',
    'featured-products',
    'testimonials',
    'newsletter',
    'footer'
  ],
  
  // Template-specific settings
  settings: [
    {
      type: 'header',
      content: 'Homepage Settings'
    },
    {
      type: 'checkbox',
      id: 'showHero',
      label: 'Show Hero Section',
      default: true
    },
    {
      type: 'number',
      id: 'featuredProductsLimit',
      label: 'Number of Featured Products',
      min: 4,
      max: 16,
      default: 8
    }
  ]
};
```

## API Integration

### Database Integration

Your theme automatically integrates with the database through:

1. **Store Data**: Access store information (name, domain, settings)
2. **Product Data**: Product listings, details, variants, pricing
3. **Collection Data**: Product categories and filtering
4. **Customer Data**: User accounts, orders, preferences
5. **Content Data**: Pages, blogs, navigation menus

### Example Data Usage

```typescript
// In your section components
export default function FeaturedProductsSection({ section, storeData, productData }) {
  const { settings } = section;
  const { products, collections } = productData;
  
  // Filter products based on section settings
  const featuredProducts = products
    .filter(product => product.featured)
    .slice(0, settings.limit || 8);
  
  return (
    <section className="featured-products-section">
      <div className="theme-container">
        <h2>{settings.title || 'Featured Products'}</h2>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

## Testing Your Theme

### Development Testing

1. **Theme Studio Preview**: Use the real-time preview in Theme Studio
2. **Responsive Testing**: Test on different screen sizes
3. **Performance Testing**: Check loading times and rendering performance
4. **Browser Testing**: Ensure compatibility across browsers

### Theme Validation

Create a validation script to check your theme:

```typescript
// scripts/validate-theme.ts
import { validateTheme } from '@/lib/theme-validator';

const themeValidation = validateTheme('my-theme');

console.log('Theme Validation Results:');
console.log('✓ Required files:', themeValidation.files);
console.log('✓ Section schemas:', themeValidation.sections);
console.log('✓ Block schemas:', themeValidation.blocks);
console.log('✓ Template configs:', themeValidation.templates);

if (themeValidation.errors.length > 0) {
  console.error('❌ Validation Errors:');
  themeValidation.errors.forEach(error => console.error('  -', error));
} else {
  console.log('✅ Theme validation passed!');
}
```

## Best Practices

### Performance

1. **Use Dynamic Imports**: Load components only when needed
2. **Optimize Images**: Use Next.js Image optimization
3. **Minimize CSS**: Use utility classes and avoid large CSS files
4. **Code Splitting**: Keep section and block components separate

### Accessibility

1. **Semantic HTML**: Use proper HTML tags and structure
2. **ARIA Labels**: Add accessibility attributes where needed
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Color Contrast**: Maintain sufficient color contrast ratios

### Maintainability

1. **Consistent Naming**: Use clear, descriptive names for components and files
2. **Component Isolation**: Keep sections and blocks independent
3. **Schema Documentation**: Document all settings and their purposes
4. **Version Control**: Use semantic versioning for theme releases

### User Experience

1. **Intuitive Settings**: Make theme customization easy and logical
2. **Helpful Defaults**: Provide sensible default values
3. **Preview Updates**: Ensure changes show immediately in preview
4. **Error Handling**: Gracefully handle missing data or invalid settings

## Deployment & Distribution

### Theme Package Structure

```
my-theme-v1.0.0/
├── package.json
├── README.md
├── CHANGELOG.md
├── theme.config.ts
├── sections/
├── blocks/
├── styles/
├── assets/
├── templates/
└── docs/
    ├── installation.md
    ├── customization.md
    └── examples.md
```

### Package.json Example

```json
{
  "name": "@my-company/my-theme",
  "version": "1.0.0",
  "description": "A beautiful, modern e-commerce theme for Nuvi SaaS",
  "keywords": ["nuvi", "theme", "ecommerce", "modern"],
  "author": "Your Name <your@email.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/my-theme"
  },
  "files": [
    "sections/",
    "blocks/",
    "styles/",
    "assets/",
    "templates/",
    "theme.config.ts"
  ],
  "peerDependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0"
  }
}
```

### Installation Instructions

```markdown
# My Theme Installation

## Installation

1. Download the theme package
2. Extract to `app/s/[subdomain]/themes/my-theme/`
3. Restart your development server
4. Activate the theme in Theme Studio

## Customization

See `docs/customization.md` for detailed customization options.

## Support

For support, please contact us at support@example.com or visit our documentation.
```

---

This guide provides a complete foundation for developing themes in the Nuvi SaaS platform. For additional examples and advanced techniques, refer to the existing Artisan Craft theme implementation.