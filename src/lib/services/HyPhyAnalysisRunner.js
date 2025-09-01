import { analysisStore } from '../../stores/analyses';
import { hyphyOutputParser } from '../utils/hyphyOutputParser';

/**
 * Service that handles running HyPhy analyses and managing their state
 */
class HyPhyAnalysisRunner {
	constructor() {
		this.runningAnalyses = new Map();
		this.outputBuffer = new Map();
		this.statusCheckInterval = null;

		// Start the status checker
		this.startStatusChecker();
	}

	/**
	 * Start an analysis
	 * @param {string} analysisId - The unique ID for this analysis
	 * @param {Object} options - Analysis options
	 * @returns {Promise<Object>} - The analysis result
	 */
	async startAnalysis(analysisId, options) {
		try {
			// Initialize analysis state
			this.outputBuffer.set(analysisId, '');

			// Track that this analysis is running
			this.runningAnalyses.set(analysisId, {
				id: analysisId,
				status: 'initializing',
				startTime: Date.now(),
				options,
				worker: null,
				error: null
			});

			// Tell the store we're starting an analysis
			analysisStore.startAnalysisProgress(analysisId, 'Initializing HyPhy analysis...', options.method, { executionMode: 'wasm' });

			// Create and setup the worker
			const worker = await this.createWorker(analysisId, options);

			// Store the worker
			const analysisState = this.runningAnalyses.get(analysisId);
			if (analysisState) {
				analysisState.worker = worker;
				this.runningAnalyses.set(analysisId, analysisState);
			}

			// Return a promise that resolves when the analysis is complete
			return new Promise((resolve, reject) => {
				// Setup completion handlers
				const checkCompletion = () => {
					const state = this.runningAnalyses.get(analysisId);
					if (!state) {
						reject(new Error('Analysis was cancelled'));
						return;
					}

					if (state.status === 'completed') {
						resolve(state.result);
						this.cleanupAnalysis(analysisId);
					} else if (state.status === 'error') {
						reject(state.error || new Error('Analysis failed'));
						this.cleanupAnalysis(analysisId);
					}
				};

				// Check completion every second
				const intervalId = setInterval(checkCompletion, 1000);

				// Also store the interval ID for cleanup
				const analysisState = this.runningAnalyses.get(analysisId);
				if (analysisState) {
					analysisState.completionInterval = intervalId;
					this.runningAnalyses.set(analysisId, analysisState);
				}
			});
		} catch (error) {
			// Update the analysis state with the error
			const analysisState = this.runningAnalyses.get(analysisId);
			if (analysisState) {
				analysisState.status = 'error';
				analysisState.error = error;
				this.runningAnalyses.set(analysisId, analysisState);
			}

			// Update the store
			analysisStore.updateAnalysisProgress('error', 0, `Error: ${error.message}`);
			analysisStore.completeAnalysisProgress(false, `Analysis failed: ${error.message}`);

			// Rethrow the error
			throw error;
		}
	}

	/**
	 * Create and setup a worker for the analysis
	 * @param {string} analysisId - The unique ID for this analysis
	 * @param {Object} options - Analysis options
	 * @returns {Promise<Worker>} - The configured worker
	 */
	async createWorker(analysisId, options) {
		// This is a placeholder for actual worker creation
		// In a real implementation, this would create a Web Worker or start a server-side process

		// Simulate worker creation and setup
		const simulatedWorker = {
			analysisId,
			options,
			isRunning: true,

			// Simulate receiving messages
			postMessage: (message) => {
				// Handle messages sent to the worker
				console.log(`Worker received message:`, message);

				// If this is a start message, begin the simulated analysis
				if (message.type === 'start') {
					this.simulateAnalysisProgress(analysisId, options);
				} else if (message.type === 'stop') {
					this.stopAnalysis(analysisId);
				}
			},

			// Clean up resources
			terminate: () => {
				this.simulatedWorker.isRunning = false;
			}
		};

		return simulatedWorker;
	}

	/**
	 * Simulate analysis progress for demonstration purposes
	 * @param {string} analysisId - The analysis ID
	 * @param {Object} options - Analysis options
	 */
	simulateAnalysisProgress(analysisId, options) {
		// This is just a simulation
		// In a real implementation, this would be replaced by actual HyPhy output processing

		// Define phases and their durations
		const phases = [
			{
				id: 'initializing',
				duration: 2000,
				messages: [
					'## Initializing HyPhy Analysis\n\n**Method:** FEL (Fixed Effects Likelihood)\n\nPreparing analysis parameters and loading required modules.',
					'Loading HyPhy environment and setting up analysis parameters.\n\n```\nHyPhy 2.5.31 (MP) for MacOS\nBuilt on Sat Jun 4 16:42:13 2022\n```'
				]
			},
			{
				id: 'mounting',
				duration: 3000,
				messages: [
					'## Loading Input Data\n\nReading sequence alignment from file.\n\n**Summary:**\n- Format: FASTA\n- Sequences: 14\n- Sites: 1380',
					'## Preparing Phylogenetic Tree\n\nUsing user-provided tree topology.\n\n```\n((((Pig:0.147969,Cow:0.213430):0.085099,Horse:0.165787,Cat:0.264806):0.058611,((RhMonkey:0.002015,Baboon:0.003108):0.022733,(Human:0.004349,Chimp:0.000799):0.011873):0.101856):0.340802,Rat:0.050958,Mouse:0.097950);\n```'
				]
			},
			{
				id: 'running',
				duration: 10000,
				messages: [
					'## Running FEL Analysis\n\n**Model:** GY94_3x4\n\nFitting nucleotide substitution model to alignment.',
					'### Optimizing Branch Lengths\n\n**Progress:** 25%\n\nEstimating branch lengths using the GY94 codon model with 3x4 frequency estimator.',
					'### Testing Individual Sites\n\n**Progress:** 50%\n\nTesting for selection at each site using likelihood ratio tests.\n\n```\nSite | dN/dS | Log(L) | LRT | p-value\n-----|------|-------|-----|--------\n14 | 0.31 | -25.2 | 8.14 | 0.004\n27 | 1.02 | -18.7 | 0.01 | 0.923\n```',
					'### Finalizing Analysis\n\n**Progress:** 75%\n\nComputing confidence intervals and preparing results.'
				]
			},
			{
				id: 'processing',
				duration: 3000,
				messages: [
					'## Processing Results\n\n**Progress:** 85%\n\nCompiling selection analysis results across all sites.',
					'### Selection Summary\n\n**Results:**\n- Total sites: 459\n- Sites under positive selection: 3\n- Sites under negative selection: 42\n- Neutral sites: 414\n\n**Progress:** 95%'
				]
			},
			{
				id: 'saving',
				duration: 2000,
				messages: [
					'## Saving Results\n\n**Progress:** 98%\n\nFormatting and writing results to output files.',
					'Analysis complete. Results saved to output file.\n\n**Execution time:** 00:22\n**CPU utilization:** 89%'
				]
			},
			{
				id: 'completed',
				duration: 0,
				messages: [
					'## Analysis Complete\n\n**Summary:**\n- Method: FEL\n- Sites analyzed: 459\n- Positively selected sites: 3\n- p-value threshold: 0.05\n\nResults are ready to view.'
				]
			}
		];

		// If there's an error option, simulate an error instead
		if (options.simulateError) {
			setTimeout(() => {
				const errorMessage =
					'## Analysis Error\n\n❌ **Error:** Failed to optimize likelihood function\n\n```\nError in codon frequency estimation.\nFailed to converge after maximum iterations.\n```';

				// Add error output to buffer
				const currentOutput = this.outputBuffer.get(analysisId) || '';
				this.outputBuffer.set(analysisId, currentOutput + '\n' + errorMessage);

				// Update the analysis state
				const analysisState = this.runningAnalyses.get(analysisId);
				if (analysisState) {
					analysisState.status = 'error';
					analysisState.error = new Error('Failed to optimize likelihood function');
					this.runningAnalyses.set(analysisId, analysisState);
				}

				// Update the store
				const uiState = hyphyOutputParser.mapToUIState(this.outputBuffer.get(analysisId));
				analysisStore.updateAnalysisProgress('error', uiState.progress, uiState.message);
				analysisStore.completeAnalysisProgress(
					false,
					'Analysis failed: Failed to optimize likelihood function'
				);
			}, 5000);

			return;
		}

		// Simulate progressing through each phase
		let timeOffset = 0;

		phases.forEach((phase) => {
			// Update the state at the start of this phase
			setTimeout(() => {
				// Update the analysis state
				const analysisState = this.runningAnalyses.get(analysisId);
				if (analysisState && analysisState.isRunning !== false) {
					analysisState.status = phase.id;
					this.runningAnalyses.set(analysisId, analysisState);

					// Add phase start message to the output buffer
					if (phase.messages && phase.messages.length > 0) {
						const currentOutput = this.outputBuffer.get(analysisId) || '';
						this.outputBuffer.set(analysisId, currentOutput + '\n' + phase.messages[0]);

						// Update the UI based on the current output
						const uiState = hyphyOutputParser.mapToUIState(this.outputBuffer.get(analysisId));
						analysisStore.updateAnalysisProgress(uiState.status, uiState.progress, uiState.message);
					}
				}
			}, timeOffset);

			// If there are additional messages in this phase, schedule them
			if (phase.messages && phase.messages.length > 1) {
				const messageInterval = phase.duration / phase.messages.length;

				for (let i = 1; i < phase.messages.length; i++) {
					setTimeout(
						() => {
							// Check if the analysis is still running
							const analysisState = this.runningAnalyses.get(analysisId);
							if (analysisState && analysisState.isRunning !== false) {
								// Add message to the output buffer
								const currentOutput = this.outputBuffer.get(analysisId) || '';
								this.outputBuffer.set(analysisId, currentOutput + '\n' + phase.messages[i]);

								// Update the UI based on the current output
								const uiState = hyphyOutputParser.mapToUIState(this.outputBuffer.get(analysisId));
								analysisStore.updateAnalysisProgress(
									uiState.status,
									uiState.progress,
									uiState.message
								);
							}
						},
						timeOffset + i * messageInterval
					);
				}
			}

			// Move to the next phase
			timeOffset += phase.duration;
		});

		// Mark as completed at the end
		setTimeout(() => {
			// Update the analysis state
			const analysisState = this.runningAnalyses.get(analysisId);
			if (analysisState && analysisState.isRunning !== false) {
				analysisState.status = 'completed';
				analysisState.result = {
					method: options.method || 'FEL',
					sites: 459,
					positiveSelectionCount: 3,
					negativeSelectionCount: 42,
					neutralCount: 414,
					executionTime: '00:22',
					pValue: options.pValue || 0.05
				};
				this.runningAnalyses.set(analysisId, analysisState);

				// Update the store
				const uiState = hyphyOutputParser.mapToUIState(this.outputBuffer.get(analysisId));
				analysisStore.updateAnalysisProgress('completed', 100, uiState.message);
				analysisStore.completeAnalysisProgress(true, 'Analysis completed successfully');
			}
		}, timeOffset);

		return timeOffset; // Return the expected duration for testing
	}

	/**
	 * Stop a running analysis
	 * @param {string} analysisId - The ID of the analysis to stop
	 * @returns {boolean} - Whether the analysis was successfully stopped
	 */
	stopAnalysis(analysisId) {
		const analysisState = this.runningAnalyses.get(analysisId);
		if (!analysisState) {
			return false;
		}

		// Stop the worker if it exists
		if (analysisState.worker) {
			analysisState.worker.terminate();
		}

		// Mark as stopped
		analysisState.isRunning = false;
		this.runningAnalyses.set(analysisId, analysisState);

		// Update the store
		analysisStore.updateAnalysisProgress('error', 0, 'Analysis was stopped by user');
		analysisStore.completeAnalysisProgress(false, 'Analysis was stopped by user');

		return true;
	}

	/**
	 * Clean up resources associated with an analysis
	 * @param {string} analysisId - The ID of the analysis to clean up
	 */
	cleanupAnalysis(analysisId) {
		const analysisState = this.runningAnalyses.get(analysisId);
		if (!analysisState) {
			return;
		}

		// Clear any intervals
		if (analysisState.completionInterval) {
			clearInterval(analysisState.completionInterval);
		}

		// Stop the worker if it's still running
		if (analysisState.worker) {
			analysisState.worker.terminate();
		}

		// Remove from our tracking maps
		this.runningAnalyses.delete(analysisId);
		this.outputBuffer.delete(analysisId);
	}

	/**
	 * Start the status checker interval
	 */
	startStatusChecker() {
		if (this.statusCheckInterval) {
			clearInterval(this.statusCheckInterval);
		}

		// Check the status of all running analyses every 2 seconds
		this.statusCheckInterval = setInterval(() => {
			for (const [analysisId, analysisState] of this.runningAnalyses.entries()) {
				// Skip analyses that are already complete or in error state
				if (analysisState.status === 'completed' || analysisState.status === 'error') {
					continue;
				}

				// Check if the analysis has been running too long
				const runningTime = Date.now() - analysisState.startTime;
				const MAX_RUNNING_TIME = 3600000; // 1 hour in milliseconds

				if (runningTime > MAX_RUNNING_TIME) {
					// Mark as error due to timeout
					analysisState.status = 'error';
					analysisState.error = new Error('Analysis timed out after 1 hour');
					this.runningAnalyses.set(analysisId, analysisState);

					// Update the store
					analysisStore.updateAnalysisProgress('error', 0, 'Analysis timed out after 1 hour');
					analysisStore.completeAnalysisProgress(false, 'Analysis timed out after 1 hour');

					// Clean up
					this.cleanupAnalysis(analysisId);
				}
			}
		}, 2000);
	}

	/**
	 * Stop the status checker interval
	 */
	stopStatusChecker() {
		if (this.statusCheckInterval) {
			clearInterval(this.statusCheckInterval);
			this.statusCheckInterval = null;
		}
	}
}

// Export a singleton instance
export const hyPhyAnalysisRunner = new HyPhyAnalysisRunner();

export default hyPhyAnalysisRunner;
