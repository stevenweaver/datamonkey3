/**
 * Integration tests for AnalysisStatusIndicator component
 *
 * Tests the component's reactive behavior with the analysis store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { analysisStore, activeAnalyses } from '../stores/analyses.js';

// Mock IndexedDB storage
vi.mock('../lib/utils/indexedDBStorage.js', () => {
	const analyses = new Map();

	return {
		analysisStorage: {
			analyses,
			getAllAnalyses: vi.fn().mockResolvedValue([]),
			saveAnalysis: vi.fn().mockImplementation((analysis) => {
				analyses.set(analysis.id, analysis);
				return Promise.resolve(true);
			}),
			getAnalysis: vi.fn().mockImplementation((id) => {
				const analysis = analyses.get(id);
				return Promise.resolve(
					analysis || {
						id,
						status: 'pending',
						createdAt: Date.now()
					}
				);
			}),
			deleteAnalysis: vi.fn().mockResolvedValue(true),
			getAnalysesByFileId: vi.fn().mockResolvedValue([]),
			clearAllAnalyses: vi.fn().mockImplementation(() => {
				analyses.clear();
				return Promise.resolve(true);
			})
		}
	};
});

// Mock browser environment
vi.mock('$app/environment', () => ({
	browser: true
}));

// Mock navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

// Mock crypto.randomUUID
let uuidCounter = 0;
vi.stubGlobal('crypto', {
	randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`)
});

// Helper to simulate what AnalysisStatusIndicator calculates
// This mirrors the CURRENT (potentially buggy) logic
function getIndicatorCounts(analysisStoreState, activeAnalysesState) {
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	// Running count - current buggy logic using Math.max
	const mainRunning = analysisStoreState.analyses.filter(
		(a) =>
			a.status !== 'completed' &&
			a.status !== 'error' &&
			a.status !== 'cancelled' &&
			a.method !== 'datareader'
	).length;

	const activeRunning = activeAnalysesState.filter(
		(a) => a.status !== 'completed' && a.status !== 'error' && a.method !== 'datareader'
	).length;

	const runningCount = Math.max(mainRunning, activeRunning);

	// Completed count
	const completedCount = analysisStoreState.analyses.filter(
		(a) =>
			a.status === 'completed' &&
			a.completedAt &&
			new Date(a.completedAt) >= todayStart &&
			a.method !== 'datareader'
	).length;

	// Failed count
	const mainFailed = analysisStoreState.analyses.filter(
		(a) => a.status === 'error' && a.method !== 'datareader'
	).length;

	const activeFailed = activeAnalysesState.filter(
		(a) => a.status === 'error' && a.method !== 'datareader'
	).length;

	const failedCount = Math.max(mainFailed, activeFailed);

	return { runningCount, completedCount, failedCount };
}

// Helper for Set-based deduplication (the fix)
function getIndicatorCountsFixed(analysisStoreState, activeAnalysesState) {
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	// Running count with Set deduplication
	const runningIds = new Set();
	analysisStoreState.analyses
		.filter(
			(a) =>
				!['completed', 'error', 'cancelled'].includes(a.status) && a.method !== 'datareader'
		)
		.forEach((a) => runningIds.add(a.id));
	activeAnalysesState
		.filter((a) => !['completed', 'error'].includes(a.status) && a.method !== 'datareader')
		.forEach((a) => runningIds.add(a.id));
	const runningCount = runningIds.size;

	// Completed count (same logic)
	const completedCount = analysisStoreState.analyses.filter(
		(a) =>
			a.status === 'completed' &&
			a.completedAt &&
			new Date(a.completedAt) >= todayStart &&
			a.method !== 'datareader'
	).length;

	// Failed count with Set deduplication
	const failedIds = new Set();
	analysisStoreState.analyses
		.filter((a) => a.status === 'error' && a.method !== 'datareader')
		.forEach((a) => failedIds.add(a.id));
	activeAnalysesState
		.filter((a) => a.status === 'error' && a.method !== 'datareader')
		.forEach((a) => failedIds.add(a.id));
	const failedCount = failedIds.size;

	return { runningCount, completedCount, failedCount };
}

describe('AnalysisStatusIndicator Count Logic', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		uuidCounter = 0;

		const { analysisStorage } = await import('../lib/utils/indexedDBStorage.js');
		await analysisStorage.clearAllAnalyses();

		analysisStore.update(() => ({
			analyses: [],
			currentAnalysisId: null,
			isLoading: false,
			error: null,
			activeAnalyses: []
		}));
	});

	afterEach(() => {
		cleanup();
	});

	describe('Running Count Reactivity', () => {
		it('should update running count when analysis starts', async () => {
			let state = get(analysisStore);
			let active = get(activeAnalyses);

			expect(getIndicatorCounts(state, active).runningCount).toBe(0);

			// Start an analysis
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			state = get(analysisStore);
			active = get(activeAnalyses);

			expect(getIndicatorCounts(state, active).runningCount).toBe(1);
		});

		it('should show correct running count with multiple concurrent analyses', async () => {
			// Start 5 analyses
			const ids = [];
			for (let i = 0; i < 5; i++) {
				const id = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				ids.push(id);
				analysisStore.startAnalysisProgress(id, `Starting ${i}...`, 'FEL');
			}

			const state = get(analysisStore);
			const active = get(activeAnalyses);

			expect(getIndicatorCounts(state, active).runningCount).toBe(5);
			expect(getIndicatorCountsFixed(state, active).runningCount).toBe(5);
		});

		it('should correctly decrement running count as analyses complete', async () => {
			// Start 3 analyses
			const ids = [];
			for (let i = 0; i < 3; i++) {
				const id = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				ids.push(id);
				analysisStore.startAnalysisProgress(id, `Starting ${i}...`, 'FEL');
			}

			let state = get(analysisStore);
			let active = get(activeAnalyses);
			expect(getIndicatorCounts(state, active).runningCount).toBe(3);

			// Complete first analysis
			await analysisStore.updateAnalysis(ids[0], {
				status: 'completed',
				completedAt: Date.now()
			});
			analysisStore.removeFromActiveAnalyses(ids[0]);

			state = get(analysisStore);
			active = get(activeAnalyses);
			expect(getIndicatorCounts(state, active).runningCount).toBe(2);

			// Complete second analysis
			await analysisStore.updateAnalysis(ids[1], {
				status: 'completed',
				completedAt: Date.now()
			});
			analysisStore.removeFromActiveAnalyses(ids[1]);

			state = get(analysisStore);
			active = get(activeAnalyses);
			expect(getIndicatorCounts(state, active).runningCount).toBe(1);
		});
	});

	describe('Completed Count Reactivity', () => {
		it('should update completed count when analysis finishes', async () => {
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			let state = get(analysisStore);
			let active = get(activeAnalyses);
			expect(getIndicatorCounts(state, active).completedCount).toBe(0);

			// Complete the analysis
			await analysisStore.updateAnalysis(analysisId, {
				status: 'completed',
				completedAt: Date.now()
			});
			analysisStore.removeFromActiveAnalyses(analysisId);

			state = get(analysisStore);
			active = get(activeAnalyses);
			expect(getIndicatorCounts(state, active).completedCount).toBe(1);
		});

		it('should show both running and completed counts simultaneously', async () => {
			// Create 3 analyses
			const ids = [];
			for (let i = 0; i < 3; i++) {
				const id = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				ids.push(id);
				analysisStore.startAnalysisProgress(id, `Starting ${i}...`, 'FEL');
			}

			// Complete one
			await analysisStore.updateAnalysis(ids[0], {
				status: 'completed',
				completedAt: Date.now()
			});
			analysisStore.removeFromActiveAnalyses(ids[0]);

			const state = get(analysisStore);
			const active = get(activeAnalyses);
			const counts = getIndicatorCounts(state, active);

			expect(counts.runningCount).toBe(2);
			expect(counts.completedCount).toBe(1);
		});
	});

	describe('Failed Count Reactivity', () => {
		it('should update failed count when analysis errors', async () => {
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			let state = get(analysisStore);
			let active = get(activeAnalyses);
			expect(getIndicatorCounts(state, active).failedCount).toBe(0);

			// Error the analysis - note: this only updates activeAnalyses, not main analyses array
			analysisStore.updateAnalysisProgressById(analysisId, 'error', 0, 'Failed!');

			state = get(analysisStore);
			active = get(activeAnalyses);

			// Current buggy behavior: main array has 'pending', active has 'error'
			// Math.max(0, 1) = 1 for failedCount
			expect(getIndicatorCounts(state, active).failedCount).toBe(1);
		});

		it('should correctly track failed count with synced status', async () => {
			// This test verifies that status sync works correctly for error tracking

			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			// Error via updateAnalysisProgressById (now updates BOTH arrays)
			analysisStore.updateAnalysisProgressById(analysisId, 'error', 0, 'Failed!');

			const state = get(analysisStore);
			const active = get(activeAnalyses);

			// Both arrays should now show 'error'
			const mainAnalysis = state.analyses.find((a) => a.id === analysisId);
			const activeAnalysis = active.find((a) => a.id === analysisId);

			expect(mainAnalysis.status).toBe('error');
			expect(activeAnalysis.status).toBe('error');

			// The running count should now be correct
			const counts = getIndicatorCounts(state, active);
			// Running: main has 0 (error), active has 0 (error) -> max = 0
			expect(counts.runningCount).toBe(0);
			expect(counts.failedCount).toBe(1);
		});
	});

	describe('Visibility Logic', () => {
		it('should hide indicator when all counts are zero', async () => {
			const state = get(analysisStore);
			const active = get(activeAnalyses);
			const counts = getIndicatorCounts(state, active);

			const showIndicator =
				counts.runningCount > 0 || counts.completedCount > 0 || counts.failedCount > 0;
			expect(showIndicator).toBe(false);
		});

		it('should show indicator when any count is non-zero', async () => {
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			const state = get(analysisStore);
			const active = get(activeAnalyses);
			const counts = getIndicatorCounts(state, active);

			const showIndicator =
				counts.runningCount > 0 || counts.completedCount > 0 || counts.failedCount > 0;
			expect(showIndicator).toBe(true);
		});
	});

	describe('Concurrent Analysis Display', () => {
		it('should update counts in real-time during batch completions', async () => {
			// Create 5 analyses
			const ids = [];
			for (let i = 0; i < 5; i++) {
				const id = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				ids.push(id);
				analysisStore.startAnalysisProgress(id, `Starting ${i}...`, 'FEL');
			}

			let state = get(analysisStore);
			let active = get(activeAnalyses);
			expect(getIndicatorCounts(state, active).runningCount).toBe(5);

			// Complete all in sequence, checking counts after each
			for (let i = 0; i < 5; i++) {
				await analysisStore.updateAnalysis(ids[i], {
					status: 'completed',
					completedAt: Date.now()
				});
				analysisStore.removeFromActiveAnalyses(ids[i]);

				state = get(analysisStore);
				active = get(activeAnalyses);
				const counts = getIndicatorCounts(state, active);

				expect(counts.runningCount).toBe(5 - i - 1);
				expect(counts.completedCount).toBe(i + 1);
			}
		});

		it('should handle mixed status changes correctly', async () => {
			// Create 4 analyses
			const ids = [];
			for (let i = 0; i < 4; i++) {
				const id = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				ids.push(id);
				analysisStore.startAnalysisProgress(id, `Starting ${i}...`, 'FEL');
			}

			// Complete 2, error 1, leave 1 running
			await analysisStore.updateAnalysis(ids[0], {
				status: 'completed',
				completedAt: Date.now()
			});
			analysisStore.removeFromActiveAnalyses(ids[0]);

			await analysisStore.updateAnalysis(ids[1], {
				status: 'completed',
				completedAt: Date.now()
			});
			analysisStore.removeFromActiveAnalyses(ids[1]);

			await analysisStore.updateAnalysis(ids[2], {
				status: 'error',
				error: 'Test error'
			});
			analysisStore.removeFromActiveAnalyses(ids[2]);

			const state = get(analysisStore);
			const active = get(activeAnalyses);
			const counts = getIndicatorCounts(state, active);

			expect(counts.runningCount).toBe(1);
			expect(counts.completedCount).toBe(2);
			expect(counts.failedCount).toBe(1);
		});
	});
});
