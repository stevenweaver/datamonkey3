<script>
	import { onMount, afterUpdate } from 'svelte';
	import { phylotree } from 'phylotree';
	import * as d3 from 'd3';

	export let newickString;
	export let height = 600;
	export let width = 800;

	let treeContainer;
	let tree;
	let renderedTree;

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
		renderedTree = tree.render({
			container: '.tree-container',
			height: height,
			width: width,
			'left-right-spacing': 'fit-to-size',
			'top-bottom-spacing': 'fit-to-size',
			'show-menu': true, // Enable menu functionality
			selectable: true, // Enable node selection
			collapsible: true, // Enable collapse/expand
			reroot: true, // Enable rerooting
			hide: true // Enable hiding nodes
		});

		// Clear the container and append the SVG element
		treeContainer.innerHTML = '';
		treeContainer.appendChild(renderedTree.show());

		// Add click handlers for the nodes
		d3.select(treeContainer)
			.selectAll('.node')
			.on('click', (event, d) => {
				event.preventDefault();
				renderedTree.handle_node_click(d, event);
			});
	}
</script>

<link
	rel="stylesheet"
	href="https://unpkg.com/phylotree@1.0.0-alpha.24/dist/phylotree.css"
/>

<div bind:this={treeContainer} class="tree-container"></div>

<style>
	:global(.dropdown-menu) {
		position: absolute;
		background: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 5px 0;
		min-width: 160px;
		z-index: 1000;
	}

	:global(.dropdown-item) {
		display: block;
		padding: 3px 20px;
		clear: both;
		font-weight: normal;
		line-height: 1.42857143;
		color: #333;
		white-space: nowrap;
		cursor: pointer;
	}

	:global(.dropdown-item:hover) {
		background-color: #f5f5f5;
	}

	:global(.dropdown-divider) {
		height: 1px;
		margin: 5px 0;
		background-color: #e5e5e5;
	}

	:global(.dropdown-header) {
		display: block;
		padding: 3px 20px;
		font-size: 12px;
		line-height: 1.42857143;
		color: #777;
	}
</style>
