import { getGlobalSections } from '@/lib/services/global-sections-loader';
import { PageRenderer } from './page-renderer';
import { prisma } from '@/lib/prisma';
import { unflattenSettings } from '@/lib/utils';

interface PageWithGlobalSectionsProps {
  pageData: any;
  store: any;
  subdomain: string;
}

export async function PageWithGlobalSections({ 
  pageData, 
  store, 
  subdomain 
}: PageWithGlobalSectionsProps) {
  const themeCode = store.themeCode || 'commerce'; // Default to commerce theme
  
  // Load theme settings from template
  const template = await prisma.storeTemplate.findFirst({
    where: {
      storeId: store.id,
      templateType: 'homepage',
      enabled: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  // Convert flat settings to nested structure
  const nestedSettings = unflattenSettings(template?.settings || {});
  
  // IMPORTANT: Global sections (header, footer, announcement bar) should ALWAYS come from homepage
  // Don't use pageType for global sections - they are meant to be consistent across all pages
  const globalSections = await getGlobalSections(subdomain, themeCode, 'homepage');
  
  return (
    <PageRenderer
      pageData={pageData}
      store={store}
      themeCode={themeCode}
      globalSections={globalSections}
      themeSettings={nestedSettings}
    />
  );
}