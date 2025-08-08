
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-gray-100">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-6 w-6 text-gray-800" />
              <span className="text-xl font-bold">Nuvi</span>
            </div>
            <p className="text-sm text-gray-600">
              Build your e-commerce empire, one sale at a time.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2">
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pricing" className="text-gray-600 hover:underline">Pricing</Link></li>
                <li><Link href="/#features" className="text-gray-600 hover:underline">Features</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:underline">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-600 hover:underline">About</Link></li>
                <li><Link href="#" className="text-gray-600 hover:underline">Careers</Link></li>
                <li><Link href="#" className="text-gray-600 hover:underline">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-gray-600 hover:underline">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:underline">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Nuvi Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
