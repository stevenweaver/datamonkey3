#!/usr/bin/env npx ts-node
/**
 * Concordance Verification Script
 *
 * Compares JSON results from WASM and CLI HyPhy executions to verify
 * that they produce identical (or numerically equivalent) results.
 *
 * This is critical for paper validity - WASM must produce the same
 * results as native HyPhy, just slower.
 *
 * Usage:
 *   npx ts-node src/benchmark/verify-concordance.ts
 *   npx ts-node src/benchmark/verify-concordance.ts --tolerance 1e-8
 *
 * Output:
 *   benchmark-results/concordance-report.json
 *   benchmark-results/concordance-report.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DEFAULT_TOLERANCE = 1e-10;
const RESULTS_DIR = path.resolve(__dirname, '../../benchmark-results');

interface ConcordanceResult {
	method: string;
	alignment: string;
	wasmFile: string;
	cliFile: string;
	matches: boolean;
	tolerance: number;
	totalFields: number;
	matchingFields: number;
	discrepancies: Discrepancy[];
	summary: string;
}

interface Discrepancy {
	path: string;
	wasmValue: any;
	cliValue: any;
	difference?: number;
	type: 'missing_in_wasm' | 'missing_in_cli' | 'type_mismatch' | 'value_mismatch';
}

interface ConcordanceReport {
	timestamp: string;
	tolerance: number;
	totalComparisons: number;
	passedComparisons: number;
	failedComparisons: number;
	results: ConcordanceResult[];
}

// Parse command line arguments
function parseArgs(): { tolerance: number } {
	const args = process.argv.slice(2);
	let tolerance = DEFAULT_TOLERANCE;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--tolerance' && args[i + 1]) {
			tolerance = parseFloat(args[i + 1]);
			i++;
		}
	}

	return { tolerance };
}

// Find matching WASM and CLI result files
function findResultPairs(): Array<{ method: string; alignment: string; wasmFile: string; cliFile: string }> {
	const pairs: Array<{ method: string; alignment: string; wasmFile: string; cliFile: string }> = [];

	if (!fs.existsSync(RESULTS_DIR)) {
		console.error(`Results directory not found: ${RESULTS_DIR}`);
		return pairs;
	}

	const files = fs.readdirSync(RESULTS_DIR);

	// Find sample files (these contain the actual HyPhy JSON output)
	const wasmSamples = files.filter(f => f.startsWith('sample-') && !f.startsWith('sample-cli-'));
	const cliSamples = files.filter(f => f.startsWith('sample-cli-'));

	// Parse WASM sample filenames: sample-{browser}-{alignment}-{method}.json
	for (const wasmFile of wasmSamples) {
		const match = wasmFile.match(/^sample-(\w+)-(.+)-(\w+)\.json$/);
		if (!match) continue;

		const [, browser, alignment, method] = match;

		// Look for corresponding CLI file: sample-cli-{alignment}-{method}.json
		const cliFile = `sample-cli-${alignment}-${method}.json`;

		if (cliSamples.includes(cliFile)) {
			pairs.push({
				method,
				alignment,
				wasmFile: path.join(RESULTS_DIR, wasmFile),
				cliFile: path.join(RESULTS_DIR, cliFile)
			});
		}
	}

	return pairs;
}

// Compare two values with tolerance for numeric values
function valuesMatch(wasmVal: any, cliVal: any, tolerance: number): boolean {
	// Handle null/undefined
	if (wasmVal === null || wasmVal === undefined) {
		return cliVal === null || cliVal === undefined;
	}
	if (cliVal === null || cliVal === undefined) {
		return false;
	}

	// Handle arrays
	if (Array.isArray(wasmVal) && Array.isArray(cliVal)) {
		if (wasmVal.length !== cliVal.length) return false;
		return wasmVal.every((v, i) => valuesMatch(v, cliVal[i], tolerance));
	}

	// Handle objects
	if (typeof wasmVal === 'object' && typeof cliVal === 'object') {
		const wasmKeys = Object.keys(wasmVal);
		const cliKeys = Object.keys(cliVal);

		// For objects, we'll do a shallow comparison of keys
		// Deep comparison happens in the recursive call
		if (wasmKeys.length !== cliKeys.length) return false;
		return wasmKeys.every(key => valuesMatch(wasmVal[key], cliVal[key], tolerance));
	}

	// Handle numbers with tolerance
	if (typeof wasmVal === 'number' && typeof cliVal === 'number') {
		// Handle special cases
		if (Number.isNaN(wasmVal) && Number.isNaN(cliVal)) return true;
		if (!Number.isFinite(wasmVal) && !Number.isFinite(cliVal)) {
			return Math.sign(wasmVal) === Math.sign(cliVal);
		}

		// Use relative tolerance for large numbers, absolute for small
		const diff = Math.abs(wasmVal - cliVal);
		const maxVal = Math.max(Math.abs(wasmVal), Math.abs(cliVal));

		if (maxVal < tolerance) {
			// Both values are essentially zero
			return diff < tolerance;
		}

		// Relative comparison
		return diff / maxVal < tolerance;
	}

	// Handle strings and other types
	return wasmVal === cliVal;
}

// Deep compare two objects and collect discrepancies
function compareObjects(
	wasmObj: any,
	cliObj: any,
	tolerance: number,
	currentPath: string = ''
): Discrepancy[] {
	const discrepancies: Discrepancy[] = [];

	// Handle null/undefined at root
	if (wasmObj === null || wasmObj === undefined) {
		if (cliObj !== null && cliObj !== undefined) {
			discrepancies.push({
				path: currentPath || 'root',
				wasmValue: wasmObj,
				cliValue: cliObj,
				type: 'missing_in_wasm'
			});
		}
		return discrepancies;
	}

	if (cliObj === null || cliObj === undefined) {
		discrepancies.push({
			path: currentPath || 'root',
			wasmValue: wasmObj,
			cliValue: cliObj,
			type: 'missing_in_cli'
		});
		return discrepancies;
	}

	// Handle arrays
	if (Array.isArray(wasmObj) && Array.isArray(cliObj)) {
		const maxLen = Math.max(wasmObj.length, cliObj.length);
		for (let i = 0; i < maxLen; i++) {
			const newPath = `${currentPath}[${i}]`;
			if (i >= wasmObj.length) {
				discrepancies.push({
					path: newPath,
					wasmValue: undefined,
					cliValue: cliObj[i],
					type: 'missing_in_wasm'
				});
			} else if (i >= cliObj.length) {
				discrepancies.push({
					path: newPath,
					wasmValue: wasmObj[i],
					cliValue: undefined,
					type: 'missing_in_cli'
				});
			} else {
				discrepancies.push(...compareObjects(wasmObj[i], cliObj[i], tolerance, newPath));
			}
		}
		return discrepancies;
	}

	// Handle objects
	if (typeof wasmObj === 'object' && typeof cliObj === 'object') {
		const allKeys = new Set([...Object.keys(wasmObj), ...Object.keys(cliObj)]);

		for (const key of allKeys) {
			const newPath = currentPath ? `${currentPath}.${key}` : key;

			// Skip metadata fields that may differ between runs
			if (['timestamp', 'analysis', 'timers', 'runtime', 'tested', 'HYPHYMPI'].includes(key)) {
				continue;
			}

			if (!(key in wasmObj)) {
				discrepancies.push({
					path: newPath,
					wasmValue: undefined,
					cliValue: cliObj[key],
					type: 'missing_in_wasm'
				});
			} else if (!(key in cliObj)) {
				discrepancies.push({
					path: newPath,
					wasmValue: wasmObj[key],
					cliValue: undefined,
					type: 'missing_in_cli'
				});
			} else {
				discrepancies.push(...compareObjects(wasmObj[key], cliObj[key], tolerance, newPath));
			}
		}
		return discrepancies;
	}

	// Handle primitive values
	if (!valuesMatch(wasmObj, cliObj, tolerance)) {
		const disc: Discrepancy = {
			path: currentPath,
			wasmValue: wasmObj,
			cliValue: cliObj,
			type: typeof wasmObj !== typeof cliObj ? 'type_mismatch' : 'value_mismatch'
		};

		if (typeof wasmObj === 'number' && typeof cliObj === 'number') {
			disc.difference = Math.abs(wasmObj - cliObj);
		}

		discrepancies.push(disc);
	}

	return discrepancies;
}

// Extract key result fields for a given method
function extractKeyFields(result: any, method: string): any {
	switch (method.toLowerCase()) {
		case 'fel':
			// FEL: Site-level p-values and rate estimates
			return {
				'MLE': result['MLE'],
				'branch attributes': result['branch attributes'],
				'tested': result['tested']
			};

		case 'meme':
			// MEME: Site-level p-values and omega estimates
			return {
				'MLE': result['MLE'],
				'branch attributes': result['branch attributes']
			};

		case 'slac':
			// SLAC: Site-level dN-dS and p-values
			return {
				'MLE': result['MLE'],
				'branch attributes': result['branch attributes']
			};

		default:
			// For unknown methods, compare entire structure
			return result;
	}
}

// Compare a pair of result files
function compareResultPair(
	wasmFile: string,
	cliFile: string,
	method: string,
	alignment: string,
	tolerance: number
): ConcordanceResult {
	const result: ConcordanceResult = {
		method,
		alignment,
		wasmFile,
		cliFile,
		matches: false,
		tolerance,
		totalFields: 0,
		matchingFields: 0,
		discrepancies: [],
		summary: ''
	};

	try {
		const wasmData = JSON.parse(fs.readFileSync(wasmFile, 'utf-8'));
		const cliData = JSON.parse(fs.readFileSync(cliFile, 'utf-8'));

		// Extract key fields for comparison
		const wasmKey = extractKeyFields(wasmData, method);
		const cliKey = extractKeyFields(cliData, method);

		// Compare
		result.discrepancies = compareObjects(wasmKey, cliKey, tolerance);

		// Count total fields (rough estimate from stringified JSON)
		const wasmStr = JSON.stringify(wasmKey);
		const numericMatches = wasmStr.match(/:\s*-?\d+\.?\d*/g);
		result.totalFields = numericMatches ? numericMatches.length : 0;
		result.matchingFields = result.totalFields - result.discrepancies.length;

		result.matches = result.discrepancies.length === 0;
		result.summary = result.matches
			? `PASS: All ${result.totalFields} fields match within tolerance ${tolerance}`
			: `FAIL: ${result.discrepancies.length} discrepancies found out of ~${result.totalFields} fields`;

	} catch (err) {
		result.summary = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
	}

	return result;
}

// Generate markdown report
function generateMarkdownReport(report: ConcordanceReport): string {
	let md = `# Concordance Verification Report

Generated: ${report.timestamp}
Tolerance: ${report.tolerance}

## Summary

- Total comparisons: ${report.totalComparisons}
- Passed: ${report.passedComparisons}
- Failed: ${report.failedComparisons}
- Pass rate: ${((report.passedComparisons / report.totalComparisons) * 100).toFixed(1)}%

## Results

| Method | Alignment | Status | Fields | Discrepancies |
|--------|-----------|--------|--------|---------------|
`;

	for (const result of report.results) {
		const status = result.matches ? '✅ PASS' : '❌ FAIL';
		md += `| ${result.method.toUpperCase()} | ${result.alignment} | ${status} | ${result.totalFields} | ${result.discrepancies.length} |\n`;
	}

	// Detail failed comparisons
	const failures = report.results.filter(r => !r.matches);
	if (failures.length > 0) {
		md += `\n## Discrepancy Details\n\n`;

		for (const failure of failures) {
			md += `### ${failure.method.toUpperCase()} on ${failure.alignment}\n\n`;

			if (failure.discrepancies.length > 20) {
				md += `_Showing first 20 of ${failure.discrepancies.length} discrepancies_\n\n`;
			}

			md += `| Path | WASM Value | CLI Value | Difference |\n`;
			md += `|------|------------|-----------|------------|\n`;

			for (const disc of failure.discrepancies.slice(0, 20)) {
				const wasmStr = typeof disc.wasmValue === 'number'
					? disc.wasmValue.toExponential(6)
					: JSON.stringify(disc.wasmValue).slice(0, 30);
				const cliStr = typeof disc.cliValue === 'number'
					? disc.cliValue.toExponential(6)
					: JSON.stringify(disc.cliValue).slice(0, 30);
				const diffStr = disc.difference !== undefined
					? disc.difference.toExponential(2)
					: '-';

				md += `| \`${disc.path}\` | ${wasmStr} | ${cliStr} | ${diffStr} |\n`;
			}

			md += '\n';
		}
	}

	md += `\n## Interpretation

For the DM3 paper, WASM and CLI results should match to at least 6 decimal places (tolerance: 1e-6).
A tolerance of ${report.tolerance} was used for this verification.

${report.failedComparisons === 0
		? '**All results match - WASM produces identical output to native HyPhy CLI.**'
		: `**${report.failedComparisons} comparison(s) failed.** Review the discrepancies to determine if they are:
- Numerical precision issues (acceptable if difference < 1e-6)
- Actual algorithmic differences (requires investigation)`
	}
`;

	return md;
}

// Main execution
async function main() {
	const { tolerance } = parseArgs();

	console.log('Concordance Verification');
	console.log('========================');
	console.log(`Tolerance: ${tolerance}`);
	console.log(`Results directory: ${RESULTS_DIR}`);
	console.log('');

	// Find result pairs
	const pairs = findResultPairs();

	if (pairs.length === 0) {
		console.log('No matching WASM/CLI result pairs found.');
		console.log('Run both WASM and CLI benchmarks first, then verify concordance.');
		console.log('');
		console.log('Expected files:');
		console.log('  WASM: benchmark-results/sample-{browser}-{alignment}-{method}.json');
		console.log('  CLI:  benchmark-results/sample-cli-{alignment}-{method}.json');
		process.exit(1);
	}

	console.log(`Found ${pairs.length} result pair(s) to compare:`);
	pairs.forEach(p => console.log(`  - ${p.method} on ${p.alignment}`));
	console.log('');

	// Compare each pair
	const results: ConcordanceResult[] = [];

	for (const pair of pairs) {
		console.log(`Comparing ${pair.method.toUpperCase()} on ${pair.alignment}...`);
		const result = compareResultPair(
			pair.wasmFile,
			pair.cliFile,
			pair.method,
			pair.alignment,
			tolerance
		);
		results.push(result);
		console.log(`  ${result.summary}`);
	}

	// Build report
	const report: ConcordanceReport = {
		timestamp: new Date().toISOString(),
		tolerance,
		totalComparisons: results.length,
		passedComparisons: results.filter(r => r.matches).length,
		failedComparisons: results.filter(r => !r.matches).length,
		results
	};

	// Save reports
	if (!fs.existsSync(RESULTS_DIR)) {
		fs.mkdirSync(RESULTS_DIR, { recursive: true });
	}

	const jsonPath = path.join(RESULTS_DIR, 'concordance-report.json');
	fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
	console.log(`\nJSON report saved to: ${jsonPath}`);

	const mdPath = path.join(RESULTS_DIR, 'concordance-report.md');
	fs.writeFileSync(mdPath, generateMarkdownReport(report));
	console.log(`Markdown report saved to: ${mdPath}`);

	// Summary
	console.log('\n========================');
	console.log('Concordance Summary');
	console.log('========================');
	console.log(`Total: ${report.totalComparisons}`);
	console.log(`Passed: ${report.passedComparisons}`);
	console.log(`Failed: ${report.failedComparisons}`);

	if (report.failedComparisons > 0) {
		console.log('\n⚠️  Some comparisons failed. Review the reports for details.');
		process.exit(1);
	} else {
		console.log('\n✅ All comparisons passed! WASM and CLI produce identical results.');
	}
}

main().catch(console.error);
