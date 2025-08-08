# Theme-Related Files in /lib Directory

## Platform-Level Theme Files (Should Stay in /lib)

These files provide the infrastructure for the theme system and should remain at the platform level:

### Core Theme Infrastructure
1. **theme-loader.ts** - Theme loading service with caching
   - Loads themes dynamically
   - Provides section and block loading
   - Handles schema loading

2. **theme-utils.ts** - Theme utilities and CSS variable generation
   - generateThemeCSSVariables()
   - loadThemeConfig()
   - loadThemeInstanceSettings()
   - saveThemeInstanceSettings()

3. **theme-button-styles.ts** - Button style generation
   - generateButtonCSS()
   - Converts theme settings to button styles

4. **theme-font-loader.tsx** - Font loading utilities
   - Loads Google Fonts dynamically
   - Handles font preloading

5. **theme-global-styles.tsx** - Global theme styles component
   - React component for applying theme styles
   - Generates CSS from theme settings

6. **theme-icons.tsx** - Icon components
   - Platform-level icon library
   - Used across themes

## Deprecated Files
1. **theme-registry.ts** - DEPRECATED
   - Marked for removal
   - No longer used in the codebase

## Theme Studio Integration
The theme system integrates with Theme Studio located at:
- `/app/dashboard/stores/[subdomain]/theme-studio/`

Theme Studio uses these lib files to:
- Load theme configurations
- Generate CSS variables
- Apply theme settings
- Preview changes in real-time

## Recommendation
All the theme files in /lib are platform-level infrastructure and should remain there. They provide the foundation for themes to work properly. Individual themes in /themes/ folder use these utilities but don't need to duplicate them.