'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Settings, Code, TrendingUp, Users, 
  ShoppingCart, Target, Activity, Loader2, CheckCircle,
  AlertCircle, Copy, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { GoogleIntegration } from '@prisma/client';

interface GoogleAnalyticsTabProps {
  subdomain: string;
  googleIntegration: GoogleIntegration;
  store: any;
}

export default function GoogleAnalyticsTab({ 
  subdomain, 
  googleIntegration,
  store 
}: GoogleAnalyticsTabProps) {
  const [propertyId, setPropertyId] = useState(googleIntegration.analyticsPropertyId || '');
  const [streamId, setStreamId] = useState(googleIntegration.analyticsStreamId || '');
  const [isEnabled, setIsEnabled] = useState(googleIntegration.enableAnalytics);
  const [isSaving, setIsSaving] = useState(false);
  const [showTrackingCode, setShowTrackingCode] = useState(false);

  const isConfigured = !!googleIntegration.analyticsPropertyId;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/google/analytics/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyticsPropertyId: propertyId,
          analyticsStreamId: streamId,
          enableAnalytics: isEnabled
        }),
      });

      if (response.ok) {
        toast.success('Google Analytics configuration saved');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const trackingCode = `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${propertyId || 'G-XXXXXXXXXX'}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${propertyId || 'G-XXXXXXXXXX'}');
</script>`;

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode);
    toast.success('Tracking code copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Analytics Configuration
          </CardTitle>
          <CardDescription>
            Connect your Google Analytics 4 property to track visitor behavior and conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <div>
                <p className="font-medium">
                  {isConfigured ? 'Google Analytics Connected' : 'Setup Required'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured 
                    ? `Property ID: ${googleIntegration.analyticsPropertyId}` 
                    : 'Enter your GA4 property details below'}
                </p>
              </div>
            </div>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property-id">GA4 Property ID</Label>
              <Input
                id="property-id"
                placeholder="G-XXXXXXXXXX"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Find this in Google Analytics → Admin → Property Settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream-id">Data Stream ID (Optional)</Label>
              <Input
                id="stream-id"
                placeholder="1234567890"
                value={streamId}
                onChange={(e) => setStreamId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For enhanced e-commerce tracking
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-analytics">Enable Analytics Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically add tracking code to your store
                </p>
              </div>
              <Switch
                id="enable-analytics"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowTrackingCode(!showTrackingCode)}
            >
              <Code className="h-4 w-4 mr-2" />
              {showTrackingCode ? 'Hide' : 'Show'} Tracking Code
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !propertyId}>
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

          {showTrackingCode && (
            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                <code>{trackingCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={copyTrackingCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>What Gets Tracked</CardTitle>
          <CardDescription>
            Automatic tracking includes these e-commerce events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Page Views</p>
                <p className="text-sm text-muted-foreground">
                  Track visitor navigation and popular pages
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">User Behavior</p>
                <p className="text-sm text-muted-foreground">
                  Session duration, bounce rate, demographics
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShoppingCart className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">E-commerce Events</p>
                <p className="text-sm text-muted-foreground">
                  Add to cart, checkout, purchases
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Conversion Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Revenue, conversion rate, product performance
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
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">Need help setting up?</p>
              <p className="text-sm text-muted-foreground">
                Follow our step-by-step guide to create a GA4 property and connect it to your store.
              </p>
              <Button variant="link" className="h-auto p-0">
                View Setup Guide
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}