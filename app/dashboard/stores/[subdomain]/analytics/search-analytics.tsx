'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SearchAnalyticsProps {
  subdomain: string;
}

interface SearchQuery {
  id: string;
  query: string;
  normalizedQuery: string;
  resultCount: number;
  createdAt: string;
  deviceType?: string;
}

interface PopularSearch {
  query: string;
  count: number;
  clickThroughRate: number;
  averagePosition: number;
}

interface SearchMetrics {
  totalSearches: number;
  uniqueSearches: number;
  averageResultsPerSearch: number;
  searchesWithNoResults: number;
  clickThroughRate: number;
  conversionRate: number;
}

const COLORS = ['#8B9F7E', '#6B7F5E', '#4B5F3E', '#2B3F1E'];

export default function SearchAnalytics({ subdomain }: SearchAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [searchQueries, setSearchQueries] = useState<SearchQuery[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [metrics, setMetrics] = useState<SearchMetrics | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchSearchData();
  }, [subdomain, dateRange]);

  const fetchSearchData = async () => {
    try {
      setLoading(true);
      
      // Fetch search analytics data
      const response = await fetch(`/api/stores/${subdomain}/analytics/search?period=${dateRange}`);
      if (!response.ok) throw new Error('Failed to fetch search analytics');
      
      const data = await response.json();
      setSearchQueries(data.queries || []);
      setPopularSearches(data.popularSearches || []);
      setMetrics(data.metrics || null);
    } catch (error) {
      console.error('Error fetching search analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSearchVolumeData = () => {
    // Group searches by date
    const volumeByDate: { [key: string]: number } = {};
    
    searchQueries.forEach(query => {
      const date = new Date(query.createdAt).toLocaleDateString();
      volumeByDate[date] = (volumeByDate[date] || 0) + 1;
    });

    return Object.entries(volumeByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  };

  const getDeviceTypeData = () => {
    const deviceCounts: { [key: string]: number } = {};
    
    searchQueries.forEach(query => {
      const device = query.deviceType || 'unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    return Object.entries(deviceCounts).map(([device, value]) => ({
      name: device.charAt(0).toUpperCase() + device.slice(1),
      value
    }));
  };

  const filteredPopularSearches = popularSearches.filter(search =>
    search.query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
        <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Search Analytics</h2>
        <div className="flex gap-2">
          <Button
            variant={dateRange === '7days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('7days')}
          >
            Last 7 Days
          </Button>
          <Button
            variant={dateRange === '30days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('30days')}
          >
            Last 30 Days
          </Button>
          <Button
            variant={dateRange === '90days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('90days')}
          >
            Last 90 Days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSearches.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.uniqueSearches} unique searches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.clickThroughRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Users clicking on results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Results Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((metrics.searchesWithNoResults / metrics.totalSearches) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Searches with no results
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="volume" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="volume">Search Volume</TabsTrigger>
          <TabsTrigger value="popular">Popular Searches</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="no-results">No Results</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Volume Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getSearchVolumeData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8B9F7E"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Search Terms</CardTitle>
              <Input
                placeholder="Filter searches..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="max-w-sm"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredPopularSearches.slice(0, 20).map((search, index) => (
                  <div
                    key={search.query}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{search.query}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">
                        {search.count} searches
                      </Badge>
                      <span className="text-sm text-gray-500">
                        CTR: {search.clickThroughRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search by Device Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getDeviceTypeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getDeviceTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="no-results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Searches with No Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                These search terms returned no products. Consider adding relevant products or synonyms.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const noResultQueries = searchQueries
                    .filter(q => q.resultCount === 0)
                    .reduce((acc: { [key: string]: number }, query) => {
                      acc[query.normalizedQuery] = (acc[query.normalizedQuery] || 0) + 1;
                      return acc;
                    }, {});
                  
                  return Object.entries(noResultQueries)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 20)
                    .map(([query, count], index) => (
                      <div
                        key={query}
                        className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50"
                      >
                        <span className="font-medium">{query}</span>
                        <Badge variant="outline" className="border-orange-300">
                          {count} searches
                        </Badge>
                      </div>
                    ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}