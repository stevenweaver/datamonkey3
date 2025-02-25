<script>
	import { onMount, afterUpdate, createEventDispatcher } from 'svelte';
	import { phylotree } from 'phylotree';
	import * as d3 from 'd3';

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
	let menuContainer;

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
			'top-bottom-spacing': 'fit-to-size',
			'show-menu': branchTestMode // Show menu only in branch test mode
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
			setupNodeMenu();
		}
	}
	
	function setupNodeMenu() {
		// Get all nodes in the tree
		const nodeElements = treeContainer.querySelectorAll('.node');
		
		// Add click handlers to each node
		nodeElements.forEach(node => {
			node.addEventListener('click', (e) => {
				e.stopPropagation();
				
				// Clear previous menu
				if (menuContainer) {
					menuContainer.remove();
				}
				
				// Get node data
				const nodeId = node.id || node.getAttribute('data-node-id');
				const treeNode = nodeId ? tree.getNodeByName(nodeId) : null;
				
				if (treeNode) {
					// Create dropdown menu
					menuContainer = document.createElement('div');
					menuContainer.className = 'node-menu';
					menuContainer.style = `
						position: absolute;
						top: ${e.pageY}px;
						left: ${e.pageX}px;
						background: white;
						border: 1px solid #ccc;
						border-radius: 4px;
						box-shadow: 0 2px 10px rgba(0,0,0,0.2);
						z-index: 1000;
						padding: 8px 0;
					`;
					
					// Create menu items
					const menuItems = [
						{ label: 'Tag as Foreground', action: () => tagBranch(treeNode, 'foreground') },
						{ label: 'Tag as Background', action: () => tagBranch(treeNode, 'background') },
						{ label: 'Remove Tag', action: () => removeTag(treeNode) }
					];
					
					menuItems.forEach(item => {
						const menuItem = document.createElement('div');
						menuItem.innerText = item.label;
						menuItem.style = `
							padding: 6px 12px;
							cursor: pointer;
							font-size: 14px;
						`;
						menuItem.addEventListener('mouseover', () => {
							menuItem.style.backgroundColor = '#f0f0f0';
						});
						menuItem.addEventListener('mouseout', () => {
							menuItem.style.backgroundColor = 'transparent';
						});
						menuItem.addEventListener('click', () => {
							item.action();
							menuContainer.remove();
						});
						menuContainer.appendChild(menuItem);
					});
					
					// Add menu to document
					document.body.appendChild(menuContainer);
					
					// Close menu on document click
					const closeMenu = (e) => {
						if (!menuContainer.contains(e.target)) {
							menuContainer.remove();
							document.removeEventListener('click', closeMenu);
						}
					};
					document.addEventListener('click', closeMenu);
				}
			});
		});
	}
	
	function tagBranch(node, tagType) {
		// Find the SVG element corresponding to this node
		const nodeElement = treeContainer.querySelector(`#${node.id}`);
		const branchElement = treeContainer.querySelector(`.branch[id="${node.id}"]`);
		
		if (branchElement) {
			// Remove any existing selection classes
			branchElement.classList.remove('selected-branch', 'foreground-branch', 'background-branch');
			
			// Add new selection class based on tag type
			branchElement.classList.add('selected-branch', `${tagType}-branch`);
			branchElement.setAttribute('stroke-width', '3');
			
			// Set appropriate color based on tag type
			const color = tagType === 'foreground' ? '#e74c3c' : '#3498db';
			branchElement.setAttribute('stroke', color);
			
			// Update branch tags
			branchTags[node.id] = `{${tagType.toUpperCase()}}`;
			
			// Update selected branches list
			selectedBranches = Object.keys(branchTags);
			
			// Create tagged Newick string
			const taggedNewick = generateTaggedNewick();
			
			// Notify parent component of change
			dispatch('branchselection', {
				selectedBranches,
				taggedNewick,
				tagType
			});
		}
	}
	
	function removeTag(node) {
		// Find the SVG element corresponding to this node
		const branchElement = treeContainer.querySelector(`.branch[id="${node.id}"]`);
		
		if (branchElement) {
			// Remove selection classes
			branchElement.classList.remove('selected-branch', 'foreground-branch', 'background-branch');
			branchElement.setAttribute('stroke-width', '1');
			branchElement.setAttribute('stroke', '#555');
			
			// Remove from branch tags
			delete branchTags[node.id];
			
			// Update selected branches list
			selectedBranches = Object.keys(branchTags);
			
			// Create tagged Newick string
			const taggedNewick = generateTaggedNewick();
			
			// Notify parent component of change
			dispatch('branchselection', {
				selectedBranches,
				taggedNewick
			});
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
						branch.classList.remove('selected-branch', 'foreground-branch', 'background-branch');
						branch.setAttribute('stroke-width', '1');
						branch.setAttribute('stroke', '#555');
						delete branchTags[branchId];
					} else {
						// Add selection (default to foreground)
						branch.classList.add('selected-branch', 'foreground-branch');
						branch.setAttribute('stroke-width', '3');
						branch.setAttribute('stroke', '#e74c3c');
						branchTags[branchId] = '{FOREGROUND}';
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
		stroke-width: 3;
	}
	
	.phylo-tree :global(.foreground-branch) {
		stroke: #e74c3c;
	}
	
	.phylo-tree :global(.background-branch) {
		stroke: #3498db;
	}
	
	.phylo-tree :global(.node) {
		cursor: pointer;
	}
</style>