<!-- src/lib/MethodSelector.svelte -->
<script>
	export let methods = [];
	export let runMethod = [];

	const methodDetails = {
		aBSREL: 'A method for assessing the presence of positive selection.',
		BGM: 'Bayesian graphical models for comparative analysis.',
		BUSTED: 'A method for testing positive selection in gene families.',
		ContrastFEL: 'Estimates selection pressure on branches.',
		FADE: 'Detects positive selection and adaptive evolution.',
		FEL: 'Fixed Effects Likelihood for testing selection.',
		FUBAR: 'Identifies positively selected sites.',
		GARD: 'Detects recombination in sequences.',
		HIVTRACE: 'Traces HIV transmission networks.',
		MEME: 'Identifies episodic evolution.',
		MULTIHIT: 'Analyzes multiple hits in evolution.',
		NRM: 'Nonstationary rate mixture model.',
		RELAX: 'Tests for heterogeneous selection.',
		SLAC: 'Estimation of selection pressure.'
	};
</script>

<div
	class="method-selector fixed left-0 top-0 mt-16 h-full w-64 border-r border-gray-300 bg-white p-4"
>
	<h3 class="mb-4 text-lg font-bold">Select a Method</h3>
	{#each methods as method}
		<div
			class="card mb-4 rounded border border-gray-300 bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
		>
			<h4 class="font-bold">{method}</h4>
			<p class="mt-2 text-gray-600">{methodDetails[method]}</p>
			<button class="mt-4 rounded bg-yellow-500 px-2 py-1 text-white hover:bg-yellow-600"
				>More Info</button
			>
			<button
				class="mt-4 rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
				on:click={() => runMethod(method)}>Run</button
			>
		</div>
	{/each}
</div>

<style>
	.card {
		position: relative;
		padding: 16px;
		transition: box-shadow 0.3s;
	}
	.card:hover {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}
	.method-selector {
		overflow-y: auto; /* Add scroll if content overflows */
	}
</style>
