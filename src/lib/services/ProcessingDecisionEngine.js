/**
 * ProcessingDecisionEngine - Determines whether to process analyses locally or on backend server
 * 
 * This engine evaluates file characteristics, method complexity, and system capabilities
 * to route computational jobs to the most appropriate processing location.
 */

import { DATAMONKEY_SERVER_URL, ENABLE_BACKEND_PROCESSING, BACKEND_JOB_THRESHOLDS } from '../config/env';

// Use environment-based thresholds with fallbacks
const DEFAULT_THRESHOLDS = {
	...BACKEND_JOB_THRESHOLDS,
	maxLocalDuration: 5 * 60 * 1000, // 5 minutes
	maxLocalMemory: 100 * 1024 * 1024 // 100MB
};

// Method complexity categorization based on MethodSelector.svelte
const METHOD_CATEGORIES = {
	fast: {
		methods: ['slac', 'fel'],
		maxComplexity: 'medium',
		avgDurationFactor: 1.0
	},
	medium: {
		methods: ['meme', 'fubar', 'contrast-fel'],
		maxComplexity: 'high', 
		avgDurationFactor: 2.5
	},
	slow: {
		methods: ['absrel', 'busted', 'fade', 'relax'],
		maxComplexity: 'high',
		avgDurationFactor: 8.0
	},
	verySlow: {
		methods: ['gard', 'bgm', 'multi-hit', 'nrm'],
		maxComplexity: 'very high',
		avgDurationFactor: 20.0
	}
};

export class ProcessingDecisionEngine {
	constructor(config = {}) {
		this.thresholds = { ...DEFAULT_THRESHOLDS, ...config.thresholds };
		this.backendServerUrl = config.backendServerUrl || DATAMONKEY_SERVER_URL;
		this.enableBackendProcessing = config.enableBackendProcessing ?? ENABLE_BACKEND_PROCESSING;
		this.userPreference = config.userPreference || 'auto';
		
		// Cache for server availability to avoid repeated health checks
		this.serverAvailabilityCache = {
			isAvailable: null,
			lastChecked: 0,
			cacheTimeout: 30000 // 30 seconds
		};
	}

	/**
	 * Main decision function - determines processing location
	 * @param {Object} fileMetrics - File analysis results
	 * @param {string} method - Analysis method name
	 * @param {Object} options - Additional options
	 * @returns {Promise<string>} 'local' | 'backend'
	 */
	async determineProcessingLocation(fileMetrics, method, options = {}) {
		const userPref = options.userPreference || this.userPreference;
		
		console.log('ProcessingDecisionEngine: Determining processing location', {
			fileMetrics,
			method,
			userPref,
			thresholds: this.thresholds,
			enableBackendProcessing: this.enableBackendProcessing
		});
		
		// User override - force local
		if (userPref === 'force-local') {
			console.log('ProcessingDecisionEngine: User preference force-local');
			return 'local';
		}

		// User override - force backend (but check availability)
		if (userPref === 'force-backend') {
			const isAvailable = await this.isBackendAvailable();
			console.log('ProcessingDecisionEngine: User preference force-backend, server available:', isAvailable);
			return isAvailable ? 'backend' : 'local';
		}

		// If backend processing disabled, always use local
		if (!this.enableBackendProcessing) {
			console.log('ProcessingDecisionEngine: Backend processing disabled');
			return 'local';
		}

		// Check backend availability before making decisions (unless skipped for testing)
		if (!options.skipServerCheck) {
			const isBackendAvailable = await this.isBackendAvailable();
			console.log('ProcessingDecisionEngine: Backend available:', isBackendAvailable);
			if (!isBackendAvailable) {
				console.log('ProcessingDecisionEngine: Backend not available, falling back to local');
				return 'local';
			}
		} else {
			console.log('ProcessingDecisionEngine: Skipping server availability check for testing');
		}

		// Apply decision logic
		const result = this._evaluateProcessingCriteria(fileMetrics, method, options);
		console.log('ProcessingDecisionEngine: Decision result:', result);
		return result;
	}

	/**
	 * Core decision logic based on various criteria
	 */
	_evaluateProcessingCriteria(fileMetrics, method, options = {}) {
		const methodInfo = this._getMethodInfo(method);
		
		// Hard constraints that require backend processing
		if (this._requiresBackendProcessing(fileMetrics, methodInfo)) {
			return 'backend';
		}

		// Performance-based decisions
		const estimatedMetrics = this._estimatePerformanceMetrics(fileMetrics, methodInfo);
		
		if (estimatedMetrics.duration > this.thresholds.maxLocalDuration) {
			return 'backend';
		}

		if (estimatedMetrics.memoryUsage > this.thresholds.maxLocalMemory) {
			return 'backend';
		}

		// Browser capability assessment
		const browserCapabilities = this._assessBrowserCapabilities();
		if (!browserCapabilities.adequateForLocalProcessing) {
			return 'backend';
		}

		// Default to local for suitable scenarios
		return 'local';
	}

	/**
	 * Check if backend server is available and healthy
	 */
	async isBackendAvailable() {
		// Check cache first
		const now = Date.now();
		if (this.serverAvailabilityCache.lastChecked && 
			(now - this.serverAvailabilityCache.lastChecked) < this.serverAvailabilityCache.cacheTimeout) {
			return this.serverAvailabilityCache.isAvailable;
		}

		if (!this.backendServerUrl) {
			this.serverAvailabilityCache = {
				isAvailable: false,
				lastChecked: now,
				cacheTimeout: this.serverAvailabilityCache.cacheTimeout
			};
			return false;
		}

		try {
			const response = await fetch(`${this.backendServerUrl}/health`, {
				method: 'GET',
				timeout: 5000 // 5 second timeout
			});
			
			const isAvailable = response.ok;
			this.serverAvailabilityCache = {
				isAvailable,
				lastChecked: now,
				cacheTimeout: this.serverAvailabilityCache.cacheTimeout
			};
			
			return isAvailable;
		} catch (error) {
			console.warn('Backend server health check failed:', error);
			this.serverAvailabilityCache = {
				isAvailable: false,
				lastChecked: now,
				cacheTimeout: this.serverAvailabilityCache.cacheTimeout
			};
			return false;
		}
	}

	/**
	 * Determine if job requires backend processing (hard constraints)
	 */
	_requiresBackendProcessing(fileMetrics, methodInfo) {
		console.log('ProcessingDecisionEngine: Checking backend requirements', {
			fileMetrics,
			thresholds: this.thresholds,
			methodInfo
		});

		// File size constraint
		if (fileMetrics.size > this.thresholds.fileSize) {
			console.log('ProcessingDecisionEngine: File size exceeds threshold', fileMetrics.size, '>', this.thresholds.fileSize);
			return true;
		}

		// Sequence count constraint  
		if (fileMetrics.sequences > this.thresholds.sequences) {
			console.log('ProcessingDecisionEngine: Sequence count exceeds threshold', fileMetrics.sequences, '>', this.thresholds.sequences);
			return true;
		}

		// Average sequence length constraint
		if (fileMetrics.avgSequenceLength > this.thresholds.sequenceLength) {
			console.log('ProcessingDecisionEngine: Sequence length exceeds threshold', fileMetrics.avgSequenceLength, '>', this.thresholds.sequenceLength);
			return true;
		}

		// Method complexity constraint
		if (methodInfo.category === 'verySlow') {
			console.log('ProcessingDecisionEngine: Method is very slow category');
			return true;
		}

		console.log('ProcessingDecisionEngine: No backend requirements met');
		return false;
	}

	/**
	 * Estimate performance metrics for a given job
	 */
	_estimatePerformanceMetrics(fileMetrics, methodInfo) {
		// Base computation time estimate (in milliseconds)
		// Formula: sequences * avgLength * complexityFactor * methodFactor
		const baseComputationTime = fileMetrics.sequences * 
			fileMetrics.avgSequenceLength * 
			0.1 * // Base factor (tunable)
			methodInfo.durationFactor;

		// Memory usage estimate (in bytes)
		// Formula: fileSize * memoryMultiplier * methodMemoryFactor
		const estimatedMemory = fileMetrics.size * 2 * methodInfo.memoryFactor;

		return {
			duration: Math.max(baseComputationTime, 1000), // At least 1 second
			memoryUsage: estimatedMemory,
			cpuIntensity: methodInfo.cpuIntensity
		};
	}

	/**
	 * Get method information and categorization
	 */
	_getMethodInfo(method) {
		const methodLower = method.toLowerCase();
		
		for (const [category, info] of Object.entries(METHOD_CATEGORIES)) {
			if (info.methods.includes(methodLower)) {
				return {
					category,
					durationFactor: info.avgDurationFactor,
					memoryFactor: this._getMemoryFactor(category),
					cpuIntensity: this._getCpuIntensity(category)
				};
			}
		}

		// Default for unknown methods
		return {
			category: 'medium',
			durationFactor: 2.5,
			memoryFactor: 2.0,
			cpuIntensity: 'medium'
		};
	}

	/**
	 * Get memory factor based on method category
	 */
	_getMemoryFactor(category) {
		const factors = {
			fast: 1.5,
			medium: 2.0,
			slow: 3.0,
			verySlow: 5.0
		};
		return factors[category] || 2.0;
	}

	/**
	 * Get CPU intensity rating
	 */
	_getCpuIntensity(category) {
		const intensities = {
			fast: 'low',
			medium: 'medium', 
			slow: 'high',
			verySlow: 'very high'
		};
		return intensities[category] || 'medium';
	}

	/**
	 * Assess browser capabilities for local processing
	 */
	_assessBrowserCapabilities() {
		const capabilities = {
			hasWebAssembly: typeof WebAssembly === 'object',
			hasWorkerSupport: typeof Worker === 'function',
			hasIndexedDB: 'indexedDB' in window,
			adequateForLocalProcessing: true
		};

		// Check for minimum requirements
		if (!capabilities.hasWebAssembly || !capabilities.hasIndexedDB) {
			capabilities.adequateForLocalProcessing = false;
		}

		// Try to estimate available memory (if supported)
		if ('memory' in performance) {
			capabilities.estimatedMemory = performance.memory.jsHeapSizeLimit;
			if (capabilities.estimatedMemory < 100 * 1024 * 1024) { // < 100MB
				capabilities.adequateForLocalProcessing = false;
			}
		}

		return capabilities;
	}

	/**
	 * Get current configuration and thresholds
	 */
	getConfiguration() {
		return {
			thresholds: { ...this.thresholds },
			backendServerUrl: this.backendServerUrl,
			enableBackendProcessing: this.enableBackendProcessing,
			userPreference: this.userPreference,
			serverAvailability: this.serverAvailabilityCache
		};
	}

	/**
	 * Update configuration
	 */
	updateConfiguration(updates) {
		if (updates.thresholds) {
			this.thresholds = { ...this.thresholds, ...updates.thresholds };
		}
		if (updates.backendServerUrl !== undefined) {
			this.backendServerUrl = updates.backendServerUrl;
			// Clear server availability cache when URL changes
			this.serverAvailabilityCache.lastChecked = 0;
		}
		if (updates.enableBackendProcessing !== undefined) {
			this.enableBackendProcessing = updates.enableBackendProcessing;
		}
		if (updates.userPreference !== undefined) {
			this.userPreference = updates.userPreference;
		}
	}

	/**
	 * Static factory method with environment-based configuration
	 */
	static createFromEnvironment() {
		// Configuration comes from env.js imports
		return new ProcessingDecisionEngine();
	}
}

// Export singleton instance for easy use
export const processingDecisionEngine = ProcessingDecisionEngine.createFromEnvironment();