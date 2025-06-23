import { writable, derived } from 'svelte/store';
import { analysisStorage } from '../lib/utils/indexedDBStorage';
import { browser } from '$app/environment';

function createAnalysisStore() {
	const { subscribe, set, update } = writable({
		analyses: [],
		currentAnalysisId: null,
		isLoading: false,
		error: null,
		// Track a single active analysis for backward compatibility
		activeAnalysis: {
			id: null,
			status: null, // 'initializing', 'mounting', 'running', 'processing', 'saving', 'completed', 'error'
			progress: 0,
			message: '',
			logs: []
		},
		// Track multiple active analyses for the monitor
		activeAnalysesList: []
	});

	return {
		subscribe,
		update,
		
		// Load all analyses from IndexedDB
		async loadAnalyses() {
			if (!browser) return; // Only run in browser
			
			update(state => ({ ...state, isLoading: true, error: null }));
			
			try {
				const analyses = await analysisStorage.getAllAnalyses();
				update(state => ({ ...state, analyses, isLoading: false }));
			} catch (error) {
				console.error('Error loading analyses:', error);
				update(state => ({ ...state, error: error.message, isLoading: false }));
			}
		},
		
		// Create a new analysis
		async createAnalysis(fileId, method) {
			if (!browser) return; // Only run in browser
			
			update(state => ({ ...state, isLoading: true, error: null }));
			
			try {
				const analysisId = crypto.randomUUID();
				const analysis = {
					id: analysisId,
					fileId,
					method,
					status: 'pending',
					createdAt: new Date().getTime()
				};
				
				await analysisStorage.saveAnalysis(analysis);
				
				// Update analysis list and set current analysis
				update(state => ({
					...state,
					analyses: [...state.analyses, analysis],
					currentAnalysisId: analysisId,
					isLoading: false
				}));
				
				// Return the analysis ID for reference
				return analysisId;
			} catch (error) {
				console.error('Error creating analysis:', error);
				update(state => ({ ...state, error: error.message, isLoading: false }));
				throw error;
			}
		},
		
		// Get an analysis by ID
		async getAnalysis(analysisId) {
			if (!browser) return; // Only run in browser
			
			update(state => ({ ...state, isLoading: true, error: null }));
			
			try {
				const analysis = await analysisStorage.getAnalysis(analysisId);
				
				// Update the analysis in the list
				update(state => {
					const analyses = state.analyses.map(a => 
						a.id === analysisId ? analysis : a
					);
					
					return { ...state, analyses, isLoading: false };
				});
				
				return analysis;
			} catch (error) {
				console.error('Error fetching analysis:', error);
				update(state => ({ ...state, error: error.message, isLoading: false }));
				throw error;
			}
		},
		
		// Update an analysis
		async updateAnalysis(analysisId, data) {
			if (!browser) return; // Only run in browser
			
			update(state => ({ ...state, isLoading: true, error: null }));
			
			try {
				// Get the current analysis
				const currentAnalysis = await analysisStorage.getAnalysis(analysisId);
				
				// Merge the updates
				const updatedAnalysis = {
					...currentAnalysis,
					...data,
					updatedAt: new Date().getTime()
				};
				
				// Save the updated analysis
				await analysisStorage.saveAnalysis(updatedAnalysis);
				
				// Update the analysis in the list
				update(state => {
					const analyses = state.analyses.map(a => 
						a.id === analysisId ? updatedAnalysis : a
					);
					
					return { ...state, analyses, isLoading: false };
				});
				
				return updatedAnalysis;
			} catch (error) {
				console.error('Error updating analysis:', error);
				update(state => ({ ...state, error: error.message, isLoading: false }));
				throw error;
			}
		},
		
		// Delete an analysis
		async deleteAnalysis(analysisId) {
			if (!browser) return; // Only run in browser
			
			update(state => ({ ...state, isLoading: true, error: null }));
			
			try {
				await analysisStorage.deleteAnalysis(analysisId);
				
				// Remove the analysis from the list
				update(state => ({
					...state,
					analyses: state.analyses.filter(a => a.id !== analysisId),
					currentAnalysisId: state.currentAnalysisId === analysisId ? null : state.currentAnalysisId,
					isLoading: false
				}));
			} catch (error) {
				console.error('Error deleting analysis:', error);
				update(state => ({ ...state, error: error.message, isLoading: false }));
				throw error;
			}
		},
		
		// Load analyses for a specific file
		async loadAnalysesForFile(fileId) {
			if (!browser) return; // Only run in browser
			
			update(state => ({ ...state, isLoading: true, error: null }));
			
			try {
				const fileAnalyses = await analysisStorage.getAnalysesByFileId(fileId);
				
				// Merge with existing analyses
				update(state => {
					// Remove existing analyses for this file
					const otherAnalyses = state.analyses.filter(a => a.fileId !== fileId);
					
					return {
						...state,
						analyses: [...otherAnalyses, ...fileAnalyses],
						isLoading: false
					};
				});
				
				return fileAnalyses;
			} catch (error) {
				console.error('Error loading analyses for file:', error);
				update(state => ({ ...state, error: error.message, isLoading: false }));
				throw error;
			}
		},
		
		// Set the current analysis
		setCurrentAnalysis(analysisId) {
			update(state => ({ ...state, currentAnalysisId: analysisId }));
		},
		
		// Clear any errors
		clearError() {
			update(state => ({ ...state, error: null }));
		},
		
		// Start tracking analysis progress
		startAnalysisProgress(analysisId, message = 'Initializing analysis...', methodName = '', fileName = '') {
			// Find the analysis in the store to get method and file information if not provided
			let method = methodName;
			let file = fileName;
			
			update(state => {
				// Look up analysis details if not provided
				if (!method || !file) {
					const existingAnalysis = state.analyses.find(a => a.id === analysisId);
					if (existingAnalysis) {
						method = method || existingAnalysis.method;
						file = file || existingAnalysis.fileName;
					}
				}
				
				// Create progress tracking object
				const progressObj = {
					id: analysisId,
					status: 'initializing',
					progress: 0,
					message,
					method,
					fileName: file,
					startTime: new Date().toISOString(),
					logs: [{ time: new Date().toISOString(), message, status: 'initializing' }]
				};
				
				// Update the single active analysis (for backward compatibility)
				const activeAnalysis = {
					...progressObj
				};
				
				// Add to the list of active analyses
				// First remove any existing analysis with the same ID
				const filteredList = state.activeAnalysesList.filter(a => a.id !== analysisId);
				const activeAnalysesList = [...filteredList, progressObj];
				
				return {
					...state,
					activeAnalysis,
					activeAnalysesList
				};
			});
		},
		
		// Update analysis progress
		updateAnalysisProgress(status, progress, message) {
			update(state => {
				// Get current active analysis (for backwards compatibility)
				const analysisId = state.activeAnalysis.id;
				if (!analysisId) return state; // No active analysis
				
				// Add the message to logs only if it's different from the last one
				const logs = [...state.activeAnalysis.logs];
				const lastLog = logs[logs.length - 1];
				
				if (!lastLog || lastLog.message !== message || lastLog.status !== status) {
					logs.push({ time: new Date().toISOString(), message, status });
				}
				
				// Update the activeAnalysis (backwards compatibility)
				const activeAnalysis = {
					...state.activeAnalysis,
					status,
					progress: Math.min(Math.max(0, progress), 100), // Ensure progress is between 0-100
					message,
					logs
				};
				
				// Update the analysis in the list of active analyses
				const activeAnalysesList = state.activeAnalysesList.map(a => {
					if (a.id !== analysisId) return a;
					
					return {
						...a,
						status,
						progress: Math.min(Math.max(0, progress), 100),
						message,
						logs: [...logs] // Use the same logs object
					};
				});
				
				return {
					...state,
					activeAnalysis,
					activeAnalysesList
				};
			});
		},
		
		// Complete analysis progress
		async completeAnalysisProgress(success = true, message = success ? 'Analysis completed.' : 'Analysis failed.') {
			const status = success ? 'completed' : 'error';
			
			// Get the current state to access the active analysis ID
			let currentState;
			subscribe(state => {
				currentState = state;
			})();
			
			const analysisId = currentState?.activeAnalysis?.id;
			if (!analysisId) return; // No active analysis
			
			update(state => {
				const logs = [...state.activeAnalysis.logs];
				logs.push({ time: new Date().toISOString(), message, status });
				
				// Update the activeAnalysis (backwards compatibility)
				const activeAnalysis = {
					...state.activeAnalysis,
					status,
					progress: success ? 100 : state.activeAnalysis.progress,
					message,
					logs,
					completedAt: success ? new Date().toISOString() : undefined
				};
				
				// Update the analysis in the list of active analyses
				const activeAnalysesList = state.activeAnalysesList.map(a => {
					if (a.id !== analysisId) return a;
					
					return {
						...a,
						status,
						progress: success ? 100 : a.progress,
						message,
						logs: [...logs], // Use the same logs object
						completedAt: success ? new Date().toISOString() : undefined
					};
				});
				
				return {
					...state,
					activeAnalysis,
					activeAnalysesList
				};
			});
			
			// If we have an active analysis ID, update its status in both client and server
			if (analysisId) {					
				// Update IndexedDB
				try {
					const analysis = await analysisStorage.getAnalysis(analysisId);
					if (analysis) {
						await analysisStorage.saveAnalysis({
							...analysis,
							status,
							completedAt: success ? new Date().getTime() : undefined
						});
						
						// Also update the analyses array in the store
						update(state => ({
							...state,
							analyses: state.analyses.map(a => 
								a.id === analysisId 
									? { ...a, status, completedAt: success ? new Date().getTime() : undefined }
									: a
							)
						}));
					}
				} catch (error) {
					console.error('Error updating analysis in IndexedDB:', error);
				}
				
				// Update server via API
				try {
					if (browser) {
						fetch(`/api/analyses/${analysisId}`, {
							method: 'PATCH',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								status,
								completedAt: success ? new Date().getTime() : undefined
							})
						})
						.then(response => response.json())
						.then(data => {
							console.log('Server analysis status updated:', data);
						})
						.catch(error => {
							console.error('Error updating analysis status on server:', error);
						});
					}
				} catch (error) {
					console.error('Error updating analysis on server:', error);
				}
			}
		},
		
		// Remove analysis from active list (for when user dismisses a completed analysis)
		removeFromActiveAnalyses(analysisId) {
			update(state => ({
				...state,
				activeAnalysesList: state.activeAnalysesList.filter(a => a.id !== analysisId)
			}));
		}
	};
}

export const analysisStore = createAnalysisStore();

// Derived store for the current analysis
export const currentAnalysis = derived(
	analysisStore,
	$analysisStore => {
		if (!$analysisStore.currentAnalysisId) return null;
		return $analysisStore.analyses.find(a => a.id === $analysisStore.currentAnalysisId);
	}
);

// Derived store to get analyses for a specific file
export function getAnalysesForFile(fileId) {
	return derived(
		analysisStore,
		$analysisStore => $analysisStore.analyses.filter(a => a.fileId === fileId)
	);
}

// Derived store for the active analysis progress (for backward compatibility)
export const activeAnalysisProgress = derived(
	analysisStore,
	$analysisStore => $analysisStore.activeAnalysis
);

// Derived store for the list of active analyses
export const activeAnalyses = derived(
	analysisStore,
	$analysisStore => $analysisStore.activeAnalysesList
);