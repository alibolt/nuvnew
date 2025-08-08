interface SettingsPageHeaderProps {
  title: string;
  description: string;
}

export function SettingsPageHeader({ title, description }: SettingsPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}