import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export default async function ThemePreviewPage({
  params,
}: {
  params: Promise<{ subdomain: string; themeId: string }>;
}) {
  const { subdomain, themeId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    notFound();
  }

  const store = await prisma.store.findFirst({
    where: {
      subdomain,
      userId: session.user.id,
    },
  });

  if (!store) {
    notFound();
  }

  // For now, redirect to the store preview with the theme applied
  // In a full implementation, this would show a preview without actually applying the theme
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Theme Preview</h1>
        <p className="text-gray-600 mb-6">
          Theme preview is coming soon. For now, you can apply the theme and preview it in Theme Studio.
        </p>
        <div className="space-y-3">
          <a
            href={`/dashboard/stores/${subdomain}/design/themes`}
            className="block w-full bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            Back to Themes
          </a>
          <a
            href={`http://${subdomain}.lvh.me:3000`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            View Current Store
          </a>
        </div>
      </div>
    </div>
  );
}