
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePricingPlanAction } from "@/app/actions"; // This action needs to be created

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

interface PricingPlansListProps {
  pricingPlans: PricingPlan[];
}

export function PricingPlansList({ pricingPlans }: PricingPlansListProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (window.confirm(`Are you sure you want to delete the pricing plan "${planName}"? This action is irreversible.`)) {
      setIsDeleting(true);
      try {
        await deletePricingPlanAction(planId);
        toast.success("Pricing plan deleted successfully.");
      } catch (error) {
        console.error("Failed to delete pricing plan:", error);
        toast.error(`Failed to delete pricing plan: ${(error as Error).message}`);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Pricing Plans</h1>
        <Link href="/admin/pricing/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Plan
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annually Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {pricingPlans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No pricing plans found. Click "New Plan" to create one.
                    </td>
                  </tr>
                ) : (
                  pricingPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{plan.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${plan.priceMonthly.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${plan.priceAnnually.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/pricing/${plan.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePlan(plan.id, plan.name)} disabled={isDeleting}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
