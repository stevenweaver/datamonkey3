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

- `DATABASE_URL`: Path to the SQLite database file (defaults to in-memory database if not provided)
- `VITE_PAGES_URL`: URL for the visualization iframes (defaults to `//localhost:3000/pages` in development)

### Deployment Notes

When deploying to Cloudflare, the application is configured to use an in-memory SQLite database. 
This means data will not persist between deployments or across worker instances.

For production scenarios requiring persistent data, consider using:

- Cloudflare D1 database
- Cloudflare KV for simple key-value storage
- External database service with appropriate connection handling

## Adding New Visualization Methods

To add new visualization methods:

1. Update the method list in `src/lib/AnalysisResultViewer.svelte`
2. Ensure the corresponding visualization is available at `${VITE_PAGES_URL}/${methodName}`
3. The iframe communicates with the parent window via `postMessage`
