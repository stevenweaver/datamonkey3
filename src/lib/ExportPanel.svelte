<script>
	import { exportData } from './utils/exportUtils';
	import { analysisStore } from '../stores/analyses';
	import { persistentFileStore } from '../stores/fileInfo';
	import { ChevronUp, ChevronDown, Download } from 'lucide-svelte';

	// Props
	export let analysisId;

	// Internal state
	let analysis = null;
	let file = null;
	let exportFormat = 'json';
	let showExportOptions = false;
	let exportStatus = '';

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
				<ChevronUp class="h-5 w-5" />
			{:else}
				<ChevronDown class="h-5 w-5" />
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
					<Download class="mr-1 h-4 w-4" />
					Export
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
