import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, Calendar, Clock, User, ChevronRight, 
  Search, TrendingUp, Lightbulb, ShoppingBag, Megaphone
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nuvi Blog - E-commerce Tips, Guides & Industry Insights',
  description: 'Learn how to grow your online business with expert e-commerce tips, marketing strategies, and success stories from the Nuvi blog.',
  keywords: 'e-commerce blog, online store tips, e-commerce guides, marketing strategies, business growth, nuvi blog',
  openGraph: {
    title: 'Nuvi Blog - Your Guide to E-commerce Success',
    description: 'Expert insights and practical tips to help you build and grow your online store.',
    type: 'website',
    url: 'https://nuvi.com/blog',
  },
  alternates: {
    canonical: 'https://nuvi.com/blog',
  },
};

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: '10 Essential SEO Tips for E-commerce Stores in 2025',
    excerpt: 'Boost your online store\'s visibility with these proven SEO strategies. Learn how to optimize product pages, improve site speed, and rank higher on Google.',
    category: 'SEO & Marketing',
    author: 'Sarah Chen',
    date: '2025-01-20',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=400&fit=crop',
    slug: 'essential-seo-tips-ecommerce-2025',
    featured: true,
  },
  {
    id: 2,
    title: 'How to Create Product Descriptions That Convert',
    excerpt: 'Master the art of writing compelling product descriptions that turn browsers into buyers. Includes AI-powered tips and real examples.',
    category: 'Conversion',
    author: 'Michael Torres',
    date: '2025-01-18',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    slug: 'product-descriptions-that-convert',
  },
  {
    id: 3,
    title: 'The Ultimate Guide to Instagram Shopping',
    excerpt: 'Turn your Instagram followers into customers. Learn how to set up Instagram Shopping, create shoppable posts, and drive sales from social media.',
    category: 'Social Commerce',
    author: 'Lisa Anderson',
    date: '2025-01-15',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=400&fit=crop',
    slug: 'ultimate-guide-instagram-shopping',
  },
  {
    id: 4,
    title: 'Building Customer Loyalty: 5 Strategies That Work',
    excerpt: 'Discover proven strategies to turn one-time buyers into loyal customers. From rewards programs to personalized experiences.',
    category: 'Customer Success',
    author: 'Emma Wilson',
    date: '2025-01-12',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    slug: 'building-customer-loyalty-strategies',
  },
  {
    id: 5,
    title: 'E-commerce Trends to Watch in 2025',
    excerpt: 'Stay ahead of the competition with these emerging e-commerce trends. From AI personalization to sustainable shopping.',
    category: 'Industry Insights',
    author: 'David Kim',
    date: '2025-01-10',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=400&fit=crop',
    slug: 'ecommerce-trends-2025',
  },
  {
    id: 6,
    title: 'How to Price Your Products for Maximum Profit',
    excerpt: 'Learn pricing strategies that balance competitiveness with profitability. Includes psychological pricing tips and competitor analysis.',
    category: 'Business Strategy',
    author: 'Ali Özkan',
    date: '2025-01-08',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
    slug: 'product-pricing-strategies',
  },
];

const categories = [
  { name: 'All Posts', icon: BookOpen, count: 156 },
  { name: 'SEO & Marketing', icon: TrendingUp, count: 42 },
  { name: 'Business Strategy', icon: Lightbulb, count: 38 },
  { name: 'Social Commerce', icon: Megaphone, count: 31 },
  { name: 'Customer Success', icon: ShoppingBag, count: 45 },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#8B9F7E]/10 text-[#8B9F7E] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Nuvi Blog
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 mb-4">
            Your Guide to
            <br />
            <span className="text-[#8B9F7E]">E-commerce Success</span>
          </h1>
          
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 md:text-xl mb-8">
            Expert insights, practical tips, and inspiring success stories to help you 
            build and grow your online business.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10 pr-4 py-3 w-full"
            />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-8">Featured Article</h2>
          {blogPosts.filter(post => post.featured).map(post => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-video md:aspect-auto">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="text-[#8B9F7E] font-medium">{post.category}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="hover:text-[#8B9F7E] transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-6">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">{post.author}</p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" className="group">
                        Read More
                        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.name} 
                  className="cursor-pointer hover:shadow-md transition-all hover:border-[#8B9F7E]/30"
                >
                  <CardContent className="p-6 text-center">
                    <Icon className="h-8 w-8 text-[#8B9F7E] mx-auto mb-3" />
                    <h3 className="font-medium mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} articles</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recent Articles</h2>
            <Button variant="outline">View All</Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(post => !post.featured).map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#8B9F7E] text-white px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="hover:text-[#8B9F7E] transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <span className="text-sm text-gray-600">{post.author}</span>
                    </div>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-[#8B9F7E] text-sm font-medium hover:underline"
                    >
                      Read →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-r from-[#8B9F7E] to-[#7A8B6D]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Get E-commerce Tips Delivered to Your Inbox
          </h2>
          <p className="max-w-xl mx-auto text-lg text-white/90 mb-8">
            Join 10,000+ entrepreneurs who receive weekly insights on growing their online business.
          </p>
          <form className="max-w-md mx-auto flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white"
              required
            />
            <Button type="submit" size="lg" className="bg-white text-[#8B9F7E] hover:bg-gray-100">
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-sm text-white/80">
            No spam, unsubscribe anytime. Read our Privacy Policy.
          </p>
        </div>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Nuvi Blog",
            "description": "E-commerce tips, guides, and industry insights",
            "url": "https://nuvi.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "Nuvi",
              "logo": {
                "@type": "ImageObject",
                "url": "https://nuvi.com/nuvi-logo.svg"
              }
            },
            "blogPost": blogPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "author": {
                "@type": "Person",
                "name": post.author
              },
              "datePublished": post.date,
              "url": `https://nuvi.com/blog/${post.slug}`
            }))
          })
        }}
      />
    </div>
  );
}