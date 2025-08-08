import React from 'react';
import { MoreHorizontal, ExternalLink, ArrowRight } from 'lucide-react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children?: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children?: React.ReactNode;
  className?: string;
  divider?: boolean;
  align?: 'left' | 'center' | 'right' | 'between';
}

export interface CardImageProps {
  src: string;
  alt?: string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  overlay?: React.ReactNode;
  className?: string;
}

// Main Card Component
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white border border-gray-200',
      outlined: 'bg-transparent border-2 border-gray-300',
      elevated: 'bg-white shadow-lg border-0',
      ghost: 'bg-gray-50 border-0'
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    };

    const hoverStyles = hoverable ? 'transition-all hover:shadow-xl hover:scale-[1.02]' : '';
    const clickStyles = clickable ? 'cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={`
          rounded-lg overflow-hidden
          ${variants[variant]}
          ${padding !== 'none' ? paddings[padding] : ''}
          ${hoverStyles}
          ${clickStyles}
          ${className}
        `}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Card Header Component
export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  avatar,
  action,
  className = ''
}) => {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex items-start gap-3">
        {avatar && (
          <div className="flex-shrink-0">
            {avatar}
          </div>
        )}
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// Card Body Component
export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`text-gray-600 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  divider = false,
  align = 'left'
}) => {
  const alignments = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div 
      className={`
        flex items-center gap-3
        ${alignments[align]}
        ${divider ? 'border-t border-gray-200 pt-4 mt-4' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Card Image Component
export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt = '',
  height = 200,
  objectFit = 'cover',
  overlay,
  className = ''
}) => {
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full"
        style={{ objectFit }}
      />
      {overlay && (
        <div className="absolute inset-0">
          {overlay}
        </div>
      )}
    </div>
  );
};

// Preset Card Components
export const ProductCard: React.FC<{
  image: string;
  title: string;
  price: string;
  originalPrice?: string;
  rating?: number;
  badge?: string;
  onAddToCart?: () => void;
}> = ({ image, title, price, originalPrice, rating, badge, onAddToCart }) => {
  return (
    <Card variant="default" hoverable>
      <div className="relative">
        <CardImage src={image} height={250} />
        {badge && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="text-xs text-gray-500 ml-1">({rating})</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">{price}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">{originalPrice}</span>
            )}
          </div>
          <button
            onClick={onAddToCart}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
};

export const BlogCard: React.FC<{
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  href?: string;
}> = ({ image, category, title, excerpt, author, date, readTime, href }) => {
  return (
    <Card variant="default" hoverable clickable>
      <CardImage src={image} height={200} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
            {category}
          </span>
          <span className="text-xs text-gray-500">{date}</span>
          <span className="text-xs text-gray-500">{readTime} read</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700">{author.name}</span>
          </div>
          <a
            href={href}
            className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm font-medium"
          >
            Read more
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </Card>
  );
};

export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down';
  };
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'purple';
}> = ({ title, value, change, icon, color = 'green' }) => {
  const colors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <Card variant="default">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-sm font-medium ${
                  change.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change.trend === 'up' ? '↑' : '↓'} {change.value}
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-lg ${colors[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

Card.displayName = 'Card';

export default Card;