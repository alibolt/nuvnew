'use client';

import { useState } from 'react';

export default function PageComplex() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="nuvi-container nuvi-mx-auto nuvi-p-8">
      <h1 className="nuvi-text-3xl nuvi-font-bold nuvi-mb-8">Complex Page Example</h1>
      
      <div className="nuvi-tabs">
        <div className="nuvi-tabs-list nuvi-border-b nuvi-mb-6">
          <button
            className={`nuvi-tab ${activeTab === 'overview' ? 'nuvi-tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`nuvi-tab ${activeTab === 'details' ? 'nuvi-tab-active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`nuvi-tab ${activeTab === 'settings' ? 'nuvi-tab-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
        
        <div className="nuvi-tab-content">
          {activeTab === 'overview' && (
            <div>
              <h2 className="nuvi-text-xl nuvi-font-semibold nuvi-mb-4">Overview</h2>
              <p className="nuvi-text-secondary">This is the overview content.</p>
            </div>
          )}
          
          {activeTab === 'details' && (
            <div>
              <h2 className="nuvi-text-xl nuvi-font-semibold nuvi-mb-4">Details</h2>
              <p className="nuvi-text-secondary">This is the details content.</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h2 className="nuvi-text-xl nuvi-font-semibold nuvi-mb-4">Settings</h2>
              <p className="nuvi-text-secondary">This is the settings content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}