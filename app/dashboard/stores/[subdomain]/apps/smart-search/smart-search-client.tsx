'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  FileSearch, Settings, BarChart3, Database, 
  RefreshCw, Save, Search, Filter, Tags
} from 'lucide-react';
import SearchAnalytics from '../../analytics/search-analytics';
import { SearchSettings } from '@prisma/client';
import { FilterConfiguration } from './components/filter-configuration';
import { SynonymManagement } from './components/synonym-management';
import IndexManagement from './components/index-management';

interface SmartSearchClientProps {
  subdomain: string;
  searchSettings: SearchSettings | null;
}

export default function SmartSearchClient({ subdomain, searchSettings }: SmartSearchClientProps) {
  const [settings, setSettings] = useState({
    enableFuzzySearch: searchSettings?.enableFuzzySearch ?? true,
    fuzzyThreshold: searchSettings?.fuzzyThreshold ?? 0.8,
    enableSynonyms: searchSettings?.enableSynonyms ?? true,
    enableAutoComplete: searchSettings?.enableAutoComplete ?? true,
    autoCompleteMinChars: searchSettings?.autoCompleteMinChars ?? 3,
    autoCompleteMaxResults: searchSettings?.autoCompleteMaxResults ?? 10,
    searchResultsPerPage: searchSettings?.searchResultsPerPage ?? 24,
    enableSpellCorrection: searchSettings?.enableSpellCorrection ?? true,
    enableSearchHistory: searchSettings?.enableSearchHistory ?? true,
    historyRetentionDays: searchSettings?.historyRetentionDays ?? 30,
    enablePopularSearches: searchSettings?.enablePopularSearches ?? true,
    popularSearchesCount: searchSettings?.popularSearchesCount ?? 10,
    defaultSortOrder: searchSettings?.defaultSortOrder ?? 'relevance',
    enableFacetedSearch: searchSettings?.enableFacetedSearch ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/search/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Search settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/search/index/rebuild`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Search index rebuilt successfully. Indexed ${data.stats.products} products, ${data.stats.categories} categories, ${data.stats.pages} pages.`);
      } else {
        throw new Error('Failed to rebuild index');
      }
    } catch (error) {
      toast.error('Failed to rebuild search index');
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Smart Search & Discovery</h1>
          <p className="text-muted-foreground mt-1">
            Advanced search with AI-powered suggestions and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReindex}
            disabled={reindexing}
          >
            {reindexing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Reindexing...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Rebuild Index
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="index">
            <Database className="h-4 w-4 mr-2" />
            Index
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="synonyms">
            <Tags className="h-4 w-4 mr-2" />
            Synonyms
          </TabsTrigger>
          <TabsTrigger value="filters">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fuzzy Search */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fuzzy-search">Fuzzy Search</Label>
                    <p className="text-sm text-muted-foreground">
                      Find products even with typos or misspellings
                    </p>
                  </div>
                  <Switch
                    id="fuzzy-search"
                    checked={settings.enableFuzzySearch}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableFuzzySearch: checked }))
                    }
                  />
                </div>
                {settings.enableFuzzySearch && (
                  <div className="pl-6 space-y-2">
                    <Label htmlFor="fuzzy-threshold">Similarity Threshold</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="fuzzy-threshold"
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.1"
                        value={settings.fuzzyThreshold}
                        onChange={(e) => 
                          setSettings(prev => ({ ...prev, fuzzyThreshold: parseFloat(e.target.value) }))
                        }
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">{settings.fuzzyThreshold}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto Complete */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autocomplete">Auto Complete</Label>
                    <p className="text-sm text-muted-foreground">
                      Show search suggestions as users type
                    </p>
                  </div>
                  <Switch
                    id="autocomplete"
                    checked={settings.enableAutoComplete}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableAutoComplete: checked }))
                    }
                  />
                </div>
                {settings.enableAutoComplete && (
                  <div className="pl-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-chars">Minimum Characters</Label>
                      <Input
                        id="min-chars"
                        type="number"
                        min="1"
                        max="5"
                        value={settings.autoCompleteMinChars}
                        onChange={(e) => 
                          setSettings(prev => ({ ...prev, autoCompleteMinChars: parseInt(e.target.value) }))
                        }
                        className="w-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-results">Maximum Results</Label>
                      <Input
                        id="max-results"
                        type="number"
                        min="5"
                        max="20"
                        value={settings.autoCompleteMaxResults}
                        onChange={(e) => 
                          setSettings(prev => ({ ...prev, autoCompleteMaxResults: parseInt(e.target.value) }))
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Other Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="spell-correction">Spell Correction</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically correct spelling mistakes
                    </p>
                  </div>
                  <Switch
                    id="spell-correction"
                    checked={settings.enableSpellCorrection}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableSpellCorrection: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="synonyms">Synonym Support</Label>
                    <p className="text-sm text-muted-foreground">
                      Match products using synonyms (e.g., "tee" for "t-shirt")
                    </p>
                  </div>
                  <Switch
                    id="synonyms"
                    checked={settings.enableSynonyms}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableSynonyms: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="faceted-search">Faceted Filtering</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable advanced filters (price, color, size, etc.)
                    </p>
                  </div>
                  <Switch
                    id="faceted-search"
                    checked={settings.enableFacetedSearch}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableFacetedSearch: checked }))
                    }
                  />
                </div>
              </div>

              {/* Display Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Display Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="results-per-page">Results Per Page</Label>
                  <Select
                    value={settings.searchResultsPerPage.toString()}
                    onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, searchResultsPerPage: parseInt(value) }))
                    }
                  >
                    <SelectTrigger id="results-per-page" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="36">36</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort-order">Default Sort Order</Label>
                  <Select
                    value={settings.defaultSortOrder}
                    onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, defaultSortOrder: value }))
                    }
                  >
                    <SelectTrigger id="sort-order" className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="index">
          <IndexManagement subdomain={subdomain} />
        </TabsContent>

        <TabsContent value="analytics">
          <SearchAnalytics subdomain={subdomain} />
        </TabsContent>

        <TabsContent value="synonyms" className="space-y-4">
          <SynonymManagement
            subdomain={subdomain}
            settings={settings}
          />
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <FilterConfiguration
            subdomain={subdomain}
            settings={settings}
            onSave={async (filterSettings) => {
              const updatedSettings = { ...settings, ...filterSettings };
              setSettings(updatedSettings);
              await handleSaveSettings();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}