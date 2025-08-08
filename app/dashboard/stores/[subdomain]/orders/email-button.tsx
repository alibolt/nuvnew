'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { NotificationModal } from './notification-modal';

interface EmailButtonProps {
  order: any;
  subdomain: string;
}

export function EmailButton({ order, subdomain }: EmailButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="nuvi-button-secondary flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        Email Customer
      </button>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={order}
        subdomain={subdomain}
      />
    </>
  );
}