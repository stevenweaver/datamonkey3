<script>
	import { onMount } from 'svelte';
	import { phylotree } from 'phylotree'; // Import phylotree library

	export let newickString;
	export let height = 600; // Default height
	export let width = 800; // Default width

	let treeContainer;
	let tree;
	let renderedTree;

	onMount(() => {
		tree = new phylotree(newickString);
		renderedTree = tree.render({
			container: 'tree-container',
			height: height,
			width: width,
			'left-right-spacing': 'fit-to-size',
			'top-bottom-spacing': 'fit-to-size'
		});

		// Clear the container and append the SVG element
		treeContainer.innerHTML = ''; // Clear previous content if any
		treeContainer.appendChild(renderedTree.show()); // Append the SVG to the container
	});
</script>

<link rel="stylesheet" href="https://unpkg.com/phylotree@1.0.0-alpha.24/dist/phylotree.css" />

<div bind:this={treeContainer} class="phylo-tree"></div>
<!-- Container for the tree -->
