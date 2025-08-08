'use client';

import React, { useRef, useEffect } from 'react';
import { 
  getSectionAnimationClasses, 
  getAnimationStyles, 
  getHoverEffectClasses,
  useAnimationObserver 
} from '@/lib/theme-animations';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  themeSettings?: Record<string, any>;
  sectionType?: string;
  enableHover?: boolean;
  observerOptions?: {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
  };
}

export function SectionWrapper({
  children,
  className = '',
  style = {},
  themeSettings,
  sectionType,
  enableHover = false,
  observerOptions
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Apply animation observer if animations are enabled
  useEffect(() => {
    if (themeSettings?.animations?.enableAnimations && sectionRef.current) {
      const cleanup = useAnimationObserver(sectionRef, themeSettings, observerOptions);
      return cleanup;
    }
  }, [themeSettings, observerOptions]);
  
  // Get animation classes and styles
  const animationClasses = getSectionAnimationClasses(themeSettings);
  const animationStyles = getAnimationStyles(themeSettings);
  const hoverClasses = enableHover ? getHoverEffectClasses(themeSettings) : '';
  
  // Combine all classes
  const combinedClasses = `${className} ${animationClasses} ${hoverClasses}`.trim();
  
  // Combine all styles
  const combinedStyles = {
    ...style,
    ...animationStyles
  };
  
  return (
    <section 
      ref={sectionRef}
      className={combinedClasses}
      style={combinedStyles}
      data-section-type={sectionType}
    >
      {children}
    </section>
  );
}