
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { PricingPlanForm } from "@/components/admin/pricing-plan-form";

export default async function EditPricingPlanPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  const plan = await prisma.pricingPlan.findUnique({
    where: { id: params.id },
  });

  if (!plan) {
    return (
      <DashboardWrapper session={session} activeTab="pricing">
        <div className="p-4 md:p-8">
          <h1 className="text-2xl font-bold">Pricing Plan not found</h1>
        <p>The pricing plan you are looking for does not exist.</p>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper session={session} activeTab="pricing">
      <PricingPlanForm plan={plan} />
    </DashboardWrapper>
  );
}
