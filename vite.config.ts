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
		},
		// Proxy configuration for hyphy-eye localStorage integration
		proxy: {
			'/hyphy-eye': {
				target: 'http://127.0.0.1:3000',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/hyphy-eye/, ''),
				configure: (proxy, options) => {
					// Add logging for debugging
					proxy.on('proxyReq', (proxyReq, req, res) => {
						console.log('Proxying hyphy-eye request:', req.url);
					});
				}
			}
		}
	},

	// Optimize dependencies to prevent long processing times
	optimizeDeps: {
		include: ['@biowasm/aioli', 'toml', 'marked']
	}
});
