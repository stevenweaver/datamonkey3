// This file configures SvelteKit's rendering behavior for this route

/** @type {import('./$types').PageLoad} */
export function load() {
	// This route requires client-side hydration to access IndexedDB
	return {};
}

// This ensures the page only renders on client-side due to IndexedDB dependencies
export const ssr = false;
