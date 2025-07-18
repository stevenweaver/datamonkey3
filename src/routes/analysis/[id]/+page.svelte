<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { analysisStore } from '../../../stores/analyses';
	import { persistentFileStore } from '../../../stores/fileInfo';
	import AnalysisResultViewer from '../../../lib/AnalysisResultViewer.svelte';
	import ExportPanel from '../../../lib/ExportPanel.svelte';

	// Get the analysis ID from the route parameter
	const analysisId = $page.params.id;

	let analysis = null;
	let file = null;
	let loading = true;
	let error = null;

	onMount(async () => {
		if (browser) {
			try {
				// Load data from IndexedDB
				await persistentFileStore.loadFiles();
				await analysisStore.loadAnalyses();

				// Try to find the analysis
				analysis = $analysisStore.analyses.find((a) => a.id === analysisId);

				if (!analysis) {
					error = 'Analysis not found';
					loading = false;
					return;
				}

				// Get associated file
				file = $persistentFileStore.files.find((f) => f.id === analysis.fileId);

				if (!file) {
					error = 'Associated file not found';
				}

				loading = false;
			} catch (e) {
				console.error('Error loading data:', e);
				error = e.message || 'Failed to load analysis data';
				loading = false;
			}
		}
	});

	// Return to the main page
	function backToMain() {
		goto('/');
	}
</script>

<div class="container mx-auto p-8">
	<div class="mb-4 flex items-center">
		<button
			on:click={backToMain}
			class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
		>
			← Back to Main Page
		</button>

		<h1 class="ml-4 text-2xl font-bold">Analysis Details</h1>
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center p-12">
			<div class="loader mb-4"></div>
			<p>Loading analysis data...</p>
		</div>
	{:else if error}
		<div class="rounded-lg bg-red-100 p-4 text-red-700">
			<h3 class="font-bold">Error</h3>
			<p>{error}</p>
		</div>
	{:else}
		<div class="analysis-container">
			{#if analysis && file}
				<div class="mb-4 rounded-lg bg-gray-100 p-4">
					<h2 class="mb-2 text-xl font-bold">{analysis.method.toUpperCase()} Analysis</h2>
					<p class="mb-1"><strong>File:</strong> {file.filename}</p>
					<p class="mb-1">
						<strong>Created:</strong>
						{new Date(analysis.createdAt).toLocaleString()}
					</p>
					<p><strong>Status:</strong> <span class="capitalize">{analysis.status}</span></p>
				</div>

				<div class="result-section">
					<AnalysisResultViewer {analysisId} />
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.loader {
		border: 16px solid #f3f3f3;
		border-top: 16px solid #3498db;
		border-radius: 50%;
		width: 60px;
		height: 60px;
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
