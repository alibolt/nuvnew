// Theme Registry Types

export interface ThemeManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  preview?: string;
  entryPoints: {
    main?: string;
    sections?: string;
    blocks?: string;
    styles?: string;
    config?: string;
  };
  capabilities?: string[];
  settings?: {
    colors?: string[];
    typography?: string[];
    layout?: string[];
  };
}

export interface ThemeModule {
  sections: Record<string, any>;
  blocks: Record<string, any>;
  schemas?: Record<string, any>;
  styles?: {
    themeStyles?: string;
    componentStyles?: string;
  };
  config?: any;
}

export interface ThemeRegistryEntry {
  manifest: ThemeManifest;
  path: string;
  loaded: boolean;
  module?: ThemeModule;
}