'use client';

import { useState, useEffect } from 'react';
import { Bug, ChevronDown, ChevronUp, X } from 'lucide-react';

interface DebugPanelProps {
  sections: any[];
  currentTemplate: any;
  store: any;
}

export function DebugPanel({ sections, currentTemplate, store }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      // Test the API directly
      fetch(`/api/stores/${store.subdomain}/templates/by-type/homepage`)
        .then(res => res.json())
        .then(data => setApiData(data))
        .catch(err => console.error('Debug API error:', err));
    }
  }, [isOpen, store.subdomain]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 z-50"
        title="Debug Panel"
      >
        <Bug className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Bug className="h-4 w-4 text-red-500" />
          Theme Studio Debug
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 p-3 space-y-3 text-xs">
        <div>
          <h4 className="font-semibold mb-1">Store Info</h4>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
{JSON.stringify({
  id: store.id,
  name: store.name,
  subdomain: store.subdomain
}, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-1">Current Template</h4>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
{JSON.stringify({
  id: currentTemplate?.id,
  type: currentTemplate?.templateType,
  name: currentTemplate?.name,
  hasSettings: !!currentTemplate?.settings
}, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-1">Sections ({sections.length})</h4>
          <div className="bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
            {sections.length === 0 ? (
              <p className="text-gray-500">No sections loaded</p>
            ) : (
              sections.map((section, i) => (
                <div key={section.id} className="mb-1">
                  {i + 1}. {section.title || section.type || 'Unknown'} (ID: {section.id})
                  <div className="text-[10px] text-gray-500">
                    Type: {section.type}, SectionType: {section.sectionType}, Enabled: {section.enabled ? 'Yes' : 'No'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {apiData && (
          <div>
            <h4 className="font-semibold mb-1">API Response</h4>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-[10px]">
{JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        )}

        {isExpanded && (
          <>
            <div>
              <h4 className="font-semibold mb-1">First Section Detail</h4>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-[10px]">
{JSON.stringify(sections[0] || {}, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Console Logs</h4>
              <div className="bg-gray-100 p-2 rounded text-[10px] font-mono">
                Check browser console for detailed logs
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}