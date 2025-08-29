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
			console.log('📊 Backend status update:', status);
			if (status.jobId && this.activeAnalyses.has(status.jobId)) {
				const analysisId = this.activeAnalyses.get(status.jobId);
				analysisStore.updateProgress(analysisId, {
					status: 'running',
					progress: status.progress || 0,
					currentPhase: status.phase || 'Processing',
					message: status.msg || 'Analysis in progress'
				});
			}
		});

		this.socket.on('completed', (data) => {
			console.log('✅ Backend analysis completed:', data);
			if (data.jobId && this.activeAnalyses.has(data.jobId)) {
				const analysisId = this.activeAnalyses.get(data.jobId);
				analysisStore.completeAnalysis(analysisId, {
					results: data.results || data,
					analysisTime: data.analysisTime,
					completedAt: new Date().toISOString()
				});
				this.activeAnalyses.delete(data.jobId);
			}
		});

		this.socket.on('script error', (error) => {
			console.error('❌ Backend analysis error:', error);
			// Find analysis by error context or iterate through active analyses
			for (const [jobId, analysisId] of this.activeAnalyses.entries()) {
				analysisStore.failAnalysis(analysisId, {
					error: error.message || error,
					failedAt: new Date().toISOString()
				});
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
	async runAnalysis(method, config, fastaData, treeData) {
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

		// Create analysis entry in store
		const analysis = analysisStore.createAnalysis({
			method: method.toUpperCase(),
			config,
			executionMode: 'backend'
		});

		const analysisId = analysis.id;
		const jobId = `${method}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		
		// Track this analysis
		this.activeAnalyses.set(jobId, analysisId);

		try {
			// Update analysis status
			analysisStore.startAnalysis(analysisId);

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
				job: {
					...analysisParams,
					jobId: jobId
				}
			};

			this.socket.emit(eventName, submitData);

			// Update analysis with job ID
			analysisStore.updateProgress(analysisId, {
				status: 'pending',
				message: `Job submitted - ID: ${jobId}`,
				jobId: jobId
			});

			return {
				analysisId,
				jobId,
				message: `Analysis submitted to backend server`
			};

		} catch (error) {
			console.error('❌ Backend analysis submission failed:', error);
			analysisStore.failAnalysis(analysisId, {
				error: error.message,
				failedAt: new Date().toISOString()
			});
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
		return this.socket && this.socket.connected;
	}
}

// Export singleton instance
export const backendAnalysisRunner = new BackendAnalysisRunner();
export default backendAnalysisRunner;