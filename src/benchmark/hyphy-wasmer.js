// hyphy-wasmer.js - Benchmarking script for hyphy in wasmer environment
import fs from 'fs';
import path from 'path';
import { WASI } from '@wasmer/wasi';
import { WasmFs } from '@wasmer/wasmfs';
import { lowerI64Imports } from '@wasmer/wasm-transformer';

// Configuration
const BENCHMARK_ITERATIONS = 10;
const METHODS = ['fel', 'meme', 'absrel'];
const TEST_FILES = ['small.nex', 'medium.nex', 'large.nex'];

// Initialize wasmer components
const wasmFs = new WasmFs();
const wasi = new WASI({
	args: [],
	env: {},
	bindings: {
		...WASI.defaultBindings,
		fs: wasmFs.fs
	}
});

async function loadHyPhyWasm() {
	// Path to hyphy wasm binary - this would need to be downloaded or built first
	const wasmPath = path.resolve(__dirname, '../assets/hyphy.wasm');
	const wasmBuffer = fs.readFileSync(wasmPath);

	// Lower i64 imports to maintain compatibility
	const loweredWasmBuffer = await lowerI64Imports(wasmBuffer);

	// Compile wasm module
	const module = await WebAssembly.compile(loweredWasmBuffer);

	// Instantiate the module
	const instance = await WebAssembly.instantiate(module, {
		...wasi.getImports(module)
	});

	return { instance, module };
}

async function runBenchmark() {
	console.log('Starting HyPhy Benchmark on Wasmer...');

	const { instance } = await loadHyPhyWasm();

	// Setup file directory structure
	wasmFs.fs.mkdirSync('/shared', { recursive: true });
	wasmFs.fs.mkdirSync('/shared/hyphy', { recursive: true });
	wasmFs.fs.mkdirSync('/shared/data', { recursive: true });

	// Copy test files and dependencies to virtual FS
	for (const file of TEST_FILES) {
		const content = fs.readFileSync(path.resolve(__dirname, `../test-data/${file}`));
		wasmFs.fs.writeFileSync(`/shared/data/${file}`, content);
	}

	// Copy HyPhy library files to virtual FS
	const libFiles = fs.readdirSync(path.resolve(__dirname, '../data/shared'));
	for (const file of libFiles) {
		const content = fs.readFileSync(path.resolve(__dirname, `../data/shared/${file}`));
		wasmFs.fs.writeFileSync(`/shared/hyphy/${file}`, content);
	}

	// Run benchmarks
	const results = {};

	for (const method of METHODS) {
		results[method] = {};

		for (const file of TEST_FILES) {
			console.log(`Running ${method} on ${file}...`);

			const times = [];

			for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
				const start = performance.now();

				// Set up command arguments
				wasi.args = ['hyphy', 'LIBPATH=/shared/hyphy/', method, `--alignment=/shared/data/${file}`];

				// Run HyPhy
				try {
					wasi.start(instance);

					// Read results from virtual file system
					const resultPath = `/shared/data/${file}.${method.toUpperCase()}.json`;
					const resultJson = wasmFs.fs.readFileSync(resultPath, 'utf8');

					const end = performance.now();
					times.push(end - start);

					console.log(`  Iteration ${i + 1}: ${(end - start).toFixed(2)}ms`);
				} catch (error) {
					console.error(`Error running ${method} on ${file}:`, error);
				}
			}

			// Calculate statistics
			const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
			const min = Math.min(...times);
			const max = Math.max(...times);

			results[method][file] = {
				average: avg,
				min,
				max,
				iterations: times.length,
				times
			};
		}
	}

	// Write benchmark results to disk
	fs.writeFileSync(
		path.resolve(__dirname, '../benchmark-results/wasmer-results.json'),
		JSON.stringify(results, null, 2)
	);

	console.log('Benchmark complete. Results saved to benchmark-results/wasmer-results.json');
}

runBenchmark().catch(console.error);
