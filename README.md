# 🎬 Media Gallery Shadow DOM

Modern single-page application for searching and managing film collection built with Web Components and Shadow DOM.

## ✨ Features

- 🔍 **Film Search** — Real-time search using OMDb API
- ⭐ **Favorites Management** — Add/remove films to personal collection
- 📄 **Detail View** — Comprehensive film information page
- 🎨 **Shadow DOM** — Fully encapsulated Web Components
- 🚀 **SPA Router** — Hash-based client-side routing
- 🔄 **Reactive State** — Automatic UI updates with `onChange` library
- 📡 **EventBus** — Centralized event system with debugging support
- 🧩 **Modular Architecture** — Clean separation of concerns

## 🏗️ Architecture

### Core Patterns

- **Web Components** — Custom elements with Shadow DOM encapsulation
- **AbstractView** — Base class with automatic lifecycle management
- **EventBus** — Pub/Sub pattern for component communication
- **Reactive State** — Proxy-based state observation
- **Constants System** — Centralized event names and UI constants

### Project Structure

```
src/
├── app.js                 # Application entry point
├── common/
│   ├── view.js            # AbstractView base class
│   ├── router.js          # SPA routing
│   ├── event-bus.js       # EventBus implementation
│   ├── constants.js       # Application constants
│   ├── film-service.js    # API integration
│   └── favorites-service.js
├── views/                 # Page views
│   ├── main/              # Search page
│   ├── favorites/         # Favorites collection
│   └── detail/            # Film details
└── components/            # Reusable Web Components
    ├── card/
    ├── header/
    ├── search/
    └── ui/
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/Anton-Mosquito/Media-Gallery-Shadow-DOM.git
cd Media-Gallery-Shadow-DOM

# Install dependencies
npm install
```

### Development

```bash
# Start dev server with live reload
npm start

# Build bundle (watch mode)
npm run build
```

Open http://localhost:8080 in your browser.

### Production Build

```bash
# Create production bundle
npx rollup -c
```

## 🛠️ Tech Stack

- **Vanilla JavaScript** (ES6+)
- **Web Components API** (Shadow DOM, Custom Elements)
- **onChange** — Reactive state management
- **Rollup** — Module bundler
- **ESLint + Prettier** — Code quality
- **OMDb API** — Film data source

## 📚 Documentation

- [Debug Guide](DEBUG_GUIDE.md) — EventBus debugging tools

## 🎯 Key Features Implementation

### Automatic Lifecycle Management

```javascript
export class MainView extends AbstractView {
  constructor(appState) {
    super(appState); // Auto-setup onChange subscription
    
    // Automatic EventBus cleanup on destroy
    this.subscribe(EVENTS.SEARCH, this.#handleSearch);
  }
  
  onAppStateChange(path) {
    super.onAppStateChange(path); // Auto header update
    // Custom state change logic
  }
}
```

### EventBus with Debugging

```javascript
// Automatic debug logging on localhost
eventBus.emit(EVENTS.SEARCH, { query: 'matrix' });
// Console: 📤 [EventBus] emit: search { query: 'matrix' }
```

### Centralized Constants

```javascript
import { EVENTS, ICONS, PLACEHOLDERS } from './common/constants.js';

// Type-safe event names
this.subscribe(EVENTS.FAVORITE_TOGGLE, handler);
```

## 📦 Build Output

- `dist/app.js` — Application bundle
- `dist/bundle.css` — Compiled styles
- Components use Shadow DOM for style isolation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📄 License

ISC

## 👤 Author

**Anton Komarnytskyi**

---

⭐ Star this repo if you find it useful!
