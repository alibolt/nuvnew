import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
// Removed schema import to simplify

// GET /api/stores/[subdomain]/sections/available
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Define available sections manually for now
    const availableSections = [
      {
        id: 'hero',
        type: 'hero',
        name: 'Hero',
        description: 'Large hero section with image and text',
        category: 'hero',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'hero-banner',
        type: 'hero-banner',
        name: 'Hero Banner',
        description: 'Full-width banner with overlay text',
        category: 'hero',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'collection-list',
        type: 'collection-list',
        name: 'Collection List',
        description: 'Display a list of collections',
        category: 'product',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'featured-products',
        type: 'featured-products',
        name: 'Featured Products',
        description: 'Showcase featured products',
        category: 'product',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'image-with-text',
        type: 'image-with-text',
        name: 'Image with Text',
        description: 'Image and text side by side',
        category: 'content',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'newsletter',
        type: 'newsletter',
        name: 'Newsletter',
        description: 'Email signup form',
        category: 'marketing',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        name: 'Testimonials',
        description: 'Customer testimonials',
        category: 'social',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'rich-text',
        type: 'rich-text',
        name: 'Rich Text',
        description: 'Rich text content',
        category: 'content',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'contact-form',
        type: 'contact-form',
        name: 'Contact Form',
        description: 'Contact form',
        category: 'marketing',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'countdown',
        type: 'countdown',
        name: 'Countdown Timer',
        description: 'Countdown to a specific date',
        category: 'marketing',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'logo-list',
        type: 'logo-list',
        name: 'Logo List',
        description: 'Display partner or brand logos',
        category: 'social',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'announcement-bar',
        type: 'announcement-bar',
        name: 'Announcement Bar',
        description: 'Top bar for announcements and promotions',
        category: 'header',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'header',
        type: 'header',
        name: 'Header',
        description: 'Site header with navigation',
        category: 'header',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'footer',
        type: 'footer',
        name: 'Footer',
        description: 'Site footer with links and information',
        category: 'footer',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'product-categories',
        type: 'product-categories',
        name: 'Product Categories',
        description: 'Display product categories grid',
        category: 'product',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'best-sellers',
        type: 'best-sellers',
        name: 'Best Sellers',
        description: 'Show best selling products',
        category: 'product',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'collections',
        type: 'collections',
        name: 'Collections',
        description: 'Display product collections',
        category: 'product',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'recently-viewed',
        type: 'recently-viewed',
        name: 'Recently Viewed',
        description: 'Show recently viewed products',
        category: 'product',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'related-products',
        type: 'related-products',
        name: 'Related Products',
        description: 'Display related products',
        category: 'product',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'product-recommendations',
        type: 'product-recommendations',
        name: 'Product Recommendations',
        description: 'AI-powered product recommendations',
        category: 'product',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'instagram-feed',
        type: 'instagram-feed',
        name: 'Instagram Feed',
        description: 'Display Instagram posts',
        category: 'social',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'product',
        type: 'product',
        name: 'Product Detail',
        description: 'Product detail section',
        category: 'product',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'cart',
        type: 'cart',
        name: 'Shopping Cart',
        description: 'Shopping cart section',
        category: 'commerce',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'login-form',
        type: 'login-form',
        name: 'Login Form',
        description: 'User login form',
        category: 'account',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'register-form',
        type: 'register-form',
        name: 'Register Form',
        description: 'User registration form',
        category: 'account',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'search-header',
        type: 'search-header',
        name: 'Search Header',
        description: 'Search bar with result count',
        category: 'search',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'search-filters',
        type: 'search-filters',
        name: 'Search Filters',
        description: 'Filter options for search results',
        category: 'search',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'search-results',
        type: 'search-results',
        name: 'Search Results',
        description: 'Grid of search results',
        category: 'search',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'search-suggestions',
        type: 'search-suggestions',
        name: 'Search Suggestions',
        description: 'Popular search suggestions',
        category: 'search',
        icon: 'Square',
        presets: [],
        settings: []
      },
      {
        id: 'trending-products',
        type: 'trending-products',
        name: 'Trending Products',
        description: 'Display trending products',
        category: 'search',
        icon: 'Square',
        presets: [],
        settings: []
      }
    ];

    // Sort by category and name
    availableSections.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });

    return apiResponse.success(availableSections);
  } catch (error) {
    return handleApiError(error, 'available-sections');
  }
}