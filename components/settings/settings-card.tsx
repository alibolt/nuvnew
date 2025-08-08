import { ReactNode } from 'react';

interface SettingsCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function SettingsCard({ title, description, children, className = '', action }: SettingsCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-shadow hover:shadow-md ${className}`}>
      <div className="p-6">
        {(title || action) && (
          <div className="flex items-center justify-between mb-6">
            <div>
              {title && <h2 className="text-base font-semibold">{title}</h2>}
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}