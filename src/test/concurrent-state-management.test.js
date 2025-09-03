import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { analysisStore, activeAnalysisProgress, activeAnalyses } from '../stores/analyses.js';

// Mock IndexedDB storage with proper analysis state tracking
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

// Mock crypto.randomUUID for consistent testing
let uuidCounter = 0;
vi.stubGlobal('crypto', {
	randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`)
});

describe('Simplified Concurrent State Management', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		uuidCounter = 0;

		// Reset mock storage by calling clearAllAnalyses
		const { analysisStorage } = await import('../lib/utils/indexedDBStorage.js');
		await analysisStorage.clearAllAnalyses();

		// Reset the analysis store to clean state
		analysisStore.update(() => ({
			analyses: [],
			currentAnalysisId: null,
			isLoading: false,
			error: null,
			activeAnalyses: []
		}));
	});

	describe('Multiple Active Analyses Tracking', () => {
		it('should track multiple active analyses simultaneously without conflicts', async () => {
			// Start first analysis
			const analysis1Id = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysis1Id, 'Starting FEL analysis...', 'FEL');

			const stateAfterFirst = get(analysisStore);
			expect(stateAfterFirst.activeAnalyses).toHaveLength(1);
			expect(stateAfterFirst.activeAnalyses[0].id).toBe(analysis1Id);
			expect(stateAfterFirst.activeAnalyses[0].message).toBe('Starting FEL analysis...');

			// Start second analysis - should NOT overwrite the first
			const analysis2Id = await analysisStore.createAnalysis('file2', 'SLAC');
			analysisStore.startAnalysisProgress(analysis2Id, 'Starting SLAC analysis...', 'SLAC');

			const stateAfterSecond = get(analysisStore);

			// Both analyses should be tracked
			expect(stateAfterSecond.activeAnalyses).toHaveLength(2);
			expect(stateAfterSecond.analyses).toHaveLength(2);

			// Verify both analyses exist with correct data
			const felAnalysis = stateAfterSecond.activeAnalyses.find((a) => a.id === analysis1Id);
			const slacAnalysis = stateAfterSecond.activeAnalyses.find((a) => a.id === analysis2Id);

			expect(felAnalysis).toBeDefined();
			expect(felAnalysis.message).toBe('Starting FEL analysis...');
			expect(slacAnalysis).toBeDefined();
			expect(slacAnalysis.message).toBe('Starting SLAC analysis...');

			// Progress updates should go to the correct analysis by ID
			analysisStore.updateAnalysisProgressById(analysis1Id, 'running', 50, 'FEL progress update');

			const stateAfterUpdate = get(analysisStore);
			const updatedFelAnalysis = stateAfterUpdate.activeAnalyses.find((a) => a.id === analysis1Id);
			const unchangedSlacAnalysis = stateAfterUpdate.activeAnalyses.find(
				(a) => a.id === analysis2Id
			);

			expect(updatedFelAnalysis.message).toBe('FEL progress update');
			expect(updatedFelAnalysis.progress).toBe(50);
			expect(unchangedSlacAnalysis.message).toBe('Starting SLAC analysis...'); // Should remain unchanged
		});

		it('should handle rapid consecutive analysis starts correctly', async () => {
			// Simulate rapid-fire analysis submission (user clicking multiple methods quickly)
			const analysisIds = [];
			const methods = ['FEL', 'SLAC', 'MEME', 'FUBAR'];

			// Start all analyses in quick succession
			for (let i = 0; i < methods.length; i++) {
				const analysisId = await analysisStore.createAnalysis(`file${i}`, methods[i]);
				analysisIds.push(analysisId);
				analysisStore.startAnalysisProgress(
					analysisId,
					`Starting ${methods[i]} analysis...`,
					methods[i]
				);
			}

			const finalState = get(analysisStore);

			// All analyses should be created and tracked
			expect(finalState.analyses).toHaveLength(4);
			expect(finalState.activeAnalyses).toHaveLength(4);

			// Each analysis should have the correct method and message
			methods.forEach((method, index) => {
				const analysis = finalState.activeAnalyses.find((a) => a.id === analysisIds[index]);
				expect(analysis).toBeDefined();
				expect(analysis.method).toBe(method);
				expect(analysis.message).toBe(`Starting ${method} analysis...`);
			});
		});
	});

	describe('Progress Updates by ID', () => {
		it('should route progress updates to the correct analysis by ID', async () => {
			// Create multiple analyses
			const analysis1Id = await analysisStore.createAnalysis('file1', 'FEL');
			const analysis2Id = await analysisStore.createAnalysis('file2', 'SLAC');

			analysisStore.startAnalysisProgress(analysis1Id, 'FEL starting...', 'FEL');
			analysisStore.startAnalysisProgress(analysis2Id, 'SLAC starting...', 'SLAC');

			// Send specific progress updates
			analysisStore.updateAnalysisProgressById(analysis1Id, 'running', 25, 'FEL at 25%');
			analysisStore.updateAnalysisProgressById(analysis2Id, 'running', 75, 'SLAC at 75%');

			const state = get(analysisStore);

			const felAnalysis = state.activeAnalyses.find((a) => a.id === analysis1Id);
			const slacAnalysis = state.activeAnalyses.find((a) => a.id === analysis2Id);

			expect(felAnalysis.message).toBe('FEL at 25%');
			expect(felAnalysis.progress).toBe(25);
			expect(slacAnalysis.message).toBe('SLAC at 75%');
			expect(slacAnalysis.progress).toBe(75);
		});

		it('should handle backend completion events correctly', async () => {
			// Create multiple analyses
			const analysis1Id = await analysisStore.createAnalysis('file1', 'FEL');
			const analysis2Id = await analysisStore.createAnalysis('file2', 'SLAC');

			analysisStore.startAnalysisProgress(analysis1Id, 'FEL starting...', 'FEL');
			analysisStore.startAnalysisProgress(analysis2Id, 'SLAC starting...', 'SLAC');

			// Complete the first analysis
			await analysisStore.updateAnalysis(analysis1Id, {
				status: 'completed',
				result: JSON.stringify({ test: 'data' }),
				completedAt: Date.now()
			});

			// Remove from active analyses
			analysisStore.removeFromActiveAnalyses(analysis1Id);

			const state = get(analysisStore);

			// Only SLAC should remain active
			expect(state.activeAnalyses).toHaveLength(1);
			expect(state.activeAnalyses[0].id).toBe(analysis2Id);

			// Both should exist in analyses array
			expect(state.analyses).toHaveLength(2);
			const completedAnalysis = state.analyses.find((a) => a.id === analysis1Id);
			expect(completedAnalysis.status).toBe('completed');
		});
	});

	describe('Status Indicator Consistency', () => {
		it('should provide consistent running analysis counts', async () => {
			// Create multiple analyses
			const analysisIds = [];
			for (let i = 0; i < 5; i++) {
				const analysisId = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				analysisIds.push(analysisId);
				analysisStore.startAnalysisProgress(analysisId, `Analysis ${i}`, 'FEL');
			}

			const state = get(analysisStore);
			const activeAnalysesFromStore = get(activeAnalyses);

			// Both should show the same count
			expect(state.activeAnalyses).toHaveLength(5);
			expect(activeAnalysesFromStore).toHaveLength(5);

			// Progress updates should work for all
			analysisIds.forEach((id, index) => {
				analysisStore.updateAnalysisProgressById(
					id,
					'running',
					index * 20,
					`Progress ${index * 20}%`
				);
			});

			const updatedState = get(analysisStore);
			expect(updatedState.activeAnalyses).toHaveLength(5);

			// Verify each analysis has correct progress
			analysisIds.forEach((id, index) => {
				const analysis = updatedState.activeAnalyses.find((a) => a.id === id);
				expect(analysis.progress).toBe(index * 20);
			});
		});

		it('should handle analysis completion and cleanup', async () => {
			// Create analysis
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			let state = get(analysisStore);
			expect(state.activeAnalyses).toHaveLength(1);

			// Complete analysis
			await analysisStore.completeAnalysisProgress(true, 'Completed successfully');

			state = get(analysisStore);

			// Analysis should be updated in main array
			const completedAnalysis = state.analyses.find((a) => a.id === analysisId);
			expect(completedAnalysis).toBeDefined();
			expect(completedAnalysis.status).toBe('completed');
		});
	});

	describe('Backward Compatibility', () => {
		it('should maintain activeAnalysisProgress for backward compatibility', async () => {
			// Create an analysis
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting FEL...', 'FEL');

			const progress = get(activeAnalysisProgress);

			// Should return the first active analysis
			expect(progress.id).toBe(analysisId);
			expect(progress.message).toBe('Starting FEL...');
			expect(progress.method).toBe('FEL');
		});

		it('should handle legacy updateAnalysisProgress method', async () => {
			// Create an analysis
			const analysisId = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysisId, 'Starting...', 'FEL');

			// Use legacy method (should update first active analysis)
			analysisStore.updateAnalysisProgress('running', 50, 'Legacy progress update');

			const state = get(analysisStore);
			const analysis = state.activeAnalyses.find((a) => a.id === analysisId);

			expect(analysis.message).toBe('Legacy progress update');
			expect(analysis.progress).toBe(50);
			expect(analysis.status).toBe('running');
		});
	});

	describe('Performance and Memory Management', () => {
		it('should handle many concurrent analyses efficiently', async () => {
			const startTime = performance.now();

			// Create 20 analyses
			const analysisIds = [];
			for (let i = 0; i < 20; i++) {
				const analysisId = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				analysisIds.push(analysisId);
				analysisStore.startAnalysisProgress(analysisId, `Analysis ${i}`, 'FEL');
			}

			const setupTime = performance.now() - startTime;

			// Perform many updates
			const updateStartTime = performance.now();
			for (let i = 0; i < 100; i++) {
				const randomAnalysisId = analysisIds[Math.floor(Math.random() * analysisIds.length)];
				analysisStore.updateAnalysisProgressById(randomAnalysisId, 'running', i, `Update ${i}`);
			}
			const updateTime = performance.now() - updateStartTime;

			console.log(`Setup 20 analyses: ${setupTime}ms`);
			console.log(`100 progress updates: ${updateTime}ms`);

			const state = get(analysisStore);
			expect(state.activeAnalyses).toHaveLength(20);

			// Performance should be reasonable
			expect(setupTime).toBeLessThan(100); // Less than 100ms to setup
			expect(updateTime).toBeLessThan(50); // Less than 50ms for updates
		});

		it('should clean up completed analyses from active list', async () => {
			// Create analyses
			const analysisIds = [];
			for (let i = 0; i < 10; i++) {
				const analysisId = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				analysisIds.push(analysisId);
				analysisStore.startAnalysisProgress(analysisId, `Analysis ${i}`, 'FEL');
			}

			let state = get(analysisStore);
			expect(state.activeAnalyses).toHaveLength(10);

			// Complete and remove half of them
			for (let i = 0; i < 5; i++) {
				analysisStore.removeFromActiveAnalyses(analysisIds[i]);
			}

			state = get(analysisStore);
			expect(state.activeAnalyses).toHaveLength(5);
			expect(state.analyses).toHaveLength(10); // All still exist in main array
		});
	});

	describe('Real-world Scenarios', () => {
		it('should handle user running multiple methods on same file', async () => {
			const fileId = 'test-file-1';
			const methods = ['FEL', 'SLAC', 'MEME', 'FUBAR'];
			const analysisIds = [];

			// User selects multiple methods for same file
			for (const method of methods) {
				const analysisId = await analysisStore.createAnalysis(fileId, method);
				analysisIds.push(analysisId);
				analysisStore.startAnalysisProgress(analysisId, `Starting ${method}...`, method);
			}

			const state = get(analysisStore);
			expect(state.activeAnalyses).toHaveLength(4);
			expect(state.analyses).toHaveLength(4);

			// Each analysis should have correct method
			methods.forEach((method, index) => {
				const analysis = state.activeAnalyses.find((a) => a.id === analysisIds[index]);
				expect(analysis.method).toBe(method);
			});

			// Complete them in different order
			analysisStore.removeFromActiveAnalyses(analysisIds[1]); // SLAC first
			analysisStore.removeFromActiveAnalyses(analysisIds[0]); // FEL second

			const finalState = get(analysisStore);
			expect(finalState.activeAnalyses).toHaveLength(2); // MEME and FUBAR still active
		});

		it('should handle analysis cancellation correctly', async () => {
			// Create multiple analyses
			const analysis1Id = await analysisStore.createAnalysis('file1', 'FEL');
			const analysis2Id = await analysisStore.createAnalysis('file2', 'SLAC');

			analysisStore.startAnalysisProgress(analysis1Id, 'FEL starting...', 'FEL');
			analysisStore.startAnalysisProgress(analysis2Id, 'SLAC starting...', 'SLAC');

			let state = get(analysisStore);
			expect(state.activeAnalyses).toHaveLength(2);

			// Cancel first analysis
			await analysisStore.cancelAnalysis(analysis1Id);

			state = get(analysisStore);
			expect(state.activeAnalyses).toHaveLength(1); // Only SLAC remains active
			expect(state.activeAnalyses[0].id).toBe(analysis2Id);

			// Both still exist in main analyses array
			expect(state.analyses).toHaveLength(2);
			const cancelledAnalysis = state.analyses.find((a) => a.id === analysis1Id);
			expect(cancelledAnalysis.status).toBe('cancelled');
		});
	});
});
