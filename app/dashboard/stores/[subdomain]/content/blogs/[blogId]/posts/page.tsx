import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PostsManager from './posts-manager';

export default async function BlogPostsPage({
  params
}: {
  params: Promise<{ subdomain: string; blogId: string }>;
}) {
  const session = await requireAuth();
  if (!session) {
    redirect('/login');
  }

  const { subdomain, blogId } = await params;
  
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id,
    },
  });

  if (!store) {
    redirect('/dashboard');
  }

  const blog = await prisma.blog.findFirst({
    where: {
      id: blogId,
      storeId: store.id
    }
  });

  if (!blog) {
    redirect(`/dashboard/stores/${subdomain}/content/blogs`);
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{blog.title}</h1>
        <p className="text-gray-600">Manage posts in this blog</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <PostsManager subdomain={subdomain} blogId={blogId} blogTitle={blog.title} />
      </Suspense>
    </div>
  );
}