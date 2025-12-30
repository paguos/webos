# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BrowserOS is a macOS Launchpad-inspired bookmark manager built with Vue 3. It's a single-page application that stores all data locally in the browser's localStorage and opens websites in the default browser. The UI features glassmorphism effects, smooth animations, drag-and-drop reordering, and macOS Big Sur-style gradient backgrounds.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (opens automatically on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### State Management (Pinia)

The application uses two main Pinia stores:

**websitesStore** (`src/stores/websitesStore.js`) - Core data store
- Manages websites, categories, and settings
- Handles CRUD operations for websites and categories
- Manages pagination (currentPage, websitesByPage, currentPageWebsites)
- Position tracking system: each website has `position: { page, order }`
- Automatic localStorage persistence via `storage.set()`
- Export/import functionality for backup/restore

**uiStore** (`src/stores/uiStore.js`) - UI state management
- Controls modal visibility (WebsiteForm, SettingsModal, ConfirmDialog, etc.)
- Manages search query and edit mode state
- Tracks which item is being edited (editingWebsite, editingCategory)
- Provides actions to open/close all modals

### Data Persistence

**Storage Layer** (`src/utils/storage.js`)
- Wraps localStorage with versioning and error handling
- All keys prefixed with `browserOS_` (defined by STORAGE_PREFIX)
- Data structure: `{ version, data, timestamp }`
- Storage keys defined in `STORAGE_KEYS`: 'websites', 'categories', 'settings', 'layout'
- Automatic quota exceeded handling with user alerts

**Data Model:**
```javascript
// Website object structure
{
  id: uuid,
  name: string,
  url: string (normalized),
  favicon: string (auto-fetched URL),
  categoryId: uuid | null,
  customIcon: string | null,
  position: { page: number, order: number },
  metadata: {
    createdAt: ISO string,
    updatedAt: ISO string,
    visitCount: number,
    lastVisited: ISO string | null
  }
}
```

### Component Structure

**Layout Components** (`src/components/layout/`)
- `LaunchpadContainer.vue` - Main container with background gradient
- `SearchBar.vue` - Top search bar with spotlight-style shortcuts (`/` to focus, `Escape` to clear)
- `PaginationDots.vue` - macOS-style page indicators

**Grid Components** (`src/components/grid/`)
- `WebsiteGrid.vue` - Main grid with VueDraggable integration
  - Handles drag-and-drop reordering (only works in edit mode)
  - Updates positions via `updateWebsitePositions()`
  - Edit mode toggle with wiggle animations
  - Filtering based on uiStore.searchQuery
- `WebsiteIcon.vue` - Individual website icon with click, right-click context menu, and hover effects

**CRUD Components** (`src/components/crud/`)
- `WebsiteForm.vue` - Add/edit website modal
- `SettingsModal.vue` - Settings, export/import, clear data
- `ConfirmDialog.vue` - Reusable confirmation dialog

### Drag and Drop Behavior

- VueDraggable library integrated in `WebsiteGrid.vue`
- Only enabled when `uiStore.isEditMode === true` and not searching
- Dragging only reorders within current page (position.page stays same, order updates)
- On drag end, `updateWebsitePositions()` called with new order array
- Ghost/drag/chosen classes for iOS-style animations
- Haptic feedback on mobile devices via `navigator.vibrate()`

### URL Handling and Favicons

**URL Normalization** (`src/utils/validators.js`)
- `normalizeUrl()` ensures URLs have proper protocol (adds `https://` if missing)
- Validates URL format before saving

**Favicon Fetching** (`src/utils/favicon.js`)
- `getFaviconUrl()` generates favicon URLs using Google's favicon service
- Format: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
- Alternative services available in `FAVICON_SERVICES` constant

### Constants and Configuration

**Grid Sizes** (`src/utils/constants.js`)
- Three presets: small (9 cols, 45 icons), medium (7 cols, 35 icons), large (5 cols, 25 icons)
- Configured via `DEFAULT_SETTINGS.gridSize`

**Gradient Presets**
- Six built-in macOS-inspired gradients (Big Sur, Catalina, Monterey, etc.)
- Defined in `GRADIENT_PRESETS` with colors and angle
- Extensible - add new gradients to this array

### Keyboard Shortcuts

- `/` - Focus search bar (spotlight-style)
- `Escape` - Clear search OR exit edit mode (depending on context)

## Key Implementation Details

### Position Management
When reordering icons, the system:
1. Updates only the `order` property within the current page
2. Keeps `page` property unchanged (multi-page drag not supported)
3. Automatically saves to localStorage after position updates

### Edit Mode Flow
1. User clicks "Edit" button
2. `uiStore.isEditMode` set to true
3. Icons start wiggling (CSS animation)
4. VueDraggable enabled
5. Click "Done" or press `Escape` to exit

### Data Export/Import
- Export: `websitesStore.exportData()` returns JSON with websites, categories, settings, version, and timestamp
- Import: `websitesStore.importData(data)` validates and restores all data
- Clear All: Resets to empty state (note: does NOT reload sample data automatically)

## Build Configuration

**Vite Config** (`vite.config.js`)
- Dev server on port 3000 with auto-open
- Manual code splitting: vendor chunk (vue, pinia) and draggable chunk
- Output directory: `dist/`
- Source maps disabled in production

## Tech Stack

- Vue 3 (Composition API with `<script setup>`)
- Pinia (state management)
- Vite (build tool)
- VueDraggable (drag-and-drop)
- uuid (ID generation)
- @vueuse/core (Vue composables)
