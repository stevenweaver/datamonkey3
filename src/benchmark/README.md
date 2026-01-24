# HyPhy WASM Benchmarking Suite

Comprehensive benchmarking infrastructure for comparing **DM3 (browser WASM)** vs **HyPhy (native CLI)** performance. Designed to produce statistically rigorous results suitable for academic publication.

## Overview

This suite provides:

- **Statistical rigor**: Standard error, 95% confidence intervals, coefficient of variation
- **Cross-browser testing**: Automated testing across Chrome, Firefox, Safari (WebKit)
- **CLI baseline**: Native HyPhy benchmarks for comparison
- **Concordance verification**: Ensures WASM produces identical results to CLI
- **Paper-ready output**: LaTeX tables, CSV data, markdown reports

## Quick Start

### Prerequisites

1. **HyPhy CLI** (for baseline benchmarks):
   ```bash
   brew install hyphy  # macOS
   # Or build from source: https://github.com/veg/hyphy
   ```

2. **Playwright** (for cross-browser automation):
   ```bash
   npx playwright install
   ```

3. **jq and bc** (for CLI benchmark script):
   ```bash
   brew install jq bc  # macOS
   ```

### Run Benchmarks

1. **Generate test alignments** (if not already done):
   ```bash
   node src/benchmark/test-alignments/generate-alignments.cjs
   ```

2. **Run CLI benchmarks** (native HyPhy baseline):
   ```bash
   ./src/benchmark/benchmark-cli.sh
   ```

3. **Run WASM benchmarks** (cross-browser):
   ```bash
   # All browsers
   npx playwright test src/benchmark/benchmark.spec.ts

   # Specific browser
   npx playwright test src/benchmark/benchmark.spec.ts --project=chromium
   npx playwright test src/benchmark/benchmark.spec.ts --project=firefox
   npx playwright test src/benchmark/benchmark.spec.ts --project=webkit
   ```

4. **Verify concordance** (WASM results match CLI):
   ```bash
   npx ts-node src/benchmark/verify-concordance.ts
   ```

5. **Aggregate results** (generate paper tables):
   ```bash
   npx ts-node src/benchmark/aggregate-results.ts
   ```

### Interactive Browser Benchmark

For manual benchmarking with a visual interface:

```bash
# Start the dev server
npm run dev

# Open in browser
open http://localhost:5173/benchmark/benchmark-suite.html
```

## File Structure

```
src/benchmark/
├── README.md                    # This file
├── benchmark.html               # Original basic benchmark (legacy)
├── benchmark-suite.html         # Enhanced benchmark with statistics
├── benchmark.spec.ts            # Playwright cross-browser automation
├── benchmark-cli.sh             # Native HyPhy CLI benchmark script
├── verify-concordance.ts        # Result accuracy verification
├── aggregate-results.ts         # Combine and format results
├── types.ts                     # TypeScript interfaces
├── test-alignments/             # Test datasets
│   ├── generate-alignments.cjs  # Dataset generator script
│   ├── tiny.nex                 # 10 seq × 150 sites
│   ├── small.nex                # 25 seq × 300 sites
│   ├── medium-narrow.nex        # 50 seq × 201 sites
│   ├── medium.nex               # 50 seq × 501 sites
│   ├── medium-wide.nex          # 25 seq × 999 sites
│   ├── large-narrow.nex         # 100 seq × 300 sites
│   ├── large.nex                # 100 seq × 600 sites
│   └── xlarge.nex               # 200 seq × 450 sites
└── ...

benchmark-results/               # Output directory (auto-created)
├── cli-results-*.json           # CLI benchmark results
├── cli-results-*.csv            # CLI results in CSV format
├── wasm-*.json                  # Individual WASM run results
├── sample-cli-*.json            # CLI HyPhy JSON output (for concordance)
├── sample-*-*.json              # WASM HyPhy JSON output (for concordance)
├── concordance-report.json      # Concordance verification results
├── concordance-report.md        # Concordance markdown report
├── aggregated-results.json      # Combined results
├── aggregated-results.csv       # Combined CSV for analysis
├── aggregated-results.tex       # LaTeX tables for paper
└── aggregated-results.md        # Summary markdown report
```

## Test Datasets

| ID | Sequences | Sites | Use Case |
|----|-----------|-------|----------|
| tiny | 10 | 150 | Fast verification, baseline |
| small | 25 | 300 | Small gene analysis |
| medium-narrow | 50 | 201 | Many sequences, short gene |
| medium | 50 | 501 | Typical analysis |
| medium-wide | 25 | 999 | Long gene |
| large-narrow | 100 | 300 | Population-scale |
| large | 100 | 600 | Standard large |
| xlarge | 200 | 450 | Browser stress test |

Datasets are synthetic codon alignments generated to cover the range of inputs expected in real-world usage.

## Methods Tested

Selection pressure methods (focus of the paper):

- **FEL** (Fixed Effects Likelihood)
- **MEME** (Mixed Effects Model of Evolution)
- **SLAC** (Single-Likelihood Ancestor Counting)

## Statistical Metrics

Each benchmark run reports:

- **Mean runtime** (milliseconds)
- **Standard deviation**
- **Standard error**: `SE = stdDev / sqrt(n)`
- **95% confidence interval**: `mean ± 1.96 × SE`
- **Coefficient of variation**: `CV = stdDev / mean × 100%`
- **Min/max/median** runtime

## Expected Results

Based on literature and the existing `timingEstimates.js`:

- **WASM overhead**: 45-55% slower than native (literature)
- **Current assumption**: 60% speed ratio (67% overhead) in `timingEstimates.js`
- **Single-threading penalty**: Additional overhead for parallelizable methods

## Configuration

### CLI Benchmark (`benchmark-cli.sh`)

```bash
./benchmark-cli.sh --alignments tiny,small,medium --methods fel,meme --iterations 10
```

Options:
- `--alignments`: Comma-separated list of alignment IDs
- `--methods`: Comma-separated list of methods (fel, meme, slac)
- `--iterations`: Number of iterations per test (default: 5)

### Playwright Tests (`benchmark.spec.ts`)

Edit the `BENCHMARK_CONFIG` object:

```typescript
const BENCHMARK_CONFIG = {
  methods: ['fel', 'meme', 'slac'],
  alignments: ['tiny', 'small', 'medium'],
  iterations: 5,
  // ...
};
```

## Workflow for Paper

### Phase 1: Setup
1. Generate test alignments
2. Install HyPhy CLI
3. Install Playwright browsers

### Phase 2: Run Benchmarks
1. Run CLI benchmarks (baseline)
2. Run WASM benchmarks (all browsers)

### Phase 3: Verify & Analyze
1. Verify concordance (WASM = CLI results)
2. Aggregate results
3. Review generated tables and reports

### Phase 4: Document
1. Record hardware specs in paper
2. Include LaTeX tables from `aggregated-results.tex`
3. Cite overhead percentages from summary report

## Verification Checklist

- [ ] Test alignments generated
- [ ] CLI benchmarks completed
- [ ] WASM benchmarks completed (Chrome, Firefox, Safari)
- [ ] Concordance verified (all methods/alignments)
- [ ] Results aggregated
- [ ] Hardware specs documented
- [ ] Software versions documented (HyPhy, browsers, Node.js)

## Troubleshooting

### HyPhy not found
```bash
brew install hyphy
# Or add to PATH if compiled from source
export PATH="/path/to/hyphy/bin:$PATH"
```

### Playwright browser not installed
```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### Test alignment files not found
```bash
cd src/benchmark/test-alignments
node generate-alignments.cjs
```

### Slow WASM initialization
The first run initializes HyPhy WASM (downloads ~20MB). Subsequent runs are faster due to caching.

## Legacy Files

- `benchmark.html`: Original basic benchmark (kept for reference)
- `hyphy-wasmer.js`: Experimental Wasmer implementation (not used)

## License

Part of the Datamonkey 3 project. See repository root for license information.
