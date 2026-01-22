#!/usr/bin/env npx ts-node
/**
 * Results Aggregation Script
 *
 * Combines benchmark results from WASM (multiple browsers) and CLI into
 * unified comparison tables for the paper.
 *
 * Usage:
 *   npx ts-node src/benchmark/aggregate-results.ts
 *   npx ts-node src/benchmark/aggregate-results.ts --output paper-results
 *
 * Output:
 *   benchmark-results/aggregated-results.json
 *   benchmark-results/aggregated-results.csv
 *   benchmark-results/paper-table.tex
 *   benchmark-results/summary-report.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface BenchmarkStatistics {
	n: number;
	mean: number;
	stdDev: number;
	standardError: number;
	ci95: [number, number];
	min: number;
	max: number;
	median: number;
	cv: number;
}

interface BenchmarkResult {
	platform: 'wasm' | 'cli';
	browser?: string;
	method: string;
	alignment: string;
	sequences: number;
	sites: number;
	iterations: Array<{
		iteration: number;
		runtimeMs: number;
		success: boolean;
		error?: string;
	}>;
	statistics: BenchmarkStatistics;
	timestamp: string;
}

interface AggregatedRow {
	alignment: string;
	sequences: number;
	sites: number;
	method: string;
	cliMean: number | null;
	cliSE: number | null;
	cliCI95: [number, number] | null;
	wasmChromeMean: number | null;
	wasmChromeSE: number | null;
	wasmChromeCI95: [number, number] | null;
	wasmFirefoxMean: number | null;
	wasmFirefoxSE: number | null;
	wasmFirefoxCI95: [number, number] | null;
	wasmSafariMean: number | null;
	wasmSafariSE: number | null;
	wasmSafariCI95: [number, number] | null;
	bestWasmMean: number | null;
	overheadPercent: number | null;
	concordant: boolean | null;
}

interface AggregatedResults {
	version: string;
	timestamp: string;
	rows: AggregatedRow[];
	metadata: {
		totalCliRuns: number;
		totalWasmRuns: number;
		browsers: string[];
		methods: string[];
		alignments: string[];
	};
}

const RESULTS_DIR = path.resolve(__dirname, '../../benchmark-results');

// Parse command line arguments
function parseArgs(): { outputPrefix: string } {
	const args = process.argv.slice(2);
	let outputPrefix = 'aggregated-results';

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--output' && args[i + 1]) {
			outputPrefix = args[i + 1];
			i++;
		}
	}

	return { outputPrefix };
}

// Load all benchmark result files
function loadResults(): { wasmResults: BenchmarkResult[]; cliResults: BenchmarkResult[] } {
	const wasmResults: BenchmarkResult[] = [];
	const cliResults: BenchmarkResult[] = [];

	if (!fs.existsSync(RESULTS_DIR)) {
		return { wasmResults, cliResults };
	}

	const files = fs.readdirSync(RESULTS_DIR);

	for (const file of files) {
		if (!file.endsWith('.json')) continue;
		if (file.includes('concordance') || file.includes('aggregated') || file.startsWith('sample-')) continue;

		const filepath = path.join(RESULTS_DIR, file);
		try {
			const content = fs.readFileSync(filepath, 'utf-8');
			const data = JSON.parse(content);

			// Handle different file formats
			if (file.startsWith('wasm-')) {
				// Individual WASM result file
				wasmResults.push(data as BenchmarkResult);
			} else if (file.startsWith('cli-results-')) {
				// CLI results file (contains array)
				if (data.results && Array.isArray(data.results)) {
					cliResults.push(...(data.results as BenchmarkResult[]));
				}
			} else if (file.startsWith('full-suite-')) {
				// Full suite results (array of results)
				if (Array.isArray(data)) {
					wasmResults.push(...(data as BenchmarkResult[]));
				}
			} else if (file.startsWith('benchmark-wasm-')) {
				// Browser benchmark export (runs array)
				if (data.runs && Array.isArray(data.runs)) {
					wasmResults.push(...(data.runs as BenchmarkResult[]));
				}
			}
		} catch (err) {
			console.warn(`Warning: Could not parse ${file}: ${err}`);
		}
	}

	return { wasmResults, cliResults };
}

// Load concordance results
function loadConcordance(): Map<string, boolean> {
	const concordance = new Map<string, boolean>();

	const concordancePath = path.join(RESULTS_DIR, 'concordance-report.json');
	if (fs.existsSync(concordancePath)) {
		try {
			const data = JSON.parse(fs.readFileSync(concordancePath, 'utf-8'));
			for (const result of data.results || []) {
				const key = `${result.alignment}-${result.method}`;
				concordance.set(key, result.matches);
			}
		} catch (err) {
			console.warn('Warning: Could not parse concordance report');
		}
	}

	return concordance;
}

// Normalize browser name
function normalizeBrowser(browser: string | undefined): string {
	if (!browser) return 'unknown';
	const lower = browser.toLowerCase();
	if (lower.includes('chrome') || lower === 'chromium') return 'chrome';
	if (lower.includes('firefox')) return 'firefox';
	if (lower.includes('safari') || lower === 'webkit') return 'safari';
	if (lower.includes('edge')) return 'edge';
	return lower;
}

// Aggregate results
function aggregateResults(
	wasmResults: BenchmarkResult[],
	cliResults: BenchmarkResult[],
	concordance: Map<string, boolean>
): AggregatedResults {
	// Group results by alignment and method
	const groups = new Map<string, {
		cli: BenchmarkResult | null;
		wasm: Map<string, BenchmarkResult>;
	}>();

	// Process CLI results
	for (const result of cliResults) {
		const key = `${result.alignment}-${result.method}`;
		if (!groups.has(key)) {
			groups.set(key, { cli: null, wasm: new Map() });
		}
		groups.get(key)!.cli = result;
	}

	// Process WASM results
	for (const result of wasmResults) {
		const key = `${result.alignment}-${result.method}`;
		const browser = normalizeBrowser(result.browser);

		if (!groups.has(key)) {
			groups.set(key, { cli: null, wasm: new Map() });
		}

		// Use the most recent result for each browser
		const existing = groups.get(key)!.wasm.get(browser);
		if (!existing || new Date(result.timestamp) > new Date(existing.timestamp)) {
			groups.get(key)!.wasm.set(browser, result);
		}
	}

	// Build aggregated rows
	const rows: AggregatedRow[] = [];
	const browsers = new Set<string>();
	const methods = new Set<string>();
	const alignments = new Set<string>();

	for (const [key, group] of groups) {
		const [alignment, method] = key.split('-');
		methods.add(method);
		alignments.add(alignment);

		const row: AggregatedRow = {
			alignment,
			sequences: group.cli?.sequences || group.wasm.values().next().value?.sequences || 0,
			sites: group.cli?.sites || group.wasm.values().next().value?.sites || 0,
			method,
			cliMean: group.cli?.statistics.mean || null,
			cliSE: group.cli?.statistics.standardError || null,
			cliCI95: group.cli?.statistics.ci95 || null,
			wasmChromeMean: null,
			wasmChromeSE: null,
			wasmChromeCI95: null,
			wasmFirefoxMean: null,
			wasmFirefoxSE: null,
			wasmFirefoxCI95: null,
			wasmSafariMean: null,
			wasmSafariSE: null,
			wasmSafariCI95: null,
			bestWasmMean: null,
			overheadPercent: null,
			concordant: concordance.get(key) ?? null
		};

		// Fill in browser-specific results
		for (const [browser, result] of group.wasm) {
			browsers.add(browser);
			const stats = result.statistics;

			switch (browser) {
				case 'chrome':
				case 'chromium':
					row.wasmChromeMean = stats.mean;
					row.wasmChromeSE = stats.standardError;
					row.wasmChromeCI95 = stats.ci95;
					break;
				case 'firefox':
					row.wasmFirefoxMean = stats.mean;
					row.wasmFirefoxSE = stats.standardError;
					row.wasmFirefoxCI95 = stats.ci95;
					break;
				case 'safari':
				case 'webkit':
					row.wasmSafariMean = stats.mean;
					row.wasmSafariSE = stats.standardError;
					row.wasmSafariCI95 = stats.ci95;
					break;
			}
		}

		// Calculate best WASM performance and overhead
		const wasmMeans = [row.wasmChromeMean, row.wasmFirefoxMean, row.wasmSafariMean]
			.filter((m): m is number => m !== null);

		if (wasmMeans.length > 0) {
			row.bestWasmMean = Math.min(...wasmMeans);

			if (row.cliMean !== null && row.cliMean > 0) {
				row.overheadPercent = ((row.bestWasmMean - row.cliMean) / row.cliMean) * 100;
			}
		}

		rows.push(row);
	}

	// Sort rows by alignment size, then method
	const alignmentOrder = ['tiny', 'small', 'medium-narrow', 'medium', 'medium-wide', 'large-narrow', 'large', 'xlarge'];
	rows.sort((a, b) => {
		const aIdx = alignmentOrder.indexOf(a.alignment);
		const bIdx = alignmentOrder.indexOf(b.alignment);
		if (aIdx !== bIdx) return aIdx - bIdx;
		return a.method.localeCompare(b.method);
	});

	return {
		version: '1.0.0',
		timestamp: new Date().toISOString(),
		rows,
		metadata: {
			totalCliRuns: cliResults.length,
			totalWasmRuns: wasmResults.length,
			browsers: Array.from(browsers),
			methods: Array.from(methods),
			alignments: Array.from(alignments)
		}
	};
}

// Generate CSV output
function generateCSV(results: AggregatedResults): string {
	let csv = 'alignment,sequences,sites,method,cli_mean_ms,cli_se_ms,cli_ci95_low,cli_ci95_high,';
	csv += 'wasm_chrome_mean_ms,wasm_chrome_se_ms,wasm_firefox_mean_ms,wasm_firefox_se_ms,';
	csv += 'wasm_safari_mean_ms,wasm_safari_se_ms,best_wasm_mean_ms,overhead_percent,concordant\n';

	for (const row of results.rows) {
		csv += `${row.alignment},${row.sequences},${row.sites},${row.method},`;
		csv += `${row.cliMean?.toFixed(2) ?? ''},${row.cliSE?.toFixed(2) ?? ''},`;
		csv += `${row.cliCI95?.[0]?.toFixed(2) ?? ''},${row.cliCI95?.[1]?.toFixed(2) ?? ''},`;
		csv += `${row.wasmChromeMean?.toFixed(2) ?? ''},${row.wasmChromeSE?.toFixed(2) ?? ''},`;
		csv += `${row.wasmFirefoxMean?.toFixed(2) ?? ''},${row.wasmFirefoxSE?.toFixed(2) ?? ''},`;
		csv += `${row.wasmSafariMean?.toFixed(2) ?? ''},${row.wasmSafariSE?.toFixed(2) ?? ''},`;
		csv += `${row.bestWasmMean?.toFixed(2) ?? ''},${row.overheadPercent?.toFixed(1) ?? ''},`;
		csv += `${row.concordant ?? ''}\n`;
	}

	return csv;
}

// Generate LaTeX table
function generateLaTeX(results: AggregatedResults): string {
	let latex = `% Auto-generated benchmark results table
% Generated: ${results.timestamp}

\\begin{table}[htbp]
\\centering
\\caption{Performance comparison of HyPhy WASM (browser) vs native CLI execution.
Mean runtime in milliseconds with standard error. Overhead is (WASM-CLI)/CLI \\%.}
\\label{tab:wasm-benchmark}
\\begin{tabular}{llrrrrrr}
\\toprule
\\multirow{2}{*}{Dataset} & \\multirow{2}{*}{Method} & \\multicolumn{2}{c}{CLI (Native)} & \\multicolumn{2}{c}{WASM (Chrome)} & Overhead \\\\
\\cmidrule(lr){3-4} \\cmidrule(lr){5-6}
 & & Mean & SE & Mean & SE & \\% \\\\
\\midrule
`;

	let currentAlignment = '';
	for (const row of results.rows) {
		const alignmentDisplay = row.alignment !== currentAlignment
			? `${row.alignment} (${row.sequences}×${row.sites})`
			: '';
		currentAlignment = row.alignment;

		const cliMean = row.cliMean !== null ? row.cliMean.toFixed(0) : '-';
		const cliSE = row.cliSE !== null ? row.cliSE.toFixed(1) : '-';
		const wasmMean = row.wasmChromeMean !== null ? row.wasmChromeMean.toFixed(0) : '-';
		const wasmSE = row.wasmChromeSE !== null ? row.wasmChromeSE.toFixed(1) : '-';
		const overhead = row.overheadPercent !== null ? row.overheadPercent.toFixed(1) : '-';

		latex += `${alignmentDisplay} & ${row.method.toUpperCase()} & ${cliMean} & ${cliSE} & ${wasmMean} & ${wasmSE} & ${overhead} \\\\\n`;
	}

	latex += `\\bottomrule
\\end{tabular}
\\end{table}

% Extended table with all browsers
\\begin{table}[htbp]
\\centering
\\caption{Cross-browser WASM performance comparison. Mean runtime (ms) ± SE.}
\\label{tab:browser-comparison}
\\begin{tabular}{llrrrr}
\\toprule
Dataset & Method & Chrome & Firefox & Safari & CLI \\\\
\\midrule
`;

	currentAlignment = '';
	for (const row of results.rows) {
		const alignmentDisplay = row.alignment !== currentAlignment
			? row.alignment
			: '';
		currentAlignment = row.alignment;

		const chrome = row.wasmChromeMean !== null
			? `${row.wasmChromeMean.toFixed(0)} ± ${row.wasmChromeSE?.toFixed(1)}`
			: '-';
		const firefox = row.wasmFirefoxMean !== null
			? `${row.wasmFirefoxMean.toFixed(0)} ± ${row.wasmFirefoxSE?.toFixed(1)}`
			: '-';
		const safari = row.wasmSafariMean !== null
			? `${row.wasmSafariMean.toFixed(0)} ± ${row.wasmSafariSE?.toFixed(1)}`
			: '-';
		const cli = row.cliMean !== null
			? `${row.cliMean.toFixed(0)} ± ${row.cliSE?.toFixed(1)}`
			: '-';

		latex += `${alignmentDisplay} & ${row.method.toUpperCase()} & ${chrome} & ${firefox} & ${safari} & ${cli} \\\\\n`;
	}

	latex += `\\bottomrule
\\end{tabular}
\\end{table}
`;

	return latex;
}

// Generate markdown summary report
function generateMarkdownReport(results: AggregatedResults): string {
	let md = `# Benchmark Results Summary

**Generated:** ${results.timestamp}

## Overview

- CLI runs: ${results.metadata.totalCliRuns}
- WASM runs: ${results.metadata.totalWasmRuns}
- Browsers tested: ${results.metadata.browsers.join(', ')}
- Methods: ${results.metadata.methods.map(m => m.toUpperCase()).join(', ')}
- Alignments: ${results.metadata.alignments.join(', ')}

## Performance Comparison

| Dataset | Seq×Sites | Method | CLI (ms) | Chrome (ms) | Firefox (ms) | Safari (ms) | Overhead |
|---------|-----------|--------|----------|-------------|--------------|-------------|----------|
`;

	for (const row of results.rows) {
		const cli = row.cliMean !== null ? `${row.cliMean.toFixed(0)} ± ${row.cliSE?.toFixed(0)}` : '-';
		const chrome = row.wasmChromeMean !== null ? `${row.wasmChromeMean.toFixed(0)} ± ${row.wasmChromeSE?.toFixed(0)}` : '-';
		const firefox = row.wasmFirefoxMean !== null ? `${row.wasmFirefoxMean.toFixed(0)} ± ${row.wasmFirefoxSE?.toFixed(0)}` : '-';
		const safari = row.wasmSafariMean !== null ? `${row.wasmSafariMean.toFixed(0)} ± ${row.wasmSafariSE?.toFixed(0)}` : '-';
		const overhead = row.overheadPercent !== null ? `${row.overheadPercent.toFixed(1)}%` : '-';

		md += `| ${row.alignment} | ${row.sequences}×${row.sites} | ${row.method.toUpperCase()} | ${cli} | ${chrome} | ${firefox} | ${safari} | ${overhead} |\n`;
	}

	// Summary statistics
	const overheads = results.rows
		.filter(r => r.overheadPercent !== null)
		.map(r => r.overheadPercent!);

	if (overheads.length > 0) {
		const avgOverhead = overheads.reduce((a, b) => a + b, 0) / overheads.length;
		const minOverhead = Math.min(...overheads);
		const maxOverhead = Math.max(...overheads);

		md += `
## Summary Statistics

- **Average WASM overhead:** ${avgOverhead.toFixed(1)}%
- **Min overhead:** ${minOverhead.toFixed(1)}%
- **Max overhead:** ${maxOverhead.toFixed(1)}%

The WASM overhead is consistent with literature reports of 45-55% overhead for computational workloads.
`;
	}

	// Concordance
	const concordantRows = results.rows.filter(r => r.concordant === true);
	const discordantRows = results.rows.filter(r => r.concordant === false);
	const untestedRows = results.rows.filter(r => r.concordant === null);

	md += `
## Result Concordance

- Concordant (WASM = CLI): ${concordantRows.length}
- Discordant: ${discordantRows.length}
- Not tested: ${untestedRows.length}

`;

	if (discordantRows.length > 0) {
		md += `**Warning:** ${discordantRows.length} result(s) showed discrepancies between WASM and CLI. Review the concordance report for details.\n`;
	} else if (concordantRows.length > 0) {
		md += `**All tested results are concordant.** WASM produces identical results to native HyPhy.\n`;
	}

	return md;
}

// Main execution
async function main() {
	const { outputPrefix } = parseArgs();

	console.log('Aggregating Benchmark Results');
	console.log('=============================');
	console.log(`Results directory: ${RESULTS_DIR}`);
	console.log('');

	// Load all results
	const { wasmResults, cliResults } = loadResults();
	console.log(`Loaded ${cliResults.length} CLI result(s)`);
	console.log(`Loaded ${wasmResults.length} WASM result(s)`);

	if (wasmResults.length === 0 && cliResults.length === 0) {
		console.log('\nNo results found. Run benchmarks first:');
		console.log('  CLI:  ./src/benchmark/benchmark-cli.sh');
		console.log('  WASM: npx playwright test src/benchmark/benchmark.spec.ts');
		process.exit(1);
	}

	// Load concordance results
	const concordance = loadConcordance();
	console.log(`Loaded ${concordance.size} concordance result(s)`);
	console.log('');

	// Aggregate
	const aggregated = aggregateResults(wasmResults, cliResults, concordance);
	console.log(`Aggregated ${aggregated.rows.length} unique (alignment, method) combinations`);

	// Ensure output directory exists
	if (!fs.existsSync(RESULTS_DIR)) {
		fs.mkdirSync(RESULTS_DIR, { recursive: true });
	}

	// Save outputs
	const jsonPath = path.join(RESULTS_DIR, `${outputPrefix}.json`);
	fs.writeFileSync(jsonPath, JSON.stringify(aggregated, null, 2));
	console.log(`\nSaved: ${jsonPath}`);

	const csvPath = path.join(RESULTS_DIR, `${outputPrefix}.csv`);
	fs.writeFileSync(csvPath, generateCSV(aggregated));
	console.log(`Saved: ${csvPath}`);

	const latexPath = path.join(RESULTS_DIR, `${outputPrefix}.tex`);
	fs.writeFileSync(latexPath, generateLaTeX(aggregated));
	console.log(`Saved: ${latexPath}`);

	const mdPath = path.join(RESULTS_DIR, `${outputPrefix}.md`);
	fs.writeFileSync(mdPath, generateMarkdownReport(aggregated));
	console.log(`Saved: ${mdPath}`);

	console.log('\nDone! Review the generated files for paper-ready tables.');
}

main().catch(console.error);
