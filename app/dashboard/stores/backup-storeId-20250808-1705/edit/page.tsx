import { redirect } from 'next/navigation';

export default async function StoreSettingsPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params;
  
  // Redirect to new settings page
  redirect(`/dashboard/stores/${storeId}/settings`);
}