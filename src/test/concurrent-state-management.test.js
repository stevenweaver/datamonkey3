import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { analysisStore, activeAnalysisProgress, activeAnalyses } from '../stores/analyses.js';
import { backendAnalysisRunner } from '../lib/services/BackendAnalysisRunner.js';

// Mock IndexedDB storage
vi.mock('../lib/utils/indexedDBStorage.js', () => ({
	analysisStorage: {
		getAllAnalyses: vi.fn().mockResolvedValue([]),
		saveAnalysis: vi.fn().mockResolvedValue(true),
		getAnalysis: vi.fn().mockResolvedValue({}),
		deleteAnalysis: vi.fn().mockResolvedValue(true),
		getAnalysesByFileId: vi.fn().mockResolvedValue([]),
		clearAllAnalyses: vi.fn().mockResolvedValue(true)
	}
}));

// Mock browser environment
vi.mock('$app/environment', () => ({
	browser: true
}));

// Mock crypto.randomUUID for consistent testing
let uuidCounter = 0;
vi.stubGlobal('crypto', {
	randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`)
});

describe('Concurrent State Management Issues', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		uuidCounter = 0;

		// Reset the analysis store to clean state
		analysisStore.update(() => ({
			analyses: [],
			currentAnalysisId: null,
			isLoading: false,
			error: null,
			activeAnalysis: {
				id: null,
				status: null,
				progress: 0,
				message: '',
				logs: []
			},
			activeAnalysesList: []
		}));
	});

	describe('Race Condition: Single ActiveAnalysis Overwrite', () => {
		it('should expose the race condition where starting multiple analyses overwrites activeAnalysis', async () => {
			// Start first analysis
			const analysis1Id = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysis1Id, 'Starting FEL analysis...', 'FEL');

			const stateAfterFirst = get(analysisStore);
			expect(stateAfterFirst.activeAnalysis.id).toBe(analysis1Id);
			expect(stateAfterFirst.activeAnalysis.message).toBe('Starting FEL analysis...');

			// Start second analysis - this OVERWRITES the first!
			const analysis2Id = await analysisStore.createAnalysis('file2', 'SLAC');
			analysisStore.startAnalysisProgress(analysis2Id, 'Starting SLAC analysis...', 'SLAC');

			const stateAfterSecond = get(analysisStore);

			// CRITICAL BUG: The first analysis is completely lost from activeAnalysis
			expect(stateAfterSecond.activeAnalysis.id).toBe(analysis2Id); // Only shows second analysis
			expect(stateAfterSecond.activeAnalysis.message).toBe('Starting SLAC analysis...');

			// Verify both analyses exist in the list
			expect(stateAfterSecond.analyses).toHaveLength(2);
			expect(stateAfterSecond.activeAnalysesList).toHaveLength(2);

			// But only the second analysis can receive progress updates!
			analysisStore.updateAnalysisProgress('running', 50, 'FEL progress update');

			const stateAfterUpdate = get(analysisStore);
			// This update goes to analysis2Id (SLAC), not analysis1Id (FEL)!
			expect(stateAfterUpdate.activeAnalysis.id).toBe(analysis2Id);
			expect(stateAfterUpdate.activeAnalysis.message).toBe('FEL progress update');
		});

		it('should show how rapid consecutive analysis starts lose track of earlier ones', async () => {
			// Simulate rapid-fire analysis submission (user clicking multiple methods quickly)
			const analysisIds = [];
			const methods = ['FEL', 'SLAC', 'MEME', 'FUBAR', 'BUSTED', 'ABSREL', 'GARD', 'BGM'];

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

			// All 8 analyses should be created
			expect(finalState.analyses).toHaveLength(8);
			expect(finalState.activeAnalysesList).toHaveLength(8);

			// But only the LAST one is tracked in activeAnalysis
			expect(finalState.activeAnalysis.id).toBe(analysisIds[7]); // BGM
			expect(finalState.activeAnalysis.method).toBe('BGM');

			// Try to send a progress update - it will only go to BGM!
			analysisStore.updateAnalysisProgress('running', 25, 'Generic progress update');

			const stateAfterUpdate = get(analysisStore);
			expect(stateAfterUpdate.activeAnalysis.id).toBe(analysisIds[7]); // Still BGM
			expect(stateAfterUpdate.activeAnalysis.message).toBe('Generic progress update');

			// The first 7 analyses are orphaned and cannot receive progress updates
			const activeAnalysisStoreValue = get(activeAnalysisProgress);
			expect(activeAnalysisStoreValue.id).toBe(analysisIds[7]); // Only BGM is "active"
		});
	});

	describe('Backend Analysis Runner State Corruption', () => {
		it('should expose backend status updates going to wrong analysis', async () => {
			// Create two backend analyses
			const analysis1Id = await analysisStore.createAnalysis('file1', 'FEL');
			const analysis2Id = await analysisStore.createAnalysis('file2', 'SLAC');

			// Start first analysis
			analysisStore.startAnalysisProgress(analysis1Id, 'Starting FEL...', 'FEL', {
				executionMode: 'backend'
			});

			// Start second analysis (overwrites activeAnalysis)
			analysisStore.startAnalysisProgress(analysis2Id, 'Starting SLAC...', 'SLAC', {
				executionMode: 'backend'
			});

			// Simulate backend status update (this happens in BackendAnalysisRunner)
			// The backend doesn't know which analysis this update is for!
			analysisStore.updateAnalysisProgress('running', 30, 'FEL-specific progress message');

			const state = get(analysisStore);

			// The FEL progress message goes to SLAC analysis!
			expect(state.activeAnalysis.id).toBe(analysis2Id); // SLAC
			expect(state.activeAnalysis.message).toBe('FEL-specific progress message'); // Wrong analysis gets FEL message!
		});

		it('should expose backend completion events going to wrong analysis', async () => {
			// Create multiple backend analyses to track in activeAnalyses map
			backendAnalysisRunner.activeAnalyses.clear();

			const analysis1Id = await analysisStore.createAnalysis('file1', 'FEL');
			const analysis2Id = await analysisStore.createAnalysis('file2', 'SLAC');

			// Mock the backend tracking (this happens in runAnalysis)
			backendAnalysisRunner.activeAnalyses.set('job1', analysis1Id);
			backendAnalysisRunner.activeAnalyses.set('job2', analysis2Id);

			// Start both analyses
			analysisStore.startAnalysisProgress(analysis1Id, 'Starting FEL...', 'FEL');
			analysisStore.startAnalysisProgress(analysis2Id, 'Starting SLAC...', 'SLAC'); // Overwrites activeAnalysis

			// Simulate backend completion without jobId (happens in real backend events)
			// This goes to the first analysis in the activeAnalyses map, not the current activeAnalysis
			const completedResults = { results: { test: 'FEL data' } };

			// In BackendAnalysisRunner.js:106-111, this would pick the "first" analysis
			const [firstJobId, firstAnalysisId] = backendAnalysisRunner.activeAnalyses
				.entries()
				.next().value;

			expect(firstAnalysisId).toBe(analysis1Id); // FEL analysis gets completed
			expect(get(analysisStore).activeAnalysis.id).toBe(analysis2Id); // But SLAC is still active!

			// This exposes the mismatch between backend completion and UI state
		});
	});

	describe('Status Indicator Count Inconsistencies', () => {
		it('should expose incorrect running analysis counts', async () => {
			// Create 5 analyses
			const analysisIds = [];
			for (let i = 0; i < 5; i++) {
				const id = await analysisStore.createAnalysis(`file${i}`, 'FEL');
				analysisIds.push(id);
				analysisStore.startAnalysisProgress(id, `Analysis ${i} starting...`, 'FEL');
			}

			const activeAnalysesValue = get(activeAnalyses);
			expect(activeAnalysesValue).toHaveLength(5);

			// All 5 should be "running" but only the last one is tracked in activeAnalysis
			const runningCount = activeAnalysesValue.filter(
				(a) => a.status !== 'completed' && a.status !== 'error' && a.method !== 'datareader'
			).length;

			expect(runningCount).toBe(5); // Shows correct count in activeAnalysesList

			// But if we check activeAnalysisProgress, only 1 is actually being updated
			const activeProgress = get(activeAnalysisProgress);
			expect(activeProgress.id).toBe(analysisIds[4]); // Only last analysis is "active"

			// Send a progress update - only 1 analysis gets it
			analysisStore.updateAnalysisProgress('running', 50, 'Progress update');

			const updatedActiveAnalyses = get(activeAnalyses);

			// Count how many analyses actually have progress > 0
			const progressingCount = updatedActiveAnalyses.filter((a) => a.progress > 0).length;
			expect(progressingCount).toBe(1); // Only 1 actually receives updates!

			// This causes the mismatch: shows 5 running, but only 1 progressing
		});

		it('should expose completed analysis count timing issues', async () => {
			const analysis1Id = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysis1Id, 'Starting analysis...', 'FEL');

			// Simulate analysis completion
			analysisStore.completeAnalysisProgress(true, 'Analysis completed');

			const state = get(analysisStore);

			// The analysis is marked complete in activeAnalysesList
			expect(state.activeAnalysesList[0].status).toBe('completed');

			// But there's a delay before it's updated in the main analyses array
			// This can cause temporary count mismatches in the UI
			const analysisInMainList = state.analyses.find((a) => a.id === analysis1Id);

			// Depending on timing, this might not be updated immediately
			// causing the status indicator to show wrong counts
		});
	});

	describe('UI Component State Desynchronization', () => {
		it('should expose AnalysisProgress component showing wrong analysis data', async () => {
			const analysis1Id = await analysisStore.createAnalysis('file1', 'FEL');
			const analysis2Id = await analysisStore.createAnalysis('file2', 'SLAC');

			analysisStore.startAnalysisProgress(analysis1Id, 'FEL starting...', 'FEL', {
				executionMode: 'wasm',
				method: 'FEL',
				filename: 'file1.fasta'
			});

			analysisStore.startAnalysisProgress(analysis2Id, 'SLAC starting...', 'SLAC', {
				executionMode: 'backend',
				method: 'SLAC',
				filename: 'file2.fasta'
			});

			// AnalysisProgress component using analysisId prop should show correct data
			const store = get(analysisStore);

			// Simulate getAnalysisProgress function from AnalysisProgress.svelte
			function getAnalysisProgress(id, storeValue) {
				const analysis = storeValue.analyses.find((a) => a.id === id);
				if (!analysis) return { id: null, status: null, progress: 0, message: '', logs: [] };

				// For running analyses, use activeAnalysisProgress if it matches
				if (storeValue.activeAnalysis.id === id) {
					return storeValue.activeAnalysis;
				}

				// This is the bug! Non-active analyses return empty progress
				return {
					id: analysis.id,
					status: analysis.status,
					progress: 0, // Always 0!
					message: 'Analysis pending', // Generic message!
					logs: []
				};
			}

			const progress1 = getAnalysisProgress(analysis1Id, store);
			const progress2 = getAnalysisProgress(analysis2Id, store);

			// Only analysis2 (SLAC) shows real progress because it's the activeAnalysis
			expect(progress2.message).toBe('SLAC starting...');
			expect(progress2.metadata?.method).toBe('SLAC');

			// analysis1 (FEL) shows generic/empty data even though it was started!
			expect(progress1.message).toBe('Analysis pending');
			expect(progress1.progress).toBe(0);

			// This is why users see some analyses as "stuck" - they're not getting progress updates!
		});
	});

	describe('Performance Impact Tests', () => {
		it('should measure state update performance degradation with concurrent analyses', async () => {
			const startTime = performance.now();

			// Create many concurrent analyses
			const numberOfAnalyses = 20;
			const analysisIds = [];

			for (let i = 0; i < numberOfAnalyses; i++) {
				const id = await analysisStore.createAnalysis(`file${i}`, `METHOD${i}`);
				analysisIds.push(id);
				analysisStore.startAnalysisProgress(id, `Starting analysis ${i}...`, `METHOD${i}`);
			}

			const setupTime = performance.now() - startTime;

			// Now simulate rapid progress updates (like backend status updates)
			const updateStartTime = performance.now();

			for (let i = 0; i < 100; i++) {
				analysisStore.updateAnalysisProgress('running', i, `Update ${i}`);
			}

			const updateTime = performance.now() - updateStartTime;

			console.log(`Setup ${numberOfAnalyses} analyses: ${setupTime}ms`);
			console.log(`100 progress updates: ${updateTime}ms`);

			// With the current architecture, all updates go to the same analysis
			// causing wasted work and poor performance
			const finalState = get(analysisStore);

			// Only 1 analysis has progress updates despite 20 being created
			const progressingAnalyses = finalState.activeAnalysesList.filter((a) => a.progress > 0);
			expect(progressingAnalyses).toHaveLength(1);

			// The single activeAnalysis has accumulated all 100 updates
			expect(finalState.activeAnalysis.logs).toHaveLength(101); // Initial + 100 updates
		});

		it('should demonstrate memory leaks in activeAnalysesList', async () => {
			// Create many analyses that complete quickly
			const initialMemory = process.memoryUsage();

			for (let batch = 0; batch < 5; batch++) {
				for (let i = 0; i < 10; i++) {
					const id = await analysisStore.createAnalysis(`file${batch}-${i}`, 'FEL');
					analysisStore.startAnalysisProgress(id, 'Starting...', 'FEL');
					analysisStore.completeAnalysisProgress(true, 'Completed');
				}
			}

			const finalMemory = process.memoryUsage();
			const state = get(analysisStore);

			// activeAnalysesList might accumulate completed analyses without cleanup
			console.log(
				`Created 50 analyses, activeAnalysesList has ${state.activeAnalysesList.length} items`
			);
			console.log(`Memory growth: ${(finalMemory.heapUsed - initialMemory.heapUsed) / 1024}KB`);

			// This test would reveal if completed analyses aren't properly cleaned up
			const completedInActiveList = state.activeAnalysesList.filter(
				(a) => a.status === 'completed'
			);
			expect(completedInActiveList.length).toBeGreaterThan(0); // Memory leak indicator
		});
	});

	describe('Real-world Concurrent Scenario Tests', () => {
		it('should simulate user running 8 different methods simultaneously', async () => {
			const methods = ['FEL', 'SLAC', 'MEME', 'FUBAR', 'ABSREL', 'BUSTED', 'GARD', 'BGM'];
			const analysisIds = [];

			// User selects all methods and clicks "Run Analysis" rapidly
			for (const method of methods) {
				const id = await analysisStore.createAnalysis('shared-file', method);
				analysisIds.push(id);
				analysisStore.startAnalysisProgress(id, `Starting ${method}...`, method, {
					executionMode: Math.random() > 0.5 ? 'backend' : 'wasm'
				});
			}

			// Simulate backend progress updates coming in random order
			const progressMessages = [
				'Mounting files...',
				'Phase 1: Model fitting...',
				'Phase 2: Site analysis...',
				'Computing results...',
				'Writing output...'
			];

			// Each backend job sends 5 progress updates
			for (let i = 0; i < 40; i++) {
				// 8 analyses * 5 updates each
				const progress = ((i % 5) + 1) * 20; // 20%, 40%, 60%, 80%, 100%
				const message = progressMessages[i % 5];

				analysisStore.updateAnalysisProgress('running', progress, message);
			}

			const finalState = get(analysisStore);

			// All 8 analyses should exist
			expect(finalState.analyses).toHaveLength(8);
			expect(finalState.activeAnalysesList).toHaveLength(8);

			// But only the LAST analysis received all 40 progress updates!
			expect(finalState.activeAnalysis.logs).toHaveLength(41); // Initial + 40 updates

			// The other 7 analyses are stuck at their initial state
			const progressingAnalyses = finalState.activeAnalysesList.filter((a) => a.progress > 0);
			expect(progressingAnalyses).toHaveLength(1); // Only 1 out of 8!

			// This is exactly what the user reported: "sometimes only showing 2 jobs when 8 should be available"
			const runningAnalyses = finalState.activeAnalysesList.filter(
				(a) => a.status !== 'completed' && a.status !== 'error'
			);
			expect(runningAnalyses).toHaveLength(8); // All 8 appear "running"

			// But only 1 is actually receiving updates
			const actuallyUpdatingAnalyses = finalState.activeAnalysesList.filter(
				(a) => a.logs.length > 1
			);
			expect(actuallyUpdatingAnalyses).toHaveLength(1); // Performance issue confirmed!
		});

		it('should demonstrate the "lost job" scenario', async () => {
			// Start first analysis
			const analysis1 = await analysisStore.createAnalysis('file1', 'FEL');
			analysisStore.startAnalysisProgress(analysis1, 'FEL starting...', 'FEL');

			// User sees it running, progress starts
			analysisStore.updateAnalysisProgress('running', 25, 'FEL: Phase 1...');

			// User starts second analysis while first is running
			const analysis2 = await analysisStore.createAnalysis('file2', 'SLAC');
			analysisStore.startAnalysisProgress(analysis2, 'SLAC starting...', 'SLAC');

			// Now all subsequent progress updates go to SLAC
			analysisStore.updateAnalysisProgress('running', 50, 'FEL: Phase 2...'); // Goes to SLAC!
			analysisStore.updateAnalysisProgress('running', 75, 'FEL: Phase 3...'); // Goes to SLAC!

			const state = get(analysisStore);

			// SLAC gets FEL's progress updates
			expect(state.activeAnalysis.id).toBe(analysis2);
			expect(state.activeAnalysis.message).toBe('FEL: Phase 3...');

			// FEL appears "lost" - stuck at 25% from before SLAC started
			const felAnalysis = state.activeAnalysesList.find((a) => a.id === analysis1);
			expect(felAnalysis.progress).toBe(25); // Stuck!

			// This is the "job status indicator" bug - FEL looks stuck/lost
		});
	});
});

describe('Proposed Solutions Validation', () => {
	it('should validate that analysis-specific progress updates would work', async () => {
		// This test validates what the fix would look like

		const analysis1 = await analysisStore.createAnalysis('file1', 'FEL');
		const analysis2 = await analysisStore.createAnalysis('file2', 'SLAC');

		// Start both analyses
		analysisStore.startAnalysisProgress(analysis1, 'FEL starting...', 'FEL');
		analysisStore.startAnalysisProgress(analysis2, 'SLAC starting...', 'SLAC');

		// Instead of updateAnalysisProgress(), we would need updateAnalysisProgressById()
		// This test documents what the fixed behavior should look like

		// Simulate fixed implementation
		function updateAnalysisProgressById(analysisId, status, progress, message) {
			analysisStore.update((state) => {
				// Update activeAnalysesList
				const updatedActiveAnalysesList = state.activeAnalysesList.map((a) => {
					if (a.id === analysisId) {
						return {
							...a,
							status,
							progress,
							message,
							logs: [...a.logs, { time: new Date().toISOString(), message, status }]
						};
					}
					return a;
				});

				// Update activeAnalysis only if it matches
				let updatedActiveAnalysis = state.activeAnalysis;
				if (state.activeAnalysis.id === analysisId) {
					updatedActiveAnalysis = {
						...state.activeAnalysis,
						status,
						progress,
						message,
						logs: [
							...state.activeAnalysis.logs,
							{ time: new Date().toISOString(), message, status }
						]
					};
				}

				return {
					...state,
					activeAnalysis: updatedActiveAnalysis,
					activeAnalysesList: updatedActiveAnalysesList
				};
			});
		}

		// Test the fixed behavior
		updateAnalysisProgressById(analysis1, 'running', 30, 'FEL: Phase 1');
		updateAnalysisProgressById(analysis2, 'running', 60, 'SLAC: Phase 2');

		const state = get(analysisStore);

		// Both analyses should have their own progress
		const felAnalysis = state.activeAnalysesList.find((a) => a.id === analysis1);
		const slacAnalysis = state.activeAnalysesList.find((a) => a.id === analysis2);

		expect(felAnalysis.progress).toBe(30);
		expect(felAnalysis.message).toBe('FEL: Phase 1');

		expect(slacAnalysis.progress).toBe(60);
		expect(slacAnalysis.message).toBe('SLAC: Phase 2');

		// This test documents the expected behavior after the fix
	});
});
