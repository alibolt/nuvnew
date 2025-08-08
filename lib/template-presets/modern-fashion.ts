import type { TemplatePreset } from '../template-presets';

export const MODERN_FASHION_PRESET: TemplatePreset = {
  id: 'modern-fashion',
  name: 'Modern Fashion',
  description: 'Perfect for a minimal and elegant fashion store',
  category: 'fashion',
  compatibleThemes: ['cotton-yarn'], // Sadece Cotton Yarn teması ile uyumlu
  
  settings: {
    colors: {
      primary: '#000000',
      secondary: '#666666', 
      accent: '#8B0000',
      background: '#ffffff',
      text: '#333333'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    },
    spacing: {
      containerWidth: '1200px',
      sectionPadding: '80px'
    }
  },

  templates: {
    homepage: {
      name: 'Modern Fashion Homepage',
      sections: [
        // Hero Section
        {
          type: 'hero',
          settings: {
            layout: 'fullWidth',
            height: 'large',
            overlayEnabled: true,
            overlayOpacity: 20,
            contentAlignment: 'center',
            contentVerticalAlignment: 'center',
            backgroundColor: '#f8f8f8'
          },
          blocks: [
            {
              type: 'image',
              settings: {
                image: '/images/hero-fashion.jpg',
                alt: 'Yeni Sezon Koleksiyonu',
                objectFit: 'cover'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'YENİ SEZON',
                fontSize: 'sm',
                fontWeight: 'medium',
                letterSpacing: 'widest',
                textColor: '#666666',
                marginBottom: '10px'
              }
            },
            {
              type: 'text',
              settings: {
                text: '2024 İlkbahar/Yaz Koleksiyonu',
                fontSize: '4xl',
                fontWeight: 'light',
                fontFamily: 'heading',
                textColor: '#000000',
                marginBottom: '20px'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'Tarzınızı yansıtan benzersiz parçalar',
                fontSize: 'lg',
                fontWeight: 'normal',
                textColor: '#666666',
                marginBottom: '40px'
              }
            },
            {
              type: 'button',
              settings: {
                text: 'Koleksiyonu Keşfet',
                url: '/collections/yeni-sezon',
                style: 'primary',
                size: 'large',
                fullWidth: false
              }
            }
          ]
        },

        // Kategori Vitrin
        {
          type: 'collection-list',
          settings: {
            title: '',
            layout: 'grid',
            columns: 3,
            showTitle: true,
            showProductCount: false,
            imageRatio: 'portrait',
            marginTop: '0',
            marginBottom: '80px'
          },
          blocks: [
            {
              type: 'collection-item',
              settings: {
                collection: 'kadin',
                title: 'Kadın',
                image: '/images/category-women.jpg',
                buttonText: 'Alışverişe Başla'
              }
            },
            {
              type: 'collection-item',
              settings: {
                collection: 'erkek',
                title: 'Erkek',
                image: '/images/category-men.jpg',
                buttonText: 'Alışverişe Başla'
              }
            },
            {
              type: 'collection-item',
              settings: {
                collection: 'aksesuar',
                title: 'Aksesuar',
                image: '/images/category-accessories.jpg',
                buttonText: 'Alışverişe Başla'
              }
            }
          ]
        },

        // Öne Çıkan Ürünler
        {
          type: 'featured-products',
          settings: {
            title: 'Öne Çıkan Ürünler',
            titleAlignment: 'center',
            productCount: 4,
            columns: 4,
            showViewAll: true,
            viewAllText: 'Tüm Ürünleri Gör',
            viewAllUrl: '/collections/all',
            imageRatio: 'portrait',
            showProductTitle: true,
            showProductPrice: true,
            showAddToCart: true,
            marginTop: '80px',
            marginBottom: '80px'
          }
        },

        // Büyük Görsel + Metin
        {
          type: 'image-with-text',
          settings: {
            layout: 'imageLeft',
            imageWidth: '60%',
            verticalAlignment: 'middle',
            backgroundColor: '#fafafa',
            paddingTop: '0',
            paddingBottom: '0'
          },
          blocks: [
            {
              type: 'image',
              settings: {
                image: '/images/about-fashion.jpg',
                alt: 'Hakkımızda'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'HİKAYEMİZ',
                fontSize: 'sm',
                fontWeight: 'medium',
                letterSpacing: 'widest',
                textColor: '#8B0000',
                marginBottom: '20px'
              }
            },
            {
              type: 'text',
              settings: {
                text: 'Zarafet ve Konforu Bir Araya Getiriyoruz',
                fontSize: '3xl',
                fontWeight: 'light',
                fontFamily: 'heading',
                textColor: '#000000',
                marginBottom: '20px'
              }
            },
            {
              type: 'text',
              settings: {
                text: '2010 yılından beri, modern kadın ve erkeğe özel, zamansız tasarımlar sunuyoruz. Her bir parçamız, kalite ve sürdürülebilirlik ilkeleriyle üretiliyor.',
                fontSize: 'base',
                lineHeight: 'relaxed',
                textColor: '#666666',
                marginBottom: '30px'
              }
            },
            {
              type: 'button',
              settings: {
                text: 'Daha Fazla Bilgi',
                url: '/pages/hakkimizda',
                style: 'outline',
                size: 'medium'
              }
            }
          ]
        },

        // Newsletter
        {
          type: 'newsletter',
          settings: {
            title: 'Yeniliklerden Haberdar Olun',
            subtitle: 'Özel fırsatlar ve yeni koleksiyonlar için bültenimize katılın',
            layout: 'centered',
            backgroundColor: '#f8f8f8',
            paddingTop: '60px',
            paddingBottom: '60px',
            inputPlaceholder: 'E-posta adresiniz',
            buttonText: 'Kaydol',
            successMessage: 'Başarıyla kaydoldunuz!'
          }
        }
      ]
    },

    product: {
      name: 'Modern Fashion Product',
      sections: [
        // Ürün Detay
        {
          type: 'product-detail',
          settings: {
            layout: 'two-column',
            imagePosition: 'left',
            imageWidth: '60%',
            galleryLayout: 'thumbnails-bottom',
            enableZoom: true,
            stickyContent: true
          },
          blocks: [
            // Sol taraf - Galeri otomatik gelecek
            // Sağ taraf - Ürün bilgileri
            {
              type: 'product-title',
              settings: {
                fontSize: '3xl',
                fontWeight: 'light',
                fontFamily: 'heading'
              }
            },
            {
              type: 'product-price',
              settings: {
                fontSize: '2xl',
                showComparePrice: true,
                saleBadgeText: 'İndirimde'
              }
            },
            {
              type: 'product-variants',
              settings: {
                showLabel: true,
                style: 'buttons' // buttons, dropdown
              }
            },
            {
              type: 'product-form',
              settings: {
                showQuantity: true,
                addToCartText: 'Sepete Ekle',
                showBuyNow: true,
                buyNowText: 'Hemen Al'
              }
            },
            {
              type: 'product-description',
              settings: {
                truncateLength: 200,
                showReadMore: true
              }
            },
            {
              type: 'icon-group',
              settings: {
                layout: 'horizontal',
                style: 'minimal'
              },
              blocks: [
                {
                  type: 'icon-item',
                  settings: {
                    icon: 'truck',
                    title: 'Ücretsiz Kargo',
                    description: '150₺ üzeri alışverişlerde'
                  }
                },
                {
                  type: 'icon-item',
                  settings: {
                    icon: 'refresh',
                    title: 'Kolay İade',
                    description: '14 gün içinde iade'
                  }
                },
                {
                  type: 'icon-item',
                  settings: {
                    icon: 'shield',
                    title: 'Güvenli Ödeme',
                    description: '256-bit SSL koruması'
                  }
                }
              ]
            }
          ]
        },

        // Ürün Detayları (Tabs)
        {
          type: 'product-tabs',
          settings: {
            style: 'minimal',
            marginTop: '80px',
            marginBottom: '80px'
          },
          blocks: [
            {
              type: 'tab',
              settings: {
                title: 'Ürün Detayları',
                content: 'auto' // Ürün açıklamasını otomatik çeker
              }
            },
            {
              type: 'tab',
              settings: {
                title: 'Beden Tablosu',
                contentType: 'page',
                pageHandle: 'beden-tablosu'
              }
            },
            {
              type: 'tab',
              settings: {
                title: 'Bakım Önerileri',
                contentType: 'page',
                pageHandle: 'bakim-onerileri'
              }
            }
          ]
        },

        // Benzer Ürünler
        {
          type: 'product-recommendations',
          settings: {
            title: 'Benzer Ürünler',
            productCount: 4,
            columns: 4,
            algorithm: 'related' // related, bestsellers, recently-viewed
          }
        }
      ]
    },

    collection: {
      name: 'Modern Fashion Collection',
      sections: [
        // Koleksiyon Banner
        {
          type: 'collection-banner',
          settings: {
            showImage: true,
            imageHeight: 'medium',
            showTitle: true,
            showDescription: true,
            overlayOpacity: 30,
            contentAlignment: 'center'
          }
        },

        // Filtreler ve Ürünler
        {
          type: 'collection-products',
          settings: {
            layout: 'sidebar-left',
            productColumns: 3,
            productsPerPage: 12,
            showFilters: true,
            showSort: true,
            showViewOptions: true,
            imageRatio: 'portrait',
            showProductTitle: true,
            showProductPrice: true,
            showQuickView: true,
            enableInfiniteScroll: false
          }
        }
      ]
    }
  },

  globalSections: {
    announcementBar: {
      type: 'announcement-bar',
      settings: {
        text: '150₺ ve üzeri alışverişlerde ücretsiz kargo 🚚',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        link: '/pages/kargo-bilgileri',
        fontSize: 'sm',
        position: 'fixed'
      }
    },

    header: {
      type: 'header',
      settings: {
        layout: 'inline', // inline, centered, drawer
        sticky: true,
        backgroundColor: '#ffffff',
        borderBottom: true,
        padding: 'medium',
        mobileMenuStyle: 'fullscreen'
      },
      blocks: [
        {
          type: 'logo',
          settings: {
            logoWidth: 140,
            logoPosition: 'left'
          }
        },
        {
          type: 'navigation',
          settings: {
            menuHandle: 'main-menu',
            alignment: 'center',
            fontSize: 'base',
            fontWeight: 'normal',
            letterSpacing: 'wide',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'search',
          settings: {
            style: 'icon', // icon, input
            placeholder: 'Ürün ara...'
          }
        },
        {
          type: 'account',
          settings: {
            showText: false,
            loggedInText: 'Hesabım',
            loggedOutText: 'Giriş Yap'
          }
        },
        {
          type: 'wishlist',
          settings: {
            showCount: true
          }
        },
        {
          type: 'cart',
          settings: {
            style: 'icon-with-count',
            showPrice: false
          }
        }
      ]
    },

    footer: {
      type: 'footer',
      settings: {
        layout: 'multi-column',
        backgroundColor: '#fafafa',
        textColor: '#333333',
        paddingTop: '60px',
        paddingBottom: '40px',
        showSocialIcons: true,
        showPaymentIcons: true
      },
      blocks: [
        {
          type: 'footer-column',
          settings: {
            title: 'Kurumsal',
            width: '25%'
          },
          blocks: [
            {
              type: 'link',
              settings: {
                text: 'Hakkımızda',
                url: '/pages/hakkimizda'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Mağazalarımız',
                url: '/pages/magazalarimiz'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Kariyer',
                url: '/pages/kariyer'
              }
            }
          ]
        },
        {
          type: 'footer-column',
          settings: {
            title: 'Müşteri Hizmetleri',
            width: '25%'
          },
          blocks: [
            {
              type: 'link',
              settings: {
                text: 'İletişim',
                url: '/pages/iletisim'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Kargo Bilgileri',
                url: '/pages/kargo-bilgileri'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'İade ve Değişim',
                url: '/pages/iade-degisim'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'SSS',
                url: '/pages/sss'
              }
            }
          ]
        },
        {
          type: 'footer-column',
          settings: {
            title: 'Bilgi',
            width: '25%'
          },
          blocks: [
            {
              type: 'link',
              settings: {
                text: 'Beden Tablosu',
                url: '/pages/beden-tablosu'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Bakım Önerileri',
                url: '/pages/bakim-onerileri'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Gizlilik Politikası',
                url: '/pages/gizlilik-politikasi'
              }
            },
            {
              type: 'link',
              settings: {
                text: 'Kullanım Koşulları',
                url: '/pages/kullanim-kosullari'
              }
            }
          ]
        },
        {
          type: 'footer-column',
          settings: {
            title: 'Bülten',
            width: '25%'
          },
          blocks: [
            {
              type: 'text',
              settings: {
                text: 'Yeni ürünler ve kampanyalardan haberdar olmak için bültenimize kaydolun.',
                fontSize: 'sm',
                marginBottom: '15px'
              }
            },
            {
              type: 'newsletter',
              settings: {
                placeholder: 'E-posta adresiniz',
                buttonText: 'Kaydol',
                layout: 'stacked'
              }
            }
          ]
        }
      ]
    }
  }
};