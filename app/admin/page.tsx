
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  console.log("Session in AdminPage:", session); // DEBUG LOG
  if (!session?.user || session.user.role.toLowerCase() !== "admin") {
    redirect("/");
  }

  // Aggregate data for the entire platform
  const totalUsers = await prisma.user.count();
  const totalStores = await prisma.store.count();
  const totalOrders = await prisma.order.count();
  
  const orders = await prisma.order.findMany({
    select: { totalPrice: true },
  });
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // Get email statistics
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const totalEmailsSent = await prisma.emailLog.count({
    where: {
      status: 'sent',
      createdAt: {
        gte: monthStart
      }
    }
  });

  // Count stores with active email settings
  const activeEmailSubscriptions = await prisma.storeSettings.count({
    where: {
      emailSettings: {
        path: '$.enabled',
        equals: true
      }
    }
  });

  const platformStats = {
    totalRevenue,
    totalUsers,
    totalStores,
    totalOrders,
    totalEmailsSent,
    activeEmailSubscriptions,
    recentUsers,
  };

  return (
    <DashboardWrapper session={session} activeTab="overview">
      <AdminDashboardContent stats={platformStats} />
    </DashboardWrapper>
  );
}

