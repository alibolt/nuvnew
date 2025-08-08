
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { PlatformBlogList } from "@/components/admin/platform-blog-list";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  // Fetch the single platform blog (or create if it doesn't exist)
  let platformBlog = await prisma.platformBlog.findFirst({
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true, isPublished: true, createdAt: true },
      },
    },
  });

  if (!platformBlog) {
    // Create a default blog if none exists
    platformBlog = await prisma.platformBlog.create({
      data: {
        name: "Default Platform Blog",
        slug: "default-platform-blog",
        description: "The official blog for the Nuvi SaaS platform.",
      },
      include: {
        posts: true,
      },
    });
  }

  return (
    <DashboardWrapper session={session} activeTab="blog">
      <PlatformBlogList blog={platformBlog} />
    </DashboardWrapper>
  );
}
