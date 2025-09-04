/**
 * BackendAnalysisRunner - Handles server-side analysis execution via Socket.IO
 * Integrates with the existing DataMonkey backend server used in demo pages
 */

import io from 'socket.io-client';
import { DATAMONKEY_SERVER_URL } from '../config/env.ts';
import { BaseAnalysisRunner } from './BaseAnalysisRunner.js';

class BackendAnalysisRunner extends BaseAnalysisRunner {
	constructor() {
		super();
		this.socket = null;
		this.serverUrl = DATAMONKEY_SERVER_URL;
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
				this.updateProgress(
					analysisId,
					'running',
					status.progress || 0,
					status.msg || status.phase || 'Analysis in progress'
				);
			} else if (this.activeAnalyses.size === 1) {
				// If only one analysis is running, we can safely assume it's for that one
				const [jobId, analysisId] = this.activeAnalyses.entries().next().value;
				this.updateProgress(
					analysisId,
					'running',
					status.progress || 0,
					status.msg || status.phase || 'Analysis in progress'
				);
			} else if (this.activeAnalyses.size > 1) {
				// Multiple analyses running but no jobId - fallback to old behavior
				console.warn('Status update received without jobId, cannot route to specific analysis');
				this.updateProgress(
					null, // Will use active analysis fallback in base class
					'running',
					status.progress || 0,
					status.msg || status.phase || 'Analysis in progress'
				);
			}
		});

		this.socket.on('completed', async (data) => {
			console.log('✅ Backend analysis completed');

			const results = data.results || data;

			// First, try to match by jobId if available
			if (data.jobId && this.activeAnalyses.has(data.jobId)) {
				const analysisId = this.activeAnalyses.get(data.jobId);
				await this.completeAnalysis(analysisId, true, results);
				this.activeAnalyses.delete(data.jobId);
			} else if (this.activeAnalyses.size > 0) {
				// Fallback: If no jobId match but we have active analyses, complete the first one
				const [firstJobId, analysisId] = this.activeAnalyses.entries().next().value;
				await this.completeAnalysis(analysisId, true, results);
				this.activeAnalyses.delete(firstJobId);
			} else {
				console.warn('⚠️ Completed analysis received but no active analyses:', {
					receivedJobId: data.jobId,
					activeAnalysesCount: this.activeAnalyses.size,
					data: data
				});
			}
		});

		this.socket.on('script error', async (error) => {
			console.error('❌ Backend analysis error:', error);

			// Update all active analyses as failed (since we don't have specific job context)
			for (const [jobId, analysisId] of this.activeAnalyses.entries()) {
				await this.completeAnalysis(
					analysisId,
					false,
					null,
					`Analysis failed: ${error.message || error}`
				);
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

		// Validate input using base class method
		this.validateInput(fastaData, treeData, method);

		if (!this.socket || !this.socket.connected) {
			console.log('🔌 Socket not connected, attempting to connect...');
			await this.connect();
		}

		// Create analysis entry in store
		const analysisId = await this.createAnalysis(fileId, method.toUpperCase());
		const jobId = this.generateJobId(method);

		// Track this analysis
		this.activeAnalyses.set(jobId, analysisId);

		try {
			// Prepare analysis parameters based on method
			const analysisParams = this.prepareAnalysisParameters(method, config);

			// Build arguments preview for tracking
			const argsPreview = this.buildArgumentsPreview(method, config, treeData, analysisParams);

			// Start analysis tracking using base class method
			this.startAnalysisTracking(analysisId, method, 'backend', null, argsPreview);

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
				job: analysisParams
			};

			this.socket.emit(eventName, submitData);

			// Update progress
			this.updateProgress(analysisId, 'pending', 5, `Job submitted - ID: ${jobId}`);

			return {
				analysisId,
				jobId,
				message: `Analysis submitted to backend server`
			};
		} catch (error) {
			console.error('❌ Backend analysis submission failed:', error);
			await this.completeAnalysis(analysisId, false, null, `Submission failed: ${error.message}`);
			this.activeAnalyses.delete(jobId);
			throw error;
		}
	}

	/**
	 * Map genetic code name to numeric ID (for backward compatibility)
	 */
	mapGeneticCodeToId(geneticCode) {
		const codeMap = {
			Universal: 0,
			'Vertebrate mitochondrial': 1,
			'Yeast mitochondrial': 2,
			'Mold mitochondrial': 3,
			'Invertebrate mitochondrial': 4,
			'Ciliate nuclear': 5,
			'Echinoderm mitochondrial': 6,
			'Euplotid nuclear': 7,
			'Alternative yeast nuclear': 8,
			'Ascidian mitochondrial': 9,
			'Flatworm mitochondrial': 10,
			'Blepharisma nuclear': 11
		};
		return codeMap[geneticCode] || 0;
	}

	/**
	 * Prepare analysis parameters based on method and config
	 */
	prepareAnalysisParameters(method, config) {
		const baseParams = {
			analysis_type: method.toLowerCase(),
			// Use genetic code ID if available, otherwise map name to ID
			gencodeid:
				config.geneticCodeId !== undefined
					? config.geneticCodeId
					: this.mapGeneticCodeToId(config.geneticCode)
		};

		// Method-specific parameter mapping
		switch (method.toLowerCase()) {
			case 'fel':
				return {
					...baseParams,
					// Map FEL-specific parameters to backend format
					'ds-variation': config.srv === 'Yes' ? 1 : 2,
					multiple_hits: config.multipleHits || 'None',
					site_multihit: config.siteMultihit || 'Estimate',
					resample: config.resample || 0,
					'confidence-interval': config.confidenceIntervals ? true : false,
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
	 * Build arguments preview for database storage
	 */
	buildArgumentsPreview(method, config, treeData, analysisParams) {
		return {
			method: method.toUpperCase(),
			parameters: analysisParams,
			originalConfig: config,
			treeData: treeData
				? {
						provided: true,
						length: treeData.length,
						source: 'user-provided'
					}
				: {
						provided: false,
						source: 'none'
					},
			executionMode: 'backend',
			backendEvent: `${method.toLowerCase()}:spawn`,
			socketParams: {
				msa: '[FASTA_DATA]', // Placeholder for actual data
				tree: treeData ? '[TREE_DATA]' : null,
				...analysisParams
			}
		};
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
				this.activeAnalyses.delete(jobId);
				break;
			}
		}

		// Use base class method to cancel in store
		await super.cancelAnalysis(analysisId);
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
