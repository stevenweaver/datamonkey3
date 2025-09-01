import { describe, it, expect } from 'vitest';
import {
	calculateRuntimeEstimate,
	formatTimeDescription,
	BACKEND_TIMING_EQUATIONS,
	EXECUTION_SCALING_FACTORS,
	batchCalculateEstimates
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
			console.log('WASM FEL:', wasmResult.minutes, 'minutes');

			// WASM should be 30% slower (1.3x)
			expect(wasmResult.minutes).toBeCloseTo(backendResult.minutes * 1.3, 0);
			expect(wasmResult.executionMode).toBe('wasm');
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
	});
});
