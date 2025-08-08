
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Store } from '@/types/store';

// Store type imported from @/types/store
interface StoreWithUser extends Store {
  user: { email: string | null };
}

interface StoresListProps {
  stores: StoreWithUser[];
}

export function StoresList({ stores }: StoresListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search by store name, subdomain, or owner email..."
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subdomain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStores.map((store) => (
              <tr key={store.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{store.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{store.subdomain}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{store.user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(store.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/stores/${store.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">View</Link>
                  {/* Action buttons like Edit/Delete will go here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {filteredStores.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No stores found.
        </div>
      )}
    </div>
  );
}
