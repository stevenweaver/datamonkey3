/**
 * UnifiedAnalysisRunner - Orchestrates both local and backend analysis processing
 * 
 * This service determines the optimal processing location and manages the analysis
 * lifecycle regardless of whether it runs locally (WebAssembly) or on the backend server.
 */

import { processingDecisionEngine } from './ProcessingDecisionEngine.js';
import { AnalysisRunner } from './AnalysisRunner.js';
import { analysisStore } from '../../stores/analyses.js';
import { persistentFileStore } from '../../stores/fileInfo.js';
import { browser } from '$app/environment';

export class UnifiedAnalysisRunner {
	constructor() {
		this.localRunner = new AnalysisRunner();
		this.activeBackendJobs = new Map(); // Track polling intervals for backend jobs
	}

	/**
	 * Main entry point - run analysis with automatic processing location detection
	 */
	async runAnalysis(fileId, method, options = {}) {
		try {
			// Get file metrics for decision making
			const fileMetrics = await this._getFileMetrics(fileId);
			if (!fileMetrics) {
				throw new Error(`File not found: ${fileId}`);
			}

			// Determine processing location
			const processingLocation = await processingDecisionEngine.determineProcessingLocation(
				fileMetrics,
				method,
				{ userPreference: options.processingPreference }
			);

			console.log(`Processing decision: ${processingLocation} for ${method} analysis`, {
				fileSize: fileMetrics.size,
				sequences: fileMetrics.sequences,
				method
			});

			// Create analysis record
			const analysisId = await analysisStore.createAnalysis(fileId, method);
			
			// Route to appropriate processing method
			if (processingLocation === 'backend') {
				return await this._runBackendAnalysis(analysisId, fileId, method, options);
			} else {
				return await this._runLocalAnalysis(analysisId, fileId, method, options);
			}

		} catch (error) {
			console.error('Unified analysis runner error:', error);
			throw error;
		}
	}

	/**
	 * Run analysis on backend datamonkey-js-server
	 */
	async _runBackendAnalysis(analysisId, fileId, method, options) {
		try {
			// Start progress tracking
			analysisStore.startAnalysisProgress(
				analysisId,
				'Submitting job to backend server...',
				method,
				options.fileName || 'Unknown file'
			);

			// Submit job to backend via API
			const jobSubmission = await this._submitBackendJob(analysisId, fileId, method, options);
			
			if (!jobSubmission.success) {
				throw new Error(`Backend job submission failed: ${jobSubmission.error}`);
			}

			// Update analysis with backend job information
			await analysisStore.updateAnalysis(analysisId, {
				status: 'pending',
				processingLocation: 'backend',
				backendJobId: jobSubmission.analysis.backendJobId,
				backendStatus: jobSubmission.analysis.backendStatus
			});

			// Start polling backend for status updates
			this._startBackendPolling(analysisId, jobSubmission.analysis.backendJobId);

			return analysisId;

		} catch (error) {
			console.error('Backend analysis failed:', error);
			
			// Try to fall back to local processing if backend fails
			if (options.allowFallback !== false) {
				console.log('Attempting fallback to local processing...');
				analysisStore.updateAnalysisProgress(
					'initializing',
					0,
					'Backend unavailable, falling back to local processing...'
				);
				
				return await this._runLocalAnalysis(analysisId, fileId, method, options);
			}
			
			// Complete with error if fallback disabled
			await analysisStore.completeAnalysisProgress(false, `Backend analysis failed: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Run analysis locally using WebAssembly
	 */
	async _runLocalAnalysis(analysisId, fileId, method, options) {
		try {
			// Update analysis record
			await analysisStore.updateAnalysis(analysisId, {
				status: 'pending',
				processingLocation: 'local'
			});

			// Use existing local analysis runner
			return await this.localRunner.runAnalysis(fileId, method, options);

		} catch (error) {
			console.error('Local analysis failed:', error);
			await analysisStore.completeAnalysisProgress(false, `Local analysis failed: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Submit job to backend server
	 */
	async _submitBackendJob(analysisId, fileId, method, options) {
		if (!browser) {
			throw new Error('Backend job submission only available in browser environment');
		}

		try {
			const response = await fetch('/api/analyses', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					analysisId,
					fileId,
					method,
					options,
					processingLocation: 'backend'
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Backend job submission failed');
			}

			return await response.json();

		} catch (error) {
			console.error('Backend job submission error:', error);
			throw error;
		}
	}

	/**
	 * Start polling backend server for job status
	 */
	_startBackendPolling(analysisId, backendJobId) {
		// Clear any existing polling for this analysis
		this._stopBackendPolling(analysisId);

		const pollInterval = setInterval(async () => {
			try {
				const response = await fetch(`/api/analyses/${analysisId}`);
				if (!response.ok) {
					throw new Error(`Status check failed: ${response.status}`);
				}

				const data = await response.json();
				const analysis = data.analysis;

				// Update progress tracking
				if (analysis.progress !== undefined) {
					analysisStore.updateAnalysisProgress(
						analysis.status || 'running',
						analysis.progress,
						analysis.message || 'Processing on backend server...'
					);
				}

				// Check if job is complete
				if (['completed', 'error', 'cancelled'].includes(analysis.status)) {
					this._stopBackendPolling(analysisId);
					
					if (analysis.status === 'completed') {
						// Update analysis with results
						await analysisStore.updateAnalysis(analysisId, {
							status: 'completed',
							result: analysis.result,
							completedAt: analysis.completedAt,
							logs: analysis.logs
						});
						
						await analysisStore.completeAnalysisProgress(true, 'Backend analysis completed successfully');
					} else {
						await analysisStore.completeAnalysisProgress(false, analysis.error || 'Backend analysis failed');
					}
				}

			} catch (error) {
				console.error('Backend polling error:', error);
				
				// After several failures, consider the job failed
				const failures = (this.activeBackendJobs.get(analysisId)?.failures || 0) + 1;
				if (failures >= 5) {
					this._stopBackendPolling(analysisId);
					await analysisStore.completeAnalysisProgress(false, 'Lost connection to backend server');
				} else {
					// Track failure count
					const jobInfo = this.activeBackendJobs.get(analysisId) || {};
					jobInfo.failures = failures;
					this.activeBackendJobs.set(analysisId, jobInfo);
				}
			}
		}, 5000); // Poll every 5 seconds

		// Store interval reference
		this.activeBackendJobs.set(analysisId, { interval: pollInterval, failures: 0 });
	}

	/**
	 * Stop polling for backend job status
	 */
	_stopBackendPolling(analysisId) {
		const jobInfo = this.activeBackendJobs.get(analysisId);
		if (jobInfo?.interval) {
			clearInterval(jobInfo.interval);
			this.activeBackendJobs.delete(analysisId);
		}
	}

	/**
	 * Cancel an analysis (local or backend)
	 */
	async cancelAnalysis(analysisId) {
		try {
			// Stop any backend polling
			this._stopBackendPolling(analysisId);

			// If it's a backend job, cancel on server
			const analysis = await analysisStore.getAnalysis(analysisId);
			if (analysis?.processingLocation === 'backend') {
				await fetch(`/api/analyses/${analysisId}`, {
					method: 'DELETE'
				});
			}

			// Cancel in local store
			await analysisStore.cancelAnalysis(analysisId);

		} catch (error) {
			console.error('Cancel analysis error:', error);
			throw error;
		}
	}

	/**
	 * Get file metrics for processing decisions
	 */
	async _getFileMetrics(fileId) {
		try {
			// Get file from persistent file store
			let fileData = null;
			persistentFileStore.subscribe((store) => {
				fileData = store;
			})();

			const file = fileData?.files?.find(f => f.id === fileId);
			if (!file) {
				return null;
			}

			// Calculate metrics
			const content = file.content || '';
			const sequences = (content.match(/^>/gm) || []).length;
			const totalLength = content.replace(/^>.*$/gm, '').replace(/\s/g, '').length;
			const avgSequenceLength = sequences > 0 ? totalLength / sequences : 0;

			return {
				size: new Blob([content]).size,
				sequences,
				totalLength,
				avgSequenceLength,
				filename: file.filename
			};

		} catch (error) {
			console.error('Error getting file metrics:', error);
			return null;
		}
	}

	/**
	 * Get current backend job status
	 */
	getActiveBackendJobs() {
		return Array.from(this.activeBackendJobs.keys());
	}

	/**
	 * Cleanup - stop all polling when service is destroyed
	 */
	destroy() {
		for (const [analysisId] of this.activeBackendJobs) {
			this._stopBackendPolling(analysisId);
		}
	}
}

// Export singleton instance
export const unifiedAnalysisRunner = new UnifiedAnalysisRunner();