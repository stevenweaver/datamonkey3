// Environment configuration
// For iframe embed URLs
export const PAGES_URL = import.meta.env.VITE_PAGES_URL || '//localhost:3000/pages';

// For direct links to hyphy-eye
export const HYPHY_EYE_URL = import.meta.env.VITE_HYPHY_EYE_URL || 'http://localhost:3000';

// When in production (or cloudflare), PAGES_URL will be '//responsive-iframe.hyphy-eye.pages.dev/pages'
// In development, it will be '//localhost:3000/pages'
