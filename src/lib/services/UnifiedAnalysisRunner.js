/**
 * UnifiedAnalysisRunner - Orchestrates both local and backend analysis processing
 * 
 * This service determines the optimal processing location and manages the analysis
 * lifecycle regardless of whether it runs locally (WebAssembly) or on the backend server.
 */

import { processingDecisionEngine } from './ProcessingDecisionEngine';
import { analysisRunner } from './AnalysisRunner';
import { backendSocketService } from './BackendSocketService';
import { analysisStore } from '../../stores/analyses';
import { persistentFileStore } from '../../stores/fileInfo';
import { browser } from '$app/environment';

export class UnifiedAnalysisRunner {
	constructor() {
		this.localRunner = analysisRunner; // Use existing singleton
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
				'Connecting to backend server...',
				method,
				options.fileName || 'Unknown file'
			);

			// Get file content for submission
			const fileMetrics = await this._getFileMetrics(fileId);
			if (!fileMetrics) {
				throw new Error(`File not found: ${fileId}`);
			}

			// Get file content from store
			let fileContent = '';
			persistentFileStore.subscribe((store) => {
				const file = store.files?.find(f => f.id === fileId);
				if (file) {
					fileContent = file.content || '';
				}
			})();

			if (!fileContent) {
				throw new Error('File content not available');
			}

			// Update analysis record
			await analysisStore.updateAnalysis(analysisId, {
				status: 'pending',
				processingLocation: 'backend',
				backendJobId: analysisId
			});

			// Setup progress callback
			backendSocketService.addProgressCallback(analysisId, (progressData) => {
				analysisStore.updateAnalysisProgress(
					progressData.status || 'running',
					progressData.progress || 0,
					progressData.message || 'Processing on backend server...'
				);
			});

			// Submit job to backend via Socket.IO
			analysisStore.updateAnalysisProgress('pending', 5, 'Submitting job to backend server...');
			
			const jobResult = await this._submitSocketJob(analysisId, fileContent, method, options);

			// Handle successful completion
			await analysisStore.updateAnalysis(analysisId, {
				status: 'completed',
				result: jobResult.result,
				completedAt: new Date().getTime()
			});

			await analysisStore.completeAnalysisProgress(true, 'Backend analysis completed successfully');

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

			// For local analysis, we'll trigger the existing workflow
			// The analysis ID is already created, so the existing system will pick it up
			console.log(`Local analysis ${analysisId} will be handled by existing system`);
			
			return analysisId;

		} catch (error) {
			console.error('Local analysis failed:', error);
			await analysisStore.completeAnalysisProgress(false, `Local analysis failed: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Submit job to backend server via Socket.IO
	 */
	async _submitSocketJob(analysisId, fileContent, method, options) {
		if (!browser) {
			throw new Error('Backend job submission only available in browser environment');
		}

		try {
			// Currently only FEL is supported
			if (method.toLowerCase() !== 'fel') {
				throw new Error(`Method ${method} not yet supported for backend processing`);
			}

			// Submit FEL analysis job
			const result = await backendSocketService.submitFelAnalysis(analysisId, fileContent, {
				geneticCode: options.geneticCode || 'Universal',
				additionalParams: options.additionalParams || {}
			});

			return result;

		} catch (error) {
			console.error('Socket job submission error:', error);
			throw error;
		}
	}

	async cancelAnalysis(analysisId) {
		try {
			// If it's a backend job, cancel on server via Socket.IO
			const analysis = await analysisStore.getAnalysis(analysisId);
			if (analysis?.processingLocation === 'backend') {
				await backendSocketService.cancelJob(analysisId);
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
		return backendSocketService.getConnectionState().activeJobs;
	}

	/**
	 * Cleanup - disconnect from backend when service is destroyed
	 */
	destroy() {
		backendSocketService.disconnect();
	}
}

// Export singleton instance
export const unifiedAnalysisRunner = new UnifiedAnalysisRunner();