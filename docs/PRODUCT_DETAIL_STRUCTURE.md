# Product Detail Section Yeni Yapı

## Mevcut Sorunlar
1. Container block'lar section seviyesinde kullanılıyor (yanlış)
2. Product Info block çok fazla bilgi içeriyor
3. Blocks'lar mantıklı gruplar halinde organize edilmiyor

## Önerilen Yapı

### Product Detail Section
```
Product Detail Section
├── Product Gallery Container
│   └── product-gallery block
├── Product Info Container
│   ├── product-vendor block
│   ├── product-title block
│   ├── product-rating block
│   ├── product-price block
│   └── product-availability block
├── Product Options Container
│   ├── product-variants block
│   └── product-form block
├── Product Meta Container
│   ├── product-sku block
│   ├── product-tags block
│   └── social-share block
└── Product Details Container
    └── product-description block
```

## Container Kullanım Prensipleri

1. **Container'lar blocks'ları gruplamak için kullanılmalı**, section'a ekstra container eklemek için değil
2. Her container'ın belirli bir amacı olmalı (Info, Options, Meta, vb.)
3. Container'lar layout kontrolü sağlamalı (horizontal/vertical, gap, alignment)

## Product Block Kategorileri

### Essential Info Blocks
- product-title
- product-price
- product-vendor
- product-rating

### Purchase Blocks  
- product-variants
- product-form (add to cart)
- product-availability

### Meta Info Blocks
- product-sku
- product-tags
- social-share

### Media Blocks
- product-gallery
- product-images

### Content Blocks
- product-description
- product-info (tabs, accordions)

## Layout Patterns

### Two Column Layout
```
[Gallery Container] | [Info Container]
                   | [Options Container]
                   | [Meta Container]
[Description Container - Full Width]
```

### Stacked Layout
```
[Gallery Container]
[Info Container]
[Options Container]
[Meta Container]
[Description Container]
```

### Split Screen Layout
```
[Gallery Container - 50%] | [All Other Containers - 50%]
```