<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import AnalysisCard from '../lib/AnalysisCard.svelte';

	// Accept mocked stores as props for Storybook
	export let mockAnalysisStore = null;
	export let mockPersistentFileStore = null;
	export let mockCurrentFile = null;

	// Props (same as original component)
	export let onSelectAnalysis = (id) => {}; // Callback when analysis is selected
	export let filterByCurrentFile = false; // Whether to show only analyses for the current file
	export let compact = false; // Whether to use compact view
	export let redirectToResults = false; // Whether to redirect to Results tab when selecting an analysis

	// Use mocked stores if provided, otherwise create defaults
	const defaultAnalysisStore = writable({ 
		analyses: [], 
		isLoading: false, 
		error: null,
		currentAnalysisId: null
	});
	const defaultPersistentFileStore = writable({ files: [] });
	const defaultCurrentFile = writable(null);

	const analysisStore = mockAnalysisStore || defaultAnalysisStore;
	const persistentFileStore = mockPersistentFileStore || defaultPersistentFileStore;
	const currentFile = mockCurrentFile || defaultCurrentFile;

	// Define sortedAnalyses variable first
	let sortedAnalyses = [];

	// Store subscriptions - exclude datareader analyses as they're just file processing
	$: filteredAnalyses =
		filterByCurrentFile && $currentFile
			? $analysisStore.analyses.filter(
					(analysis) => analysis.fileId === $currentFile.id && analysis.method !== 'datareader'
			  )
			: $analysisStore.analyses.filter((analysis) => analysis.method !== 'datareader');

	// Sort analyses by creation date (most recent first)
	$: sortedAnalyses = filteredAnalyses.sort((a, b) => {
		const aTime = a.createdAt || 0;
		const bTime = b.createdAt || 0;
		return bTime - aTime;
	});

	// Function to get filename for an analysis
	function getFilenameForAnalysis(fileId) {
		if (!$persistentFileStore?.files) return 'Unknown file';
		const file = $persistentFileStore.files.find((f) => f.id === fileId);
		return file ? file.filename || file.name || 'Unknown file' : 'Unknown file';
	}

	// Function to handle analysis selection
	function handleSelectAnalysis(id) {
		console.log('Analysis selected:', id);
		onSelectAnalysis(id);

		if (redirectToResults && browser) {
			// Navigate to results tab
			const event = new CustomEvent('navigate-to-results', {
				detail: { analysisId: id }
			});
			window.dispatchEvent(event);
		}
	}
</script>

<div class="analysis-history">
	{#if $analysisStore.isLoading}
		<div class="loading-state text-center p-8">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<p class="mt-4 text-gray-600">Loading analysis history...</p>
		</div>
	{:else if $analysisStore.error}
		<div class="error-state text-center p-8">
			<div class="text-red-600 mb-4">
				<svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Analysis History</h3>
			<p class="text-gray-600">{$analysisStore.error}</p>
		</div>
	{:else if sortedAnalyses.length === 0}
		<div class="empty-state text-center p-8">
			<div class="text-gray-400 mb-4">
				<svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No Analysis History</h3>
			<p class="text-gray-600">
				{filterByCurrentFile && $currentFile
					? 'No analyses found for the current file.'
					: 'No analyses have been run yet.'}
			</p>
		</div>
	{:else}
		<div class="analyses-list space-y-4">
			{#each sortedAnalyses as analysis (analysis.id)}
				<AnalysisCard
					{analysis}
					filename={getFilenameForAnalysis(analysis.fileId)}
					{compact}
					onSelect={() => handleSelectAnalysis(analysis.id)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.analysis-history {
		width: 100%;
	}

	.loading-state,
	.error-state,
	.empty-state {
		min-height: 200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.analyses-list {
		padding: 0;
	}
</style>