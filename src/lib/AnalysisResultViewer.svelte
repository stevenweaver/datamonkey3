<script>
	import { onMount } from 'svelte';
	import { analysisStore } from '../stores/analyses';
	import { persistentFileStore } from '../stores/fileInfo';
	import ExportPanel from './ExportPanel.svelte';
	import EnhancedExportPanel from './EnhancedExportPanel.svelte';
	import FelVisualization from './FelVisualization.svelte';
	import { FINAL_HYPHY_EYE_URL } from './config/env';
	import { shareWithHyphyEye, isMethodSupported, getHyphyEyeUrl } from './utils/hyphyEyeIntegration';

	// Tab management
	let activeTab = 'results';

	export let analysisId = null;

	let analysis = null;
	let file = null;
	let resultData = null;
	let loading = true;
	let error = null;

	$: if (analysisId) {
		loadAnalysis(analysisId);
	}

	async function loadAnalysis(id) {
		loading = true;
		error = null;

		try {
			// Try to get analysis from server first (most up-to-date status)
			try {
				const response = await fetch(`/api/analyses/${id}`);
				if (response.ok) {
					const serverAnalysis = await response.json();
					// Update local store with server data to keep them in sync
					await analysisStore.updateAnalysis(id, serverAnalysis);
					analysis = serverAnalysis;
				} else {
					// Fall back to local storage if server request fails
					analysis = await analysisStore.getAnalysis(id);
				}
			} catch (err) {
				console.warn('Server fetch failed, using local data:', err);
				// Fall back to local storage
				analysis = await analysisStore.getAnalysis(id);
			}

			if (!analysis) {
				error = 'Analysis not found';
				loading = false;
				return;
			}

			// Get file metadata
			file = $persistentFileStore.files.find((f) => f.id === analysis.fileId);

			if (!file) {
				error = 'Associated file not found';
				loading = false;
				return;
			}

			// Parse result data if available
			if (analysis.result) {
				try {
					resultData = JSON.parse(analysis.result);
				} catch (e) {
					console.error('Error parsing analysis result:', e);
					resultData = { error: 'Invalid result format' };
				}
			}
		} catch (e) {
			console.error('Error loading analysis:', e);
			error = e.message || 'Error loading analysis';
		} finally {
			loading = false;
		}
	}

	// Format date for display
	function formatDate(timestamp) {
		return new Date(timestamp).toLocaleString();
	}

	onMount(() => {
		if (analysisId) {
			loadAnalysis(analysisId);
		}
	});
</script>

<div class="analysis-viewer">
	{#if loading}
		<div class="flex flex-col items-center justify-center p-8">
			<div class="loader mb-4"></div>
			<p>Loading analysis results...</p>
		</div>
	{:else if error}
		<div class="error-container p-4 text-red-500">
			<h3 class="font-bold">Error</h3>
			<p>{error}</p>
		</div>
	{:else if analysis && file}
		<div class="analysis-container">
			<!-- Enhanced Export panel with options -->
			<EnhancedExportPanel {analysisId} />

			<div class="bg-gray-100 p-4">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-bold">{analysis.method.toUpperCase()} Analysis</h2>
					<button
						class="flex items-center rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
						on:click={() => loadAnalysis(analysisId)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Refresh
					</button>
				</div>
				<div class="text-sm text-gray-600">
					<p>File: {file.filename}</p>
					<p>
						Status:
						<span
							class="font-semibold capitalize {analysis.status === 'completed'
								? 'text-green-600'
								: analysis.status === 'pending'
									? 'text-yellow-600'
									: 'text-gray-600'}"
						>
							{analysis.status === 'completed' ? 'Completed' : analysis.status}
						</span>
					</p>
					<p>Created: {formatDate(analysis.createdAt)}</p>
					{#if analysis.completedAt}
						<p>Completed: {formatDate(analysis.completedAt)}</p>
					{/if}
				</div>
			</div>

			<div class="result-content p-4">
				{#if analysis.status === 'completed' && resultData}
					<!-- Display method-specific results -->
					{#if analysis.method === 'datareader'}
						<div class="data-reader-results">
							<h3 class="mb-2 text-lg font-bold">File Information</h3>
							{#if resultData.FILE_INFO}
								<div class="mb-4">
									<p><strong>Type:</strong> {resultData.FILE_INFO.type || 'Unknown'}</p>
									<p><strong>Sequences:</strong> {resultData.FILE_INFO.sequences || 0}</p>
									<p><strong>Sites:</strong> {resultData.FILE_INFO.sites || 0}</p>
								</div>
							{/if}

							{#if resultData.FILE_PARTITION_INFO}
								<h3 class="mb-2 text-lg font-bold">Partition Information</h3>
								<div class="partition-info">
									{#each Object.entries(resultData.FILE_PARTITION_INFO) as [key, partition]}
										<div class="mb-2 border-l-4 border-blue-500 pl-2">
											<p><strong>Partition {key}:</strong></p>
											<p><strong>Sites:</strong> {partition.sites || 0}</p>
											<p><strong>Sequences:</strong> {partition.sequences || 0}</p>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{:else if ['FEL', 'SLAC', 'MEME', 'BUSTED', 'FUBAR', 'aBSREL', 'GARD', 'MULTI-HIT', 'NRM'].includes(analysis.method)}
						<!-- Selection analysis results -->
						<div class="selection-analysis">
							{#if resultData.input && resultData.input.file}
								<p><strong>Analysis File:</strong> {resultData.input.file}</p>
							{/if}

							<!-- Tabs navigation -->
							<div class="mb-4 border-b border-gray-200">
								<ul class="-mb-px flex flex-wrap text-center text-sm font-medium">
									<li class="mr-2">
										<button
											class="inline-block rounded-t-lg border-b-2 p-4 {activeTab === 'results'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent hover:border-gray-300 hover:text-gray-600'}"
											on:click={() => (activeTab = 'results')}
										>
											Results
										</button>
									</li>
									<li class="mr-2">
										<button
											class="inline-block rounded-t-lg border-b-2 p-4 {activeTab === 'visualization'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent hover:border-gray-300 hover:text-gray-600'}"
											on:click={() => (activeTab = 'visualization')}
										>
											Visualization
										</button>
									</li>
								</ul>
							</div>

							<!-- Tab Content -->
							{#if activeTab === 'results'}
								<!-- FEL-specific visualization for FEL method -->
								{#if analysis.method === 'FEL'}
									<div class="mb-6 mt-6 rounded-lg bg-white p-4 shadow-sm">
										<h3 class="mb-4 text-lg font-semibold">FEL Analysis Visualization</h3>
										<FelVisualization {resultData} />
									</div>
								{/if}

								{#if resultData.fits && resultData.fits.length > 0}
									<h3 class="mb-2 text-lg font-bold">Model Fits</h3>
									<div class="overflow-x-auto">
										<table class="w-full table-auto">
											<thead class="bg-gray-200">
												<tr>
													<th class="p-2 text-left">Model</th>
													<th class="p-2 text-left">Log Likelihood</th>
													<th class="p-2 text-left">Parameters</th>
													<th class="p-2 text-left">AIC</th>
												</tr>
											</thead>
											<tbody>
												{#each resultData.fits as fit}
													<tr class="border-b">
														<td class="p-2">{fit.model || 'Unknown'}</td>
														<td class="p-2"
															>{fit.log_likelihood ? fit.log_likelihood.toFixed(2) : 'N/A'}</td
														>
														<td class="p-2">{fit.parameters || 'N/A'}</td>
														<td class="p-2">{fit.AIC ? fit.AIC.toFixed(2) : 'N/A'}</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{/if}

								{#if resultData.tested && resultData.tested.sites && resultData.tested.sites.length > 0}
									<h3 class="my-2 text-lg font-bold">Site Results</h3>
									<div class="max-h-96 overflow-auto">
										<table class="w-full table-auto">
											<thead class="sticky top-0 bg-gray-200">
												<tr>
													<th class="p-2 text-left">Site</th>
													<th class="p-2 text-left">p-value</th>
													<th class="p-2 text-left">alpha</th>
													<th class="p-2 text-left">beta</th>
													<th class="p-2 text-left">Selection</th>
												</tr>
											</thead>
											<tbody>
												{#each resultData.tested.sites as site}
													<tr class="border-b" class:bg-yellow-100={site.p <= 0.05}>
														<td class="p-2">{site.site_index || site.site || 'N/A'}</td>
														<td class="p-2">{site.p ? site.p.toExponential(2) : 'N/A'}</td>
														<td class="p-2">{site.alpha ? site.alpha.toFixed(2) : 'N/A'}</td>
														<td class="p-2">{site.beta ? site.beta.toFixed(2) : 'N/A'}</td>
														<td class="p-2">
															{#if site.p <= 0.05}
																{#if site.beta > site.alpha}
																	<span class="font-bold text-red-500">Positive</span>
																{:else}
																	<span class="font-bold text-blue-500">Negative</span>
																{/if}
															{:else}
																<span class="text-gray-500">Neutral</span>
															{/if}
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{/if}

								{#if !resultData.tested && !resultData.fits}
									<pre class="bg-gray-100 p-2 text-sm">{JSON.stringify(resultData, null, 2)}</pre>
								{/if}
							{:else if activeTab === 'visualization'}
								<!-- HyPhy-eye iframe visualization -->
								<div class="visualization-container h-[600px] w-full">
									<iframe
										src="{FINAL_HYPHY_EYE_URL}/pages/{analysis.method.toLowerCase().replace('-', '')}"
										class="h-full w-full border-0"
										title="{analysis.method} visualization in HyPhy-eye"
										allowfullscreen
									></iframe>
								</div>
							{/if}

							<!-- HyPhy-eye integration with localStorage sharing -->
							{#if isMethodSupported(analysis.method)}
								<div class="mb-4 mt-4 rounded-lg bg-blue-50 p-4 text-center shadow-sm">
									<p class="mb-2 text-blue-800">View results with automatic data sharing:</p>
									<button
										on:click={() => shareWithHyphyEye(resultData, analysis.method)}
										class="inline-block rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
									>
										View in HyPhy-eye
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="ml-1 inline-block h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									</button>
									<p class="mt-2 text-sm text-blue-600">
										Analysis results will be automatically shared via localStorage.
									</p>
								</div>
							{:else}
								<div class="mb-4 mt-4 rounded-lg bg-gray-100 p-4 text-center shadow-sm">
									<p class="mb-2">Open results in a new tab:</p>
									<a
										href="{FINAL_HYPHY_EYE_URL}/pages/{analysis.method.toLowerCase().replace('-', '')}"
										target="_blank"
										rel="noopener noreferrer"
										class="inline-block rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
									>
										Open {analysis.method.toUpperCase()} Results in hyphy-eye
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="ml-1 inline-block h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									</a>
									<p class="mt-2 text-sm text-gray-600">
										Note: You will need to upload your result JSON to hyphy-eye manually.
									</p>
								</div>
							{/if}
						</div>
					{:else}
						<!-- Generic JSON display for other methods -->
						<div class="json-display">
							<h3 class="mb-2 text-lg font-bold">Analysis Results</h3>
							<pre class="max-h-96 overflow-auto bg-gray-100 p-2 text-sm">{JSON.stringify(
									resultData,
									null,
									2
								)}</pre>
						</div>
					{/if}
				{:else if ['pending', 'running', 'mounting', 'processing', 'saving'].includes(analysis.status)}
					<div class="flex flex-col items-center justify-center p-4">
						<div class="loader mb-4"></div>
						<p class="text-lg text-yellow-600">
							Analysis is {analysis.status === 'pending' ? 'pending...' : analysis.status + '...'}
						</p>
						<p class="mt-2 text-sm text-gray-500">This might take a few moments to complete.</p>
						<div class="mt-4 flex justify-center">
							<div class="h-20 w-20">
								<svg class="animate-spin" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<circle
										cx="12"
										cy="12"
										r="10"
										stroke-width="4"
										stroke="currentColor"
										stroke-opacity="0.25"
										fill="none"
									/>
									<path
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							</div>
						</div>
					</div>
				{:else}
					<p class="text-gray-600">No results available</p>
				{/if}
			</div>
		</div>
	{:else}
		<p class="p-4 text-gray-500">Select an analysis to view results</p>
	{/if}
</div>

<style>
	.loader {
		border: 8px solid #f3f3f3;
		border-top: 8px solid #3498db;
		border-radius: 50%;
		width: 50px;
		height: 50px;
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
