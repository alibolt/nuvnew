# NuviDesign Component Library

## ✅ Dashboard'da Kullanılabilir Componentler

### 1. **Buttons** (`nuvi-btn`)
```html
<!-- Variants -->
<button className="nuvi-btn nuvi-btn-primary">Primary</button>
<button className="nuvi-btn nuvi-btn-secondary">Secondary</button>
<button className="nuvi-btn nuvi-btn-destructive">Delete</button>
<button className="nuvi-btn nuvi-btn-ghost">Ghost</button>
<button className="nuvi-btn nuvi-btn-outline">Outline</button>

<!-- Sizes -->
<button className="nuvi-btn nuvi-btn-sm">Small</button>
<button className="nuvi-btn nuvi-btn-lg">Large</button>

<!-- With Icons -->
<button className="nuvi-btn nuvi-btn-primary">
  <Plus size={16} /> Add Item
</button>

<!-- Loading State -->
<button className="nuvi-btn nuvi-btn-primary" disabled>
  <Loader2 className="h-4 w-4 animate-spin" /> Processing
</button>
```

### 2. **Cards** (`nuvi-card`)
```html
<div className="nuvi-card">
  <div className="nuvi-card-header">
    <h4 className="nuvi-card-title">Card Title</h4>
  </div>
  <div className="nuvi-card-content">
    Content goes here
  </div>
  <div className="nuvi-card-footer">
    Footer content
  </div>
</div>
```

### 3. **Badges** (`nuvi-badge`)
```html
<span className="nuvi-badge nuvi-badge-success">Active</span>
<span className="nuvi-badge nuvi-badge-warning">Pending</span>
<span className="nuvi-badge nuvi-badge-danger">Inactive</span>
<span className="nuvi-badge nuvi-badge-info">Info</span>
```

### 4. **Form Elements**

#### Input
```html
<input type="text" className="nuvi-input" placeholder="Enter text" />
<textarea className="nuvi-textarea" rows={4}></textarea>
```

#### Select
```html
<select className="nuvi-select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Checkbox
```html
<input type="checkbox" className="nuvi-checkbox" />
```

#### Radio
```html
<input type="radio" className="nuvi-radio" name="group" />
```

#### Switch
```html
<label className="nuvi-switch">
  <input type="checkbox" />
  <span className="nuvi-switch-slider"></span>
</label>
```

### 5. **Tables** (`nuvi-table`)
```html
<table className="nuvi-table">
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

### 6. **Loading States**
```html
<!-- Spinner -->
<div className="nuvi-spinner"></div>

<!-- Dashboard Loading -->
<div className="nuvi-btn-loading"></div>

<!-- Skeleton -->
<div className="nuvi-skeleton"></div>
```

### 7. **Alerts** (`nuvi-alert`)
```html
<div className="nuvi-alert nuvi-alert-info">
  <Info size={16} /> Information message
</div>
<div className="nuvi-alert nuvi-alert-success">
  <CheckCircle size={16} /> Success message
</div>
<div className="nuvi-alert nuvi-alert-warning">
  <AlertTriangle size={16} /> Warning message
</div>
<div className="nuvi-alert nuvi-alert-danger">
  <XCircle size={16} /> Error message
</div>
```

### 8. **Tabs** (`nuvi-tabs`)
```html
<div className="nuvi-tabs">
  <div className="nuvi-tabs-list">
    <button className="nuvi-tab active">Tab 1</button>
    <button className="nuvi-tab">Tab 2</button>
  </div>
  <div className="nuvi-tab-content">
    Content
  </div>
</div>
```

### 9. **Navigation Components**

#### Vertical Navigation (Sidebar)
```javascript
// With sub-menus and collapse functionality
// See NuviDesign page for full example
```

#### Breadcrumb
```html
<nav className="nuvi-breadcrumb">
  <a href="#">Home</a> / 
  <a href="#">Products</a> / 
  <span>Current Page</span>
</nav>
```

#### Pagination
```html
<div className="nuvi-pagination">
  <button className="nuvi-btn nuvi-btn-ghost">Previous</button>
  <button className="nuvi-btn nuvi-btn-primary">1</button>
  <button className="nuvi-btn nuvi-btn-ghost">2</button>
  <button className="nuvi-btn nuvi-btn-ghost">Next</button>
</div>
```

### 10. **Modal/Dialog**
```javascript
// Full example in NuviDesign
{dialogOpen && (
  <div className="nuvi-modal-overlay">
    <div className="nuvi-modal">
      <div className="nuvi-modal-header">Title</div>
      <div className="nuvi-modal-content">Content</div>
      <div className="nuvi-modal-footer">
        <button className="nuvi-btn nuvi-btn-secondary">Cancel</button>
        <button className="nuvi-btn nuvi-btn-primary">Save</button>
      </div>
    </div>
  </div>
)}
```

### 11. **Dropdown Menu**
```html
<div className="nuvi-dropdown">
  <button className="nuvi-dropdown-trigger">
    Options <ChevronDown size={16} />
  </button>
  <div className="nuvi-dropdown-content">
    <button className="nuvi-dropdown-item">Edit</button>
    <button className="nuvi-dropdown-item">Delete</button>
  </div>
</div>
```

### 12. **Progress Bar**
```html
<div className="nuvi-progress">
  <div className="nuvi-progress-bar" style={{width: '60%'}}></div>
</div>
```

### 13. **Avatar**
```html
<div className="nuvi-avatar">
  <img src="/user.jpg" alt="User" />
</div>
<div className="nuvi-avatar nuvi-avatar-lg">JD</div>
```

### 14. **Tooltip**
```html
<button className="nuvi-btn" title="Tooltip text">
  Hover me
</button>
```

### 15. **Command Palette**
```javascript
// Full implementation in dashboard
// Activated with ⌘K
```

## 📋 Dashboard Kullanım Örnekleri

### Products List
```javascript
<div className="nuvi-card">
  <div className="nuvi-card-content">
    <table className="nuvi-table">
      <thead>
        <tr>
          <th>
            <input type="checkbox" className="nuvi-checkbox" />
          </th>
          <th>Product</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <input type="checkbox" className="nuvi-checkbox" />
          </td>
          <td>Product Name</td>
          <td>
            <span className="nuvi-badge nuvi-badge-success">Active</span>
          </td>
          <td>
            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
              <Edit size={16} />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Form Panel
```javascript
<div className="nuvi-card">
  <div className="nuvi-card-header">
    <h3 className="nuvi-card-title">Edit Product</h3>
  </div>
  <div className="nuvi-card-content">
    <div className="nuvi-form-group">
      <label>Product Name</label>
      <input type="text" className="nuvi-input" />
    </div>
    <div className="nuvi-form-group">
      <label>Category</label>
      <select className="nuvi-select">
        <option>Electronics</option>
        <option>Clothing</option>
      </select>
    </div>
  </div>
  <div className="nuvi-card-footer">
    <button className="nuvi-btn nuvi-btn-secondary">Cancel</button>
    <button className="nuvi-btn nuvi-btn-primary">Save</button>
  </div>
</div>
```

### Stats Cards
```javascript
<div className="nuvi-grid nuvi-grid-cols-3 nuvi-gap-lg">
  <div className="nuvi-card">
    <div className="nuvi-card-content">
      <p className="nuvi-text-muted">Total Revenue</p>
      <p className="nuvi-text-2xl nuvi-font-bold">$45,231</p>
      <p className="nuvi-text-success nuvi-text-sm">+20.1%</p>
    </div>
  </div>
</div>
```

## 🎨 Utility Classes

### Spacing
- `nuvi-p-*` - Padding (xs, sm, md, lg, xl)
- `nuvi-m-*` - Margin
- `nuvi-px-*`, `nuvi-py-*` - Directional padding
- `nuvi-mx-*`, `nuvi-my-*` - Directional margin

### Typography
- `nuvi-text-xs`, `nuvi-text-sm`, `nuvi-text-lg`, `nuvi-text-xl`, `nuvi-text-2xl`
- `nuvi-font-normal`, `nuvi-font-medium`, `nuvi-font-semibold`, `nuvi-font-bold`
- `nuvi-text-primary`, `nuvi-text-secondary`, `nuvi-text-muted`
- `nuvi-text-success`, `nuvi-text-warning`, `nuvi-text-danger`

### Layout
- `nuvi-flex`, `nuvi-inline-flex`
- `nuvi-items-center`, `nuvi-justify-between`
- `nuvi-gap-*` - Gap between flex items
- `nuvi-grid`, `nuvi-grid-cols-*`

### Display
- `nuvi-block`, `nuvi-inline`, `nuvi-inline-block`
- `nuvi-hidden`, `nuvi-visible`
- `nuvi-overflow-hidden`, `nuvi-overflow-auto`

### Borders
- `nuvi-border`, `nuvi-border-t`, `nuvi-border-b`
- `nuvi-rounded`, `nuvi-rounded-lg`, `nuvi-rounded-full`

## 🔗 Referans
Tüm componentlerin canlı örnekleri için: http://localhost:3000/nuvidesign

## 📝 Notlar
- Dashboard'da kullanılan tüm UI componentleri NuviDesign'da mevcut
- Consistent styling için her zaman `nuvi-` prefix'li class'ları kullanın
- Custom CSS yerine utility class'ları tercih edin
- Component'lerin responsive versiyonları için `nuvi-sm:`, `nuvi-md:`, `nuvi-lg:` prefix'lerini kullanın