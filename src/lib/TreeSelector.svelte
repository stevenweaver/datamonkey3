<script>
	import { onMount } from 'svelte';
	import PhyloTree from './phylotree.svelte';
	
	// Define tree methods with readable names and IDs
	const TREE_METHODS = [
		{ id: 'nj', name: 'Neighbor Joining' },
		{ id: 'upgma', name: 'UPGMA' },
		{ id: 'ml', name: 'Maximum Likelihood', needsGeneration: true },
		{ id: 'usertree', name: 'User Tree' },
		{ id: 'custom', name: 'Custom Tree', needsInput: true }
	];

	// Define branch sets for tagging
	const BRANCH_SETS = [
		{ id: 'foreground', name: 'Foreground' },
		{ id: 'background', name: 'Background' },
		{ id: 'test', name: 'Test Group' }
	];

	export let trees = {};
	export let selectedTree = 'nj'; // Default selected tree
	export let onChange; // Function to notify parent on change
	export let initialBranchTestMode = false; // Optional initial state for branch test mode
	export let userTree = ''; // User-provided tree for the custom option

	let customTreeInput = '';
	let showCustomInput = false;
	let showMLOptions = false;
	let fileInput;
	let branchTestMode = initialBranchTestMode;
	let selectedBranches = [];
	let selectedBranchSet = 'foreground'; // Default branch set
	let taggedNewick = '';
	let showTreeViz = true;
	let parsed_tags = []; // Store parsed tags from the tree

	// Initialize component and handle pre-populated trees
	onMount(() => {
		// If user tree is available in trees object, make sure it's selected as an option
		if (trees.usertree && !selectedTree) {
			selectedTree = 'usertree';
			onChange('usertree');
		}
		
		// Handle custom tree initialization
		if (selectedTree === 'custom') {
			// If userTree prop is provided
			if (userTree) {
				customTreeInput = userTree;
				trees.custom = userTree;
			} 
			// Or if usertree exists in trees object and we need to initialize custom
			else if (trees.usertree && !trees.custom) {
				customTreeInput = trees.usertree;
				trees.custom = trees.usertree;
			}
		}
	});

	// Derived values
	$: currentTreeString = trees[selectedTree] || '';
	$: currentTreeMethod = TREE_METHODS.find(method => method.id === selectedTree) || TREE_METHODS[0];
	$: showCustomInput = selectedTree === 'custom';
	$: showMLOptions = selectedTree === 'ml' && !trees.ml;
	$: currentBranchSet = BRANCH_SETS.find(set => set.id === selectedBranchSet) || 
		(parsed_tags.includes(selectedBranchSet) ? { id: selectedBranchSet, name: `Tag: ${selectedBranchSet}` } : BRANCH_SETS[0]);
	$: showTreeViz = currentTreeString && !(showMLOptions && !trees.ml);
	$: availableBranchSets = [
		...BRANCH_SETS,
		...parsed_tags.map(tag => ({ id: tag, name: `Tag: ${tag}` }))
			.filter(set => !BRANCH_SETS.some(defaultSet => defaultSet.id === set.id))
	];
	
	// Initialize custom tree input with the appropriate tree when custom option is selected
	$: if (selectedTree === 'custom' && !customTreeInput) {
		// First try to use the explicitly provided userTree prop
		if (userTree) {
			customTreeInput = userTree;
			if (!trees.custom) trees.custom = userTree;
		} 
		// Otherwise try to use the usertree from trees object
		else if (trees.usertree) {
			customTreeInput = trees.usertree;
			if (!trees.custom) trees.custom = trees.usertree;
		}
	}

	function handleTreeChange(event) {
		selectedTree = event.target.value;
		onChange(selectedTree);

		// Reset branch selection when tree changes
		selectedBranches = [];
		taggedNewick = '';

		// Show appropriate UI based on selection
		const method = TREE_METHODS.find(m => m.id === selectedTree);
		if (method?.id === 'custom') {
			showCustomInput = true;
			showMLOptions = false;
			
			// Initialize custom tree input with user tree if available
			if (!customTreeInput) {
				if (userTree) {
					customTreeInput = userTree;
					if (!trees.custom) trees.custom = userTree;
				} else if (trees.usertree) {
					customTreeInput = trees.usertree;
					if (!trees.custom) trees.custom = trees.usertree;
				}
			}
		} else if (method?.needsGeneration && !trees[selectedTree]) {
			showMLOptions = true;
			showCustomInput = false;
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
		trees.ml =
			'(((HUMAN:0.00432,CHIMP:0.00789):0.01243,(BABOON:0.00321,RHMONKEY:0.00219):0.02814):0.09531,((MOUSE:0.09127,RAT:0.08316):0.27392,(COW:0.19151,PIG:0.17324,HORSE:0.18962):0.06317):0.03215,CAT:0.22376)';
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

	function handleParsedTags(event) {
		// Get parsed tags from the tree
		parsed_tags = event.detail.parsed_tags || [];
		
		// Update branch set dropdown if tags are found
		if (parsed_tags.length > 0) {
			// Create custom branch sets from parsed tags
			const customBranchSets = parsed_tags.map(tag => ({ 
				id: tag, 
				name: `Tag: ${tag}` 
			}));
			
			// Only add unique tags that aren't already in the branch sets
			const existingIds = BRANCH_SETS.map(set => set.id);
			const uniqueCustomSets = customBranchSets.filter(set => !existingIds.includes(set.id));
			
			// If we found new tags, update the branch sets
			if (uniqueCustomSets.length > 0) {
				// Update the default selected branch set to use the first parsed tag
				selectedBranchSet = parsed_tags[0];
				
				// Automatically enable branch test mode if tags are found
				if (!branchTestMode) {
					branchTestMode = true;
				}
			}
		}
		
		// Notify parent about the parsed tags - but don't pass selectedTree directly
		if (onChange && parsed_tags.length > 0) {
			// Just pass the tags without changing the tree selection
			const currentSelectionId = selectedTree; // Store current selection ID
			onChange(currentSelectionId, null, parsed_tags); // Pass it explicitly
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
		<label for="tree-select" class="mb-1 block text-gray-700">Select Tree Method</label>
		<select
			id="tree-select"
			bind:value={selectedTree}
			on:change={handleTreeChange}
			class="w-full rounded border border-gray-300 p-2"
		>
			{#each TREE_METHODS as method}
				{#if trees[method.id] || (!method.needsInput && !method.needsGeneration)}
					<option value={method.id}>
						{method.name}
					</option>
				{/if}
			{/each}
			
			{#each TREE_METHODS as method}
				{#if !trees[method.id] && (method.needsInput || method.needsGeneration)}
					<option value={method.id}>
						{method.name}
					</option>
				{/if}
			{/each}
		</select>
	</div>

	{#if showCustomInput}
		<div class="mt-4 rounded border border-gray-200 p-4">
			<h4 class="mb-2 font-semibold">Custom Tree</h4>
			
			{#if trees.custom}
				<div class="mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
					<p class="font-medium">Current Custom Tree:</p>
					<p class="truncate">{trees.custom.substring(0, 50)}{trees.custom.length > 50 ? '...' : ''}</p>
					<p class="mt-1 font-medium">You can modify this tree below:</p>
				</div>
			{/if}
			
			<div class="mb-3">
				<label for="tree-file" class="mb-1 block text-sm">Upload Newick File:</label>
				<input
					id="tree-file"
					type="file"
					bind:this={fileInput}
					on:change={handleFileUpload}
					accept=".nwk,.txt,.tree"
					class="w-full rounded border border-gray-300 p-1 text-sm"
				/>
			</div>
			<div class="mb-3">
				<label for="tree-input" class="mb-1 block text-sm">
					{#if trees.custom}
						Edit Newick String:
					{:else}
						Paste Newick String:
					{/if}
				</label>
				<textarea
					id="tree-input"
					bind:value={customTreeInput}
					class="h-24 w-full rounded border border-gray-300 p-2"
					placeholder="Enter Newick format tree string..."
				></textarea>
			</div>
			<button
				on:click={handleCustomTreeSubmit}
				class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
				disabled={!customTreeInput.trim()}
			>
				{#if trees.custom}
					Update Custom Tree
				{:else}
					Submit Custom Tree
				{/if}
			</button>
		</div>
	{/if}

	{#if showMLOptions}
		<div class="mt-4 rounded border border-gray-200 p-4">
			<h4 class="mb-2 font-semibold">Maximum Likelihood Tree</h4>
			<p class="mb-3 text-sm">Generate a Maximum Likelihood tree from your alignment.</p>
			<button
				on:click={runMLAlignment}
				class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
			>
				Run ML Alignment
			</button>
		</div>
	{/if}

	<!-- Tree visualization - shown for all trees with data, even while editing custom tree -->
	{#if showTreeViz}
		<div class="mt-4 rounded border border-gray-200 p-4">
			<!-- Current method display -->
			<div class="mb-2 text-sm text-gray-600">
				Current method: <span class="font-medium">{currentTreeMethod.name}</span>
			</div>

			<!-- Branch Testing Mode Toggle -->
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
						{#each availableBranchSets as branchSet}
							<option value={branchSet.id}>
								{branchSet.name}
							</option>
						{/each}
					</select>

					<!-- Selected Branches Info -->
					<div class="mt-3 text-sm">
						<p class="mb-1">Selected branches: {selectedBranches.length}</p>
						{#if selectedBranches.length > 0}
							<div
								class="mt-2 max-h-24 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-2 text-xs"
							>
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

			<h4 class="mb-2 font-semibold">Tree Visualization</h4>
			<div class="tree-view" style="height: 400px; overflow: auto;">
				<PhyloTree
					newickString={currentTreeString}
					height={350}
					width={700}
					{branchTestMode}
					bind:selectedBranches
					on:branchselection={handleBranchSelection}
					on:parsedtags={handleParsedTags}
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