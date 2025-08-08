# Nuvi Button System

Shopify Polaris Design System standartlarına tam uyumlu button sistemi. Nuvi admin paneli için optimize edilmiş.

## Usage

### CSS Classes (Recommended)
Doğrudan CSS class'larını kullanın - en performanslı yöntem:

```jsx
// Primary action button
<button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
  <Save className="h-4 w-4" />
  Save Changes
</button>

// Secondary action button  
<button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
  Cancel
</button>

// Outline button (subtle)
<button className="nuvi-btn nuvi-btn-outline nuvi-btn-sm">
  Reset to Default
</button>

// Danger button
<button className="nuvi-btn nuvi-btn-danger nuvi-btn-sm">
  <Trash className="h-4 w-4" />
  Delete
</button>
```

### React Component (Optional)
TypeScript avantajları için component kullanın:

```jsx
import { 
  Button, 
  PageActionButton, 
  PrimaryActionButton,
  LoadingButton,
  IconButton,
  ButtonGroup 
} from '@/components/ui/button-unified';

// Standard usage
<Button variant="primary" size="sm">Save Changes</Button>
<Button variant="outline" size="sm">Cancel</Button>

// Advanced features
<LoadingButton isLoading={saving} variant="primary">Save Changes</LoadingButton>
<Button variant="primary" fullWidth>Full Width Button</Button>
<IconButton><Save className="h-4 w-4" /></IconButton>

// Button groups
<ButtonGroup>
  <Button variant="secondary" size="sm">Day</Button>
  <Button variant="secondary" size="sm">Week</Button>
  <Button variant="secondary" size="sm">Month</Button>
</ButtonGroup>

// Specialized components
<PageActionButton>Filter</PageActionButton>
<PrimaryActionButton>Add Product</PrimaryActionButton>
```

## Button Variants

### Primary (`nuvi-btn-primary`)
- **Use for**: Main actions, submit buttons
- **Style**: Dark background, white text, subtle shadow
- **Example**: Save, Submit, Create, Add

### Secondary (`nuvi-btn-secondary`) 
- **Use for**: Secondary actions
- **Style**: White background, border, light shadow
- **Example**: Cancel, Edit, View

### Outline (`nuvi-btn-outline`)
- **Use for**: Subtle actions, reset buttons
- **Style**: Transparent background, border only
- **Example**: Reset, Clear, Reset to Default

### Ghost (`nuvi-btn-ghost`)
- **Use for**: Minimal actions, icon buttons
- **Style**: No background, no border
- **Example**: Close, Menu toggle, Icon actions

### Danger (`nuvi-btn-danger`)
- **Use for**: Destructive actions
- **Style**: Red background, white text
- **Example**: Delete, Remove, Clear All

### Tertiary (`nuvi-btn-tertiary`)
- **Use for**: Less prominent secondary actions
- **Style**: Transparent background with border
- **Example**: View details, Learn more

### Plain (`nuvi-btn-plain`)
- **Use for**: Link-like actions
- **Style**: No background, underlined text, blue color
- **Example**: Learn more, View details, Help

### Monochrome (`nuvi-btn-monochrome-plain`)
- **Use for**: Subdued link actions
- **Style**: No background, underlined text, muted color
- **Example**: Cancel, Skip, Not now

### Success (`nuvi-btn-success`)
- **Use for**: Positive confirmations
- **Style**: Green background, white text  
- **Example**: Publish, Activate, Confirm

### Critical (`nuvi-btn-critical`)
- **Use for**: Critical destructive actions
- **Style**: Red background, white text (same as danger)
- **Example**: Delete permanently, Remove all

## Button Sizes (Polaris Standard)

### Micro (`nuvi-btn-micro`)
- **Height**: 24px (1.5rem)
- **Use for**: Table cells, compact layouts

### Slim (`nuvi-btn-slim`)
- **Height**: 36px (2.25rem) - Reduced horizontal padding
- **Use for**: Tight horizontal spaces

### Small (`nuvi-btn-sm`) 
- **Height**: 32px (2rem)
- **Use for**: Secondary actions, toolbars

### Medium (default)
- **Height**: 36px (2.25rem) 
- **Use for**: Standard actions, forms - **Most common**

### Large (`nuvi-btn-lg`)
- **Height**: 44px (2.75rem)
- **Use for**: Primary CTAs, empty states

## Page Action Pattern

Standart sayfa action'ları için tutarlı pattern:

```jsx
// Page header with actions
<div className="nuvi-page-header">
  <div>
    <h2 className="nuvi-page-title">Page Title</h2>
    <p className="nuvi-page-description">Page description</p>
  </div>
  <div className="nuvi-flex nuvi-gap-md">
    <button className="nuvi-btn nuvi-btn-outline nuvi-btn-sm">
      Secondary Action
    </button>
    <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
      <Plus className="h-4 w-4" />
      Primary Action
    </button>
  </div>
</div>
```

## Advanced Features

### Loading State
```jsx
// CSS class
<button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-btn-loading">
  Saving...
</button>

// React component
<LoadingButton isLoading={true} variant="primary">Save</LoadingButton>
```

### Full Width
```jsx
// CSS class
<button className="nuvi-btn nuvi-btn-primary nuvi-btn-full">
  Full Width Button
</button>

// React component
<Button variant="primary" fullWidth>Full Width Button</Button>
```

### Icon-Only Buttons
```jsx
// CSS class
<button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-btn-icon-only">
  <Search className="h-4 w-4" />
</button>

// React component  
<IconButton><Search className="h-4 w-4" /></IconButton>
```

### Button Groups
```jsx
// CSS structure
<div className="nuvi-btn-group">
  <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">Day</button>
  <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">Week</button>
  <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">Month</button>
</div>

// React component
<ButtonGroup>
  <Button variant="secondary" size="sm">Day</Button>
  <Button variant="secondary" size="sm">Week</Button>
  <Button variant="secondary" size="sm">Month</Button>
</ButtonGroup>
```

### Disclosure Buttons (Dropdown Indicators)
```jsx
// CSS class
<button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-btn-disclosure">
  More Options
</button>

// React component
<Button variant="secondary" disclosure>More Options</Button>
```

## Icon Guidelines

- **Icon size**: Automatically adjusted per button size
- **Placement**: Usually before text
- **Spacing**: Handled automatically by CSS gap

```jsx
// Icons are automatically sized
<button className="nuvi-btn nuvi-btn-sm">
  <Save className="h-4 w-4" /> {/* Will be resized to 14px */}
  Save
</button>
```

## Design Principles

1. **Compact**: Optimized for admin interfaces
2. **Consistent**: Same height and spacing across variants
3. **Accessible**: Proper focus states and contrast
4. **Shopify-inspired**: Professional, clean aesthetic
5. **Performance**: CSS-first approach for speed

## Migration from Old Buttons

Old patterns → New patterns:

```jsx
// OLD
<Button variant="primary" size="sm">Save</Button>

// NEW (recommended)
<button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">Save</button>

// OLD  
className="bg-blue-500 text-white px-4 py-2 rounded"

// NEW
className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
```