/**
 * Dynamic import utilities for code splitting
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

/**
 * Create a dynamically imported component with loading state
 */
export function createDynamicComponent<P = {}>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(loader, {
    loading: options?.loading || LoadingComponent,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Lazy load heavy components
 */
export const DynamicComponents = {
  // Analytics components
  AnalyticsChart: createDynamicComponent(
    () => import('@/components/analytics/analytics-chart'),
    { ssr: false }
  ),
  
  // Editor components
  RichTextEditor: createDynamicComponent(
    () => import('@/components/editor/rich-text-editor'),
    { ssr: false }
  ),
  
  // Media components
  MediaGallery: createDynamicComponent(
    () => import('@/components/media/media-gallery')
  ),
  
  // Theme Studio components  
  ThemeStudio: createDynamicComponent(
    () => import('@/app/dashboard/stores/[subdomain]/theme-studio/theme-studio-next'),
    { ssr: false }
  ),
};

/**
 * Preload component for better UX
 */
export function preloadComponent(componentName: keyof typeof DynamicComponents) {
  const component = DynamicComponents[componentName];
  if (component && typeof component.preload === 'function') {
    component.preload();
  }
}