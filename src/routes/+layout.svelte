<script lang="ts">
	import '../app.css';
	import AnalysisStatusIndicator from '../lib/AnalysisStatusIndicator.svelte';
	import BackendConnectivityIndicator from '../lib/BackendConnectivityIndicator.svelte';

	// Get version from Vite define
	const version = __APP_VERSION__;

	let { children } = $props();

	// Mobile menu state
	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
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
		<div class="container mx-auto flex items-center justify-between px-4 py-3 sm:px-premium-xl sm:py-premium-md">
			<a class="flex items-center" href="/" onclick={closeMobileMenu}>
				<span class="text-lg font-bold tracking-premium-tight text-text-rich sm:text-premium-header">
					<span class="text-brand-royal">Datamonkey</span> <span class="text-accent-copper">3</span>
				</span>
			</a>

			<!-- Mobile menu button -->
			<button
				type="button"
				class="inline-flex h-11 w-11 items-center justify-center rounded-premium-sm text-text-slate hover:bg-brand-whisper hover:text-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal sm:hidden"
				aria-controls="mobile-menu"
				aria-expanded={mobileMenuOpen}
				onclick={toggleMobileMenu}
			>
				<span class="sr-only">Open main menu</span>
				{#if mobileMenuOpen}
					<!-- Close icon -->
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<!-- Hamburger icon -->
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
					</svg>
				{/if}
			</button>

			<!-- Desktop navigation -->
			<div class="hidden items-center space-x-premium-lg sm:flex">
				<ul class="flex items-center space-x-premium-lg">
					<li>
						<a
							class="rounded-premium-sm px-3 py-2 text-premium-brand font-medium text-text-rich transition-colors duration-premium hover:bg-brand-whisper hover:text-brand-royal"
							href="/"
						>
							Home
						</a>
					</li>
					<li>
						<a
							class="rounded-premium-sm px-3 py-2 text-premium-brand font-medium text-text-rich transition-colors duration-premium hover:bg-brand-whisper hover:text-brand-royal"
							href="http://help.datamonkey.org"
							target="_blank"
							rel="noopener noreferrer"
						>
							Help
						</a>
					</li>
				</ul>

				<!-- Analysis Status Indicator -->
				<AnalysisStatusIndicator />

				<!-- Backend Connectivity Indicator -->
				<BackendConnectivityIndicator />
			</div>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="border-t border-border-platinum sm:hidden" id="mobile-menu">
				<div class="space-y-1 px-4 pb-4 pt-2">
					<a
						class="block rounded-premium-sm px-3 py-3 text-base font-medium text-text-rich transition-colors duration-premium hover:bg-brand-whisper hover:text-brand-royal"
						href="/"
						onclick={closeMobileMenu}
					>
						Home
					</a>
					<a
						class="block rounded-premium-sm px-3 py-3 text-base font-medium text-text-rich transition-colors duration-premium hover:bg-brand-whisper hover:text-brand-royal"
						href="http://help.datamonkey.org"
						target="_blank"
						rel="noopener noreferrer"
					>
						Help
					</a>
				</div>
				<div class="border-t border-border-platinum px-4 py-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-text-slate">Status</span>
						<div class="flex items-center space-x-3">
							<AnalysisStatusIndicator />
							<BackendConnectivityIndicator />
						</div>
					</div>
				</div>
			</div>
		{/if}
	</nav>

	<main class="container mx-auto flex-grow px-4 py-6 sm:p-premium-xl">
		{@render children()}
	</main>

	<footer class="border-t border-border-platinum bg-white py-6 sm:py-premium-xl">
		<div class="container mx-auto px-4 sm:px-premium-xl">
			<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
				<div>
					<p class="text-sm text-text-silver sm:text-premium-meta">
						Version {version}
					</p>
				</div>
				<div class="flex items-center gap-6">
					<a
						class="min-h-[44px] flex items-center rounded-premium-sm px-2 py-2 text-base text-text-slate transition-colors duration-premium hover:bg-brand-whisper hover:text-brand-royal sm:text-premium-body"
						href="https://github.com/stevenweaver/datamonkey3"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
					<a
						class="min-h-[44px] flex items-center rounded-premium-sm px-2 py-2 text-base text-text-slate transition-colors duration-premium hover:bg-brand-whisper hover:text-brand-royal sm:text-premium-body"
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
