/**
 * WASM Analysis Runner - Handles client-side analysis execution via WebAssembly
 * Uses the Aioli library to run HyPhy analyses locally in the browser
 */

import { BaseAnalysisRunner } from './BaseAnalysisRunner.js';
import { aioliStore } from '../../stores/aioli.js';
import { get } from 'svelte/store';
import { getCachedOrCompute, generateAnalysisKey } from '../utils/cacheUtils.js';

class WasmAnalysisRunner extends BaseAnalysisRunner {
	constructor() {
		super();
		this.isInitialized = false;
	}

	/**
	 * Initialize WASM environment
	 */
	async initialize() {
		if (this.isInitialized) return;

		const cliObj = get(aioliStore);
		if (!cliObj) {
			throw new Error('Aioli CLI object not available. Please initialize WASM first.');
		}

		this.isInitialized = true;
	}

	/**
	 * Run analysis using WebAssembly
	 */
	async runAnalysis(method, config, fastaData, treeData, fileId = null) {
		console.log('🚀 WasmAnalysisRunner.runAnalysis called with:', {
			method,
			fastaDataLength: fastaData?.length || 0,
			treeDataLength: treeData?.length || 0,
			configKeys: Object.keys(config || {})
		});

		// Validate input using base class method
		this.validateInput(fastaData, treeData, method);

		// Ensure WASM is initialized
		await this.initialize();

		// Create analysis entry in store
		const analysisId = await this.createAnalysis(fileId, method.toUpperCase());
		const jobId = this.generateJobId(method);

		// Track this analysis
		this.activeAnalyses.set(jobId, analysisId);

		try {
			// Start analysis tracking using base class method
			this.startAnalysisTracking(analysisId, method, 'wasm');

			// Generate cache key for this analysis
			const cacheKey = generateAnalysisKey(
				method,
				`${fastaData.length}_${treeData.length}`,
				config
			);

			// Try to get result from cache or compute it
			const result = await getCachedOrCompute(
				cacheKey,
				() => this.executeWasmAnalysis(analysisId, method, config, fastaData, treeData),
				30 * 60 * 1000 // 30 minute cache
			);

			// Complete the analysis
			await this.completeAnalysis(analysisId, true, result.json || result);
			this.activeAnalyses.delete(jobId);

			console.log(
				`Analysis ${method} completed successfully${result.cached ? ' (from cache)' : ''}`
			);

			return {
				analysisId,
				jobId,
				message: `Analysis completed ${result.cached ? '(from cache)' : ''}`
			};
		} catch (error) {
			console.error('❌ WASM analysis execution failed:', error);
			await this.completeAnalysis(analysisId, false, null, error.message);
			this.activeAnalyses.delete(jobId);
			throw error;
		}
	}

	/**
	 * Execute the actual WASM analysis
	 */
	async executeWasmAnalysis(analysisId, method, config, fastaData, treeData) {
		const cliObj = get(aioliStore);

		this.updateProgress(analysisId, 'mounting', 10, 'Preparing analysis files...');

		// Create temporary file from FASTA data
		const inputFile = new File([fastaData], 'user.nex', { type: 'text/plain' });

		// Mount the file
		const inputFiles = await cliObj.mount([{ name: 'user.nex', data: fastaData }]);

		this.updateProgress(analysisId, 'running', 20, 'Building analysis command...');

		// Build arguments
		const args = [];
		args.push(`--alignment ${inputFiles[0]}`);

		// Add other options from config
		for (const [key, value] of Object.entries(config)) {
			if (key !== 'tree') {
				// Special handling for genetic code parameter
				if (key === 'code') {
					args.push(`--${key} "${value}"`);
				} else if (typeof value === 'string' && value.includes(' ')) {
					args.push(`--${key} "${value}"`);
				} else {
					args.push(`--${key} ${value}`);
				}
			}
		}

		// Build and execute the command
		const fullHyphyCommand = `hyphy LIBPATH=/shared/hyphy/ ${method} ${args.join(' ')}`;
		console.log(`Executing HyPhy command: ${fullHyphyCommand}`);

		this.updateProgress(analysisId, 'running', 40, `Executing ${method} analysis...`);

		// Run the analysis
		const cmdResult = await cliObj.exec(fullHyphyCommand);
		const stdout = await cmdResult.stdout;

		// Check for common HyPhy errors
		if (stdout.includes('is not a valid choice passed to')) {
			const errorMatch = stdout.match(/'([^']+)' is not a valid choice passed to '([^']+)'/);
			if (errorMatch) {
				const [_, invalidValue, paramName] = errorMatch;
				throw new Error(
					`HyPhy error: '${invalidValue}' is not a valid value for parameter '${paramName}'. Please check your input parameters.`
				);
			} else {
				throw new Error(
					'HyPhy error: Invalid parameter choice. Please check your input parameters.'
				);
			}
		}

		this.updateProgress(analysisId, 'processing', 80, 'Processing results...');

		// Get the JSON result
		const jsonBlob = await cliObj.download(`/shared/data/user.nex.${method.toUpperCase()}.json`);
		const response = await fetch(jsonBlob);
		const blob = await response.blob();
		const jsonText = await blob.text();
		const jsonData = JSON.parse(jsonText);

		this.updateProgress(analysisId, 'saving', 95, 'Saving results...');

		// Return the combined result
		return {
			stdout,
			json: jsonData,
			cached: false
		};
	}

	/**
	 * Clean up WASM resources
	 */
	destroy() {
		super.destroy();
		this.isInitialized = false;
	}
}

// Export singleton instance
export const wasmAnalysisRunner = new WasmAnalysisRunner();
export default wasmAnalysisRunner;
