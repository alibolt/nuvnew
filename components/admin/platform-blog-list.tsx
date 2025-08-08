
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePlatformBlogPostAction } from "@/app/actions"; // This action needs to be created

interface PlatformBlogPost {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: Date;
}

interface PlatformBlog {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  posts: PlatformBlogPost[];
}

interface PlatformBlogListProps {
  blog: PlatformBlog;
}

export function PlatformBlogList({ blog }: PlatformBlogListProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the post "${postTitle}"? This action is irreversible.`)) {
      setIsDeleting(true);
      try {
        await deletePlatformBlogPostAction(postId);
        toast.success("Blog post deleted successfully.");
      } catch (error) {
        console.error("Failed to delete blog post:", error);
        toast.error(`Failed to delete blog post: ${(error as Error).message}`);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Platform Blog: {blog.name}</h1>
        <Link href="/admin/blog/posts/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Blog Post
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {blog.posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No blog posts found. Click "New Blog Post" to create one.
                    </td>
                  </tr>
                ) : (
                  blog.posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{post.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/blog/posts/${post.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id, post.title)} disabled={isDeleting}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
