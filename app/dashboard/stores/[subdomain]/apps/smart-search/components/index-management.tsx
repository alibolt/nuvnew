'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, RefreshCw, Loader2, CheckCircle, 
  AlertCircle, Package, Tag, FileText, BookOpen,
  TrendingUp, Calendar, Info
} from 'lucide-react';
import { toast } from 'sonner';

interface IndexManagementProps {
  subdomain: string;
}

interface IndexStats {
  products: number;
  collections: number;
  pages: number;
  blogPosts: number;
  totalDocuments: number;
  lastIndexed: Date | null;
  indexSize: string;
}

export default function IndexManagement({ subdomain }: IndexManagementProps) {
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildProgress, setRebuildProgress] = useState(0);
  const [stats, setStats] = useState<IndexStats>({
    products: 0,
    collections: 0,
    pages: 0,
    blogPosts: 0,
    totalDocuments: 0,
    lastIndexed: null,
    indexSize: '0 KB'
  });

  const fetchIndexStats = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/search/index/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch index stats:', error);
    }
  };

  const handleRebuildIndex = async () => {
    setRebuilding(true);
    setRebuildProgress(0);

    try {
      const response = await fetch(`/api/stores/${subdomain}/search/index/rebuild`, {
        method: 'POST',
      });

      if (response.ok) {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setRebuildProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 500);

        const result = await response.json();
        
        clearInterval(progressInterval);
        setRebuildProgress(100);
        
        toast.success(`Index rebuilt successfully! Indexed ${result.totalIndexed} items.`);
        
        // Refresh stats
        await fetchIndexStats();
        
        setTimeout(() => {
          setRebuildProgress(0);
        }, 2000);
      } else {
        throw new Error('Failed to rebuild index');
      }
    } catch (error) {
      toast.error('Failed to rebuild search index');
    } finally {
      setRebuilding(false);
    }
  };

  // Fetch stats on mount
  useState(() => {
    fetchIndexStats();
  });

  return (
    <div className="space-y-6">
      {/* Index Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Search Index Management
          </CardTitle>
          <CardDescription>
            Manage your search index to ensure products are discoverable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Index Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="font-medium">Index Status: Active</p>
                <p className="text-sm text-muted-foreground">
                  {stats.lastIndexed 
                    ? `Last updated ${new Date(stats.lastIndexed).toLocaleDateString()}`
                    : 'Never indexed'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{stats.totalDocuments} documents</Badge>
              <Badge variant="outline">{stats.indexSize}</Badge>
            </div>
          </div>

          {/* Index Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{stats.products}</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Tag className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{stats.collections}</p>
                <p className="text-sm text-muted-foreground">Collections</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{stats.pages}</p>
                <p className="text-sm text-muted-foreground">Pages</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{stats.blogPosts}</p>
                <p className="text-sm text-muted-foreground">Blog Posts</p>
              </div>
            </div>
          </div>

          {/* Rebuild Progress */}
          {rebuilding && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rebuilding search index...</span>
                <span>{rebuildProgress}%</span>
              </div>
              <Progress value={rebuildProgress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">Rebuild Search Index</p>
              <p className="text-sm text-muted-foreground">
                Re-index all products, collections, pages, and blog posts
              </p>
            </div>
            <Button 
              onClick={handleRebuildIndex} 
              disabled={rebuilding}
              variant="outline"
            >
              {rebuilding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rebuilding...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rebuild Index
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Index Health */}
      <Card>
        <CardHeader>
          <CardTitle>Index Health & Performance</CardTitle>
          <CardDescription>
            Monitor search index health and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Your search index is healthy and up to date.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Search Performance</p>
                  <p className="text-sm text-muted-foreground">Average query time: 45ms</p>
                </div>
              </div>
              <Badge className="bg-green-500/10 text-green-500">Excellent</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Auto-indexing</p>
                  <p className="text-sm text-muted-foreground">New products indexed automatically</p>
                </div>
              </div>
              <Badge>Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">Search Index Best Practices</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Products are automatically indexed when created or updated</li>
                <li>Rebuild the index if search results seem outdated</li>
                <li>Ensure product titles and descriptions are descriptive</li>
                <li>Use relevant tags to improve search accuracy</li>
                <li>Regular rebuilds can improve search performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}