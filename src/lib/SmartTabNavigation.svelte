<script>
	import { persistentFileStore, currentFile } from '../stores/fileInfo';
	import { analysisStore } from '../stores/analyses';

	export let activeTab = 'data';
	export let onChange = (tabName) => {};
	export let showRunningIndicator = false;

	// Reactive variables to track state conditions
	$: hasFiles = $persistentFileStore?.files?.length > 0;
	$: hasAnalyses = $analysisStore?.analyses?.length > 0;

	// Logic to determine if a tab should be disabled
	$: isAnalyzeDisabled = !hasFiles;
	$: isResultsDisabled = !hasAnalyses;

	// Function to handle tab clicks with context-aware behavior
	function handleTabClick(tabName) {
		// Data tab is always accessible
		if (tabName === 'data') {
			onChange(tabName);
			return;
		}

		// Analyze tab requires at least one file
		if (tabName === 'analyze') {
			if (!isAnalyzeDisabled) {
				onChange(tabName);
			}
			return;
		}

		// Results tab requires at least one analysis
		if (tabName === 'results') {
			if (!isResultsDisabled) {
				onChange(tabName);
			}
			return;
		}
	}
</script>

<div class="mb-premium-xl">
	<div class="rounded-premium bg-brand-ghost p-premium-xs">
		<div class="flex border-b border-border-platinum">
			<!-- Data Tab - Always Enabled -->
			<button
				class="relative px-premium-xl py-premium-lg text-premium-brand font-semibold transition-all duration-premium"
				class:text-brand-royal={activeTab === 'data'}
				class:text-text-rich={activeTab !== 'data'}
				class:hover:text-brand-royal={activeTab !== 'data'}
				class:hover:bg-brand-whisper={activeTab !== 'data'}
				on:click={() => handleTabClick('data')}
				title="Manage sequence data"
			>
				<span class="flex items-center">
					<div
						class="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border"
						class:bg-brand-royal={activeTab === 'data'}
						class:text-white={activeTab === 'data'}
						class:border-brand-royal={activeTab === 'data'}
						class:bg-white={activeTab !== 'data'}
						class:text-text-rich={activeTab !== 'data'}
						class:border-text-slate={activeTab !== 'data'}
					>
						<span class="text-sm font-bold">1</span>
					</div>
					Data
				</span>
				{#if activeTab === 'data'}
					<div class="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-copper"></div>
				{/if}
			</button>

			<!-- Analyze Tab - Disabled until data is available -->
			<button
				class="relative px-premium-xl py-premium-lg text-premium-brand font-semibold transition-all duration-premium"
				class:text-brand-royal={activeTab === 'analyze' && !isAnalyzeDisabled}
				class:text-text-rich={activeTab !== 'analyze' && !isAnalyzeDisabled}
				class:text-text-silver={isAnalyzeDisabled}
				class:hover:text-brand-royal={activeTab !== 'analyze' && !isAnalyzeDisabled}
				class:hover:bg-brand-whisper={activeTab !== 'analyze' && !isAnalyzeDisabled}
				class:cursor-not-allowed={isAnalyzeDisabled}
				class:opacity-60={isAnalyzeDisabled}
				on:click={() => handleTabClick('analyze')}
				title={isAnalyzeDisabled ? 'Upload data first' : 'Run analysis on selected data'}
				aria-disabled={isAnalyzeDisabled}
			>
				<span class="flex items-center">
					<div
						class="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border"
						class:bg-brand-royal={activeTab === 'analyze' && !isAnalyzeDisabled}
						class:text-white={activeTab === 'analyze' && !isAnalyzeDisabled}
						class:border-brand-royal={activeTab === 'analyze' && !isAnalyzeDisabled}
						class:bg-white={activeTab !== 'analyze' && !isAnalyzeDisabled}
						class:text-text-rich={activeTab !== 'analyze' && !isAnalyzeDisabled}
						class:border-text-slate={activeTab !== 'analyze' && !isAnalyzeDisabled}
						class:bg-gray-100={isAnalyzeDisabled}
						class:text-text-silver={isAnalyzeDisabled}
						class:border-gray-200={isAnalyzeDisabled}
					>
						<span class="text-sm font-bold">2</span>
					</div>
					Analyze
				</span>
				{#if showRunningIndicator && !isAnalyzeDisabled}
					<span
						class="ml-2 inline-flex animate-pulse-premium items-center rounded-premium-xl bg-brand-royal px-2.5 py-0.5 text-premium-caption font-semibold tracking-premium-badge text-white"
					>
						Running
					</span>
				{/if}
				{#if activeTab === 'analyze' && !isAnalyzeDisabled}
					<div class="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-copper"></div>
				{/if}
			</button>

			<!-- Results Tab - Disabled until analyses exist -->
			<button
				class="relative px-premium-xl py-premium-lg text-premium-brand font-semibold transition-all duration-premium"
				class:text-brand-royal={activeTab === 'results' && !isResultsDisabled}
				class:text-text-rich={activeTab !== 'results' && !isResultsDisabled}
				class:text-text-silver={isResultsDisabled}
				class:hover:text-brand-royal={activeTab !== 'results' && !isResultsDisabled}
				class:hover:bg-brand-whisper={activeTab !== 'results' && !isResultsDisabled}
				class:cursor-not-allowed={isResultsDisabled}
				class:opacity-60={isResultsDisabled}
				on:click={() => handleTabClick('results')}
				title={isResultsDisabled ? 'Run analysis first' : 'View analysis results'}
				aria-disabled={isResultsDisabled}
			>
				<span class="flex items-center">
					<div
						class="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border"
						class:bg-brand-royal={activeTab === 'results' && !isResultsDisabled}
						class:text-white={activeTab === 'results' && !isResultsDisabled}
						class:border-brand-royal={activeTab === 'results' && !isResultsDisabled}
						class:bg-white={activeTab !== 'results' && !isResultsDisabled}
						class:text-text-rich={activeTab !== 'results' && !isResultsDisabled}
						class:border-text-slate={activeTab !== 'results' && !isResultsDisabled}
						class:bg-gray-100={isResultsDisabled}
						class:text-text-silver={isResultsDisabled}
						class:border-gray-200={isResultsDisabled}
					>
						<span class="text-sm font-bold">3</span>
					</div>
					Results
				</span>
				{#if activeTab === 'results' && !isResultsDisabled}
					<div class="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-copper"></div>
				{/if}
			</button>
		</div>
	</div>
</div>

<style>
	/* Add styles for custom tooltip on hover */
	button[title]:hover::after {
		content: attr(title);
		position: absolute;
		bottom: -30px;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--tw-text-rich, #111827);
		color: white;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		white-space: nowrap;
		z-index: 10;
		pointer-events: none;
		opacity: 0;
		animation: fadeIn 0.2s ease-in-out forwards;
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}
</style>
