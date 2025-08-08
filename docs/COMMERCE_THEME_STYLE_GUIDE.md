# Commerce Theme Style Guide

## Overview
This style guide ensures consistency across all components in the Commerce theme. All components should follow these guidelines to maintain a cohesive design system.

## Core Principles

### 1. Use CSS Variables
Always use CSS variables defined in `design-tokens.ts` instead of hardcoded values:

```tsx
// ❌ Don't
<div className="text-blue-600">Content</div>

// ✅ Do
<div className="text-primary">Content</div>
```

### 2. Consistent Color System

#### Semantic Colors
- **Primary**: Actions, links, focus states
- **Secondary**: Secondary actions, less prominent elements
- **Accent**: Special highlights, badges
- **Success**: Success messages, completed states
- **Warning**: Warning messages, caution states
- **Error**: Error messages, destructive actions
- **Neutral**: Text, borders, backgrounds

#### Usage Examples
```tsx
// Text colors
<p className="text-neutral-900">Main text</p>
<p className="text-neutral-600">Secondary text</p>
<p className="text-primary">Link text</p>

// Background colors
<div className="bg-neutral-50">Light background</div>
<div className="bg-primary-50">Primary tinted background</div>

// Border colors
<div className="border border-neutral-200">Default border</div>
<div className="border-2 border-primary">Primary border</div>
```

### 3. Typography

#### Font Families
```css
font-sans: var(--font-body)
font-heading: var(--font-heading)
```

#### Font Sizes
Use semantic size classes that map to CSS variables:
```tsx
<h1 style={{ fontSize: 'var(--font-size-4xl)' }}>Heading 1</h1>
<h2 style={{ fontSize: 'var(--font-size-3xl)' }}>Heading 2</h2>
<p style={{ fontSize: 'var(--font-size-base)' }}>Body text</p>
```

### 4. Spacing System

Use consistent spacing from the design tokens:
```tsx
// Padding/Margin
<div className="p-4">16px padding</div>
<div className="m-8">32px margin</div>

// Custom spacing
<div style={{ padding: 'var(--spacing-6)' }}>24px padding</div>
```

### 5. Component Patterns

#### Buttons
```tsx
// Primary button
<button className="btn btn-primary">Primary Action</button>

// Secondary button
<button className="btn btn-secondary">Secondary Action</button>

// Ghost button
<button className="btn btn-ghost">Ghost Action</button>

// Button sizes
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary btn-md">Medium</button>
<button className="btn btn-primary btn-lg">Large</button>
```

#### Cards
```tsx
<div className="bg-background rounded-lg shadow-sm border border-neutral-200 p-6">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-neutral-600">Card content</p>
</div>
```

#### Form Elements
```tsx
<input 
  type="text" 
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
  placeholder="Enter text"
/>
```

### 6. Interactive States

#### Hover States
```tsx
// Links
<a className="text-primary hover:text-primary-700">Link</a>

// Cards
<div className="border border-neutral-200 hover:border-neutral-300 transition-colors">
  Card with hover
</div>
```

#### Focus States
```tsx
<button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Focusable button
</button>
```

### 7. Responsive Design

Use responsive utilities consistently:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Grid items */}
</div>
```

### 8. Animation Guidelines

Use consistent transitions:
```tsx
// Default transition
<div className="transition-colors duration-200">Smooth color transition</div>

// Transform transition
<div className="transition-transform duration-300 hover:scale-105">
  Scale on hover
</div>
```

### 9. Block Development Guidelines

When creating new blocks:

1. **Import block renderer types**
   ```tsx
   import { BlockProps } from './block-renderer';
   ```

2. **Use semantic HTML**
   ```tsx
   <article>, <section>, <nav>, <header>, <footer>
   ```

3. **Support theme context**
   ```tsx
   const { store, section } = context || {};
   ```

4. **Handle preview state**
   ```tsx
   if (isPreview) {
     // Show placeholder data
   }
   ```

### 10. CSS Variable Reference

Common CSS variables to use:
```css
/* Colors */
--color-primary-600
--color-neutral-900
--color-neutral-50

/* Typography */
--font-size-base
--font-weight-semibold
--line-height-normal

/* Spacing */
--spacing-4
--spacing-8

/* Layout */
--theme-layout-container-width

/* Shadows */
--shadow-sm
--shadow-md
```

## Examples

### Complete Component Example
```tsx
'use client';

import { memo } from 'react';
import { BlockProps } from './block-renderer';

const ExampleBlock: React.FC<BlockProps> = memo(({ settings, isPreview, context }) => {
  const {
    title = 'Default Title',
    variant = 'primary',
    size = 'medium'
  } = settings;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h2 
          className="text-3xl font-heading font-semibold mb-4"
          style={{ color: 'var(--color-neutral-900)' }}
        >
          {title}
        </h2>
        <button className={`btn btn-${variant} btn-${size}`}>
          Click me
        </button>
      </div>
    </div>
  );
});

ExampleBlock.displayName = 'ExampleBlock';

export default ExampleBlock;
```

## Migration Checklist

When updating existing components:
- [ ] Replace hardcoded colors with CSS variables
- [ ] Use semantic color classes (primary, neutral, etc.)
- [ ] Apply consistent spacing using the spacing system
- [ ] Ensure proper focus states for accessibility
- [ ] Add appropriate transitions for interactive elements
- [ ] Test responsive behavior
- [ ] Update any inline styles to use CSS variables