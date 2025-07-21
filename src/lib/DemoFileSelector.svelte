<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { wrapForAutomation, delay } from './utils/browserAutomationHelpers.js';

	const dispatch = createEventDispatcher();

	// Sample files available for demo
	const demoFiles = [
		{
			name: 'CD2-slim.fna',
			description: 'CD2 gene alignment (10 sequences)',
			path: '/test-data/CD2-slim.fna'
		},
		{ name: 'small.nex', description: 'Small NEXUS alignment', path: '/test-data/small.nex' },
		{ name: 'medium.nex', description: 'Medium NEXUS alignment', path: '/test-data/medium.nex' },
		{ name: 'large.nex', description: 'Large NEXUS alignment', path: '/test-data/large.nex' }
	];

	// Handle loading a demo file using the File System API
	async function loadDemoFile(filePath, fileName) {
		console.log(`[DemoFileSelector] Starting to load: ${fileName}`);
		
		try {
			// Read file from test-data directory using fetch
			const demoFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;

			console.log(`[DemoFileSelector] Fetching from: ${demoFilePath}`);
			const response = await fetch(demoFilePath);

			if (!response.ok) {
				throw new Error(`Failed to fetch demo file: ${response.status} ${response.statusText}`);
			}

			// Get the file content
			const content = await response.text();
			console.log(`[DemoFileSelector] File content loaded, size: ${content.length} chars`);

			// Create a File object from the content
			const file = new File([content], fileName, { type: 'application/octet-stream' });

			// Add metadata to indicate this is a demo file
			const metadata = { isDemo: true, source: 'demoSelector' };

			// Add a small delay for browser automation
			await delay(50);

			// Dispatch the file to the parent component
			console.log(`[DemoFileSelector] Dispatching selectFile event for: ${fileName}`);
			dispatch('selectFile', { file, metadata });
			
		} catch (error) {
			console.error('[DemoFileSelector] Error loading demo file:', error);
			dispatch('error', { message: `Failed to load demo file: ${error.message}` });
		}
	}
</script>

<div class="demo-selector mb-4 mt-2">
	<div class="mb-2 flex items-center">
		<div class="mr-2 text-blue-500">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
		<span class="text-sm font-medium text-gray-700">Try a sample file:</span>
	</div>

	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
		{#each demoFiles as demoFile}
			<button
				class="flex items-center rounded-md border border-gray-200 p-2 transition-colors hover:border-blue-300 hover:bg-blue-50"
				on:click={wrapForAutomation((event) => loadDemoFile(demoFile.path, demoFile.name), 100)}
				data-testid="demo-file-{demoFile.name}"
				data-automation-ready="true"
			>
				<div class="mr-2 text-blue-500">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="text-left">
					<div class="text-sm font-medium">{demoFile.name}</div>
					<div class="text-xs text-gray-500">{demoFile.description}</div>
				</div>
			</button>
		{/each}
	</div>
</div>
