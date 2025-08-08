// Commerce theme layout utilities

export function getContainerClasses(customWidth?: number | string): string {
  // Check for theme layout container width setting
  const containerWidth = customWidth || 'var(--theme-layout-container-width, 1280)';
  
  // If custom width is provided as a number or CSS variable
  if (customWidth || containerWidth.includes('var(')) {
    return 'mx-auto px-4 sm:px-6 lg:px-8';
  }
  
  // Default to max-w-7xl if no custom width
  return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
}

export function getContainerStyle(customWidth?: number | string): React.CSSProperties {
  const width = customWidth || 'var(--theme-layout-container-width, 1280px)';
  
  // Convert number to px if needed
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  
  return {
    maxWidth: widthValue,
    width: '100%'
  };
}

export function getSidebarClasses(position?: string): string {
  const sidebarPosition = position || 'var(--theme-layout-sidebar-position, none)';
  
  if (sidebarPosition === 'none') {
    return '';
  }
  
  const baseClasses = 'lg:grid lg:grid-cols-12 lg:gap-8';
  const sidebarClasses = 'lg:col-span-3';
  const contentClasses = 'lg:col-span-9';
  
  return {
    container: baseClasses,
    sidebar: `${sidebarClasses} ${sidebarPosition === 'right' ? 'lg:order-2' : ''}`,
    content: contentClasses
  };
}

// Responsive container width utilities
export const containerWidthMap = {
  '1000': 'max-w-5xl',
  '1100': 'max-w-6xl',
  '1200': 'max-w-6xl',
  '1280': 'max-w-7xl',
  '1400': 'max-w-[1400px]'
} as const;

export function getResponsiveContainerClass(width: string | number): string {
  const widthStr = width.toString();
  return containerWidthMap[widthStr as keyof typeof containerWidthMap] || 'max-w-7xl';
}