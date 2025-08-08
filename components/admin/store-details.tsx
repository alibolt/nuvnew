
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteStoreAction } from "@/app/actions"; // This action needs to be created
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Store {
  id: string;
  name: string;
  subdomain: string;
  userId: string;
  createdAt: Date;
  status: string; // Added status field
  user: { email: string | null; name: string | null };
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface StoreDetailsProps {
  store: Store;
}

export function StoreDetails({ store }: StoreDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete store ${store.name} (${store.subdomain})? This action is irreversible.`)) {
      setIsDeleting(true);
      try {
        await deleteStoreAction(store.id);
        toast.success("Store deleted successfully.");
        router.push("/admin/stores"); // Redirect to stores list after deletion
      } catch (error) {
        console.error("Failed to delete store:", error);
        toast.error("Failed to delete store. See console for details.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Store Details: {store.name}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>ID:</strong> {store.id}</p>
            <p><strong>Name:</strong> {store.name}</p>
            <p><strong>Subdomain:</strong> {store.subdomain}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${store.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{store.status.toUpperCase()}</span></p>
            <p><strong>Created:</strong> {new Date(store.createdAt).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {store.user.name || 'N/A'}</p>
            <p><strong>Email:</strong> <Link href={`/admin/users/${store.userId}`} className="text-blue-600 hover:underline">{store.user.email}</Link></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Products:</strong> {store._count.products}</p>
            <p><strong>Orders:</strong> {store._count.orders}</p>
            <p><strong>Categories:</strong> {store._count.categories}</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/50 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These actions are permanent and cannot be undone. Please proceed with caution.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting Store...</>
                ) : (
                  <><Trash2 className="mr-2 h-4 w-4" /> Delete Store</>
                )}
              </Button>
              {/* Future actions like Suspend Store, Close Store */}
              <Button variant="outline" disabled>
                Suspend Store (Coming Soon)
              </Button>
              <Button variant="outline" disabled>
                Close Store (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
