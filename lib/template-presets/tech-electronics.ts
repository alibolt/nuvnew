import type { TemplatePreset } from '../template-presets';

export const TECH_ELECTRONICS_PRESET: TemplatePreset = {
  id: 'tech-electronics',
  name: 'Tech & Electronics',
  description: 'Perfect for technology, electronics, and gadget stores',
  category: 'electronics',
  compatibleThemes: ['commerce-disabled'], // Disabled - Commerce Pro boş başlamalı
  
  settings: {
    colors: {
      primary: '#2563EB',      // Commerce Pro'nun mavi tonu
      secondary: '#64748B',    // Commerce Pro'nun gri tonu
      accent: '#F59E0B',       // Commerce Pro'nun vurgu rengi
      background: '#FFFFFF',
      text: '#1E293B'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    spacing: {
      containerWidth: '1280px',
      sectionPadding: '60px'
    }
  },

  templates: {
    homepage: {
      name: 'Tech & Electronics Homepage',
      sections: [
        // Hero Section with Tech Focus
        {
          type: 'hero-banner',
          settings: {
            title: 'Latest Tech Innovations',
            subtitle: 'Discover cutting-edge technology and smart devices',
            height: 'large',
            overlayOpacity: 30,
            textAlign: 'left',
            backgroundColor: '#1E293B',
            textColor: '#FFFFFF'
          },
          blocks: [
            {
              type: 'image',
              settings: {
                image: '/images/tech-hero.jpg',
                alt: 'Latest Technology Products',
                objectFit: 'cover'
              }
            },
            {
              type: 'heading',
              settings: {
                text: 'iPhone 15 Pro Max',
                fontSize: '5xl',
                fontWeight: 'bold',
                marginBottom: '10px'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'Experience the future of mobile technology',
                fontSize: 'xl',
                marginBottom: '30px'
              }
            },
            {
              type: 'button',
              settings: {
                text: 'Shop Now',
                url: '/products/iphone-15-pro-max',
                style: 'primary',
                size: 'large'
              }
            },
            {
              type: 'button',
              settings: {
                text: 'View All Smartphones',
                url: '/collections/smartphones',
                style: 'secondary',
                size: 'large'
              }
            }
          ]
        },

        // Category Showcase
        {
          type: 'collection-list',
          settings: {
            title: 'Shop by Category',
            layout: 'grid',
            columns: 4,
            showTitle: true,
            showProductCount: true,
            imageRatio: 'square',
            marginTop: '60px',
            marginBottom: '60px'
          },
          blocks: [
            {
              type: 'collection-item',
              settings: {
                collection: 'smartphones',
                title: 'Smartphones',
                image: '/images/category-phones.jpg',
                buttonText: 'Shop Now'
              }
            },
            {
              type: 'collection-item',
              settings: {
                collection: 'laptops',
                title: 'Laptops & Computers',
                image: '/images/category-laptops.jpg',
                buttonText: 'Shop Now'
              }
            },
            {
              type: 'collection-item',
              settings: {
                collection: 'audio',
                title: 'Audio & Headphones',
                image: '/images/category-audio.jpg',
                buttonText: 'Shop Now'
              }
            },
            {
              type: 'collection-item',
              settings: {
                collection: 'gaming',
                title: 'Gaming',
                image: '/images/category-gaming.jpg',
                buttonText: 'Shop Now'
              }
            }
          ]
        },

        // Featured Products
        {
          type: 'featured-products',
          settings: {
            title: 'Best Sellers',
            subtitle: 'Our most popular tech products',
            productCount: 8,
            columns: 4,
            showViewAll: true,
            viewAllText: 'View All Products',
            viewAllUrl: '/collections/all',
            imageRatio: 'square',
            showProductTitle: true,
            showProductPrice: true,
            showAddToCart: true,
            showQuickView: true,
            showWishlist: true,
            marginTop: '60px',
            marginBottom: '60px'
          }
        },

        // Promotional Banner
        {
          type: 'image-with-text',
          settings: {
            layout: 'imageRight',
            imageWidth: '50%',
            verticalAlignment: 'middle',
            backgroundColor: '#F8FAFC',
            paddingTop: '60px',
            paddingBottom: '60px'
          },
          blocks: [
            {
              type: 'image',
              settings: {
                image: '/images/gaming-setup.jpg',
                alt: 'Ultimate Gaming Setup'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'GAMING ZONE',
                fontSize: 'sm',
                fontWeight: 'semibold',
                letterSpacing: 'widest',
                textColor: '#F59E0B',
                marginBottom: '20px'
              }
            },
            {
              type: 'heading',
              settings: {
                text: 'Build Your Ultimate Gaming Setup',
                fontSize: '3xl',
                fontWeight: 'bold',
                marginBottom: '20px'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'From high-performance PCs to gaming peripherals, we have everything you need to dominate the game.',
                fontSize: 'lg',
                lineHeight: 'relaxed',
                textColor: '#64748B',
                marginBottom: '30px'
              }
            },
            {
              type: 'button',
              settings: {
                text: 'Explore Gaming',
                url: '/collections/gaming',
                style: 'primary',
                size: 'large'
              }
            }
          ]
        },

        // New Arrivals
        {
          type: 'featured-products',
          settings: {
            title: 'New Arrivals',
            subtitle: 'Latest additions to our tech collection',
            productCount: 4,
            columns: 4,
            showViewAll: true,
            viewAllText: 'View All New Products',
            viewAllUrl: '/collections/new-arrivals',
            imageRatio: 'portrait',
            marginTop: '60px',
            marginBottom: '60px'
          }
        },

        // Trust & Service section removed

        // Newsletter
        {
          type: 'newsletter',
          settings: {
            title: 'Stay Updated with Tech News',
            subtitle: 'Get exclusive deals and be the first to know about new products',
            layout: 'centered',
            backgroundColor: '#1E293B',
            textColor: '#FFFFFF',
            paddingTop: '60px',
            paddingBottom: '60px',
            inputPlaceholder: 'Enter your email',
            buttonText: 'Subscribe',
            successMessage: 'Thanks for subscribing!'
          }
        }
      ]
    },

    product: {
      name: 'Tech Product Page',
      sections: [
        // Product Detail Section
        {
          type: 'product',
          settings: {
            layout: 'two-column',
            imagePosition: 'left',
            imageWidth: '60%',
            galleryLayout: 'thumbnails-left',
            enableZoom: true,
            stickyContent: true,
            showShare: true,
            showReviews: true
          },
          blocks: [
            {
              type: 'product-title',
              settings: {
                fontSize: '3xl',
                fontWeight: 'bold'
              }
            },
            // Vendor is part of product-title block settings
            {
              type: 'rating-stars',
              settings: {
                showCount: true
              }
            },
            {
              type: 'price',
              settings: {
                fontSize: '2xl',
                showComparePrice: true,
                saleBadgeText: 'Sale'
              }
            },
            // Separator removed - not a valid block type
            {
              type: 'variant-picker',
              settings: {
                showLabel: true,
                style: 'buttons'
              }
            },
            {
              type: 'quantity-selector',
              settings: {
                showLabel: true
              }
            },
            {
              type: 'buy-buttons',
              settings: {
                showQuantity: false,
                addToCartText: 'Add to Cart',
                showBuyNow: true,
                buyNowText: 'Buy It Now'
              }
            },
            {
              type: 'description',
              settings: {
                truncateLength: 0,
                showReadMore: false
              }
            },
            {
              type: 'share',
              settings: {
                shareLabel: 'Share:',
                showFacebook: true,
                showTwitter: true,
                showPinterest: true
              }
            }
          ]
        },

        // Product Information Tabs
        {
          type: 'tabs',
          settings: {
            style: 'tabs',
            marginTop: '60px',
            marginBottom: '60px'
          },
          blocks: [
            {
              type: 'tab',
              settings: {
                title: 'Technical Specifications',
                content: 'auto',
                icon: 'list'
              }
            },
            {
              type: 'tab',
              settings: {
                title: 'What\'s in the Box',
                content: 'custom',
                icon: 'package',
                customContent: 'Complete package contents listed here'
              }
            },
            {
              type: 'tab',
              settings: {
                title: 'Warranty & Support',
                content: 'page',
                icon: 'shield',
                pageHandle: 'warranty-support'
              }
            },
            {
              type: 'tab',
              settings: {
                title: 'Shipping & Returns',
                content: 'page',
                icon: 'truck',
                pageHandle: 'shipping-returns'
              }
            }
          ]
        },

        // Related Products
        {
          type: 'related-products',
          settings: {
            title: 'You May Also Like',
            productCount: 4,
            columns: 4
          }
        },

        // Recently Viewed
        {
          type: 'recently-viewed',
          settings: {
            title: 'Recently Viewed',
            productCount: 4,
            columns: 4
          }
        }
      ]
    },

    collection: {
      name: 'Tech Collection Page',
      sections: [
        // Hero Banner for Collection
        {
          type: 'hero',
          settings: {
            title: 'Collection Title',
            subtitle: 'Browse our tech collection',
            height: 'small',
            textAlign: 'center',
            backgroundColor: '#1E293B',
            textColor: '#FFFFFF'
          }
        },

        // Featured Products from Collection
        {
          type: 'featured-products',
          settings: {
            title: '',
            productCount: 24,
            columns: 3,
            showViewAll: false,
            imageRatio: 'square',
            showProductTitle: true,
            showProductPrice: true,
            showQuickView: true,
            showAddToCart: true,
            marginTop: '40px',
            marginBottom: '40px'
          }
        }
      ]
    }
  },

  globalSections: {
    // Announcement bar removed
    
    header: {
      type: 'header',
      settings: {
        layout: 'inline',
        sticky: true,
        backgroundColor: '#FFFFFF',
        borderBottom: true,
        padding: 'medium',
        mobileMenuStyle: 'drawer'
      },
      blocks: [
        {
          type: 'logo',
          settings: {
            logoWidth: 150,
            logoPosition: 'left'
          }
        },
        {
          type: 'navigation',
          settings: {
            menuHandle: 'main-menu',
            alignment: 'center',
            fontSize: 'base',
            fontWeight: 'medium',
            textTransform: 'none'
          }
        },
        {
          type: 'search',
          settings: {
            style: 'input',
            placeholder: 'Search for products...',
            showIcon: true
          }
        },
        {
          type: 'account',
          settings: {
            showText: true,
            loggedInText: 'Account',
            loggedOutText: 'Login'
          }
        },
        {
          type: 'wishlist',
          settings: {
            showCount: true,
            showText: false
          }
        },
        {
          type: 'cart',
          settings: {
            style: 'icon-with-count',
            showPrice: true
          }
        }
      ]
    },

    footer: {
      type: 'footer',
      settings: {
        layout: 'multi-column',
        backgroundColor: '#1E293B',
        textColor: '#E2E8F0',
        paddingTop: '60px',
        paddingBottom: '40px',
        showSocialIcons: true,
        showPaymentIcons: true,
        showNewsletter: true
      },
      blocks: [
        {
          type: 'footer-column',
          settings: {
            title: 'Shop',
            width: '20%'
          },
          blocks: [
            {
              type: 'link',
              settings: {
                text: 'Smartphones',
                url: '/collections/smartphones'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Laptops',
                url: '/collections/laptops'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Audio',
                url: '/collections/audio'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Gaming',
                url: '/collections/gaming'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Accessories',
                url: '/collections/accessories'
              }
            }
          ]
        },
        {
          type: 'footer-column',
          settings: {
            title: 'Customer Service',
            width: '20%'
          },
          blocks: [
            {
              type: 'link',
              settings: {
                text: 'Contact Us',
                url: '/pages/contact'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Shipping Policy',
                url: '/pages/shipping-policy'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Returns & Exchanges',
                url: '/pages/returns'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Warranty',
                url: '/pages/warranty'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'FAQs',
                url: '/pages/faq'
              }
            }
          ]
        },
        {
          type: 'footer-column',
          settings: {
            title: 'Company',
            width: '20%'
          },
          blocks: [
            {
              type: 'link',
              settings: {
                text: 'About Us',
                url: '/pages/about'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Careers',
                url: '/pages/careers'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Press',
                url: '/pages/press'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Affiliate Program',
                url: '/pages/affiliate'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Corporate Sales',
                url: '/pages/corporate'
              }
            }
          ]
        },
        {
          type: 'footer-column',
          settings: {
            title: 'Connect',
            width: '40%'
          },
          blocks: [
            {
              type: 'text',
              settings: {
                text: 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.',
                fontSize: 'sm',
                marginBottom: '20px'
              }
            },
            {
              type: 'newsletter',
              settings: {
                placeholder: 'Enter your email',
                buttonText: 'Subscribe',
                layout: 'horizontal'
              }
            },
            {
              type: 'social-icons',
              settings: {
                title: 'Follow Us',
                showFacebook: true,
                showTwitter: true,
                showInstagram: true,
                showYoutube: true,
                showTiktok: true,
                iconSize: 'medium',
                marginTop: '20px'
              }
            }
          ]
        },
        {
          type: 'footer-bottom',
          settings: {
            copyrightText: '© 2024 Tech Store. All rights reserved.',
            showPaymentIcons: true,
            paymentIcons: ['visa', 'mastercard', 'amex', 'paypal', 'apple-pay', 'google-pay']
          }
        }
      ]
    }
  }
};