<!--
	BranchSelector Component - Interactive phylogenetic tree branch selection
-->

<script>
	import { onMount, createEventDispatcher, tick } from 'svelte';
	import * as phylotree from 'phylotree';
	import * as d3 from 'd3';

	const dispatch = createEventDispatcher();

	// Props - Core
	export let treeData = '';
	export let height = 400;
	export let width = 800;

	// Props - Selection mode
	export let mode = 'single-set'; // 'single-set' for FG/BG, 'multi-set' for contrast-fel
	export let selectionMode = 'foreground'; // 'foreground' or 'background' - maps to mode for Storybook compatibility
	export let initialSetNames = null; // Optional: custom names for sets (e.g., ['TEST', 'REFERENCE'] for RELAX)

	// Props - Storybook compatibility
	export let selectedBranches = []; // Initial selection (array of branch names or objects with .name/.id)
	export let allowMultiSelect = true; // Allow multiple branch selection
	export let disabled = false; // Disable all interactions

	// Component state
	let treeContainer;
	let tree;
	let internalSelectedBranches = []; // Internal tracking of selection

	// Unique container ID to avoid conflicts
	let containerId = `tree-container-${Math.random().toString(36).substring(2, 9)}`;

	// Multi-set selection state (for contrast-fel) - Initialize based on mode
	let currentSetIndex = 0;
	let setColors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']; // d3 category colors

	// Map selectionMode prop to internal mode (for Storybook compatibility)
	$: effectiveMode =
		mode !== 'single-set'
			? mode
			: selectionMode === 'multi-set'
				? 'multi-set'
				: 'single-set';

	// Reactive: Update selection sets when mode changes
	$: selectionSets =
		effectiveMode === 'multi-set'
			? initialSetNames && initialSetNames.length > 0
				? initialSetNames
				: ['Set_1', 'Set_2']
			: ['Foreground'];

	// Reset current index when mode changes
	$: if (effectiveMode) {
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

	// Apply preselection when selectedBranches prop changes
	$: if (tree && selectedBranches && selectedBranches.length > 0) {
		applyPreselection(selectedBranches);
	}

	// Extract branch names from selection prop (handles both string[] and {name/id}[])
	function getBranchName(branch) {
		if (typeof branch === 'string') return branch;
		return branch.name || branch.id || null;
	}

	// Apply initial selection to tree
	function applyPreselection(branches) {
		if (!tree || !tree.json) return;

		const branchNames = branches.map(getBranchName).filter(Boolean);
		if (branchNames.length === 0) return;

		function traverse(node) {
			if (branchNames.includes(node.name)) {
				node.selected = true;
			}
			node.children?.forEach(traverse);
		}

		traverse(tree.json);
		updateAllNodeStyles();
		updateSelectedBranches();
	}

	// Update styles for all nodes (used after preselection)
	function updateAllNodeStyles() {
		const container = document.getElementById(containerId);
		if (!container || !tree) return;

		d3.select(container)
			.selectAll('.branch path, .node circle')
			.each(function (d) {
				if (!d) return;
				const node = d.target || d.source || d;
				if (node.selected) {
					d3.select(this).style('fill', 'red').style('stroke', 'red');
				}
			});
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
			// Make sure we have a valid Newick string
			if (!treeData || treeData.trim() === '') {
				console.log('BranchSelector: No tree data provided');
				return;
			}

			// Initialize tree from Newick string
			tree = new phylotree.phylotree(treeData);

			// Render the tree
			tree.render({
				container: `#${containerId}`,
				height: height,
				width: width,
				'show-menu': false, // Disable built-in menu (requires jQuery/Bootstrap)
				selectable: true
			});

			// Insert the SVG into the container
			const container = document.getElementById(containerId);
			if (container && tree.display) {
				container.innerHTML = '';
				const svgElement = tree.display.show();
				container.appendChild(svgElement);

				// Fix SVG sizing with viewBox for proper scaling
				const svg = container.querySelector('svg');
				if (svg) {
					// Wait for SVG to fully render before calculating bounds
					requestAnimationFrame(() => {
						try {
							const bbox = svg.getBBox();
							const padding = 20;
							svg.setAttribute(
								'viewBox',
								`${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`
							);
							svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
							// Make SVG fill container
							svg.style.width = '100%';
							svg.style.height = '100%';
						} catch (e) {
							// getBBox can fail if SVG not visible, ignore
						}
					});
				}

				// Set up click handlers if not disabled
				if (!disabled) {
					setupClickHandlers(container);
				}
			}
		} catch (e) {
			console.error('BranchSelector: Error rendering tree:', e);
			dispatch('error', { message: e.message, error: e });
		}
	}

	// Set up click handlers for branch selection
	function setupClickHandlers(container) {
		// Target specific elements: branch paths and node circles
		// This is more reliable than selecting all '*' elements
		d3.select(container)
			.selectAll('.branch path, .node circle, .node text')
			.style('cursor', 'pointer')
			.on('click', handleBranchClick);

		// Also handle clicks on the branch lines themselves
		d3.select(container)
			.selectAll('path.branch')
			.style('cursor', 'pointer')
			.on('click', handleBranchClick);
	}

	// Handle branch/node click
	function handleBranchClick(event, d) {
		if (disabled) return;
		if (!d) return;

		event.preventDefault();
		event.stopPropagation();

		// Find the node object
		let nodeToSelect = d.target || d.source || d;

		// Handle single vs multi-select
		if (!allowMultiSelect && effectiveMode === 'single-set') {
			// Clear all other selections first
			clearAllSelections();
		}

		// Toggle selection based on mode
		if (effectiveMode === 'multi-set') {
			const currentSet = selectionSets[currentSetIndex];
			if (nodeToSelect[currentSet]) {
				delete nodeToSelect[currentSet];
			} else {
				nodeToSelect[currentSet] = true;
			}
			updateNodeStyling(nodeToSelect, event.target);
		} else {
			// Single-set mode
			if (nodeToSelect.selected) {
				delete nodeToSelect.selected;
			} else {
				nodeToSelect.selected = true;
			}

			const targetElement = d3.select(event.target);
			if (nodeToSelect.selected) {
				targetElement.style('fill', 'red').style('stroke', 'red');
			} else {
				targetElement.style('fill', '').style('stroke', '');
			}
		}

		updateSelectedBranches();
	}

	// Clear all selections (for single-select mode)
	function clearAllSelections() {
		if (!tree || !tree.json) return;

		function traverse(node) {
			delete node.selected;
			selectionSets.forEach((setName) => delete node[setName]);
			node.children?.forEach(traverse);
		}
		traverse(tree.json);

		// Reset all visual styles
		const container = document.getElementById(containerId);
		if (container) {
			d3.select(container)
				.selectAll('.branch path, .node circle')
				.style('fill', '')
				.style('stroke', '');
		}
	}

	// Update selected branches and dispatch events
	function updateSelectedBranches() {
		if (!tree) return;

		// Get all selected nodes manually by traversing tree
		const current_selection = [];

		function findSelectedNodes(node) {
			if (node.selected) {
				current_selection.push(node);
			}
			// Also check for multi-set selections
			if (effectiveMode === 'multi-set') {
				selectionSets.forEach((setName) => {
					if (node[setName] && !current_selection.includes(node)) {
						current_selection.push(node);
					}
				});
			}
			node.children?.forEach(findSelectedNodes);
		}

		if (tree.json) {
			findSelectedNodes(tree.json);
		}

		internalSelectedBranches = current_selection.map((node) => {
			return node.name || `node_${node.id || Math.random()}`;
		});

		// Generate tagged Newick string
		const taggedNewick = generateTaggedNewick();

		const eventData = {
			selectedBranches: internalSelectedBranches,
			taggedNewick,
			count: current_selection.length,
			...(effectiveMode === 'multi-set' && {
				selectionSets: selectionSets,
				mode: 'multi-set'
			})
		};

		dispatch('selectionChange', eventData);
	}

	// Validation method similar to React version
	function validateAndSubmit(callback) {
		if (!tree) return;

		const taggedNewick = generateTaggedNewick();
		const selectedCount = internalSelectedBranches.length;

		if (selectedCount > 0) {
			callback(taggedNewick);
		} else {
			alert(
				'No branch selections were made. Please select at least one branch.'
			);
		}
	}

	// Expose method for external access (matching React submit pattern)
	export function submit(callback) {
		validateAndSubmit(callback);
	}

	// Generate Newick string with FG tags for selected branches
	function generateTaggedNewick() {
		if (!tree || !tree.getNewick) {
			return treeData;
		}

		try {
			const taggedNewick = tree.getNewick((node) => {
				const tags = [];

				if (effectiveMode === 'multi-set') {
					selectionSets.forEach((setName) => {
						if (node[setName]) {
							tags.push(setName);
						}
					});
				} else {
					if (node.selected) {
						tags.push('FG');
					}
					if (node.test) {
						tags.push('TEST');
					}
					if (node.reference) {
						tags.push('REFERENCE');
					}
				}

				return tags.length > 0 ? '{' + tags.join(',') + '}' : '';
			});

			return taggedNewick;
		} catch (e) {
			console.error('BranchSelector: Error generating tagged Newick:', e);
			return treeData;
		}
	}
</script>

<!-- Phylotree CSS - using version matching our npm package -->
<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/phylotree@2.1.7/dist/phylotree.css" />
</svelte:head>

<div class="branch-selector" class:disabled>
	<h3>Branch Selection</h3>

	{#if effectiveMode === 'multi-set'}
		<div class="set-management-controls">
			<div class="set-selector-group">
				<label for="{containerId}-set-selector">Current Set:</label>
				<select
					id="{containerId}-set-selector"
					bind:value={currentSetIndex}
					on:change={() => switchToSet(currentSetIndex)}
					style="color: {setColors[currentSetIndex]}; font-weight: bold;"
					{disabled}
				>
					{#each selectionSets as setName, index}
						<option value={index} style="color: {setColors[index]}">
							{setName}
						</option>
					{/each}
				</select>
			</div>

			<div class="set-name-input">
				<label for="{containerId}-set-name">Rename:</label>
				<input
					id="{containerId}-set-name"
					type="text"
					value={selectionSets[currentSetIndex]}
					on:input={(e) => renameCurrentSet(e.target.value)}
					style="border-color: {setColors[currentSetIndex]}; color: {setColors[currentSetIndex]};"
					{disabled}
				/>
			</div>

			<div class="set-actions">
				<button on:click={addNewSet} class="btn-add-set" {disabled}>+ New Set</button>
				<button
					on:click={deleteCurrentSet}
					class="btn-delete-set"
					disabled={disabled || selectionSets.length <= 1}
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
		id={containerId}
		bind:this={treeContainer}
		class="tree-container"
		class:tree-disabled={disabled}
		style="height: {height}px; width: {width}px;"
	></div>

	{#if !treeData}
		<p class="no-data-message">No tree data provided</p>
	{/if}

	{#if internalSelectedBranches.length > 0}
		<p class="selection-count">{internalSelectedBranches.length} branch{internalSelectedBranches.length !== 1 ? 'es' : ''} selected</p>
	{/if}
</div>

<style>
	.branch-selector {
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: white;
	}

	.branch-selector.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	.tree-container {
		background: #f9fafb;
		overflow: auto;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.tree-container.tree-disabled {
		pointer-events: none;
		opacity: 0.7;
	}

	.no-data-message {
		color: #6b7280;
		font-style: italic;
		margin-top: 0.5rem;
	}

	.selection-count {
		color: #059669;
		font-weight: 500;
		margin-top: 0.5rem;
		font-size: 0.875rem;
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
