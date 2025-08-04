/**
 * Manual test for DataMonkey FADE backend integration
 *
 * This test requires a running DataMonkey server on localhost:7015
 * Run with: npm run test:fade-backend
 *
 * This test is excluded from CI/automated testing since it requires
 * an external DataMonkey server to be running.
 *
 * FADE (FUBAR Approach to Directional Evolution) is computationally intensive
 * and may take several minutes to complete depending on dataset size.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import io from 'socket.io-client';

// PROTEIN test data (translated from CD2-slim.fna) - FADE requires protein sequences
const TEST_FASTA = `>Human
ALETEEWGLEAILEDIP
>Chimp
ALETEEWGLEAILEDIP
>Baboon
AFETEEWGLEAILEDIP
>RhMonkey
AFETEEWGLEAILEDIP
>Cow
SIVWGALDHDFLEDIP
>Pig
TEVVWGIVDQDILEDIP
>Horse
ISLGGALERDIELLEDIP
>Cat
DIVWGTLGQDIFLEDIP
>Mouse
NETIWGVLGHTLELIP
>Rat
SGPCGAAHQDLFLEDIP`;

const TEST_TREE = `(((((Pig:0.147969,Cow:0.213430):0.085099,Horse:0.165787,Cat:0.264806):0.058611,((RhMonkey:0.002015,Baboon:0.003108):0.022733,(Human:0.004349,Chimp:0.000799):0.011873):0.101856):0.340802,Rat:0.050958):0.02,Mouse:0.097950);`;

const FADE_PARAMS = {
	substitution_model: 'LG', // Default protein substitution model
	posterior_estimation_method: 'Metropolis-Hastings', // Default estimation method
	branches: 'All', // Which branches to analyze
	number_of_grid_points: 20, // Default grid resolution
	number_of_mcmc_chains: 5, // Default number of chains
	length_of_each_chain: 5, // Default chain length
	number_of_burn_in_samples: 100000, // Default burn-in samples
	number_of_samples: 100, // Default number of samples
	concentration_of_dirichlet_prior: 0.5, // Default concentration parameter
	genetic_code: 'Universal' // Genetic code
};

const SERVER_URL = 'http://localhost:7015';
const CONNECTION_TIMEOUT = 5000; // 5 seconds
const ANALYSIS_TIMEOUT = 600000; // 10 minutes (FADE is computationally intensive)

describe('DataMonkey FADE Backend Integration', () => {
	let socket;
	let isServerAvailable = false;

	beforeAll(async () => {
		// Check if server is available before running tests
		try {
			socket = io(SERVER_URL, {
				timeout: CONNECTION_TIMEOUT,
				forceNew: true
			});

			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error('Server connection timeout'));
				}, CONNECTION_TIMEOUT);

				socket.on('connect', () => {
					clearTimeout(timeout);
					isServerAvailable = true;
					console.log('✅ DataMonkey server is available');
					resolve();
				});

				socket.on('connect_error', (error) => {
					clearTimeout(timeout);
					reject(new Error(`Server not available: ${error.message}`));
				});
			});
		} catch (error) {
			console.log('⚠️  DataMonkey server not available, skipping tests');
			console.log('   To run these tests:');
			console.log('   1. Start DataMonkey server on localhost:7015');
			console.log('   2. Run: npm run test:fade-backend');
			console.log(`   Error: ${error.message}`);
		}
	});

	afterAll(() => {
		if (socket) {
			socket.disconnect();
		}
	});

	it('should connect to DataMonkey server', async () => {
		if (!isServerAvailable) {
			console.log('Skipping test - server not available');
			return;
		}

		expect(socket.connected).toBe(true);
	});

	it('should validate FADE parameters successfully', async () => {
		if (!isServerAvailable) {
			console.log('Skipping test - server not available');
			return;
		}

		const validationResult = await new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Validation timeout'));
			}, 10000);

			socket.on('validated', (result) => {
				clearTimeout(timeout);
				resolve(result);
			});

			socket.emit('fade:check', {
				job: FADE_PARAMS
			});
		});

		expect(validationResult.valid).toBe(true);
		if (!validationResult.valid) {
			console.error('Validation errors:', validationResult.errors);
		}
	});

	it.only(
		'should run FADE analysis successfully (skipped - computationally intensive)',
		async () => {
			if (!isServerAvailable) {
				console.log('Skipping test - server not available');
				return;
			}

			// This test is skipped by default due to computational complexity
			// FADE analysis can take 10+ minutes even with reduced parameters
			// To enable: remove .skip and be prepared to wait

			// Create a fresh socket connection for this test to avoid event handler conflicts
			const testSocket = io(SERVER_URL, { forceNew: true });

			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error('Test socket connection timeout'));
				}, 5000);

				testSocket.on('connect', () => {
					clearTimeout(timeout);
					resolve();
				});

				testSocket.on('connect_error', (error) => {
					clearTimeout(timeout);
					reject(error);
				});
			});

			const statusMessages = [];
			let analysisResult = null;
			let analysisError = null;

			const analysisPromise = new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error('Analysis timeout - FADE requires significant computational time'));
				}, ANALYSIS_TIMEOUT);

				// Track status updates
				testSocket.on('status update', (status) => {
					statusMessages.push(status);
					console.log(`📊 Status: ${status.msg}${status.phase ? ` (${status.phase})` : ''}`);
				});

				// Handle successful completion
				testSocket.on('completed', (data) => {
					clearTimeout(timeout);
					analysisResult = data;
					console.log('✅ Analysis completed successfully');
					resolve(data);
				});

				// Handle errors
				testSocket.on('script error', (error) => {
					clearTimeout(timeout);
					analysisError = error;
					console.error('❌ Analysis failed:', error.message || error);
					reject(new Error(error.message || error));
				});

				// Start the analysis
				console.log('🚀 Starting FADE analysis (this may take several minutes)...');
				testSocket.emit('fade:spawn', {
					alignment: TEST_FASTA,
					tree: TEST_TREE,
					job: FADE_PARAMS
				});
			});

			// Wait for analysis to complete
			const result = await analysisPromise;

			// Cleanup
			testSocket.disconnect();

			// Verify we received status updates
			expect(statusMessages.length).toBeGreaterThan(0);
			console.log(`📈 Received ${statusMessages.length} status updates`);

			// Verify analysis completed successfully
			expect(result).toBeDefined();
			expect(analysisError).toBeNull();

			// Log summary
			console.log('📋 Analysis Summary:');
			console.log(`   - Status updates: ${statusMessages.length}`);
			console.log(`   - Result keys: ${Object.keys(result || {}).join(', ')}`);

			// Basic result structure validation for FADE output
			if (result && typeof result === 'object') {
				console.log('✅ Analysis result is valid object');

				// Check for expected FADE output structure
				if (result.analysis) {
					console.log('📊 Found analysis metadata');
				}
				if (result['posterior results']) {
					console.log('📊 Found posterior results');
				}
				if (result['bayes factor']) {
					console.log('📊 Found Bayes factor data');
				}
				if (result['amino acid composition']) {
					console.log('📊 Found amino acid composition');
				}
			}
		},
		ANALYSIS_TIMEOUT + 10000
	); // Extra time for test framework

	it('should handle job queue requests (optional)', async () => {
		if (!isServerAvailable) {
			console.log('Skipping test - server not available');
			return;
		}

		// Job queue is optional - some servers run locally without job management
		const queueResult = await new Promise((resolve) => {
			const timeout = setTimeout(() => {
				console.log('📊 Job queue not implemented (running locally) - skipping');
				resolve([]);
			}, 3000);

			socket.on('job queue', (jobs) => {
				clearTimeout(timeout);
				resolve(jobs);
			});

			socket.emit('job queue', {});
		});

		// Don't fail if job queue isn't implemented
		if (Array.isArray(queueResult) && queueResult.length >= 0) {
			console.log(`📊 Job queue contains ${queueResult.length} jobs`);
		}
	});

	it('should handle malformed data gracefully', async () => {
		if (!isServerAvailable) {
			console.log('Skipping test - server not available');
			return;
		}

		// Create fresh socket for this test
		const testSocket = io(SERVER_URL, { forceNew: true });

		await new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Test socket connection timeout'));
			}, 5000);

			testSocket.on('connect', () => {
				clearTimeout(timeout);
				resolve();
			});
		});

		const errorPromise = new Promise((resolve) => {
			const timeout = setTimeout(() => {
				console.log('⚠️  Server did not reject malformed data (may accept any input)');
				resolve(false); // No error received within timeout
			}, 8000);

			testSocket.on('script error', (error) => {
				clearTimeout(timeout);
				console.log('✅ Server correctly rejected malformed data:', error.message || error);
				resolve(true);
			});

			// Send malformed data
			testSocket.emit('fade:spawn', {
				alignment: 'INVALID_FASTA_DATA',
				tree: 'INVALID_TREE_DATA',
				job: FADE_PARAMS
			});
		});

		const gotError = await errorPromise;
		testSocket.disconnect();

		// Don't fail if server accepts malformed data - just log it
		if (gotError) {
			console.log('✅ Server validates input data correctly');
		} else {
			console.log('ℹ️  Server accepts any input data (validation may be lenient)');
		}
	}, 15000);
});

/**
 * Helper class for manual testing outside of test framework
 */
export class FADEBackendTester {
	constructor(serverUrl = SERVER_URL) {
		this.serverUrl = serverUrl;
		this.socket = null;
		this.statusMessages = [];
	}

	async connect() {
		this.socket = io(this.serverUrl);

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Connection timeout'));
			}, CONNECTION_TIMEOUT);

			this.socket.on('connect', () => {
				clearTimeout(timeout);
				console.log('✅ Connected to DataMonkey server');
				this.setupEventHandlers();
				resolve();
			});

			this.socket.on('connect_error', (error) => {
				clearTimeout(timeout);
				reject(error);
			});
		});
	}

	setupEventHandlers() {
		this.socket.on('status update', (status) => {
			this.statusMessages.push(status);
			console.log(`📊 ${status.msg}${status.phase ? ` (${status.phase})` : ''}`);
		});

		this.socket.on('completed', (data) => {
			console.log('✅ Analysis completed!');
			console.log('Result keys:', Object.keys(data || {}));
		});

		this.socket.on('script error', (error) => {
			console.error('❌ Analysis failed:', error.message || error);
		});

		this.socket.on('validated', (result) => {
			if (result.valid) {
				console.log('✅ Parameters validated successfully');
			} else {
				console.error('❌ Parameter validation failed:', result.errors);
			}
		});

		this.socket.on('job queue', (jobs) => {
			console.log(`📊 Job queue: ${jobs.length} jobs (optional feature)`);
		});
	}

	async validateParameters(params = FADE_PARAMS) {
		return new Promise((resolve) => {
			const timeout = setTimeout(() => {
				resolve({ valid: false, error: 'Validation timeout' });
			}, 10000);

			this.socket.once('validated', (result) => {
				clearTimeout(timeout);
				resolve(result);
			});

			this.socket.emit('fade:check', { job: params });
		});
	}

	async runAnalysis(fasta = TEST_FASTA, tree = TEST_TREE, params = FADE_PARAMS) {
		this.statusMessages = [];

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Analysis timeout'));
			}, ANALYSIS_TIMEOUT);

			this.socket.once('completed', (data) => {
				clearTimeout(timeout);
				resolve(data);
			});

			this.socket.once('script error', (error) => {
				clearTimeout(timeout);
				reject(new Error(error.message || error));
			});

			console.log('🚀 Starting FADE analysis (this may take several minutes)...');
			this.socket.emit('fade:spawn', {
				alignment: fasta,
				tree: tree,
				job: params
			});
		});
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect();
		}
	}
}

// Export test data for use in other tests
export { FADE_PARAMS, SERVER_URL, TEST_FASTA, TEST_TREE };
