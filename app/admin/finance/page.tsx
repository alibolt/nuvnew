
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";

export default async function AdminFinancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  return (
    <DashboardWrapper session={session} activeTab="finance">
      <div>
        <h1 className="text-2xl font-bold mb-4">Financial Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This page will contain platform-wide financial statistics and reports.
        </p>
      </div>
    </DashboardWrapper>
  );
}
