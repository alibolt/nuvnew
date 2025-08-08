
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { StoreDetails } from "@/components/admin/store-details";

export default async function AdminStoreDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      subdomain: true,
      userId: true,
      status: true,
      createdAt: true,
      user: {
        select: { email: true, name: true },
      },
      _count: {
        select: {
          products: true,
          orders: true,
          categories: true,
        },
      },
    },
  });

  if (!store) {
    return (
      <DashboardWrapper session={session} activeTab="stores">
        <div className="p-4 md:p-8">
          <h1 className="text-2xl font-bold">Store not found</h1>
        <p>The store you are looking for does not exist.</p>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper session={session} activeTab="stores">
      <StoreDetails store={store} />
    </DashboardWrapper>
  );
}
