'use client';

import { useState, useEffect } from 'react';

export default function TestThemesPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/themes')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setThemes(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading themes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Theme Registry Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Available Themes: {themes.length}</h2>
        </div>
        
        {themes.map(theme => (
          <div key={theme.id} className="border p-4 rounded">
            <h3 className="font-bold">{theme.name}</h3>
            <p className="text-sm text-gray-600">{theme.description}</p>
            <div className="mt-2 space-x-2">
              <span className="text-xs bg-blue-100 px-2 py-1 rounded">v{theme.version}</span>
              {theme.installed && <span className="text-xs bg-green-100 px-2 py-1 rounded">Installed</span>}
              {theme.canUninstall === false && <span className="text-xs bg-gray-100 px-2 py-1 rounded">System Theme</span>}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Test Client Theme Loader</h3>
        <button 
          onClick={async () => {
            const { clientThemeLoader } = await import('@/lib/theme-registry/client-theme-loader');
            const baseTheme = await clientThemeLoader.loadTheme('base');
            console.log('Base theme loaded:', baseTheme);
            alert('Check console for base theme');
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Load Base Theme
        </button>
        <button 
          onClick={async () => {
            const { clientThemeLoader } = await import('@/lib/theme-registry/client-theme-loader');
            const skateshopTheme = await clientThemeLoader.loadTheme('skateshop');
            console.log('Skateshop theme loaded:', skateshopTheme);
            alert('Check console for skateshop theme');
          }}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Load Skateshop Theme
        </button>
      </div>
    </div>
  );
}