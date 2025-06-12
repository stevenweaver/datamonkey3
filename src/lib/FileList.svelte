<script>
	import { persistentFileStore, currentFile } from '../stores/fileInfo';
	import { analysisStore } from '../stores/analyses';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let onSelectFile = () => {};

	// Format date
	function formatDate(timestamp) {
		return new Date(timestamp).toLocaleString();
	}

	// Format file size
	function formatFileSize(bytes) {
		if (bytes < 1024) return bytes + ' B';
		else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
		else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
	}

	// Select a file
	async function selectFile(fileId) {
		try {
			persistentFileStore.setCurrentFile(fileId);
			
			// Download the file content from IndexedDB
			const file = await persistentFileStore.getFile(fileId);
			
			// Load analyses for this file
			await analysisStore.loadAnalysesForFile(fileId);
			
			// Call the parent component's handler
			onSelectFile(file);
		} catch (error) {
			console.error('Error selecting file:', error);
		}
	}

	// Delete a file
	async function deleteFile(fileId, event) {
		event.stopPropagation(); // Prevent triggering selectFile
		
		if (confirm('Are you sure you want to delete this file?')) {
			try {
				// Delete any analyses for this file first
				const fileAnalyses = $analysisStore.analyses.filter(a => a.fileId === fileId);
				for (const analysis of fileAnalyses) {
					await analysisStore.deleteAnalysis(analysis.id);
				}
				
				// Delete the file
				await persistentFileStore.deleteFile(fileId);
			} catch (error) {
				console.error('Error deleting file:', error);
			}
		}
	}

	onMount(async () => {
		if (browser) {
			await persistentFileStore.loadFiles();
		}
	});
</script>

<div class="my-4">
	<h2 class="mb-2 text-xl font-bold">Saved Files</h2>
	{#if $persistentFileStore.isLoading}
		<p>Loading files...</p>
	{:else if $persistentFileStore.error}
		<p class="text-red-500">Error: {$persistentFileStore.error}</p>
	{:else if $persistentFileStore.files.length === 0}
		<p class="text-gray-500">No files saved yet. Upload a file to get started.</p>
	{:else}
		<div class="max-h-48 overflow-y-auto rounded border border-gray-300">
			<table class="w-full table-auto">
				<thead class="bg-gray-100">
					<tr>
						<th class="p-2 text-left">Filename</th>
						<th class="p-2 text-left">Size</th>
						<th class="p-2 text-left">Uploaded</th>
						<th class="p-2 text-left">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each $persistentFileStore.files as file}
						<tr 
							class="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
							class:bg-blue-50={file.id === $persistentFileStore.currentFileId}
							on:click={() => selectFile(file.id)}
						>
							<td class="p-2">{file.filename}</td>
							<td class="p-2">{formatFileSize(file.size)}</td>
							<td class="p-2">{formatDate(file.createdAt)}</td>
							<td class="p-2">
								<button 
									class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
									on:click={(e) => deleteFile(file.id, e)}
								>
									Delete
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>