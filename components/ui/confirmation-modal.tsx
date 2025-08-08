'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconColor: 'text-[var(--nuvi-error)]',
    confirmButtonClass: 'nuvi-btn nuvi-btn-danger',
    titleColor: 'text-[var(--nuvi-error)]',
    bgColor: 'bg-[var(--nuvi-error-light)]',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-[var(--nuvi-warning)]',
    confirmButtonClass: 'nuvi-btn nuvi-btn-secondary',
    titleColor: 'text-[var(--nuvi-warning)]',
    bgColor: 'bg-[var(--nuvi-warning-light)]',
  },
  info: {
    icon: Info,
    iconColor: 'text-[var(--nuvi-info)]',
    confirmButtonClass: 'nuvi-btn nuvi-btn-primary',
    titleColor: 'text-[var(--nuvi-info)]',
    bgColor: 'bg-[var(--nuvi-info-light)]',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-[var(--nuvi-success)]',
    confirmButtonClass: 'nuvi-btn nuvi-btn-success',
    titleColor: 'text-[var(--nuvi-success)]',
    bgColor: 'bg-[var(--nuvi-success-light)]',
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  isLoading = false,
}: ConfirmationModalProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose(); // Close modal after successful action
    } catch (error) {
      console.error('Confirmation action failed:', error);
      // Modal stays open if there's an error
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('p-2 rounded-full', config.bgColor)}>
              {icon || <IconComponent className={cn('h-5 w-5', config.iconColor)} />}
            </div>
            <DialogTitle className={cn('text-lg font-semibold', config.titleColor)}>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[var(--nuvi-text-secondary)] leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="nuvi-btn nuvi-btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              config.confirmButtonClass,
              isLoading && 'nuvi-btn-loading'
            )}
          >
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier usage
export function useConfirmationModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<ConfirmationModalProps>>({});

  const openModal = (modalConfig: Omit<ConfirmationModalProps, 'isOpen' | 'onClose'>) => {
    setConfig(modalConfig);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setConfig({});
  };

  const ConfirmationModalComponent = React.useMemo(() => {
    if (!isOpen) return null;

    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={closeModal}
        title=""
        description=""
        {...config}
      />
    );
  }, [isOpen, config]);

  return {
    openModal,
    closeModal,
    ConfirmationModal: ConfirmationModalComponent,
    isOpen,
  };
}