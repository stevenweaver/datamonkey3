/**
 * Unit tests for analysis store count accuracy and race conditions
 *
 * These tests are designed to expose bugs in the state management:
 * 1. Math.max() logic causing incorrect counts
 * 2. Race conditions in completeAnalysisProgress()
 * 3. Dual-array synchronization issues
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
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

// Mock crypto.randomUUID
let uuidCounter = 0;
vi.stubGlobal('crypto', {
	randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`)
});

/**
 * Helper function to calculate counts the same way AnalysisStatusIndicator does
 * This replicates the CURRENT (buggy) logic using Math.max
 */
function calculateCountsBuggy(state) {
	const mainRunning = state.analyses.filter(
		(a) =>
			a.status !== 'completed' &&
			a.status !== 'error' &&
			a.status !== 'cancelled' &&
			a.method !== 'datareader'
	).length;

	const activeRunning = state.activeAnalyses.filter(
		(a) => a.status !== 'completed' && a.status !== 'error' && a.method !== 'datareader'
	).length;

	return Math.max(mainRunning, activeRunning);
}

/**
 * Helper function to calculate counts using Set-based deduplication (the fix)
 */
function calculateCountsFixed(state) {
	const runningIds = new Set();

	state.analyses
		.filter(
			(a) =>
				!['completed', 'error', 'cancelled'].includes(a.status) && a.method !== 'datareader'
		)
		.forEach((a) => runningIds.add(a.id));

	state.activeAnalyses
		.filter((a) => !['completed', 'error'].includes(a.status) && a.method !== 'datareader')
		.forEach((a) => runningIds.add(a.id));

	return runningIds.size;
}

describe('Analysis Store Count Accuracy', () => {
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

	describe('Count Deduplication', () => {
		it('should not double-count analyses that appear in both arrays', async () => {
			// Create an analysis - it will be in both arrays
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			const state = get(analysisStore);

			// The analysis exists in BOTH arrays
			expect(state.analyses.length).toBe(1);
			expect(state.activeAnalyses.length).toBe(1);
			expect(state.analyses[0].id).toBe(analysisId);
			expect(state.activeAnalyses[0].id).toBe(analysisId);

			// The buggy calculation might give wrong count
			const buggyCount = calculateCountsBuggy(state);
			const fixedCount = calculateCountsFixed(state);

			// Both should equal 1 (not 2)
			expect(fixedCount).toBe(1);
			// This test exposes if the buggy logic gives wrong result
			// (In this simple case it might work, but the logic is still flawed)
			expect(buggyCount).toBe(fixedCount);
		});

		it('should correctly count when analyses array has different status than activeAnalyses', async () => {
			// Create analysis
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			// Update progress - status in activeAnalyses becomes 'running'
			analysisStore.updateAnalysisProgressById(analysisId, 'running', 50, 'Running...');

			const state = get(analysisStore);

			// analyses array still has 'pending' status (not synced)
			// activeAnalyses has 'running' status
			const analysisInMain = state.analyses.find((a) => a.id === analysisId);
			const analysisInActive = state.activeAnalyses.find((a) => a.id === analysisId);

			// Check status might differ
			expect(analysisInActive.status).toBe('running');
			// Main analyses array status depends on whether it was updated

			// Count should still be 1
			const fixedCount = calculateCountsFixed(state);
			expect(fixedCount).toBe(1);
		});

		it('should handle multiple concurrent analyses with unique IDs', async () => {
			// Create 5 analyses
			const ids = [];
			for (let i = 0; i < 5; i++) {
				const id = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				ids.push(id);
				analysisStore.startAnalysisProgress(id, `Starting ${i}...`, 'FEL');
			}

			const state = get(analysisStore);

			expect(state.analyses.length).toBe(5);
			expect(state.activeAnalyses.length).toBe(5);

			// All IDs should be unique
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(5);

			// Fixed count should be 5
			const fixedCount = calculateCountsFixed(state);
			expect(fixedCount).toBe(5);
		});
	});

	describe('Status Transitions', () => {
		it('should correctly count running analyses during state transition to completed', async () => {
			// Create 3 analyses
			const ids = [];
			for (let i = 0; i < 3; i++) {
				const id = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				ids.push(id);
				analysisStore.startAnalysisProgress(id, `Starting ${i}...`, 'FEL');
			}

			let state = get(analysisStore);
			expect(calculateCountsFixed(state)).toBe(3);

			// Complete the first analysis
			await analysisStore.updateAnalysis(ids[0], {
				status: 'completed',
				completedAt: Date.now()
			});
			analysisStore.removeFromActiveAnalyses(ids[0]);

			state = get(analysisStore);

			// Running count should now be 2
			const fixedCount = calculateCountsFixed(state);
			expect(fixedCount).toBe(2);

			// Verify the completed one is not counted
			const completedAnalysis = state.analyses.find((a) => a.id === ids[0]);
			expect(completedAnalysis.status).toBe('completed');
		});

		it('should correctly count when analysis errors', async () => {
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			let state = get(analysisStore);
			expect(calculateCountsFixed(state)).toBe(1);

			// Error the analysis - this now updates BOTH activeAnalyses AND analyses array
			analysisStore.updateAnalysisProgressById(analysisId, 'error', 0, 'Failed!');

			state = get(analysisStore);

			// Both arrays should now be in sync
			const analysisInMain = state.analyses.find((a) => a.id === analysisId);
			const analysisInActive = state.activeAnalyses.find((a) => a.id === analysisId);

			// Log to verify sync
			console.log('Main analyses status:', analysisInMain?.status);
			console.log('Active analyses status:', analysisInActive?.status);

			// Both should be 'error'
			expect(analysisInMain.status).toBe('error');
			expect(analysisInActive.status).toBe('error');

			// Running count should be 0 (errored analysis doesn't count as running)
			const fixedCount = calculateCountsFixed(state);
			expect(fixedCount).toBe(0);
		});

		it('should sync analyses array status with activeAnalyses status', async () => {
			// This test verifies that status updates are synced between arrays
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			// Update status to 'running' via updateAnalysisProgressById
			analysisStore.updateAnalysisProgressById(analysisId, 'running', 50, 'Running...');

			const state = get(analysisStore);
			const analysisInMain = state.analyses.find((a) => a.id === analysisId);
			const analysisInActive = state.activeAnalyses.find((a) => a.id === analysisId);

			// Both arrays should be updated
			expect(analysisInActive.status).toBe('running');
			expect(analysisInMain.status).toBe('running');
		});

		it('should exclude datareader method from counts', async () => {
			// Create a regular analysis
			const felId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(felId, 'Starting FEL...', 'FEL');

			// Manually add a datareader "analysis" to the store
			analysisStore.update((state) => ({
				...state,
				analyses: [
					...state.analyses,
					{
						id: 'datareader-1',
						fileId: 'file1',
						method: 'datareader',
						status: 'running'
					}
				],
				activeAnalyses: [
					...state.activeAnalyses,
					{
						id: 'datareader-1',
						method: 'datareader',
						status: 'running'
					}
				]
			}));

			const state = get(analysisStore);

			// Should have 2 in arrays but only count 1 (excluding datareader)
			expect(state.analyses.length).toBe(2);
			expect(state.activeAnalyses.length).toBe(2);

			const fixedCount = calculateCountsFixed(state);
			expect(fixedCount).toBe(1);
		});
	});

	describe('Cancelled Analyses', () => {
		it('should not count cancelled analyses as running', async () => {
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			let state = get(analysisStore);
			expect(calculateCountsFixed(state)).toBe(1);

			// Cancel the analysis
			await analysisStore.cancelAnalysis(analysisId);

			state = get(analysisStore);

			// Running count should be 0
			const fixedCount = calculateCountsFixed(state);
			expect(fixedCount).toBe(0);

			// Verify it's marked as cancelled
			const cancelledAnalysis = state.analyses.find((a) => a.id === analysisId);
			expect(cancelledAnalysis.status).toBe('cancelled');
		});
	});
});

describe('Race Condition Prevention', () => {
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

	it('should handle completeAnalysisProgress called twice quickly', async () => {
		const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
		analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

		// Call completeAnalysisProgress twice in quick succession
		const promise1 = analysisStore.completeAnalysisProgress(true, 'Completed 1');
		const promise2 = analysisStore.completeAnalysisProgress(true, 'Completed 2');

		await Promise.all([promise1, promise2]);

		const state = get(analysisStore);

		// Should not throw and analysis should be completed
		const analysis = state.analyses.find((a) => a.id === analysisId);
		expect(analysis.status).toBe('completed');
	});

	it('should handle updateAnalysisProgressById during completeAnalysisProgress', async () => {
		const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
		analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

		// Start completion
		const completionPromise = analysisStore.completeAnalysisProgress(true, 'Completing...');

		// Immediately try to update progress
		analysisStore.updateAnalysisProgressById(analysisId, 'running', 75, 'Still running?');

		await completionPromise;

		const state = get(analysisStore);

		// Analysis should be completed despite the concurrent update
		const analysis = state.analyses.find((a) => a.id === analysisId);
		expect(analysis.status).toBe('completed');
	});

	it('should maintain correct counts during simultaneous completions', async () => {
		// Create 5 analyses
		const ids = [];
		for (let i = 0; i < 5; i++) {
			const id = await analysisStore.createAnalysis(`file${i}`, 'FEL');
			ids.push(id);
			analysisStore.startAnalysisProgress(id, `Starting ${i}...`, 'FEL');
		}

		let state = get(analysisStore);
		expect(state.activeAnalyses.length).toBe(5);

		// Complete all simultaneously
		const completionPromises = ids.map(async (id, index) => {
			await analysisStore.updateAnalysis(id, {
				status: 'completed',
				completedAt: Date.now()
			});
			analysisStore.removeFromActiveAnalyses(id);
		});

		await Promise.all(completionPromises);

		state = get(analysisStore);

		// All should be completed
		expect(state.activeAnalyses.length).toBe(0);
		expect(state.analyses.filter((a) => a.status === 'completed').length).toBe(5);
	});

	it('should handle completion of one analysis while another is starting', async () => {
		// Create first analysis
		const id1 = await analysisStore.createAnalysis('file1', 'FEL');
		analysisStore.startAnalysisProgress(id1, 'Starting 1...', 'FEL');

		// Simultaneously create second and complete first
		const createPromise = analysisStore.createAnalysis('file2', 'SLAC');
		const completePromise = (async () => {
			await analysisStore.updateAnalysis(id1, {
				status: 'completed',
				completedAt: Date.now()
			});
			analysisStore.removeFromActiveAnalyses(id1);
		})();

		const [id2] = await Promise.all([createPromise, completePromise]);
		analysisStore.startAnalysisProgress(id2, 'Starting 2...', 'SLAC');

		const state = get(analysisStore);

		// Should have 2 analyses total
		expect(state.analyses.length).toBe(2);

		// First should be completed, second should be active
		const analysis1 = state.analyses.find((a) => a.id === id1);
		const analysis2 = state.analyses.find((a) => a.id === id2);

		expect(analysis1.status).toBe('completed');
		expect(state.activeAnalyses.length).toBe(1);
		expect(state.activeAnalyses[0].id).toBe(id2);
	});
});

describe('Edge Cases', () => {
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

	it('should handle updating progress for non-existent analysis gracefully', () => {
		// This should not throw
		analysisStore.updateAnalysisProgressById('non-existent-id', 'running', 50, 'Update');

		const state = get(analysisStore);
		expect(state.activeAnalyses.length).toBe(0);
	});

	it('should handle removing non-existent analysis from active list', () => {
		// This should not throw
		analysisStore.removeFromActiveAnalyses('non-existent-id');

		const state = get(analysisStore);
		expect(state.activeAnalyses.length).toBe(0);
	});

	it('should handle empty store state gracefully', () => {
		const state = get(analysisStore);

		expect(calculateCountsFixed(state)).toBe(0);
		expect(state.analyses.length).toBe(0);
		expect(state.activeAnalyses.length).toBe(0);
	});

	it('should reset cleanly with clearAllAnalyses', async () => {
		// Create some analyses
		const id1 = await analysisStore.createAnalysis('file1', 'FEL');
		const id2 = await analysisStore.createAnalysis('file2', 'SLAC');
		analysisStore.startAnalysisProgress(id1, 'Starting 1...', 'FEL');
		analysisStore.startAnalysisProgress(id2, 'Starting 2...', 'SLAC');

		let state = get(analysisStore);
		expect(state.analyses.length).toBe(2);
		expect(state.activeAnalyses.length).toBe(2);

		// Clear all
		await analysisStore.clearAllAnalyses();

		state = get(analysisStore);
		expect(state.analyses.length).toBe(0);
		expect(state.activeAnalyses.length).toBe(0);
		expect(state.currentAnalysisId).toBe(null);
	});
});
