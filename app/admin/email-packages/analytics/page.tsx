import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';
import EmailAnalyticsClient from './email-analytics-client';

export default async function EmailAnalytics() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  return (
    <DashboardWrapper session={session} activeTab="email-packages">
      <EmailAnalyticsClient />
    </DashboardWrapper>
  );
}