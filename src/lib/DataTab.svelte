<script>
	import { fileMetricsStore, currentFile, alignmentFileStore } from '../stores/fileInfo';
	import { treeStore } from '../stores/tree';
	import DataReaderResults from './dataReaderResults.svelte';
	import FastaValidator from './FastaValidator.svelte';
	import SequenceWarnings from './SequenceWarnings.svelte';
	import FileManager from './FileManager.svelte';
	import ErrorHandler from './ErrorHandler.svelte';
	import DemoFileSelector from './DemoFileSelector.svelte';
	import TabNavigation from './TabNavigation.svelte';
	import FastaExport from './FastaExport.svelte';
	import { ArrowRight } from 'lucide-svelte';

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

	// Computed props
	$: hasFileMetrics = !!fileMetricsJSON && Object.keys(fileMetricsJSON).length > 0;
	$: hasTree = $treeStore && ($treeStore.nj || $treeStore.usertree);
	$: isReadyForAnalysis = hasFileMetrics && hasTree;
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

		<!-- Sequence Warnings Section -->
		<SequenceWarnings {fileMetricsJSON} />

		<!-- Sequence Export Section -->
		{#if $alignmentFileStore}
			<div class="mb-premium-xl">
				<h2 class="mb-premium-md text-premium-header font-semibold text-text-rich">
					Export Sequences
				</h2>
				<div
					class="rounded-premium border border-border-platinum bg-white p-premium-lg shadow-premium"
				>
					<FastaExport alignmentFile={$alignmentFileStore} />
				</div>
			</div>
		{/if}
	{:else}
		<div
			class="relative my-premium-xl overflow-hidden rounded-2xl border border-border-platinum p-8 text-center shadow-sm"
		>
			<div
				class="absolute -inset-12 opacity-15"
				style="background: url('/img/Gemini_Generated_Image_uno20runo20runo2.png'); background-size: 180px; background-repeat: repeat; transform: rotate(-12deg);"
			></div>
			<div class="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-brand-whisper/90"></div>
			<div class="relative z-10 py-12">
				<p class="text-lg font-medium text-text-rich">
					Upload or select a file to get started
				</p>
			</div>
		</div>
	{/if}

	<!-- Continue to Analysis CTA -->
	{#if isReadyForAnalysis}
		<div class="continue-cta mb-premium-xl">
			<div class="rounded-premium border border-green-200 bg-green-50 p-premium-lg">
				<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
							<svg
								class="h-5 w-5 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div>
							<p class="font-semibold text-green-800">Data ready for analysis</p>
							<p class="text-sm text-green-600">
								Your sequence data and phylogenetic tree are loaded
							</p>
						</div>
					</div>
					<button
						on:click={() => onChange('analyze')}
						class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md"
					>
						Continue to Analysis
						<ArrowRight class="h-5 w-5" />
					</button>
				</div>
			</div>
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
