'use client';

import { 
  Wand2, Type, Globe, ImageIcon, FileEdit, BarChart3, 
  Send, Sparkles
} from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface AIContentProps {
  store: StoreData;
}

export function AIContent({ store }: AIContentProps) {
  return (
    <div className="nuvi-tab-panel">
      {/* AI Header */}
      <div className="nuvi-mb-lg">
        <h2 className="nuvi-text-2xl nuvi-font-bold">AI Tools</h2>
        <p className="nuvi-text-secondary nuvi-text-sm">Leverage AI to build and optimize your store</p>
      </div>

      {/* AI Store Builder */}
      <div className="nuvi-card nuvi-mb-lg">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">
            <Wand2 className="h-5 w-5 nuvi-inline nuvi-mr-sm" />
            AI Store Builder
          </h3>
        </div>
        <div className="nuvi-card-content">
          <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-lg">
            Build your entire store with AI. Choose how you want to start:
          </p>
          
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
            <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
              <Type className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
              <h4 className="nuvi-font-medium nuvi-mb-sm">From Description</h4>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                Describe your business and let AI create your store
              </p>
              <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-w-full">
                Start with Text
              </button>
            </div>

            <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
              <Globe className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
              <h4 className="nuvi-font-medium nuvi-mb-sm">From Website</h4>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                Import content from your existing website
              </p>
              <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-w-full">
                Import Website
              </button>
            </div>

            <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
              <ImageIcon className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
              <h4 className="nuvi-font-medium nuvi-mb-sm">From Images</h4>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                Upload product images and let AI do the rest
              </p>
              <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-w-full">
                Upload Images
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools Grid */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">
              <FileEdit className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
              AI Content Writer
            </h3>
          </div>
          <div className="nuvi-card-content">
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
              Generate product descriptions, blog posts, and marketing copy
            </p>
            <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
              <Sparkles className="h-4 w-4" />
              Open AI Writer
            </button>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">
              <ImageIcon className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
              AI Image Generator
            </h3>
          </div>
          <div className="nuvi-card-content">
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
              Create unique product images and marketing visuals
            </p>
            <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
              <Sparkles className="h-4 w-4" />
              Generate Images
            </button>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">
              <BarChart3 className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
              AI Analytics
            </h3>
          </div>
          <div className="nuvi-card-content">
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
              Get AI-powered insights and recommendations
            </p>
            <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
              <Sparkles className="h-4 w-4" />
              View Insights
            </button>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">
              <Send className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
              AI Marketing
            </h3>
          </div>
          <div className="nuvi-card-content">
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
              Automate email campaigns and social media posts
            </p>
            <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
              <Sparkles className="h-4 w-4" />
              Setup Automation
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="nuvi-card nuvi-mt-lg">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">
            <Sparkles className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
            AI Assistant
          </h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-bg-surface-hover nuvi-rounded-lg">
            <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-primary-light nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
              <Sparkles className="h-6 w-6 nuvi-text-primary" />
            </div>
            <div className="nuvi-flex-1">
              <h4 className="nuvi-font-medium">Need help with your store?</h4>
              <p className="nuvi-text-sm nuvi-text-secondary">
                Ask our AI assistant anything about building and growing your online store
              </p>
            </div>
            <button className="nuvi-btn nuvi-btn-primary">
              Start Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}