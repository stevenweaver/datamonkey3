<script lang="ts">
	import '../app.css';
	import AnalysisStatusIndicator from '../lib/AnalysisStatusIndicator.svelte';
	import BackendConnectivityIndicator from '../lib/BackendConnectivityIndicator.svelte';

	// Get version from Vite define
	const version = __APP_VERSION__;

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
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
	/>
	<title>Datamonkey 3 - Sequence Analysis Platform</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-brand-ghost">
	<nav class="border-b border-border-platinum bg-white shadow-sm">
		<div class="container mx-auto flex items-center justify-between px-premium-xl py-premium-md">
			<a class="flex items-center" href="/">
				<span class="text-premium-header font-bold tracking-premium-tight text-text-rich">
					<span class="text-brand-royal">Datamonkey</span> <span class="text-accent-copper">3</span>
				</span>
			</a>

			<div class="flex items-center space-x-premium-lg">
				<ul class="flex items-center space-x-premium-lg">
					<li>
						<a
							class="text-premium-brand font-medium text-text-rich transition-colors duration-premium hover:text-brand-royal"
							href="/"
						>
							Home
						</a>
					</li>
				</ul>

				<!-- Analysis Status Indicator -->
				<AnalysisStatusIndicator />

				<!-- Backend Connectivity Indicator -->
				<BackendConnectivityIndicator />
			</div>
		</div>
	</nav>

	<main class="container mx-auto flex-grow p-premium-xl">
		{@render children()}
	</main>

	<footer class="border-t border-border-platinum bg-white py-premium-xl">
		<div class="container mx-auto px-premium-xl">
			<div class="flex flex-col items-center justify-between md:flex-row">
				<div class="mb-premium-lg md:mb-0">
					<p class="text-text-muted text-premium-meta">
						Version {version}
					</p>
				</div>
				<div class="flex items-center space-x-premium-lg">
					<a
						class="text-premium-body text-text-slate transition-colors duration-premium hover:text-brand-royal"
						href="https://github.com/stevenweaver/datamonkey3"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
					<a
						class="text-premium-body text-text-slate transition-colors duration-premium hover:text-brand-royal"
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
