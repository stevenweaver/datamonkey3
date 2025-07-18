<script>
	import { onMount } from 'svelte';
	import { treeStore } from '../stores/tree';
	import FelOptions from './FelOptions.svelte';
	import FormGenerator from './FormGenerator.svelte';
	import toml from 'toml';
	import methodConfigToml from './config/methodOptions.toml?raw';

	export let runMethod; // Function to run the method analysis
	export let selectedMethod = 'FEL'; // Default method
	export let methodInitialized = false; // Flag to track if method was set externally

	let methodConfigs = {};
	let trees = {};

	onMount(() => {
		methodConfigs = toml.parse(methodConfigToml);
		treeStore.subscribe((value) => {
			trees = value;
		});

		// Log the selected method on mount
		console.log(`MethodOptionsTab mounted with method: ${selectedMethod}`);
		methodInitialized = true;
	});

	// Track selected method
	function handleMethodSelect(event) {
		selectedMethod = event.target.value;
	}

	// Method configurations for the form generator or specialized components
	const methodComponents = {
		FEL: FelOptions
		// Add more methods with specific components here as needed
	};

	// Function to correctly handle the run method with options
	function handleRunMethod(options) {
		if (typeof options === 'object') {
			// For specialized components that pass options object
			runMethod(selectedMethod, options);
		} else {
			// For simple method calls without options
			runMethod(options || selectedMethod);
		}
	}
</script>

<div class="method-options-tab">
	<div class="mb-6">
		<label for="method-selector" class="mb-2 block text-lg font-semibold"
			>Select Analysis Method</label
		>
		<select
			id="method-selector"
			bind:value={selectedMethod}
			on:change={handleMethodSelect}
			class="w-full rounded-lg border border-gray-300 p-2 text-gray-700"
		>
			<option value="FEL">FEL (Fixed Effects Likelihood)</option>
			<option value="SLAC">SLAC (Single-Likelihood Ancestor Counting)</option>
			<option value="MEME">MEME (Mixed Effects Model of Evolution)</option>
			<option value="BUSTED"
				>BUSTED (Branch-Site Unrestricted Statistical Test for Episodic Diversification)</option
			>
			<option value="FUBAR">FUBAR (Fast Unconstrained Bayesian AppRoximation)</option>
		</select>
	</div>

	<div class="method-description mb-4 rounded-lg bg-gray-50 p-4 text-gray-700">
		{#if methodConfigs[selectedMethod?.toLowerCase()]?.description}
			<p>{methodConfigs[selectedMethod?.toLowerCase()].description}</p>
		{:else}
			<p>Run {selectedMethod} analysis on your sequence data.</p>
		{/if}
	</div>

	<!-- Method-specific options -->
	<div class="method-options">
		{#if selectedMethod === 'FEL'}
			<FelOptions runMethod={handleRunMethod} />
		{:else if methodConfigs[selectedMethod?.toLowerCase()]}
			<FormGenerator
				methodConfig={methodConfigs[selectedMethod?.toLowerCase()]}
				runMethod={handleRunMethod}
				{trees}
			/>
		{:else}
			<div class="rounded-lg bg-yellow-50 p-4 text-yellow-700">
				<p>
					No configuration options available for {selectedMethod}. Click "Run Analysis" to continue
					with default settings.
				</p>
				<button
					class="mt-4 w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600"
					on:click={() => handleRunMethod(selectedMethod)}
				>
					Run {selectedMethod} Analysis
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.method-options-tab {
		max-width: 100%;
		margin: 0 auto;
	}
</style>
