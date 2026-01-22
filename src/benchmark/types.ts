/**
 * TypeScript interfaces for WASM benchmarking infrastructure
 * Used for comparing DM3 (browser WASM) vs HyPhy (CLI) performance
 */

/** Analysis methods supported for benchmarking */
export type BenchmarkMethod = 'fel' | 'meme' | 'slac';

/** Browser platforms for cross-browser testing */
export type BrowserPlatform = 'chromium' | 'firefox' | 'webkit' | 'edge';

/** Execution platform */
export type ExecutionPlatform = 'wasm' | 'cli';

/** Hardware information collected from the browser */
export interface HardwareInfo {
  /** Number of logical CPU cores (navigator.hardwareConcurrency) */
  cores: number;
  /** Device memory in GB (navigator.deviceMemory, may be undefined) */
  memoryGB?: number;
  /** User agent string */
  userAgent: string;
  /** Platform (e.g., 'MacIntel', 'Win32') */
  platform: string;
  /** Operating system extracted from user agent */
  os: string;
  /** OS version if available */
  osVersion?: string;
}

/** Software version information */
export interface SoftwareInfo {
  /** HyPhy version (e.g., '2.5.63') */
  hyphyVersion: string;
  /** Browser name and version */
  browserVersion?: string;
  /** Node.js version for CLI tests */
  nodeVersion?: string;
  /** Playwright version for automated tests */
  playwrightVersion?: string;
}

/** Test alignment metadata */
export interface AlignmentInfo {
  /** Dataset identifier (e.g., 'tiny', 'small', 'medium') */
  id: string;
  /** Human-readable name */
  name: string;
  /** Number of sequences */
  sequences: number;
  /** Number of sites (codons) */
  sites: number;
  /** File path relative to test-alignments directory */
  filename: string;
  /** Dataset size category */
  category: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';
}

/** Single benchmark iteration result */
export interface BenchmarkIteration {
  /** Iteration number (1-indexed) */
  iteration: number;
  /** Runtime in milliseconds */
  runtimeMs: number;
  /** Whether the iteration completed successfully */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Timestamp when iteration started */
  startTime: string;
  /** Timestamp when iteration ended */
  endTime: string;
}

/** Statistical summary of benchmark results */
export interface BenchmarkStatistics {
  /** Number of successful iterations */
  n: number;
  /** Mean runtime in milliseconds */
  mean: number;
  /** Standard deviation */
  stdDev: number;
  /** Standard error (stdDev / sqrt(n)) */
  standardError: number;
  /** 95% confidence interval [lower, upper] */
  ci95: [number, number];
  /** Minimum runtime */
  min: number;
  /** Maximum runtime */
  max: number;
  /** Median runtime */
  median: number;
  /** Coefficient of variation (stdDev / mean * 100) */
  cv: number;
}

/** Single benchmark run result (one method, one alignment, one platform) */
export interface BenchmarkRun {
  /** Unique run identifier */
  id: string;
  /** Execution platform */
  platform: ExecutionPlatform;
  /** Browser type (for WASM runs) */
  browser?: BrowserPlatform;
  /** Analysis method */
  method: BenchmarkMethod;
  /** Alignment dataset info */
  alignment: AlignmentInfo;
  /** Individual iteration results */
  iterations: BenchmarkIteration[];
  /** Computed statistics */
  statistics: BenchmarkStatistics;
  /** Hardware information */
  hardware: HardwareInfo;
  /** Software versions */
  software: SoftwareInfo;
  /** Timestamp when benchmark started */
  timestamp: string;
  /** Raw JSON result from one iteration (for concordance checking) */
  sampleResult?: object;
}

/** Concordance check result comparing WASM and CLI outputs */
export interface ConcordanceResult {
  /** Whether results match within tolerance */
  matches: boolean;
  /** Method being compared */
  method: BenchmarkMethod;
  /** Alignment used */
  alignment: string;
  /** Tolerance used for comparison */
  tolerance: number;
  /** Number of values compared */
  valuesCompared: number;
  /** Number of discrepancies found */
  discrepancies: number;
  /** Details of any discrepancies */
  discrepancyDetails?: Array<{
    field: string;
    wasmValue: number;
    cliValue: number;
    difference: number;
  }>;
}

/** Aggregated benchmark results across all runs */
export interface BenchmarkResults {
  /** Version of the benchmark suite */
  version: string;
  /** When the benchmark was run */
  timestamp: string;
  /** All individual benchmark runs */
  runs: BenchmarkRun[];
  /** Concordance verification results */
  concordance: ConcordanceResult[];
  /** Summary comparison table */
  summary: BenchmarkSummary[];
}

/** Summary row for comparison table */
export interface BenchmarkSummary {
  /** Alignment dataset */
  alignment: string;
  /** Number of sequences */
  sequences: number;
  /** Number of sites */
  sites: number;
  /** Analysis method */
  method: BenchmarkMethod;
  /** CLI mean runtime (ms) */
  cliMean: number;
  /** CLI standard error */
  cliSE: number;
  /** WASM Chrome mean runtime (ms) */
  wasmChromeMean?: number;
  /** WASM Chrome standard error */
  wasmChromeSE?: number;
  /** WASM Firefox mean runtime (ms) */
  wasmFirefoxMean?: number;
  /** WASM Firefox standard error */
  wasmFirefoxSE?: number;
  /** WASM Safari mean runtime (ms) */
  wasmSafariMean?: number;
  /** WASM Safari standard error */
  wasmSafariSE?: number;
  /** WASM overhead percentage vs CLI (best browser) */
  overheadPercent: number;
  /** Results match between WASM and CLI */
  concordant: boolean;
}

/** Configuration for benchmark execution */
export interface BenchmarkConfig {
  /** Methods to benchmark */
  methods: BenchmarkMethod[];
  /** Alignments to test */
  alignments: string[];
  /** Number of iterations per test */
  iterations: number;
  /** Browsers to test (for WASM benchmarks) */
  browsers: BrowserPlatform[];
  /** Whether to run CLI benchmarks */
  runCli: boolean;
  /** Whether to verify concordance */
  verifyConcordance: boolean;
  /** Tolerance for concordance checks */
  concordanceTolerance: number;
  /** Output directory for results */
  outputDir: string;
}

/** Available test alignments */
export const TEST_ALIGNMENTS: AlignmentInfo[] = [
  { id: 'tiny', name: 'Tiny (10 seq, 150 sites)', sequences: 10, sites: 150, filename: 'tiny.nex', category: 'tiny' },
  { id: 'small', name: 'Small (25 seq, 300 sites)', sequences: 25, sites: 300, filename: 'small.nex', category: 'small' },
  { id: 'medium-narrow', name: 'Medium Narrow (50 seq, 200 sites)', sequences: 50, sites: 200, filename: 'medium-narrow.nex', category: 'medium' },
  { id: 'medium', name: 'Medium (50 seq, 500 sites)', sequences: 50, sites: 500, filename: 'medium.nex', category: 'medium' },
  { id: 'medium-wide', name: 'Medium Wide (25 seq, 1000 sites)', sequences: 25, sites: 1000, filename: 'medium-wide.nex', category: 'medium' },
  { id: 'large-narrow', name: 'Large Narrow (100 seq, 300 sites)', sequences: 100, sites: 300, filename: 'large-narrow.nex', category: 'large' },
  { id: 'large', name: 'Large (100 seq, 600 sites)', sequences: 100, sites: 600, filename: 'large.nex', category: 'large' },
  { id: 'xlarge', name: 'X-Large (200 seq, 450 sites)', sequences: 200, sites: 450, filename: 'xlarge.nex', category: 'xlarge' }
];

/** Default benchmark configuration */
export const DEFAULT_CONFIG: BenchmarkConfig = {
  methods: ['fel', 'meme', 'slac'],
  alignments: ['tiny', 'small', 'medium', 'large'],
  iterations: 5,
  browsers: ['chromium', 'firefox', 'webkit'],
  runCli: true,
  verifyConcordance: true,
  concordanceTolerance: 1e-10,
  outputDir: './benchmark-results'
};

/** Calculate statistics from iteration times */
export function calculateStatistics(times: number[]): BenchmarkStatistics {
  const n = times.length;
  if (n === 0) {
    return {
      n: 0,
      mean: 0,
      stdDev: 0,
      standardError: 0,
      ci95: [0, 0],
      min: 0,
      max: 0,
      median: 0,
      cv: 0
    };
  }

  const sorted = [...times].sort((a, b) => a - b);
  const mean = times.reduce((sum, t) => sum + t, 0) / n;
  const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  const standardError = stdDev / Math.sqrt(n);
  const ci95: [number, number] = [mean - 1.96 * standardError, mean + 1.96 * standardError];
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  return {
    n,
    mean,
    stdDev,
    standardError,
    ci95,
    min: sorted[0],
    max: sorted[n - 1],
    median,
    cv: (stdDev / mean) * 100
  };
}
