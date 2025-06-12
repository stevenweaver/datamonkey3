/**
 * Utility functions for caching expensive operations to improve app performance.
 */

// In-memory cache for analyzed results to prevent redundant calculations
const analysisCache = new Map();

// Cache timeout in milliseconds (default: 5 minutes)
const CACHE_TIMEOUT = 5 * 60 * 1000;

/**
 * Get a cached result or compute and cache a new one
 * 
 * @param {string} key - The cache key
 * @param {Function} computeFunction - Function to compute the value if not cached
 * @param {number} timeout - Optional custom timeout in ms
 * @returns {Promise<any>} The cached or computed value
 */
export async function getCachedOrCompute(key, computeFunction, timeout = CACHE_TIMEOUT) {
  // Check if we have a non-expired cached value
  if (analysisCache.has(key)) {
    const { value, expires } = analysisCache.get(key);
    
    // If not expired, return the cached value
    if (expires > Date.now()) {
      console.log(`Cache hit for key: ${key}`);
      return value;
    }
    
    // Otherwise, remove the expired entry
    console.log(`Cache expired for key: ${key}`);
    analysisCache.delete(key);
  }
  
  // Compute the value
  console.log(`Cache miss for key: ${key}, computing value`);
  const value = await computeFunction();
  
  // Cache the result with expiration
  const expires = Date.now() + timeout;
  analysisCache.set(key, { value, expires });
  
  return value;
}

/**
 * Clear a specific cache entry
 * 
 * @param {string} key - The cache key to clear
 */
export function clearCacheEntry(key) {
  if (analysisCache.has(key)) {
    analysisCache.delete(key);
    console.log(`Cleared cache for key: ${key}`);
    return true;
  }
  return false;
}

/**
 * Clear all cache entries
 */
export function clearAllCache() {
  const size = analysisCache.size;
  analysisCache.clear();
  console.log(`Cleared ${size} cache entries`);
  return size;
}

/**
 * Generate a cache key for analysis operations
 * 
 * @param {string} method - Analysis method name
 * @param {string} fileId - File ID
 * @param {Object} options - Analysis options
 * @returns {string} Cache key
 */
export function generateAnalysisKey(method, fileId, options = {}) {
  const optionsString = JSON.stringify(options);
  return `${method}_${fileId}_${optionsString}`;
}

/**
 * Get cache statistics
 * 
 * @returns {Object} Cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let expired = 0;
  let valid = 0;
  
  // Count expired vs valid entries
  analysisCache.forEach(({ expires }) => {
    if (expires <= now) {
      expired++;
    } else {
      valid++;
    }
  });
  
  return {
    total: analysisCache.size,
    valid,
    expired,
    memoryEstimate: estimateCacheSize()
  };
}

/**
 * Estimate the memory size of the cache (rough approximation)
 * 
 * @returns {string} Formatted memory size
 */
function estimateCacheSize() {
  let size = 0;
  
  // Get a rough size estimate for each cache entry
  analysisCache.forEach(({ value }) => {
    // Convert to JSON and measure string length as a rough estimate
    const jsonSize = JSON.stringify(value).length;
    size += jsonSize;
  });
  
  // Format size for display
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
}

/**
 * Clean up expired cache entries
 * 
 * @returns {number} Number of entries removed
 */
export function cleanupExpiredCache() {
  const now = Date.now();
  let removed = 0;
  
  analysisCache.forEach((entry, key) => {
    if (entry.expires <= now) {
      analysisCache.delete(key);
      removed++;
    }
  });
  
  if (removed > 0) {
    console.log(`Removed ${removed} expired cache entries`);
  }
  
  return removed;
}

// Set up a periodic cache cleanup (every minute)
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredCache, 60 * 1000);
}