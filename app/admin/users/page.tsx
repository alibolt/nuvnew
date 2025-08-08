
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { UsersList } from "@/components/admin/users-list";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <DashboardWrapper session={session} activeTab="users">
      <div>
        <UsersList users={users} />
      </div>
    </DashboardWrapper>
  );
}
