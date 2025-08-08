
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { PricingPlansList } from "@/components/admin/pricing-plans-list";

export default async function AdminPricingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  const pricingPlans = await prisma.pricingPlan.findMany({
    orderBy: { priceMonthly: "asc" },
  });

  return (
    <DashboardWrapper session={session} activeTab="pricing">
      <PricingPlansList pricingPlans={pricingPlans} />
    </DashboardWrapper>
  );
}
