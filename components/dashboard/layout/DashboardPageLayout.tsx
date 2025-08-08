import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DashboardPageLayoutProps {
  title: string;
  description?: string;
  actionButton?: ReactNode;
  backButton?: {
    href: string;
    label?: string;
  };
  children: ReactNode;
  fullWidth?: boolean;
}

export function DashboardPageLayout({
  title,
  description,
  actionButton,
  backButton,
  children,
  fullWidth = false,
}: DashboardPageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white">
        <div className={`${fullWidth ? 'px-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {backButton && (
                <Link
                  href={backButton.href}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">{backButton.label || 'Back'}</span>
                </Link>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {description && (
                  <p className="mt-1 text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>
            {actionButton && (
              <div className="flex items-center gap-3">
                {actionButton}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${fullWidth ? '' : 'max-w-7xl mx-auto w-full'}`}>
        <div className={fullWidth ? '' : 'px-4 sm:px-6 lg:px-8 py-8'}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Example usage:
// <DashboardPageLayout
//   title="Products"
//   description="Manage your store products"
//   actionButton={
//     <Link href="/products/new" className="btn btn-primary">
//       <Plus className="h-4 w-4" />
//       Add Product
//     </Link>
//   }
//   backButton={{
//     href: "/dashboard",
//     label: "Dashboard"
//   }}
// >
//   <ProductList />
// </DashboardPageLayout>