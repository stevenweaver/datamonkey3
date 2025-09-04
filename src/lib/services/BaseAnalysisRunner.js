/**
 * Base Analysis Runner - Abstract class for all analysis execution strategies
 * Consolidates common functionality between WASM and backend runners
 */

import { analysisStore } from '../../stores/analyses.js';
import { get } from 'svelte/store';

export class BaseAnalysisRunner {
	constructor() {
		this.isRunning = false;
		this.activeAnalyses = new Map(); // Track running analyses: jobId -> analysisId
	}

	/**
	 * Abstract method - must be implemented by subclasses
	 * @param {string} method - Analysis method (FEL, SLAC, etc.)
	 * @param {Object} config - Analysis configuration
	 * @param {string} fastaData - FASTA sequence data
	 * @param {string} treeData - Phylogenetic tree data
	 * @param {string} fileId - Associated file ID
	 * @returns {Promise<Object>} Result object with analysisId and jobId
	 */
	async runAnalysis(method, config, fastaData, treeData, fileId = null) {
		throw new Error('runAnalysis must be implemented by subclass');
	}

	/**
	 * Create a new analysis in the store
	 */
	async createAnalysis(fileId, method) {
		return await analysisStore.createAnalysis(fileId, method);
	}

	/**
	 * Start analysis progress tracking with common metadata
	 */
	startAnalysisTracking(analysisId, method, executionMode, message = null, args = null) {
		const defaultMessage = message || `Starting ${method} analysis...`;

		const metadata = {
			executionMode,
			startTime: new Date().toISOString()
		};

		// Add arguments to metadata if provided
		if (args) {
			metadata.arguments = args;
		}

		analysisStore.startAnalysisProgress(analysisId, defaultMessage, method, metadata);
	}

	/**
	 * Update analysis progress by ID
	 */
	updateProgress(analysisId, status, progress, message) {
		if (analysisId) {
			analysisStore.updateAnalysisProgressById(analysisId, status, progress, message);
		} else {
			// Fallback to legacy method for backward compatibility
			analysisStore.updateAnalysisProgress(status, progress, message);
		}
	}

	/**
	 * Complete analysis with success or failure
	 */
	async completeAnalysis(analysisId, success = true, result = null, message = null) {
		const defaultMessage = success ? 'Analysis completed successfully' : 'Analysis failed';

		// Get the arguments metadata from the active analysis progress
		const currentState = get(analysisStore);
		const activeAnalysis = currentState?.activeAnalyses?.find((a) => a.id === analysisId);
		const argumentsMetadata = activeAnalysis?.metadata?.arguments || null;

		if (success && result) {
			// Ensure result is stored consistently as JSON string
			const resultString = typeof result === 'string' ? result : JSON.stringify(result);

			const updateData = {
				status: 'completed',
				result: resultString,
				completedAt: new Date().getTime()
			};

			// Add arguments metadata if available
			if (argumentsMetadata) {
				updateData.arguments = argumentsMetadata;
			}

			await analysisStore.updateAnalysis(analysisId, updateData);
		} else if (!success) {
			const updateData = {
				status: 'error',
				error: message || 'Unknown error occurred',
				completedAt: new Date().getTime()
			};

			// Add arguments metadata even for failed analyses (for debugging)
			if (argumentsMetadata) {
				updateData.arguments = argumentsMetadata;
			}

			await analysisStore.updateAnalysis(analysisId, updateData);
		}

		analysisStore.completeAnalysisProgress(success, message || defaultMessage);
	}

	/**
	 * Cancel a running analysis
	 */
	async cancelAnalysis(analysisId) {
		// Remove from active analyses
		for (const [jobId, aId] of this.activeAnalyses.entries()) {
			if (aId === analysisId) {
				this.activeAnalyses.delete(jobId);
				break;
			}
		}

		// Update store
		await analysisStore.cancelAnalysis(analysisId);
	}

	/**
	 * Clean up resources
	 */
	destroy() {
		this.activeAnalyses.clear();
	}

	/**
	 * Validate common input parameters
	 */
	validateInput(fastaData, treeData, method) {
		if (!fastaData || !fastaData.trim()) {
			throw new Error('FASTA data is empty or invalid');
		}

		if (!treeData || !treeData.trim()) {
			throw new Error('Tree data is empty or invalid');
		}

		if (!method || !method.trim()) {
			throw new Error('Analysis method is required');
		}
	}

	/**
	 * Generate a unique job ID
	 */
	generateJobId(method) {
		return `${method}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}
