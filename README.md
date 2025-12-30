# BrowserOS

A beautiful macOS Launchpad-inspired bookmark manager that opens websites in your default browser.

![BrowserOS](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859?style=flat&logo=pinia&logoColor=black)

## Features

✨ **macOS-inspired Interface**
- Beautiful gradient backgrounds (Big Sur style)
- Glassmorphism effects on icons
- Smooth animations and transitions
- Responsive design for all devices

🎯 **Core Functionality**
- Click icons to open websites in your default browser
- Real-time search and filtering
- Drag & drop reordering (just grab and move!)
- Multi-page support with pagination dots
- Right-click context menu (Edit/Delete)

💾 **Data Management**
- All data stored locally in browser localStorage
- Automatic favicon fetching
- Export/Import data as JSON
- Sample seed data included

🎨 **Customization**
- Add/Edit/Delete websites
- Organize with categories
- Track visit counts
- Custom icons support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Adding Websites
1. Click the settings gear icon (top-right)
2. Or use the "+" button when the grid is empty
3. Fill in name and URL
4. Optionally add to a category

### Reordering Icons
- Simply **drag and drop** icons to reorder them
- Works on the current page only
- Positions are automatically saved

### Search
- Type in the search bar at the top
- Or press `/` to focus search (Spotlight-style)
- Press `Escape` to clear search

### Context Menu
- **Right-click** any icon for quick actions:
  - Open (same as clicking)
  - Edit details
  - Delete website

### Data Management
1. Click settings gear icon
2. **Export Data**: Download all your bookmarks as JSON
3. **Import Data**: Restore from a previous export
4. **Clear All**: Reset to sample data

## Tech Stack

- **Vue 3** - Composition API
- **Pinia** - State management
- **Vite** - Build tool
- **VueDraggable** - Drag & drop functionality
- **localStorage** - Data persistence

## Project Structure

```
browserOS/
├── src/
│   ├── components/
│   │   ├── layout/          # Launchpad, SearchBar, Pagination
│   │   ├── grid/            # WebsiteGrid, WebsiteIcon
│   │   └── crud/            # Forms and modals
│   ├── stores/              # Pinia stores
│   ├── utils/               # Helpers (storage, validators, favicon)
│   └── assets/styles/       # CSS (variables, animations, global)
└── public/                  # Static assets
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search bar |
| `Escape` | Clear search |

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6 support

## Development

### File Structure
- `src/stores/websitesStore.js` - Main data store (CRUD operations)
- `src/stores/uiStore.js` - UI state (modals, search)
- `src/components/grid/WebsiteGrid.vue` - Main grid with drag & drop
- `src/components/grid/WebsiteIcon.vue` - Individual website icon

### Adding Features
The codebase is modular and easy to extend:
- Add new gradient themes in `utils/constants.js`
- Customize grid layout in `assets/styles/variables.css`
- Extend data model in `stores/websitesStore.js`

## License

MIT

## Credits

Built with Vue 3, inspired by macOS Launchpad design.
