
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { PricingPlanForm } from "@/components/admin/pricing-plan-form";

export default async function NewPricingPlanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  return (
    <DashboardWrapper session={session} activeTab="pricing">
      <PricingPlanForm />
    </DashboardWrapper>
  );
}
