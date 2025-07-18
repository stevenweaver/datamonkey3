import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom'
	},

	server: {
		// Increase WebSocket timeout to prevent timeout errors
		hmr: {
			timeout: 60000 // 60 seconds instead of default 30
		}
	},

	// Optimize dependencies to prevent long processing times
	optimizeDeps: {
		include: ['@biowasm/aioli', 'toml', 'marked']
	}
});
