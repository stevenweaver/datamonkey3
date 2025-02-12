<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="stylesheet" href="https://observablehq.com/_next/static/css/92c0a8010b575b66.css" />
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css"
		integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X"
		crossorigin="anonymous"
	/>
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Major+Mono+Display" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fontdiner+Swanky" />
</svelte:head>

<nav class="flex items-center justify-between rounded-md bg-yellow-200 p-4">
	<a class="flex items-center border-none text-black" href="/">
		<span class="header-logo ml-2">DATAMONKEY 3 🐒</span>
	</a>
	<ul class="flex space-x-4">
		<li><a class="text-black hover:text-orange-500" href="/">Home</a></li>
	</ul>
</nav>

{@render children()}
