'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Store, MapPin, Clock, Phone, Globe, 
  Star, MessageSquare, Camera, Loader2,
  CheckCircle, AlertCircle, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { GoogleIntegration } from '@prisma/client';

interface GoogleBusinessProfileTabProps {
  subdomain: string;
  googleIntegration: GoogleIntegration;
  store: any;
}

export default function GoogleBusinessProfileTab({ 
  subdomain, 
  googleIntegration,
  store 
}: GoogleBusinessProfileTabProps) {
  const [profileId, setProfileId] = useState(googleIntegration.businessProfileId || '');
  const [isEnabled, setIsEnabled] = useState(googleIntegration.enableBusinessProfile);
  const [autoSyncInfo, setAutoSyncInfo] = useState(true);
  const [autoPostUpdates, setAutoPostUpdates] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    name: store.name || '',
    description: store.description || '',
    phone: store.phone || '',
    address: store.address || '',
    website: `https://${store.subdomain}.nuvi.store`
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isConfigured = !!googleIntegration.businessProfileId;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/google/business-profile/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: profileId,
          enableBusinessProfile: isEnabled,
          autoSyncInfo,
          autoPostUpdates,
          businessInfo
        }),
      });

      if (response.ok) {
        toast.success('Business Profile configuration saved');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyProfile = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/google/business-profile/verify`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Business Profile verified');
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      toast.error('Failed to verify Business Profile');
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
            <Store className="h-5 w-5" />
            Business Profile Configuration
          </CardTitle>
          <CardDescription>
            Manage your Google Business Profile to improve local search visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <div>
                <p className="font-medium">
                  {isConfigured ? 'Business Profile Connected' : 'Setup Required'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured 
                    ? `Profile ID: ${googleIntegration.businessProfileId}` 
                    : 'Connect your Google Business Profile'}
                </p>
              </div>
            </div>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-id">Business Profile ID</Label>
              <Input
                id="profile-id"
                placeholder="accounts/1234567890/locations/0987654321"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Found in Google Business Profile API or management interface
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-profile">Enable Business Profile Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Sync business information and manage reviews
                </p>
              </div>
              <Switch
                id="enable-profile"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync">Auto-sync Business Info</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep hours, contact info, and description updated
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={autoSyncInfo}
                  onCheckedChange={setAutoSyncInfo}
                  disabled={!isEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-post">Auto-post Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Share new products and promotions automatically
                  </p>
                </div>
                <Switch
                  id="auto-post"
                  checked={autoPostUpdates}
                  onCheckedChange={setAutoPostUpdates}
                  disabled={!isEnabled}
                />
              </div>
            </div>

            {isConfigured && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Verification Required</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Verify your business ownership to enable all features
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleVerifyProfile}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Business'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving || !profileId}>
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

      {/* Business Information Card */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Information synced with your Google Business Profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={businessInfo.name}
                  onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-phone">Phone Number</Label>
                <Input
                  id="business-phone"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-address">Address</Label>
              <Input
                id="business-address"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-description">Business Description</Label>
              <Textarea
                id="business-description"
                rows={3}
                value={businessInfo.description}
                onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-website">Website</Label>
              <Input
                id="business-website"
                value={businessInfo.website}
                onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>What Gets Managed</CardTitle>
          <CardDescription>
            Features available with Business Profile integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Location Management</p>
                <p className="text-sm text-muted-foreground">
                  Update address and service areas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Business Hours</p>
                <p className="text-sm text-muted-foreground">
                  Sync regular and holiday hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Review Management</p>
                <p className="text-sm text-muted-foreground">
                  Monitor and respond to customer reviews
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Q&A Management</p>
                <p className="text-sm text-muted-foreground">
                  Answer customer questions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Camera className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Photos & Posts</p>
                <p className="text-sm text-muted-foreground">
                  Share updates and product photos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Insights & Analytics</p>
                <p className="text-sm text-muted-foreground">
                  Track profile views and interactions
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
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Phone Calls</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <Phone className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}