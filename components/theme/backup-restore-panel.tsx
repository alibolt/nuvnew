'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Download, 
  Upload, 
  Trash2, 
  Clock, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Archive
} from 'lucide-react';

interface Backup {
  id: string;
  name: string;
  description?: string;
  timestamp: string;
  themeId: string;
}

interface BackupRestorePanelProps {
  subdomain: string;
  themeId: string;
}

export function BackupRestorePanel({ subdomain, themeId }: BackupRestorePanelProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [restoreOptions, setRestoreOptions] = useState({
    overwrite: false,
    mergeSettings: true,
    validateChecksum: true
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load backups
  useEffect(() => {
    loadBackups();
  }, [subdomain]);

  const loadBackups = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/theme/backup`);
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Failed to load backups:', error);
      showMessage('error', 'Failed to load backups');
    }
  };

  const createBackup = async () => {
    if (!backupName.trim()) {
      showMessage('error', 'Please enter a backup name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/theme/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: backupName,
          description: backupDescription,
          includeTemplates: true,
          includeSections: true,
          includeStyles: true
        })
      });

      if (response.ok) {
        showMessage('success', 'Backup created successfully');
        await loadBackups();
        setShowCreateForm(false);
        setBackupName('');
        setBackupDescription('');
      } else {
        showMessage('error', 'Failed to create backup');
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      showMessage('error', 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will modify your current theme settings.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/theme/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId,
          ...restoreOptions
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', 'Backup restored successfully');
        
        // Show warnings if any
        if (data.warnings && data.warnings.length > 0) {
          console.warn('Restore warnings:', data.warnings);
        }
        
        // Reload page to show restored settings
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showMessage('error', data.error || 'Failed to restore backup');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      showMessage('error', 'Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/theme/restore?backupId=${backupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showMessage('success', 'Backup deleted successfully');
        await loadBackups();
      } else {
        showMessage('error', 'Failed to delete backup');
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
      showMessage('error', 'Failed to delete backup');
    } finally {
      setLoading(false);
    }
  };

  const exportBackup = async (backupId: string) => {
    try {
      const backup = backups.find(b => b.id === backupId);
      if (!backup) return;

      // Create download link
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-backup-${backup.themeId}-${backup.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showMessage('success', 'Backup exported successfully');
    } catch (error) {
      console.error('Failed to export backup:', error);
      showMessage('error', 'Failed to export backup');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Backup & Restore</h2>
          <p className="text-sm text-muted-foreground">
            Manage theme settings backups
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Create Backup
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Create Backup Form */}
      {showCreateForm && (
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-medium">Create New Backup</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Backup Name *
            </label>
            <input
              type="text"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder="e.g., Before major update"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <textarea
              value={backupDescription}
              onChange={(e) => setBackupDescription(e.target.value)}
              placeholder="Add notes about this backup..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={createBackup}
              disabled={loading || !backupName.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Create Backup
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setBackupName('');
                setBackupDescription('');
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Restore Options */}
      <div className="p-4 border rounded-lg space-y-3">
        <h3 className="font-medium">Restore Options</h3>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={restoreOptions.overwrite}
            onChange={(e) => setRestoreOptions({
              ...restoreOptions,
              overwrite: e.target.checked,
              mergeSettings: !e.target.checked // Can't merge if overwriting
            })}
          />
          <span className="text-sm">Overwrite existing settings</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={restoreOptions.mergeSettings}
            onChange={(e) => setRestoreOptions({
              ...restoreOptions,
              mergeSettings: e.target.checked
            })}
            disabled={restoreOptions.overwrite}
          />
          <span className="text-sm">Merge with current settings</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={restoreOptions.validateChecksum}
            onChange={(e) => setRestoreOptions({
              ...restoreOptions,
              validateChecksum: e.target.checked
            })}
          />
          <span className="text-sm">Validate backup integrity</span>
        </label>
      </div>

      {/* Backups List */}
      <div className="space-y-2">
        <h3 className="font-medium">Available Backups</h3>
        
        {backups.length === 0 ? (
          <div className="p-8 text-center border rounded-lg">
            <Archive className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No backups found</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first backup to save current theme settings
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className={`p-4 border rounded-lg hover:border-primary/50 transition-colors ${
                  selectedBackup === backup.id ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedBackup(
                      selectedBackup === backup.id ? null : backup.id
                    )}
                  >
                    <h4 className="font-medium">{backup.name}</h4>
                    {backup.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {backup.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(backup.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                      <span>Theme: {backup.themeId}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => restoreBackup(backup.id)}
                      disabled={loading}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Restore backup"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportBackup(backup.id)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      title="Export backup"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBackup(backup.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete backup"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-backup info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Automatic Backups</p>
            <p className="mt-1">
              The system automatically creates backups before major updates. 
              Manual backups are recommended before making significant changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}