import { notFound } from 'next/navigation';
import { getStore } from '@/lib/stores';
import { SectionRenderer } from '../../section-renderer';
import { getTemplateByType } from '@/lib/templates';

interface ResetPasswordPageProps {
  params: {
    subdomain: string;
  };
  searchParams: {
    token?: string;
  };
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  try {
    const store = await getStore(params.subdomain);
    if (!store) {
      return notFound();
    }

    // Validate token
    if (!searchParams.token) {
      return notFound();
    }

    // Get reset password template
    const template = await getTemplateByType(store.id, 'reset-password');
    if (!template) {
      return notFound();
    }

    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Reset Password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter your new password below.
              </p>
            </div>
            <form className="mt-8 space-y-6">
              <div>
                <label htmlFor="password" className="sr-only">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="New password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading reset password page:', error);
    return notFound();
  }
}