import type { TemplatePreset } from '../template-presets';

export const LUXURY_FASHION_PRESET: TemplatePreset = {
  id: 'luxury-fashion',
  name: 'Luxury Fashion',
  description: 'Sophisticated design for high-end fashion boutiques',
  category: 'fashion',
  compatibleThemes: ['cotton-yarn'], // Cotton Yarn teması ile uyumlu
  
  settings: {
    colors: {
      primary: '#2c3e50',      // Cotton Yarn'ın koyu mavi tonu
      secondary: '#8b7355',    // Cotton Yarn'ın kahve tonu
      accent: '#d4a574',       // Cotton Yarn'ın vurgu rengi
      background: '#faf8f5',   // Cotton Yarn'ın krem arka planı
      text: '#2c3e50'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato'
    },
    spacing: {
      containerWidth: '1280px',
      sectionPadding: '80px'
    }
  },

  templates: {
    homepage: {
      name: 'Luxury Fashion Homepage',
      sections: [
        // Elegant Hero
        {
          type: 'hero',
          settings: {
            layout: 'fullWidth',
            height: 'fullscreen',
            overlayEnabled: true,
            overlayOpacity: 20,
            contentAlignment: 'center',
            contentVerticalAlignment: 'center',
            backgroundColor: '#faf8f5'
          },
          blocks: [
            {
              type: 'image',
              settings: {
                image: '/images/luxury-hero.jpg',
                alt: 'New Collection',
                objectFit: 'cover'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'AUTUMN/WINTER 2024',
                fontSize: 'sm',
                fontWeight: 'light',
                letterSpacing: 'widest',
                textColor: '#8b7355',
                marginBottom: '20px'
              }
            },
            {
              type: 'heading',
              settings: {
                text: 'Timeless Elegance',
                fontSize: '5xl',
                fontWeight: 'light',
                fontFamily: 'heading',
                textColor: '#2c3e50',
                marginBottom: '20px'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'Discover our curated collection of luxury essentials',
                fontSize: 'lg',
                fontWeight: 'light',
                textColor: '#6c757d',
                marginBottom: '40px'
              }
            },
            {
              type: 'button',
              settings: {
                text: 'Explore Collection',
                url: '/collections/new-arrivals',
                style: 'primary',
                size: 'large'
              }
            }
          ]
        },

        // Collection Grid
        {
          type: 'collection-list',
          settings: {
            title: '',
            layout: 'grid',
            columns: 3,
            showTitle: true,
            showProductCount: false,
            imageRatio: 'tall',
            marginTop: '0',
            marginBottom: '80px'
          },
          blocks: [
            {
              type: 'collection-item',
              settings: {
                collection: 'women',
                title: 'Women',
                image: '/images/collection-women.jpg',
                buttonText: 'Shop Women'
              }
            },
            {
              type: 'collection-item',
              settings: {
                collection: 'men',
                title: 'Men',
                image: '/images/collection-men.jpg',
                buttonText: 'Shop Men'
              }
            },
            {
              type: 'collection-item',
              settings: {
                collection: 'accessories',
                title: 'Accessories',
                image: '/images/collection-accessories.jpg',
                buttonText: 'Shop Accessories'
              }
            }
          ]
        },

        // Editorial Content
        {
          type: 'image-with-text',
          settings: {
            layout: 'imageLeft',
            imageWidth: '60%',
            verticalAlignment: 'middle',
            backgroundColor: '#ffffff',
            paddingTop: '80px',
            paddingBottom: '80px'
          },
          blocks: [
            {
              type: 'image',
              settings: {
                image: '/images/craftsmanship.jpg',
                alt: 'Craftsmanship'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'CRAFTSMANSHIP',
                fontSize: 'xs',
                fontWeight: 'light',
                letterSpacing: 'widest',
                textColor: '#d4a574',
                marginBottom: '20px'
              }
            },
            {
              type: 'heading',
              settings: {
                text: 'Made with Passion',
                fontSize: '3xl',
                fontWeight: 'normal',
                fontFamily: 'heading',
                textColor: '#2c3e50',
                marginBottom: '20px'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'Each piece in our collection is carefully crafted by skilled artisans using the finest materials. From sustainable fabrics to ethical production, we believe in creating fashion that lasts.',
                fontSize: 'base',
                lineHeight: 'relaxed',
                textColor: '#6c757d',
                marginBottom: '30px'
              }
            },
            {
              type: 'button',
              settings: {
                text: 'Our Story',
                url: '/pages/about',
                style: 'secondary',
                size: 'medium'
              }
            }
          ]
        },

        // Featured Products
        {
          type: 'featured-products',
          settings: {
            title: 'Signature Pieces',
            titleAlignment: 'center',
            productCount: 4,
            columns: 4,
            showViewAll: true,
            viewAllText: 'View All',
            viewAllUrl: '/collections/signature',
            imageRatio: 'tall',
            showProductTitle: true,
            showProductPrice: true,
            showAddToCart: false,
            marginTop: '80px',
            marginBottom: '80px'
          }
        },

        // Testimonials
        {
          type: 'testimonials',
          settings: {
            title: 'What Our Clients Say',
            layout: 'carousel',
            autoplay: true,
            backgroundColor: '#faf8f5',
            paddingTop: '80px',
            paddingBottom: '80px'
          },
          blocks: [
            {
              type: 'testimonial',
              settings: {
                quote: 'The quality is exceptional. Each piece feels like it was made just for me.',
                author: 'Sarah M.',
                rating: 5
              }
            },
            {
              type: 'testimonial',
              settings: {
                quote: 'Timeless designs that I know I\'ll wear for years to come.',
                author: 'Emma L.',
                rating: 5
              }
            },
            {
              type: 'testimonial',
              settings: {
                quote: 'Exceptional service and beautiful packaging. A true luxury experience.',
                author: 'James K.',
                rating: 5
              }
            }
          ]
        },

        // Instagram Feed
        {
          type: 'instagram-feed',
          settings: {
            title: 'Follow @luxuryfashion',
            subtitle: 'Share your style with #LuxuryFashion',
            feedToken: '',
            columns: 6,
            rows: 1,
            marginTop: '80px',
            marginBottom: '0'
          }
        }
      ]
    },

    product: {
      name: 'Luxury Product Page',
      sections: [
        {
          type: 'product',
          settings: {
            layout: 'two-column',
            imagePosition: 'left',
            imageWidth: '60%',
            galleryLayout: 'thumbnails-bottom',
            enableZoom: true,
            stickyContent: true
          },
          blocks: [
            {
              type: 'breadcrumbs',
              settings: {}
            },
            {
              type: 'product-title',
              settings: {
                fontSize: '2xl',
                fontWeight: 'light',
                fontFamily: 'heading'
              }
            },
            {
              type: 'price',
              settings: {
                fontSize: 'xl',
                showComparePrice: true
              }
            },
            // Separator removed - not a valid block type
            {
              type: 'description',
              settings: {
                truncateLength: 200,
                showReadMore: true
              }
            },
            {
              type: 'variant-picker',
              settings: {
                showLabel: true,
                style: 'buttons'
              }
            },
            // Size guide removed - not a valid block type
            {
              type: 'buy-buttons',
              settings: {
                showQuantity: true,
                addToCartText: 'Add to Bag',
                showBuyNow: false
              }
            },
            {
              type: 'accordion',
              settings: {
                title: 'Details & Care',
                content: 'auto'
              }
            },
            {
              type: 'accordion',
              settings: {
                title: 'Shipping & Returns',
                contentType: 'page',
                pageHandle: 'shipping-returns'
              }
            },
            {
              type: 'share',
              settings: {
                shareLabel: 'Share',
                showFacebook: true,
                showTwitter: true,
                showPinterest: true
              }
            }
          ]
        },

        // Complete the look
        {
          type: 'product-recommendations',
          settings: {
            title: 'Complete the Look',
            algorithm: 'complementary',
            productCount: 3,
            columns: 3
          }
        }
      ]
    },

    collection: {
      name: 'Luxury Collection Page',
      sections: [
        {
          type: 'hero',
          settings: {
            title: 'Collection Title',
            subtitle: 'Discover our curated collection',
            height: 'small',
            textAlign: 'left',
            backgroundColor: '#faf8f5',
            textColor: '#2c3e50'
          }
        },

        {
          type: 'featured-products',
          settings: {
            title: '',
            productCount: 18,
            columns: 3,
            showViewAll: false,
            imageRatio: 'tall',
            showProductTitle: true,
            showProductPrice: true,
            showQuickView: true,
            enableInfiniteScroll: false,
            marginTop: '40px',
            marginBottom: '40px'
          }
        }
      ]
    }
  },

  globalSections: {
    announcementBar: {
      type: 'announcement-bar',
      settings: {
        text: 'Complimentary shipping on all orders',
        backgroundColor: '#2c3e50',
        textColor: '#ffffff',
        fontSize: 'sm',
        position: 'relative'
      }
    },

    header: {
      type: 'header',
      settings: {
        layout: 'centered',
        sticky: true,
        backgroundColor: '#ffffff',
        borderBottom: true,
        padding: 'large'
      },
      blocks: [
        {
          type: 'logo',
          settings: {
            logoWidth: 180,
            logoPosition: 'center'
          }
        },
        {
          type: 'navigation',
          settings: {
            menuHandle: 'main-menu',
            alignment: 'center',
            fontSize: 'sm',
            fontWeight: 'light',
            letterSpacing: 'wide',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'icon-group',
          settings: {
            position: 'right',
            spacing: 'medium'
          },
          blocks: [
            {
              type: 'search',
              settings: {
                style: 'icon'
              }
            },
            {
              type: 'account',
              settings: {
                showText: false
              }
            },
            {
              type: 'wishlist',
              settings: {
                showCount: false
              }
            },
            {
              type: 'cart',
              settings: {
                style: 'icon',
                showCount: true
              }
            }
          ]
        }
      ]
    },

    footer: {
      type: 'footer',
      settings: {
        layout: 'multi-column',
        backgroundColor: '#2c3e50',
        textColor: '#faf8f5',
        paddingTop: '80px',
        paddingBottom: '40px',
        showSocialIcons: true,
        showPaymentIcons: false
      },
      blocks: [
        {
          type: 'footer-column',
          settings: {
            title: 'Customer Care',
            width: '25%'
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
                text: 'Shipping & Returns',
                url: '/pages/shipping-returns'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Size Guide',
                url: '/pages/size-guide'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Care Instructions',
                url: '/pages/care-instructions'
              }
            }
          ]
        },
        {
          type: 'footer-column',
          settings: {
            title: 'About',
            width: '25%'
          },
          blocks: [
            {
              type: 'link',
              settings: {
                text: 'Our Story',
                url: '/pages/about'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Sustainability',
                url: '/pages/sustainability'
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
                text: 'Careers',
                url: '/pages/careers'
              }
            }
          ]
        },
        {
          type: 'footer-column',
          settings: {
            title: 'Connect',
            width: '50%'
          },
          blocks: [
            {
              type: 'text',
              settings: {
                text: 'Subscribe for exclusive access to new collections and private sales.',
                fontSize: 'sm',
                marginBottom: '20px'
              }
            },
            {
              type: 'newsletter',
              settings: {
                placeholder: 'Your email',
                buttonText: 'Subscribe',
                layout: 'horizontal'
              }
            },
            {
              type: 'social-icons',
              settings: {
                showFacebook: true,
                showInstagram: true,
                showPinterest: true,
                iconSize: 'small',
                marginTop: '30px'
              }
            }
          ]
        },
        {
          type: 'footer-bottom',
          settings: {
            copyrightText: '© 2024 Luxury Fashion. All rights reserved.',
            showLinks: true,
            links: [
              { text: 'Privacy Policy', url: '/pages/privacy' },
              { text: 'Terms of Service', url: '/pages/terms' }
            ]
          }
        }
      ]
    }
  }
};