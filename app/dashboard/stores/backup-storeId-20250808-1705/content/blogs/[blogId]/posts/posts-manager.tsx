'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  tags: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PostsManagerProps {
  storeId: string;
  blogId: string;
  blogTitle: string;
}

export default function PostsManager({ storeId, blogId, blogTitle }: PostsManagerProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [storeId, blogId]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}/blogs/${blogId}/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/stores/${storeId}/blogs/${blogId}/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/stores/${storeId}/content/blogs`}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nuvi-primary)]"
            />
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/stores/${storeId}/content/blogs/${blogId}/posts/new`)}
          className="bg-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-hover)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'No posts found matching your search.' : 'No posts yet. Create your first post!'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => router.push(`/dashboard/stores/${storeId}/content/blogs/${blogId}/posts/new`)}
              className="bg-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-hover)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Post
            </Button>
          )}
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
                      {post.excerpt && (
                        <div className="text-sm text-gray-500 truncate max-w-md">{post.excerpt}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.author}
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
                      <Link
                        href={`/dashboard/stores/${storeId}/content/blogs/${blogId}/posts/${post.id}`}
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