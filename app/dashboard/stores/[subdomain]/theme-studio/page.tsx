import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ThemeStudioNext } from './theme-studio-next';
import { ThemeStudioProvider } from './context/theme-studio-context';

export default async function ThemeStudioPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const session = await requireAuth();
  const { subdomain } = await params;
  
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    },
    include: {
      storeSettings: true
    }
  });

  if (!store) {
    redirect('/dashboard');
  }

  // Ensure a default homepage template exists
  let defaultTemplate = await prisma.storeTemplate.findFirst({
    where: {
      storeId: store.id,
      templateType: 'homepage',
      isDefault: true
    }
  });

  if (!defaultTemplate) {
    // Check if any homepage template exists
    const existingHomepageTemplate = await prisma.storeTemplate.findFirst({
      where: {
        storeId: store.id,
        templateType: 'homepage'
      }
    });

    if (existingHomepageTemplate) {
      // Update existing template to be default
      defaultTemplate = await prisma.storeTemplate.update({
        where: { id: existingHomepageTemplate.id },
        data: { isDefault: true }
      });
    } else {
      // Create a new default homepage template
      defaultTemplate = await prisma.storeTemplate.create({
        data: {
          storeId: store.id,
          name: 'Homepage',
          templateType: 'homepage',
          isDefault: true,
          enabled: true,
          settings: {}
        }
      });
    }
  }

  return (
    <ThemeStudioProvider>
      <ThemeStudioNext 
        store={{
          id: store.id,
          name: store.name,
          subdomain: store.subdomain,
          themeCode: store.themeCode || 'commerce',
          themeSettings: store.themeSettings || {},
          defaultTemplateId: defaultTemplate.id
        }} 
      />
    </ThemeStudioProvider>
  );
}