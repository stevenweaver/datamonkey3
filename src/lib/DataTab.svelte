<script>
	import { onMount } from 'svelte';
	import { fileMetricsStore, currentFile } from '../stores/fileInfo';
	import DataReaderResults from './dataReaderResults.svelte';
	import FastaValidator from './FastaValidator.svelte';
	import SequenceWarnings from './SequenceWarnings.svelte';
	import FileManager from './FileManager.svelte';
	import ErrorHandler from './ErrorHandler.svelte';
	import DemoFileSelector from './DemoFileSelector.svelte';
	import TabNavigation from './TabNavigation.svelte';
	import TreeInferenceSection from './TreeInferenceSection.svelte';

	// Props
	export let handleFileUpload = () => {};
	export let handleDemoFileSelect = () => {};
	export let validationError = null;
	export let fileMetricsJSON = null;
	export let handleValidated = () => {};
	export let handleUseRepaired = () => {};

	// Tab navigation
	export let activeTab = 'data';
	export let onChange = (tab) => {};

	// Tree inference
	let treeGenerated = false;

	function handleTreeGenerated() {
		treeGenerated = true;
	}

	// Computed props
	$: hasFileMetrics = !!fileMetricsJSON && Object.keys(fileMetricsJSON).length > 0;
	$: warnings = hasFileMetrics && fileMetricsJSON.WARNINGS ? fileMetricsJSON.WARNINGS : [];
</script>

<div class="data-tab">
	<div class="mb-premium-xl">
		<h2 class="mb-premium-md text-premium-header font-semibold text-text-rich">Data Input</h2>

		<div class="flex flex-wrap gap-premium-md">
			<div class="min-w-[300px] flex-grow">
				<label
					for="file-upload"
					class="mb-premium-xs block text-premium-body font-medium text-text-slate"
					>Upload Sequence File:</label
				>
				<input
					id="file-upload"
					type="file"
					on:change={handleFileUpload}
					class="file-input w-full"
				/>
			</div>

			<div class="min-w-[300px] flex-grow">
				<DemoFileSelector
					on:selectFile={handleDemoFileSelect}
					on:error={(e) => (validationError = { message: e.detail.message })}
				/>
			</div>
		</div>

		<!-- Error display -->
		<ErrorHandler
			error={validationError}
			level="error"
			on:dismiss={() => (validationError = null)}
		/>
	</div>

	<!-- File Management Section -->
	<div class="mb-premium-xl">
		<FileManager onSelectFile={handleFileUpload} />
	</div>

	<!-- File Information Section -->
	{#if hasFileMetrics}
		<div class="mb-premium-xl">
			<h2 class="mb-premium-md text-premium-header font-semibold text-text-rich">
				Sequence Data Information
			</h2>
			<div
				class="rounded-premium border border-border-platinum bg-white p-premium-lg shadow-premium"
			>
				<DataReaderResults {fileMetricsJSON} />
			</div>
		</div>

		<!-- Sequence Warnings Section (if any) -->
		{#if warnings && warnings.length > 0}
			<div class="mb-premium-xl">
				<h2 class="mb-premium-md text-premium-header font-semibold text-text-rich">
					Sequence Warnings
				</h2>
				<div
					class="rounded-premium border border-accent-cream bg-accent-pearl p-premium-lg shadow-premium"
				>
					<SequenceWarnings {warnings} />
				</div>
			</div>
		{/if}

		<!-- Export functionality moved to Results tab for unified export experience -->

		<!-- Tree Inference Section -->
		<TreeInferenceSection onTreeGenerated={handleTreeGenerated} />
	{:else}
		<div
			class="my-premium-xl rounded-premium border border-border-platinum bg-brand-whisper p-premium-xl text-center"
		>
			<p class="text-premium-body text-text-slate">
				Upload or select a file to view sequence data information
			</p>
		</div>
	{/if}

	<!-- Tab Navigation -->
	<TabNavigation {activeTab} {onChange} />
</div>

<style>
	.file-input {
		border: 1px solid var(--tw-border-platinum, #f1f5f9);
		padding: 0.75rem;
		border-radius: 0.5rem;
		background-color: white;
	}
</style>
