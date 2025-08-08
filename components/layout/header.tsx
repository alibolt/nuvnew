
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center">
          <Image 
            src="/nuvi-icon.svg" 
            alt="Nuvi" 
            width={40} 
            height={40}
            className="mr-2"
          />
          <span className="text-2xl font-light tracking-tight text-gray-600">nuvi</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Coming Soon</span>
        </div>
      </div>
    </header>
  );
}
