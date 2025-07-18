<script>
	import { onMount } from 'svelte';
	import { persistentFileStore, currentFile } from '../stores/fileInfo';
	import { analysisStore } from '../stores/analyses';
	import FileCard from './FileCard.svelte';

	// Props
	export let onSelectFile = () => {};

	// Local state
	let filePreviews = new Map();
	let expandedFiles = new Set();
	let sortBy = 'date';
	let sortDirection = 'desc';
	let filterText = '';
	let isLoading = true;
	let isClearingFiles = false;

	// Computed properties
	$: sortedFiles = sortFiles($persistentFileStore.files, sortBy, sortDirection);
	$: filteredFiles = filterFiles(sortedFiles, filterText);

	// Load files on mount
	onMount(async () => {
		isLoading = true;
		try {
			await persistentFileStore.loadFiles();
			await loadFilePreviews();
		} catch (error) {
			console.error('Error loading files:', error);
		} finally {
			isLoading = false;
		}
	});

	// Load previews for all files
	async function loadFilePreviews() {
		for (const file of $persistentFileStore.files) {
			if (!filePreviews.has(file.id)) {
				try {
					const fileObj = await persistentFileStore.getFile(file.id);
					const preview = await generatePreview(fileObj);
					filePreviews.set(file.id, preview);
				} catch (error) {
					console.error(`Error loading preview for ${file.filename}:`, error);
					filePreviews.set(file.id, 'Preview unavailable');
				}
			}
		}
	}

	// Generate a preview of the file contents
	async function generatePreview(fileObj) {
		try {
			const text = await fileObj.text();
			// Show first few lines
			const lines = text.split('\n').slice(0, 5);
			return lines.join('\n');
		} catch (error) {
			console.error('Error generating preview:', error);
			return 'Preview unavailable';
		}
	}

	// Sort files based on selected criteria
	function sortFiles(files, sortBy, direction) {
		if (!files || !files.length) return [];

		return [...files].sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'name':
					comparison = (a.filename || '').localeCompare(b.filename || '');
					break;
				case 'size':
					comparison = (a.size || 0) - (b.size || 0);
					break;
				case 'date':
				default:
					comparison = (a.createdAt || 0) - (b.createdAt || 0);
					break;
			}

			return direction === 'desc' ? -comparison : comparison;
		});
	}

	// Filter files by name
	function filterFiles(files, filterText) {
		if (!filterText) return files;

		const search = filterText.toLowerCase();
		return files.filter((file) => (file.filename || '').toLowerCase().includes(search));
	}

	// Change sort criteria
	function changeSorting(criteria) {
		if (sortBy === criteria) {
			// Toggle direction if clicking the same criteria
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Default to descending for new criteria
			sortBy = criteria;
			sortDirection = 'desc';
		}
	}

	// Toggle file details visibility
	function toggleFileDetails(fileId) {
		if (expandedFiles.has(fileId)) {
			expandedFiles.delete(fileId);
		} else {
			expandedFiles.add(fileId);
		}
		expandedFiles = expandedFiles; // Trigger reactivity
	}

	// Handle file selection
	async function selectFile(fileId) {
		try {
			// Set the current file in the store
			persistentFileStore.setCurrentFile(fileId);

			// Notify that file was selected, but don't trigger a re-analysis
			// by passing an event with a special flag
			const file = await persistentFileStore.getFile(fileId);

			// Create a custom event object that indicates this is a selection, not an upload
			onSelectFile({
				isSelection: true,
				fileId: fileId,
				file: file
			});
		} catch (error) {
			console.error('Error selecting file:', error);
		}
	}

	// Handle file deletion
	async function deleteFile(fileId) {
		try {
			// First delete any analyses associated with this file
			const fileAnalyses = $analysisStore.analyses.filter((a) => a.fileId === fileId);
			for (const analysis of fileAnalyses) {
				await analysisStore.deleteAnalysis(analysis.id);
			}

			// Then delete the file
			await persistentFileStore.deleteFile(fileId);

			// Remove from previews map
			filePreviews.delete(fileId);
			filePreviews = filePreviews; // Trigger reactivity
		} catch (error) {
			console.error('Error deleting file:', error);
		}
	}

	// Handle clearing all files
	async function clearAllFiles() {
		try {
			if (
				confirm(
					'Are you sure you want to delete ALL files and their analyses? This cannot be undone.'
				)
			) {
				// Get all file IDs
				const fileIds = $persistentFileStore.files.map((file) => file.id);

				// Show a loading state specifically for clearing
				isClearingFiles = true;

				// Process deletions in smaller batches to avoid timeouts
				const batchSize = 5;
				for (let i = 0; i < fileIds.length; i += batchSize) {
					const batch = fileIds.slice(i, i + batchSize);

					// Process each batch in parallel
					await Promise.all(
						batch.map(async (fileId) => {
							try {
								// Delete analyses for this file
								const fileAnalyses = $analysisStore.analyses.filter((a) => a.fileId === fileId);
								await Promise.all(
									fileAnalyses.map((analysis) =>
										analysisStore
											.deleteAnalysis(analysis.id)
											.catch((err) => console.error(`Error deleting analysis ${analysis.id}:`, err))
									)
								);

								// Delete the file
								await persistentFileStore.deleteFile(fileId);
							} catch (error) {
								console.error(`Error deleting file ${fileId}:`, error);
								// Continue with other files even if one fails
							}
						})
					);

					// Small delay between batches to prevent overwhelming the system
					if (i + batchSize < fileIds.length) {
						await new Promise((resolve) => setTimeout(resolve, 100));
					}
				}

				// Clear the previews map
				filePreviews = new Map();

				// Force a reload of files
				await persistentFileStore.loadFiles();

				// Clear the current file
				persistentFileStore.setCurrentFile(null);

				isClearingFiles = false;
			}
		} catch (error) {
			console.error('Error clearing all files:', error);
			isClearingFiles = false;
			alert('An error occurred while clearing files. Some files may not have been deleted.');
		}
	}
</script>

<div class="file-manager">
	<div class="mb-premium-md">
		<div class="mb-premium-sm flex items-center justify-between">
			<h2 class="text-premium-header font-semibold text-text-rich">Saved Files</h2>

			<!-- Clear All Files button -->
			{#if $persistentFileStore.files.length > 0}
				<button
					on:click={clearAllFiles}
					disabled={isClearingFiles}
					class="flex items-center rounded-premium-sm bg-accent-warm px-premium-sm py-premium-xs text-premium-meta font-medium text-white transition-all duration-premium hover:bg-accent-copper disabled:cursor-not-allowed disabled:opacity-50"
					title={isClearingFiles ? 'Clearing files...' : 'Delete all files and their analyses'}
				>
					{#if isClearingFiles}
						<svg
							class="mr-1 h-4 w-4 animate-spin"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
					{isClearingFiles ? 'Clearing...' : 'Clear All Files'}
				</button>
			{/if}
		</div>

		<div class="mb-premium-sm flex flex-wrap items-center gap-premium-sm">
			<!-- Search input -->
			<div class="relative flex-grow">
				<input
					type="text"
					placeholder="Search files..."
					bind:value={filterText}
					class="w-full rounded-premium-sm border border-border-platinum py-premium-xs pl-8 pr-2 text-premium-meta"
				/>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-silver"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>

			<!-- Sort options -->
			<div
				class="flex overflow-hidden rounded-premium-sm border border-border-platinum text-premium-meta"
			>
				<button
					class="px-premium-sm py-premium-xs transition-all duration-premium"
					class:bg-brand-royal={sortBy === 'name'}
					class:text-white={sortBy === 'name'}
					class:text-text-slate={sortBy !== 'name'}
					class:hover:bg-brand-whisper={sortBy !== 'name'}
					class:hover:text-brand-royal={sortBy !== 'name'}
					on:click={() => changeSorting('name')}
				>
					Name {sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
				</button>
				<button
					class="border-l border-border-platinum px-premium-sm py-premium-xs transition-all duration-premium"
					class:bg-brand-royal={sortBy === 'size'}
					class:text-white={sortBy === 'size'}
					class:text-text-slate={sortBy !== 'size'}
					class:hover:bg-brand-whisper={sortBy !== 'size'}
					class:hover:text-brand-royal={sortBy !== 'size'}
					on:click={() => changeSorting('size')}
				>
					Size {sortBy === 'size' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
				</button>
				<button
					class="border-l border-border-platinum px-premium-sm py-premium-xs transition-all duration-premium"
					class:bg-brand-royal={sortBy === 'date'}
					class:text-white={sortBy === 'date'}
					class:text-text-slate={sortBy !== 'date'}
					class:hover:bg-brand-whisper={sortBy !== 'date'}
					class:hover:text-brand-royal={sortBy !== 'date'}
					on:click={() => changeSorting('date')}
				>
					Date {sortBy === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
				</button>
			</div>
		</div>
	</div>

	<!-- File list -->
	<div
		class="files-container relative max-h-96 overflow-y-auto rounded-premium border border-border-platinum"
	>
		{#if isClearingFiles}
			<!-- Loading overlay while clearing files -->
			<div class="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-90">
				<div class="text-center">
					<svg
						class="mx-auto mb-2 h-8 w-8 animate-spin text-accent-warm"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<p class="text-premium-body text-text-slate">Clearing all files...</p>
					<p class="mt-1 text-premium-meta text-text-silver">This may take a moment</p>
				</div>
			</div>
		{/if}

		{#if isLoading}
			<div class="flex items-center justify-center p-premium-md text-text-slate">
				<svg
					class="mr-premium-sm h-5 w-5 animate-pulse-premium text-brand-royal"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<span class="text-premium-body">Loading files...</span>
			</div>
		{:else if filteredFiles.length === 0}
			<p class="p-premium-md text-center text-premium-body text-text-slate">
				{filterText
					? 'No matching files found.'
					: 'No files saved yet. Upload a file to get started.'}
			</p>
		{:else}
			{#each filteredFiles as file (file.id)}
				<FileCard
					{file}
					isActive={file.id === $currentFile?.id}
					showDetails={expandedFiles.has(file.id)}
					preview={filePreviews.get(file.id)}
					on:select={({ detail }) => selectFile(detail.id)}
					on:delete={({ detail }) => deleteFile(detail.id)}
				/>
			{/each}
		{/if}
	</div>
</div>
