import { FileSearch, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchAppRequiredProps {
  onInstall?: () => void;
}

export function SearchAppRequired({ onInstall }: SearchAppRequiredProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <FileSearch className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-3">Smart Search & Discovery Required</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        To enable search functionality on your store, you need to install the Smart Search & Discovery app.
      </p>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Features include:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✓ AI-powered search suggestions</li>
          <li>✓ Real-time search analytics</li>
          <li>✓ Advanced filtering options</li>
          <li>✓ Search personalization</li>
        </ul>
      </div>
      {onInstall && (
        <Button className="mt-6" onClick={onInstall}>
          <Download className="h-4 w-4 mr-2" />
          Install Smart Search App
        </Button>
      )}
    </div>
  );
}