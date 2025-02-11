<script>
	import PhyloTree from './phylotree.svelte';
	export let fileMetricsJSON;

	let isOpen = false;
	const passed = fileMetricsJSON?.FILE_INFO?.goodtree; // Determine if it passed based on your condition
</script>

<div class="metrics min-w-full rounded-lg border border-gray-300 bg-gray-50 p-4 shadow-md">
	<h3 class="mb-4 text-lg font-bold">Alignment File Metrics</h3>

	{#if fileMetricsJSON?.error}
		<div class="mt-4 text-red-600">
			<p class="font-medium">Error:</p>
			<p>{fileMetricsJSON.error}</p>
		</div>
	{:else if fileMetricsJSON?.FILE_INFO}
		<button
			on:click={() => (isOpen = !isOpen)}
			class="mb-4 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
		>
			{passed ? 'Passed' : 'Not Passed'}
		</button>

		{#if isOpen}
			<table class="min-w-full border-collapse">
				<thead>
					<tr>
						<th class="border-b border-gray-200 px-2 py-2 text-left">Metric</th>
						<th class="border-b border-gray-200 px-2 py-2 text-left">Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="border-b border-gray-200 px-2 py-2 font-medium">Genetic Code ID:</td>
						<td class="border-b border-gray-200 px-2 py-2">{fileMetricsJSON.FILE_INFO.gencodeid}</td
						>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-2 py-2 font-medium">Good Tree:</td>
						<td class="border-b border-gray-200 px-2 py-2"
							>{fileMetricsJSON.FILE_INFO.goodtree ? 'Yes' : 'No'}</td
						>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-2 py-2 font-medium">Partitions:</td>
						<td class="border-b border-gray-200 px-2 py-2"
							>{fileMetricsJSON.FILE_INFO.partitions}</td
						>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-2 py-2 font-medium">Raw Sites:</td>
						<td class="border-b border-gray-200 px-2 py-2">{fileMetricsJSON.FILE_INFO.rawsites}</td>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-2 py-2 font-medium">Processed Sites:</td>
						<td class="border-b border-gray-200 px-2 py-2">{fileMetricsJSON.FILE_INFO.sites}</td>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-2 py-2 font-medium">Sequences:</td>
						<td class="border-b border-gray-200 px-2 py-2">{fileMetricsJSON.FILE_INFO.sequences}</td
						>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-2 py-2 font-medium">Timestamp:</td>
						<td class="border-b border-gray-200 px-2 py-2"
							>{new Date(
								parseInt(fileMetricsJSON.FILE_INFO.timestamp.trim()) * 1000
							).toLocaleString()}</td
						>
					</tr>
				</tbody>
			</table>
			{#if fileMetricsJSON.FILE_INFO?.nj}
				<h4 class="mt-6 text-lg font-bold">Raw Neighbor Joining (NJ) String</h4>
				<div class="mt-2 overflow-x-auto rounded border border-gray-300 bg-gray-100 p-2">
					<pre class="whitespace-pre-wrap text-sm text-gray-700">{fileMetricsJSON.FILE_INFO
							.nj}</pre>
				</div>
				<PhyloTree newickString={fileMetricsJSON.FILE_INFO.nj} height={600} width={800} />
			{/if}

			{#if fileMetricsJSON?.FILE_PARTITION_INFO}
				<h4 class="mt-6 text-lg font-bold">User Supplied Tree</h4>
				<div class="mt-2 overflow-x-auto rounded border border-gray-300 bg-gray-100 p-2">
					<pre class="whitespace-pre-wrap text-sm text-gray-700">{fileMetricsJSON
							.FILE_PARTITION_INFO['0'].usertree}</pre>
				</div>

				<PhyloTree
					newickString={fileMetricsJSON.FILE_PARTITION_INFO['0'].usertree}
					height={600}
					width={800}
				/>
			{/if}
		{/if}
	{:else}
		<p class="mt-4 text-gray-600">No data available.</p>
	{/if}
</div>
