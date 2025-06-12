<!-- src/lib/MethodSelector.svelte -->
<script>
	export let methodConfig;
	export let runMethod = [];
	export let onConfigureMethod = null; // New prop for configuring a method

	function runMethodHandler(method) {
		console.log(`Running method: ${method}`);
		runMethod(method);
	}

	function configureMethodHandler(method) {
		console.log(`Configuring method: ${method}`);
		if (onConfigureMethod) {
			onConfigureMethod(method);
		}
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
			<div class="mt-4 flex gap-2">
				{#if onConfigureMethod}
					<button 
						class="rounded bg-purple-500 px-2 py-1 text-white hover:bg-purple-600"
						on:click={() => configureMethodHandler(key)}
					>
						Configure
					</button>
				{/if}
				<button 
					class="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
					on:click={() => runMethodHandler(key)}
				>
					Run
				</button>
			</div>
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