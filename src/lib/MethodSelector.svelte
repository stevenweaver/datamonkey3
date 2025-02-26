<!-- src/lib/MethodSelector.svelte -->
<script>
	export let methodConfig;
	export let runMethod = [];

	function runMethodHandler(method) {
		runMethod(method);
	}
</script>

<div class="method-selector grid h-full grid-cols-2 bg-white p-4">
	<h3 class="mb-4 text-lg font-bold">Select a Method</h3>
	{#each Object.entries(methodConfig) as [key, method]}
		<div
			class="card m-4 rounded border border-gray-300 bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
		>
			<h4 class="font-bold">{key}</h4>
			<p class="mt-2 text-gray-600">{method['description']}</p>
			<button class="mt-4 rounded bg-yellow-500 px-2 py-1 text-white hover:bg-yellow-600"
				>More Info</button
			>
			<a
				class="mt-4 rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
				href="/methods/{method['url']}"
			>
				Run
			</a>
		</div>
	{/each}
</div>

<style>
	.card {
		padding: 16px;
	}
	.card:hover {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}
</style>
