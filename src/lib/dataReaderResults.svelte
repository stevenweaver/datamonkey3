<script>
	import PhyloTree from './phylotree.svelte';

	export let fileMetricsJSON = null;

	let isOpen = false;
	let njStringExpanded = false;
	let userTreeStringExpanded = {};
	let copySuccess = null;

	$: passed = fileMetricsJSON?.FILE_INFO?.goodtree;

	// Format timestamp in a clear, unambiguous format
	function formatTimestamp(timestamp) {
		const date = new Date(parseInt(timestamp.trim()) * 1000);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Truncate newick string for preview
	function truncateNewick(str, maxLength = 60) {
		if (str.length <= maxLength) return str;
		return str.substring(0, maxLength) + '...';
	}

	// Copy to clipboard
	async function copyToClipboard(text, id) {
		try {
			await navigator.clipboard.writeText(text);
			copySuccess = id;
			setTimeout(() => {
				copySuccess = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

</script>

<div class="metrics min-w-full rounded-lg border border-border-subtle bg-surface-raised p-4 shadow-md">
	<h3 class="mb-4 text-lg font-semibold text-text-rich">Alignment File Metrics</h3>

	{#if fileMetricsJSON?.error}
		<!-- Error State -->
		<div class="rounded-md border border-status-error/20 bg-status-error/5 p-4">
			<div class="flex items-start gap-3">
				<svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
				<div class="flex-1">
					<p class="font-medium text-status-error">Validation Error</p>
					<p class="mt-1 text-sm text-text-slate">{fileMetricsJSON.error}</p>
				</div>
			</div>
		</div>
	{:else if fileMetricsJSON?.FILE_INFO}
		<!-- Status Badge (non-interactive) and Toggle -->
		<div class="mb-4 flex items-center gap-3">
			<span
				class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium {passed
					? 'bg-status-success/10 text-status-success'
					: 'bg-status-error/10 text-status-error'}"
			>
				{#if passed}
					<svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
				{:else}
					<svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				{/if}
				{passed ? 'Valid Tree' : 'Invalid Tree'}
			</span>
			<button
				on:click={() => (isOpen = !isOpen)}
				class="text-sm text-text-slate hover:text-text-rich transition-colors flex items-center gap-1"
			>
				<svg class="h-4 w-4 transition-transform {isOpen ? 'rotate-90' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				{isOpen ? 'Hide details' : 'Show details'}
			</button>
		</div>

		{#if isOpen}
			<!-- Compact Metrics Grid -->
			<div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6 max-w-lg">
				<div class="flex justify-between">
					<span class="text-text-slate">Sequences</span>
					<span class="font-medium text-text-rich">{fileMetricsJSON.FILE_INFO.sequences}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-text-slate">Partitions</span>
					<span class="font-medium text-text-rich">{fileMetricsJSON.FILE_INFO.partitions}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-text-slate">Sites</span>
					<span class="font-medium text-text-rich">
						{fileMetricsJSON.FILE_INFO.rawsites} raw → {fileMetricsJSON.FILE_INFO.sites} processed
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-text-slate">Genetic Code</span>
					<span class="font-medium text-text-rich">{fileMetricsJSON.FILE_INFO.gencodeid}</span>
				</div>
				{#if fileMetricsJSON.FILE_INFO.type}
					<div class="flex justify-between">
						<span class="text-text-slate">Data Type</span>
						<span class="font-medium text-text-rich">{fileMetricsJSON.FILE_INFO.type}</span>
					</div>
				{/if}
				<div class="flex justify-between">
					<span class="text-text-slate">Analyzed</span>
					<span class="font-medium text-text-rich">{formatTimestamp(fileMetricsJSON.FILE_INFO.timestamp)}</span>
				</div>
				{#if fileMetricsJSON.FILE_INFO.duplicate_sequences}
					<div class="flex justify-between">
						<span class="text-text-slate">Duplicates</span>
						<span class="font-medium text-status-warning">{fileMetricsJSON.FILE_INFO.duplicate_sequences}</span>
					</div>
				{/if}
				{#if fileMetricsJSON.FILE_INFO.ambiguous_sites}
					<div class="flex justify-between">
						<span class="text-text-slate">Ambiguous</span>
						<span class="font-medium text-status-warning">{fileMetricsJSON.FILE_INFO.ambiguous_sites}</span>
					</div>
				{/if}
				{#if fileMetricsJSON.FILE_INFO.stop_codons}
					<div class="flex justify-between">
						<span class="text-text-slate">Stop Codons</span>
						<span class="font-medium text-status-error">{fileMetricsJSON.FILE_INFO.stop_codons}</span>
					</div>
				{/if}
			</div>

			<!-- NJ Tree Section -->
			{#if fileMetricsJSON.FILE_INFO?.nj}
				<div class="border-t border-border-subtle pt-4 mt-4">
					<div class="flex items-center justify-between mb-3">
						<h4 class="text-sm font-medium text-text-rich">Neighbor Joining Tree</h4>
						<div class="flex items-center gap-2">
							<button
								on:click={() => copyToClipboard(fileMetricsJSON.FILE_INFO.nj, 'nj')}
								class="text-xs text-text-slate hover:text-text-rich transition-colors flex items-center gap-1"
							>
								{#if copySuccess === 'nj'}
									<svg class="h-3.5 w-3.5 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									Copied
								{:else}
									<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
									Copy Newick
								{/if}
							</button>
							<button
								on:click={() => (njStringExpanded = !njStringExpanded)}
								class="text-xs text-text-slate hover:text-text-rich transition-colors"
							>
								{njStringExpanded ? 'Hide string' : 'Show string'}
							</button>
						</div>
					</div>

					{#if njStringExpanded}
						<div class="mb-3 rounded border border-border-subtle bg-surface-sunken p-2 overflow-x-auto">
							<pre class="whitespace-pre-wrap text-xs text-text-slate font-mono">{fileMetricsJSON.FILE_INFO.nj}</pre>
						</div>
					{/if}

					<div class="relative">
						<div class="absolute top-0 left-0 text-[10px] text-text-slate bg-surface-raised px-1 rounded">
							Genetic Distance
						</div>
						<PhyloTree
							newickString={fileMetricsJSON.FILE_INFO.nj}
							height={400}
							width={700}
							viewerType="phylotree"
							selectable={false}
						/>
					</div>
				</div>
			{/if}

			<!-- User Supplied Tree Section -->
			{#if fileMetricsJSON?.FILE_PARTITION_INFO}
				{#each Object.entries(fileMetricsJSON.FILE_PARTITION_INFO) as [partitionKey, partition]}
					{#if partition.usertree}
						<div class="border-t border-border-subtle pt-4 mt-4">
							<div class="flex items-center justify-between mb-3">
								<h4 class="text-sm font-medium text-text-rich">
									User Supplied Tree{Object.keys(fileMetricsJSON.FILE_PARTITION_INFO).length > 1
										? ` (Partition ${partitionKey})`
										: ''}
								</h4>
								<div class="flex items-center gap-2">
									<button
										on:click={() => copyToClipboard(partition.usertree, `user-${partitionKey}`)}
										class="text-xs text-text-slate hover:text-text-rich transition-colors flex items-center gap-1"
									>
										{#if copySuccess === `user-${partitionKey}`}
											<svg class="h-3.5 w-3.5 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
											Copied
										{:else}
											<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
											Copy Newick
										{/if}
									</button>
									<button
										on:click={() => (userTreeStringExpanded[partitionKey] = !userTreeStringExpanded[partitionKey])}
										class="text-xs text-text-slate hover:text-text-rich transition-colors"
									>
										{userTreeStringExpanded[partitionKey] ? 'Hide string' : 'Show string'}
									</button>
								</div>
							</div>

							{#if userTreeStringExpanded[partitionKey]}
								<div class="mb-3 rounded border border-border-subtle bg-surface-sunken p-2 overflow-x-auto">
									<pre class="whitespace-pre-wrap text-xs text-text-slate font-mono">{partition.usertree}</pre>
								</div>
							{/if}

							<div class="relative">
								<div class="absolute top-0 left-0 text-[10px] text-text-slate bg-surface-raised px-1 rounded">
									Genetic Distance
								</div>
								<PhyloTree
									newickString={partition.usertree}
									height={400}
									width={700}
									viewerType="phylotree"
									selectable={false}
								/>
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		{/if}
	{:else}
		<p class="text-sm text-text-slate">No data available.</p>
	{/if}
</div>
