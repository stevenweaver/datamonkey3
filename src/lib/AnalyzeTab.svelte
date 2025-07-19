<script>
	import { onMount } from 'svelte';
	import { currentFile } from '../stores/fileInfo';
	import { persistentFileStore } from '../stores/fileInfo';
	import { analysisStore, activeAnalysisProgress } from '../stores/analyses';
	import { treeStore } from '../stores/tree';
	import MethodSelector from './MethodSelector.svelte';
	import MethodOptionsTab from './MethodOptionsTab.svelte';
	import AnalysisHistory from './AnalysisHistory.svelte';
	import FileIndicator from './FileIndicator.svelte';
	import TabNavigation from './TabNavigation.svelte';
	import TreePrompt from './TreePrompt.svelte';

	// Props
	export let methodConfig = {};
	export let runMethod = () => {};
	export let selectedMethod = 'FEL'; // Default method for configuration
	export let hyphyOut = '';
	export let isStdOutVisible = false;
	export let toggleStdOut = () => {};
	export let showAllHistory = false;
	export let selectAnalysis = () => {};

	// Tab navigation
	export let activeTab = 'analyze';
	export let onChange = (tab) => {};

	// Local state
	let expandedSection = 'quick'; // 'quick', 'advanced', 'history'

	// Tree detection
	$: hasTree = $treeStore && ($treeStore.nj || $treeStore.usertree);

	// Handle tree generation prompt
	function handleGenerateTreeClick() {
		// Navigate to the Data tab
		onChange('data');
	}

	// Toggle section expansion
	function toggleSection(section) {
		expandedSection = expandedSection === section ? null : section;
	}

	// Configure method from selector
	function handleConfigureMethod(method) {
		selectedMethod = method;
		expandedSection = 'advanced';
	}
</script>

<div class="analyze-tab">

	<!-- File Indicator (visible when a file is selected) -->
	<FileIndicator />

	<!-- Tree Prompt (shown if no tree is available) -->
	<TreePrompt onGenerateClick={handleGenerateTreeClick} />

	<!-- Quick Analysis Section (expanded by default) -->
	<div class="mb-premium-xl rounded-premium border border-border-platinum bg-white shadow-premium">
		<div
			class="flex cursor-pointer items-center justify-between rounded-t-premium bg-brand-whisper p-premium-md transition-all duration-premium hover:bg-brand-ghost"
			on:click={() => toggleSection('quick')}
		>
			<h2 class="text-premium-header font-semibold text-text-rich">Quick Analysis</h2>
			<div class="flex items-center">
				{#if $currentFile}
					<button
						on:click={(e) => {
							e.stopPropagation();
							toggleStdOut();
						}}
						class="mr-premium-md rounded-premium-sm bg-brand-royal px-premium-md py-premium-xs text-premium-meta font-medium text-white transition-all duration-premium hover:bg-brand-deep"
					>
						{isStdOutVisible ? 'Hide Console' : 'Show Console'}
					</button>
				{/if}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-brand-royal transition-transform duration-premium"
					class:rotate-180={expandedSection === 'quick'}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</div>
		</div>

		{#if expandedSection === 'quick'}
			<div class="p-premium-lg">
				{#if $currentFile}
					<div class="grid grid-cols-1 gap-premium-md md:grid-cols-2">
						<!-- Method selection cards -->
						<div class="md:col-span-2">
							<MethodSelector
								{methodConfig}
								{runMethod}
								onConfigureMethod={handleConfigureMethod}
							/>
						</div>

						<!-- Console output (conditionally shown) -->
						{#if isStdOutVisible}
							<div class="md:col-span-2">
								<h3 class="mb-premium-sm text-premium-title font-semibold text-text-rich">
									Console Output
								</h3>
								<pre
									class="code-output h-48 overflow-auto rounded-premium bg-text-rich p-premium-md text-premium-meta text-white text-opacity-90">{hyphyOut}</pre>
							</div>
						{/if}
					</div>
				{:else if $persistentFileStore && $persistentFileStore.files && $persistentFileStore.files.length > 0}
					<div
						class="rounded-premium border border-border-platinum bg-brand-whisper p-premium-xl text-center"
					>
						<p class="text-premium-body text-text-slate">
							Select a file from the list to run analyses
						</p>
					</div>
				{:else}
					<div
						class="rounded-premium border border-border-platinum bg-brand-whisper p-premium-xl text-center"
					>
						<p class="text-premium-body text-text-slate">
							Upload a file in the Data tab to run analyses
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Advanced Options Section (collapsible) -->
	<div class="mb-premium-xl rounded-premium border border-border-platinum bg-white shadow-premium">
		<div
			class="flex cursor-pointer items-center justify-between rounded-t-premium bg-brand-whisper p-premium-md transition-all duration-premium hover:bg-brand-ghost"
			on:click={() => toggleSection('advanced')}
		>
			<h2 class="text-premium-header font-semibold text-text-rich">Advanced Options</h2>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 text-brand-royal transition-transform duration-premium"
				class:rotate-180={expandedSection === 'advanced'}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>

		{#if expandedSection === 'advanced'}
			<div class="p-premium-lg">
				{#if $currentFile}
					<MethodOptionsTab {runMethod} {selectedMethod} />
				{:else}
					<div
						class="rounded-premium border border-border-platinum bg-brand-whisper p-premium-xl text-center"
					>
						<p class="text-premium-body text-text-slate">
							Upload or select a file to configure advanced options
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Analysis History Section (collapsible) -->
	<div class="mb-premium-xl rounded-premium border border-border-platinum bg-white shadow-premium">
		<div
			class="flex cursor-pointer items-center justify-between rounded-t-premium bg-brand-whisper p-premium-md transition-all duration-premium hover:bg-brand-ghost"
			on:click={() => toggleSection('history')}
		>
			<h2 class="text-premium-header font-semibold text-text-rich">Recent Analyses</h2>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 text-brand-royal transition-transform duration-premium"
				class:rotate-180={expandedSection === 'history'}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>

		{#if expandedSection === 'history'}
			<div class="p-premium-lg">
				<AnalysisHistory
					filterByCurrentFile={!showAllHistory && !!$currentFile}
					onSelectAnalysis={selectAnalysis}
					redirectToResults={true}
				/>
			</div>
		{/if}
	</div>

	<!-- Tab Navigation -->
	<TabNavigation {activeTab} {onChange} />
</div>

<style>
	.code-output {
		font-family: monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
