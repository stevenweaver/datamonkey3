<script>
	import { writable } from 'svelte/store';

	// Accept mocked stores as props for Storybook
	export let mockCurrentFile = null;
	export let mockFileMetricsStore = null;

	// Use mocked stores if provided, otherwise create defaults
	const defaultCurrentFile = writable(null);
	const defaultFileMetricsStore = writable(null);

	const currentFile = mockCurrentFile || defaultCurrentFile;
	const fileMetricsStore = mockFileMetricsStore || defaultFileMetricsStore;

	// Format file size in a human-readable way
	function formatFileSize(bytes) {
		if (!bytes) return '0B';
		const units = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)}${units[i]}`;
	}

	// Determine which property to use for the filename
	$: filename = $currentFile?.filename || $currentFile?.name || 'CD2-slim.fna';

	// For debugging
	$: console.log('Current File:', $currentFile);
	$: console.log('File Metrics:', $fileMetricsStore);
</script>

{#if $currentFile}
	<div
		class="file-indicator mb-premium-lg rounded-premium border border-accent-copper bg-accent-pearl p-premium-md"
	>
		<div class="flex flex-wrap items-center justify-between">
			<div class="flex items-center">
				<div
					class="mr-premium-md flex h-10 w-10 items-center justify-center rounded-premium bg-accent-copper text-white"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"
						/>
					</svg>
				</div>
				<div>
					<div class="mb-premium-xs flex items-baseline">
						<span class="font-medium text-text-rich">Currently Analyzing:</span>
						<span class="ml-premium-xs font-semibold text-brand-royal">{filename}</span>
					</div>

					<div class="flex items-center space-x-6">
						{#if $fileMetricsStore?.FILE_INFO}
							<span class="flex items-center" title="Sequences">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-1 h-4 w-4 text-text-slate"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
									/>
								</svg>
								<span class="text-text-rich">{$fileMetricsStore.FILE_INFO.sequences || 10}</span
								>&nbsp;sequences
							</span>
							<span class="flex items-center" title="Sites">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-1 h-4 w-4 text-text-slate"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
									/>
								</svg>
								<span class="text-text-rich">{$fileMetricsStore.FILE_INFO.sites || 17}</span
								>&nbsp;sites
							</span>
						{/if}
						<span class="flex items-center" title="File Size">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-4 w-4 text-text-slate"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
									clip-rule="evenodd"
								/>
							</svg>
							<span class="text-text-rich">{formatFileSize($currentFile.size || 800)}</span>
						</span>
					</div>
				</div>
			</div>
			<div>
				<div
					class="flex items-center rounded-premium-sm bg-white px-premium-sm py-premium-xs text-premium-caption font-medium text-accent-copper"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
					Valid for analysis
				</div>
			</div>
		</div>
	</div>
{/if}