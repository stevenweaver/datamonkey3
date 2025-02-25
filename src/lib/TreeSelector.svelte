<script>
	import { onMount } from 'svelte';
	import PhyloTree from './phylotree.svelte';

	export let trees = {};
	export let selectedTree = 'nj'; // Default selected tree
	export let onChange; // Function to notify parent on change
	export let initialBranchTestMode = false; // Optional initial state for branch test mode

	let customTreeInput = '';
	let showCustomInput = false;
	let showMLOptions = false;
	let fileInput;
	let branchTestMode = initialBranchTestMode;
	let selectedBranches = [];
	let selectedBranchSet = 'foreground'; // Default branch set
	let branchSets = ['foreground', 'background', 'test']; // Placeholder branch sets
	let taggedNewick = '';

	$: currentTreeString = trees[selectedTree] || '';
	$: showCustomInput = selectedTree === 'custom' && !trees.custom;
	$: showMLOptions = selectedTree === 'ml' && !trees.ml;

	function handleTreeChange(event) {
		selectedTree = event.target.value;
		onChange(selectedTree);
		
		// Reset branch selection when tree changes
		selectedBranches = [];
		taggedNewick = '';
		
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
	
	function toggleBranchTestMode() {
		branchTestMode = !branchTestMode;
		// Reset selections when toggling mode
		selectedBranches = [];
		taggedNewick = '';
	}
	
	function handleBranchSelection(event) {
		selectedBranches = event.detail.selectedBranches;
		taggedNewick = event.detail.taggedNewick;
		
		// Pass the updated tagged Newick back to parent
		if (onChange && taggedNewick) {
			onChange(selectedTree, taggedNewick);
		}
	}
	
	function handleBranchSetChange(event) {
		selectedBranchSet = event.target.value;
		// In a real implementation, this would update the tag used for branches
		// For now, we'll just reset the selections
		selectedBranches = [];
		taggedNewick = '';
	}
</script>

<div class="tree-selector">
	<div class="mb-4">
		<label for="tree-select" class="mb-1 block text-gray-700">Select Tree</label>
		<select
			id="tree-select"
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
				<label for="tree-file" class="block mb-1 text-sm">Upload Newick File:</label>
				<input 
					id="tree-file"
					type="file" 
					bind:this={fileInput} 
					on:change={handleFileUpload} 
					accept=".nwk,.txt,.tree"
					class="border border-gray-300 p-1 w-full rounded text-sm"
				/>
			</div>
			<div class="mb-3">
				<label for="tree-input" class="block mb-1 text-sm">Or Paste Newick String:</label>
				<textarea 
					id="tree-input"
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
			<!-- Added Branch Testing Mode Toggle -->
			<div class="mb-4 flex items-center">
				<input 
					type="checkbox" 
					id="branch-test-mode" 
					bind:checked={branchTestMode} 
					on:change={toggleBranchTestMode}
					class="mr-2 h-4 w-4"
				/>
				<label for="branch-test-mode" class="text-gray-700">Branch Testing Mode</label>
			</div>
			
			<!-- Branch Set Selection (Only visible in branch test mode) -->
			{#if branchTestMode}
				<div class="mb-4">
					<label for="branch-set" class="mb-1 block text-sm text-gray-700">Branch Set</label>
					<select
						id="branch-set"
						bind:value={selectedBranchSet}
						on:change={handleBranchSetChange}
						class="w-full rounded border border-gray-300 p-2 text-sm"
					>
						{#each branchSets as branchSet}
							<option value={branchSet}>
								{branchSet}
							</option>
						{/each}
					</select>
					
					<!-- Selected Branches Info -->
					<div class="mt-3 text-sm">
						<p class="mb-1">Selected branches: {selectedBranches.length}</p>
						{#if selectedBranches.length > 0}
							<div class="mt-2 max-h-24 overflow-y-auto border border-gray-200 p-2 text-xs bg-gray-50 rounded">
								<ul class="list-disc pl-4">
									{#each selectedBranches as branch}
										<li>{branch}</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</div>
			{/if}
			
			<h4 class="font-semibold mb-2">Tree Visualization</h4>
			<div class="tree-view" style="height: 400px; overflow: auto;">
				<PhyloTree 
					newickString={currentTreeString} 
					height={350} 
					width={700} 
					branchTestMode={branchTestMode}
					bind:selectedBranches={selectedBranches}
					on:branchselection={handleBranchSelection}
				/>
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