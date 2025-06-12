# HyPhy Benchmarking Tools

This directory contains tools for benchmarking HyPhy performance in different environments:

1. Browser-based benchmarking using Biowasm/Aioli
2. Wasmer-based benchmarking for Node.js environments

## Setup

Before running the benchmarks, you need to set up the environment:

```bash
# Install dependencies
npm install

# Create required directories
npm run setup
```

## Required Files

Before running the benchmarks, you need to place the following files:

1. Test alignment files in `../test-data/` directory:
   - Place `.nex`, `.fasta`, or other alignment files here
   - For wasmer tests, name them according to the TEST_FILES array in hyphy-wasmer.js

2. HyPhy WebAssembly binary:
   - For wasmer tests, place `hyphy.wasm` in the `../assets/` directory
   - This file needs to be compiled for WebAssembly with WASI support

## Running Browser Benchmarks

The browser benchmark provides a simple UI for testing HyPhy performance in the browser:

```bash
npm run start:browser
```

This will open the benchmark.html file in your browser, where you can:
- Select the HyPhy method to benchmark
- Upload an alignment file
- Choose the number of iterations
- Run the benchmark and view results

## Running Wasmer Benchmarks

The wasmer benchmark runs HyPhy in a Node.js environment using the Wasmer runtime:

```bash
npm run start:wasmer
```

This will run the benchmark with the configured methods and test files, and save the results to `../benchmark-results/wasmer-results.json`.

## Customizing Benchmarks

### Browser Benchmark

You can modify the benchmark.html file to:
- Add or remove HyPhy methods from the dropdown
- Change the default number of iterations
- Customize the results display

### Wasmer Benchmark

You can modify the hyphy-wasmer.js file to:
- Change the BENCHMARK_ITERATIONS constant
- Modify the METHODS array to test different HyPhy methods
- Update the TEST_FILES array to use different test files

## Comparing Results

After running both benchmarks, you can compare the results to understand how HyPhy performs in different environments. The browser benchmark displays results in the UI and logs them to the console, while the wasmer benchmark saves results to a JSON file.

## Notes

- The browser benchmark uses the same Aioli/Biowasm implementation as the main application
- The wasmer benchmark requires a compatible HyPhy WebAssembly binary
- Performance will vary based on hardware, browser, and Node.js version