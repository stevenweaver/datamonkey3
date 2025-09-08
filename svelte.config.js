import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		// Using auto adapter - automatically detects deployment environment
		// For Cloudflare deployment: npm run deploy:cloudflare (requires wrangler)
		// For other platforms: adapter will auto-detect or can be configured manually
		adapter: adapter(),

		// Configure any environment variables that need to be exposed to the client
		env: {
			publicPrefix: 'PUBLIC_'
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;
