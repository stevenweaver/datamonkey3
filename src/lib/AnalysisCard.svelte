<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { persistentFileStore } from '../stores/fileInfo';

	// Props
	export let analysis = {};
	export let compact = false;
	export let selected = false;

	// Local state
	let file = null;
	let resultPreview = null;
	let isLoading = false;

	const dispatch = createEventDispatcher();

	// Load file info
	$: if (analysis && analysis.fileId && $persistentFileStore.files) {
		file = $persistentFileStore.files.find((f) => f.id === analysis.fileId);
	}

	// Format date for display
	function formatDate(timestamp) {
		if (!timestamp) return 'Unknown';

		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		// More consistent time display
		if (diffMins < 1) {
			return 'just now';
		} else if (diffMins < 60) {
			return `${diffMins} min ago`;
		} else if (diffHours < 24) {
			return `${diffHours} hr ago`;
		} else if (diffDays < 7) {
			return `${diffDays} days ago`;
		} else {
			// Full date format for older dates
			return date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		}
	}

	// Get method display name with icon
	function getMethodIcon(method) {
		// Return SVG icon based on method
		switch (method) {
			case 'fel':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clip-rule="evenodd" />
        </svg>`;
			case 'meme':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>`;
			case 'slac':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>`;
			case 'busted':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
        </svg>`;
			case 'datareader':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
        </svg>`;
			default:
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
        </svg>`;
		}
	}

	// Generate a simple preview of the analysis result
	async function generateResultPreview() {
		if (!analysis || !analysis.result || analysis.method === 'datareader') {
			return null;
		}

		try {
			isLoading = true;

			// Try to parse the result
			const result =
				typeof analysis.result === 'string' ? JSON.parse(analysis.result) : analysis.result;

			if (!result) return null;

			// Generate different previews based on method
			if (['fel', 'slac', 'meme', 'fubar'].includes(analysis.method)) {
				if (result.tested && result.tested.sites) {
					// Count positively selected sites
					const positiveSites = result.tested.sites.filter(
						(site) => site.p <= 0.05 && (site.beta > site.alpha || site.posterior >= 0.9)
					).length;

					return {
						text: `${positiveSites} positive sites found`,
						type: 'selection'
					};
				}
			} else if (analysis.method === 'busted') {
				if (result.test_results && result.test_results.p) {
					const pValue = result.test_results.p;
					const significant = pValue <= 0.05;

					return {
						text: significant
							? `Positive selection detected (p=${pValue.toExponential(2)})`
							: `No selection detected (p=${pValue.toExponential(2)})`,
						type: 'hypothesis',
						significant
					};
				}
			}

			return {
				text: `${analysis.method.toUpperCase()} results`,
				type: 'generic'
			};
		} catch (error) {
			console.error('Error generating result preview:', error);
			return null;
		} finally {
			isLoading = false;
		}
	}

	// Generate preview on mount
	onMount(async () => {
		resultPreview = await generateResultPreview();
	});

	// Handle card selection
	function selectCard() {
		dispatch('select', { analysisId: analysis.id });
	}

	// Handle view action
	function viewAnalysis() {
		dispatch('view', { analysisId: analysis.id });
	}

	// Handle export action
	function exportAnalysis() {
		dispatch('export', { analysisId: analysis.id });
	}

	// Handle cancel action
	function cancelAnalysis() {
		dispatch('cancel', { analysisId: analysis.id });
	}

	// Handle delete action
	function deleteAnalysis() {
		dispatch('delete', { analysisId: analysis.id });
	}
</script>

<div
	class="analysis-card mb-3 rounded-lg border transition-all duration-200 {compact
		? 'p-3'
		: 'p-4'} {selected
		? 'border-blue-500 bg-blue-50 shadow-sm'
		: 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}"
	on:click={selectCard}
>
	<div class="flex items-start">
		<!-- Method and status -->
		<div
			class="mr-3 {compact
				? 'h-8 w-8'
				: 'h-10 w-10'} flex flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600"
		>
			{@html getMethodIcon(analysis.method)}
		</div>

		<div class="flex-grow">
			<!-- Header -->
			<div class="flex items-start justify-between">
				<h3 class="font-medium {compact ? 'text-sm' : 'text-base'}">
					{analysis.method ? analysis.method.toUpperCase() : 'Unknown'} Analysis
				</h3>

				<!-- Status badge -->
				<div
					class="{compact
						? 'text-xs'
						: 'text-sm'} inline-flex items-center rounded-full px-2 py-0.5"
					class:bg-green-100={analysis.status === 'completed'}
					class:text-green-800={analysis.status === 'completed'}
					class:bg-yellow-100={analysis.status === 'running' || analysis.status === 'pending'}
					class:text-yellow-800={analysis.status === 'running' || analysis.status === 'pending'}
					class:bg-red-100={analysis.status === 'error'}
					class:text-red-800={analysis.status === 'error'}
					class:bg-orange-100={analysis.status === 'cancelled'}
					class:text-orange-800={analysis.status === 'cancelled'}
					class:bg-gray-100={!['completed', 'running', 'pending', 'error', 'cancelled'].includes(
						analysis.status
					)}
					class:text-gray-800={!['completed', 'running', 'pending', 'error', 'cancelled'].includes(
						analysis.status
					)}
				>
					{#if analysis.status === 'running' || analysis.status === 'pending'}
						<svg
							class="-ml-0.5 mr-1.5 h-2 w-2 animate-spin"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					{:else if analysis.status === 'completed'}
						<svg
							class="-ml-0.5 mr-1.5 h-3 w-3"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
					<span class="capitalize"
						>{analysis.status === 'completed' 
							? 'Completed' 
							: analysis.status === 'cancelled' 
								? 'Cancelled' 
								: analysis.status || 'unknown'}</span
					>
				</div>
			</div>

			<!-- Info -->
			<div class="text-gray-500 {compact ? 'mt-0.5 text-xs' : 'mt-1 text-sm'}">
				<div class="flex items-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-3 w-3"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="truncate">{file ? file.filename : 'Unknown file'}</span>
				</div>

				<div class="mt-0.5 flex items-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-3 w-3"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="text-gray-600">
						{#if analysis.status === 'completed'}
							Completed {formatDate(analysis.completedAt || analysis.createdAt)}
						{:else}
							Created {formatDate(analysis.createdAt)}
						{/if}
					</span>
				</div>
			</div>

			<!-- Preview (only in full mode) -->
			{#if !compact && resultPreview}
				<div class="mt-3 rounded border border-gray-100 bg-gray-50 p-2 text-sm">
					{#if resultPreview.type === 'selection'}
						<div class="font-medium text-purple-700">
							{resultPreview.text}
						</div>
					{:else if resultPreview.type === 'hypothesis'}
						<div
							class="{resultPreview.significant ? 'text-green-700' : 'text-orange-700'} font-medium"
						>
							{resultPreview.text}
						</div>
					{:else}
						<div class="text-gray-700">
							{resultPreview.text}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Actions (only in full mode) -->
	{#if !compact}
		<div class="actions mt-3 flex justify-end gap-2">
			<!-- View button - always available -->
			<button
				on:click|stopPropagation={viewAnalysis}
				class="inline-flex items-center rounded bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-1 h-3 w-3"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
					<path
						fill-rule="evenodd"
						d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
						clip-rule="evenodd"
					/>
				</svg>
				View
			</button>

			<!-- Cancel button - only for pending/running analyses -->
			{#if ['pending', 'running', 'mounting', 'processing', 'saving'].includes(analysis.status)}
				<button
					on:click|stopPropagation={cancelAnalysis}
					class="inline-flex items-center rounded bg-orange-100 px-2.5 py-1.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-200"
					title="Cancel this analysis"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-3 w-3"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
					Cancel
				</button>
			{/if}

			<!-- Export button - only for completed analyses -->
			{#if analysis.status === 'completed'}
				<button
					on:click|stopPropagation={exportAnalysis}
					class="inline-flex items-center rounded bg-green-100 px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-3 w-3"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
					Export
				</button>
			{/if}

			<!-- Delete button - for completed/error/cancelled analyses -->
			{#if ['completed', 'error', 'cancelled'].includes(analysis.status)}
				<button
					on:click|stopPropagation={deleteAnalysis}
					class="inline-flex items-center rounded bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
					title="Delete this analysis"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-3 w-3"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
							clip-rule="evenodd"
						/>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L9.586 12l-2.293 2.293a1 1 0 101.414 1.414L11 13.414l2.293 2.293a1 1 0 001.414-1.414L12.414 12l2.293-2.293z"
							clip-rule="evenodd"
						/>
					</svg>
					Delete
				</button>
			{/if}
		</div>
	{/if}
</div>
