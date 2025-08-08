import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-[var(--nuvi-border)] bg-[var(--nuvi-surface)] px-3 py-1.5 text-xs font-medium text-[var(--nuvi-text-primary)] placeholder:text-[var(--nuvi-text-secondary)] transition-all outline-none resize-vertical',
          'focus:border-[var(--nuvi-primary)] focus:ring-1 focus:ring-[var(--nuvi-primary)]',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };