'use client';

import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeSettings, defaultThemeSettings } from '@/lib/theme-settings-schema';
<<<<<<< Updated upstream
import { GlobalThemeSettings } from './components/global-theme-settings';
=======
import { BasicThemeSettings } from './components/basic-theme-settings';
>>>>>>> Stashed changes

interface ThemeSettingsClientProps {
  storeId: string;
  initialSettings: ThemeSettings;
}

export function ThemeSettingsClient({ storeId, initialSettings }: ThemeSettingsClientProps) {
  const [settings, setSettings] = useState<ThemeSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (newSettings: ThemeSettings) => {
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/stores/${storeId}/theme-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Theme settings saved successfully');
        setHasChanges(false);
      } else {
        toast.error('Failed to save theme settings');
      }
    } catch (error) {
      toast.error('Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all theme settings to defaults?')) {
      setSettings(defaultThemeSettings);
      setHasChanges(true);
      toast.success('Theme settings reset to defaults');
    }
  };

  return (
    <div className="nuvi-space-y-lg">
      {/* Action Bar */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
            <div>
              <h3 className="nuvi-font-semibold nuvi-mb-xs">Global Theme Settings</h3>
              <p className="nuvi-text-sm nuvi-text-secondary">
                These settings apply to your entire store
              </p>
            </div>
            <div className="nuvi-flex nuvi-gap-sm">
              <button
                className="nuvi-btn nuvi-btn-secondary"
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                className="nuvi-btn nuvi-btn-primary"
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
<<<<<<< Updated upstream
      <GlobalThemeSettings
=======
      <BasicThemeSettings
>>>>>>> Stashed changes
        settings={settings}
        onUpdate={handleSettingChange}
      />
    </div>
  );
}