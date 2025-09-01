/**
 * BackendAnalysisRunner - Handles server-side analysis execution via Socket.IO
 * Integrates with the existing DataMonkey backend server used in demo pages
 */

import io from 'socket.io-client';
import { DATAMONKEY_SERVER_URL } from '../config/env.ts';
import { analysisStore } from '../../stores/analyses.js';

class BackendAnalysisRunner {
	constructor() {
		this.socket = null;
		this.serverUrl = DATAMONKEY_SERVER_URL;
		this.activeAnalyses = new Map(); // Track running analyses
	}

	/**
	 * Initialize connection to backend server
	 */
	async connect(serverUrl = this.serverUrl) {
		if (this.socket && this.socket.connected) {
			return this.socket;
		}

		this.serverUrl = serverUrl;
		this.socket = io(serverUrl, {
			timeout: 10000,
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: 5
		});

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Backend connection timeout'));
			}, 10000);

			this.socket.on('connect', () => {
				clearTimeout(timeout);
				console.log('✅ BackendAnalysisRunner: Connected to server');
				this.setupGlobalHandlers();
				resolve(this.socket);
			});

			this.socket.on('connect_error', (error) => {
				clearTimeout(timeout);
				console.error('❌ BackendAnalysisRunner: Connection failed', error);
				reject(new Error(`Backend connection failed: ${error.message}`));
			});
		});
	}

	/**
	 * Setup global event handlers for all analyses
	 */
	setupGlobalHandlers() {
		// Generic handlers that work for all analysis methods
		this.socket.on('status update', (status) => {
			// Try to find the analysis ID for this status update
			if (status.jobId && this.activeAnalyses.has(status.jobId)) {
				const analysisId = this.activeAnalyses.get(status.jobId);
				analysisStore.updateAnalysisProgressById(
					analysisId,
					'running',
					status.progress || 0,
					status.msg || status.phase || 'Analysis in progress'
				);
			} else if (this.activeAnalyses.size === 1) {
				// If only one analysis is running, we can safely assume it's for that one
				const [jobId, analysisId] = this.activeAnalyses.entries().next().value;
				analysisStore.updateAnalysisProgressById(
					analysisId,
					'running',
					status.progress || 0,
					status.msg || status.phase || 'Analysis in progress'
				);
			} else if (this.activeAnalyses.size > 1) {
				// Multiple analyses running but no jobId - fallback to old behavior
				console.warn('Status update received without jobId, cannot route to specific analysis');
				analysisStore.updateAnalysisProgress(
					'running',
					status.progress || 0,
					status.msg || status.phase || 'Analysis in progress'
				);
			}
		});

		this.socket.on('completed', async (data) => {
			console.log('✅ Backend analysis completed');

			// Backend sends the entire data object, but we need just the results
			let results = data.results || data;

			// Ensure results are stored as JSON string to match WebAssembly format
			let resultString;
			if (typeof results === 'string') {
				// Already a string, use as-is
				resultString = results;
			} else {
				// Convert object to JSON string to match WebAssembly storage format
				resultString = JSON.stringify(results);
			}

			// First, try to match by jobId if available
			if (data.jobId && this.activeAnalyses.has(data.jobId)) {
				const analysisId = this.activeAnalyses.get(data.jobId);
				// Update the analysis in IndexedDB with results
				try {
					await analysisStore.updateAnalysis(analysisId, {
						status: 'completed',
						result: resultString,
						analysisTime: data.analysisTime,
						completedAt: new Date().getTime()
					});
				} catch (updateError) {
					console.error('Error updating backend analysis results:', updateError);
				}

				// Complete the progress tracking
				analysisStore.completeAnalysisProgress(true, 'Analysis completed successfully');
				this.activeAnalyses.delete(data.jobId);
			} else if (this.activeAnalyses.size > 0) {
				// Fallback: If no jobId match but we have active analyses, complete the first one
				// This mimics the demo behavior where any completion event completes the running analysis
				const [firstJobId, analysisId] = this.activeAnalyses.entries().next().value;
				// Update the analysis in IndexedDB with results
				try {
					await analysisStore.updateAnalysis(analysisId, {
						status: 'completed',
						result: resultString,
						analysisTime: data.analysisTime,
						completedAt: new Date().getTime()
					});
				} catch (updateError) {
					console.error('Error updating backend analysis results (fallback):', updateError);
				}

				// Complete the progress tracking
				analysisStore.completeAnalysisProgress(true, 'Analysis completed successfully');
				this.activeAnalyses.delete(firstJobId);
			} else {
				console.warn('⚠️ Completed analysis received but no active analyses:', {
					receivedJobId: data.jobId,
					activeAnalysesCount: this.activeAnalyses.size,
					data: data
				});
			}
		});

		this.socket.on('script error', (error) => {
			console.error('❌ Backend analysis error:', error);
			// Complete analysis progress with error
			analysisStore.completeAnalysisProgress(false, `Analysis failed: ${error.message || error}`);

			// Update all active analyses as failed (since we don't have specific job context)
			for (const [jobId, analysisId] of this.activeAnalyses.entries()) {
				analysisStore.updateAnalysis(analysisId, {
					status: 'error',
					error: error.message || error,
					completedAt: new Date().getTime()
				});
				this.activeAnalyses.delete(jobId);
			}
		});

		this.socket.on('validated', (result) => {
			console.log('✅ Backend parameter validation:', result);
			// This is handled per-analysis in runAnalysis method
		});

		this.socket.on('job queue', (jobs) => {
			console.log('📋 Backend job queue:', jobs);
			// Could update UI with queue information
		});
	}

	/**
	 * Run analysis on backend server
	 */
	async runAnalysis(method, config, fastaData, treeData, fileId = null) {
		console.log('🚀 BackendAnalysisRunner.runAnalysis called with:', {
			method,
			fastaDataLength: fastaData?.length || 0,
			treeDataLength: treeData?.length || 0,
			configKeys: Object.keys(config || {})
		});

		if (!this.socket || !this.socket.connected) {
			console.log('🔌 Socket not connected, attempting to connect...');
			await this.connect();
		}

		// Validate input data
		if (!fastaData || !fastaData.trim()) {
			throw new Error('FASTA data is empty or invalid');
		}

		if (!treeData || !treeData.trim()) {
			throw new Error('Tree data is empty or invalid');
		}

		// Create analysis entry in store - analysisStore.createAnalysis expects (fileId, method)
		// Use the provided fileId or null if not available
		const analysisId = await analysisStore.createAnalysis(fileId, method.toUpperCase());
		const jobId = `${method}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Track this analysis
		this.activeAnalyses.set(jobId, analysisId);

		try {
			// Start analysis progress tracking
			analysisStore.startAnalysisProgress(analysisId, `Starting ${method} analysis...`, method, {
				executionMode: 'backend'
			});

			// Prepare analysis parameters based on method
			const analysisParams = this.prepareAnalysisParameters(method, config);

			// Submit to backend
			const eventName = `${method.toLowerCase()}:spawn`;
			console.log(`📤 Submitting ${method} analysis to backend:`, eventName, {
				alignmentLength: fastaData.length,
				treeLength: treeData.length,
				jobParams: analysisParams
			});

			const submitData = {
				alignment: fastaData,
				tree: treeData,
				job: analysisParams // Don't include our custom jobId in the job params
			};

			this.socket.emit(eventName, submitData);

			// Update analysis with job ID and status
			analysisStore.updateAnalysisProgressById(
				analysisId,
				'pending',
				5,
				`Job submitted - ID: ${jobId}`
			);

			return {
				analysisId,
				jobId,
				message: `Analysis submitted to backend server`
			};
		} catch (error) {
			console.error('❌ Backend analysis submission failed:', error);

			// Update analysis as failed
			analysisStore.updateAnalysis(analysisId, {
				status: 'error',
				error: error.message,
				completedAt: new Date().getTime()
			});

			// Complete progress tracking with error
			analysisStore.completeAnalysisProgress(false, `Submission failed: ${error.message}`);

			this.activeAnalyses.delete(jobId);
			throw error;
		}
	}

	/**
	 * Prepare analysis parameters based on method and config
	 */
	prepareAnalysisParameters(method, config) {
		const baseParams = {
			analysis_type: method.toLowerCase(),
			code: config.geneticCode || 'Universal'
		};

		// Method-specific parameter mapping
		switch (method.toLowerCase()) {
			case 'fel':
				return {
					...baseParams,
					pvalue: config.pValueThreshold || 0.1,
					branches: 'All',
					samples: 100
				};

			case 'slac':
				return {
					...baseParams,
					pvalue: config.pValueThreshold || 0.1,
					branches: 'All',
					samples: config.samples || 100
				};

			case 'meme':
				return {
					...baseParams,
					pvalue: config.pValueThreshold || 0.1,
					branches: 'All'
				};

			case 'fubar':
				return {
					...baseParams,
					chains: config.mcmcChains || 5,
					samples: config.mcmcSamples || 2000000,
					burnin: 1000000,
					posterior: config.posteriorThreshold || 0.9
				};

			default:
				return baseParams;
		}
	}

	/**
	 * Cancel a running analysis
	 */
	async cancelAnalysis(analysisId) {
		// Find jobId for this analysis
		for (const [jobId, aId] of this.activeAnalyses.entries()) {
			if (aId === analysisId) {
				// Emit cancel event if supported by backend
				if (this.socket && this.socket.connected) {
					this.socket.emit('cancel', { jobId });
				}

				// Update analysis status
				analysisStore.cancelAnalysis(analysisId);
				this.activeAnalyses.delete(jobId);
				break;
			}
		}
	}

	/**
	 * Validate parameters before submission
	 */
	async validateParameters(method, config) {
		if (!this.socket || !this.socket.connected) {
			await this.connect();
		}

		const analysisParams = this.prepareAnalysisParameters(method, config);
		const eventName = `${method.toLowerCase()}:check`;

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Parameter validation timeout'));
			}, 10000);

			const handleValidated = (result) => {
				clearTimeout(timeout);
				this.socket.off('validated', handleValidated);
				resolve(result);
			};

			this.socket.on('validated', handleValidated);
			this.socket.emit(eventName, { job: analysisParams });
		});
	}

	/**
	 * Disconnect from backend server
	 */
	disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		this.activeAnalyses.clear();
	}

	/**
	 * Check if connected to backend
	 */
	isConnected() {
		return this.socket ? this.socket.connected : false;
	}
}

// Export singleton instance
export const backendAnalysisRunner = new BackendAnalysisRunner();
export default backendAnalysisRunner;
