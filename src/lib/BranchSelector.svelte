<!--
	BranchSelector Component - Minimal Version for Testing
-->

<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import * as phylotree from 'phylotree';
	import * as d3 from 'd3';

	const dispatch = createEventDispatcher();

	// Props
	export let treeData = '';
	export let height = 400;
	export let width = 800;
	export let mode = 'single-set'; // 'single-set' for FG/BG, 'multi-set' for contrast-fel
	export let initialSetNames = null; // Optional: custom names for sets (e.g., ['TEST', 'REFERENCE'] for RELAX)

	// Component state
	let treeContainer;
	let tree;
	let selectedBranches = [];

	// Multi-set selection state (for contrast-fel) - Initialize based on mode
	let currentSetIndex = 0;
	let setColors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']; // d3 category colors

	// Reactive: Update selection sets when mode changes
	$: selectionSets =
		mode === 'multi-set'
			? initialSetNames && initialSetNames.length > 0
				? initialSetNames
				: ['Set_1', 'Set_2']
			: ['Foreground'];

	// Reset current index when mode changes
	$: if (mode) {
		currentSetIndex = 0;
	}

	onMount(() => {
		if (treeData) {
			renderTree();
		}
	});

	// Watch for tree data changes
	$: if (treeData && treeContainer) {
		renderTree();
	}

	// Multi-set management functions
	function addNewSet() {
		const newSetName = `Set_${selectionSets.length + 1}`;
		selectionSets = [...selectionSets, newSetName];
		currentSetIndex = selectionSets.length - 1;
	}

	function deleteCurrentSet() {
		if (selectionSets.length <= 1) {
			alert('Cannot delete the only remaining set');
			return;
		}
		// Remove branches tagged with this set
		const setToDelete = selectionSets[currentSetIndex];
		if (tree && tree.json) {
			traverseAndRemoveSet(tree.json, setToDelete);
		}
		selectionSets = selectionSets.filter((_, i) => i !== currentSetIndex);
		currentSetIndex = Math.max(0, currentSetIndex - 1);
		updateSelectedBranches();
	}

	function renameCurrentSet(newName) {
		const oldName = selectionSets[currentSetIndex];
		selectionSets[currentSetIndex] = newName;
		selectionSets = [...selectionSets];

		// Update all nodes with old set name to new name
		if (tree && tree.json) {
			traverseAndRenameSet(tree.json, oldName, newName);
			updateSelectedBranches();
		}
	}

	function switchToSet(index) {
		currentSetIndex = index;
	}

	function traverseAndRemoveSet(node, setName) {
		if (node[setName]) {
			delete node[setName];
		}
		if (node.children) {
			node.children.forEach((child) => traverseAndRemoveSet(child, setName));
		}
	}

	function traverseAndRenameSet(node, oldName, newName) {
		if (node[oldName]) {
			node[newName] = true;
			delete node[oldName];
		}
		if (node.children) {
			node.children.forEach((child) => traverseAndRenameSet(child, oldName, newName));
		}
	}

	// Update node styling based on set memberships
	function updateNodeStyling(node, targetElement) {
		const element = d3.select(targetElement);

		// Find which sets this node belongs to
		const nodeSets = [];
		selectionSets.forEach((setName, index) => {
			if (node[setName]) {
				nodeSets.push(index);
			}
		});

		if (nodeSets.length === 0) {
			// No sets: reset to default
			element.style('fill', '').style('stroke', '');
		} else if (nodeSets.length === 1) {
			// One set: use that set's color
			const color = setColors[nodeSets[0]];
			element.style('fill', color).style('stroke', color);
		} else {
			// Multiple sets: use special styling (e.g., striped or mixed)
			const color = setColors[nodeSets[0]];
			element.style('fill', color).style('stroke', color).classed('branch-multiple', true);
		}
	}

	function renderTree() {
		try {
			console.log('=== BranchSelector Debug ===');
			console.log('1. Tree data:', treeData);
			console.log('2. Tree container element:', treeContainer);
			console.log('3. Container exists in DOM:', document.querySelector('#tree-container-id'));

			// Make sure we have a valid Newick string
			if (!treeData || treeData.trim() === '') {
				console.log('No tree data provided');
				return;
			}

			// Initialize tree from Newick string
			tree = new phylotree.phylotree(treeData);
			console.log('4. Tree initialized:', tree);
			console.log('5. Tree JSON:', tree.json);

			// Render the tree with minimal options
			// NOTE: phylotree expects a CSS selector string, not a DOM element
			tree.render({
				container: '#tree-container-id',
				height: height,
				width: width,
				'show-menu': true,
				selectable: true
			});

			console.log('6. Tree rendered, display object:', tree.display);

			// IMPORTANT: After render, we need to manually insert the SVG!
			const container = document.querySelector('#tree-container-id');
			if (container && tree.display) {
				container.innerHTML = ''; // Clear any existing content
				const svgElement = tree.display.show();
				console.log('7. SVG element:', svgElement);
				container.appendChild(svgElement);
				console.log('8. SVG appended to container');

				// Add click handlers for branch selection
				setTimeout(() => {
					console.log('🖱️ Setting up click handlers...');

					// Handle ALL clicks on the tree (nodes, branches, etc.)
					d3.select(container)
						.selectAll('*')
						.on('click', (event, d) => {
							console.log('🖱️🔥 Element clicked:', event.target.tagName, event.target.className);
							console.log('🖱️🔥 Data object:', d);

							// Skip if no data object
							if (!d) {
								console.log('🖱️🔥 No data object, skipping');
								return;
							}

							event.preventDefault();
							event.stopPropagation();

							// Try to find the actual node object to mark as selected
							let nodeToSelect = d;

							// If this is a branch, try to get the target node
							if (d.target) {
								nodeToSelect = d.target;
								console.log('🖱️🔥 This is a branch, using target node:', nodeToSelect);
							}

							// If this is a source node from a branch
							if (d.source && !d.target) {
								nodeToSelect = d.source;
								console.log('🖱️🔥 This is a source node, using source:', nodeToSelect);
							}

							// Toggle selection based on mode
							if (mode === 'multi-set') {
								// Multi-set mode: toggle current set on the node
								const currentSet = selectionSets[currentSetIndex];
								if (nodeToSelect[currentSet]) {
									delete nodeToSelect[currentSet];
									console.log(
										'🖱️🔥 Removed node from set:',
										currentSet,
										nodeToSelect.name || 'unnamed'
									);
								} else {
									nodeToSelect[currentSet] = true;
									console.log(
										'🖱️🔥 Added node to set:',
										currentSet,
										nodeToSelect.name || 'unnamed'
									);
								}

								// Update visual styling with set color
								updateNodeStyling(nodeToSelect, event.target);
							} else {
								// Single-set mode: toggle foreground selection
								if (nodeToSelect.selected) {
									nodeToSelect.selected = false;
									delete nodeToSelect.selected;
									console.log('🖱️🔥 Deselected node:', nodeToSelect.name || 'unnamed');
								} else {
									nodeToSelect.selected = true;
									console.log('🖱️🔥 Selected node:', nodeToSelect.name || 'unnamed');
								}

								// Update visual styling
								const targetElement = d3.select(event.target);
								if (nodeToSelect.selected) {
									targetElement.style('fill', 'red').style('stroke', 'red');
								} else {
									targetElement.style('fill', '').style('stroke', '');
								}
							}

							// Trigger update
							console.log('🖱️🔥 Calling updateSelectedBranches...');
							updateSelectedBranches();
						});
				}, 500);
			}

			// Check what's in the container after insertion
			setTimeout(() => {
				const container = document.querySelector('#tree-container-id');
				console.log('9. Container after insertion:', container);
				console.log('10. Container children:', container?.children.length);

				const svg = container?.querySelector('svg');
				console.log('11. SVG found:', svg);
				console.log(
					'12. SVG dimensions:',
					svg ? `${svg.getAttribute('width')} x ${svg.getAttribute('height')}` : 'no svg'
				);

				const nodes = document.querySelectorAll('#tree-container-id .node');
				console.log('13. Found nodes:', nodes.length);
			}, 500);
		} catch (e) {
			console.error('Error in renderTree:', e);
			console.error('Stack:', e.stack);
		}
	}

	// Update selected branches and dispatch events
	function updateSelectedBranches() {
		if (!tree) return;

		// Get all selected nodes manually by traversing tree
		const current_selection = [];

		// Function to traverse tree and find selected nodes
		function findSelectedNodes(node) {
			if (node.selected) {
				current_selection.push(node);
			}
			if (node.children) {
				node.children.forEach(findSelectedNodes);
			}
		}

		// Start traversal from tree root
		if (tree.json && tree.json.children) {
			tree.json.children.forEach(findSelectedNodes);
		} else if (tree.json) {
			findSelectedNodes(tree.json);
		}

		console.log('🔄 Updating selected branches, current selection:', current_selection);

		selectedBranches = current_selection.map((node) => {
			return node.name || `node_${node.id || Math.random()}`;
		});
		console.log('🔄 Selected branches:', selectedBranches);

		// Generate tagged Newick string
		const taggedNewick = generateTaggedNewick();
		console.log('🔄 Generated tagged Newick length:', taggedNewick?.length || 0);

		// Dispatch selection change event for FEL integration
		console.log('🔄🔥 BRANCHSELECTOR - About to dispatch selectionChange event:', {
			selectedBranches,
			taggedNewick: taggedNewick?.substring(0, 100) + '...',
			count: current_selection.length,
			fullTaggedNewickLength: taggedNewick?.length,
			hasFullTaggedNewick: !!taggedNewick,
			hasFGTags: (taggedNewick || '').includes('{FG}')
		});

		const eventData = {
			selectedBranches,
			taggedNewick,
			count: current_selection.length,
			...(mode === 'multi-set' && {
				selectionSets: selectionSets,
				mode: 'multi-set'
			})
		};

		console.log('🔄🔥 BRANCHSELECTOR - Full event data being dispatched:', eventData);
		dispatch('selectionChange', eventData);
		console.log('🔄🔥 BRANCHSELECTOR - Event dispatched successfully');
	}

	// Validation method similar to React version
	function validateAndSubmit(callback) {
		if (!tree) return;

		const taggedNewick = generateTaggedNewick();

		// Get selected nodes count manually
		const selectedCount = selectedBranches.length;

		if (selectedCount > 0) {
			console.log('✅ Valid selection, calling callback with tagged tree');
			callback(taggedNewick);
		} else {
			console.warn('⚠️ No branch selections were made');
			alert(
				'No branch selections were made, please select one. Alternatively, you can choose to select all via the menu.'
			);
		}
	}

	// Expose method for external access (matching React submit pattern)
	export function submit(callback) {
		validateAndSubmit(callback);
	}

	// Generate Newick string with FG tags for selected branches (matching React logic)
	function generateTaggedNewick() {
		console.log('🏷️🔥 generateTaggedNewick called');
		console.log('🏷️🔥 tree exists:', !!tree);
		console.log('🏷️🔥 tree.getNewick exists:', !!(tree && tree.getNewick));
		console.log('🏷️🔥 selectedBranches count:', selectedBranches.length);

		if (!tree || !tree.getNewick) {
			console.log('🏷️🔥 Falling back to original treeData:', treeData.substring(0, 100));
			return treeData;
		}

		try {
			console.log('🏷️🔥 About to call tree.getNewick with callback...');

			// Use the same logic as the React version
			const taggedNewick = tree.getNewick((node) => {
				const tags = [];

				if (mode === 'multi-set') {
					// Multi-set mode: check all sets
					console.log('🏷️🔥 Processing node (multi-set):', node.name || 'unnamed');
					selectionSets.forEach((setName) => {
						if (node[setName]) {
							tags.push(setName);
							console.log('🏷️🔥 Node belongs to set:', setName);
						}
					});
				} else {
					// Single-set mode: check for foreground selection
					console.log(
						'🏷️🔥 Processing node (single-set):',
						node.name || 'unnamed',
						'selected:',
						!!node.selected
					);
					if (node.selected) {
						tags.push('FG'); // Use uppercase FG tags
						console.log('🏷️🔥 Node is selected, adding FG tag');
					}

					// Future support for test/reference branches
					if (node.test) {
						tags.push('TEST');
					}
					if (node.reference) {
						tags.push('REFERENCE');
					}
				}

				// Return tags in curly braces if any exist
				if (tags.length > 0) {
					const tagResult = '{' + tags.join(',') + '}';
					console.log('🏷️🔥 Returning tags for node:', tagResult);
					return tagResult;
				}
				return '';
			});

			console.log('🏷️🔥 Tagged Newick generated length:', taggedNewick?.length || 0);
			console.log('🏷️🔥 Tagged Newick preview:', taggedNewick?.substring(0, 200));
			console.log('🏷️🔥 Contains {FG} tags:', (taggedNewick || '').includes('{FG}'));

			return taggedNewick;
		} catch (e) {
			console.error('🏷️🔥 Error generating tagged newick:', e);
			console.error('🏷️🔥 Error stack:', e.stack);
			return treeData;
		}
	}
</script>

<!-- Include phylotree CSS -->
<svelte:head>
	<!-- jQuery - required by phylotree for menu functionality -->
	<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
	<!-- D3.js - required by phylotree -->
	<script src="https://d3js.org/d3.v6.js"></script>
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"
	></script>
	<!-- Bootstrap CSS for dropdown menu functionality -->
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
	/>
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js"
	></script>
	<!-- phylotree CSS -->
	<link rel="stylesheet" href="https://unpkg.com/phylotree@1.0.0-alpha.24/dist/phylotree.css" />
</svelte:head>

<div class="minimal-branch-selector">
	<h3>Branch Selection</h3>

	{#if mode === 'multi-set'}
		<div class="set-management-controls">
			<div class="set-selector-group">
				<label for="set-selector">Current Set:</label>
				<select
					id="set-selector"
					bind:value={currentSetIndex}
					on:change={() => switchToSet(currentSetIndex)}
					style="color: {setColors[currentSetIndex]}; font-weight: bold;"
				>
					{#each selectionSets as setName, index}
						<option value={index} style="color: {setColors[index]}">
							{setName}
						</option>
					{/each}
				</select>
			</div>

			<div class="set-name-input">
				<label for="set-name">Rename:</label>
				<input
					id="set-name"
					type="text"
					value={selectionSets[currentSetIndex]}
					on:input={(e) => renameCurrentSet(e.target.value)}
					style="border-color: {setColors[currentSetIndex]}; color: {setColors[currentSetIndex]};"
				/>
			</div>

			<div class="set-actions">
				<button on:click={addNewSet} class="btn-add-set">+ New Set</button>
				<button
					on:click={deleteCurrentSet}
					class="btn-delete-set"
					disabled={selectionSets.length <= 1}
				>
					Delete Set
				</button>
			</div>

			<div class="set-legend">
				<strong>Sets:</strong>
				{#each selectionSets as setName, index}
					<span
						class="set-tag"
						style="background-color: {setColors[index]}; opacity: {index === currentSetIndex
							? 1
							: 0.5};"
					>
						{setName}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<div
		id="tree-container-id"
		bind:this={treeContainer}
		class="tree-container"
		style="height: {height}px; width: {width}px; border: 1px solid #ccc;"
	></div>
	{#if !treeData}
		<p>No tree data provided</p>
	{/if}
</div>

<style>
	.minimal-branch-selector {
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: white;
	}

	.tree-container {
		background: #f9fafb;
		overflow: auto;
	}

	/* Multi-set management controls */
	.set-management-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
		padding: 1rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		margin-bottom: 1rem;
	}

	.set-selector-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.set-selector-group select {
		padding: 0.5rem;
		border: 2px solid #e5e7eb;
		border-radius: 4px;
		font-size: 14px;
	}

	.set-name-input {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.set-name-input input {
		padding: 0.5rem;
		border: 2px solid #e5e7eb;
		border-radius: 4px;
		font-size: 14px;
		font-weight: bold;
	}

	.set-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-add-set,
	.btn-delete-set {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-add-set {
		background: #10b981;
		color: white;
	}

	.btn-add-set:hover {
		background: #059669;
	}

	.btn-delete-set {
		background: #ef4444;
		color: white;
	}

	.btn-delete-set:hover:not(:disabled) {
		background: #dc2626;
	}

	.btn-delete-set:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.set-legend {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.set-tag {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		color: white;
		font-size: 12px;
		font-weight: 600;
	}

	/* Styling for branches in multiple sets */
	:global(.branch-multiple) {
		stroke-width: 3px !important;
		stroke-dasharray: 5, 5 !important;
	}

	/* Support for phylotree dropdown menus */
	:global(.dropdown-menu) {
		position: absolute;
		z-index: 1000;
		display: none;
		min-width: 10rem;
		padding: 0.5rem 0;
		margin: 0.125rem 0 0;
		background-color: #fff;
		background-clip: padding-box;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 0.25rem;
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
	}

	:global(.dropdown-menu.show) {
		display: block;
	}

	:global(.dropdown-item) {
		display: block;
		width: 100%;
		padding: 0.25rem 1.5rem;
		clear: both;
		font-weight: 400;
		color: #212529;
		text-align: inherit;
		text-decoration: none;
		white-space: nowrap;
		background-color: transparent;
		border: 0;
		cursor: pointer;
	}

	:global(.dropdown-item:hover) {
		background-color: #f8f9fa;
	}

	:global(.dropdown-divider) {
		height: 0;
		margin: 0.5rem 0;
		overflow: hidden;
		border-top: 1px solid rgba(0, 0, 0, 0.15);
	}
</style>
