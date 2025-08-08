import { redirect } from 'next/navigation';

export default async function StorePage({
  params
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  
  // Redirect to overview page
  redirect(`/dashboard/stores/${storeId}/overview`);
}