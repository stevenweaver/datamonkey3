<script>
	import { writable } from 'svelte/store';

	// Props
	export let method = 'fel';
	export let methodOptions = {};
	export let geneticCode = 'Universal';
	export let datasetSize = 'medium';

	// Mock file data for different dataset sizes
	const mockFileData = {
		small: {
			id: 'small-dataset',
			filename: 'small_alignment.fasta',
			size: 1024 * 50, // 50KB
			sequences: 10,
			sites: 500,
			partitions: [],
			createdAt: Date.now()
		},
		medium: {
			id: 'medium-dataset',
			filename: 'medium_alignment.fasta',
			size: 1024 * 500, // 500KB
			sequences: 50,
			sites: 2000,
			partitions: [],
			createdAt: Date.now()
		},
		large: {
			id: 'large-dataset',
			filename: 'large_alignment.fasta',
			size: 1024 * 2000, // 2MB
			sequences: 200,
			sites: 5000,
			partitions: [],
			createdAt: Date.now()
		}
	};

	// Create a mock currentFile store for this component instance
	const mockCurrentFile = writable(datasetSize ? mockFileData[datasetSize] : null);

	// Update when datasetSize changes
	$: mockCurrentFile.set(datasetSize ? mockFileData[datasetSize] : null);
	// Base timing estimates (in minutes) for different methods - copied from original component
	const BASE_TIMING_ESTIMATES = {
		fel: { base: 3, perSequence: 0.1, perSite: 0.01 },
		meme: { base: 8, perSequence: 0.3, perSite: 0.05 },
		slac: { base: 1.5, perSequence: 0.05, perSite: 0.005 },
		fubar: { base: 15, perSequence: 0.2, perSite: 0.03 },
		absrel: { base: 30, perSequence: 1.2, perSite: 0.1 },
		busted: { base: 25, perSequence: 0.8, perSite: 0.08 },
		gard: { base: 120, perSequence: 5, perSite: 0.5 },
		bgm: { base: 240, perSequence: 10, perSite: 2 },
		fade: { base: 45, perSequence: 1.5, perSite: 0.15 },
		relax: { base: 35, perSequence: 1, perSite: 0.1 },
		'multi-hit': { base: 20, perSequence: 0.6, perSite: 0.06 },
		nrm: { base: 40, perSequence: 1.2, perSite: 0.12 },
		'contrast-fel': { base: 18, perSequence: 0.4, perSite: 0.04 }
	};

	// Method complexity multipliers based on advanced options
	const COMPLEXITY_MULTIPLIERS = {
		rateClasses: (value) => Math.max(1, value / 3),
		mcmcSamples: (value) => Math.max(1, value / 2000000),
		mcmcChains: (value) => Math.max(1, value / 5),
		gridPoints: (value) => Math.max(1, value / 20),
		maxBreakpoints: (value) => Math.max(1, value / 10),
		chainLength: (value) => Math.max(1, value / 2500000),
		confidenceIntervals: (enabled) => (enabled ? 1.3 : 1),
		ancestralSequences: (enabled) => (enabled ? 1.5 : 1),
		synonymousRateVariation: (enabled) => (enabled ? 1.2 : 1),
		siteToSiteRateVariation: (enabled) => (enabled ? 1.4 : 1)
	};

	// Speed categories with icons and descriptions
	const SPEED_CATEGORIES = {
		'very-fast': {
			icon: '⚡⚡',
			label: 'Very Fast',
			color: 'text-green-600',
			bgColor: 'bg-green-50',
			borderColor: 'border-green-200'
		},
		fast: {
			icon: '⚡',
			label: 'Fast',
			color: 'text-green-500',
			bgColor: 'bg-green-50',
			borderColor: 'border-green-200'
		},
		medium: {
			icon: '⏱️',
			label: 'Medium',
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50',
			borderColor: 'border-yellow-200'
		},
		slow: {
			icon: '🐢',
			label: 'Slow',
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
			borderColor: 'border-orange-200'
		},
		'very-slow': {
			icon: '🐌',
			label: 'Very Slow',
			color: 'text-red-600',
			bgColor: 'bg-red-50',
			borderColor: 'border-red-200'
		}
	};

	// Calculate timing estimate based on method, dataset, and options
	$: estimatedTime = calculateTimingEstimate(method, $mockCurrentFile, methodOptions);

	function calculateTimingEstimate(selectedMethod, fileData, options) {
		if (!selectedMethod || !fileData) {
			return null;
		}

		const methodKey = selectedMethod.toLowerCase();
		const baseEstimate = BASE_TIMING_ESTIMATES[methodKey];

		if (!baseEstimate) {
			return {
				minutes: null,
				category: 'medium',
				description: 'Timing estimate not available'
			};
		}

		// Get dataset characteristics
		const numSequences = fileData.sequences || 10;
		const numSites = fileData.sites || 1000;

		// Base calculation
		let totalMinutes =
			baseEstimate.base + baseEstimate.perSequence * numSequences + baseEstimate.perSite * numSites;

		// Apply complexity multipliers based on advanced options
		if (options) {
			for (const [optionKey, optionValue] of Object.entries(options)) {
				const multiplier = COMPLEXITY_MULTIPLIERS[optionKey];
				if (multiplier && optionValue !== undefined) {
					totalMinutes *= multiplier(optionValue);
				}
			}
		}

		// Determine speed category
		let category;
		if (totalMinutes < 2) category = 'very-fast';
		else if (totalMinutes < 10) category = 'fast';
		else if (totalMinutes < 30) category = 'medium';
		else if (totalMinutes < 120) category = 'slow';
		else category = 'very-slow';

		return {
			minutes: Math.round(totalMinutes),
			category,
			description: formatTimeDescription(totalMinutes)
		};
	}

	function formatTimeDescription(minutes) {
		if (minutes < 1) {
			return '< 1 minute';
		} else if (minutes < 60) {
			return `~${Math.round(minutes)} min`;
		} else if (minutes < 1440) {
			const hours = Math.floor(minutes / 60);
			const remainingMins = Math.round(minutes % 60);
			if (remainingMins === 0) {
				return `~${hours} hour${hours > 1 ? 's' : ''}`;
			}
			return `~${hours}h ${remainingMins}m`;
		} else {
			const days = Math.floor(minutes / 1440);
			const remainingHours = Math.round((minutes % 1440) / 60);
			if (remainingHours === 0) {
				return `~${days} day${days > 1 ? 's' : ''}`;
			}
			return `~${days}d ${remainingHours}h`;
		}
	}

	// Get dataset info for display
	$: datasetInfo = $mockCurrentFile
		? {
				sequences: $mockCurrentFile.sequences || 0,
				sites: $mockCurrentFile.sites || 0,
				filename: $mockCurrentFile.filename || 'Unknown'
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
				{$mockCurrentFile ? 'Calculating...' : 'Upload file to estimate'}
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
		padding-left: 22px;
		font-size: 11px;
		color: #6b7280;
	}

	.dataset-details {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
	}

	.timing-warning {
		margin-top: 8px;
		padding: 6px 8px;
		background-color: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 4px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.warning-icon {
		width: 14px;
		height: 14px;
		color: #d97706;
		flex-shrink: 0;
	}

	.warning-text {
		font-size: 11px;
		color: #92400e;
		line-height: 1.3;
	}
</style>