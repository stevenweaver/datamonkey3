<script>
	import { onMount } from 'svelte';
	import PhyloTree from './phylotree.svelte';

	export let trees = {};
	export let selectedTree = 'nj'; // Default selected tree
	export let onChange; // Function to notify parent on change

	let customTreeInput = '';
	let showCustomInput = false;
	let showMLOptions = false;
	let fileInput;

	$: currentTreeString = trees[selectedTree] || '';
	$: showCustomInput = selectedTree === 'custom' && !trees.custom;
	$: showMLOptions = selectedTree === 'ml' && !trees.ml;

	function handleTreeChange(event) {
		selectedTree = event.target.value;
		onChange(selectedTree);
		
		// Show appropriate UI based on selection
		if (selectedTree === 'custom' && !trees.custom) {
			showCustomInput = true;
		} else if (selectedTree === 'ml' && !trees.ml) {
			showMLOptions = true;
		} else {
			showCustomInput = false;
			showMLOptions = false;
		}
	}

	function handleCustomTreeSubmit() {
		if (customTreeInput.trim()) {
			trees.custom = customTreeInput.trim();
			onChange(selectedTree);
		}
	}

	function handleFileUpload(event) {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				customTreeInput = e.target.result;
				trees.custom = customTreeInput;
				onChange(selectedTree);
			};
			reader.readAsText(file);
		}
	}

	function runMLAlignment() {
		// This would be implemented to connect to the ML tool
		// For now, we'll just use a placeholder tree
		trees.ml = "(((HUMAN:0.00432,CHIMP:0.00789):0.01243,(BABOON:0.00321,RHMONKEY:0.00219):0.02814):0.09531,((MOUSE:0.09127,RAT:0.08316):0.27392,(COW:0.19151,PIG:0.17324,HORSE:0.18962):0.06317):0.03215,CAT:0.22376)";
		showMLOptions = false;
		onChange(selectedTree);
	}
</script>

<div class="tree-selector">
	<div class="mb-4">
		<label class="mb-1 block text-gray-700">Select Tree</label>
		<select
			bind:value={selectedTree}
			on:change={handleTreeChange}
			class="w-full rounded border border-gray-300 p-2"
		>
			{#each Object.keys(trees) as treeKey}
				<option value={treeKey}>
					{treeKey}
				</option>
			{/each}
			{#if !trees.custom}
				<option value="custom">custom</option>
			{/if}
			{#if !trees.ml}
				<option value="ml">ml</option>
			{/if}
		</select>
	</div>

	{#if showCustomInput}
		<div class="mt-4 border border-gray-200 p-4 rounded">
			<h4 class="font-semibold mb-2">Upload or Enter Custom Tree</h4>
			<div class="mb-3">
				<label class="block mb-1 text-sm">Upload Newick File:</label>
				<input 
					type="file" 
					bind:this={fileInput} 
					on:change={handleFileUpload} 
					accept=".nwk,.txt,.tree"
					class="border border-gray-300 p-1 w-full rounded text-sm"
				/>
			</div>
			<div class="mb-3">
				<label class="block mb-1 text-sm">Or Paste Newick String:</label>
				<textarea 
					bind:value={customTreeInput} 
					class="border border-gray-300 p-2 w-full rounded h-24"
					placeholder="Enter Newick format tree string..."
				></textarea>
			</div>
			<button 
				on:click={handleCustomTreeSubmit}
				class="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
				disabled={!customTreeInput.trim()}
			>
				Submit Custom Tree
			</button>
		</div>
	{/if}

	{#if showMLOptions}
		<div class="mt-4 border border-gray-200 p-4 rounded">
			<h4 class="font-semibold mb-2">Maximum Likelihood Tree</h4>
			<p class="text-sm mb-3">Generate a Maximum Likelihood tree from your alignment.</p>
			<button 
				on:click={runMLAlignment}
				class="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
			>
				Run ML Alignment
			</button>
		</div>
	{/if}

	{#if currentTreeString && !showCustomInput && !showMLOptions}
		<div class="mt-4 border border-gray-200 p-4 rounded">
			<h4 class="font-semibold mb-2">Tree Visualization</h4>
			<div class="tree-view" style="height: 400px; overflow: auto;">
				<PhyloTree newickString={currentTreeString} height={350} width={700} />
			</div>
		</div>
	{/if}
</div>

<style>
	.tree-selector {
		background: white;
		border-radius: 0.25rem;
	}
	
	.tree-view {
		border: 1px solid #eaeaea;
		background: #fcfcfc;
		border-radius: 0.25rem;
	}
</style>