/**
 * Theme animation utilities
 * Simplified animation system - just on/off
 */

export interface AnimationSettings {
  enabled?: boolean;
}

// Default animation duration (300ms for subtle animations)
const DEFAULT_DURATION = 300;

/**
 * Get resolved animation settings
 */
export function getResolvedAnimationSettings(themeSettings?: Record<string, any>): AnimationSettings {
  // Check both old and new field names for backwards compatibility
  const enabled = themeSettings?.animations?.enabled ?? themeSettings?.animations?.enableAnimations ?? true;
  
  return {
    enabled
  };
}

/**
 * Get animation classes based on theme settings
 */
export function getSectionAnimationClasses(
  themeSettings?: Record<string, any>,
  customClass?: string
): string {
  const resolvedSettings = getResolvedAnimationSettings(themeSettings);
  
  if (!resolvedSettings.enabled) {
    return '';
  }

  // Return simple fade-in animation when enabled
  return customClass || 'animate-fade-in';
}

/**
 * Get animation duration based on theme settings
 */
export function getAnimationDuration(themeSettings?: Record<string, any>): number {
  const resolvedSettings = getResolvedAnimationSettings(themeSettings);
  
  if (!resolvedSettings.enabled) {
    return 0;
  }

  return DEFAULT_DURATION;
}

/**
 * Get hover effect classes based on theme settings
 */
export function getHoverEffectClasses(themeSettings?: Record<string, any>): string {
  const resolvedSettings = getResolvedAnimationSettings(themeSettings);
  
  if (!resolvedSettings.enabled) {
    return '';
  }

  // Simple scale effect on hover
  return 'hover:scale-105 transition-transform';
}

/**
 * Get animation CSS variables for inline styles
 */
export function getAnimationStyles(themeSettings?: Record<string, any>): React.CSSProperties {
  const resolvedSettings = getResolvedAnimationSettings(themeSettings);
  
  if (!resolvedSettings.enabled) {
    return {};
  }

  return {
    '--animation-duration': `${DEFAULT_DURATION}ms`,
    '--animation-delay': '0ms',
    '--animation-timing': 'cubic-bezier(0.4, 0, 0.2, 1)'
  } as React.CSSProperties;
}

/**
 * Check if parallax is enabled
 * Always returns false in simplified version
 */
export function isParallaxEnabled(themeSettings?: Record<string, any>): boolean {
  return false;
}

/**
 * Check if smooth scroll is enabled
 * Returns true if animations are enabled
 */
export function isSmoothScrollEnabled(themeSettings?: Record<string, any>): boolean {
  const resolvedSettings = getResolvedAnimationSettings(themeSettings);
  return resolvedSettings.enabled;
}

/**
 * Apply animation intersection observer
 * This will add the animation class when the element comes into view
 */
export function useAnimationObserver(
  ref: React.RefObject<HTMLElement>,
  themeSettings?: Record<string, any>,
  options?: {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
  }
) {
  const resolvedSettings = getResolvedAnimationSettings(themeSettings);
  
  if (typeof window === 'undefined' || !resolvedSettings.enabled) {
    return;
  }

  const { threshold = 0.1, rootMargin = '0px', once = true } = options || {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          entry.target.classList.remove('animate-in');
        }
      });
    },
    {
      threshold,
      rootMargin
    }
  );

  if (ref.current) {
    observer.observe(ref.current);
  }

  return () => {
    if (ref.current) {
      observer.unobserve(ref.current);
    }
  };
}