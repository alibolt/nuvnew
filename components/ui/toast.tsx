'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', onClose, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
          'data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
          variant === 'destructive' &&
            'border-destructive bg-destructive text-destructive-foreground',
          variant === 'default' && 'border bg-background text-foreground',
          className
        )}
        {...props}
      >
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm font-semibold', className)}
      {...props}
    />
  )
);
ToastTitle.displayName = 'ToastTitle';

export interface ToastDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ToastDescription = React.forwardRef<HTMLDivElement, ToastDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  )
);
ToastDescription.displayName = 'ToastDescription';

export { Toast, ToastTitle, ToastDescription };