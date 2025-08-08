'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { StarIcon, FilterIcon } from '@/components/icons/minimal-icons';
import { cn } from '@/lib/utils';

interface ProductReviewsProps {
  product: any;
  store: any;
  settings: {
    showReviews?: boolean;
    showReviewForm?: boolean;
    reviewsPerPage?: number;
    sortBy?: 'newest' | 'oldest' | 'rating' | 'helpful';
  };
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

const mockReviews: Review[] = [
  {
    id: '1',
    author: 'Sarah M.',
    rating: 5,
    date: '2024-01-15',
    title: 'Perfect fit and great quality!',
    content: 'This product exceeded my expectations. The quality is outstanding and it fits perfectly. I would definitely recommend it to others.',
    verified: true,
    helpful: 12,
    images: []
  },
  {
    id: '2',
    author: 'Mike R.',
    rating: 4,
    date: '2024-01-10',
    title: 'Good value for money',
    content: 'Really happy with this purchase. The only minor issue is that it took a while to arrive, but the product itself is great.',
    verified: true,
    helpful: 8
  },
  {
    id: '3',
    author: 'Emma L.',
    rating: 5,
    date: '2024-01-05',
    title: 'Absolutely love it!',
    content: 'Amazing quality and exactly as described. Fast shipping and excellent customer service. Will definitely buy again.',
    verified: false,
    helpful: 15
  }
];

export function ProductReviews({ product, store, settings }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState(settings.sortBy || 'newest');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    authorName: '',
    authorEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const showReviews = settings.showReviews ?? true;
  const enableReviewForm = settings.showReviewForm ?? true;
  const reviewsPerPage = settings.reviewsPerPage || 5;

  useEffect(() => {
    if (showReviews) {
      loadReviews();
    }
  }, [product.id, showReviews]);

  const loadReviews = async () => {
    try {
      const response = await fetch(
        `/api/stores/${store.id}/products/${product.id}/reviews?limit=${reviewsPerPage}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      // Fall back to mock data for demo
      setReviews(mockReviews);
      setSummary({
        averageRating: 4.7,
        totalReviews: mockReviews.length,
        ratingCounts: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/stores/${store.id}/products/${product.id}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newReview),
        }
      );

      if (response.ok) {
        await loadReviews();
        setShowReviewForm(false);
        setNewReview({
          rating: 5,
          title: '',
          content: '',
          authorName: '',
          authorEmail: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!showReviews) return null;

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalReviews = summary?.totalReviews || reviews.length;
  const averageRating = summary?.averageRating || (reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0);

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
            filled={i < rating}
            color={i < rating ? 'var(--theme-accent)' : 'var(--theme-border)'}
          />
        ))}
      </div>
    );
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: summary?.ratingCounts?.[rating] || reviews.filter(review => review.rating === rating).length,
    percentage: ((summary?.ratingCounts?.[rating] || reviews.filter(review => review.rating === rating).length) / totalReviews) * 100
  }));

  return (
    <div 
      className="space-y-8"
      style={{ fontFamily: 'var(--theme-font-body)' }}
    >
      {/* Reviews Summary */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span 
                className="text-4xl font-bold"
                style={{ 
                  color: 'var(--theme-text)',
                  fontSize: 'var(--theme-text-4xl)'
                }}
              >
                {averageRating.toFixed(1)}
              </span>
              {renderStars(Math.round(averageRating), 'lg')}
            </div>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: 'var(--theme-text-base)' }}>
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span style={{ color: 'var(--theme-text)', fontSize: 'var(--theme-text-sm)' }}>
                {rating}
              </span>
              {renderStars(1, 'sm')}
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: 'var(--theme-accent)'
                  }}
                />
              </div>
              <span 
                className="text-sm min-w-[3ch]"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
            style={{ 
              borderColor: 'var(--theme-border)',
              fontSize: 'var(--theme-text-sm)'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>

          <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-50 transition-colors">
            <FilterIcon size={16} />
            Filter
          </button>
        </div>

        {enableReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-6 py-2 rounded-md font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-background)',
              fontSize: 'var(--theme-text-sm)'
            }}
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div 
            key={review.id}
            className="p-6 border rounded-lg"
            style={{ 
              borderColor: 'var(--theme-border)',
              borderRadius: 'var(--theme-radius-lg)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span 
                    className="font-medium"
                    style={{ 
                      color: 'var(--theme-text)',
                      fontSize: 'var(--theme-text-base)'
                    }}
                  >
                    {review.author || 'Anonymous'}
                  </span>
                  {review.verified && (
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: 'var(--theme-success)',
                        color: 'white',
                        fontSize: 'var(--theme-text-xs)'
                      }}
                    >
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {renderStars(review.rating)}
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {new Date(review.date || new Date().toISOString()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <h4 
              className="font-medium mb-2"
              style={{ 
                color: 'var(--theme-text)',
                fontSize: 'var(--theme-text-base)'
              }}
            >
              {review.title}
            </h4>

            <p 
              className="mb-4 leading-relaxed"
              style={{ 
                color: 'var(--theme-text)',
                fontSize: 'var(--theme-text-sm)'
              }}
            >
              {review.content}
            </p>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity">
                <ThumbsUp className="w-4 h-4" />
                <span>Helpful ({review.helpful || 0})</span>
              </button>
              <button className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity">
                <MessageSquare className="w-4 h-4" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md"
            style={{ 
              backgroundColor: 'var(--theme-background)',
              borderRadius: 'var(--theme-radius-lg)'
            }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{ 
                color: 'var(--theme-text)',
                fontSize: 'var(--theme-text-xl)'
              }}
            >
              Write a Review
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                      className="p-1"
                    >
                      <StarIcon 
                        className={cn(
                          "w-6 h-6 fill-current transition-colors",
                          rating <= newReview.rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  placeholder="Give your review a title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Review</label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  rows={4}
                  placeholder="Share your thoughts about this product"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newReview.authorName}
                  onChange={(e) => setNewReview(prev => ({ ...prev, authorName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={newReview.authorEmail}
                  onChange={(e) => setNewReview(prev => ({ ...prev, authorEmail: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  placeholder="Your email"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-md font-medium"
                  style={{
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-background)'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border rounded-md"
                  style={{ borderColor: 'var(--theme-border)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}