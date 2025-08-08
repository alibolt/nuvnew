
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { UserDetails } from "@/components/admin/user-details";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // Add any other related data you want to show
      // stores: true,
    },
  });

  if (!user) {
    return (
      <DashboardWrapper session={session} activeTab="users">
        <div className="p-8">
          <h1 className="text-2xl font-bold">User not found</h1>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper session={session} activeTab="users">
      <UserDetails user={user} />
    </DashboardWrapper>
  );
}
