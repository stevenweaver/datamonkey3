/**
 * Playwright-based cross-browser WASM benchmark automation
 *
 * Runs HyPhy WASM benchmarks across multiple browsers (Chrome, Firefox, WebKit)
 * and collects timing data with statistical rigor for paper comparison.
 *
 * Usage:
 *   npx playwright test src/benchmark/benchmark.spec.ts --project=chromium
 *   npx playwright test src/benchmark/benchmark.spec.ts --project=firefox
 *   npx playwright test src/benchmark/benchmark.spec.ts --project=webkit
 *
 * Or run all browsers:
 *   npx playwright test src/benchmark/benchmark.spec.ts
 */

import { test, expect, type Page, type BrowserContext, type Browser } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BENCHMARK_CONFIG = {
	// Methods to benchmark (selection pressure methods only)
	methods: ['fel', 'meme', 'slac'] as const,

	// Alignments to test (subset for faster CI runs)
	alignments: ['tiny', 'small', 'medium'] as const,

	// Number of iterations per test
	iterations: 5,

	// Timeout per iteration (10 minutes max)
	iterationTimeout: 600000,

	// Output directory for results
	outputDir: path.resolve(__dirname, '../../benchmark-results'),

	// HyPhy initialization timeout
	initTimeout: 60000
};

// Test alignment metadata
const TEST_ALIGNMENTS = {
	tiny: { sequences: 10, sites: 150, filename: 'tiny.nex' },
	small: { sequences: 25, sites: 300, filename: 'small.nex' },
	'medium-narrow': { sequences: 50, sites: 201, filename: 'medium-narrow.nex' },
	medium: { sequences: 50, sites: 501, filename: 'medium.nex' },
	'medium-wide': { sequences: 25, sites: 999, filename: 'medium-wide.nex' },
	'large-narrow': { sequences: 100, sites: 300, filename: 'large-narrow.nex' },
	large: { sequences: 100, sites: 600, filename: 'large.nex' },
	xlarge: { sequences: 200, sites: 450, filename: 'xlarge.nex' }
};

type AlignmentId = keyof typeof TEST_ALIGNMENTS;
type MethodId = (typeof BENCHMARK_CONFIG.methods)[number];

interface BenchmarkIteration {
	iteration: number;
	runtimeMs: number;
	success: boolean;
	error?: string;
}

interface BenchmarkResult {
	browser: string;
	browserVersion: string;
	method: MethodId;
	alignment: AlignmentId;
	sequences: number;
	sites: number;
	iterations: BenchmarkIteration[];
	statistics: {
		n: number;
		mean: number;
		stdDev: number;
		standardError: number;
		ci95: [number, number];
		min: number;
		max: number;
		median: number;
		cv: number;
	};
	hardware: {
		cores: number;
		memoryGB: number | null;
		platform: string;
		userAgent: string;
	};
	timestamp: string;
	sampleResultPath?: string;
}

// Calculate statistics
function calculateStatistics(times: number[]) {
	const n = times.length;
	if (n === 0) {
		return { n: 0, mean: 0, stdDev: 0, standardError: 0, ci95: [0, 0] as [number, number], min: 0, max: 0, median: 0, cv: 0 };
	}

	const sorted = [...times].sort((a, b) => a - b);
	const mean = times.reduce((sum, t) => sum + t, 0) / n;
	const variance = n > 1 ? times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / (n - 1) : 0;
	const stdDev = Math.sqrt(variance);
	const standardError = stdDev / Math.sqrt(n);
	const ci95: [number, number] = [mean - 1.96 * standardError, mean + 1.96 * standardError];
	const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

	return {
		n,
		mean,
		stdDev,
		standardError,
		ci95,
		min: sorted[0],
		max: sorted[n - 1],
		median,
		cv: mean > 0 ? (stdDev / mean) * 100 : 0
	};
}

// Ensure output directory exists
function ensureOutputDir() {
	if (!fs.existsSync(BENCHMARK_CONFIG.outputDir)) {
		fs.mkdirSync(BENCHMARK_CONFIG.outputDir, { recursive: true });
	}
}

// Save benchmark result
function saveResult(result: BenchmarkResult) {
	ensureOutputDir();
	const filename = `wasm-${result.browser}-${result.alignment}-${result.method}-${Date.now()}.json`;
	const filepath = path.join(BENCHMARK_CONFIG.outputDir, filename);
	fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
	return filepath;
}

// Page helper: Initialize HyPhy WASM
async function initializeHyPhy(page: Page): Promise<{ version: string; hardware: BenchmarkResult['hardware'] }> {
	// Inject Aioli script
	await page.addScriptTag({
		url: 'https://cdn.jsdelivr.net/npm/@biowasm/aioli@3.2.1/dist/aioli.js'
	});

	// Initialize HyPhy and get hardware info
	const result = await page.evaluate(async () => {
		const cli = await new (window as any).Aioli(
			{
				tool: 'hyphy',
				version: '2.5.63',
				urlPrefix: 'https://data.hyphy.org/web/biowasm'
			},
			{ printInterleaved: false }
		);

		const versionResult = await cli.exec('hyphy --version');
		const version = versionResult.stdout.trim().split('\n')[0];

		// Store CLI object globally
		(window as any).__hyphyCli = cli;

		return {
			version,
			hardware: {
				cores: navigator.hardwareConcurrency || 0,
				memoryGB: (navigator as any).deviceMemory || null,
				platform: navigator.platform,
				userAgent: navigator.userAgent
			}
		};
	});

	return result;
}

// Page helper: Run single benchmark iteration
async function runIteration(page: Page, method: MethodId, alignmentData: string): Promise<{ runtimeMs: number; jsonResult: any }> {
	return await page.evaluate(
		async ({ method, alignmentData }) => {
			const cli = (window as any).__hyphyCli;
			if (!cli) throw new Error('HyPhy CLI not initialized');

			// Mount alignment file
			const inputFiles = await cli.mount([{ name: 'user.nex', data: alignmentData }]);

			// Run analysis
			const command = `hyphy LIBPATH=/shared/hyphy/ ${method} ${inputFiles[0]}`;
			const startTime = performance.now();
			const result = await cli.exec(command);
			await result.stdout;
			const endTime = performance.now();

			// Try to get JSON result
			let jsonResult = null;
			try {
				const jsonBlob = await cli.download(`/shared/data/user.nex.${method.toUpperCase()}.json`);
				const response = await fetch(jsonBlob);
				const blob = await response.blob();
				const jsonText = await blob.text();
				jsonResult = JSON.parse(jsonText);
			} catch (err) {
				// JSON may not be available
			}

			return {
				runtimeMs: endTime - startTime,
				jsonResult
			};
		},
		{ method, alignmentData }
	);
}

// Main test suite
test.describe('WASM Browser Benchmarks', () => {
	// Increase test timeout for benchmarks
	test.setTimeout(BENCHMARK_CONFIG.iterationTimeout * BENCHMARK_CONFIG.iterations + 120000);

	for (const alignment of BENCHMARK_CONFIG.alignments) {
		for (const method of BENCHMARK_CONFIG.methods) {
			test(`benchmark ${method.toUpperCase()} on ${alignment}`, async ({ page, browserName }) => {
				const alignmentInfo = TEST_ALIGNMENTS[alignment];

				// Navigate to a blank page
				await page.goto('about:blank');

				// Initialize HyPhy
				console.log(`Initializing HyPhy WASM for ${browserName}...`);
				const { version, hardware } = await initializeHyPhy(page);
				console.log(`HyPhy ${version} initialized`);

				// Load alignment file
				const alignmentPath = path.join(__dirname, 'test-alignments', alignmentInfo.filename);
				if (!fs.existsSync(alignmentPath)) {
					throw new Error(`Alignment file not found: ${alignmentPath}`);
				}
				const alignmentData = fs.readFileSync(alignmentPath, 'utf-8');

				// Run benchmark iterations
				const iterations: BenchmarkIteration[] = [];
				let sampleResult: any = null;

				console.log(`Running ${BENCHMARK_CONFIG.iterations} iterations of ${method.toUpperCase()} on ${alignment}...`);

				for (let i = 1; i <= BENCHMARK_CONFIG.iterations; i++) {
					console.log(`  Iteration ${i}/${BENCHMARK_CONFIG.iterations}...`);

					try {
						const result = await runIteration(page, method, alignmentData);

						iterations.push({
							iteration: i,
							runtimeMs: result.runtimeMs,
							success: true
						});

						// Store first successful result for concordance
						if (result.jsonResult && !sampleResult) {
							sampleResult = result.jsonResult;
						}

						console.log(`    Completed in ${result.runtimeMs.toFixed(2)} ms`);
					} catch (err) {
						const errorMessage = err instanceof Error ? err.message : String(err);
						iterations.push({
							iteration: i,
							runtimeMs: 0,
							success: false,
							error: errorMessage
						});
						console.log(`    FAILED: ${errorMessage}`);
					}
				}

				// Calculate statistics
				const successfulTimes = iterations.filter((i) => i.success).map((i) => i.runtimeMs);
				const statistics = calculateStatistics(successfulTimes);

				// Build result object
				const benchmarkResult: BenchmarkResult = {
					browser: browserName,
					browserVersion: hardware.userAgent,
					method,
					alignment,
					sequences: alignmentInfo.sequences,
					sites: alignmentInfo.sites,
					iterations,
					statistics,
					hardware,
					timestamp: new Date().toISOString()
				};

				// Save sample result for concordance checking
				if (sampleResult) {
					ensureOutputDir();
					const samplePath = path.join(
						BENCHMARK_CONFIG.outputDir,
						`sample-${browserName}-${alignment}-${method}.json`
					);
					fs.writeFileSync(samplePath, JSON.stringify(sampleResult, null, 2));
					benchmarkResult.sampleResultPath = samplePath;
				}

				// Save benchmark result
				const resultPath = saveResult(benchmarkResult);
				console.log(`Results saved to: ${resultPath}`);

				// Log summary
				console.log(`\nSummary for ${method.toUpperCase()} on ${alignment} (${browserName}):`);
				console.log(`  n: ${statistics.n}`);
				console.log(`  Mean: ${statistics.mean.toFixed(2)} ms`);
				console.log(`  SE: ${statistics.standardError.toFixed(2)} ms`);
				console.log(`  95% CI: [${statistics.ci95[0].toFixed(2)}, ${statistics.ci95[1].toFixed(2)}] ms`);
				console.log(`  CV: ${statistics.cv.toFixed(1)}%`);

				// Assertions
				expect(statistics.n).toBeGreaterThan(0);
				expect(statistics.mean).toBeGreaterThan(0);
			});
		}
	}
});

// Separate test for full benchmark suite (all alignments, methods, browsers)
test.describe('Full Benchmark Suite', () => {
	test.skip('run full suite', async ({ page, browserName }) => {
		// This test is skipped by default - run with:
		// npx playwright test --grep "run full suite" --project=chromium

		test.setTimeout(3600000); // 1 hour timeout

		const allAlignments = Object.keys(TEST_ALIGNMENTS) as AlignmentId[];
		const results: BenchmarkResult[] = [];

		// Navigate to blank page
		await page.goto('about:blank');

		// Initialize HyPhy
		const { version, hardware } = await initializeHyPhy(page);
		console.log(`HyPhy ${version} initialized on ${browserName}`);

		for (const alignment of allAlignments) {
			const alignmentInfo = TEST_ALIGNMENTS[alignment];
			const alignmentPath = path.join(__dirname, 'test-alignments', alignmentInfo.filename);

			if (!fs.existsSync(alignmentPath)) {
				console.log(`Skipping ${alignment}: file not found`);
				continue;
			}

			const alignmentData = fs.readFileSync(alignmentPath, 'utf-8');

			for (const method of BENCHMARK_CONFIG.methods) {
				console.log(`\nBenchmarking ${method.toUpperCase()} on ${alignment}...`);

				const iterations: BenchmarkIteration[] = [];

				for (let i = 1; i <= BENCHMARK_CONFIG.iterations; i++) {
					try {
						const result = await runIteration(page, method, alignmentData);
						iterations.push({
							iteration: i,
							runtimeMs: result.runtimeMs,
							success: true
						});
						console.log(`  Iteration ${i}: ${result.runtimeMs.toFixed(2)} ms`);
					} catch (err) {
						iterations.push({
							iteration: i,
							runtimeMs: 0,
							success: false,
							error: err instanceof Error ? err.message : String(err)
						});
						console.log(`  Iteration ${i}: FAILED`);
					}
				}

				const successfulTimes = iterations.filter((i) => i.success).map((i) => i.runtimeMs);
				const statistics = calculateStatistics(successfulTimes);

				const result: BenchmarkResult = {
					browser: browserName,
					browserVersion: hardware.userAgent,
					method,
					alignment,
					sequences: alignmentInfo.sequences,
					sites: alignmentInfo.sites,
					iterations,
					statistics,
					hardware,
					timestamp: new Date().toISOString()
				};

				results.push(result);
				saveResult(result);
			}
		}

		// Save combined results
		ensureOutputDir();
		const combinedPath = path.join(
			BENCHMARK_CONFIG.outputDir,
			`full-suite-${browserName}-${Date.now()}.json`
		);
		fs.writeFileSync(combinedPath, JSON.stringify(results, null, 2));
		console.log(`\nFull suite results saved to: ${combinedPath}`);
	});
});
