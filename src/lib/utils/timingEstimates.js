/**
 * HyPhy Analysis Runtime Estimation Utilities
 *
 * Data-driven timing estimates based on empirical analysis of runtime data
 * from production analyses. Each method uses power law equations fitted to
 * observed runtime data.
 *
 * Backend equations are scaled by 1.3 for local WASM execution estimates (30% slower).
 */

// Data-driven timing equations for backend execution (in seconds)
// Format: runtime = coefficient × sequences^seqExponent × sites^sitesExponent
export const BACKEND_TIMING_EQUATIONS = {
	absrel: {
		coefficient: 0.08,
		seqExponent: 1.247,
		sitesExponent: 0.49,
		rSquared: 0.6706794777372124,
		observations: 4429,
		model: 'Power'
	},
	bgm: {
		coefficient: 0.0, // Very small coefficient, essentially 0
		seqExponent: 0.062,
		sitesExponent: 2.104,
		rSquared: 0.5149828056114509,
		observations: 352,
		model: 'Power'
	},
	busted: {
		coefficient: 0.79,
		seqExponent: 1.197,
		sitesExponent: 0.268,
		rSquared: 0.6861066906692657,
		observations: 5755,
		model: 'Power'
	},
	'contrast-fel': {
		coefficient: 0.03,
		seqExponent: 1.198,
		sitesExponent: 0.541,
		rSquared: 0.6783352976729622,
		observations: 348,
		model: 'Power'
	},
	fel: {
		coefficient: 0.05,
		seqExponent: 1.012,
		sitesExponent: 0.45,
		rSquared: 0.6259986159726711,
		observations: 6029,
		model: 'Power'
	},
	fubar: {
		coefficient: 0.12,
		seqExponent: 0.816,
		sitesExponent: 0.346,
		rSquared: 0.8253554433418953,
		observations: 6133,
		model: 'Power'
	},
	gard: {
		coefficient: 0.0, // Very small coefficient, essentially 0
		seqExponent: 1.193,
		sitesExponent: 1.439,
		rSquared: 0.6824862676555312,
		observations: 2473,
		model: 'Power'
	},
	meme: {
		coefficient: 0.05,
		seqExponent: 1.062,
		sitesExponent: 0.524,
		rSquared: 0.627378087361542,
		observations: 8541,
		model: 'Power'
	},
	'multi-hit': {
		coefficient: 0.01,
		seqExponent: 1.237,
		sitesExponent: 0.957,
		rSquared: 0.8505335918623943,
		observations: 70,
		model: 'Power'
	},
	relax: {
		coefficient: 0.77,
		seqExponent: 1.126,
		sitesExponent: 0.335,
		rSquared: 0.6712802918037761,
		observations: 5140,
		model: 'Power'
	},
	slac: {
		coefficient: 0.02,
		seqExponent: 0.919,
		sitesExponent: 0.863,
		rSquared: 0.6057373853183874,
		observations: 5022,
		model: 'Power'
	}
};

// WASM Performance Characteristics
export const WASM_PERFORMANCE = {
	// Base performance relative to native (60% in ideal conditions)
	nativeSpeedRatio: 0.6,

	// Typical number of cores on user machines (affects parallelization loss)
	assumedCores: 4,

	// Memory pressure thresholds (sequences × sites)
	memoryThresholds: {
		comfortable: 50000, // < 50k: minimal memory pressure
		moderate: 200000, // 50k-200k: some memory pressure
		high: 500000, // 200k-500k: significant memory pressure
		extreme: 1000000 // > 1M: severe memory pressure
	}
};

// Algorithm complexity characteristics for threading loss calculation
export const ALGORITHM_COMPLEXITY = {
	// Methods with good parallelization potential (lose more from single-threading)
	absrel: { threadingBenefit: 0.8, memoryIntensive: false },
	bgm: { threadingBenefit: 0.9, memoryIntensive: true },
	busted: { threadingBenefit: 0.7, memoryIntensive: false },
	'contrast-fel': { threadingBenefit: 0.6, memoryIntensive: false },
	fel: { threadingBenefit: 0.6, memoryIntensive: false },
	fubar: { threadingBenefit: 0.8, memoryIntensive: true },
	gard: { threadingBenefit: 0.9, memoryIntensive: true },
	meme: { threadingBenefit: 0.7, memoryIntensive: false },
	'multi-hit': { threadingBenefit: 0.8, memoryIntensive: false },
	relax: { threadingBenefit: 0.7, memoryIntensive: false },
	slac: { threadingBenefit: 0.6, memoryIntensive: false }
};

// Simple scaling factors for backward compatibility
export const EXECUTION_SCALING_FACTORS = {
	backend: 1.0,
	wasm: 1.3 // Fallback simple scaling
};

// Method complexity multipliers based on advanced options
export const COMPLEXITY_MULTIPLIERS = {
	rateClasses: (value) => Math.max(1, value / 3), // 3 is default
	mcmcSamples: (value) => Math.max(1, value / 2000000), // 2M is default
	mcmcChains: (value) => Math.max(1, value / 5), // 5 is default
	gridPoints: (value) => Math.max(1, value / 20), // 20 is default
	maxBreakpoints: (value) => Math.max(1, value / 10), // 10 is default
	chainLength: (value) => Math.max(1, value / 2500000), // 2.5M is default
	confidenceIntervals: (enabled) => (enabled ? 1.3 : 1),
	ancestralSequences: (enabled) => (enabled ? 1.5 : 1),
	synonymousRateVariation: (enabled) => (enabled ? 1.2 : 1),
	siteToSiteRateVariation: (enabled) => (enabled ? 1.4 : 1)
};

// Speed categories with thresholds (in minutes)
export const SPEED_CATEGORIES = {
	'very-fast': {
		threshold: 2,
		icon: '⚡⚡',
		label: 'Very Fast',
		color: 'text-green-600',
		bgColor: 'bg-green-50',
		borderColor: 'border-green-200'
	},
	fast: {
		threshold: 10,
		icon: '⚡',
		label: 'Fast',
		color: 'text-green-500',
		bgColor: 'bg-green-50',
		borderColor: 'border-green-200'
	},
	medium: {
		threshold: 30,
		icon: '⏱️',
		label: 'Medium',
		color: 'text-yellow-600',
		bgColor: 'bg-yellow-50',
		borderColor: 'border-yellow-200'
	},
	slow: {
		threshold: 120,
		icon: '🐢',
		label: 'Slow',
		color: 'text-orange-600',
		bgColor: 'bg-orange-50',
		borderColor: 'border-orange-200'
	},
	'very-slow': {
		threshold: Infinity,
		icon: '🐌',
		label: 'Very Slow',
		color: 'text-red-600',
		bgColor: 'bg-red-50',
		borderColor: 'border-red-200'
	}
};

/**
 * Calculate power law aware WASM scaling factor
 * @param {string} method - Analysis method name
 * @param {number} sequences - Number of sequences
 * @param {number} sites - Number of sites
 * @param {number} baseSeconds - Backend runtime estimate in seconds
 * @returns {number} WASM scaling factor
 */
export function calculateWasmScaling(method, sequences, sites, baseSeconds) {
	const methodKey = method.toLowerCase();
	const complexity = ALGORITHM_COMPLEXITY[methodKey];
	const datasetSize = sequences * sites;

	if (!complexity) {
		// Fallback to simple scaling for unknown methods
		return EXECUTION_SCALING_FACTORS.wasm;
	}

	// Base WASM performance (60% of native)
	let scalingFactor = 1 / WASM_PERFORMANCE.nativeSpeedRatio; // 1.67x slower

	// Threading penalty - more complex algorithms lose more from single-threading
	const threadingLoss = complexity.threadingBenefit * Math.log2(WASM_PERFORMANCE.assumedCores);
	const threadingPenalty = 1 + threadingLoss * 0.5; // Scale the impact
	scalingFactor *= threadingPenalty;

	// Memory pressure penalty - affects large datasets disproportionately
	let memoryPenalty = 1;
	const thresholds = WASM_PERFORMANCE.memoryThresholds;

	if (datasetSize > thresholds.extreme) {
		memoryPenalty = complexity.memoryIntensive ? 8 : 5; // Severe penalty
	} else if (datasetSize > thresholds.high) {
		memoryPenalty = complexity.memoryIntensive ? 4 : 2.5; // High penalty
	} else if (datasetSize > thresholds.moderate) {
		memoryPenalty = complexity.memoryIntensive ? 2 : 1.5; // Moderate penalty
	} else if (datasetSize > thresholds.comfortable) {
		memoryPenalty = 1.2; // Slight penalty
	}

	scalingFactor *= memoryPenalty;

	// Runtime-based penalty - longer analyses suffer more from browser overhead
	if (baseSeconds > 3600) {
		// > 1 hour
		scalingFactor *= 1.5;
	} else if (baseSeconds > 1800) {
		// > 30 minutes
		scalingFactor *= 1.3;
	} else if (baseSeconds > 600) {
		// > 10 minutes
		scalingFactor *= 1.2;
	}

	// Cap the scaling factor to prevent extreme estimates
	return Math.min(scalingFactor, 20); // Max 20x slower than backend
}

/**
 * Calculate runtime estimate using power law equation
 * @param {string} method - Analysis method name (lowercase)
 * @param {number} sequences - Number of sequences in dataset
 * @param {number} sites - Number of sites in dataset
 * @param {'backend'|'wasm'} executionMode - Execution environment
 * @param {Object} options - Advanced options that affect runtime
 * @returns {Object} Timing estimate with minutes, category, and description
 */
export function calculateRuntimeEstimate(
	method,
	sequences,
	sites,
	executionMode = 'backend',
	options = {}
) {
	if (!method || !sequences || !sites) {
		return {
			minutes: null,
			category: 'medium',
			description: 'Timing estimate not available',
			reliability: null,
			executionMode
		};
	}

	const methodKey = method.toLowerCase();
	const equation = BACKEND_TIMING_EQUATIONS[methodKey];

	if (!equation) {
		return {
			minutes: null,
			category: 'medium',
			description: 'Timing estimate not available',
			reliability: null,
			executionMode
		};
	}

	// Handle BGM and GARD special cases (coefficient ≈ 0)
	let baseSeconds;
	if (equation.coefficient < 0.01) {
		// For very small coefficients, use a minimum base time
		const minBaseTime = methodKey === 'bgm' ? 600 : 300; // BGM is slower than GARD typically (in seconds)
		baseSeconds =
			minBaseTime *
			Math.pow(sequences, equation.seqExponent * 0.1) *
			Math.pow(sites, equation.sitesExponent * 0.1);
	} else {
		// Standard power law calculation: runtime = coefficient × seq^seqExp × sites^sitesExp (result in seconds)
		baseSeconds =
			equation.coefficient *
			Math.pow(sequences, equation.seqExponent) *
			Math.pow(sites, equation.sitesExponent);
	}

	// Apply execution mode scaling
	let scalingFactor;
	if (executionMode === 'wasm') {
		// Use power law aware WASM scaling
		scalingFactor = calculateWasmScaling(methodKey, sequences, sites, baseSeconds);
	} else {
		// Use simple backend scaling
		scalingFactor = EXECUTION_SCALING_FACTORS[executionMode] || 1.0;
	}

	let totalSeconds = baseSeconds * scalingFactor;

	// Apply complexity multipliers based on advanced options
	if (options) {
		for (const [optionKey, optionValue] of Object.entries(options)) {
			const multiplier = COMPLEXITY_MULTIPLIERS[optionKey];
			if (multiplier && optionValue !== undefined) {
				totalSeconds *= multiplier(optionValue);
			}
		}
	}

	// Convert to minutes for display and categorization
	const totalMinutes = totalSeconds / 60;

	// Determine speed category
	let category = 'very-slow';
	for (const [catKey, catInfo] of Object.entries(SPEED_CATEGORIES)) {
		if (totalMinutes < catInfo.threshold) {
			category = catKey;
			break;
		}
	}

	return {
		minutes: Math.round(totalMinutes * 100) / 100, // Round to 2 decimal places
		seconds: Math.round(totalSeconds),
		category,
		description: formatTimeDescription(totalMinutes),
		reliability: equation.rSquared,
		observations: equation.observations,
		executionMode,
		scalingFactor: Math.round(scalingFactor * 100) / 100 // Include for debugging
	};
}

/**
 * Format time duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted time string
 */
export function formatTimeDescription(minutes) {
	if (minutes < 1) {
		return '< 1 minute';
	} else if (minutes < 60) {
		return `~${Math.round(minutes)} min`;
	} else if (minutes < 1440) {
		// Less than 24 hours
		const hours = Math.floor(minutes / 60);
		const remainingMins = Math.round(minutes % 60);
		if (remainingMins === 0) {
			return `~${hours} hour${hours > 1 ? 's' : ''}`;
		}
		return `~${hours}h ${remainingMins}m`;
	} else {
		const days = Math.floor(minutes / 1440);
		const remainingHours = Math.round((minutes % 1440) / 60);
		if (remainingHours === 0) {
			return `~${days} day${days > 1 ? 's' : ''}`;
		}
		return `~${days}d ${remainingHours}h`;
	}
}

/**
 * Get available methods for timing estimation
 * @returns {Array<string>} Array of method names
 */
export function getAvailableMethods() {
	return Object.keys(BACKEND_TIMING_EQUATIONS);
}

/**
 * Get equation information for a specific method
 * @param {string} method - Analysis method name
 * @returns {Object|null} Equation parameters and metadata
 */
export function getMethodEquation(method) {
	const methodKey = method.toLowerCase();
	return BACKEND_TIMING_EQUATIONS[methodKey] || null;
}

/**
 * Batch calculate estimates for multiple methods
 * @param {Array<string>} methods - Array of method names
 * @param {number} sequences - Number of sequences
 * @param {number} sites - Number of sites
 * @param {'backend'|'wasm'} executionMode - Execution environment
 * @param {Object} options - Advanced options
 * @returns {Object} Method names mapped to timing estimates
 */
export function batchCalculateEstimates(
	methods,
	sequences,
	sites,
	executionMode = 'backend',
	options = {}
) {
	const estimates = {};
	for (const method of methods) {
		estimates[method] = calculateRuntimeEstimate(method, sequences, sites, executionMode, options);
	}
	return estimates;
}
