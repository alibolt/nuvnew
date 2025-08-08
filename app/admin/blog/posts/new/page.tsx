
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { PlatformBlogPostForm } from "@/components/admin/platform-blog-post-form";
import { prisma } from "@/lib/prisma";

export default async function NewPlatformBlogPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  // Fetch the default platform blog to associate the post with
  let platformBlog = await prisma.platformBlog.findFirst();

  if (!platformBlog) {
    // Create a default blog if none exists
    platformBlog = await prisma.platformBlog.create({
      data: {
        name: "Default Platform Blog",
        slug: "default-platform-blog",
        description: "The official blog for the Nuvi SaaS platform.",
      },
    });
  }

  return (
    <DashboardWrapper session={session} activeTab="blog">
      <PlatformBlogPostForm blogId={platformBlog.id} />
    </DashboardWrapper>
  );
}
