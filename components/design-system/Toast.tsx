import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  description?: string;
  duration?: number; // in milliseconds, 0 for infinite
  closable?: boolean;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  position?: ToastPosition;
}

export interface Toast extends Required<Omit<ToastOptions, 'onClose' | 'action' | 'icon'>> {
  icon?: React.ReactNode;
  action?: ToastOptions['action'];
  onClose?: () => void;
  createdAt: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
  updateToast: (id: string, options: Partial<ToastOptions>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export const ToastProvider: React.FC<{
  children: React.ReactNode;
  maxToasts?: number;
  position?: ToastPosition;
}> = ({ 
  children, 
  maxToasts = 5,
  position: defaultPosition = 'bottom-right' 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToast = useCallback((options: ToastOptions): string => {
    const id = options.id || generateId();
    
    const newToast: Toast = {
      id,
      type: options.type || 'info',
      title: options.title || '',
      description: options.description || '',
      duration: options.duration !== undefined ? options.duration : 5000,
      closable: options.closable !== undefined ? options.closable : true,
      position: options.position || defaultPosition,
      icon: options.icon,
      action: options.action,
      onClose: options.onClose,
      createdAt: Date.now(),
    };

    setToasts(prevToasts => {
      const updated = [...prevToasts, newToast];
      // Limit the number of toasts
      if (updated.length > maxToasts) {
        return updated.slice(-maxToasts);
      }
      return updated;
    });

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [maxToasts, defaultPosition]);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => {
      const toast = prevToasts.find(t => t.id === id);
      toast?.onClose?.();
      return prevToasts.filter(t => t.id !== id);
    });
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts(prevToasts => {
      prevToasts.forEach(toast => toast.onClose?.());
      return [];
    });
  }, []);

  const updateToast = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts(prevToasts => 
      prevToasts.map(toast => 
        toast.id === id 
          ? { ...toast, ...options, id } 
          : toast
      )
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAllToasts, updateToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer: React.FC = () => {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts } = context;

  // Group toasts by position
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, Toast[]>);

  const positionClasses: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  const content = (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`fixed z-[9999] ${positionClasses[position as ToastPosition]}`}
        >
          <div className={`flex flex-col gap-2 ${
            position.includes('top') ? '' : 'flex-col-reverse'
          }`}>
            {positionToasts.map(toast => (
              <ToastItem key={toast.id} toast={toast} />
            ))}
          </div>
        </div>
      ))}
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return null;
};

// Individual Toast Item Component
const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { removeToast } = context;
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 200); // Match animation duration
  };

  const icons = {
    success: <CheckCircle className="text-green-600" size={20} />,
    error: <AlertCircle className="text-red-600" size={20} />,
    warning: <AlertTriangle className="text-yellow-600" size={20} />,
    info: <Info className="text-blue-600" size={20} />,
    loading: <Loader2 className="text-gray-600 animate-spin" size={20} />,
  };

  const typeStyles = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    loading: 'bg-gray-50 border-gray-200',
  };

  return (
    <div
      className={`
        min-w-[300px] max-w-md p-4 rounded-lg border shadow-lg
        ${typeStyles[toast.type]}
        transform transition-all duration-200 ease-in-out
        ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        ${toast.position.includes('right') ? 'animate-slide-in-right' : ''}
        ${toast.position.includes('left') ? 'animate-slide-in-left' : ''}
        ${toast.position.includes('top') && toast.position.includes('center') ? 'animate-slide-in-top' : ''}
        ${toast.position.includes('bottom') && toast.position.includes('center') ? 'animate-slide-in-bottom' : ''}
      `}
      role="alert"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {toast.icon || icons[toast.type]}
        </div>

        {/* Content */}
        <div className="flex-1">
          {toast.title && (
            <h4 className="font-semibold text-gray-900 mb-1">
              {toast.title}
            </h4>
          )}
          {toast.description && (
            <p className="text-sm text-gray-600">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              onClick={() => {
                toast.action.onClick();
                handleClose();
              }}
              className="mt-2 text-sm font-medium text-green-600 hover:text-green-700"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        {toast.closable && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 -m-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, removeAllToasts, updateToast } = context;

  return {
    toast: (options: ToastOptions | string) => {
      if (typeof options === 'string') {
        return addToast({ description: options });
      }
      return addToast(options);
    },
    success: (options: ToastOptions | string) => {
      if (typeof options === 'string') {
        return addToast({ type: 'success', description: options });
      }
      return addToast({ ...options, type: 'success' });
    },
    error: (options: ToastOptions | string) => {
      if (typeof options === 'string') {
        return addToast({ type: 'error', description: options });
      }
      return addToast({ ...options, type: 'error' });
    },
    warning: (options: ToastOptions | string) => {
      if (typeof options === 'string') {
        return addToast({ type: 'warning', description: options });
      }
      return addToast({ ...options, type: 'warning' });
    },
    info: (options: ToastOptions | string) => {
      if (typeof options === 'string') {
        return addToast({ type: 'info', description: options });
      }
      return addToast({ ...options, type: 'info' });
    },
    loading: (options: ToastOptions | string) => {
      if (typeof options === 'string') {
        return addToast({ type: 'loading', description: options, duration: 0 });
      }
      return addToast({ ...options, type: 'loading', duration: 0 });
    },
    promise: async <T,>(
      promise: Promise<T>,
      options: {
        loading?: ToastOptions | string;
        success?: ToastOptions | string | ((data: T) => ToastOptions | string);
        error?: ToastOptions | string | ((error: any) => ToastOptions | string);
      }
    ) => {
      const loadingId = addToast({
        type: 'loading',
        ...(typeof options.loading === 'string' 
          ? { description: options.loading }
          : options.loading || {}),
        duration: 0,
      });

      try {
        const result = await promise;
        removeToast(loadingId);
        
        const successOptions = typeof options.success === 'function'
          ? options.success(result)
          : options.success;
        
        if (successOptions) {
          addToast({
            type: 'success',
            ...(typeof successOptions === 'string' 
              ? { description: successOptions }
              : successOptions),
          });
        }
        
        return result;
      } catch (error) {
        removeToast(loadingId);
        
        const errorOptions = typeof options.error === 'function'
          ? options.error(error)
          : options.error;
        
        if (errorOptions) {
          addToast({
            type: 'error',
            ...(typeof errorOptions === 'string' 
              ? { description: errorOptions }
              : errorOptions),
          });
        }
        
        throw error;
      }
    },
    dismiss: removeToast,
    dismissAll: removeAllToasts,
    update: updateToast,
  };
};

// Standalone toast function (requires ToastProvider to be mounted)
let toastInstance: ToastContextType | null = null;

export const setToastInstance = (instance: ToastContextType) => {
  toastInstance = instance;
};

export const toast = {
  success: (options: ToastOptions | string) => {
    if (!toastInstance) {
      console.warn('Toast provider not mounted');
      return '';
    }
    if (typeof options === 'string') {
      return toastInstance.addToast({ type: 'success', description: options });
    }
    return toastInstance.addToast({ ...options, type: 'success' });
  },
  error: (options: ToastOptions | string) => {
    if (!toastInstance) {
      console.warn('Toast provider not mounted');
      return '';
    }
    if (typeof options === 'string') {
      return toastInstance.addToast({ type: 'error', description: options });
    }
    return toastInstance.addToast({ ...options, type: 'error' });
  },
  warning: (options: ToastOptions | string) => {
    if (!toastInstance) {
      console.warn('Toast provider not mounted');
      return '';
    }
    if (typeof options === 'string') {
      return toastInstance.addToast({ type: 'warning', description: options });
    }
    return toastInstance.addToast({ ...options, type: 'warning' });
  },
  info: (options: ToastOptions | string) => {
    if (!toastInstance) {
      console.warn('Toast provider not mounted');
      return '';
    }
    if (typeof options === 'string') {
      return toastInstance.addToast({ type: 'info', description: options });
    }
    return toastInstance.addToast({ ...options, type: 'info' });
  },
  loading: (options: ToastOptions | string) => {
    if (!toastInstance) {
      console.warn('Toast provider not mounted');
      return '';
    }
    if (typeof options === 'string') {
      return toastInstance.addToast({ type: 'loading', description: options, duration: 0 });
    }
    return toastInstance.addToast({ ...options, type: 'loading', duration: 0 });
  },
};

export default ToastProvider;