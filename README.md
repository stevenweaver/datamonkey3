# Datamonkey 3

![License](https://img.shields.io/github/license/stevenweaver/datamonkey3)
![Version](https://img.shields.io/badge/version-0.1.0-blue)

A modern, browser-based tool for sequence analysis and molecular evolution studies.

## Purpose

Datamonkey 3 is designed to provide researchers with an intuitive interface to validate, analyze, and visualize sequence data without requiring server-side computation. It brings powerful sequence analysis methods directly to your browser, with a workflow built around clarity and efficiency.

## Core Principles

- **Intuitive Workflow**: Progress logically from data preparation to analysis to results
- **Progressive Disclosure**: View only what you need when you need it
- **Browser-First**: No installation required, works across platforms
- **Local Privacy**: Your data stays on your machine using browser storage

## Features

- **Sequence Validation**: Identify and repair issues in FASTA and NEXUS files
- **Phylogenetic Analysis**: Run methods including FEL, SLAC, MEME, BUSTED, and more
- **Interactive Visualization**: Explore results with embedded interactive visualizations
- **Local Data Storage**: Secure, browser-based storage for files and analyses

## Getting Started

### For Users

Visit the hosted version: [https://datamonkey3.hyphy.org](https://datamonkey3.hyphy.org)

### For Developers

```bash
# Clone the repository
git clone https://github.com/stevenweaver/datamonkey3.git
cd datamonkey3

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Workflow

1. **Data**: Upload and validate sequence files
2. **Analyze**: Select and configure analysis methods
3. **Results**: View, compare, and export findings

## Environment Configuration

| Variable             | Purpose                              | Default                        |
| -------------------- | ------------------------------------ | ------------------------------ |
| `VITE_HYPHY_EYE_URL` | URL for visualization service        | `//vision.hyphy.org`           |
| `VITE_PAGES_URL`     | URL for embedded visualization pages | `//localhost:3000/pages` (dev) |

## Technical Architecture

- **Frontend**: Svelte with TailwindCSS
- **Analysis**: WebAssembly (HyPhy)
- **Storage**: IndexedDB for browser-based persistence
- **Visualization**: Embedded iframes with postMessage communication

## Adding New Methods

1. Update the method configuration in the codebase
2. Ensure visualization components are available at the correct endpoint
3. Update documentation for the new method

## License

[MIT License](LICENSE)

---

Designed with clarity, utility, and restraint.
