'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { Gift, Settings, CreditCard } from 'lucide-react';
import { GiftCardsFormSimple } from './gift-cards-form-simple';
import { GiftCardsManager } from './gift-cards-manager';

const tabs = [
  { id: 'cards' as const, label: 'Gift Cards', icon: CreditCard },
  { id: 'settings' as const, label: 'Settings', icon: Settings }
];

export function GiftCardsPage({ store }: { store: Store }) {
  const [activeTab, setActiveTab] = useState<'cards' | 'settings'>('cards');

  return (
    <div className="nuvi-space-y-lg">
      {/* Tabs */}
      <div className="nuvi-settings-tabs">
        <div className="nuvi-settings-tabs-list">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nuvi-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="nuvi-tab-content">
        {activeTab === 'cards' && <GiftCardsManager store={store} />}
        {activeTab === 'settings' && <GiftCardsFormSimple store={store} />}
      </div>
    </div>
  );
}