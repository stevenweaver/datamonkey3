<script>
	import PhyloTree from './phylotree.svelte';
	export let jsonData;
</script>

<div class="metrics min-w-full rounded-lg border border-gray-300 bg-gray-50 p-4 shadow-md">
	<h3 class="mb-4 text-lg font-bold">Alignment File Metrics</h3>

	{#if jsonData?.error}
		<div class="mt-4 text-red-600">
			<p class="font-medium">Error:</p>
			<p>{jsonData.error}</p>
		</div>
	{:else if jsonData?.FILE_INFO}
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
					<td class="border-b border-gray-200 px-2 py-2">{jsonData.FILE_INFO.gencodeid}</td>
				</tr>
				<tr>
					<td class="border-b border-gray-200 px-2 py-2 font-medium">Good Tree:</td>
					<td class="border-b border-gray-200 px-2 py-2"
						>{jsonData.FILE_INFO.goodtree ? 'Yes' : 'No'}</td
					>
				</tr>
				<tr>
					<td class="border-b border-gray-200 px-2 py-2 font-medium">Partitions:</td>
					<td class="border-b border-gray-200 px-2 py-2">{jsonData.FILE_INFO.partitions}</td>
				</tr>
				<tr>
					<td class="border-b border-gray-200 px-2 py-2 font-medium">Raw Sites:</td>
					<td class="border-b border-gray-200 px-2 py-2">{jsonData.FILE_INFO.rawsites}</td>
				</tr>
				<tr>
					<td class="border-b border-gray-200 px-2 py-2 font-medium">Processed Sites:</td>
					<td class="border-b border-gray-200 px-2 py-2">{jsonData.FILE_INFO.sites}</td>
				</tr>
				<tr>
					<td class="border-b border-gray-200 px-2 py-2 font-medium">Sequences:</td>
					<td class="border-b border-gray-200 px-2 py-2">{jsonData.FILE_INFO.sequences}</td>
				</tr>
				<tr>
					<td class="border-b border-gray-200 px-2 py-2 font-medium">Timestamp:</td>
					<td class="border-b border-gray-200 px-2 py-2"
						>{new Date(parseInt(jsonData.FILE_INFO.timestamp.trim()) * 1000).toLocaleString()}</td
					>
				</tr>
			</tbody>
		</table>
	{:else}
		<p class="mt-4 text-gray-600">No data available.</p>
	{/if}

	{#if jsonData.FILE_INFO?.nj}
		<h4 class="mt-6 text-lg font-bold">Raw Neighbor Joining (NJ) String</h4>
		<p class="mt-2 rounded border border-gray-300 bg-gray-100 p-2">{jsonData.FILE_INFO.nj}</p>
		<PhyloTree newickString={jsonData.FILE_INFO.nj} height={600} width={800} />
	{/if}

	{#if jsonData?.FILE_PARTITION_INFO}
		<h4 class="mt-6 text-lg font-bold">User Supplied Tree</h4>
		<p class="mt-2 rounded border border-gray-300 bg-gray-100 p-2">
			{jsonData.FILE_PARTITION_INFO['0'].usertree}
		</p>
		<PhyloTree newickString={jsonData.FILE_PARTITION_INFO['0'].usertree} height={600} width={800} />
	{/if}
</div>
