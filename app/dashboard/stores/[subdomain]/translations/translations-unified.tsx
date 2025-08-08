'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { BarChart3, Edit3, Languages } from 'lucide-react';
import { TranslationsContent } from './translations-content';
import { TranslationsClient } from './translations-client';

interface TranslationStats {
  products: {
    total: number;
    translations: Array<{ language: string; _count: number }>;
  };
  categories: {
    total: number;
    translations: Array<{ language: string; _count: number }>;
  };
  pages: {
    total: number;
    translations: Array<{ language: string; _count: number }>;
  };
}

interface UnifiedTranslationsProps {
  store: Store;
  stats: TranslationStats;
}

export function TranslationsUnified({ store, stats }: UnifiedTranslationsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'editor'>('overview');

  const tabs = [
    { 
      id: 'overview' as const, 
      label: 'Overview & Batch Operations', 
      icon: BarChart3,
      description: 'Translation statistics and batch operations'
    },
    { 
      id: 'editor' as const, 
      label: 'Translation Editor', 
      icon: Edit3,
      description: 'Edit individual translations'
    }
  ];

  return (
    <div className="nuvi-container nuvi-mx-auto">
      {/* Header */}
      <div className="nuvi-mb-lg nuvi-px-lg nuvi-pt-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-sm">
          <Languages className="h-8 w-8 nuvi-text-primary" />
          <h1 className="nuvi-text-2xl nuvi-font-bold">Translation Management</h1>
        </div>
        <p className="nuvi-text-muted">
          Manage translations for your store content across multiple languages
        </p>
      </div>

      {/* Tabs */}
      <div className="nuvi-border-b nuvi-px-lg">
        <div className="nuvi-flex nuvi-gap-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-px-md nuvi-py-md
                  nuvi-border-b-2 nuvi-transition-all
                  ${activeTab === tab.id 
                    ? 'nuvi-border-primary nuvi-text-primary' 
                    : 'nuvi-border-transparent nuvi-text-muted hover:nuvi-text-foreground'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <div className="nuvi-text-left">
                  <div className="nuvi-font-medium">{tab.label}</div>
                  <div className="nuvi-text-xs nuvi-text-muted">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="nuvi-mt-0">
        {activeTab === 'overview' ? (
          <TranslationsClient store={store} stats={stats} />
        ) : (
          <div className="nuvi-px-lg nuvi-py-lg">
            <TranslationsContent store={store} />
          </div>
        )}
      </div>
    </div>
  );
}