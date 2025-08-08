# Theme Studio - Detailed Technical Analysis

> **Status**: Active Development | **Last Updated**: July 10, 2025
> 
> This document provides a comprehensive analysis of the Theme Studio system, its architecture, data flow, and current limitations.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Analysis](#architecture-analysis)
3. [Data Flow & Storage](#data-flow--storage)
4. [Component Structure](#component-structure)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Current Issues & Limitations](#current-issues--limitations)
8. [Performance Analysis](#performance-analysis)
9. [Security Considerations](#security-considerations)
10. [Recommendations](#recommendations)
11. [TODO List](#todo-list)

## System Overview

Theme Studio is a WYSIWYG theme editor that allows users to customize their store's appearance through a drag-and-drop interface with real-time preview capabilities. The system follows a **theme-specific architecture** where each theme (currently "Artisan Craft") provides its own sections and blocks.

### Core Features
- ✅ **Real-time Preview**: Changes reflect immediately in iframe preview
- ✅ **Section Management**: Add, remove, reorder sections
- ✅ **Block Management**: Add, configure, remove blocks within sections  
- ✅ **Theme-Specific Components**: Each theme provides its own section/block library
- ⚠️ **Local History**: Undo/redo (session-only, not persistent)
- ❌ **Draft System**: Missing true draft/publish workflow
- ❌ **Multi-user Support**: No conflict resolution or real-time collaboration

## Architecture Analysis

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Theme Studio  │    │   Preview Frame  │    │    Database     │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │  Sections   │ │    │ │ RealTime     │ │    │ │ Templates   │ │
│ │  Inspector  │ │◄──►│ │ Preview      │ │    │ │ Sections    │ │
│ │  History    │ │    │ │ Wrapper      │ │    │ │ Blocks      │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         └────────── API Calls ───┴───── Database Ops ─────┘
```

### Theme-Specific Architecture

The system now uses **theme-specific sections** instead of global ones:

```
themes/artisan-craft/
├── sections/
│   ├── hero.tsx + HeroSchema + HeroPresets
│   ├── footer.tsx + FooterSchema + FooterPresets
│   ├── featured-products.tsx + Schema + Presets
│   ├── text-section.tsx + Schema + Presets
│   └── index.ts (central exports)
├── blocks/
│   ├── logo.tsx
│   ├── navigation.tsx
│   ├── search.tsx
│   ├── cart.tsx
│   └── account.tsx
├── header.tsx (legacy location)
└── block-renderer.tsx
```

## Data Flow & Storage

### Block Operations

#### Adding Blocks
```typescript
// Flow: User Action → API → Database → Real-time Update
1. User clicks "Add Block" in Theme Studio
2. handleAddBlock() in theme-studio-next.tsx
3. POST /api/stores/[subdomain]/sections/[sectionId]/blocks
4. Database: Insert into SectionBlock table
5. Real-time: postMessage to preview iframe
6. Preview: Update rendering via ArtisanBlockRenderer
```

#### Deleting Blocks
```typescript
// Flow: Delete → Position Shift → Real-time Update
1. User deletes block
2. DELETE /api/stores/[subdomain]/sections/[sectionId]/blocks/[blockId]
3. Database: Delete block + shift remaining positions
4. Local state: Remove from sections[].blocks[]
5. Real-time: Send deletion event to preview
```

### Section Operations

#### Adding Sections
```typescript
// Flow: Template → Section → Preview Update
1. User adds section via add-section-modal
2. POST /api/stores/[subdomain]/templates/[templateId]/sections
3. Database: Insert into StoreSectionInstance
4. Local state: Add to sections array with temporary ID
5. Preview: Render new section component
```

#### Section Settings Updates
```typescript
// Flow: Inspector → Debounced API → Real-time
1. User changes section settings in inspector
2. Debounced handleUpdateSection() call
3. PUT /api/stores/[subdomain]/sections/[sectionId]
4. Database: Update settings JSON
5. Real-time: Send settings update to preview
```

### Draft System (Current Limitations)

```typescript
// PROBLEM: No real draft system exists
const [isDraft, setIsDraft] = useState(true); // UI only!

// All changes are immediately saved to database:
await handleUpdateSection(sectionId, updates); // Goes to live DB

// "Publish" does nothing real:
const handlePublish = () => {
  setIsDraft(false); // Only UI state change
  // No actual draft → live migration
}
```

### History System

```typescript
// In-memory only (lost on refresh)
interface HistoryEntry<T> {
  state: T;           // Full sections array snapshot
  action: string;     // "Added section", "Updated block", etc.
  timestamp: Date;    // When change occurred
  details?: string;   // Additional context
}

// Limitations:
- Maximum 50 entries
- Client-side only
- No persistence across sessions
- No server-side audit trail
```

## Component Structure

### Main Components (Active)

#### 1. theme-studio-next.tsx (1,898 lines)
**Role**: Main orchestrator component
**Responsibilities**:
- State management for sections, selected items, panels
- API calls for CRUD operations
- Real-time communication with preview
- History management integration
- UI panel coordination

**Key State Variables**:
```typescript
const [sections, setSections] = useState<Section[]>([]);
const [selectedSection, setSelectedSection] = useState<Section | null>(null);
const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
const [activePanelId, setActivePanelId] = useState<'sections' | 'inspector' | null>('sections');
const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
const [saving, setSaving] = useState(false);
const [isDraft, setIsDraft] = useState(true);
```

#### 2. section-list-inline.tsx
**Role**: Section management UI
**Responsibilities**:
- Display sections with drag-and-drop reordering
- Section selection and highlighting
- Add section dropdown
- Section enable/disable toggle

#### 3. section-inspector.tsx
**Role**: Properties panel for sections and blocks
**Responsibilities**:
- Dynamic form generation based on schemas
- Real-time settings updates
- Block management within sections
- Add block functionality

#### 4. preview-frame-next.tsx
**Role**: Preview iframe container
**Responsibilities**:
- Device simulation (desktop/tablet/mobile)
- Iframe lifecycle management
- Communication bridge setup
- Loading state handling

#### 5. realtime-preview-wrapper.tsx (403 lines)
**Role**: Preview content renderer (runs inside iframe)
**Responsibilities**:
- Listen for real-time updates from Theme Studio
- Render sections using theme-specific components
- Handle section selection clicks
- Manage scroll position synchronization

#### 6. section-renderer.tsx
**Role**: Theme-aware section component router
**Responsibilities**:
- Route section types to theme-specific components
- Handle empty states for sections
- Provide section-level styling and interaction

### Component Communication

```typescript
// Theme Studio → Preview Communication
window.postMessage({
  type: 'THEME_STUDIO_REALTIME',
  update: {
    type: 'SECTIONS_REORDER' | 'SECTION_UPDATE' | 'BLOCK_ADD' | 'BLOCK_DELETE',
    sections: Section[],
    sectionId?: string,
    blockId?: string,
    settings?: any
  }
}, '*');

// Preview → Theme Studio Communication  
window.parent.postMessage({
  type: 'SECTION_SELECTED',
  sectionId: string,
  blockId?: string
}, '*');
```

### Hooks System

#### 1. use-realtime-sections.ts
**Purpose**: Manage real-time communication with preview
**Key Functions**:
- `sendToPreview()`: Send updates to iframe
- `sendInitialSections()`: Initialize preview on load
- Message handling and error recovery

#### 2. use-history.ts
**Purpose**: Local undo/redo functionality
**Key Functions**:
- `pushState()`: Add new history entry
- `undo()`: Move back in history
- `redo()`: Move forward in history
- `withoutRecording()`: Prevent recursive history

## API Endpoints

### Section Management
```typescript
// Get all sections for a template
GET /api/stores/[subdomain]/templates/by-type/[type]

// Create new section
POST /api/stores/[subdomain]/templates/[templateId]/sections
Body: { sectionType, title, settings, position }

// Update section
PUT /api/stores/[subdomain]/sections/[sectionId]  
Body: { settings, enabled, position, isDraft }

// Delete section
DELETE /api/stores/[subdomain]/templates/[templateId]/sections/[sectionId]

// Reorder sections
PUT /api/stores/[subdomain]/sections/[sectionId] (multiple calls)
```

### Block Management
```typescript
// Get blocks for a section
GET /api/stores/[subdomain]/sections/[sectionId]/blocks

// Add block to section
POST /api/stores/[subdomain]/sections/[sectionId]/blocks
Body: { type, position, settings? }

// Update block
PUT /api/stores/[subdomain]/sections/[sectionId]/blocks/[blockId]
Body: { settings, enabled, position }

// Delete block
DELETE /api/stores/[subdomain]/sections/[sectionId]/blocks/[blockId]
```

### Template Management
```typescript
// Get template with sections
GET /api/stores/[subdomain]/templates/by-type/[templateType]

// The hybrid template loader handles:
- Loading theme JSON definitions
- Merging with database customizations  
- Syncing sections to database for editing
```

## Database Schema

### Current Tables

#### StoreTemplate
```sql
id                UUID PRIMARY KEY
storeId           UUID (FK → Store)
templateType      VARCHAR ('homepage', 'product', etc.)
name              VARCHAR
isDefault         BOOLEAN
enabled           BOOLEAN
createdAt         TIMESTAMP
updatedAt         TIMESTAMP
```

#### StoreSectionInstance  
```sql
id                UUID PRIMARY KEY
templateId        UUID (FK → StoreTemplate)
sectionType       VARCHAR ('header', 'hero', 'footer', etc.)
title             VARCHAR
settings          JSONB
enabled           BOOLEAN
position          INTEGER
createdAt         TIMESTAMP
updatedAt         TIMESTAMP
```

#### SectionBlock
```sql
id                UUID PRIMARY KEY
sectionId         UUID (FK → StoreSectionInstance)
type              VARCHAR ('logo', 'navigation', 'text', etc.)
position          INTEGER
enabled           BOOLEAN
settings          JSONB
createdAt         TIMESTAMP
updatedAt         TIMESTAMP
```

### Schema Limitations

#### Missing Draft Support
```sql
-- Current: All changes are immediately live
-- Needed:
ALTER TABLE StoreSectionInstance ADD COLUMN is_draft BOOLEAN DEFAULT true;
ALTER TABLE SectionBlock ADD COLUMN is_draft BOOLEAN DEFAULT true;
ALTER TABLE StoreSectionInstance ADD COLUMN published_at TIMESTAMP;
```

#### Missing Version Control
```sql
-- Needed for history and rollback:
CREATE TABLE SectionVersion (
  id UUID PRIMARY KEY,
  section_id UUID,
  version_number INTEGER,
  settings JSONB,
  created_by UUID,
  created_at TIMESTAMP
);
```

#### Missing Change Tracking
```sql
-- Needed for audit trail:
CREATE TABLE ChangeHistory (
  id UUID PRIMARY KEY,
  user_id UUID,
  entity_type VARCHAR, -- 'section' | 'block'
  entity_id UUID,
  action_type VARCHAR, -- 'create' | 'update' | 'delete'
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP
);
```

## Current Issues & Limitations

### 🚨 Critical Issues

#### 1. No Real Draft System
```typescript
// PROBLEM: isDraft is only UI state
const [isDraft, setIsDraft] = useState(true);

// All API calls save immediately to live database:
await updateSection(sectionId, changes); // Goes live immediately!

// Publish button does nothing:
const handlePublish = () => setIsDraft(false); // Just UI change
```

#### 2. History Lost on Refresh
```typescript
// PROBLEM: History is client-side only
const [entries, setEntries] = useState<HistoryEntry<T>[]>([]);

// Lost when user refreshes page
// No server-side persistence
// No multi-session consistency
```

#### 3. No Multi-User Support
```typescript
// PROBLEM: Multiple editors cause conflicts
// No real-time awareness of other users
// Changes can overwrite each other
// No conflict resolution mechanism
```

### ⚠️ Architectural Issues

#### 1. Monolithic Main Component
- **theme-studio-next.tsx**: 1,898 lines
- Multiple responsibilities mixed together
- Difficult to test and maintain
- State management scattered

#### 2. Inconsistent Data Flow
```typescript
// Some updates go through hooks:
const { updateSection } = useRealtimeSections();

// Others go directly through main component:
await handleUpdateSection(sectionId, updates);

// Creates confusion and potential bugs
```

#### 3. Complex State Synchronization
```typescript
// Multiple sources of truth:
- sections (main state)
- historySections (from history hook)
- sectionsRef.current (for real-time)
- selectedSection (for inspector)

// Synchronization bugs possible
```

### 🐛 Implementation Issues

#### 1. Race Conditions in Real-time Updates
```typescript
// PROBLEM: Rapid changes can cause conflicts
useEffect(() => {
  if (historySections && historyJSON !== currentSectionsJSON) {
    setSections(historySections); // Can override newer changes
  }
}, [historySections]);
```

#### 2. Position Management Bugs
```typescript
// Block position shifting can fail under load:
// 1. User adds block at position 1
// 2. API shifts other blocks +1  
// 3. If another user adds simultaneously → position conflicts
```

#### 3. Memory Leaks in Preview Communication
```typescript
// Event listeners not always cleaned up:
window.addEventListener('message', handleMessage);
// Missing cleanup in some code paths
```

## Performance Analysis

### Current Performance Issues

#### 1. Excessive Re-renders
```typescript
// PROBLEM: Every history change triggers full re-render
useEffect(() => {
  setSections(historySections); // Full array replacement
  realtimeReorderSectionsRef.current(historySections); // Expensive operation
}, [historySections]);
```

#### 2. Large Component Bundle
```typescript
// theme-studio-next.tsx is 1,898 lines
// Could be split into smaller, more focused components:
- SectionManager (300 lines)
- InspectorManager (200 lines)  
- PreviewManager (150 lines)
- StateManager (200 lines)
- APIManager (300 lines)
```

#### 3. Inefficient Real-time Updates
```typescript
// Sends full sections array on every change:
sendToPreview({
  type: 'SECTIONS_REORDER',
  sections: allSections // Could send just diffs
});
```

### Performance Metrics
- **Initial Load**: ~1.5s (includes theme compilation)
- **Section Add**: ~200ms (API call + preview update)
- **Block Add**: ~150ms (API call + real-time sync)
- **Settings Update**: ~100ms (debounced API + preview)
- **History Operation**: ~50ms (local state only)

## Security Considerations

### Current Security Measures
✅ **Authentication**: All API routes require valid session
✅ **Authorization**: Users can only edit their own stores
✅ **Input Validation**: API routes validate request bodies
✅ **XSS Prevention**: Settings stored as JSON, not HTML

### Security Gaps
⚠️ **No Role-based Access**: Any store user can edit everything
⚠️ **No Action Limits**: No rate limiting on API calls
⚠️ **No Audit Trail**: No tracking of who changed what
⚠️ **Preview Security**: iframe could potentially be exploited

### Recommendations
```typescript
// Add role-based permissions:
interface StoreUser {
  role: 'owner' | 'editor' | 'viewer';
  permissions: {
    canEditSections: boolean;
    canPublish: boolean;
    canDeleteSections: boolean;
  };
}

// Add rate limiting:
const rateLimit = {
  sectionUpdates: 100, // per hour
  blockOperations: 200, // per hour
  publishActions: 10   // per hour
};
```

## Recommendations

### 🔥 High Priority

#### 1. Implement Real Draft System
```sql
-- Add draft columns to existing tables
ALTER TABLE StoreSectionInstance ADD COLUMN is_draft BOOLEAN DEFAULT true;
ALTER TABLE SectionBlock ADD COLUMN is_draft BOOLEAN DEFAULT true;

-- Add publish tracking
ALTER TABLE StoreSectionInstance ADD COLUMN published_at TIMESTAMP;
ALTER TABLE StoreSectionInstance ADD COLUMN published_by UUID;
```

```typescript
// Update API to support draft operations
POST /api/stores/[subdomain]/sections?draft=true
PUT /api/stores/[subdomain]/sections/[id]?draft=true

// Add publish endpoint
POST /api/stores/[subdomain]/templates/[id]/publish
```

#### 2. Break Down Monolithic Component
```typescript
// Split theme-studio-next.tsx into focused components:
<ThemeStudio>
  <SectionManager />      {/* Section CRUD operations */}
  <InspectorPanel />      {/* Properties editing */}
  <PreviewManager />      {/* iframe and real-time */}
  <HistoryPanel />        {/* Undo/redo controls */}
  <PublishToolbar />      {/* Draft/publish workflow */}
</ThemeStudio>
```

#### 3. Add Server-side History
```sql
CREATE TABLE ChangeHistory (
  id UUID PRIMARY KEY,
  user_id UUID,
  store_id UUID,
  entity_type VARCHAR,
  entity_id UUID,
  action_type VARCHAR,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP
);
```

### 🎯 Medium Priority

#### 4. Optimize Real-time Communication
```typescript
// Send diffs instead of full state:
interface SectionUpdate {
  type: 'diff';
  sectionId: string;
  changes: Partial<Section>;
}

// Add conflict resolution:
interface ConflictResolution {
  strategy: 'merge' | 'overwrite' | 'manual';
  timestamp: Date;
  userId: string;
}
```

#### 5. Add Multi-user Awareness
```typescript
// WebSocket for real-time collaboration:
interface UserPresence {
  userId: string;
  userName: string;
  currentSection?: string;
  lastActivity: Date;
}

// Show who's editing what:
<SectionItem 
  section={section}
  editingUsers={getEditingUsers(section.id)}
/>
```

### 🔧 Low Priority

#### 6. Performance Optimizations
```typescript
// Memoize expensive operations:
const sectionsWithBlocks = useMemo(() => 
  sections.map(s => ({...s, blocks: getBlocksForSection(s.id)})), 
  [sections, blocksData]
);

// Virtualize long section lists:
<VirtualizedSectionList items={sections} />

// Lazy load theme components:
const ArtisanHero = lazy(() => import('./themes/artisan-craft/sections/hero'));
```

#### 7. Enhanced Developer Experience
```typescript
// Add comprehensive TypeScript types:
interface StrictSectionSettings {
  hero: HeroSettings;
  header: HeaderSettings;
  footer: FooterSettings;
}

// Add runtime validation:
const sectionSchema = z.object({
  id: z.string().uuid(),
  sectionType: z.enum(['header', 'hero', 'footer']),
  settings: z.record(z.any()),
  enabled: z.boolean()
});
```

## TODO List

### 🔥 Critical Priority

- [ ] **Remove unused Theme Studio components** (14 files identified)
  - [ ] Delete duplicate section list variants (4 files)
  - [ ] Remove obsolete add section components (4 files)  
  - [ ] Clean up unused UI components (4 files)
  - [ ] Remove old implementations (3 files)

- [ ] **Implement real draft/publish system**
  - [ ] Add `is_draft` columns to database tables
  - [ ] Create draft-specific API endpoints
  - [ ] Build atomic publish operation
  - [ ] Add rollback mechanism

- [ ] **Break down monolithic theme-studio-next.tsx**
  - [ ] Extract SectionManager component (300 lines)
  - [ ] Extract InspectorManager component (200 lines)
  - [ ] Extract PreviewManager component (150 lines)
  - [ ] Extract StateManager hook (200 lines)
  - [ ] Extract APIManager hook (300 lines)

### 🎯 High Priority

- [ ] **Add server-side history system**
  - [ ] Create ChangeHistory database table
  - [ ] Implement server-side history API
  - [ ] Add user attribution to changes
  - [ ] Build history browser UI

- [ ] **Optimize real-time communication**
  - [ ] Implement diff-based updates instead of full state
  - [ ] Add proper error handling and retry logic
  - [ ] Optimize message size and frequency
  - [ ] Add real-time user presence

- [ ] **Improve state management**
  - [ ] Consolidate multiple state sources
  - [ ] Fix race conditions in history updates
  - [ ] Add proper loading states
  - [ ] Implement optimistic updates with rollback

### 🔧 Medium Priority

- [ ] **Add comprehensive error handling**
  - [ ] Implement error boundaries for each major component
  - [ ] Add retry mechanisms for failed API calls
  - [ ] Build error recovery workflows
  - [ ] Add error reporting and logging

- [ ] **Enhance preview system**
  - [ ] Add preview loading states
  - [ ] Implement preview error recovery
  - [ ] Add preview performance monitoring
  - [ ] Build preview caching system

- [ ] **Add multi-user support**
  - [ ] Implement WebSocket for real-time collaboration
  - [ ] Add conflict resolution mechanisms  
  - [ ] Show user presence and editing status
  - [ ] Build collaborative editing workflows

### 🎨 Low Priority

- [ ] **Performance optimizations**
  - [ ] Add React.memo to expensive components
  - [ ] Implement virtual scrolling for long lists
  - [ ] Add lazy loading for theme components
  - [ ] Optimize bundle size and loading

- [ ] **Enhanced developer experience**
  - [ ] Add comprehensive TypeScript types
  - [ ] Build component testing suite
  - [ ] Add runtime validation schemas
  - [ ] Create developer documentation

- [ ] **Advanced features**
  - [ ] Add keyboard shortcuts for common actions
  - [ ] Implement bulk operations (multi-select)
  - [ ] Add section templates and presets
  - [ ] Build advanced theming capabilities

### 🧪 Testing & Quality

- [ ] **Add comprehensive testing**
  - [ ] Unit tests for hooks and utilities
  - [ ] Integration tests for API endpoints
  - [ ] E2E tests for critical user flows
  - [ ] Performance regression tests

- [ ] **Code quality improvements**
  - [ ] Add ESLint rules for Theme Studio
  - [ ] Implement code splitting strategies
  - [ ] Add proper error boundaries
  - [ ] Create style guide compliance

---

> **Note**: This analysis is based on the current codebase as of July 10, 2025. The system is actively under development and this document should be updated as changes are made.