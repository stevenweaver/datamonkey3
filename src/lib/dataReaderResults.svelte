<script>
	import PhyloTree from './phylotree.svelte';
	export let fileMetricsJSON = null;

	let isOpen = false;
	$: passed = fileMetricsJSON?.FILE_INFO?.goodtree;
</script>

<div class="metrics min-w-full rounded-lg border border-border-subtle bg-surface-raised p-4 shadow-md">
	<h3 class="mb-4 text-lg font-bold">Alignment File Metrics</h3>

	{#if fileMetricsJSON?.error}
		<div class="mt-4 text-status-error">
			<p class="font-medium">Error:</p>
			<p>{fileMetricsJSON.error}</p>
		</div>
	{:else if fileMetricsJSON?.FILE_INFO}
		<div class="mb-4 flex items-center gap-3">
			<span
				class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {passed
					? 'bg-status-success/10 text-status-success'
					: 'bg-status-error/10 text-status-error'}"
			>
				{passed ? 'Valid Tree' : 'Invalid Tree'}
			</span>
			<button
				on:click={() => (isOpen = !isOpen)}
				class="inline-flex items-center rounded-md border border-border-subtle bg-surface-base px-3 py-1.5 text-sm font-medium text-text-slate shadow-sm hover:bg-surface-raised focus:outline-none"
			>
				{isOpen ? 'Hide Details' : 'Show Details'}
			</button>
		</div>

		{#if isOpen}
			<table class="min-w-full border-collapse">
				<thead>
					<tr>
						<th class="border-b border-border-platinum px-2 py-2 text-left">Metric</th>
						<th class="border-b border-border-platinum px-2 py-2 text-left">Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="border-b border-border-platinum px-2 py-2 font-medium">Genetic Code ID:</td>
						<td class="border-b border-border-platinum px-2 py-2">{fileMetricsJSON.FILE_INFO.gencodeid}</td
						>
					</tr>
					<tr>
						<td class="border-b border-border-platinum px-2 py-2 font-medium">Good Tree:</td>
						<td class="border-b border-border-platinum px-2 py-2"
							>{fileMetricsJSON.FILE_INFO.goodtree ? 'Yes' : 'No'}</td
						>
					</tr>
					<tr>
						<td class="border-b border-border-platinum px-2 py-2 font-medium">Partitions:</td>
						<td class="border-b border-border-platinum px-2 py-2"
							>{fileMetricsJSON.FILE_INFO.partitions}</td
						>
					</tr>
					<tr>
						<td class="border-b border-border-platinum px-2 py-2 font-medium">Raw Sites:</td>
						<td class="border-b border-border-platinum px-2 py-2">{fileMetricsJSON.FILE_INFO.rawsites}</td>
					</tr>
					<tr>
						<td class="border-b border-border-platinum px-2 py-2 font-medium">Processed Sites:</td>
						<td class="border-b border-border-platinum px-2 py-2">{fileMetricsJSON.FILE_INFO.sites}</td>
					</tr>
					<tr>
						<td class="border-b border-border-platinum px-2 py-2 font-medium">Sequences:</td>
						<td class="border-b border-border-platinum px-2 py-2">{fileMetricsJSON.FILE_INFO.sequences}</td
						>
					</tr>
					<tr>
						<td class="border-b border-border-platinum px-2 py-2 font-medium">Timestamp:</td>
						<td class="border-b border-border-platinum px-2 py-2"
							>{new Date(
								parseInt(fileMetricsJSON.FILE_INFO.timestamp.trim()) * 1000
							).toLocaleString()}</td
						>
					</tr>
					{#if fileMetricsJSON.FILE_INFO.type}
						<tr>
							<td class="border-b border-border-platinum px-2 py-2 font-medium">Data Type:</td>
							<td class="border-b border-border-platinum px-2 py-2">{fileMetricsJSON.FILE_INFO.type}</td>
						</tr>
					{/if}
					{#if fileMetricsJSON.FILE_INFO.duplicate_sequences}
						<tr>
							<td class="border-b border-border-platinum px-2 py-2 font-medium">Duplicate Sequences:</td>
							<td class="border-b border-border-platinum px-2 py-2">{fileMetricsJSON.FILE_INFO.duplicate_sequences}</td>
						</tr>
					{/if}
					{#if fileMetricsJSON.FILE_INFO.ambiguous_sites}
						<tr>
							<td class="border-b border-border-platinum px-2 py-2 font-medium">Ambiguous Sites:</td>
							<td class="border-b border-border-platinum px-2 py-2">{fileMetricsJSON.FILE_INFO.ambiguous_sites}</td>
						</tr>
					{/if}
					{#if fileMetricsJSON.FILE_INFO.stop_codons}
						<tr>
							<td class="border-b border-border-platinum px-2 py-2 font-medium">Stop Codons:</td>
							<td class="border-b border-border-platinum px-2 py-2">{fileMetricsJSON.FILE_INFO.stop_codons}</td>
						</tr>
					{/if}
				</tbody>
			</table>
			{#if fileMetricsJSON.FILE_INFO?.nj}
				<h4 class="mt-6 text-lg font-bold">Raw Neighbor Joining (NJ) String</h4>
				<div class="mt-2 overflow-x-auto rounded border border-border-subtle bg-surface-sunken p-2">
					<pre class="whitespace-pre-wrap text-sm text-text-slate">{fileMetricsJSON.FILE_INFO
							.nj}</pre>
				</div>
				<PhyloTree
					newickString={fileMetricsJSON.FILE_INFO.nj}
					height={600}
					width={800}
					viewerType="phylotree"
					selectable={false}
				/>
			{/if}

			{#if fileMetricsJSON?.FILE_PARTITION_INFO}
				{#each Object.entries(fileMetricsJSON.FILE_PARTITION_INFO) as [partitionKey, partition]}
					{#if partition.usertree}
						<h4 class="mt-6 text-lg font-bold">
							User Supplied Tree{Object.keys(fileMetricsJSON.FILE_PARTITION_INFO).length > 1
								? ` (Partition ${partitionKey})`
								: ''}
						</h4>
						<div class="mt-2 overflow-x-auto rounded border border-border-subtle bg-surface-sunken p-2">
							<pre class="whitespace-pre-wrap text-sm text-text-slate">{partition.usertree}</pre>
						</div>

						<PhyloTree
							newickString={partition.usertree}
							height={600}
							width={800}
							viewerType="phylotree"
							selectable={false}
						/>
					{/if}
				{/each}
			{/if}
		{/if}
	{:else}
		<p class="mt-4 text-text-slate">No data available.</p>
	{/if}
</div>
