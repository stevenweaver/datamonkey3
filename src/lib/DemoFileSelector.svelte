<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Sample files available for demo with enhanced metadata
	const demoFiles = [
		{
			name: 'CD2-slim.fna',
			description: 'CD2 gene alignment',
			detail: '10 sequences • FASTA format',
			path: '/test-data/CD2-slim.fna',
			icon: 'dna',
			size: 'small'
		},
		{
			name: 'small.nex',
			description: 'Small alignment',
			detail: 'NEXUS format • Quick test',
			path: '/test-data/small.nex',
			icon: 'file',
			size: 'small'
		},
		{
			name: 'medium.nex',
			description: 'Medium alignment',
			detail: 'NEXUS format • Standard',
			path: '/test-data/medium.nex',
			icon: 'file',
			size: 'medium'
		},
		{
			name: 'large.nex',
			description: 'Large alignment',
			detail: 'NEXUS format • Extended',
			path: '/test-data/large.nex',
			icon: 'file',
			size: 'large'
		}
	];

	let hoveredFile = null;

	// Handle loading a demo file using the File System API
	async function loadDemoFile(filePath, fileName) {
		try {
			// Read file from test-data directory using fetch
			const demoFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
			const response = await fetch(demoFilePath);

			if (!response.ok) {
				throw new Error(`Failed to fetch demo file: ${response.status} ${response.statusText}`);
			}

			// Get the file content
			const content = await response.text();

			// Create a File object from the content
			const file = new File([content], fileName, { type: 'application/octet-stream' });

			// Add metadata to indicate this is a demo file
			const metadata = { isDemo: true, source: 'demoSelector' };

			// Dispatch the file to the parent component
			dispatch('selectFile', { file, metadata });
		} catch (error) {
			console.error('Error loading demo file:', error);
			dispatch('error', { message: `Failed to load demo file: ${error.message}` });
		}
	}
</script>

<div class="demo-selector">
	<!-- Section header with subtle styling -->
	<div class="mb-3 flex items-center gap-2 sm:mb-premium-md sm:gap-premium-sm">
		<div
			class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-whisper text-brand-royal sm:h-8 sm:w-8"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
		<div class="min-w-0">
			<span class="text-sm font-semibold text-text-rich sm:text-premium-body">Try a sample file</span>
			<span class="hidden text-premium-meta text-text-silver sm:inline sm:ml-premium-sm"
				>— quick start with example data</span
			>
		</div>
	</div>

	<!-- Sample file cards with enhanced design -->
	<div class="grid grid-cols-2 gap-2 sm:gap-premium-md lg:grid-cols-4">
		{#each demoFiles as demoFile, index}
			<button
				class="sample-card group relative flex min-h-[120px] flex-col rounded-lg border-2 p-3 text-left transition-all duration-premium active:scale-[0.98] sm:min-h-0 sm:rounded-premium sm:p-premium-md
               {hoveredFile === demoFile.name
					? 'scale-[1.02] border-brand-royal bg-white shadow-premium-hover'
					: 'border-border-platinum bg-white hover:border-brand-muted hover:shadow-premium'}"
				style="animation-delay: {index * 50}ms"
				on:click={() => loadDemoFile(demoFile.path, demoFile.name)}
				on:mouseenter={() => (hoveredFile = demoFile.name)}
				on:mouseleave={() => (hoveredFile = null)}
			>
				<!-- File type indicator -->
				<div class="mb-2 flex items-start justify-between sm:mb-premium-sm">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-premium sm:h-10 sm:w-10 sm:rounded-premium-sm
                      {hoveredFile === demoFile.name
							? 'bg-brand-royal text-white'
							: 'bg-brand-ghost text-brand-royal group-hover:bg-brand-whisper'}"
					>
						{#if demoFile.icon === 'dna'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 sm:h-5 sm:w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M2 15c6.667-6 13.333 0 20-6" />
								<path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
								<path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
								<path d="M17 6l-2.5-2.5" />
								<path d="M14 8l-3-3" />
								<path d="M7 18l2.5 2.5" />
								<path d="M10 16l3 3" />
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 sm:h-5 sm:w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
									clip-rule="evenodd"
								/>
							</svg>
						{/if}
					</div>

					<!-- Size indicator badge -->
					<span
						class="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide sm:px-premium-sm sm:text-premium-caption
                       {demoFile.size === 'small'
							? 'bg-green-100 text-green-700'
							: demoFile.size === 'medium'
								? 'bg-brand-whisper text-brand-royal'
								: 'bg-accent-cream text-accent-copper'}"
					>
						{demoFile.size}
					</span>
				</div>

				<!-- File info -->
				<div class="flex-1">
					<h4 class="mb-0.5 truncate font-mono text-xs font-semibold text-text-rich sm:mb-premium-xs sm:text-premium-body">
						{demoFile.name}
					</h4>
					<p class="text-[10px] text-text-slate sm:mb-premium-xs sm:text-premium-meta">
						{demoFile.description}
					</p>
					<p class="hidden text-premium-caption text-text-silver sm:block">
						{demoFile.detail}
					</p>
				</div>

				<!-- Action indicator - always visible on mobile -->
				<div
					class="mt-2 flex items-center justify-between border-t border-border-platinum pt-2 opacity-100 transition-opacity duration-premium sm:mt-premium-sm sm:pt-premium-sm sm:opacity-0 sm:group-hover:opacity-100"
				>
					<span class="text-[10px] font-medium text-brand-royal sm:text-premium-caption">Load file</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-3 w-3 transform text-brand-royal transition-transform duration-premium group-hover:translate-x-1 sm:h-4 sm:w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M14 5l7 7m0 0l-7 7m7-7H3"
						/>
					</svg>
				</div>
			</button>
		{/each}
	</div>
</div>

<style>
	.sample-card {
		animation: fade-in-up 0.4s ease-out backwards;
	}

	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
