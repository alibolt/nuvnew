# Theme Studio Technical Analysis: End-to-End Code Flow

## Overview

The Theme Studio is a comprehensive visual theme customization system that enables real-time editing of store themes with live preview capabilities. This analysis covers the complete technical architecture and data flow.

## 1. Entry Points and Routing

### Main Entry Point
- **Route**: `/dashboard/stores/[storeId]/theme-studio/page.tsx`
- **Authentication**: Uses `requireAuth()` to ensure user is logged in
- **Authorization**: Validates store ownership via Prisma query
- **Component**: Renders `ThemeStudioNext` client component

```typescript
// Key entry point flow
export default async function ThemeStudioPage({ params }) {
  const session = await requireAuth();
  const store = await prisma.store.findFirst({
    where: { id: storeId, userId: session.user.id }
  });
  return <ThemeStudioNext store={store} />;
}
```

## 2. Component Architecture

### Core Components Hierarchy
```
ThemeStudioNext (Main Container)
├── Top Toolbar
│   ├── Navigation (Back button)
│   ├── Page Selector
│   ├── Device Selector (Desktop/Tablet/Mobile)
│   └── Save Button
├── Left Panel
│   ├── SectionListNuvi (Section management)
│   └── AddSectionPanel (Add new sections)
└── PreviewFrameNext (Live preview iframe)
```

### Key Components

1. **ThemeStudioNext** (`theme-studio-next.tsx`)
   - Main orchestrator component
   - Manages global state for sections, preview device, and changes
   - Handles drag-and-drop for section reordering
   - Coordinates communication between panels

2. **SectionListNuvi** (`section-list-nuvi.tsx`)
   - Displays list of sections with expand/collapse
   - Supports drag-and-drop reordering
   - Handles section selection and actions

3. **PreviewFrameNext** (`preview-frame-next.tsx`)
   - Renders iframe pointing to preview URL
   - Manages device-specific styling
   - Sends real-time updates via postMessage

4. **AddSectionPanel** (`add-section-panel.tsx`)
   - Fetches available sections from theme
   - Provides search and category filtering
   - Handles section creation

## 3. State Management

### Local State Management
The Theme Studio uses React's useState for state management:

```typescript
// Core state in ThemeStudioNext
const [sections, setSections] = useState<Section[]>([]);
const [selectedSection, setSelectedSection] = useState<Section | null>(null);
const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
const [hasChanges, setHasChanges] = useState(false);
const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
```

### State Flow
1. **Section State**: Maintained in `ThemeStudioNext`, passed down to child components
2. **Selection State**: Tracks currently selected section for editing
3. **UI State**: Device preview, panel visibility, drag state
4. **Change Tracking**: `hasChanges` flag enables/disables save button

## 4. Data Flow

### Loading Sections Flow
```
ThemeStudioNext.loadSections()
  → GET /api/stores/[storeId]/sections
    → prisma.storeSectionInstance.findMany()
      → Returns sections sorted by position
        → Updates local state
          → Triggers re-render
```

### Adding Section Flow
```
AddSectionPanel (User selects section)
  → GET /api/themes/[themeId]/sections (Fetch available sections)
    → User clicks section
      → POST /api/stores/[storeId]/sections
        → prisma.storeSectionInstance.create()
          → Returns new section
            → Updates local state
              → Refreshes preview
```

### Updating Section Flow
```
SectionInspector (User modifies settings)
  → handleUpdateSection()
    → PUT /api/stores/[storeId]/sections/[sectionId]
      → prisma.storeSectionInstance.update()
        → Updates local state
          → Sends update to preview via postMessage
```

## 5. Real-time Preview Updates

### Preview Communication Architecture
1. **Preview URL**: `http://localhost:3000/s/[subdomain]/preview`
2. **Communication**: Uses `postMessage` API for cross-origin communication
3. **Update Flow**:

```typescript
// In PreviewFrameNext
useEffect(() => {
  if (iframeLoaded && sections) {
    const message = {
      type: 'THEME_STUDIO_UPDATE',
      sections: sections,
    };
    iframeRef.current.contentWindow.postMessage(message, '*');
  }
}, [sections, iframeLoaded]);
```

### Preview Page Reception
```typescript
// In ThemeProvider (wraps preview page)
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'THEME_STUDIO_UPDATE') {
      if (event.data.settings) {
        setDynamicSettings(mergedNewSettings);
      }
    }
  };
  window.addEventListener('message', handleMessage);
}, []);
```

## 6. API Architecture

### API Endpoints

1. **Section Management**
   - `GET /api/stores/[storeId]/sections` - List all sections
   - `POST /api/stores/[storeId]/sections` - Create section
   - `PUT /api/stores/[storeId]/sections/[sectionId]` - Update section
   - `DELETE /api/stores/[storeId]/sections/[sectionId]` - Delete section

2. **Theme Management**
   - `GET /api/stores/[storeId]/theme-settings` - Get theme settings
   - `PUT /api/stores/[storeId]/theme-settings` - Update theme settings
   - `GET /api/themes/[themeId]/sections` - Get available sections for theme

### Data Persistence
All section data is stored in the `StoreSectionInstance` table:
```prisma
model StoreSectionInstance {
  id          String   @id @default(cuid())
  storeId     String
  sectionType String
  position    Int
  enabled     Boolean  @default(true)
  settings    Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 7. Section Rendering Pipeline

### Preview Page Rendering
```
PreviewPage (`/s/[subdomain]/preview/page.tsx`)
  → Fetch store data with products
    → Fetch enabled sections ordered by position
      → Wrap in ThemeProvider
        → Map sections to SectionRenderer
          → Dynamically import section components
            → Render with section settings
```

### Dynamic Component Loading
```typescript
// In SectionRenderer
const loadComponent = (themeCode: string, sectionType: string) => {
  return dynamic(async () => {
    try {
      // Try theme-specific component
      const mod = await import(`./themes/${themeCode}/${sectionType}`);
      return mod.default;
    } catch {
      // Fallback to minimal theme
      // Or return placeholder component
    }
  });
};
```

## 8. Drag and Drop Implementation

### DnD Architecture
- Uses `@dnd-kit` library for drag-and-drop
- Implements sortable list with vertical constraint
- Updates section positions on drop

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  if (over && active.id !== over.id) {
    setSections((items) => {
      const newItems = arrayMove(items, oldIndex, newIndex);
      return newItems.map((item, index) => ({
        ...item,
        position: index,
      }));
    });
    // Update positions in database
  }
};
```

## 9. Save and Persistence Flow

### Save Process
1. User clicks Save button
2. `handleSave()` called in ThemeStudioNext
3. Currently only refreshes preview and clears hasChanges flag
4. Individual section updates are saved immediately via API calls

### Change Detection
- Any modification sets `hasChanges` to true
- Save button becomes active when changes exist
- After save, `hasChanges` reset to false

## 10. Performance Optimizations

1. **Debounced Updates**: Preview updates are debounced by 200ms to batch rapid changes
2. **Dynamic Imports**: Section components are lazy-loaded only when needed
3. **Selective Re-renders**: Component structure minimizes unnecessary re-renders
4. **Scroll Position Preservation**: Preview maintains scroll position during updates

## 11. Security Considerations

1. **Authentication**: All API routes require valid session
2. **Authorization**: Store ownership verified on every request
3. **Data Validation**: Input sanitization in API routes
4. **CORS**: PostMessage uses wildcard origin (consider restricting in production)

## 12. Future Improvements

1. **Undo/Redo**: History state exists but not fully implemented
2. **Theme Settings**: Infrastructure exists but UI not complete
3. **Multi-page Support**: Page selector exists but section persistence per page needed
4. **Collaborative Editing**: Real-time sync between multiple editors
5. **Version Control**: Section version history and rollback

## Technical Stack

- **Frontend**: Next.js 14 App Router, React, TypeScript
- **State Management**: React useState, useEffect
- **Styling**: Tailwind CSS, cn utility
- **Drag & Drop**: @dnd-kit
- **Data Fetching**: Native fetch API
- **Database**: Prisma with SQLite
- **Authentication**: NextAuth.js
- **UI Components**: Custom components with Lucide icons

## Data Models

### Section Model
```typescript
interface Section {
  id: string;
  sectionType: string;
  settings: any; // JSON object with section-specific settings
  enabled: boolean;
  position: number;
  // UI-specific fields
  type: string;
  title: string;
}
```

### Theme Section Schema
```typescript
interface ThemeSection {
  id: string;
  type: string;
  name: string;
  description: string | null;
  schema: {
    category: string;
    defaultSettings: any;
    isRequired?: boolean;
  };
}
```

This architecture provides a robust, real-time theme editing experience with clear separation of concerns and extensible design patterns.