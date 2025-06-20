<script lang="ts">
	import '../app.css';
	import MultiAnalysisMonitor from '../lib/MultiAnalysisMonitor.svelte';
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
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
	<title>Datamonkey 3 - Sequence Analysis Platform</title>
</svelte:head>

<div class="flex flex-col min-h-screen bg-brand-ghost">
	<nav class="bg-white border-b border-border-platinum shadow-sm">
		<div class="container mx-auto px-premium-xl py-premium-md flex items-center justify-between">
			<a class="flex items-center" href="/">
				<span class="text-premium-header font-bold tracking-premium-tight text-text-rich">
					<span class="text-brand-royal">Datamonkey</span> <span class="text-accent-copper">3</span>
				</span>
			</a>
			
			<ul class="flex items-center space-x-premium-lg">
				<li>
					<a 
						class="text-premium-brand font-medium text-text-rich hover:text-brand-royal transition-colors duration-premium"
						href="/"
					>
						Home
					</a>
				</li>
				<li>
					<a 
						class="text-premium-brand font-medium text-text-rich hover:text-brand-royal transition-colors duration-premium"
						href="/design"
					>
						Design System
					</a>
				</li>
				<li>
					<a 
						class="bg-brand-gradient text-white text-premium-body font-semibold py-[8px] px-[16px] rounded-premium-sm tracking-premium-wide shadow-sm hover:bg-brand-deep transition-all duration-premium"
						href="https://github.com/stevenweaver/datamonkey3"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
				</li>
			</ul>
		</div>
	</nav>

	<!-- Global Analysis Monitor -->
	<MultiAnalysisMonitor />

	<main class="flex-grow container mx-auto p-premium-xl">
		{@render children()}
	</main>
	
	<footer class="bg-white border-t border-border-platinum py-premium-xl">
		<div class="container mx-auto px-premium-xl">
			<div class="flex flex-col md:flex-row justify-between items-center">
				<div class="mb-premium-lg md:mb-0">
					<p class="text-premium-body text-text-slate">
						© {new Date().getFullYear()} Datamonkey 3. All rights reserved.
					</p>
				</div>
				<div class="flex items-center space-x-premium-lg">
					<a 
						class="text-premium-body text-text-slate hover:text-brand-royal transition-colors duration-premium"
						href="https://github.com/stevenweaver/datamonkey3"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
					<a 
						class="text-premium-body text-text-slate hover:text-brand-royal transition-colors duration-premium"
						href="https://hyphy.org"
						target="_blank"
						rel="noopener noreferrer"
					>
						HyPhy
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>
