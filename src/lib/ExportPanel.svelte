<script>
	import { onMount, onDestroy } from 'svelte';
	import { exportData, createShareableLink, copyToClipboard } from './utils/exportUtils';
	import { analysisStore } from '../stores/analyses';
	import { persistentFileStore } from '../stores/fileInfo';

	// Props
	export let analysisId;

	// Internal state
	let analysis = null;
	let file = null;
	let exportFormat = 'json';
	let showExportOptions = false;
	let exportStatus = '';
	let shareLinkCopied = false;
	let shareLinkTimeout;

	// Available export formats
	const exportFormats = [
		{ id: 'json', label: 'JSON', description: 'Full data structure, best for importing later' },
		{ id: 'csv', label: 'CSV', description: 'Tabular format, best for spreadsheets' },
		{ id: 'txt', label: 'Text', description: 'Plain text format' }
	];

	// Load analysis data
	$: if (analysisId) {
		loadAnalysisData(analysisId);
	}

	async function loadAnalysisData(id) {
		try {
			// Get analysis details
			analysis = $analysisStore.analyses.find((a) => a.id === id);

			if (!analysis) {
				analysis = await analysisStore.getAnalysis(id);
			}

			if (!analysis) {
				throw new Error('Analysis not found');
			}

			// Get associated file
			file = $persistentFileStore.files.find((f) => f.id === analysis.fileId);
		} catch (error) {
			console.error('Error loading analysis data:', error);
		}
	}

	// Toggle export options
	function toggleExportOptions() {
		showExportOptions = !showExportOptions;
	}

	// Export analysis results
	async function exportAnalysisResults() {
		if (!analysis) return;

		try {
			// Generate filename
			const method = analysis.method.toUpperCase();
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
			const filename = `${method}_analysis_${timestamp}`;

			// Parse the analysis result if needed
			let resultData;
			try {
				resultData =
					typeof analysis.result === 'string' ? JSON.parse(analysis.result) : analysis.result;
			} catch (e) {
				resultData = { error: 'Could not parse results', raw: analysis.result };
			}

			// Add metadata for CSV export
			if (exportFormat === 'csv' && !resultData.exportMetadata) {
				resultData = {
					...resultData,
					exportMetadata: {
						analysisId: analysis.id,
						method: analysis.method,
						createdAt: analysis.createdAt,
						filename: file?.filename || 'Unknown file'
					}
				};
			}

			// Export the data
			exportData(resultData, filename, exportFormat);

			// Show success message
			exportStatus = `Exported as ${exportFormat.toUpperCase()}`;
			setTimeout(() => {
				exportStatus = '';
			}, 3000);
		} catch (error) {
			console.error('Error exporting results:', error);
			exportStatus = 'Export failed';
			setTimeout(() => {
				exportStatus = '';
			}, 3000);
		}
	}

	// Copy shareable link to clipboard
	async function copyShareLink() {
		if (!analysisId) return;

		const link = createShareableLink(analysisId);
		const success = await copyToClipboard(link);

		if (success) {
			shareLinkCopied = true;
			clearTimeout(shareLinkTimeout);
			shareLinkTimeout = setTimeout(() => {
				shareLinkCopied = false;
			}, 3000);
		}
	}

	// Clean up on destroy
	onDestroy(() => {
		clearTimeout(shareLinkTimeout);
	});
</script>

<div class="export-panel mb-4 rounded-lg border border-border-subtle bg-white shadow-sm">
	<div class="flex items-center justify-between border-b border-border-subtle p-3">
		<h3 class="text-lg font-semibold">Export Options</h3>
		<button
			on:click={toggleExportOptions}
			class="rounded-full p-1 text-text-silver hover:bg-surface-sunken"
			aria-label={showExportOptions ? 'Hide export options' : 'Show export options'}
		>
			{#if showExportOptions}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		</button>
	</div>

	{#if showExportOptions}
		<div class="p-3">
			<div class="mb-4">
				<label class="mb-1 block font-medium">Export Format</label>
				<div class="flex flex-wrap gap-2">
					{#each exportFormats as format}
						<label class="flex cursor-pointer items-center">
							<input
								type="radio"
								name="exportFormat"
								value={format.id}
								bind:group={exportFormat}
								class="mr-1"
							/>
							<span class="mr-1 font-medium">{format.label}</span>
							<span class="text-xs text-text-silver">({format.description})</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="export-actions flex flex-wrap gap-2">
				<button
					on:click={exportAnalysisResults}
					class="flex items-center rounded bg-brand-royal px-3 py-1 text-white hover:bg-brand-deep"
					disabled={!analysis}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-4 w-4"
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

				<button
					on:click={copyShareLink}
					class="flex items-center rounded bg-status-success px-3 py-1 text-white hover:bg-status-success-text"
					disabled={!analysisId}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"
						/>
					</svg>
					{shareLinkCopied ? 'Link Copied!' : 'Copy Link'}
				</button>

				{#if exportStatus}
					<span class="ml-2 self-center text-sm text-status-success">{exportStatus}</span>
				{/if}
			</div>

			<div class="mt-3 text-xs text-text-silver">
				<p>Exports include all analysis data, parameters, and results.</p>
			</div>
		</div>
	{/if}
</div>
