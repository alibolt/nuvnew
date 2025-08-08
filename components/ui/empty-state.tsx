import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'minimal' | 'card';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const variantStyles = {
  default: 'text-center',
  minimal: 'text-center',
  card: 'text-center bg-gray-50 rounded-lg border border-gray-200',
};

const sizeStyles = {
  sm: {
    container: 'py-8 px-4',
    icon: 'w-12 h-12',
    title: 'text-lg font-medium',
    message: 'text-sm',
    button: 'text-sm px-4 py-2',
  },
  md: {
    container: 'py-12 px-6',
    icon: 'w-16 h-16',
    title: 'text-xl font-semibold',
    message: 'text-base',
    button: 'px-6 py-2.5',
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'w-20 h-20',
    title: 'text-2xl font-bold',
    message: 'text-lg',
    button: 'text-lg px-8 py-3',
  },
};

export function EmptyState({
  icon: Icon,
  title = 'No results found',
  message = 'Try adjusting your filters or search criteria',
  action,
  variant = 'default',
  size = 'md',
  className,
  children,
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  const handleAction = () => {
    if (action?.onClick) {
      action.onClick();
    } else if (action?.href) {
      window.location.href = action.href;
    }
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        styles.container,
        className
      )}
    >
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon 
            className={cn(
              styles.icon,
              'text-gray-400'
            )}
          />
        </div>
      )}
      
      {title && (
        <h3 className={cn(
          styles.title,
          'text-gray-900 mb-2'
        )}>
          {title}
        </h3>
      )}
      
      {message && (
        <p className={cn(
          styles.message,
          'text-gray-600 max-w-md mx-auto'
        )}>
          {message}
        </p>
      )}
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
      
      {action && (
        <div className="mt-6">
          {action.href ? (
            <a
              href={action.href}
              className={cn(
                'inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-gray-800 transition-colors',
                styles.button
              )}
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={handleAction}
              className={cn(
                'inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-gray-800 transition-colors',
                styles.button
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}