'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingBag, Settings, Upload, RefreshCw, 
  AlertCircle, CheckCircle, Package, Loader2,
  Calendar, TrendingUp, AlertTriangle, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { GoogleIntegration } from '@prisma/client';

interface GoogleMerchantCenterTabProps {
  subdomain: string;
  googleIntegration: GoogleIntegration;
  store: any;
  productsCount: number;
}

export default function GoogleMerchantCenterTab({ 
  subdomain, 
  googleIntegration,
  store,
  productsCount 
}: GoogleMerchantCenterTabProps) {
  const [merchantId, setMerchantId] = useState(googleIntegration.merchantCenterId || '');
  const [isEnabled, setIsEnabled] = useState(googleIntegration.enableMerchantCenter);
  const [autoSync, setAutoSync] = useState(googleIntegration.autoSyncProducts);
  const [syncFrequency, setSyncFrequency] = useState(googleIntegration.syncFrequency);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isConfigured = !!googleIntegration.merchantCenterId;
  const lastSync = googleIntegration.lastSyncAt ? new Date(googleIntegration.lastSyncAt) : null;
  const syncStatus = googleIntegration.syncStatus || 'never';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/google/merchant-center/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantCenterId: merchantId,
          enableMerchantCenter: isEnabled,
          autoSyncProducts: autoSync,
          syncFrequency
        }),
      });

      if (response.ok) {
        toast.success('Merchant Center configuration saved');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/google/merchant-center/sync`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Product sync started');
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast.error('Failed to start sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncStatusBadge = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Badge variant="default" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="gap-1 text-green-600">
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>;
      default:
        return <Badge variant="secondary">Never synced</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Merchant Center Configuration
          </CardTitle>
          <CardDescription>
            Connect your Google Merchant Center to sync products and manage shopping campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <div>
                <p className="font-medium">
                  {isConfigured ? 'Merchant Center Connected' : 'Setup Required'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured 
                    ? `Merchant ID: ${googleIntegration.merchantCenterId}` 
                    : 'Enter your Merchant Center ID below'}
                </p>
              </div>
            </div>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-id">Merchant Center ID</Label>
              <Input
                id="merchant-id"
                placeholder="1234567890"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Find this in Merchant Center → Settings → Business information
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-merchant-center">Enable Product Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync your products to Google Shopping
                </p>
              </div>
              <Switch
                id="enable-merchant-center"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Automatic Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Keep your product feed up to date automatically
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
                disabled={!isEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sync-frequency">Sync Frequency</Label>
              <Select value={syncFrequency} onValueChange={setSyncFrequency} disabled={!autoSync || !isEnabled}>
                <SelectTrigger id="sync-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleSyncNow}
              disabled={!isConfigured || isSyncing || syncStatus === 'syncing'}
            >
              {isSyncing || syncStatus === 'syncing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !merchantId}>
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

      {/* Sync Status Card */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Sync Status
            </CardTitle>
            <CardDescription>
              Monitor your product feed synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Status</p>
                <p className="text-sm text-muted-foreground">
                  {lastSync ? `Last synced ${lastSync.toLocaleDateString()}` : 'Never synced'}
                </p>
              </div>
              {getSyncStatusBadge()}
            </div>

            {syncStatus === 'syncing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Syncing products...</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{productsCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Successfully Synced</p>
                <p className="text-2xl font-bold text-green-600">--</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>What Gets Synced</CardTitle>
          <CardDescription>
            Product data automatically synchronized with Google Shopping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Product Information</p>
                <p className="text-sm text-muted-foreground">
                  Title, description, price, availability
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShoppingBag className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Product Images</p>
                <p className="text-sm text-muted-foreground">
                  High-quality images optimized for Shopping ads
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Inventory Updates</p>
                <p className="text-sm text-muted-foreground">
                  Real-time stock levels and pricing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Promotional Prices</p>
                <p className="text-sm text-muted-foreground">
                  Sale prices and special offers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">Requirements for Google Shopping</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Valid GTIN/UPC codes for applicable products</li>
                <li>Accurate product descriptions and titles</li>
                <li>High-quality product images (minimum 100x100 pixels)</li>
                <li>Correct pricing and availability information</li>
                <li>Compliance with Google Shopping policies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}