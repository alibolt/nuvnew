'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, X, Upload, Download, Search, Tags, 
  ArrowRight, RefreshCw, FileText, Zap, Hash, Save
} from 'lucide-react';
import { toast } from 'sonner';

interface SynonymGroup {
  id: string;
  terms: string[];
  type: 'bidirectional' | 'unidirectional';
  category?: string;
  isActive: boolean;
}

interface SynonymManagementProps {
  subdomain: string;
  settings: any;
}

const defaultTemplates = [
  {
    name: 'Clothing',
    groups: [
      { terms: ['tshirt', 't-shirt', 'tee', 'shirt'], type: 'bidirectional' },
      { terms: ['pants', 'trousers', 'slacks'], type: 'bidirectional' },
      { terms: ['sweater', 'jumper', 'pullover'], type: 'bidirectional' },
      { terms: ['sneakers', 'trainers', 'tennis shoes'], type: 'bidirectional' },
    ]
  },
  {
    name: 'Colors',
    groups: [
      { terms: ['grey', 'gray'], type: 'bidirectional' },
      { terms: ['beige', 'tan', 'khaki'], type: 'bidirectional' },
      { terms: ['navy', 'dark blue', 'navy blue'], type: 'bidirectional' },
    ]
  },
  {
    name: 'Tech',
    groups: [
      { terms: ['laptop', 'notebook', 'computer'], type: 'bidirectional' },
      { terms: ['phone', 'mobile', 'smartphone', 'cell'], type: 'bidirectional' },
      { terms: ['headphones', 'earphones', 'earbuds'], type: 'bidirectional' },
    ]
  }
];

export function SynonymManagement({ subdomain, settings }: SynonymManagementProps) {
  const [synonymGroups, setSynonymGroups] = useState<SynonymGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [newGroupTerms, setNewGroupTerms] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    fetchSynonyms();
  }, []);

  const fetchSynonyms = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/search/synonyms`);
      if (response.ok) {
        const data = await response.json();
        setSynonymGroups(data.synonyms || []);
      }
    } catch (error) {
      console.error('Error fetching synonyms:', error);
      toast.error('Failed to load synonyms');
    } finally {
      setLoading(false);
    }
  };

  const addSynonymGroup = () => {
    if (!newGroupTerms.trim()) {
      toast.error('Please enter at least one term');
      return;
    }

    const terms = newGroupTerms
      .split(',')
      .map(term => term.trim())
      .filter(term => term.length > 0);

    if (terms.length < 2) {
      toast.error('Please enter at least two terms separated by commas');
      return;
    }

    const newGroup: SynonymGroup = {
      id: Date.now().toString(),
      terms,
      type: 'bidirectional',
      isActive: true
    };

    setSynonymGroups([...synonymGroups, newGroup]);
    setNewGroupTerms('');
    toast.success('Synonym group added');
  };

  const removeSynonymGroup = (groupId: string) => {
    setSynonymGroups(synonymGroups.filter(g => g.id !== groupId));
  };

  const toggleGroupStatus = (groupId: string) => {
    setSynonymGroups(synonymGroups.map(group => 
      group.id === groupId 
        ? { ...group, isActive: !group.isActive }
        : group
    ));
  };

  const updateGroupTerms = (groupId: string, index: number, newTerm: string) => {
    setSynonymGroups(synonymGroups.map(group => {
      if (group.id === groupId) {
        const newTerms = [...group.terms];
        if (newTerm.trim()) {
          newTerms[index] = newTerm.trim();
        } else {
          newTerms.splice(index, 1);
        }
        return { ...group, terms: newTerms };
      }
      return group;
    }));
  };

  const addTermToGroup = (groupId: string) => {
    setSynonymGroups(synonymGroups.map(group => 
      group.id === groupId 
        ? { ...group, terms: [...group.terms, ''] }
        : group
    ));
  };

  const testSynonyms = async () => {
    if (!testQuery.trim()) return;

    // Simulate synonym expansion
    const expandedTerms = [testQuery];
    synonymGroups.forEach(group => {
      if (group.isActive && group.terms.includes(testQuery.toLowerCase())) {
        expandedTerms.push(...group.terms.filter(t => t !== testQuery.toLowerCase()));
      }
    });

    setTestResults([...new Set(expandedTerms)]);
  };

  const saveSynonyms = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/search/synonyms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synonyms: synonymGroups }),
      });

      if (response.ok) {
        toast.success('Synonyms saved successfully');
        await fetchSynonyms();
      } else {
        throw new Error('Failed to save synonyms');
      }
    } catch (error) {
      toast.error('Failed to save synonyms');
    } finally {
      setSaving(false);
    }
  };

  const importTemplate = (templateName: string) => {
    const template = defaultTemplates.find(t => t.name === templateName);
    if (!template) return;

    const newGroups = template.groups.map((group, index) => ({
      id: `template-${Date.now()}-${index}`,
      ...group,
      category: templateName,
      isActive: true
    }));

    setSynonymGroups([...synonymGroups, ...newGroups]);
    toast.success(`Imported ${template.groups.length} synonym groups from ${templateName} template`);
  };

  const exportSynonyms = () => {
    const data = synonymGroups.map(group => ({
      terms: group.terms.join(','),
      type: group.type,
      category: group.category || '',
      active: group.isActive
    }));

    const csv = [
      'Terms,Type,Category,Active',
      ...data.map(row => 
        `"${row.terms}","${row.type}","${row.category}",${row.active}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synonyms-${subdomain}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">
            <Tags className="h-4 w-4 mr-2" />
            Manage Synonyms
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="test">
            <Zap className="h-4 w-4 mr-2" />
            Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Synonym Groups</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportSynonyms}
                    disabled={synonymGroups.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      // TODO: Implement CSV import
                      toast.info('CSV import coming soon');
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Group */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter synonyms separated by commas (e.g., laptop, notebook, computer)"
                  value={newGroupTerms}
                  onChange={(e) => setNewGroupTerms(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSynonymGroup()}
                />
                <Button onClick={addSynonymGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              </div>

              {/* Synonym Groups */}
              <div className="space-y-3">
                {synonymGroups.map((group) => (
                  <Card key={group.id} className={!group.isActive ? 'opacity-60' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={group.isActive ? 'default' : 'secondary'}>
                            {group.type === 'bidirectional' ? '↔️' : '→'} 
                            {group.type}
                          </Badge>
                          {group.category && (
                            <Badge variant="outline">{group.category}</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGroupStatus(group.id)}
                          >
                            {group.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSynonymGroup(group.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.terms.map((term, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Input
                              className="w-32 h-8"
                              value={term}
                              onChange={(e) => updateGroupTerms(group.id, index, e.target.value)}
                              onBlur={() => {
                                if (!term.trim() && group.terms.length > 2) {
                                  updateGroupTerms(group.id, index, '');
                                }
                              }}
                            />
                            {index < group.terms.length - 1 && (
                              <span className="text-muted-foreground">≈</span>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addTermToGroup(group.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {synonymGroups.length === 0 && (
                <div className="text-center py-8">
                  <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No synonym groups yet. Add your first group above!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Import pre-defined synonym groups for common industries
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {defaultTemplates.map((template) => (
                  <Card key={template.name} className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.groups.length} synonym groups
                      </p>
                      <div className="space-y-1 mb-4">
                        {template.groups.slice(0, 2).map((group, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            • {group.terms.slice(0, 3).join(', ')}...
                          </p>
                        ))}
                      </div>
                      <Button
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={() => importTemplate(template.name)}
                      >
                        Import Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Synonym Expansion</CardTitle>
              <p className="text-sm text-muted-foreground">
                See how your search terms will be expanded with synonyms
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a search term to test"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && testSynonyms()}
                />
                <Button onClick={testSynonyms}>
                  <Search className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Search will include:</p>
                  <div className="flex flex-wrap gap-2">
                    {testResults.map((term, i) => (
                      <Badge key={i} variant={i === 0 ? 'default' : 'secondary'}>
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSynonyms} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Synonyms
            </>
          )}
        </Button>
      </div>
    </div>
  );
}