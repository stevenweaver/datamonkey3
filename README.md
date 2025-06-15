# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
# alignment-validation

## Environment Configuration

This application uses environment variables for configuration:

- `VITE_PAGES_URL`: URL for the visualization iframes (defaults to `//localhost:3000/pages` in development)

### Deployment Notes

The application uses browser-based IndexedDB storage for persisting files and analysis results.
This means data is stored locally in the user's browser.

## Adding New Visualization Methods

To add new visualization methods:

1. Update the method list in `src/lib/AnalysisResultViewer.svelte`
2. Ensure the corresponding visualization is available at `${VITE_PAGES_URL}/${methodName}`
3. The iframe communicates with the parent window via `postMessage`
