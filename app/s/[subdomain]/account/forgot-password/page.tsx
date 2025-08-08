import { notFound } from 'next/navigation';
import { getStore } from '@/lib/stores';
import { SectionRenderer } from '../../section-renderer';
import { getTemplateByType } from '@/lib/templates';

interface ForgotPasswordPageProps {
  params: {
    subdomain: string;
  };
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  try {
    const store = await getStore(params.subdomain);
    if (!store) {
      return notFound();
    }

    // Get forgot password template
    const template = await getTemplateByType(store.id, 'forgot-password');
    if (!template) {
      return notFound();
    }

    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Forgot Password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            <form className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading forgot password page:', error);
    return notFound();
  }
}