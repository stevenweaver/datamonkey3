<!-- src/lib/AnalysisTimingEstimate.svelte -->
<script>
	import { currentFile, fileMetricsStore } from '../stores/fileInfo';
	import { calculateRuntimeEstimate, SPEED_CATEGORIES } from './utils/timingEstimates.js';

	// Props
	export let method = null;
	export let methodOptions = {};
	export let geneticCode = 'Universal';
	export let executionMode = 'backend'; // 'backend' or 'wasm'

	// Get sequence and site data from the appropriate store
	$: fileMetrics = $fileMetricsStore;
	$: sequences = fileMetrics?.FILE_INFO?.sequences || $currentFile?.sequences || 10;
	$: sites = fileMetrics?.FILE_INFO?.sites || $currentFile?.sites || 1000;

	// Calculate timing estimate using data-driven equations
	$: hasValidData = sequences > 0 && sites > 0;
	$: estimatedTime =
		method && hasValidData
			? calculateRuntimeEstimate(method, sequences, sites, executionMode, methodOptions)
			: null;

	// Get dataset info for display
	$: datasetInfo =
		$currentFile || fileMetrics
			? {
					sequences: sequences,
					sites: sites,
					filename: $currentFile?.filename || 'Unknown'
				}
			: null;
</script>

{#if estimatedTime && estimatedTime.minutes !== null}
	<div
		class="timing-estimate {SPEED_CATEGORIES[estimatedTime.category].bgColor} {SPEED_CATEGORIES[
			estimatedTime.category
		].borderColor} rounded-md border p-3"
	>
		<div class="timing-header">
			<span class="timing-icon">{SPEED_CATEGORIES[estimatedTime.category].icon}</span>
			<span class="timing-label {SPEED_CATEGORIES[estimatedTime.category].color}">
				{SPEED_CATEGORIES[estimatedTime.category].label}
			</span>
			<span class="timing-value {SPEED_CATEGORIES[estimatedTime.category].color}">
				{estimatedTime.description}
			</span>
		</div>

		{#if datasetInfo}
			<div class="dataset-info">
				<span class="dataset-details">
					{datasetInfo.sequences} sequences × {datasetInfo.sites} sites
				</span>
				{#if executionMode === 'wasm'}
					<span class="execution-mode">Local WASM</span>
					{#if estimatedTime.scalingFactor}
						<span class="scaling-factor" title="WASM performance scaling factor">
							{estimatedTime.scalingFactor}x scaling
						</span>
					{/if}
				{/if}
				{#if estimatedTime.reliability}
					<span class="reliability" title="Model R² value: {estimatedTime.reliability.toFixed(3)}">
						R² = {estimatedTime.reliability.toFixed(2)}
					</span>
				{/if}
			</div>
		{/if}

		{#if estimatedTime.category === 'very-slow' || estimatedTime.category === 'slow'}
			<div class="timing-warning">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="warning-icon"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="warning-text">
					Long-running analysis - consider using smaller datasets for testing
				</span>
			</div>
		{/if}
	</div>
{:else if method}
	<div class="timing-estimate rounded-md border border-gray-200 bg-gray-50 p-3">
		<div class="timing-header">
			<span class="timing-icon">⏱️</span>
			<span class="timing-label text-gray-600"> Timing Estimate </span>
			<span class="timing-value text-gray-600">
				{($currentFile || fileMetrics) && !hasValidData
					? 'Analyzing file...'
					: 'Upload file to estimate'}
			</span>
		</div>
	</div>
{/if}

<style>
	.timing-estimate {
		font-size: 13px;
		transition: all 0.2s ease;
	}

	.timing-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.timing-icon {
		font-size: 14px;
	}

	.timing-label {
		font-weight: 500;
	}

	.timing-value {
		font-weight: 600;
		margin-left: auto;
	}

	.dataset-info {
		margin-top: 4px;
		padding-left: 22px; /* Align with text after icon */
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.dataset-details {
		color: #64748b;
		font-size: 12px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
	}

	.execution-mode {
		font-size: 10px;
		padding: 1px 4px;
		background-color: #e0f2fe;
		color: #0369a1;
		border-radius: 3px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.reliability {
		font-size: 10px;
		padding: 1px 4px;
		background-color: #f0fdf4;
		color: #166534;
		border-radius: 3px;
		font-weight: 500;
		cursor: help;
	}

	.scaling-factor {
		font-size: 10px;
		padding: 1px 4px;
		background-color: #fef3c7;
		color: #92400e;
		border-radius: 3px;
		font-weight: 500;
		cursor: help;
	}

	.timing-warning {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 8px;
		padding: 6px 8px;
		background: rgba(251, 191, 36, 0.1);
		border: 1px solid rgba(251, 191, 36, 0.2);
		border-radius: 4px;
	}

	.warning-icon {
		width: 14px;
		height: 14px;
		color: #f59e0b;
		flex-shrink: 0;
	}

	.warning-text {
		color: #92400e;
		font-size: 11px;
		font-weight: 500;
	}
</style>
