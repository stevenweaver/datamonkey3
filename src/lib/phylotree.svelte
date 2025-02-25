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
	let d3_layout_phylotree_context_menu_id = "d3_layout_phylotree_context_menu";

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
		// Create a bootstrap-style dropdown menu
		const nodeElements = treeContainer.querySelectorAll('.node');
		
		// Add click handlers to each node
		nodeElements.forEach(node => {
			node.addEventListener('click', (e) => {
				e.stopPropagation();
				
				// Get node data
				const nodeId = node.id || node.getAttribute('data-node-id');
				const treeNode = nodeId ? tree.getNodeByName(nodeId) : null;
				
				if (treeNode) {
					// Show context menu
					nodeDropdownMenu(treeNode, e);
				}
			});
		});
	}
	
	function nodeDropdownMenu(node, event) {
		// Create or select the menu object
		let menu_object = d3.select(treeContainer.parentNode).select("#" + d3_layout_phylotree_context_menu_id);

		if (menu_object.empty()) {
			menu_object = d3
				.select(treeContainer.parentNode)
				.append("div")
				.attr("id", d3_layout_phylotree_context_menu_id)
				.attr("class", "dropdown-menu")
				.attr("role", "menu");
		}

		// Clear existing menu items
		menu_object.selectAll("a").remove();
		menu_object.selectAll("h6").remove();
		menu_object.selectAll("div").remove();

		// Create menu items for branch tagging
		menu_object
			.append("h6")
			.attr("class", "dropdown-header")
			.text("Branch Tagging");
			
		menu_object
			.append("a")
			.attr("class", "dropdown-item")
			.attr("tabindex", "-1")
			.text("Tag as Foreground")
			.on("click", () => {
				menu_object.style("display", "none");
				tagBranch(node, 'foreground');
			});
			
		menu_object
			.append("a")
			.attr("class", "dropdown-item")
			.attr("tabindex", "-1")
			.text("Tag as Background")
			.on("click", () => {
				menu_object.style("display", "none");
				tagBranch(node, 'background');
			});
			
		menu_object
			.append("a")
			.attr("class", "dropdown-item")
			.attr("tabindex", "-1")
			.text("Remove Tag")
			.on("click", () => {
				menu_object.style("display", "none");
				removeTag(node);
			});

		// Add descendant selection options for internal nodes
		if (!isLeafNode(node)) {
			menu_object.append("div").attr("class", "dropdown-divider");
			
			menu_object
				.append("h6")
				.attr("class", "dropdown-header")
				.text("Select Descendants");
				
			menu_object
				.append("a")
				.attr("class", "dropdown-item")
				.attr("tabindex", "-1")
				.text("Tag all terminal branches as Foreground")
				.on("click", () => {
					menu_object.style("display", "none");
					tagDescendants(node, true, false, 'foreground');
				});
				
			menu_object
				.append("a")
				.attr("class", "dropdown-item")
				.attr("tabindex", "-1")
				.text("Tag all terminal branches as Background")
				.on("click", () => {
					menu_object.style("display", "none");
					tagDescendants(node, true, false, 'background');
				});
				
			menu_object
				.append("a")
				.attr("class", "dropdown-item")
				.attr("tabindex", "-1")
				.text("Clear all descendant tags")
				.on("click", () => {
					menu_object.style("display", "none");
					clearDescendantTags(node);
				});
		}

		// Position the menu
		let rect = treeContainer.getBoundingClientRect();
		
		menu_object
			.style("position", "absolute")
			.style("left", "" + (event.clientX - rect.x + 12) + "px")
			.style("top", "" + (event.clientY - rect.y) + "px")
			.style("display", "block");
			
		// Close menu on document click
		const closeMenu = () => {
			menu_object.style("display", "none");
			document.removeEventListener('click', closeMenu);
		};
		
		// Use setTimeout to avoid closing immediately
		setTimeout(() => {
			document.addEventListener('click', closeMenu);
		}, 100);
	}
	
	function isLeafNode(node) {
		return !node.children || node.children.length === 0;
	}
	
	function tagBranch(node, tagType) {
		// Find the SVG element corresponding to this node
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
	
	function tagDescendants(node, includeTerminals, includeInternals, tagType) {
		// Get all descendants
		const descendants = selectAllDescendants(node, includeTerminals, includeInternals);
		
		// Tag each descendant
		descendants.forEach(desc => {
			tagBranch(desc, tagType);
		});
	}
	
	function clearDescendantTags(node) {
		// Get all descendants
		const descendants = selectAllDescendants(node, true, true);
		
		// Remove tag from each descendant
		descendants.forEach(desc => {
			removeTag(desc);
		});
	}
	
	function selectAllDescendants(node, includeTerminals, includeInternals) {
		let selection = [];

		function sel(d) {
			if (isLeafNode(d)) {
				if (includeTerminals) {
					if (d !== node) selection.push(d);
				}
			} else {
				if (includeInternals) {
					if (d !== node) selection.push(d);
				}
				if (d.children) {
					d.children.forEach(sel);
				}
			}
		}

		sel(node);
		return selection;
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
	
	:global(.dropdown-menu) {
		min-width: 10rem;
		padding: 0.5rem 0;
		margin: 0.125rem 0 0;
		font-size: 1rem;
		color: #212529;
		text-align: left;
		list-style: none;
		background-color: #fff;
		background-clip: padding-box;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 0.25rem;
		z-index: 1000;
	}
	
	:global(.dropdown-item) {
		display: block;
		width: 100%;
		padding: 0.25rem 1.5rem;
		clear: both;
		font-weight: 400;
		color: #212529;
		text-align: inherit;
		white-space: nowrap;
		background-color: transparent;
		border: 0;
		cursor: pointer;
	}
	
	:global(.dropdown-item:hover), :global(.dropdown-item:focus) {
		color: #16181b;
		text-decoration: none;
		background-color: #f8f9fa;
	}
	
	:global(.dropdown-header) {
		display: block;
		padding: 0.5rem 1.5rem;
		margin-bottom: 0;
		font-size: 0.875rem;
		color: #6c757d;
		white-space: nowrap;
	}
	
	:global(.dropdown-divider) {
		height: 0;
		margin: 0.5rem 0;
		overflow: hidden;
		border-top: 1px solid #e9ecef;
	}
</style>