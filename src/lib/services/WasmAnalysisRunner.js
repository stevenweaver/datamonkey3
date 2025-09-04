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
			// Build arguments preview for tracking (before actual execution)
			const argsPreview = this.buildArgumentsPreview(method, config, treeData);

			// Start analysis tracking using base class method
			this.startAnalysisTracking(analysisId, method, 'wasm', null, argsPreview);

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

		// Prepare files to mount
		const filesToMount = [{ name: 'user.nex', data: fastaData }];

		// Add tree file if provided
		if (treeData && treeData.trim()) {
			filesToMount.push({ name: 'user.tree', data: treeData });
		}

		// Mount the files
		const inputFiles = await cliObj.mount(filesToMount);

		this.updateProgress(analysisId, 'running', 20, 'Building analysis command...');

		// Build arguments
		const args = [];
		args.push(`--alignment ${inputFiles[0]}`);

		// Add tree argument if tree data was provided
		if (treeData && treeData.trim()) {
			args.push(`--tree ${inputFiles[1]}`);
		}

		// Map configuration parameters to HyPhy command line arguments
		for (const [key, value] of Object.entries(config)) {
			if (key !== 'tree' && key !== 'method' && key !== 'executionMode') {
				// Handle specific FEL parameter mappings
				if (key === 'geneticCodeId' || key === 'code') {
					// Use numeric genetic code ID for HyPhy
					const codeId = key === 'geneticCodeId' ? value : config.geneticCodeId || 0;
					args.push(`--code ${codeId}`);
				} else if (key === 'srv') {
					// Synonymous rate variation
					args.push(`--srv ${value}`);
				} else if (key === 'multipleHits') {
					// Multiple hits parameter
					if (value !== 'None') {
						args.push(`--multiple-hits ${value}`);
					}
				} else if (key === 'siteMultihit') {
					// Site multihit parameter (only when multiple hits enabled)
					if (config.multipleHits && config.multipleHits !== 'None') {
						args.push(`--site-multihit ${value}`);
					}
				} else if (key === 'resample' && value > 0) {
					// Bootstrap resampling
					args.push(`--resample ${value}`);
				} else if (key === 'confidenceIntervals' && value === true) {
					// Confidence intervals
					args.push(`--ci Yes`);
				} else if (key === 'pValueThreshold') {
					// P-value threshold (custom parameter, not standard HyPhy)
					// This would be handled post-processing
					continue;
				} else if (typeof value === 'boolean') {
					// Boolean parameters
					args.push(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()} ${value ? 'Yes' : 'No'}`);
				} else if (typeof value === 'string' && value.includes(' ')) {
					// String parameters with spaces
					args.push(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()} "${value}"`);
				} else if (value !== null && value !== undefined && value !== '') {
					// Other parameters
					args.push(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()} ${value}`);
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

		// Add command execution details to stdout for debugging
		const commandInfo = `\n=== HyPhy Command Execution ===\nCommand: ${fullHyphyCommand}\nFiles mounted: ${filesToMount.map((f) => f.name).join(', ')}\nTree data provided: ${treeData && treeData.trim() ? 'Yes' : 'No'}\n================================\n\n`;
		const enhancedStdout = commandInfo + stdout;

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
			stdout: enhancedStdout,
			json: jsonData,
			cached: false
		};
	}

	/**
	 * Build arguments preview for database storage (before actual execution)
	 */
	buildArgumentsPreview(method, config, treeData) {
		const args = [];
		args.push(`--alignment user.nex`);

		// Add tree argument if tree data was provided
		if (treeData && treeData.trim()) {
			args.push(`--tree user.tree`);
		}

		// Map configuration parameters to HyPhy command line arguments
		for (const [key, value] of Object.entries(config)) {
			if (key !== 'tree' && key !== 'method' && key !== 'executionMode') {
				// Handle specific FEL parameter mappings
				if (key === 'geneticCodeId' || key === 'code') {
					// Use numeric genetic code ID for HyPhy
					const codeId = key === 'geneticCodeId' ? value : config.geneticCodeId || 0;
					args.push(`--code ${codeId}`);
				} else if (key === 'srv') {
					// Synonymous rate variation
					args.push(`--srv ${value}`);
				} else if (key === 'multipleHits') {
					// Multiple hits parameter
					if (value !== 'None') {
						args.push(`--multiple-hits ${value}`);
					}
				} else if (key === 'siteMultihit') {
					// Site multihit parameter (only when multiple hits enabled)
					if (config.multipleHits && config.multipleHits !== 'None') {
						args.push(`--site-multihit ${value}`);
					}
				} else if (key === 'resample' && value > 0) {
					// Bootstrap resampling
					args.push(`--resample ${value}`);
				} else if (key === 'confidenceIntervals' && value === true) {
					// Confidence intervals
					args.push(`--ci Yes`);
				} else if (key === 'pValueThreshold') {
					// P-value threshold (custom parameter, not standard HyPhy)
					// This would be handled post-processing
					continue;
				} else if (typeof value === 'boolean') {
					// Boolean parameters
					args.push(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()} ${value ? 'Yes' : 'No'}`);
				} else if (typeof value === 'string' && value.includes(' ')) {
					// String parameters with spaces
					args.push(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()} "${value}"`);
				} else if (value !== null && value !== undefined && value !== '') {
					// Other parameters
					args.push(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()} ${value}`);
				}
			}
		}

		return {
			command: `hyphy LIBPATH=/shared/hyphy/ ${method} ${args.join(' ')}`,
			method: method.toUpperCase(),
			parameters: config,
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
			executionMode: 'wasm'
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
