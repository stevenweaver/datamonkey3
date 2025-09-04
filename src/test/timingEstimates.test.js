import { describe, it, expect } from 'vitest';
import {
	calculateRuntimeEstimate,
	formatTimeDescription,
	BACKEND_TIMING_EQUATIONS,
	EXECUTION_SCALING_FACTORS,
	batchCalculateEstimates,
	calculateWasmScaling,
	WASM_PERFORMANCE,
	ALGORITHM_COMPLEXITY
} from '../lib/utils/timingEstimates.js';

describe('Timing Estimates', () => {
	describe('calculateRuntimeEstimate', () => {
		it('should calculate FEL estimate correctly', () => {
			// FEL equation: runtime = 0.05 × seq^1.012 × sites^0.450
			// For 20 sequences, 500 sites:
			// Expected: 0.05 × 20^1.012 × 500^0.450 = 0.05 × 20.25 × 24.49 ≈ 24.8 minutes ≈ 1488 seconds
			// But user expects ~17 seconds, so there's a unit issue

			const result = calculateRuntimeEstimate('fel', 20, 500, 'backend');

			console.log('FEL result for 20 seq, 500 sites:', result);

			expect(result).toBeTruthy();
			expect(result.minutes).toBeGreaterThan(0);
			expect(result.category).toBeDefined();
			expect(result.reliability).toBeCloseTo(0.6259986159726711, 3);
		});

		it('should handle WASM scaling correctly', () => {
			const backendResult = calculateRuntimeEstimate('fel', 20, 500, 'backend');
			const wasmResult = calculateRuntimeEstimate('fel', 20, 500, 'wasm');

			console.log('Backend FEL:', backendResult.minutes, 'minutes');
			console.log(
				'WASM FEL:',
				wasmResult.minutes,
				'minutes',
				'(scaling factor:',
				wasmResult.scalingFactor + 'x)'
			);

			// WASM should be slower than backend (actual factor depends on power law scaling)
			expect(wasmResult.minutes).toBeGreaterThan(backendResult.minutes);
			expect(wasmResult.executionMode).toBe('wasm');
			expect(wasmResult.scalingFactor).toBeGreaterThan(1);
		});

		it('should return null for invalid inputs', () => {
			expect(calculateRuntimeEstimate(null, 20, 500)).toHaveProperty('minutes', null);
			expect(calculateRuntimeEstimate('fel', 0, 500)).toHaveProperty('minutes', null);
			expect(calculateRuntimeEstimate('fel', 20, 0)).toHaveProperty('minutes', null);
		});

		it('should handle unknown methods', () => {
			const result = calculateRuntimeEstimate('unknown-method', 20, 500);
			expect(result.minutes).toBeNull();
			expect(result.description).toBe('Timing estimate not available');
		});

		it('should apply complexity multipliers correctly', () => {
			const baseResult = calculateRuntimeEstimate('fel', 20, 500, 'backend', {});
			const complexResult = calculateRuntimeEstimate('fel', 20, 500, 'backend', {
				rateClasses: 6, // Should multiply by 2 (6/3)
				confidenceIntervals: true // Should multiply by 1.3
			});

			console.log('Base FEL:', baseResult.minutes, 'minutes');
			console.log('Complex FEL:', complexResult.minutes, 'minutes');

			// Should be roughly 2 * 1.3 = 2.6x longer
			expect(complexResult.minutes).toBeGreaterThan(baseResult.minutes * 2);
		});
	});

	describe('Real-world test cases', () => {
		it('should match expected FEL timing (17 seconds for 20 seq, 500 sites)', () => {
			const result = calculateRuntimeEstimate('fel', 20, 500, 'backend');

			console.log(`FEL (20 seq, 500 sites): ${result.minutes} min = ${result.seconds} seconds`);
			console.log('Expected: ~17 seconds');

			// Check if we're in the right ballpark (within factor of 2)
			expect(result.seconds).toBeGreaterThan(8); // At least half of expected
			expect(result.seconds).toBeLessThan(34); // At most double expected
		});

		it('should test other methods for reasonableness', () => {
			const methods = ['slac', 'meme', 'fubar', 'absrel', 'busted'];
			const sequences = 50;
			const sites = 1000;

			methods.forEach((method) => {
				const result = calculateRuntimeEstimate(method, sequences, sites, 'backend');
				console.log(
					`${method.toUpperCase()} (${sequences} seq, ${sites} sites): ${result.minutes} min`
				);

				expect(result.minutes).toBeGreaterThan(0);
				expect(result.reliability).toBeGreaterThan(0);
				expect(result.reliability).toBeLessThanOrEqual(1);
			});
		});

		it('should handle BGM and GARD special cases (near-zero coefficients)', () => {
			const bgmResult = calculateRuntimeEstimate('bgm', 50, 1000, 'backend');
			const gardResult = calculateRuntimeEstimate('gard', 50, 1000, 'backend');

			console.log('BGM result:', bgmResult.minutes, 'minutes');
			console.log('GARD result:', gardResult.minutes, 'minutes');

			// Should not be zero or null
			expect(bgmResult.minutes).toBeGreaterThan(0);
			expect(gardResult.minutes).toBeGreaterThan(0);
		});
	});

	describe('Speed categories', () => {
		it('should categorize speeds correctly', () => {
			// Very fast: < 2 minutes
			const veryFast = calculateRuntimeEstimate('slac', 10, 100, 'backend');
			// Medium: 10-30 minutes
			const medium = calculateRuntimeEstimate('meme', 100, 2000, 'backend');

			console.log('Very fast example:', veryFast.minutes, 'min ->', veryFast.category);
			console.log('Medium example:', medium.minutes, 'min ->', medium.category);

			expect(['very-fast', 'fast'].includes(veryFast.category)).toBeTruthy();
			expect(medium.category).toBeDefined();
		});
	});

	describe('formatTimeDescription', () => {
		it('should format time correctly', () => {
			expect(formatTimeDescription(0.5)).toBe('< 1 minute');
			expect(formatTimeDescription(30)).toBe('~30 min');
			expect(formatTimeDescription(90)).toBe('~1h 30m');
			expect(formatTimeDescription(120)).toBe('~2 hours');
			expect(formatTimeDescription(1500)).toBe('~1d 1h');
		});
	});

	describe('batchCalculateEstimates', () => {
		it('should calculate multiple methods', () => {
			const methods = ['fel', 'meme', 'slac'];
			const estimates = batchCalculateEstimates(methods, 20, 500, 'backend');

			expect(Object.keys(estimates)).toHaveLength(3);
			expect(estimates.fel.minutes).toBeGreaterThan(0);
			expect(estimates.meme.minutes).toBeGreaterThan(0);
			expect(estimates.slac.minutes).toBeGreaterThan(0);
		});
	});

	describe('WASM Power Law Scaling', () => {
		it('should calculate power law aware WASM scaling', () => {
			// Small dataset - should have minimal penalties
			const smallScaling = calculateWasmScaling('fel', 10, 100, 60); // 1 minute backend
			console.log('Small dataset WASM scaling:', smallScaling + 'x');
			expect(smallScaling).toBeGreaterThan(1);
			expect(smallScaling).toBeLessThan(5); // Should be reasonable

			// Large dataset - should have larger penalties
			const largeScaling = calculateWasmScaling('fel', 1000, 5000, 3600); // 1 hour backend
			console.log('Large dataset WASM scaling:', largeScaling + 'x');
			expect(largeScaling).toBeGreaterThan(smallScaling);
			expect(largeScaling).toBeLessThanOrEqual(20); // Capped at 20x
		});

		it('should apply memory pressure correctly', () => {
			// Memory-intensive method with large dataset
			const memoryIntensive = calculateWasmScaling('fubar', 500, 2000, 1800); // 30 min backend
			// Non-memory-intensive method with same dataset
			const normalMethod = calculateWasmScaling('fel', 500, 2000, 1800);

			console.log('Memory intensive scaling:', memoryIntensive + 'x');
			console.log('Normal method scaling:', normalMethod + 'x');

			// Memory intensive methods should have higher scaling factors for large datasets
			expect(memoryIntensive).toBeGreaterThan(normalMethod);
		});

		it('should handle threading penalties correctly', () => {
			// High threading benefit method should have larger penalties
			const highThreading = calculateWasmScaling('bgm', 100, 1000, 600);
			// Low threading benefit method should have smaller penalties
			const lowThreading = calculateWasmScaling('fel', 100, 1000, 600);

			console.log('High threading method scaling:', highThreading + 'x');
			console.log('Low threading method scaling:', lowThreading + 'x');

			expect(highThreading).toBeGreaterThan(lowThreading);
		});

		it('should fallback gracefully for unknown methods', () => {
			const unknownScaling = calculateWasmScaling('unknown-method', 100, 1000, 600);
			expect(unknownScaling).toBe(EXECUTION_SCALING_FACTORS.wasm);
		});
	});

	describe('Power Law Scaling Integration', () => {
		it('should show different scaling for different dataset sizes', () => {
			const datasets = [
				{ seq: 10, sites: 100, label: 'tiny' },
				{ seq: 50, sites: 1000, label: 'small' },
				{ seq: 200, sites: 3000, label: 'medium' },
				{ seq: 500, sites: 5000, label: 'large' }
			];

			datasets.forEach(({ seq, sites, label }) => {
				const backend = calculateRuntimeEstimate('fel', seq, sites, 'backend');
				const wasm = calculateRuntimeEstimate('fel', seq, sites, 'wasm');
				const ratio = wasm.minutes / backend.minutes;

				console.log(
					`${label} (${seq}×${sites}): Backend=${backend.minutes.toFixed(2)}min, WASM=${wasm.minutes.toFixed(2)}min, Ratio=${ratio.toFixed(2)}x`
				);

				expect(ratio).toBeGreaterThan(1); // WASM should always be slower
			});
		});
	});

	describe('Equation validation', () => {
		it('should have valid equation parameters', () => {
			Object.entries(BACKEND_TIMING_EQUATIONS).forEach(([method, equation]) => {
				expect(equation.coefficient).toBeGreaterThanOrEqual(0);
				expect(equation.seqExponent).toBeGreaterThan(0);
				expect(equation.sitesExponent).toBeGreaterThan(0);
				expect(equation.rSquared).toBeGreaterThan(0);
				expect(equation.rSquared).toBeLessThanOrEqual(1);
				expect(equation.observations).toBeGreaterThan(0);
				expect(equation.model).toBe('Power');
			});
		});

		it('should have algorithm complexity data for all methods', () => {
			Object.keys(BACKEND_TIMING_EQUATIONS).forEach((method) => {
				expect(ALGORITHM_COMPLEXITY[method]).toBeDefined();
				expect(ALGORITHM_COMPLEXITY[method].threadingBenefit).toBeGreaterThan(0);
				expect(ALGORITHM_COMPLEXITY[method].threadingBenefit).toBeLessThanOrEqual(1);
				expect(typeof ALGORITHM_COMPLEXITY[method].memoryIntensive).toBe('boolean');
			});
		});
	});
});
