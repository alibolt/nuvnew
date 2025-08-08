// Intersection Observer Hook for Scroll Animations
import { useEffect, useState, useRef } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  useEffect(() => {
    const currentElement = ref.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        if (isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(currentElement);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return {
    ref,
    isVisible: triggerOnce ? hasBeenVisible : isVisible,
    hasBeenVisible,
  };
}

// Animated component wrapper
export function AnimatedSection({
  children,
  animation = 'fade-in-up',
  delay = 0,
  duration = 600,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
  delay?: number;
  duration?: number;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  const animationClass = `scroll-animate ${isVisible ? 'in-view' : ''}`;
  
  const style = {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
  };

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

// Stagger animation hook
export function useStaggerAnimation(itemCount: number, delay = 100) {
  const [animatedItems, setAnimatedItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (isVisible) {
      const timeouts: NodeJS.Timeout[] = [];
      
      for (let i = 0; i < itemCount; i++) {
        const timeout = setTimeout(() => {
          setAnimatedItems(prev => {
            const newState = [...prev];
            newState[i] = true;
            return newState;
          });
        }, i * delay);
        
        timeouts.push(timeout);
      }

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [isVisible, itemCount, delay]);

  return {
    ref,
    animatedItems,
    isVisible,
  };
}

// Progress bar hook
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(Math.max(scrollPercent, 0), 100));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
    };
  }, []);

  return progress;
}

// Parallax effect hook
export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      element.style.transform = `translateY(${rate}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return ref;
}

// Mouse tracking hook for interactive elements
export function useMouseTracking() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    };

    element.addEventListener('mousemove', handleMouseMove);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return {
    ref,
    mousePosition,
  };
}