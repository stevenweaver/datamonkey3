<script>
	import TreeSelector from './TreeSelector.svelte';
	export let runMethod; // Function to be called to run the analysis
	export let trees = {}; // Pass the trees object
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import toml from 'toml';
	import methodConfigToml from './config/methodOptions.toml?raw';

	let currentMethod = page.params.method;
	let methodConfigs = toml.parse(methodConfigToml);
	let methodConfig = methodConfigs[currentMethod];

	let formData = {};

	// Initialize formData with default values from JSON options
	onMount(() => {
		if (!methodConfig) return;

		methodConfig.options.forEach((option) => {
			if (option.default !== undefined) {
				formData[option.name] = option.default;
			} else if (option.takes_value && option.type === 'number') {
				formData[option.name] = option.minimum || 0; // Default to minimum if no default is set
			}
		});
	});

	function handleInputChange(event, name) {
		const { value } = event.target;
		formData[name] = value;
	}

	function handleCheckboxChange(event, name) {
		formData[name] = event.target.checked;
	}

	function handleTreeSelection(newTree, taggedNewick, parsedTags) {
		// Handle the selected tree
		if (newTree) {
			selectedTree = newTree;
		}
		
		// Handle parsed tags if provided
		if (parsedTags && parsedTags.length) {
			console.log("Received parsed tags:", parsedTags);
			// Additional handling for parsed tags can be added here
		}
	}

	// Update the run button click handler
	function handleRunClick() {
		formData.tree = trees[selectedTree]; // Include the selected tree
		runMethod(formData);
	}
</script>

<div id="method-options" class="rounded-lg bg-white p-6 shadow-md">
	<h3 class="mb-4 text-xl font-semibold">Analysis Options</h3>

	{#if !methodConfig}
		<p>Method not found</p>
	{/if}

	{#if methodConfig}
		{#if methodConfig.description}
			<p class="mb-4">{methodConfig.description}</p>
		{/if}

		{#if methodConfig.options.length === 0}
			<p>No options available for this method</p>
		{/if}

		{#if methodConfig.options.length > 0}
			<TreeSelector {trees} onChange={handleTreeSelection} />

			{#each methodConfig.options as option (option.name)}
				<div class="mb-4">
					<label class="mb-1 block text-gray-700">{option.description}</label>
					{#if option.takes_value}
						{#if option.type === 'string'}
							<select
								bind:value={formData[option.name]}
								on:change={(event) => handleInputChange(event, option.name)}
								class="w-full rounded border border-gray-300 p-2"
							>
								{#each option.choices ? option.choices : [{ value: option.default, description: option.default }] as choice}
									<option value={choice.value}>{choice.description}</option>
								{/each}
							</select>
						{:else if option.type === 'number'}
							<input
								type="number"
								bind:value={formData[option.name]}
								min={option.minimum || 0}
								max={option.maximum || undefined}
								on:input={(event) => handleInputChange(event, option.name)}
								class="w-full rounded border border-gray-300 p-2"
								placeholder={option.default}
							/>
						{:else if option.type === 'file' && option.name !== 'alignment'}
							<input
								type="file"
								on:change={(event) => handleInputChange(event, option.name)}
								class="w-full rounded border border-gray-300 p-2"
							/>
						{/if}
					{/if}
				</div>
			{/each}

			<div class="mb-4">
				<button
					class="w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600"
					on:click={handleRunClick}
				>
					Run Analysis
				</button>
			</div>
		{/if}
	{/if}
</div>
