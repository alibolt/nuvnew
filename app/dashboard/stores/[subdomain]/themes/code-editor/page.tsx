import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { ThemeCodeEditor } from './theme-code-editor';

interface Props {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ theme?: string }>;
}

export default async function ThemeCodeEditorPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return notFound();
  }

  const { subdomain } = await params;
  const { theme: themeCode } = await searchParams;

  const store = await prisma.store.findFirst({
    where: {
      subdomain,
      userId: session.user.id,
    },
  });

  if (!store) {
    return notFound();
  }

  const selectedTheme = themeCode || store.themeCode || 'base';

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Theme Code Editor</h1>
            <p className="text-gray-600 mt-1">Edit theme files directly</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Current theme:</span>
            <span className="px-3 py-1 bg-black text-white rounded-lg text-sm font-medium">
              {selectedTheme}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ThemeCodeEditor 
          storeId={store.id}
          subdomain={store.subdomain}
          themeCode={selectedTheme}
        />
      </div>
    </div>
  );
}