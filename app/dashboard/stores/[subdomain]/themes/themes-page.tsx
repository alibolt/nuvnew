'use client';

import { redirect } from 'next/navigation';

export function ThemesPage({ subdomain }: { subdomain: string }) {
  // Redirect to theme studio
  redirect(`/dashboard/stores/${subdomain}/theme-studio`);
  return null;
}
