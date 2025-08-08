
"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsFormField } from "@/components/settings/settings-form-field";
import { SettingsInput } from "@/components/settings/settings-input";
import { SettingsTextarea } from "@/components/settings/settings-textarea";
import { SettingsToggle } from "@/components/settings/settings-toggle";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { updatePlatformSettingsAction } from "@/app/actions";
import { toast } from "sonner";

interface PlatformSettings {
  platformName: string;
  defaultEmail: string;
  supportEmail: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUsername: string | null;
  smtpPassword: string | null;
  smtpEncryption: string | null;
  platformLogoUrl: string | null;
  faviconUrl: string | null;
  copyrightText: string | null;
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
  tiktokPixelId: string | null;
  hotjarId: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
}

interface PlatformSettingsFormProps {
  settings: PlatformSettings;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}

export function PlatformSettingsForm({ settings }: PlatformSettingsFormProps) {
  const [state, formAction] = useFormState(updatePlatformSettingsAction, {
    message: "",
    success: false,
  });

  // Display toast messages based on form state changes
  useState(() => {
    if (state.success) {
      toast.success(state.message);
    } else if (state.message) {
      toast.error(state.message);
    }
  });

  return (
    <form action={formAction} className="space-y-6">
      <SettingsCard
        title="General Settings"
        description="Configure basic platform information."
      >
        <SettingsFormField label="Platform Name">
          <SettingsInput
            name="platformName"
            defaultValue={settings.platformName || ""}
            placeholder="Nuvi SaaS Platform"
            required
          />
        </SettingsFormField>
        <SettingsFormField label="Default System Email">
          <SettingsInput
            name="defaultEmail"
            type="email"
            defaultValue={settings.defaultEmail || ""}
            placeholder="noreply@yourplatform.com"
            required
          />
        </SettingsFormField>
        <SettingsFormField label="Support Email">
          <SettingsInput
            name="supportEmail"
            type="email"
            defaultValue={settings.supportEmail || ""}
            placeholder="support@yourplatform.com"
            required
          />
        </SettingsFormField>
        <SettingsFormField label="Default Currency">
          <SettingsInput
            name="defaultCurrency"
            defaultValue={settings.defaultCurrency || ""}
            placeholder="USD"
            required
          />
        </SettingsFormField>
      </SettingsCard>

      <SettingsCard
        title="SMTP Settings"
        description="Configure your email sending service (SMTP) for system notifications."
      >
        <SettingsFormField label="SMTP Host">
          <SettingsInput
            name="smtpHost"
            defaultValue={settings.smtpHost || ""}
            placeholder="smtp.example.com"
          />
        </SettingsFormField>
        <SettingsFormField label="SMTP Port">
          <SettingsInput
            name="smtpPort"
            type="number"
            defaultValue={settings.smtpPort || 587}
            placeholder="587"
          />
        </SettingsFormField>
        <SettingsFormField label="SMTP Username">
          <SettingsInput
            name="smtpUsername"
            defaultValue={settings.smtpUsername || ""}
            placeholder="your-username"
          />
        </SettingsFormField>
        <SettingsFormField label="SMTP Password">
          <SettingsInput
            name="smtpPassword"
            type="password"
            defaultValue={settings.smtpPassword || ""}
            placeholder="your-password"
          />
        </SettingsFormField>
        <SettingsFormField label="SMTP Encryption">
          <SettingsInput
            name="smtpEncryption"
            defaultValue={settings.smtpEncryption || "TLS"}
            placeholder="TLS, SSL, None"
          />
        </SettingsFormField>
      </SettingsCard>

      <SettingsCard
        title="Appearance & Branding"
        description="Customize the platform's visual identity."
      >
        <SettingsFormField label="Platform Logo URL">
          <SettingsInput
            name="platformLogoUrl"
            defaultValue={settings.platformLogoUrl || ""}
            placeholder="https://yourplatform.com/logo.png"
          />
        </SettingsFormField>
        <SettingsFormField label="Favicon URL">
          <SettingsInput
            name="faviconUrl"
            defaultValue={settings.faviconUrl || ""}
            placeholder="https://yourplatform.com/favicon.ico"
          />
        </SettingsFormField>
        <SettingsFormField label="Copyright Text">
          <SettingsInput
            name="copyrightText"
            defaultValue={settings.copyrightText || ""}
            placeholder="© 2025 Your Company. All rights reserved."
          />
        </SettingsFormField>
      </SettingsCard>

      <SettingsCard
        title="Analytics & Tracking"
        description="Integrate with analytics services to track platform usage."
      >
        <SettingsFormField label="Google Analytics ID">
          <SettingsInput
            name="googleAnalyticsId"
            defaultValue={settings.googleAnalyticsId || ""}
            placeholder="G-XXXXXXXXXX"
          />
        </SettingsFormField>
        <SettingsFormField label="Facebook Pixel ID">
          <SettingsInput
            name="facebookPixelId"
            defaultValue={settings.facebookPixelId || ""}
            placeholder="1234567890123456"
          />
        </SettingsFormField>
        <SettingsFormField label="TikTok Pixel ID">
          <SettingsInput
            name="tiktokPixelId"
            defaultValue={settings.tiktokPixelId || ""}
            placeholder="1234567890"
          />
        </SettingsFormField>
        <SettingsFormField label="Hotjar ID">
          <SettingsInput
            name="hotjarId"
            defaultValue={settings.hotjarId || ""}
            placeholder="1234567"
          />
        </SettingsFormField>
      </SettingsCard>

      <SettingsCard
        title="Social Media Links"
        description="Links to your platform's official social media pages."
      >
        <SettingsFormField label="Facebook URL">
          <SettingsInput
            name="facebookUrl"
            defaultValue={settings.facebookUrl || ""}
            placeholder="https://facebook.com/yourplatform"
          />
        </SettingsFormField>
        <SettingsFormField label="Twitter URL">
          <SettingsInput
            name="twitterUrl"
            defaultValue={settings.twitterUrl || ""}
            placeholder="https://twitter.com/yourplatform"
          />
        </SettingsFormField>
        <SettingsFormField label="LinkedIn URL">
          <SettingsInput
            name="linkedinUrl"
            defaultValue={settings.linkedinUrl || ""}
            placeholder="https://linkedin.com/company/yourplatform"
          />
        </SettingsFormField>
        <SettingsFormField label="Instagram URL">
          <SettingsInput
            name="instagramUrl"
            defaultValue={settings.instagramUrl || ""}
            placeholder="https://instagram.com/yourplatform"
          />
        </SettingsFormField>
        <SettingsFormField label="YouTube URL">
          <SettingsInput
            name="youtubeUrl"
            defaultValue={settings.youtubeUrl || ""}
            placeholder="https://youtube.com/yourplatform"
          />
        </SettingsFormField>
      </SettingsCard>

      <SettingsCard
        title="Maintenance Mode"
        description="Enable or disable platform-wide maintenance mode."
      >
        <SettingsFormField label="Enable Maintenance Mode">
          <SettingsToggle
            name="maintenanceMode"
            defaultChecked={settings.maintenanceMode}
          />
        </SettingsFormField>
        {settings.maintenanceMode && (
          <SettingsFormField label="Maintenance Message">
            <SettingsTextarea
              name="maintenanceMessage"
              defaultValue={settings.maintenanceMessage || ""}
              placeholder="Our platform is currently undergoing scheduled maintenance. We'll be back shortly!"
            />
          </SettingsFormField>
        )}
      </SettingsCard>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
