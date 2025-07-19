<script>
	import { onMount } from 'svelte';
	import { analysisStore } from '../stores/analyses';
	import { persistentFileStore, currentFile } from '../stores/fileInfo';
	import { browser } from '$app/environment';
	import AnalysisCard from './AnalysisCard.svelte';

	// Props
	export let onSelectAnalysis = (id) => {}; // Callback when analysis is selected
	export let filterByCurrentFile = false; // Whether to show only analyses for the current file
	export let compact = false; // Whether to use compact view
	export let redirectToResults = false; // Whether to redirect to Results tab when selecting an analysis

	// Define sortedAnalyses variable first
	let sortedAnalyses = [];

	// Store subscriptions - exclude datareader analyses as they're just file processing
	$: filteredAnalyses =
		filterByCurrentFile && $currentFile
			? $analysisStore.analyses.filter(
					(a) => a.fileId === $currentFile.id && a.method !== 'datareader'
				)
			: $analysisStore.analyses.filter((a) => a.method !== 'datareader');

	// Sort analyses by date (newest first)
	$: {
		console.log('AnalysisHistory: Got filteredAnalyses:', filteredAnalyses.length, 'analyses');
		sortedAnalyses = [...filteredAnalyses].sort((a, b) => b.createdAt - a.createdAt);
		console.log(
			'AnalysisHistory: Sorted analyses:',
			sortedAnalyses.map((a) => `${a.id} (${a.method})`)
		);
	}

	// Group analyses by file
	$: analysesGroupedByFile = sortedAnalyses.reduce((groups, analysis) => {
		const fileId = analysis.fileId;
		if (!groups[fileId]) {
			groups[fileId] = [];
		}
		groups[fileId].push(analysis);
		return groups;
	}, {});

	// Get file name from file ID
	function getFileName(fileId) {
		const file = $persistentFileStore.files.find((f) => f.id === fileId);
		return file ? file.filename : 'Unknown file';
	}

	// Delete an analysis
	async function deleteAnalysis(analysisId) {
		if (confirm('Are you sure you want to delete this analysis?')) {
			try {
				await analysisStore.deleteAnalysis(analysisId);
			} catch (error) {
				console.error('Error deleting analysis:', error);
			}
		}
	}

	// Handle card selection
	function handleSelect(event) {
		const { analysisId } = event.detail;
		onSelectAnalysis(analysisId);

		// If redirectToResults is true, switch to Results tab
		if (redirectToResults) {
			// Use custom event to communicate with parent
			dispatchEvent(
				new CustomEvent('switchTab', {
					detail: { tabName: 'results', analysisId },
					bubbles: true
				})
			);
		}
	}

	// Handle view action
	function handleView(event) {
		const { analysisId } = event.detail;
		onSelectAnalysis(analysisId);

		// If redirectToResults is true, switch to Results tab
		if (redirectToResults) {
			// Use custom event to communicate with parent
			dispatchEvent(
				new CustomEvent('switchTab', {
					detail: { tabName: 'results', analysisId },
					bubbles: true
				})
			);
		}
	}

	// Handle export action
	function handleExport(event) {
		const { analysisId } = event.detail;
		// Implement export functionality
	}

	// Handle compare action
	function handleCompare(event) {
		const { analysisId } = event.detail;
		// Implementation depends on comparison UI
	}

	// Load analyses on mount
	onMount(async () => {
		if (browser) {
			try {
				await analysisStore.loadAnalyses();
			} catch (error) {
				console.error('Error loading analyses:', error);
			}
		}
	});
</script>

<div class="analysis-history">

	{#if $analysisStore.isLoading}
		<div class="flex items-center justify-center p-4">
			<svg
				class="mr-2 h-4 w-4 animate-spin"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			<span>Loading analyses...</span>
		</div>
	{:else if $analysisStore.error}
		<div class="rounded border border-red-300 bg-red-50 p-3 text-red-800">
			<p>Error: {$analysisStore.error}</p>
		</div>
	{:else if sortedAnalyses.length === 0}
		<div class="rounded border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
			<div class="flex flex-col items-center">
				<svg
					class="mb-3 h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
					></path>
				</svg>
				<p class="font-medium">
					No analyses found{filterByCurrentFile ? ' for the current file' : ''}.
				</p>
				<p class="mt-2 text-sm">Run an analysis method (FEL, SLAC, etc.) to see results here.</p>
			</div>
		</div>
	{:else}
		<div class="max-h-[500px] overflow-y-auto pr-1">
			{#if !filterByCurrentFile}
				<!-- Group by file when not filtering -->
				{#each Object.entries(analysesGroupedByFile) as [fileId, analyses]}
					<div class="mb-4">
						<h3 class="mb-2 bg-gray-100 p-2 text-sm font-semibold">{getFileName(fileId)}</h3>
						<div class="analysis-cards">
							{#each analyses as analysis (analysis.id)}
								<AnalysisCard
									{analysis}
									{compact}
									selected={analysis.id === $analysisStore.currentAnalysisId}
									on:select={handleSelect}
									on:view={handleView}
									on:export={handleExport}
									on:compare={handleCompare}
								/>
							{/each}
						</div>
					</div>
				{/each}
			{:else}
				<!-- Simple list when filtering by current file -->
				<div class="analysis-cards">
					{#each sortedAnalyses as analysis (analysis.id)}
						<AnalysisCard
							{analysis}
							{compact}
							selected={analysis.id === $analysisStore.currentAnalysisId}
							on:select={handleSelect}
							on:view={handleView}
							on:export={handleExport}
							on:compare={handleCompare}
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
