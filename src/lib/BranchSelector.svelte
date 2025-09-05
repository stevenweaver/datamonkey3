<!--
	BranchSelector Component - Minimal Version for Testing
-->

<script>
	import { onMount } from 'svelte';
	import * as phylotree from 'phylotree';
	import * as d3 from 'd3';

	// Props
	export let treeData = '';
	export let height = 400;
	export let width = 800;

	// Component state
	let treeContainer;
	let tree;

	onMount(() => {
		if (treeData) {
			renderTree();
		}
	});

	// Watch for tree data changes
	$: if (treeData && treeContainer) {
		renderTree();
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
				container: "#tree-container-id",
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
			}

			// Check what's in the container after insertion
			setTimeout(() => {
				const container = document.querySelector('#tree-container-id');
				console.log('9. Container after insertion:', container);
				console.log('10. Container children:', container?.children.length);
				
				const svg = container?.querySelector('svg');
				console.log('11. SVG found:', svg);
				console.log('12. SVG dimensions:', svg ? `${svg.getAttribute('width')} x ${svg.getAttribute('height')}` : 'no svg');
				
				const nodes = document.querySelectorAll('#tree-container-id .node');
				console.log('13. Found nodes:', nodes.length);
			}, 500);
		} catch (e) {
			console.error('Error in renderTree:', e);
			console.error('Stack:', e.stack);
		}
	}
</script>

<!-- Include phylotree CSS -->
<svelte:head>
	<!-- jQuery - required by phylotree for menu functionality -->
	<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
	<!-- D3.js - required by phylotree -->
	<script src="https://d3js.org/d3.v6.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"></script>
	<!-- Bootstrap CSS for dropdown menu functionality -->
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
	/>
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js"
	></script>
	<!-- phylotree CSS -->
	<link
		rel="stylesheet"
		href="https://unpkg.com/phylotree@1.0.0-alpha.24/dist/phylotree.css"
	/>
</svelte:head>

<div class="minimal-branch-selector">
	<h3>Minimal BranchSelector Test</h3>
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
