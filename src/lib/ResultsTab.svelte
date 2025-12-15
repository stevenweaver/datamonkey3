<script>
	import { onMount } from 'svelte';
	import { analysisStore } from '../stores/analyses';
	import { currentFile, fileMetricsStore } from '../stores/fileInfo';
	import AnalysisResultViewer from './AnalysisResultViewer.svelte';
	import AnalysisHistory from './AnalysisHistory.svelte';
	import BatchExport from './BatchExport.svelte';
	import FastaExport from './FastaExport.svelte';
	import TabNavigation from './TabNavigation.svelte';
	import { Trash2, BarChart3, Info } from 'lucide-svelte';

	// Props
	export let selectedAnalysisId = null;
	export let selectAnalysis = () => {};
	export let showAllHistory = false;
	export let showBatchExport = false;
	export let toggleBatchExport = () => {};

	// Tab navigation
	export let activeTab = 'results';
	export let onChange = (tab) => {};

	// Handle Clear All analyses
	async function handleClearAll() {
		const filteredAnalyses = $analysisStore.analyses.filter((a) => a.method !== 'datareader');
		if (filteredAnalyses.length === 0) return;

		const confirmMessage = `Are you sure you want to delete all ${filteredAnalyses.length} analyses? This action cannot be undone.`;

		if (confirm(confirmMessage)) {
			try {
				await analysisStore.clearAllAnalyses();
			} catch (error) {
				console.error('Error clearing all analyses:', error);
				alert('Failed to clear analyses: ' + error.message);
			}
		}
	}
</script>

<div class="results-tab">
	<!-- Export Options -->
	<div
		class="mb-premium-xl rounded-premium border border-border-platinum bg-white p-premium-lg shadow-premium"
	>
		<h2 class="mb-premium-md text-premium-header font-semibold text-text-rich">Export Options</h2>

		<div class="grid grid-cols-1 gap-premium-lg md:grid-cols-2">
			<!-- Sequence Data Export (if file metrics available) -->
			{#if $fileMetricsStore}
				<div class="border-r border-border-platinum pr-premium-lg">
					<h3 class="mb-premium-sm text-premium-title font-semibold">Sequence Data Export</h3>
					<FastaExport fileMetricsJSON={$fileMetricsStore} />
				</div>
			{/if}

			<!-- Analysis Results Export -->
			<div class={$fileMetricsStore ? '' : 'col-span-2'}>
				<h3 class="mb-premium-sm text-premium-title font-semibold">Analysis Results Export</h3>
				{#if showBatchExport}
					<BatchExport />
				{:else}
					<button
						on:click={toggleBatchExport}
						class="rounded bg-accent-copper px-4 py-2 font-medium text-white transition-colors hover:bg-accent-warm"
					>
						Show Batch Export
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Main content area -->
	<div class="grid grid-cols-1 gap-premium-xl lg:grid-cols-3">
		<!-- Left column: Analysis history -->
		<div class="rounded-premium bg-white p-premium-lg shadow-premium lg:col-span-1">
			<div class="mb-premium-md flex items-center justify-between">
				<h2 class="text-premium-header font-semibold text-text-rich">Analyses</h2>
				{#if $analysisStore.analyses.filter((a) => a.method !== 'datareader').length > 0}
					<button
						on:click={handleClearAll}
						class="inline-flex items-center rounded bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
						title="Delete all analyses"
					>
						<Trash2 class="mr-1 h-3 w-3" />
						Clear All
					</button>
				{/if}
			</div>
			<AnalysisHistory
				filterByCurrentFile={!showAllHistory && !!$currentFile}
				onSelectAnalysis={selectAnalysis}
			/>
		</div>

		<!-- Right column: Analysis results (expanded) -->
		<div class="rounded-premium bg-white p-premium-lg shadow-premium lg:col-span-2">
			<h2 class="mb-premium-md text-premium-header font-semibold text-text-rich">
				Analysis Results
			</h2>
			{#if selectedAnalysisId}
				<AnalysisResultViewer analysisId={selectedAnalysisId} />
			{:else if $analysisStore.analyses.filter((a) => a.method !== 'datareader').length > 0}
				<div
					class="flex h-64 flex-col items-center justify-center rounded-premium bg-brand-whisper text-center"
				>
					<div class="mb-premium-md">
						<BarChart3 class="text-text-muted mx-auto mb-premium-sm h-16 w-16" strokeWidth={1.5} />
						<h3 class="mb-premium-xs text-premium-title font-semibold text-text-rich">
							Select an Analysis
						</h3>
						<p class="text-premium-body text-text-slate">
							Choose an analysis from the history to view detailed results
						</p>
					</div>
				</div>
			{:else}
				<div
					class="flex h-64 flex-col items-center justify-center rounded-premium bg-brand-whisper text-center"
				>
					<div class="mb-premium-md">
						<Info class="text-text-muted mx-auto mb-premium-sm h-16 w-16" strokeWidth={1.5} />
						<h3 class="mb-premium-xs text-premium-title font-semibold text-text-rich">
							No Analyses Yet
						</h3>
						<p class="mb-premium-md text-premium-body text-text-slate">
							You haven't run any analyses yet. Get started by uploading a file and running an
							analysis method.
						</p>
						<button
							on:click={() => onChange('analyze')}
							class="rounded-premium bg-brand-royal px-premium-md py-premium-sm font-medium text-white transition-colors hover:bg-brand-deep"
						>
							Go to Analyze Tab
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="mt-premium-xl">
		<TabNavigation {activeTab} {onChange} />
	</div>
</div>
