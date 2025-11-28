<script>
	import { createEventDispatcher } from 'svelte';

	// Props
	export let file = {};
	export let isActive = false;
	export let showDetails = false;
	export let preview = null;

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Format date for display
	function formatDate(timestamp) {
		if (!timestamp) return 'Unknown';

		const date = new Date(timestamp);
		const now = new Date();

		// Same day
		if (date.toDateString() === now.toDateString()) {
			return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
		}

		// Yesterday
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
		if (date.toDateString() === yesterday.toDateString()) {
			return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
		}

		// Within the last week
		const oneWeekAgo = new Date(now);
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		if (date > oneWeekAgo) {
			const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
			return date.toLocaleString([], options);
		}

		// Default date format
		return date.toLocaleString([], {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Format file size
	function formatFileSize(bytes) {
		if (!bytes) return 'Unknown';

		if (bytes < 1024) return bytes + ' B';
		else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
		else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
	}

	// Get file type icon and color based on file type
	function getFileTypeInfo(filename, contentType) {
		const fileExtension = filename ? filename.split('.').pop().toLowerCase() : '';

		// Define file type categories
		const fileTypes = {
			fasta: {
				icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z',
				color: 'bg-accent-cream text-accent-copper'
			},
			fastq: {
				icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z',
				color: 'bg-accent-cream text-accent-copper'
			},
			nex: {
				icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z',
				color: 'bg-accent-cream text-accent-copper'
			},
			nexus: {
				icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z',
				color: 'bg-accent-cream text-accent-copper'
			},
			phy: {
				icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z',
				color: 'bg-accent-cream text-accent-copper'
			},
			phylip: {
				icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z',
				color: 'bg-accent-cream text-accent-copper'
			},
			txt: {
				icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
				color: 'bg-brand-whisper text-text-slate'
			},
			csv: {
				icon: 'M4 4v16l6-4.5V16l6 4.5V4a1 1 0 00-1-1H5a1 1 0 00-1 1z',
				color: 'bg-accent-cream text-accent-warm'
			},
			tsv: {
				icon: 'M4 4v16l6-4.5V16l6 4.5V4a1 1 0 00-1-1H5a1 1 0 00-1 1z',
				color: 'bg-accent-cream text-accent-warm'
			},
			json: {
				icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
				color: 'bg-brand-whisper text-brand-deep'
			},
			xml: {
				icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
				color: 'bg-brand-whisper text-brand-deep'
			}
		};

		// Check if the file extension is in our defined types
		if (fileExtension && fileTypes[fileExtension]) {
			return fileTypes[fileExtension];
		}

		// Default file icon
		return {
			icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
			color: 'bg-brand-whisper text-brand-royal'
		};
	}

	// Get time ago string
	function getTimeAgo(timestamp) {
		if (!timestamp) return '';

		const now = new Date();
		const date = new Date(timestamp);
		const seconds = Math.floor((now - date) / 1000);

		let interval = Math.floor(seconds / 31536000);
		if (interval >= 1) {
			return interval === 1 ? '1 year ago' : `${interval} years ago`;
		}

		interval = Math.floor(seconds / 2592000);
		if (interval >= 1) {
			return interval === 1 ? '1 month ago' : `${interval} months ago`;
		}

		interval = Math.floor(seconds / 86400);
		if (interval >= 1) {
			return interval === 1 ? '1 day ago' : `${interval} days ago`;
		}

		interval = Math.floor(seconds / 3600);
		if (interval >= 1) {
			return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
		}

		interval = Math.floor(seconds / 60);
		if (interval >= 1) {
			return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
		}

		return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
	}

	// Get file type label
	function getFileTypeLabel(filename, contentType) {
		if (!filename) return 'Unknown';

		const fileExtension = filename.split('.').pop().toLowerCase();

		const typeMap = {
			fasta: 'FASTA Sequence',
			fa: 'FASTA Sequence',
			fastq: 'FASTQ Sequence',
			fq: 'FASTQ Sequence',
			nex: 'NEXUS Format',
			nexus: 'NEXUS Format',
			phy: 'PHYLIP Format',
			phylip: 'PHYLIP Format',
			txt: 'Text File',
			csv: 'CSV Data',
			tsv: 'TSV Data',
			json: 'JSON Data',
			xml: 'XML Data'
		};

		return typeMap[fileExtension] || contentType || 'File';
	}

	// Get file type info based on the file
	$: fileTypeInfo = getFileTypeInfo(file.filename, file.contentType);
	$: fileTypeLabel = getFileTypeLabel(file.filename, file.contentType);
	$: timeAgo = getTimeAgo(file.createdAt);

	// Toggle details visibility
	function toggleDetails(event) {
		event.stopPropagation();
		showDetails = !showDetails;
	}

	// Select the file
	function selectFile() {
		dispatch('select', { id: file.id });
	}

	// Delete the file
	function deleteFile(event) {
		event.stopPropagation();
		if (confirm(`Are you sure you want to delete "${file.filename}"?`)) {
			dispatch('delete', { id: file.id });
		}
	}
</script>

<div
	class="file-card mb-2 overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-premium hover:shadow-premium active:scale-[0.99] sm:mb-premium-sm sm:rounded-premium sm:shadow-premium"
	class:border-brand-royal={isActive}
	class:ring-1={isActive}
	class:ring-brand-muted={isActive}
>
	<div class="cursor-pointer p-3 sm:p-premium-md" on:click={selectFile}>
		<div class="flex items-center justify-between gap-2">
			<div class="flex min-w-0 flex-1 items-center">
				<!-- File icon based on type -->
				<div
					class="mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg sm:mr-premium-md sm:h-10 sm:w-10 sm:rounded-premium-sm {fileTypeInfo.color}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 sm:h-6 sm:w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d={fileTypeInfo.icon}
						/>
					</svg>
				</div>

				<!-- File info -->
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-1.5 sm:gap-premium-sm">
						<h3 class="truncate text-sm font-medium text-text-rich sm:text-premium-body">
							{file.filename || 'Unnamed File'}
						</h3>
						<span
							class="hidden flex-shrink-0 rounded-full bg-brand-whisper px-1.5 py-0.5 text-[10px] text-text-slate xs:inline sm:rounded-premium-xl sm:px-premium-sm sm:text-premium-caption"
							>{fileTypeLabel}</span
						>
					</div>
					<div class="flex items-center text-[11px] text-text-silver sm:text-premium-caption">
						<span>{formatFileSize(file.size)}</span>
						<span class="mx-1">•</span>
						<span title={formatDate(file.createdAt)}>{timeAgo}</span>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
				<button
					on:click={toggleDetails}
					class="flex h-9 w-9 items-center justify-center rounded-lg text-text-slate transition-all duration-premium hover:bg-brand-whisper hover:text-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal focus:ring-offset-1 sm:h-11 sm:w-11 sm:rounded-premium-sm"
					title={showDetails ? 'Hide details' : 'Show details'}
					aria-label={showDetails ? 'Hide details' : 'Show details'}
				>
					{#if showDetails}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4 sm:h-5 sm:w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
								clip-rule="evenodd"
							/>
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
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</button>

				<button
					on:click={deleteFile}
					class="flex h-9 w-9 items-center justify-center rounded-lg text-text-slate transition-all duration-premium hover:bg-status-error-bg hover:text-status-error focus:outline-none focus:ring-2 focus:ring-status-error focus:ring-offset-1 sm:h-11 sm:w-11 sm:rounded-premium-sm"
					title="Delete file"
					aria-label="Delete file"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 sm:h-5 sm:w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Details panel (conditional) -->
		{#if showDetails}
			<div class="details-panel mt-premium-md rounded-premium bg-brand-whisper p-premium-md">
				<!-- File preview, if available -->
				{#if preview}
					<div class="mb-premium-md">
						<h4 class="mb-premium-xs text-premium-meta font-medium text-text-rich">Preview</h4>
						<div
							class="preview-content max-h-28 overflow-y-auto rounded-premium border border-border-platinum bg-white p-premium-sm text-premium-caption"
						>
							<pre class="whitespace-pre-wrap">{preview}</pre>
						</div>
					</div>
				{/if}

				<!-- File metadata -->
				<div class="metadata">
					<h4 class="mb-premium-xs text-premium-meta font-medium text-text-rich">File Details</h4>
					<div class="grid grid-cols-2 gap-premium-sm text-premium-caption">
						<div class="text-text-slate">File Name:</div>
						<div class="truncate font-medium text-text-rich">{file.filename}</div>

						<div class="text-text-slate">File Type:</div>
						<div class="font-medium text-text-rich">{fileTypeLabel}</div>

						<div class="text-text-slate">Size:</div>
						<div class="font-medium text-text-rich">{formatFileSize(file.size)}</div>

						<div class="text-text-slate">MIME Type:</div>
						<div class="font-medium text-text-rich">{file.contentType || 'Unknown'}</div>

						<div class="text-text-slate">Upload Date:</div>
						<div class="font-medium text-text-rich">{formatDate(file.createdAt)}</div>

						<div class="text-text-slate">ID:</div>
						<div class="font-mono text-[10px] text-text-silver opacity-70">{file.id}</div>
					</div>
				</div>

				<!-- File actions -->
				<div class="mt-premium-md flex justify-end">
					<button
						on:click={selectFile}
						class="flex min-h-[44px] items-center rounded-premium-sm bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-premium hover:bg-brand-deep focus:outline-none focus:ring-2 focus:ring-brand-royal focus:ring-offset-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
						Select File
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
