'use client';

import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base Nuvi button class - uses admin-theme.css styles
  "nuvi-btn",
  {
    variants: {
      variant: {
        // Maps to CSS classes in admin-theme.css (Polaris-compliant)
        primary: "nuvi-btn-primary",
        secondary: "nuvi-btn-secondary", 
        tertiary: "nuvi-btn-tertiary",
        ghost: "nuvi-btn-ghost",
        outline: "nuvi-btn-outline",
        plain: "nuvi-btn-plain",
        monochrome: "nuvi-btn-monochrome-plain",
        "primary-critical": "nuvi-btn-primary-critical",
        "plain-critical": "nuvi-btn-plain-critical",
        danger: "nuvi-btn-danger", // Legacy alias
        critical: "nuvi-btn-critical", // Legacy alias
        success: "nuvi-btn-success"
      },
      size: {
        micro: "nuvi-btn-micro",
        slim: "nuvi-btn-slim", 
        sm: "nuvi-btn-sm", // Legacy support
        md: "nuvi-btn-md",
        default: "", // Uses base nuvi-btn sizing (medium)
        lg: "nuvi-btn-lg"
      },
      fullWidth: {
        true: "nuvi-btn-full"
      },
      iconOnly: {
        true: "nuvi-btn-icon-only"
      },
      loading: {
        true: "nuvi-btn-loading"
      },
      disclosure: {
        true: "nuvi-btn-disclosure"
      }
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
      fullWidth: false,
      iconOnly: false,
      loading: false,
      disclosure: false
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, iconOnly, loading, disclosure, asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, iconOnly, loading, disclosure, className }))}
        ref={ref}
        disabled={!!disabled || !!loading}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Specialized components for common patterns
export const PageActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "sm", ...props }, ref) => {
    return (
      <Button
        className={cn(className)}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      />
    );
  }
);
PageActionButton.displayName = "PageActionButton";

export const PrimaryActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "sm", ...props }, ref) => {
    return (
      <Button
        className={cn(className)}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      />
    );
  }
);
PrimaryActionButton.displayName = "PrimaryActionButton";

export const DangerActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "danger", size = "sm", ...props }, ref) => {
    return (
      <Button
        className={cn(className)}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      />
    );
  }
);
DangerActionButton.displayName = "DangerActionButton";

// Page header actions container
export const PageActions = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("nuvi-flex nuvi-gap-md", className)} {...props}>
      {children}
    </div>
  );
};

// Button Group component for segmented controls
export const ButtonGroup = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("nuvi-btn-group", className)} {...props}>
      {children}
    </div>
  );
};

// Icon-only action button for toolbars
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "ghost", size = "sm", iconOnly = true, ...props }, ref) => {
    return (
      <Button
        className={cn(className)}
        variant={variant}
        size={size}
        iconOnly={iconOnly}
        ref={ref}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";

// Loading button with built-in loading state
export const LoadingButton = forwardRef<HTMLButtonElement, ButtonProps & { isLoading?: boolean }>(
  ({ className, variant = "primary", size = "sm", isLoading = false, children, ...props }, ref) => {
    return (
      <Button
        className={cn(className)}
        variant={variant}
        size={size}
        loading={isLoading}
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

export { Button, buttonVariants };