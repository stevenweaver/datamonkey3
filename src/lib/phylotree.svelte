<script>
	import { onMount, afterUpdate, createEventDispatcher } from 'svelte';
	import { phylotree } from 'phylotree';

	export let newickString;
	export let height = 600;
	export let width = 800;
	export let branchTestMode = false;
	export let selectedBranches = [];
	
	const dispatch = createEventDispatcher();
	
	let treeContainer;
	let tree;
	let renderedTree;
	let branchTags = {};

	onMount(() => {
		renderTree();
	});

	afterUpdate(() => {
		if (newickString && treeContainer) {
			renderTree();
		}
	});

	function renderTree() {
		tree = new phylotree(newickString);
		
		const treeOptions = {
			container: 'tree-container',
			height: height,
			width: width,
			'left-right-spacing': 'fit-to-size',
			'top-bottom-spacing': 'fit-to-size'
		};
		
		// Add branch selection options if in test mode
		if (branchTestMode) {
			treeOptions.selectable = true;
			treeOptions.reroot = false; // Disable rerooting when in branch test mode
			treeOptions.transitions = false; // Disable transitions for better performance
		}
		
		renderedTree = tree.render(treeOptions);

		// Clear the container and append the SVG element
		treeContainer.innerHTML = ''; // Clear previous content if any
		treeContainer.appendChild(renderedTree.show()); // Append the SVG to the container
		
		// Set up branch selection if in test mode
		if (branchTestMode) {
			setupBranchSelection();
		}
	}
	
	function setupBranchSelection() {
		// Get all branch paths in the tree
		const branches = treeContainer.querySelectorAll('.branch');
		
		// Add click handlers to each branch
		branches.forEach(branch => {
			branch.style.cursor = 'pointer';
			branch.addEventListener('click', (e) => {
				e.stopPropagation();
				
				// Get branch data
				const branchId = branch.id;
				const node = tree.getNodeByName(branchId);
				
				if (node) {
					// Toggle selection state
					const isSelected = branch.classList.contains('selected-branch');
					
					if (isSelected) {
						// Remove selection
						branch.classList.remove('selected-branch');
						branch.setAttribute('stroke-width', '1');
						delete branchTags[branchId];
					} else {
						// Add selection
						branch.classList.add('selected-branch');
						branch.setAttribute('stroke-width', '3');
						branch.setAttribute('stroke', '#e74c3c');
						branchTags[branchId] = '{TEST}';
					}
					
					// Create tagged Newick string
					const taggedNewick = generateTaggedNewick();
					
					// Update selected branches list
					selectedBranches = Object.keys(branchTags);
					
					// Notify parent component of change
					dispatch('branchselection', {
						selectedBranches,
						taggedNewick
					});
				}
			});
		});
	}
	
	function generateTaggedNewick() {
		// This is a simplified approach - in a real implementation,
		// we would need to traverse the tree and add tags to the Newick string
		// For now, we'll just indicate which branches are tagged
		
		// Clone the original tree first
		const taggedTree = new phylotree(newickString);
		
		// Apply tags to the cloned tree
		Object.entries(branchTags).forEach(([nodeId, tag]) => {
			const node = taggedTree.getNodeByName(nodeId);
			if (node) {
				node.annotation = tag;
			}
		});
		
		// Return the tagged Newick string
		return taggedTree.getNewick();
	}
</script>

<link rel="stylesheet" href="https://unpkg.com/phylotree@1.0.0-alpha.24/dist/phylotree.css" />

<div bind:this={treeContainer} class="phylo-tree"></div>

<style>
	.phylo-tree :global(.branch) {
		stroke: #555;
		stroke-width: 1;
	}
	
	.phylo-tree :global(.selected-branch) {
		stroke: #e74c3c;
		stroke-width: 3;
	}
</style>