<script>
	import { Loader2, Download } from 'lucide-svelte';

	// Props - mock data passed in directly
	export let analyses = [];
	export let files = [];

	// Internal state
	let selectedAnalyses = new Set();
	let exportFormat = 'json';
	let isExporting = false;
	let exportStatus = '';
	let isSelectAll = false;
	let filterMethod = 'all';
	let filterFile = 'all';
	let fastaExportStatus = '';

	// Available export formats
	const exportFormats = [
		{ id: 'json', label: 'JSON', description: 'Full data structure' },
		{ id: 'csv', label: 'CSV', description: 'Tabular format' },
		{ id: 'txt', label: 'Text', description: 'Plain text summary' }
	];

	// Build available filters
	$: availableMethods = ['all', ...new Set(analyses.map((a) => a.method))];
	$: {
		const fileIds = new Set(analyses.map((a) => a.fileId));
		const fileOptions = files
			.filter((f) => fileIds.has(f.id))
			.map((f) => ({ id: f.id, name: f.filename }));
		availableFiles = [{ id: 'all', name: 'All Files' }, ...fileOptions];
	}

	let availableFiles = [{ id: 'all', name: 'All Files' }];

	// Filter analyses based on selected filters
	$: filteredAnalyses = analyses.filter((analysis) => {
		const methodMatch = filterMethod === 'all' || analysis.method === filterMethod;
		const fileMatch = filterFile === 'all' || analysis.fileId === filterFile;
		return methodMatch && fileMatch;
	});

	// Toggle select all
	function toggleSelectAll() {
		if (isSelectAll) {
			selectedAnalyses = new Set();
		} else {
			selectedAnalyses = new Set(filteredAnalyses.map((a) => a.id));
		}
		isSelectAll = !isSelectAll;
	}

	// Toggle selection for an analysis
	function toggleSelection(analysisId) {
		if (selectedAnalyses.has(analysisId)) {
			selectedAnalyses.delete(analysisId);
		} else {
			selectedAnalyses.add(analysisId);
		}
		selectedAnalyses = selectedAnalyses;
		isSelectAll =
			filteredAnalyses.length > 0 && filteredAnalyses.every((a) => selectedAnalyses.has(a.id));
	}

	// Format date for display
	function formatDate(timestamp) {
		if (!timestamp) return 'Unknown';
		return new Date(timestamp).toLocaleString();
	}

	// Get file name for an analysis
	function getFileName(fileId) {
		const file = files.find((f) => f.id === fileId);
		return file ? file.filename : 'Unknown file';
	}

	// Mock export function
	async function exportSelectedAnalyses() {
		if (selectedAnalyses.size === 0) return;

		isExporting = true;
		exportStatus = 'Preparing export...';

		// Simulate export delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		exportStatus = `Exported ${selectedAnalyses.size} analyses successfully`;
		isExporting = false;

		setTimeout(() => {
			exportStatus = '';
		}, 3000);
	}

	// Mock FASTA export function
	async function exportCorrectedFasta(analysisId) {
		fastaExportStatus = 'Exporting FASTA...';

		await new Promise((resolve) => setTimeout(resolve, 500));

		fastaExportStatus = 'FASTA exported successfully (12 sequences)';
		setTimeout(() => {
			fastaExportStatus = '';
		}, 3000);
	}
</script>

<div class="batch-export rounded-lg border border-border-subtle bg-white p-4 shadow-sm">
	<h3 class="mb-3 text-lg font-bold">Batch Export</h3>

	<!-- Filter controls -->
	<div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
		<div>
			<label class="mb-1 block text-sm font-medium">Method:</label>
			<select
				bind:value={filterMethod}
				class="w-full rounded border border-gray-300 px-2 py-1 text-sm"
			>
				{#each availableMethods as method}
					<option value={method}>{method === 'all' ? 'All Methods' : method.toUpperCase()}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="mb-1 block text-sm font-medium">File:</label>
			<select
				bind:value={filterFile}
				class="w-full rounded border border-gray-300 px-2 py-1 text-sm"
			>
				{#if Array.isArray(availableFiles)}
					{#each availableFiles as fileOption}
						<option value={fileOption.id}>{fileOption.name}</option>
					{/each}
				{:else}
					<option value="all">All Files</option>
				{/if}
			</select>
		</div>
	</div>

	<!-- Export format selection -->
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium">Export Format:</label>
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
					<span class="mr-1 text-sm font-medium">{format.label}</span>
					<span class="text-xs text-text-silver">({format.description})</span>
				</label>
			{/each}
		</div>
	</div>

	<!-- Analysis selection table -->
	<div class="mb-4">
		<div class="mb-2 flex items-center justify-between">
			<h4 class="font-medium">Select Analyses to Export</h4>
			<label class="flex cursor-pointer items-center text-sm">
				<input type="checkbox" checked={isSelectAll} on:change={toggleSelectAll} class="mr-1" />
				Select All
			</label>
		</div>

		<div class="max-h-64 overflow-y-auto rounded border border-border-subtle">
			{#if filteredAnalyses.length === 0}
				<p class="p-3 text-center text-sm text-text-silver">
					No analyses available for the selected filters
				</p>
			{:else}
				<table class="w-full table-auto text-sm">
					<thead class="sticky top-0 bg-surface-sunken">
						<tr>
							<th class="w-10 p-2"></th>
							<th class="w-20 p-2 text-left">Method</th>
							<th class="p-2 text-left">File</th>
							<th class="w-40 p-2 text-left">Date</th>
							<th class="w-32 p-2 text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredAnalyses as analysis (analysis.id)}
							<tr class="cursor-pointer border-t border-border-subtle hover:bg-surface-raised">
								<td class="p-2 text-center">
									<input
										type="checkbox"
										checked={selectedAnalyses.has(analysis.id)}
										on:change={() => toggleSelection(analysis.id)}
										class="h-4 w-4 cursor-pointer"
									/>
								</td>
								<td class="p-2 font-medium">{analysis.method.toUpperCase()}</td>
								<td class="truncate p-2">{getFileName(analysis.fileId)}</td>
								<td class="p-2 text-text-slate">{formatDate(analysis.createdAt)}</td>
								<td class="p-2">
									{#if analysis.method === 'datareader'}
										<button
											on:click|stopPropagation={() => exportCorrectedFasta(analysis.id)}
											class="rounded bg-status-success px-2 py-1 text-xs text-white hover:bg-status-success-text"
											title="Export FASTA sequences from this analysis"
										>
											Export FASTA
										</button>
									{:else}
										<span class="text-xs text-text-silver">N/A</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<p class="mt-1 text-right text-sm text-text-slate">
			{selectedAnalyses.size} analyses selected
		</p>
	</div>

	<!-- Export button -->
	<div class="export-actions">
		<button
			on:click={exportSelectedAnalyses}
			disabled={selectedAnalyses.size === 0 || isExporting}
			class="flex items-center rounded bg-brand-royal px-3 py-1 text-white hover:bg-brand-deep disabled:bg-surface-sunken disabled:text-text-silver"
		>
			{#if isExporting}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				Exporting...
			{:else}
				<Download class="mr-1 h-4 w-4" />
				Export Selected Analyses
			{/if}
		</button>

		{#if exportStatus}
			<p
				class="mt-2 text-sm"
				class:text-green-600={!exportStatus.includes('failed')}
				class:text-red-600={exportStatus.includes('failed')}
			>
				{exportStatus}
			</p>
		{/if}

		{#if fastaExportStatus}
			<p
				class="mt-2 text-sm"
				class:text-green-600={fastaExportStatus.includes('successfully')}
				class:text-blue-600={fastaExportStatus.includes('Exporting')}
				class:text-red-600={fastaExportStatus.includes('Error')}
			>
				{fastaExportStatus}
			</p>
		{/if}
	</div>
</div>
