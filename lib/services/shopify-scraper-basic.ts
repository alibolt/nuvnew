export interface ShopifyScrapedData {
  store: {
    name: string;
    description: string;
    domain: string;
    logo?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  products: Array<{
    title: string;
    description: string;
    handle: string;
    productType?: string;
    vendor?: string;
    tags: string[];
    images: Array<{
      url: string;
      altText?: string;
    }>;
    variants: Array<{
      title: string;
      price: number;
      availableForSale: boolean;
      options: Array<{
        name: string;
        value: string;
      }>;
      image?: {
        url: string;
        altText?: string;
      };
    }>;
  }>;
  collections: Array<{
    title: string;
    description?: string;
    handle: string;
    image?: {
      url: string;
      altText?: string;
    };
  }>;
  pages: Array<{
    title: string;
    handle: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
  }>;
}

export async function scrapeShopifyStoreBasic(shopUrl: string): Promise<ShopifyScrapedData> {
  // Return demo data - in production, this would use a scraping service
  return {
    store: { 
      name: 'Demo Fashion Store', 
      description: 'Premium fashion and lifestyle products', 
      domain: shopUrl, 
      logo: 'https://via.placeholder.com/200x50/8B9F7E/FFFFFF?text=LOGO', 
      socialLinks: {
        facebook: 'https://facebook.com/demofashion',
        instagram: 'https://instagram.com/demofashion'
      } 
    },
    products: [
      {
        title: 'Classic T-Shirt',
        description: 'Comfortable cotton t-shirt perfect for everyday wear',
        handle: 'classic-t-shirt',
        productType: 'Apparel',
        vendor: 'Fashion Co',
        tags: ['summer', 'casual', 'cotton'],
        images: [
          {
            url: 'https://via.placeholder.com/600x800/8B9F7E/FFFFFF?text=Classic+T-Shirt',
            altText: 'Classic T-Shirt Front View'
          }
        ],
        variants: [
          {
            title: 'Small / White',
            price: 29.99,
            availableForSale: true,
            options: [
              { name: 'Size', value: 'Small' },
              { name: 'Color', value: 'White' }
            ]
          }
        ]
      },
      {
        title: 'Denim Jacket',
        description: 'Timeless denim jacket with a modern fit',
        handle: 'denim-jacket',
        productType: 'Outerwear',
        vendor: 'Denim Works',
        tags: ['denim', 'jacket', 'casual'],
        images: [
          {
            url: 'https://via.placeholder.com/600x800/4B5563/FFFFFF?text=Denim+Jacket',
            altText: 'Denim Jacket'
          }
        ],
        variants: [
          {
            title: 'Medium',
            price: 89.99,
            availableForSale: true,
            options: [{ name: 'Size', value: 'Medium' }]
          }
        ]
      }
    ],
    collections: [
      {
        title: 'Summer Collection',
        description: 'Fresh styles for the summer season',
        handle: 'summer-collection',
        image: {
          url: 'https://via.placeholder.com/800x400/FFE4B5/000000?text=Summer+Collection',
          altText: 'Summer Collection Banner'
        }
      }
    ],
    pages: [
      {
        title: 'About Us',
        handle: 'about-us',
        content: '<h1>About Our Store</h1><p>We are a premium fashion retailer dedicated to bringing you the latest styles.</p>',
        metaTitle: 'About Us - Demo Fashion Store',
        metaDescription: 'Learn more about our fashion store'
      }
    ]
  };
}