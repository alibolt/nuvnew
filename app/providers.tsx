'use client';

import { SessionProvider } from 'next-auth/react';
import { stopImpersonatingAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Toaster } from 'sonner';
import { SimplePerformanceMonitor } from '@/components/dev-tools/simple-performance-monitor';

export default function Providers({ children, isImpersonating }: { children: React.ReactNode; isImpersonating: boolean }) {
  return (
    <SessionProvider>
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center p-2 z-50 flex items-center justify-center gap-2">
          You are currently impersonating a user.
          <form action={stopImpersonatingAction}>
            <Button type="submit" variant="secondary" size="sm">
              <LogOut className="h-4 w-4 mr-2" /> Stop Impersonating
            </Button>
          </form>
        </div>
      )}
      {children}
      <Toaster 
        position="top-center"
        expand={false}
        richColors
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            border: '1px solid #e5e7eb',
          },
          className: 'toast',
          success: {
            style: {
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#166534',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
            },
          },
        }}
      />
      <SimplePerformanceMonitor />
    </SessionProvider>
  );
}
