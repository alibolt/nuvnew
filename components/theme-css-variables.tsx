'use client';

export function ThemeCSSVariables({ themeSettings }: { themeSettings: any }) {
  const cssVars = Object.entries(themeSettings || {}).reduce((acc, [key, value]) => {
    const cssVarName = `--theme-${key.replace(/\./g, '-').toLowerCase()}`;
    acc[cssVarName] = value;
    return acc;
  }, {} as Record<string, any>);

  return (
    <style dangerouslySetInnerHTML={{
      __html: `:root { ${Object.entries(cssVars).map(([k, v]) => `${k}: ${v};`).join(' ')} }`
    }} />
  );
}
