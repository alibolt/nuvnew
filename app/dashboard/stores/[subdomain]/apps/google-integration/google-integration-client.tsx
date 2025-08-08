'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, BarChart3, Search, ShoppingBag, 
  Store as StoreIcon, Link, RefreshCw, AlertCircle,
  CheckCircle, XCircle, ExternalLink, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { GoogleIntegration } from '@prisma/client';
import GoogleAnalyticsTab from './components/google-analytics-tab';
import GoogleSearchConsoleTab from './components/google-search-console-tab';
import GoogleMerchantCenterTab from './components/google-merchant-center-tab';
import GoogleAdsTab from './components/google-ads-tab';
import GoogleBusinessProfileTab from './components/google-business-profile-tab';

interface GoogleIntegrationClientProps {
  subdomain: string;
  store: any;
  googleIntegration: GoogleIntegration | null;
  productsCount: number;
}

export default function GoogleIntegrationClient({ 
  subdomain, 
  store, 
  googleIntegration,
  productsCount 
}: GoogleIntegrationClientProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isConnected = !!googleIntegration?.accessToken;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Initiate OAuth flow
      const response = await fetch(`/api/stores/${subdomain}/google/auth`, {
        method: 'POST',
      });

      if (response.ok) {
        const { authUrl } = await response.json();
        // Redirect to Google OAuth
        window.location.href = authUrl;
      } else {
        throw new Error('Failed to initiate Google authentication');
      }
    } catch (error) {
      toast.error('Failed to connect to Google');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from Google? This will remove all integrations.')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/google/disconnect`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Disconnected from Google');
        window.location.reload();
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      toast.error('Failed to disconnect from Google');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Google Integration Suite</h1>
          <p className="text-muted-foreground mt-1">
            Connect your store with Google Analytics, Search Console, Merchant Center, and more
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Connected
              </Badge>
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Connect Google Account
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Link className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Connect Your Google Account</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Connect your Google account to enable powerful integrations with Analytics, 
                Search Console, Merchant Center, and more.
              </p>
              <Button size="lg" onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Connect Google Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="search-console">
              <Search className="h-4 w-4 mr-2" />
              Search Console
            </TabsTrigger>
            <TabsTrigger value="merchant-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Merchant Center
            </TabsTrigger>
            <TabsTrigger value="ads">
              <Settings className="h-4 w-4 mr-2" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="business-profile">
              <StoreIcon className="h-4 w-4 mr-2" />
              Business Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <GoogleAnalyticsTab
              subdomain={subdomain}
              googleIntegration={googleIntegration}
              store={store}
            />
          </TabsContent>

          <TabsContent value="search-console">
            <GoogleSearchConsoleTab
              subdomain={subdomain}
              googleIntegration={googleIntegration}
              store={store}
            />
          </TabsContent>

          <TabsContent value="merchant-center">
            <GoogleMerchantCenterTab
              subdomain={subdomain}
              googleIntegration={googleIntegration}
              store={store}
              productsCount={productsCount}
            />
          </TabsContent>

          <TabsContent value="ads">
            <GoogleAdsTab
              subdomain={subdomain}
              googleIntegration={googleIntegration}
              store={store}
            />
          </TabsContent>

          <TabsContent value="business-profile">
            <GoogleBusinessProfileTab
              subdomain={subdomain}
              googleIntegration={googleIntegration}
              store={store}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}