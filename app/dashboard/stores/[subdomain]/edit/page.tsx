import { redirect } from 'next/navigation';

export default async function StoreSettingsPage({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params;
  
  // Redirect to new settings page
  redirect(`/dashboard/stores/${subdomain}/settings`);
}