
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { PlatformBlogPostForm } from "@/components/admin/platform-blog-post-form";
import { prisma } from "@/lib/prisma";

export default async function EditPlatformBlogPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  const post = await prisma.platformBlogPost.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    return (
      <DashboardWrapper session={session} activeTab="blog">
        <div className="p-4 md:p-8">
          <h1 className="text-2xl font-bold">Blog Post not found</h1>
        <p>The blog post you are looking for does not exist.</p>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper session={session} activeTab="blog">
      <PlatformBlogPostForm blogId={post.blogId} post={post} />
    </DashboardWrapper>
  );
}
