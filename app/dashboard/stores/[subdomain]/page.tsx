import { redirect } from 'next/navigation';

export default async function StorePage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  
  // Redirect to overview page
  redirect(`/dashboard/stores/${subdomain}/overview`);
}