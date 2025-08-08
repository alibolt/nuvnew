import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  scrollable?: boolean;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
  lazy?: boolean;
  keepMounted?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  value: controlledValue,
  onChange,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  scrollable = false,
  className = '',
  tabClassName = '',
  contentClassName = '',
  lazy = false,
  keepMounted = false,
}) => {
  const [internalValue, setInternalValue] = useState(
    controlledValue || items[0]?.id || ''
  );
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(new Set([internalValue]));
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Update indicator position
  useEffect(() => {
    if (variant === 'underline' && indicatorRef.current && activeTabRef.current) {
      const container = tabsContainerRef.current;
      const activeTab = activeTabRef.current;
      
      if (container && activeTab) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeTab.getBoundingClientRect();
        
        if (orientation === 'horizontal') {
          indicatorRef.current.style.left = `${activeRect.left - containerRect.left}px`;
          indicatorRef.current.style.width = `${activeRect.width}px`;
        } else {
          indicatorRef.current.style.top = `${activeRect.top - containerRect.top}px`;
          indicatorRef.current.style.height = `${activeRect.height}px`;
        }
      }
    }
  }, [value, variant, orientation]);

  // Check scroll buttons visibility
  useEffect(() => {
    if (!scrollable || !tabsContainerRef.current) return;

    const checkScroll = () => {
      const container = tabsContainerRef.current;
      if (!container) return;

      if (orientation === 'horizontal') {
        setShowLeftScroll(container.scrollLeft > 0);
        setShowRightScroll(
          container.scrollLeft < container.scrollWidth - container.clientWidth
        );
      }
    };

    checkScroll();
    const container = tabsContainerRef.current;
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [scrollable, orientation]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    const tab = items.find(item => item.id === tabId);
    if (tab?.disabled) return;

    if (controlledValue === undefined) {
      setInternalValue(tabId);
    }
    
    if (lazy && !mountedTabs.has(tabId)) {
      setMountedTabs(prev => new Set([...prev, tabId]));
    }
    
    onChange?.(tabId);
  };

  // Scroll handlers
  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    
    const scrollAmount = 200;
    const currentScroll = tabsContainerRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    tabsContainerRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  // Size styles
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const tabSizes = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };

  // Variant styles
  const getTabStyles = (isActive: boolean, isDisabled: boolean) => {
    const base = `
      relative inline-flex items-center justify-center gap-2 font-medium
      transition-all duration-200 outline-none
      ${tabSizes[size]} ${sizes[size]}
      ${fullWidth && orientation === 'horizontal' ? 'flex-1' : ''}
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;

    const variants = {
      default: `
        ${isActive 
          ? 'bg-green-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${orientation === 'horizontal' ? 'rounded-t-lg' : 'rounded-l-lg'}
      `,
      pills: `
        rounded-lg
        ${isActive 
          ? 'bg-green-600 text-white shadow-md' 
          : 'bg-transparent text-gray-700 hover:bg-gray-100'
        }
      `,
      underline: `
        bg-transparent border-b-2
        ${isActive 
          ? 'text-green-600 border-green-600' 
          : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
        }
      `,
      enclosed: `
        border
        ${isActive 
          ? 'bg-white text-gray-900 border-gray-200 border-b-white' 
          : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
        }
        ${orientation === 'horizontal' ? 'rounded-t-lg' : 'rounded-l-lg'}
      `
    };

    return `${base} ${variants[variant]}`;
  };

  const containerStyles = {
    default: `
      ${orientation === 'horizontal' 
        ? 'border-b border-gray-200' 
        : 'border-r border-gray-200'
      }
    `,
    pills: 'bg-gray-100 p-1 rounded-lg',
    underline: `
      relative
      ${orientation === 'horizontal' 
        ? 'border-b border-gray-200' 
        : 'border-r border-gray-200'
      }
    `,
    enclosed: `
      ${orientation === 'horizontal' 
        ? 'border-b border-gray-200' 
        : 'border-r border-gray-200'
      }
    `
  };

  const activeTab = items.find(item => item.id === value);

  return (
    <div 
      className={`
        ${orientation === 'vertical' ? 'flex' : ''}
        ${className}
      `}
    >
      {/* Tabs List */}
      <div className={`${orientation === 'vertical' ? 'flex-shrink-0' : ''}`}>
        <div className={`relative ${scrollable ? 'flex items-center' : ''}`}>
          {/* Left Scroll Button */}
          {scrollable && showLeftScroll && orientation === 'horizontal' && (
            <button
              onClick={() => scrollTabs('left')}
              className="flex-shrink-0 p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Tabs Container */}
          <div
            ref={tabsContainerRef}
            className={`
              ${containerStyles[variant]}
              ${scrollable && orientation === 'horizontal' ? 'overflow-x-auto scrollbar-hide flex-1' : ''}
              ${tabClassName}
            `}
            role="tablist"
            aria-orientation={orientation}
          >
            <div 
              className={`
                flex gap-1
                ${orientation === 'vertical' ? 'flex-col' : ''}
                ${variant === 'pills' ? '' : orientation === 'horizontal' ? '' : 'pr-px'}
              `}
            >
              {items.map((item) => {
                const isActive = item.id === value;
                const isDisabled = item.disabled || false;

                return (
                  <button
                    key={item.id}
                    ref={isActive ? activeTabRef : null}
                    onClick={() => handleTabChange(item.id)}
                    disabled={isDisabled}
                    className={getTabStyles(isActive, isDisabled)}
                    role="tab"
                    aria-selected={isActive}
                    aria-disabled={isDisabled}
                    aria-controls={`tabpanel-${item.id}`}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`
                        ml-2 px-2 py-0.5 text-xs rounded-full
                        ${isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Underline Indicator */}
            {variant === 'underline' && (
              <div
                ref={indicatorRef}
                className={`
                  absolute transition-all duration-300 bg-green-600
                  ${orientation === 'horizontal' 
                    ? 'bottom-0 h-0.5' 
                    : 'right-0 w-0.5'
                  }
                `}
              />
            )}
          </div>

          {/* Right Scroll Button */}
          {scrollable && showRightScroll && orientation === 'horizontal' && (
            <button
              onClick={() => scrollTabs('right')}
              className="flex-shrink-0 p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      <div className={`
        ${orientation === 'vertical' ? 'flex-1 pl-6' : 'mt-4'}
        ${contentClassName}
      `}>
        {items.map((item) => {
          const isActive = item.id === value;
          const shouldRender = isActive || keepMounted || mountedTabs.has(item.id);

          if (!shouldRender) return null;

          return (
            <div
              key={item.id}
              id={`tabpanel-${item.id}`}
              role="tabpanel"
              aria-labelledby={item.id}
              hidden={!isActive}
              className={isActive ? '' : 'hidden'}
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Preset Tab Components
export const RouteTabs: React.FC<{
  routes: Array<{
    path: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  currentPath: string;
  onNavigate: (path: string) => void;
}> = ({ routes, currentPath, onNavigate }) => {
  const items: TabItem[] = routes.map(route => ({
    id: route.path,
    label: route.label,
    icon: route.icon,
  }));

  return (
    <Tabs
      items={items}
      value={currentPath}
      onChange={onNavigate}
      variant="underline"
      fullWidth
    />
  );
};

export const StepTabs: React.FC<{
  steps: Array<{
    id: string;
    label: string;
    description?: string;
    content: React.ReactNode;
  }>;
  currentStep: number;
  onStepChange: (step: number) => void;
}> = ({ steps, currentStep, onStepChange }) => {
  const items: TabItem[] = steps.map((step, index) => ({
    id: step.id,
    label: `${index + 1}. ${step.label}`,
    content: (
      <div>
        {step.description && (
          <p className="text-gray-600 mb-4">{step.description}</p>
        )}
        {step.content}
      </div>
    ),
    disabled: index > currentStep,
  }));

  return (
    <Tabs
      items={items}
      value={steps[currentStep].id}
      onChange={(id) => {
        const index = steps.findIndex(s => s.id === id);
        if (index !== -1) onStepChange(index);
      }}
      variant="enclosed"
    />
  );
};

export default Tabs;