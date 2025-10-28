# Book Library ISBN Scanner

Shape detection API was introduced around Chrome 83, but is not widely supported yet. Test app to demo usability of these browser API's.

## Project Structure

```
book-library-isbn-scanner/
├── src/
│   ├── components/
│   │   └── scannerApp.ts   # Main Alpine.js component
│   ├── types.ts            # TypeScript type definitions
│   ├── utils.ts            # Utility functions (API, storage, formatting)
│   ├── main.ts             # Application entry point
│   ├── style.css           # Application styles
│   ├── alpinejs.d.ts       # Alpine.js type declarations
│   └── barcode-detector.d.ts # BarcodeDetector API types
├── index.html              # Main HTML file
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A browser that supports the BarcodeDetector API (Chrome recommended)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`.

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview

Preview the production build:

```bash
npm run preview
```
