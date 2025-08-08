
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, LogIn } from "lucide-react";
import { deleteUserAction, impersonateUserAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Define the type for the user object
interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
}

interface UserDetailsProps {
  user: User;
}

export function UserDetails({ user }: UserDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}? This action is irreversible.`)) {
      setIsDeleting(true);
      try {
        await deleteUserAction(user.id);
        toast.success("User deleted successfully.");
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error(`Failed to delete user: ${(error as Error).message}`);
        setIsDeleting(false);
      }
    }
  };

  const handleImpersonate = async () => {
    setIsImpersonating(true);
    try {
      await impersonateUserAction(user.id);
      // Redirection will happen inside the server action
    } catch (error) {
      console.error("Failed to impersonate user:", error);
      toast.error(`Failed to impersonate user: ${(error as Error).message}`);
      setIsImpersonating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role.toUpperCase()}</p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Perform administrative actions on this user.
            </p>
            <Button onClick={handleImpersonate} disabled={isImpersonating || user.role === 'admin'}>
              {isImpersonating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Impersonating...</>
              ) : (
                <><LogIn className="mr-2 h-4 w-4" /> Impersonate User</>
              )}
            </Button>
            {/* Add other user actions here, e.g., Change Role, Reset Password */}
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
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || user.role === 'admin'}>
              {isDeleting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 className="mr-2 h-4 w-4" /> Delete User</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
