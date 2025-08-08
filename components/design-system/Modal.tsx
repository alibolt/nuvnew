import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  preventScroll?: boolean;
}

export interface AlertModalProps extends Omit<ModalProps, 'children'> {
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmButtonVariant?: 'primary' | 'destructive';
  message: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  title,
  description,
  size = 'md',
  position = 'center',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  className = '',
  overlayClassName = '',
  preventScroll = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, closeOnEsc, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!preventScroll) return;

    if (open) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open, preventScroll]);

  // Focus trap
  useEffect(() => {
    if (!open || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    firstFocusable?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  const positions = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-20',
    bottom: 'items-end justify-center pb-20'
  };

  const modalContent = (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity ${overlayClassName}`}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={`fixed inset-0 z-50 flex ${positions[position]} p-4 overflow-y-auto`}
        onClick={closeOnOverlayClick ? onClose : undefined}
      >
        {/* Modal Content */}
        <div
          ref={modalRef}
          className={`
            relative w-full ${sizes[size]} 
            bg-white rounded-xl shadow-2xl
            transform transition-all
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-1 text-sm text-gray-500">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 -m-1 ml-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Use portal to render modal at document root
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

// Alert Modal Component
export const AlertModal: React.FC<AlertModalProps> = ({
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonVariant = 'primary',
  message,
  ...modalProps
}) => {
  const icons = {
    info: <Info className="text-blue-600" size={24} />,
    success: <CheckCircle className="text-green-600" size={24} />,
    warning: <AlertTriangle className="text-yellow-600" size={24} />,
    error: <AlertCircle className="text-red-600" size={24} />
  };

  const titles = {
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    error: 'Error'
  };

  return (
    <Modal
      {...modalProps}
      title={modalProps.title || titles[type]}
      footer={
        <>
          {onCancel && (
            <button
              onClick={() => {
                onCancel();
                modalProps.onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              onConfirm?.();
              modalProps.onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              confirmButtonVariant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

// Drawer Component (Side Modal)
export interface DrawerProps extends Omit<ModalProps, 'position' | 'size'> {
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Drawer: React.FC<DrawerProps> = ({
  position = 'right',
  size = 'md',
  children,
  className = '',
  ...modalProps
}) => {
  const sizes = {
    sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-[32rem]' : 'h-[32rem]',
    full: position === 'left' || position === 'right' ? 'w-full' : 'h-full'
  };

  const positions = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full'
  };

  const animations = {
    left: modalProps.open ? 'translate-x-0' : '-translate-x-full',
    right: modalProps.open ? 'translate-x-0' : 'translate-x-full',
    top: modalProps.open ? 'translate-y-0' : '-translate-y-full',
    bottom: modalProps.open ? 'translate-y-0' : 'translate-y-full'
  };

  if (!modalProps.open) return null;

  const drawerContent = (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity ${modalProps.overlayClassName || ''}`}
        onClick={modalProps.closeOnOverlayClick !== false ? modalProps.onClose : undefined}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`
          fixed ${positions[position]} ${sizes[size]}
          bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${animations[position]}
          ${className}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(modalProps.title || modalProps.showCloseButton !== false) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {modalProps.title && (
              <h2 className="text-xl font-semibold text-gray-900">
                {modalProps.title}
              </h2>
            )}
            {modalProps.showCloseButton !== false && (
              <button
                onClick={modalProps.onClose}
                className="p-1 -m-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {modalProps.footer && (
          <div className="p-6 border-t border-gray-200">
            {modalProps.footer}
          </div>
        )}
      </div>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }

  return null;
};

export default Modal;