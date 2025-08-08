

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { StoresList } from "@/components/admin/stores-list";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";

export default async function AdminStoresPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      subdomain: true,
      userId: true,
      createdAt: true,
      user: {
        select: { email: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <DashboardWrapper session={session} activeTab="stores">
      <div>
        <h1 className="text-2xl font-bold mb-4">Store Management</h1>
        <StoresList stores={stores} />
      </div>
    </DashboardWrapper>
  );
}

