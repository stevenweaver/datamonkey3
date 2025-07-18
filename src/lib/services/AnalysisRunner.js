import { analysisQueue, AnalysisStatus } from '../../stores/analysisQueue';
import { aioliStore } from '../../stores/aioli';
import { get } from 'svelte/store';
import { getCachedOrCompute, generateAnalysisKey, clearCacheEntry } from '../utils/cacheUtils';

// Singleton for analysis runner
class AnalysisRunner {
	constructor() {
		// Flag to track if an analysis is currently running
		this.isRunning = false;

		// Queue of analysis IDs waiting to be run
		this.runningQueue = [];

		// Subscribe to the analysis queue store to watch for new analyses
		this.unsubscribe = analysisQueue.subscribe((queue) => {
			// Check if there are pending analyses and none are currently running
			const pendingAnalyses = queue.filter(
				(analysis) => analysis.status === AnalysisStatus.PENDING
			);

			if (pendingAnalyses.length > 0 && !this.isRunning && this.runningQueue.length === 0) {
				// Start processing the queue
				this.processNextAnalysis();
			}
		});
	}

	// Start an analysis manually
	startAnalysis(analysisId) {
		const queue = get(analysisQueue);
		const analysis = queue.find((a) => a.id === analysisId);

		if (!analysis) {
			console.error(`Analysis with ID ${analysisId} not found`);
			return;
		}

		if (analysis.status !== AnalysisStatus.PENDING) {
			console.error(`Analysis with ID ${analysisId} is not in PENDING state`);
			return;
		}

		// Add to the front of the running queue
		this.runningQueue.unshift(analysisId);

		// Start processing if not already running
		if (!this.isRunning) {
			this.processNextAnalysis();
		}
	}

	// Process the next analysis in the queue
	async processNextAnalysis() {
		if (this.isRunning || this.runningQueue.length === 0) {
			return;
		}

		this.isRunning = true;

		// Get the next analysis ID
		const analysisId = this.runningQueue.shift();

		// Get the analysis from the store
		const queue = get(analysisQueue);
		const analysis = queue.find((a) => a.id === analysisId);

		if (!analysis) {
			console.error(`Analysis with ID ${analysisId} not found`);
			this.isRunning = false;
			this.processNextAnalysis();
			return;
		}

		// Update the status to RUNNING
		analysisQueue.updateStatus(analysisId, AnalysisStatus.RUNNING);

		try {
			// Generate a cache key for this analysis
			const cacheKey = generateAnalysisKey(
				analysis.method,
				analysis.file.name + '_' + analysis.file.size,
				analysis.config
			);

			// Try to get the result from cache or compute it
			const result = await getCachedOrCompute(
				cacheKey,
				async () => {
					// This is the computation function that runs if cache misses
					console.log(`Cache miss for ${analysis.method}, running analysis...`);

					// Get the Aioli CLI object
					const cliObj = get(aioliStore);

					if (!cliObj) {
						throw new Error('Aioli CLI object not available');
					}

					// Get the file data - we need to work with the original file
					const fileData = await fetch(URL.createObjectURL(analysis.file)).then((r) => r.text());

					// Mount the file
					const inputFiles = await cliObj.mount([{ name: 'user.nex', data: fileData }]);

					// Build arguments
					const args = [];

					// Add the alignment file
					args.push(`--alignment ${inputFiles[0]}`);

					// Add other options from config
					for (const [key, value] of Object.entries(analysis.config)) {
						if (key !== 'tree') {
							// Skip the tree as it's handled separately
							// Special handling for the genetic code parameter
							if (key === 'code') {
								// Ensure genetic code is properly quoted
								args.push(`--${key} "${value}"`);
							} else if (typeof value === 'string' && value.includes(' ')) {
								// Quote any string values that contain spaces
								args.push(`--${key} "${value}"`);
							} else {
								args.push(`--${key} ${value}`);
							}
						}
					}

					// Run the analysis
					const fullHyphyCommand = `hyphy LIBPATH=/shared/hyphy/ ${analysis.method} ${args.join(' ')}`;

					// Log the full command for debugging
					console.log(`Executing HyPhy command: ${fullHyphyCommand}`);

					const cmdResult = await cliObj.exec(fullHyphyCommand);
					const stdout = await cmdResult.stdout;

					// Check for common HyPhy errors in the output
					if (stdout.includes('is not a valid choice passed to')) {
						const errorMatch = stdout.match(/'([^']+)' is not a valid choice passed to '([^']+)'/);
						if (errorMatch) {
							const [_, invalidValue, paramName] = errorMatch;
							throw new Error(
								`HyPhy error: '${invalidValue}' is not a valid value for parameter '${paramName}'. Please check your input parameters.`
							);
						} else {
							throw new Error(
								`HyPhy error: Invalid parameter choice. Please check your input parameters.`
							);
						}
					}

					// Log the beginning of stdout for debugging
					console.log(`HyPhy command output (first 200 chars): ${stdout.substring(0, 200)}...`);

					// Get the JSON result
					const jsonBlob = await cliObj.download(
						`/shared/data/user.nex.${analysis.method.toUpperCase()}.json`
					);
					const response = await fetch(jsonBlob);
					const blob = await response.blob();
					const jsonText = await blob.text();
					const jsonData = JSON.parse(jsonText);

					// Return the combined result
					return {
						stdout,
						json: jsonData,
						cached: false
					};
				},
				// Cache timeout: 30 minutes
				30 * 60 * 1000
			);

			// Add cache hit/miss info to the result
			if (result.cached) {
				console.log(`Using cached result for ${analysis.method}`);
			}

			// Update the analysis with the result
			analysisQueue.updateResult(analysisId, result);

			// Also update the server status via API
			try {
				fetch(`/api/analyses/${analysisId}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						status: 'completed',
						result: JSON.stringify(result.json),
						completedAt: new Date().getTime()
					})
				})
					.then((response) => response.json())
					.then((data) => {
						console.log('Server analysis status updated from AnalysisRunner:', data);
					})
					.catch((error) => {
						console.error('Error updating analysis status on server from AnalysisRunner:', error);
					});
			} catch (error) {
				console.error('Error sending update to server:', error);
			}

			console.log(
				`Analysis ${analysis.method} completed successfully${result.cached ? ' (from cache)' : ''}`
			);
		} catch (error) {
			console.error(`Error running analysis:`, error);
			analysisQueue.updateStatus(analysisId, AnalysisStatus.FAILED);

			// Update server status for failure as well
			try {
				fetch(`/api/analyses/${analysisId}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						status: 'error',
						result: JSON.stringify({ error: error.message || 'Unknown error occurred' })
					})
				})
					.then((response) => response.json())
					.then((data) => {
						console.log('Server analysis error status updated:', data);
					})
					.catch((err) => {
						console.error('Error updating analysis error status on server:', err);
					});
			} catch (err) {
				console.error('Error sending error update to server:', err);
			}
		} finally {
			this.isRunning = false;

			// Process next analysis if there are more in the queue
			if (this.runningQueue.length > 0) {
				this.processNextAnalysis();
			}
		}
	}

	// Clean up subscriptions when destroyed
	destroy() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}
}

// Create and export a singleton instance
export const analysisRunner = new AnalysisRunner();
