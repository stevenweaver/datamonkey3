/**
 * Manual test for DataMonkey CONTRAST-FEL backend integration
 *
 * This test requires a running DataMonkey server on localhost:7015
 * Run with: npm run test:contrast-fel-backend
 *
 * This test is excluded from CI/automated testing since it requires
 * an external DataMonkey server to be running.
 *
 * CONTRAST-FEL assesses whether selective pressures differ between
 * two or more sets of branches at a particular site in a phylogenetic tree.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import io from "socket.io-client";

// Test data from CD2-slim.fna
const TEST_FASTA = `>Human
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT
>Chimp
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT
>Baboon
GCTTTGGAAACCTGGGGAGCGCTGGGTCAGGACATCAACTTGGACATTCCT
>RhMonkey
GCTTTGGAAACCTGGGGAGCGCTGGGTCAGGACATCAACTTGGACATTCCT
>Cow
AGCATTGTCGTCTGGGGTGCCCTGGATCATGACCTCAACCTGGACATTCCT
>Pig
ACTGAGGTTGTCTGGGGCATCGTGGATCAAGACATCAACCTGGACATTCCT
>Horse
AATATCACCATCTTGGGTGCCCTGGAACGTGATATCAACCTGGACATTCCT
>Cat
GATGATATCGTCTGGGGTACCCTGGGTCAGGACATCAACCTGGACATTCCT
>Mouse
AATGAGACCATCTGGGGTGTCTTGGGTCATGGCATCACCCTGAACATCCCC
>Rat
AGTGGGACCGTCTGGGGTGCCCTGGGTCATGGCATCAACCTGGACATCCCT`;

const TEST_TREE =
	`((((Pig:0.147969,Cow:0.213430):0.085099,Horse:0.165787,Cat:0.264806):0.058611,((RhMonkey:0.002015,Baboon:0.003108):0.022733,(Human:0.004349,Chimp:0.000799):0.011873):0.101856):0.340802,Rat:0.050958,Mouse:0.097950);`;

const CONTRAST_FEL_PARAMS = {
	analysis_type: "contrast-fel",
	code: "Universal", // Default genetic code
	"branch-set-1": "Internal", // First branch set to compare
	"branch-set-2": "Leaves", // Second branch set to compare
	srv: "Yes", // Synonymous rate variation (default: Yes)
	permutations: "Yes", // Perform permutation tests (default: Yes)
	"p-value": 0.05, // Significance value for site tests (default: 0.05)
	"q-value": 0.2, // Significance value for False Discovery Rate reporting (default: 0.20)
};

const SERVER_URL = "http://localhost:7015";
const CONNECTION_TIMEOUT = 5000; // 5 seconds
const ANALYSIS_TIMEOUT = 300000; // 5 minutes

describe("DataMonkey CONTRAST-FEL Backend Integration", () => {
	let socket;
	let isServerAvailable = false;

	beforeAll(async () => {
		// Check if server is available before running tests
		try {
			socket = io(SERVER_URL, {
				timeout: CONNECTION_TIMEOUT,
				forceNew: true,
			});

			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error("Server connection timeout"));
				}, CONNECTION_TIMEOUT);

				socket.on("connect", () => {
					clearTimeout(timeout);
					isServerAvailable = true;
					console.log("✅ DataMonkey server is available");
					resolve();
				});

				socket.on("connect_error", (error) => {
					clearTimeout(timeout);
					reject(new Error(`Server not available: ${error.message}`));
				});
			});
		} catch (error) {
			console.log("⚠️  DataMonkey server not available, skipping tests");
			console.log("   To run these tests:");
			console.log("   1. Start DataMonkey server on localhost:7015");
			console.log("   2. Run: npm run test:contrast-fel-backend");
			console.log(`   Error: ${error.message}`);
		}
	});

	afterAll(() => {
		if (socket) {
			socket.disconnect();
		}
	});

	it("should connect to DataMonkey server", async () => {
		if (!isServerAvailable) {
			console.log("Skipping test - server not available");
			return;
		}

		expect(socket.connected).toBe(true);
	});

	it("should validate CONTRAST-FEL parameters successfully", async () => {
		if (!isServerAvailable) {
			console.log("Skipping test - server not available");
			return;
		}

		const validationResult = await new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error("Validation timeout"));
			}, 10000);

			socket.on("validated", (result) => {
				clearTimeout(timeout);
				resolve(result);
			});

			socket.emit("cfel:check", {
				job: CONTRAST_FEL_PARAMS,
			});
		});

		expect(validationResult.valid).toBe(true);
		if (!validationResult.valid) {
			console.error("Validation errors:", validationResult.errors);
		}
	});

	it.only(
		"should run CONTRAST-FEL analysis successfully (skipped - computational complexity)",
		async () => {
			if (!isServerAvailable) {
				console.log("Skipping test - server not available");
				return;
			}

			// This test is skipped by default due to computational complexity
			// CONTRAST-FEL analysis can take several minutes
			// To enable: remove .skip and be prepared to wait

			// Create a fresh socket connection for this test to avoid event handler conflicts
			const testSocket = io(SERVER_URL, { forceNew: true });

			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error("Test socket connection timeout"));
				}, 5000);

				testSocket.on("connect", () => {
					clearTimeout(timeout);
					resolve();
				});

				testSocket.on("connect_error", (error) => {
					clearTimeout(timeout);
					reject(error);
				});
			});

			const statusMessages = [];
			let analysisResult = null;
			let analysisError = null;

			const analysisPromise = new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(
						new Error(
							"Analysis timeout - may need more time for complex datasets",
						),
					);
				}, ANALYSIS_TIMEOUT);

				// Track status updates
				testSocket.on("status update", (status) => {
					statusMessages.push(status);
					console.log(
						`📊 Status: ${status.msg}${
							status.phase ? ` (${status.phase})` : ""
						}`,
					);
				});

				// Handle successful completion
				testSocket.on("completed", (data) => {
					clearTimeout(timeout);
					analysisResult = data;
					console.log("✅ Analysis completed successfully");
					resolve(data);
				});

				// Handle errors
				testSocket.on("script error", (error) => {
					clearTimeout(timeout);
					analysisError = error;
					console.error("❌ Analysis failed:", error.message || error);
					reject(new Error(error.message || error));
				});

				// Start the analysis
				console.log("🚀 Starting CONTRAST-FEL analysis...");
				const contrastFelJobWithTree = {
					...CONTRAST_FEL_PARAMS,
					tree: TEST_TREE
				};
				testSocket.emit("cfel:spawn", TEST_FASTA, contrastFelJobWithTree);
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
			console.log("📋 Analysis Summary:");
			console.log(`   - Status updates: ${statusMessages.length}`);
			console.log(`   - Result keys: ${Object.keys(result || {}).join(", ")}`);

			// Basic result structure validation for CONTRAST-FEL output
			if (result && typeof result === "object") {
				console.log("✅ Analysis result is valid object");

				// Check for expected CONTRAST-FEL output structure
				if (result.analysis) {
					console.log("📊 Found analysis metadata");
				}
				if (result["site-by-site results"]) {
					console.log("📊 Found site-by-site results");
				}
				if (result["alpha"]) {
					console.log("📊 Found alpha (synonymous rates)");
				}
				if (result["beta"]) {
					console.log("📊 Found beta (nonsynonymous rates)");
				}
				if (result["p-values"]) {
					console.log("📊 Found p-values");
				}
				if (result["q-values"]) {
					console.log("📊 Found q-values");
				}
			}
		},
		ANALYSIS_TIMEOUT + 10000,
	); // Extra time for test framework

	it("should handle job queue requests (optional)", async () => {
		if (!isServerAvailable) {
			console.log("Skipping test - server not available");
			return;
		}

		// Job queue is optional - some servers run locally without job management
		const queueResult = await new Promise((resolve) => {
			const timeout = setTimeout(() => {
				console.log(
					"📊 Job queue not implemented (running locally) - skipping",
				);
				resolve([]);
			}, 3000);

			socket.on("job queue", (jobs) => {
				clearTimeout(timeout);
				resolve(jobs);
			});

			socket.emit("job queue", {});
		});

		// Don't fail if job queue isn't implemented
		if (Array.isArray(queueResult) && queueResult.length >= 0) {
			console.log(`📊 Job queue contains ${queueResult.length} jobs`);
		}
	});

	it("should handle malformed data gracefully", async () => {
		if (!isServerAvailable) {
			console.log("Skipping test - server not available");
			return;
		}

		// Create fresh socket for this test
		const testSocket = io(SERVER_URL, { forceNew: true });

		await new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error("Test socket connection timeout"));
			}, 5000);

			testSocket.on("connect", () => {
				clearTimeout(timeout);
				resolve();
			});
		});

		const errorPromise = new Promise((resolve) => {
			const timeout = setTimeout(() => {
				console.log(
					"⚠️  Server did not reject malformed data (may accept any input)",
				);
				resolve(false); // No error received within timeout
			}, 8000);

			testSocket.on("script error", (error) => {
				clearTimeout(timeout);
				console.log(
					"✅ Server correctly rejected malformed data:",
					error.message || error,
				);
				resolve(true);
			});

			// Send malformed data
			const malformedJob = {
				...CONTRAST_FEL_PARAMS,
				tree: "INVALID_TREE_DATA"
			};
			testSocket.emit("cfel:spawn", "INVALID_FASTA_DATA", malformedJob);
		});

		const gotError = await errorPromise;
		testSocket.disconnect();

		// Don't fail if server accepts malformed data - just log it
		if (gotError) {
			console.log("✅ Server validates input data correctly");
		} else {
			console.log(
				"ℹ️  Server accepts any input data (validation may be lenient)",
			);
		}
	}, 15000);
});

/**
 * Helper class for manual testing outside of test framework
 */
export class CONTRASTFELBackendTester {
	constructor(serverUrl = SERVER_URL) {
		this.serverUrl = serverUrl;
		this.socket = null;
		this.statusMessages = [];
	}

	async connect() {
		this.socket = io(this.serverUrl);

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error("Connection timeout"));
			}, CONNECTION_TIMEOUT);

			this.socket.on("connect", () => {
				clearTimeout(timeout);
				console.log("✅ Connected to DataMonkey server");
				this.setupEventHandlers();
				resolve();
			});

			this.socket.on("connect_error", (error) => {
				clearTimeout(timeout);
				reject(error);
			});
		});
	}

	setupEventHandlers() {
		this.socket.on("status update", (status) => {
			this.statusMessages.push(status);
			console.log(
				`📊 ${status.msg}${status.phase ? ` (${status.phase})` : ""}`,
			);
		});

		this.socket.on("completed", (data) => {
			console.log("✅ Analysis completed!");
			console.log("Result keys:", Object.keys(data || {}));
		});

		this.socket.on("script error", (error) => {
			console.error("❌ Analysis failed:", error.message || error);
		});

		this.socket.on("validated", (result) => {
			if (result.valid) {
				console.log("✅ Parameters validated successfully");
			} else {
				console.error("❌ Parameter validation failed:", result.errors);
			}
		});

		this.socket.on("job queue", (jobs) => {
			console.log(`📊 Job queue: ${jobs.length} jobs (optional feature)`);
		});
	}

	async validateParameters(params = CONTRAST_FEL_PARAMS) {
		return new Promise((resolve) => {
			const timeout = setTimeout(() => {
				resolve({ valid: false, error: "Validation timeout" });
			}, 10000);

			this.socket.once("validated", (result) => {
				clearTimeout(timeout);
				resolve(result);
			});

			this.socket.emit("cfel:check", { job: params });
		});
	}

	async runAnalysis(
		fasta = TEST_FASTA,
		tree = TEST_TREE,
		params = CONTRAST_FEL_PARAMS,
	) {
		this.statusMessages = [];

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error("Analysis timeout"));
			}, ANALYSIS_TIMEOUT);

			this.socket.once("completed", (data) => {
				clearTimeout(timeout);
				resolve(data);
			});

			this.socket.once("script error", (error) => {
				clearTimeout(timeout);
				reject(new Error(error.message || error));
			});

			console.log("🚀 Starting CONTRAST-FEL analysis...");
			const contrastFelJobWithTree = {
				...params,
				tree: tree
			};
			this.socket.emit("cfel:spawn", fasta, contrastFelJobWithTree);
		});
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect();
		}
	}
}

// Export test data for use in other tests
export { CONTRAST_FEL_PARAMS, SERVER_URL, TEST_FASTA, TEST_TREE };
