// Industry template definitions
export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  features: string[];
  menuStructure: any[];
  collections: any[];
  sampleProducts: any[];
  themeSettings?: any;
}

export const industryTemplates: IndustryTemplate[] = [
  {
    id: 'textile-yarn',
    name: 'Textile & Yarn Store',
    description: 'Perfect for yarn shops, fabric stores, and textile businesses',
    icon: '🧵',
    available: true,
    features: [
      'Yarn weight categories',
      'Fiber content filtering',
      'Color swatch display',
      'Pattern suggestions',
      'Wholesale pricing options'
    ],
    menuStructure: [
      {
        label: 'Shop by Type',
        link: '/collections',
        children: [
          { label: 'Yarns', link: '/collections/yarns' },
          { label: 'Fabrics', link: '/collections/fabrics' },
          { label: 'Threads', link: '/collections/threads' },
          { label: 'Notions', link: '/collections/notions' }
        ]
      },
      {
        label: 'By Material',
        link: '#',
        children: [
          {
            label: 'Natural Fibers',
            link: '/collections/natural-fibers',
            children: [
              { label: 'Cotton', link: '/collections/cotton' },
              { label: 'Wool', link: '/collections/wool' },
              { label: 'Silk', link: '/collections/silk' },
              { label: 'Linen', link: '/collections/linen' }
            ]
          },
          {
            label: 'Synthetic Fibers',
            link: '/collections/synthetic-fibers',
            children: [
              { label: 'Acrylic', link: '/collections/acrylic' },
              { label: 'Polyester', link: '/collections/polyester' },
              { label: 'Nylon', link: '/collections/nylon' }
            ]
          },
          {
            label: 'Blended Fibers',
            link: '/collections/blended-fibers',
            children: [
              { label: 'Cotton Blends', link: '/collections/cotton-blends' },
              { label: 'Wool Blends', link: '/collections/wool-blends' }
            ]
          }
        ]
      },
      {
        label: 'Patterns',
        link: '/pages/patterns'
      },
      {
        label: 'Wholesale',
        link: '/pages/wholesale'
      }
    ],
    collections: [
      {
        name: 'Yarns',
        handle: 'yarns',
        description: 'Premium quality yarns for all your projects'
      },
      {
        name: 'Fabrics',
        handle: 'fabrics',
        description: 'Beautiful fabrics for sewing and crafting'
      },
      {
        name: 'Natural Fibers',
        handle: 'natural-fibers',
        description: '100% natural fiber products'
      },
      {
        name: 'Cotton',
        handle: 'cotton',
        description: 'Soft and breathable cotton yarns and fabrics'
      },
      {
        name: 'Wool',
        handle: 'wool',
        description: 'Warm and cozy wool products'
      },
      {
        name: 'Sale Items',
        handle: 'sale',
        description: 'Discounted yarns and fabrics'
      }
    ],
    sampleProducts: [
      {
        name: 'Merino Wool Yarn - Soft Blue',
        price: 12.99,
        description: 'Premium 100% merino wool yarn, perfect for sweaters and scarves',
        category: 'yarns',
        collections: ['yarns', 'wool', 'natural-fibers'],
        variants: [
          { name: 'Light (50g)', price: 12.99 },
          { name: 'Medium (100g)', price: 24.99 },
          { name: 'Bulk (500g)', price: 119.99 }
        ],
        images: ['yarn-merino-blue-1.jpg', 'yarn-merino-blue-2.jpg']
      },
      {
        name: 'Cotton Fabric - Floral Print',
        price: 8.99,
        description: 'Soft cotton fabric with beautiful floral design, 44" wide',
        category: 'fabrics',
        collections: ['fabrics', 'cotton', 'natural-fibers'],
        variants: [
          { name: 'By the Yard', price: 8.99 },
          { name: '5 Yards', price: 42.99 },
          { name: '10 Yards', price: 79.99 }
        ]
      },
      {
        name: 'Acrylic Yarn Bundle - Rainbow Colors',
        price: 34.99,
        description: 'Set of 12 vibrant acrylic yarns, machine washable',
        category: 'yarns',
        collections: ['yarns', 'acrylic', 'synthetic-fibers', 'sale'],
        originalPrice: 44.99
      },
      {
        name: 'Silk Thread Set - Embroidery',
        price: 28.99,
        description: 'Premium silk embroidery threads, 24 colors',
        category: 'threads',
        collections: ['threads', 'silk', 'natural-fibers']
      },
      {
        name: 'Bamboo Knitting Needles Set',
        price: 32.99,
        description: 'Complete set of bamboo knitting needles, sizes 0-15',
        category: 'notions',
        collections: ['notions']
      }
    ],
    themeSettings: {
      colors: {
        primary: '#8B4513', // Saddle Brown
        secondary: '#DEB887', // Burlywood
        accent: '#4682B4' // Steel Blue
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Inter'
      }
    }
  },
  // Placeholder for future industries
  {
    id: 'fashion-clothing',
    name: 'Fashion & Clothing',
    description: 'Modern fashion store with size guides and lookbooks',
    icon: '👗',
    available: false,
    features: ['Coming soon'],
    menuStructure: [],
    collections: [],
    sampleProducts: []
  },
  {
    id: 'electronics',
    name: 'Electronics & Tech',
    description: 'Tech store with specs comparison and warranty info',
    icon: '💻',
    available: false,
    features: ['Coming soon'],
    menuStructure: [],
    collections: [],
    sampleProducts: []
  },
  {
    id: 'beauty-cosmetics',
    name: 'Beauty & Cosmetics',
    description: 'Beauty store with shade finders and tutorials',
    icon: '💄',
    available: false,
    features: ['Coming soon'],
    menuStructure: [],
    collections: [],
    sampleProducts: []
  },
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    description: 'Gourmet food store with recipes and pairings',
    icon: '🍽️',
    available: false,
    features: ['Coming soon'],
    menuStructure: [],
    collections: [],
    sampleProducts: []
  },
  {
    id: 'home-garden',
    name: 'Home & Garden',
    description: 'Home decor and garden supplies store',
    icon: '🏡',
    available: false,
    features: ['Coming soon'],
    menuStructure: [],
    collections: [],
    sampleProducts: []
  }
];