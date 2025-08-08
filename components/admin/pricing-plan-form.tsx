"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsFormField } from "@/components/settings/settings-form-field";
import { SettingsInput } from "@/components/settings/settings-input";
import { SettingsTextarea } from "@/components/settings/settings-textarea";
import { SettingsToggle } from "@/components/settings/settings-toggle";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createPricingPlanAction, updatePricingPlanAction } from "@/app/actions";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceAnnually: number;
  features: any; // JSON type
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PricingPlanFormProps {
  plan?: PricingPlan; // Optional for edit mode
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
      ) : (
        "Save Plan"
      )}
    </Button>
  );
}

export function PricingPlanForm({ plan }: PricingPlanFormProps) {
  const isEditMode = !!plan;
  const action = isEditMode ? updatePricingPlanAction : createPricingPlanAction;

  const [state, formAction] = useFormState(action, {
    message: "",
    success: false,
  });

  // Display toast messages based on form state changes
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <form action={formAction} className="space-y-6">
        {isEditMode && <input type="hidden" name="planId" value={plan.id} />}

        <SettingsCard
          title={isEditMode ? "Edit Pricing Plan" : "New Pricing Plan"}
          description="Define the details of your subscription plan."
        >
          <SettingsFormField label="Plan Name">
            <SettingsInput
              name="name"
              defaultValue={plan?.name || ""}
              placeholder="Basic Plan"
              required
            />
          </SettingsFormField>
          <SettingsFormField label="Slug (URL Friendly Name)">
            <SettingsInput
              name="slug"
              defaultValue={plan?.slug || ""}
              placeholder="basic-plan"
              required
            />
          </SettingsFormField>
          <SettingsFormField label="Description">
            <SettingsTextarea
              name="description"
              defaultValue={plan?.description || ""}
              placeholder="A brief description of the plan."
            />
          </SettingsFormField>
          <SettingsFormField label="Monthly Price">
            <SettingsInput
              name="priceMonthly"
              type="number"
              step="0.01"
              defaultValue={plan?.priceMonthly || 0}
              required
            />
          </SettingsFormField>
          <SettingsFormField label="Annually Price">
            <SettingsInput
              name="priceAnnually"
              type="number"
              step="0.01"
              defaultValue={plan?.priceAnnually || 0}
              required
            />
          </SettingsFormField>
          <SettingsFormField label="Features (JSON Array)">
            <SettingsTextarea
              name="features"
              defaultValue={JSON.stringify(plan?.features || [], null, 2)}
              placeholder='["Feature 1", "Feature 2"]'
            />
          </SettingsFormField>
          <SettingsFormField label="Is Active">
            <SettingsToggle
              name="isActive"
              defaultChecked={plan?.isActive || false}
            />
          </SettingsFormField>
        </SettingsCard>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </>
  );
}