import { mdsvex } from "mdsvex";
import cloudflareAdapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: [vitePreprocess(), mdsvex()],

    kit: {
		// Using Cloudflare adapter for Cloudflare Pages deployment
		adapter: cloudflareAdapter(),
		
		// Configure any environment variables that need to be exposed to the client
		env: {
			publicPrefix: 'PUBLIC_'
		}
	},

    extensions: [".svelte", ".svx"]
};

export default config;
