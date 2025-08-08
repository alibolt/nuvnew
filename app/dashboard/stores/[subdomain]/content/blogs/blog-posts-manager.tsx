'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, ExternalLink, FileEdit, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  blog?: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function BlogPostsManager({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [subdomain]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${subdomain}/blog-posts`);
      if (response.ok) {
        const result = await response.json();
        // Handle API response format { success: true, data: [...] }
        const postsArray = result.data || result.posts || result || [];
        // Ensure we have an array
        const posts = Array.isArray(postsArray) ? postsArray : [];
        console.log('Fetched blog posts:', posts);
        setPosts(posts);
      } else {
        console.error('Blog posts API error:', response.status, response.statusText);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await fetch(`/api/stores/${subdomain}/blog-posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.isPublished).length,
    draft: posts.filter(p => !p.isPublished).length,
    views: 0 // TODO: Implement view tracking
  };

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Blog Stats */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md">
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Posts</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{stats.total}</p>
              </div>
              <FileEdit className="h-6 w-6 nuvi-text-primary" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Published</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{stats.published}</p>
              </div>
              <CheckCircle className="h-6 w-6 nuvi-text-success" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Draft</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{stats.draft}</p>
              </div>
              <Clock className="h-6 w-6 nuvi-text-warning" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Views</p>
                <p className="nuvi-text-2xl nuvi-font-bold">{stats.views}</p>
              </div>
              <Eye className="h-6 w-6 nuvi-text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blog posts..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nuvi-primary)]"
        />
      </div>

      {/* Blog Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="nuvi-card">
          <div className="nuvi-card-content">
            <div className="nuvi-text-center nuvi-py-xl">
              <FileEdit className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">
                {searchQuery ? 'No blog posts found matching your search.' : 'No blog posts yet'}
              </h3>
              <p className="nuvi-text-muted nuvi-mb-lg">
                {searchQuery ? 'Try adjusting your search terms.' : 'Write your first blog post to get started'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push(`/dashboard/stores/${subdomain}/content?tab=content&content_view=blog-editor&edit=new`)}
                  className="bg-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-hover)]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Write Post
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">/{post.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{post.author}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.isPublished ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Draft
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.publishedAt 
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.isPublished && (
                        <Link
                          href={`#`} // Will be the actual blog URL
                          target="_blank"
                          className="p-2 text-gray-600 hover:text-gray-900 transition"
                          title="View post"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/stores/${subdomain}/content?tab=content&content_view=blog-editor&edit=${post.id}`}
                        className="p-2 text-gray-600 hover:text-gray-900 transition"
                        title="Edit post"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition"
                        title="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}