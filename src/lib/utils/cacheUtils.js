/**
 * Simple cache utility for expensive operations
 * Simplified version with just essential functionality
 */

// Simple Map-based cache with automatic cleanup
const cache = new Map();

/**
 * Get cached result or compute new one
 * @param {string} key - Cache key
 * @param {Function} computeFn - Function to compute value if not cached
 * @param {number} ttlMs - Time to live in milliseconds (default: 30 minutes)
 * @returns {Promise<any>} Cached or computed value
 */
export async function getCachedOrCompute(key, computeFn, ttlMs = 30 * 60 * 1000) {
	const cached = cache.get(key);
	
	// Check if cached value is still valid
	if (cached && cached.expires > Date.now()) {
		return { ...cached.value, cached: true };
	}
	
	// Remove expired entry
	if (cached) {
		cache.delete(key);
	}
	
	// Compute and cache new value
	const value = await computeFn();
	cache.set(key, {
		value,
		expires: Date.now() + ttlMs
	});
	
	return { ...value, cached: false };
}

/**
 * Generate cache key for analysis operations
 * @param {string} method - Analysis method
 * @param {string} fileIdentifier - File identifier
 * @param {Object} config - Analysis configuration
 * @returns {string} Cache key
 */
export function generateAnalysisKey(method, fileIdentifier, config = {}) {
	const configHash = JSON.stringify(config);
	return `${method}:${fileIdentifier}:${configHash}`;
}

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export function clearCacheEntry(key) {
	cache.delete(key);
}

/**
 * Clear all cache entries
 */
export function clearAllCache() {
	cache.clear();
}