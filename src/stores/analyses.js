import { derived, writable } from "svelte/store";
import { analysisStorage } from "../lib/utils/indexedDBStorage";
import { browser } from "$app/environment";

function createAnalysisStore() {
	const { subscribe, set, update } = writable({
		analyses: [],
		currentAnalysisId: null,
		isLoading: false,
		error: null,
		// Single unified tracking for active analyses
		activeAnalyses: [], // Array of active analysis objects with progress tracking
	});

	return {
		subscribe,
		update,

		// Load all analyses from IndexedDB
		async loadAnalyses() {
			if (!browser) return; // Only run in browser

			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				const analyses = await analysisStorage.getAllAnalyses();
				update((state) => ({ ...state, analyses, isLoading: false }));
			} catch (error) {
				console.error("Error loading analyses:", error);
				update((state) => ({
					...state,
					error: error.message,
					isLoading: false,
				}));
			}
		},

		// Create a new analysis
		async createAnalysis(fileId, method) {
			if (!browser) return; // Only run in browser

			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				const analysisId = crypto.randomUUID();
				const analysis = {
					id: analysisId,
					fileId,
					method,
					status: "pending",
					createdAt: new Date().getTime(),
				};

				await analysisStorage.saveAnalysis(analysis);

				// Update analysis list and set current analysis
				update((state) => ({
					...state,
					analyses: [...state.analyses, analysis],
					currentAnalysisId: analysisId,
					isLoading: false,
				}));

				// Return the analysis ID for reference
				return analysisId;
			} catch (error) {
				console.error("Error creating analysis:", error);
				update((state) => ({
					...state,
					error: error.message,
					isLoading: false,
				}));
				throw error;
			}
		},

		// Get an analysis by ID
		async getAnalysis(analysisId) {
			if (!browser) return; // Only run in browser

			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				const analysis = await analysisStorage.getAnalysis(analysisId);

				// Update the analysis in the list
				update((state) => {
					const analyses = state.analyses.map((a) =>
						a.id === analysisId ? analysis : a
					);

					return { ...state, analyses, isLoading: false };
				});

				return analysis;
			} catch (error) {
				console.error("Error fetching analysis:", error);
				update((state) => ({
					...state,
					error: error.message,
					isLoading: false,
				}));
				throw error;
			}
		},

		// Update an analysis
		async updateAnalysis(analysisId, data) {
			if (!browser) return; // Only run in browser

			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				// Get the current analysis
				const currentAnalysis = await analysisStorage.getAnalysis(analysisId);

				// Merge the updates
				const updatedAnalysis = {
					...currentAnalysis,
					...data,
					updatedAt: new Date().getTime(),
				};

				// Save the updated analysis
				await analysisStorage.saveAnalysis(updatedAnalysis);

				// Update the analysis in the list
				update((state) => {
					const analyses = state.analyses.map((a) =>
						a.id === analysisId ? updatedAnalysis : a
					);

					return { ...state, analyses, isLoading: false };
				});

				return updatedAnalysis;
			} catch (error) {
				console.error("Error updating analysis:", error);
				update((state) => ({
					...state,
					error: error.message,
					isLoading: false,
				}));
				throw error;
			}
		},

		// Delete an analysis
		async deleteAnalysis(analysisId) {
			if (!browser) return; // Only run in browser

			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				await analysisStorage.deleteAnalysis(analysisId);

				// Remove the analysis from the list
				update((state) => ({
					...state,
					analyses: state.analyses.filter((a) => a.id !== analysisId),
					currentAnalysisId: state.currentAnalysisId === analysisId
						? null
						: state.currentAnalysisId,
					isLoading: false,
				}));
			} catch (error) {
				console.error("Error deleting analysis:", error);
				update((state) => ({
					...state,
					error: error.message,
					isLoading: false,
				}));
				throw error;
			}
		},

		// Cancel a pending analysis
		async cancelAnalysis(analysisId) {
			if (!browser) return; // Only run in browser

			try {
				// Update the analysis status to cancelled
				await this.updateAnalysis(analysisId, {
					status: "cancelled",
					completedAt: new Date().getTime(),
				});

				// Remove from active analyses list
				update((state) => ({
					...state,
					activeAnalyses: (state.activeAnalyses || []).filter(
						(a) => a.id !== analysisId,
					),
				}));
			} catch (error) {
				console.error("Error cancelling analysis:", error);
				throw error;
			}
		},

		// Load analyses for a specific file
		async loadAnalysesForFile(fileId) {
			if (!browser) return; // Only run in browser

			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				const fileAnalyses = await analysisStorage.getAnalysesByFileId(fileId);

				// Merge with existing analyses
				update((state) => {
					// Remove existing analyses for this file
					const otherAnalyses = state.analyses.filter(
						(a) => a.fileId !== fileId,
					);

					return {
						...state,
						analyses: [...otherAnalyses, ...fileAnalyses],
						isLoading: false,
					};
				});

				return fileAnalyses;
			} catch (error) {
				console.error("Error loading analyses for file:", error);
				update((state) => ({
					...state,
					error: error.message,
					isLoading: false,
				}));
				throw error;
			}
		},

		// Set the current analysis
		setCurrentAnalysis(analysisId) {
			update((state) => {
				return { ...state, currentAnalysisId: analysisId };
			});
		},

		// Clear any errors
		clearError() {
			update((state) => ({ ...state, error: null }));
		},

		// Start tracking analysis progress
		startAnalysisProgress(
			analysisId,
			message = "Initializing analysis...",
			methodName = "",
			metadata = {},
		) {
			// Find the analysis in the store to get method and file information if not provided
			let method = methodName;
			let file = metadata.fileName || "";

			update((state) => {
				// Look up analysis details if not provided
				if (!method || !file) {
					const existingAnalysis = state.analyses.find(
						(a) => a.id === analysisId,
					);
					if (existingAnalysis) {
						method = method || existingAnalysis.method;
						file = file || existingAnalysis.fileName;
					}
				}

				// Create progress tracking object
				const progressObj = {
					id: analysisId,
					status: "initializing",
					progress: 0,
					message,
					method,
					fileName: file,
					startTime: new Date().toISOString(),
					logs: [
						{ time: new Date().toISOString(), message, status: "initializing" },
					],
					metadata: {
						method,
						filename: file,
						startTime: new Date().toISOString(),
						...metadata,
					},
				};

				// Add to unified active analyses list
				// First remove any existing analysis with the same ID
				const activeAnalyses = (state.activeAnalyses || []).filter(
					(a) => a.id !== analysisId,
				);
				activeAnalyses.push(progressObj);

				return {
					...state,
					activeAnalyses,
				};
			});
		},

		// Update analysis progress (legacy method - uses first active analysis)
		updateAnalysisProgress(status, progress, message) {
			update((state) => {
				if (!state.activeAnalyses || state.activeAnalyses.length === 0) return state;
				
				// Update the first active analysis for backward compatibility
				const firstActive = state.activeAnalyses[0];
				return this._updateAnalysisProgressByIdInternal(
					firstActive.id,
					status,
					progress,
					message,
					state
				);
			});
		},

		// Update analysis progress by specific ID
		updateAnalysisProgressById(analysisId, status, progress, message) {
			update((state) => {
				return this._updateAnalysisProgressByIdInternal(
					analysisId,
					status,
					progress,
					message,
					state,
				);
			});
		},

		// Internal helper for updating analysis progress by ID
		_updateAnalysisProgressByIdInternal(
			analysisId,
			status,
			progress,
			message,
			state,
		) {
			if (!analysisId) return state;

			// Create log entry
			const logEntry = { time: new Date().toISOString(), message, status };

			// Update the analysis in activeAnalyses
			const activeAnalyses = (state.activeAnalyses || []).map((a) => {
				if (a.id !== analysisId) return a;

				const logs = [...(a.logs || [])];
				const lastLog = logs[logs.length - 1];

				// Only add if different from last log
				if (
					!lastLog ||
					lastLog.message !== message ||
					lastLog.status !== status
				) {
					logs.push(logEntry);
				}

				return {
					...a,
					status,
					progress: Math.min(Math.max(0, progress), 100),
					message,
					logs,
				};
			});

			return {
				...state,
				activeAnalyses,
			};
		},

		// Complete analysis progress (legacy method - uses first active analysis)
		async completeAnalysisProgress(
			success = true,
			message = success ? "Analysis completed." : "Analysis failed.",
		) {
			const status = success ? "completed" : "error";

			// Get the current state to access the first active analysis ID
			let currentState;
			subscribe((state) => {
				currentState = state;
			})();

			if (!currentState?.activeAnalyses || currentState.activeAnalyses.length === 0) {
				return; // No active analyses
			}

			const analysisId = currentState.activeAnalyses[0].id;

			update((state) => {
				const activeAnalyses = (state.activeAnalyses || []).map((a) => {
					if (a.id !== analysisId) return a;

					const logs = [...(a.logs || [])];
					logs.push({ time: new Date().toISOString(), message, status });

					return {
						...a,
						status,
						progress: success ? 100 : a.progress,
						message,
						logs,
						completedAt: success ? new Date().toISOString() : undefined,
					};
				});

				return {
					...state,
					activeAnalyses,
				};
			});

			// If we have an active analysis ID, update its status in both client and server
			if (analysisId) {
				// Get current logs, result, and metadata from the active analysis
				const activeAnalysis = (currentState.activeAnalyses || []).find(a => a.id === analysisId);
				const currentLogs = activeAnalysis?.logs || [];
				const currentResult = activeAnalysis?.result || null;
				const currentMetadata = activeAnalysis?.metadata || {};

				// Update IndexedDB
				try {
					const analysis = await analysisStorage.getAnalysis(analysisId);
					if (analysis) {
						// Use the saved result if no current result is available
						const finalResult = currentResult || analysis.result;

						await analysisStorage.saveAnalysis({
							...analysis,
							status,
							logs: currentLogs, // Include logs from active analysis
							result: finalResult, // Ensure result is saved with raw stdout
							metadata: currentMetadata, // Include metadata from active analysis
							completedAt: success ? new Date().getTime() : undefined,
						});

						// Also update the analyses array in the store
						update((state) => ({
							...state,
							analyses: state.analyses.map((a) =>
								a.id === analysisId
									? {
										...a,
										status,
										logs: currentLogs, // Include logs here too
										result: finalResult, // Include result with raw stdout here too
										metadata: currentMetadata, // Include metadata here too
										completedAt: success ? new Date().getTime() : undefined,
									}
									: a
							),
						}));
					}
				} catch (error) {
					console.error("Error updating analysis in IndexedDB:", error);
				}

				// Update server via API (only in browser environment with proper URL)
				try {
					if (browser && typeof window !== 'undefined' && window.location && !import.meta.env?.VITEST) {
						fetch(`/api/analyses/${analysisId}`, {
							method: "PATCH",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								status,
								logs: currentLogs, // Include logs in the server update
								result: currentResult, // Include result with raw stdout in the server update
								metadata: currentMetadata, // Include metadata in the server update
								completedAt: success ? new Date().getTime() : undefined,
							}),
						})
							.then((response) => response.json())
							.then((data) => {
								console.log("Server analysis status updated:", data);
							})
							.catch((error) => {
								console.error(
									"Error updating analysis status on server:",
									error,
								);
							});
					}
				} catch (error) {
					console.error("Error updating analysis on server:", error);
				}
			}
		},

		// Remove analysis from active list (for when user dismisses a completed analysis)
		removeFromActiveAnalyses(analysisId) {
			update((state) => ({
				...state,
				activeAnalyses: (state.activeAnalyses || []).filter(
					(a) => a.id !== analysisId,
				),
			}));
		},

		// Clear all analyses
		async clearAllAnalyses() {
			if (!browser) return;

			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				// Clear all analyses from IndexedDB
				await analysisStorage.clearAllAnalyses();

				// Reset the store state
				update((state) => ({
					...state,
					analyses: [],
					currentAnalysisId: null,
					activeAnalyses: [],
					isLoading: false,
				}));
			} catch (error) {
				console.error("Error clearing all analyses:", error);
				update((state) => ({
					...state,
					error: error.message,
					isLoading: false,
				}));
				throw error;
			}
		},
	};
}

export const analysisStore = createAnalysisStore();

// Derived store for the current analysis
export const currentAnalysis = derived(analysisStore, ($analysisStore) => {
	if (!$analysisStore.currentAnalysisId) return null;
	return $analysisStore.analyses.find(
		(a) => a.id === $analysisStore.currentAnalysisId,
	);
});

// Derived store to get analyses for a specific file
export function getAnalysesForFile(fileId) {
	return derived(
		analysisStore,
		($analysisStore) =>
			$analysisStore.analyses.filter((a) => a.fileId === fileId),
	);
}

// Derived store for the active analysis progress (for backward compatibility)
export const activeAnalysisProgress = derived(
	analysisStore,
	($analysisStore) => {
		// Return the first active analysis for backward compatibility
		if ($analysisStore.activeAnalyses.length > 0) {
			return $analysisStore.activeAnalyses[0];
		}
		// Return empty state for backward compatibility
		return {
			id: null,
			status: null,
			progress: 0,
			message: "",
			logs: [],
		};
	},
);

// Derived store for the list of active analyses
export const activeAnalyses = derived(
	analysisStore,
	($analysisStore) => $analysisStore.activeAnalyses,
);
