'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  Save,
  Download,
  Upload,
  RefreshCw,
  Copy,
  RotateCcw,
  Archive,
  History,
  Clock,
  Trash2,
  Plus,
  Code,
  Image,
  X,
  FileJson,
  Settings,
  AlertCircle,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { Editor } from '@monaco-editor/react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface ThemeCodeEditorProps {
  storeId: string;
  subdomain: string;
  themeCode: string;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return <Code className="w-4 h-4 text-blue-500" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-500" />;
    case 'css':
    case 'scss':
      return <FileText className="w-4 h-4 text-purple-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return <Image className="w-4 h-4 text-green-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

const getLanguage = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'scss':
      return 'scss';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
};

export function ThemeCodeEditor({ storeId, subdomain, themeCode }: ThemeCodeEditorProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [fileHistory, setFileHistory] = useState<any[]>([]);

  // Load theme files
  useEffect(() => {
    loadThemeFiles();
  }, [themeCode]);

  const loadThemeFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/themes/${themeCode}/files`);
      if (response.ok) {
        const data = await response.json();
        console.log('[ThemeCodeEditor] Files loaded:', data.files);
        setFileTree(data.files);
        // Auto-expand first level folders
        const firstLevel = data.files
          .filter((f: FileNode) => f.type === 'directory')
          .map((f: FileNode) => f.path);
        setExpandedFolders(new Set(firstLevel));
      } else {
        toast.error('Failed to load theme files');
      }
    } catch (error) {
      toast.error('Error loading theme files');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFileContent = async (file: FileNode) => {
    if (file.type !== 'file') return;
    
    try {
      const response = await fetch(
        `/api/stores/${subdomain}/themes/${themeCode}/files/${encodeURIComponent(file.path)}`
      );
      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content);
        setSelectedFile(file);
        setHasUnsavedChanges(false);
      } else {
        toast.error('Failed to load file content');
      }
    } catch (error) {
      toast.error('Error loading file');
    }
  };

  const saveFile = async () => {
    if (!selectedFile || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/stores/${subdomain}/themes/${themeCode}/files/${encodeURIComponent(selectedFile.path)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: fileContent }),
        }
      );
      
      if (response.ok) {
        toast.success('File saved successfully');
        setHasUnsavedChanges(false);
      } else {
        toast.error('Failed to save file');
      }
    } catch (error) {
      toast.error('Error saving file');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadTheme = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/themes/${themeCode}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${themeCode}-theme.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Theme downloaded successfully');
      } else {
        toast.error('Failed to download theme');
      }
    } catch (error) {
      toast.error('Error downloading theme');
    }
  };

  const duplicateTheme = async () => {
    const newName = prompt('Enter name for the duplicated theme:');
    if (!newName) return;
    
    try {
      const response = await fetch(`/api/stores/${subdomain}/themes/${themeCode}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      
      if (response.ok) {
        toast.success('Theme duplicated successfully');
        // Optionally redirect to the new theme
        const data = await response.json();
        window.location.href = `/dashboard/stores/${subdomain}/themes/code-editor?theme=${data.themeCode}`;
      } else {
        toast.error('Failed to duplicate theme');
      }
    } catch (error) {
      toast.error('Error duplicating theme');
    }
  };

  const loadFileHistory = async (file: FileNode) => {
    if (!file || file.type !== 'file') return;
    
    try {
      const response = await fetch(
        `/api/stores/${subdomain}/themes/${themeCode}/file-history?filePath=${encodeURIComponent(file.path)}`
      );
      if (response.ok) {
        const data = await response.json();
        setFileHistory(data.history);
        setShowHistory(true);
      } else {
        toast.error('Failed to load file history');
      }
    } catch (error) {
      toast.error('Error loading file history');
    }
  };

  const restoreVersion = async (historyId: string) => {
    if (!selectedFile) return;
    
    if (!confirm('Are you sure you want to restore this version? Current changes will be saved to history.')) {
      return;
    }
    
    try {
      const response = await fetch(
        `/api/stores/${subdomain}/themes/${themeCode}/file-history`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ historyId, filePath: selectedFile.path }),
        }
      );
      
      if (response.ok) {
        toast.success('Version restored successfully');
        setShowHistory(false);
        // Reload the file content
        await loadFileContent(selectedFile);
      } else {
        toast.error('Failed to restore version');
      }
    } catch (error) {
      toast.error('Error restoring version');
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes
      .filter(node => 
        searchTerm === '' || 
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((node) => {
        const isExpanded = expandedFolders.has(node.path);
        const isSelected = selectedFile?.path === node.path;
        
        return (
          <div key={node.path}>
            <div
              className={`
                flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer
                ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''}
              `}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => {
                if (node.type === 'directory') {
                  toggleFolder(node.path);
                } else {
                  loadFileContent(node);
                }
              }}
            >
              {node.type === 'directory' ? (
                <>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <Folder className="w-4 h-4 text-yellow-600" />
                  )}
                </>
              ) : (
                <>
                  <span className="w-4" />
                  {getFileIcon(node.name)}
                </>
              )}
              <span className="text-sm truncate">{node.name}</span>
            </div>
            {node.type === 'directory' && isExpanded && node.children && (
              <div>{renderFileTree(node.children, level + 1)}</div>
            )}
          </div>
        );
      });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, fileContent, hasUnsavedChanges]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading theme files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b p-3 space-y-3">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border rounded-lg"
          />
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={downloadTheme}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100"
                title="Download theme as ZIP"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={duplicateTheme}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100"
                title="Duplicate theme"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
            </div>
          </div>
        </div>
        
        {/* File tree */}
        <div className="flex-1 overflow-auto p-2">
          {renderFileTree(fileTree)}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            {/* Editor toolbar */}
            <div className="border-b px-4 py-2 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFile.name)}
                <span className="font-medium">{selectedFile.path}</span>
                {hasUnsavedChanges && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Unsaved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadFileHistory(selectedFile)}
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                  title="View file history"
                >
                  <History className="w-4 h-4" />
                  History
                </button>
                <button
                  onClick={saveFile}
                  disabled={!hasUnsavedChanges || isSaving}
                  className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium
                    ${hasUnsavedChanges 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <span className="text-xs text-gray-500">
                  Cmd+S to save
                </span>
              </div>
            </div>
            
            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                value={fileContent}
                language={getLanguage(selectedFile.name)}
                theme="vs-light"
                onChange={(value) => {
                  setFileContent(value || '');
                  setHasUnsavedChanges(true);
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-3" />
              <p className="text-lg font-medium">No file selected</p>
              <p className="text-sm mt-1">Select a file from the sidebar to edit</p>
            </div>
          </div>
        )}
      </div>
      
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5" />
                File History: {selectedFile?.path}
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {fileHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No history available for this file</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fileHistory.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="border rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-medium">
                              {entry.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.createdAt).toLocaleString()}
                            </span>
                            {index === 0 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{entry.message}</p>
                          {entry.diff && (
                            <p className="text-xs text-gray-500 mt-1">{entry.diff}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Size: {(entry.fileSize / 1024).toFixed(1)} KB</span>
                            <span className={`
                              ${entry.changeType === 'create' ? 'text-green-600' : ''}
                              ${entry.changeType === 'update' ? 'text-blue-600' : ''}
                              ${entry.changeType === 'delete' ? 'text-red-600' : ''}
                            `}>
                              {entry.changeType.charAt(0).toUpperCase() + entry.changeType.slice(1)}
                            </span>
                          </div>
                        </div>
                        {index > 0 && (
                          <button
                            onClick={() => restoreVersion(entry.id)}
                            className="px-3 py-1 text-sm border rounded hover:bg-blue-50 hover:border-blue-300"
                          >
                            <RotateCcw className="w-4 h-4 inline mr-1" />
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}