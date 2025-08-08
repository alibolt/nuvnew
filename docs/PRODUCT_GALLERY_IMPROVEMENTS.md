# Product Gallery Block Improvements

## Overview
The Product Gallery block has been enhanced to work better with containers and provide more features for displaying product images.

## New Features

### 1. Container-Aware Behavior
- Automatically adjusts layout based on container context
- Reduces thumbnail count in narrow containers
- Adapts image sizing for better performance

### 2. Mobile Layout Options
- Separate mobile layout setting
- Options: default, stacked, carousel, grid
- Automatic switching based on screen size

### 3. Advanced Image Settings
- **Image Quality**: Control image compression (default: 90)
- **Lazy Loading**: Defer loading of thumbnails beyond the 6th image
- **Aspect Ratios**: Added wide (16:9) and ultrawide (21:9) options
- **Container-aware sizing**: Better srcset values based on container width

### 4. Zoom Functionality
- Click to zoom with full-screen modal
- Smooth transitions and backdrop blur
- Close button and click-outside to dismiss

### 5. Carousel Autoplay
- Optional autoplay for carousel layout
- Configurable interval (default: 5 seconds)
- Pauses on user interaction

### 6. Performance Optimizations
- Lazy loading for thumbnails
- Optimized image sizes based on container
- Quality settings for different image types
- Priority loading for above-the-fold images

## Settings

```javascript
{
  layout: 'thumbnails-bottom', // Layout type
  enableZoom: true,            // Enable click-to-zoom
  showThumbnails: true,        // Show thumbnail navigation
  thumbnailsPerRow: 6,         // Max thumbnails per row
  mainImageAspectRatio: 'square', // Aspect ratio
  containerAware: true,        // Adapt to container
  mobileLayout: 'stacked',     // Mobile-specific layout
  imageQuality: 90,            // JPEG quality (1-100)
  lazyLoadThumbnails: true,    // Lazy load thumbnails
  autoplay: false,             // Carousel autoplay
  autoplayInterval: 5000       // Autoplay interval (ms)
}
```

## Container Integration

When placed inside a container block:
- Automatically reduces thumbnail count to max 4 per row
- Adjusts image sizes for better loading
- Uses stacked layout in narrow containers
- Optimizes grid layout for smaller spaces

## Layout Options

1. **thumbnails-bottom**: Classic gallery with thumbnails below
2. **thumbnails-left**: Vertical thumbnail strip on left
3. **carousel**: Sliding carousel with dot indicators
4. **grid**: 2x2 grid with hero image
5. **stacked**: All images stacked vertically

## Usage Example

```json
{
  "type": "container",
  "settings": {
    "layout": "horizontal",
    "columnRatio": "50-50"
  },
  "blocks": [
    {
      "type": "product-gallery",
      "settings": {
        "layout": "thumbnails-bottom",
        "enableZoom": true,
        "containerAware": true,
        "mobileLayout": "carousel",
        "thumbnailsPerRow": 4
      }
    }
  ]
}
```

## Browser Support
- All modern browsers
- Graceful degradation for older browsers
- Touch-friendly on mobile devices