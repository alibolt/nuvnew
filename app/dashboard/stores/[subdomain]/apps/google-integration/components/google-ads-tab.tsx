'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Target, Settings, Code, TrendingUp, 
  ShoppingCart, DollarSign, MousePointerClick,
  Loader2, AlertCircle, Copy, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { GoogleIntegration } from '@prisma/client';

interface GoogleAdsTabProps {
  subdomain: string;
  googleIntegration: GoogleIntegration;
  store: any;
}

export default function GoogleAdsTab({ 
  subdomain, 
  googleIntegration,
  store 
}: GoogleAdsTabProps) {
  const [accountId, setAccountId] = useState(googleIntegration.adsAccountId || '');
  const [isEnabled, setIsEnabled] = useState(googleIntegration.enableAds);
  const [enableConversionTracking, setEnableConversionTracking] = useState(true);
  const [enableDynamicRemarketing, setEnableDynamicRemarketing] = useState(true);
  const [enableEnhancedConversions, setEnableEnhancedConversions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConversionCode, setShowConversionCode] = useState(false);

  const isConfigured = !!googleIntegration.adsAccountId;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/google/ads/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adsAccountId: accountId,
          enableAds: isEnabled,
          conversionSettings: {
            enableConversionTracking,
            enableDynamicRemarketing,
            enableEnhancedConversions
          }
        }),
      });

      if (response.ok) {
        toast.success('Google Ads configuration saved');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const conversionCode = `<!-- Google Ads Conversion Tracking -->
<script>
  gtag('event', 'conversion', {
    'send_to': '${accountId || 'AW-XXXXXXXXX'}/CONVERSION_LABEL',
    'value': 1.0,
    'currency': 'USD',
    'transaction_id': ''
  });
</script>`;

  const remarketingCode = `<!-- Google Ads Remarketing -->
<script>
  gtag('event', 'page_view', {
    'send_to': '${accountId || 'AW-XXXXXXXXX'}',
    'ecomm_pagetype': 'product',
    'ecomm_prodid': ['SKU123'],
    'ecomm_totalvalue': 99.99
  });
</script>`;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Google Ads Configuration
          </CardTitle>
          <CardDescription>
            Set up conversion tracking and remarketing for your Google Ads campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <div>
                <p className="font-medium">
                  {isConfigured ? 'Google Ads Connected' : 'Setup Required'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured 
                    ? `Account ID: ${googleIntegration.adsAccountId}` 
                    : 'Enter your Google Ads account ID below'}
                </p>
              </div>
            </div>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-id">Google Ads Account ID</Label>
              <Input
                id="account-id"
                placeholder="AW-XXXXXXXXX"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Format: AW-XXXXXXXXX (found in Google Ads → Account settings)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-ads">Enable Google Ads Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Track conversions and enable remarketing
                </p>
              </div>
              <Switch
                id="enable-ads"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="conversion-tracking">Conversion Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track purchases and key actions
                  </p>
                </div>
                <Switch
                  id="conversion-tracking"
                  checked={enableConversionTracking}
                  onCheckedChange={setEnableConversionTracking}
                  disabled={!isEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dynamic-remarketing">Dynamic Remarketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Show ads with viewed products
                  </p>
                </div>
                <Switch
                  id="dynamic-remarketing"
                  checked={enableDynamicRemarketing}
                  onCheckedChange={setEnableDynamicRemarketing}
                  disabled={!isEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enhanced-conversions">Enhanced Conversions</Label>
                  <p className="text-sm text-muted-foreground">
                    Improve conversion accuracy with hashed data
                  </p>
                </div>
                <Switch
                  id="enhanced-conversions"
                  checked={enableEnhancedConversions}
                  onCheckedChange={setEnableEnhancedConversions}
                  disabled={!isEnabled}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowConversionCode(!showConversionCode)}
            >
              <Code className="h-4 w-4 mr-2" />
              {showConversionCode ? 'Hide' : 'Show'} Tracking Codes
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !accountId}>
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

          {showConversionCode && (
            <div className="space-y-4">
              <div className="relative">
                <Label>Conversion Tracking Code</Label>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto mt-2">
                  <code>{conversionCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-0 right-0"
                  onClick={() => copyCode(conversionCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <Label>Remarketing Code</Label>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto mt-2">
                  <code>{remarketingCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-0 right-0"
                  onClick={() => copyCode(remarketingCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracked Events Card */}
      <Card>
        <CardHeader>
          <CardTitle>Automatically Tracked Events</CardTitle>
          <CardDescription>
            E-commerce events sent to Google Ads for optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <ShoppingCart className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Purchase Conversion</p>
                <p className="text-sm text-muted-foreground">
                  Track completed orders with value
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MousePointerClick className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Add to Cart</p>
                <p className="text-sm text-muted-foreground">
                  Track when items are added to cart
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Begin Checkout</p>
                <p className="text-sm text-muted-foreground">
                  Track checkout initiation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">View Item</p>
                <p className="text-sm text-muted-foreground">
                  Track product page views
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {isConfigured && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <p className="text-sm text-muted-foreground">Conversion Value</p>
                  <p className="text-2xl font-bold">$--</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">--%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROAS</p>
                  <p className="text-2xl font-bold">--x</p>
                </div>
                <MousePointerClick className="h-8 w-8 text-muted-foreground" />
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
              <p className="font-medium">Setting up Google Ads Conversion Tracking</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Create conversion actions in your Google Ads account</li>
                <li>Copy your conversion ID and label for each action</li>
                <li>Enter your Google Ads account ID above</li>
                <li>Enable the tracking features you need</li>
                <li>Save the configuration to start tracking</li>
              </ol>
              <Button variant="link" className="h-auto p-0">
                View detailed setup guide
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}