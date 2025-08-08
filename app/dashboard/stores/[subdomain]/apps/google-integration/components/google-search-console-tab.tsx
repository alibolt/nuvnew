'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Globe, TrendingUp, AlertCircle, 
  FileText, Link, Loader2, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { GoogleIntegration } from '@prisma/client';

interface GoogleSearchConsoleTabProps {
  subdomain: string;
  googleIntegration: GoogleIntegration;
  store: any;
}

export default function GoogleSearchConsoleTab({ 
  subdomain, 
  googleIntegration,
  store 
}: GoogleSearchConsoleTabProps) {
  const [propertyUrl, setPropertyUrl] = useState(googleIntegration.searchConsoleUrl || '');
  const [isEnabled, setIsEnabled] = useState(googleIntegration.enableSearchConsole);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isConfigured = !!googleIntegration.searchConsoleUrl;
  const storeUrl = `https://${store.subdomain}.nuvi.store`;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/google/search-console/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchConsoleUrl: propertyUrl || storeUrl,
          enableSearchConsole: isEnabled
        }),
      });

      if (response.ok) {
        toast.success('Search Console configuration saved');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/google/search-console/verify`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Site verification successful');
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      toast.error('Site verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Console Configuration
          </CardTitle>
          <CardDescription>
            Monitor your site's search performance and fix indexing issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <div>
                <p className="font-medium">
                  {isConfigured ? 'Search Console Connected' : 'Setup Required'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured 
                    ? `Property: ${googleIntegration.searchConsoleUrl}` 
                    : 'Configure your Search Console property'}
                </p>
              </div>
            </div>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property-url">Website URL</Label>
              <Input
                id="property-url"
                placeholder={storeUrl}
                value={propertyUrl}
                onChange={(e) => setPropertyUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use your store's default URL
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-search-console">Enable Search Console Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Submit sitemaps and monitor search performance
                </p>
              </div>
              <Switch
                id="enable-search-console"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-blue-900 dark:text-blue-100">Site Verification Required</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    We'll automatically verify your site ownership using your Google account.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleVerify}
                    disabled={isVerifying || !isConfigured}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Site Ownership'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>What Gets Tracked</CardTitle>
          <CardDescription>
            Automatic monitoring and optimization features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Search Performance</p>
                <p className="text-sm text-muted-foreground">
                  Keywords, impressions, clicks, and CTR
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Indexing Status</p>
                <p className="text-sm text-muted-foreground">
                  Monitor which pages are indexed by Google
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Sitemap Submission</p>
                <p className="text-sm text-muted-foreground">
                  Automatically submit your product sitemap
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Link className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Link Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Track internal and external links
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {isConfigured && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Impressions</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average CTR</p>
                  <p className="text-2xl font-bold">--%</p>
                </div>
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Indexed Pages</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}