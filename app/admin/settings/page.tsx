
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { prisma } from "@/lib/prisma";
import { PlatformSettingsForm } from "@/components/admin/platform-settings-form";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  let settings = await prisma.platformSettings.findFirst();

  // Provide default settings if none exist
  if (!settings) {
    settings = {
      id: "", // Will be generated on first save
      platformName: "Nuvi SaaS",
      defaultEmail: "noreply@nuvi.com",
      supportEmail: "support@nuvi.com",
      defaultCurrency: "USD",
      maintenanceMode: false,
      maintenanceMessage: "Our platform is currently undergoing scheduled maintenance. We'll be back shortly!",
      smtpHost: null,
      smtpPort: null,
      smtpUsername: null,
      smtpPassword: null,
      smtpEncryption: "TLS",
      platformLogoUrl: null,
      faviconUrl: null,
      copyrightText: "© 2025 Nuvi SaaS. All rights reserved.",
      googleAnalyticsId: null,
      facebookPixelId: null,
      tiktokPixelId: null,
      hotjarId: null,
      facebookUrl: null,
      twitterUrl: null,
      linkedinUrl: null,
      instagramUrl: null,
      youtubeUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return (
    <DashboardWrapper session={session} activeTab="settings">
      <PlatformSettingsForm settings={settings} />
    </DashboardWrapper>
  );
}
