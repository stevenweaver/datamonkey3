<!-- TreeSourceSelector.svelte - Tree source selection component for Storybook -->
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let hasUploadedTree = false;
	export let hasInferredTree = true; // Whether NJ tree from alignment metrics exists
	export let treeSource = 'inferred'; // 'uploaded' | 'inferred' | 'upload-new'
	export let disabled = false;

	// File upload state
	let fileInput;
	let uploadedFile = null;

	// Status display
	const getStatusText = () => {
		if (treeSource === 'uploaded' && hasUploadedTree) {
			return '✓ Using uploaded tree';
		} else if (treeSource === 'inferred' && hasInferredTree) {
			return '✓ Using neighbor-joining tree from alignment metrics';
		} else if (treeSource === 'upload-new') {
			if (uploadedFile) {
				return `✓ Ready to use ${uploadedFile.name}`;
			}
			return '⚪ Select tree file to upload';
		}
		return '⚪ Select tree source';
	};

	// Event handlers
	function handleTreeSourceChange() {
		dispatch('treeSourceChange', {
			treeSource,
			hasUploadedTree,
			hasInferredTree,
			uploadedFile
		});
	}

	function handleFileUpload() {
		const file = fileInput?.files?.[0];
		if (file) {
			uploadedFile = file;
			dispatch('fileUploaded', {
				file,
				treeSource: 'upload-new'
			});
			handleTreeSourceChange();
		}
	}

	function clearUploadedFile() {
		uploadedFile = null;
		if (fileInput) {
			fileInput.value = '';
		}
		handleTreeSourceChange();
	}

	// Reactive statements
	$: statusText = getStatusText();
</script>

<div class="tree-source-selector">
	<!-- Tree Source Selection Header -->
	<div class="tree-source-header">
		<div class="tree-source-title">
			<label class="source-label">Tree Source:</label>
			<div class="status-badge">
				<span class="status-content">
					Status: {statusText}
				</span>
			</div>
		</div>
	</div>

	<!-- Tree Source Options -->
	<div class="tree-source-options">
		{#if hasUploadedTree}
			<label class="option-row">
				<input
					type="radio"
					bind:group={treeSource}
					value="uploaded"
					on:change={handleTreeSourceChange}
					{disabled}
					class="option-radio"
				/>
				<span class="option-content">
					<span class="option-text">Use uploaded tree</span>
				</span>
			</label>
		{/if}

		<label class="option-row">
			<input
				type="radio"
				bind:group={treeSource}
				value="inferred"
				on:change={handleTreeSourceChange}
				disabled={!hasInferredTree || disabled}
				class="option-radio"
			/>
			<span class="option-content">
				<span class="option-text">Use neighbor-joining tree</span>
				<span class="option-hint">(Generated during alignment file metrics)</span>
			</span>
		</label>

		<label class="option-row">
			<input
				type="radio"
				bind:group={treeSource}
				value="upload-new"
				on:change={handleTreeSourceChange}
				{disabled}
				class="option-radio"
			/>
			<span class="option-content">
				<span class="option-text">Upload a different tree</span>
			</span>
		</label>
	</div>

	<!-- File Upload Section (shown when upload-new is selected) -->
	{#if treeSource === 'upload-new'}
		<div class="upload-section">
			<div class="upload-area">
				<input
					type="file"
					bind:this={fileInput}
					on:change={handleFileUpload}
					accept=".nwk,.newick,.tre,.tree,.nh"
					{disabled}
					class="file-input"
					id="tree-file-input"
				/>
				<label for="tree-file-input" class="file-input-label" class:disabled>
					<svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
					{#if uploadedFile}
						<span class="file-name">{uploadedFile.name}</span>
						<span class="file-size">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
					{:else}
						<span class="upload-text">Click to select tree file</span>
						<span class="upload-hint">Newick format (.nwk, .newick, .tre, .tree, .nh)</span>
					{/if}
				</label>

				{#if uploadedFile}
					<button
						type="button"
						on:click={clearUploadedFile}
						{disabled}
						class="clear-file-btn"
						title="Remove selected file"
					>
						<svg class="clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.tree-source-selector {
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		max-width: 500px;
	}

	.tree-source-header {
		margin-bottom: 16px;
	}

	.tree-source-title {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 8px;
	}

	.source-label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		padding: 4px 8px;
		background: #f3f4f6;
		border-radius: 6px;
		font-size: 12px;
		color: #6b7280;
	}

	.status-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.tree-source-options {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 20px;
	}

	.option-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		cursor: pointer;
	}

	.option-row:has(:disabled) {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.option-radio {
		margin-top: 2px;
		width: 16px;
		height: 16px;
		accent-color: #3b82f6;
	}

	.option-radio:disabled {
		cursor: not-allowed;
	}

	.option-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.option-text {
		font-size: 14px;
		color: #374151;
		font-weight: 400;
	}

	.option-hint {
		font-size: 12px;
		color: #9ca3af;
		font-style: italic;
	}

	/* Upload Section Styles */
	.upload-section {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid #e5e7eb;
	}

	.upload-area {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.file-input {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.file-input-label {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px;
		border: 2px dashed #d1d5db;
		border-radius: 8px;
		background: #f9fafb;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 80px;
	}

	.file-input-label:hover:not(.disabled) {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.file-input-label.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #f3f4f6;
	}

	.upload-icon {
		width: 24px;
		height: 24px;
		color: #6b7280;
		margin-bottom: 8px;
	}

	.file-input-label:hover:not(.disabled) .upload-icon {
		color: #3b82f6;
	}

	.upload-text {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
		margin-bottom: 4px;
	}

	.upload-hint {
		font-size: 12px;
		color: #6b7280;
	}

	.file-name {
		font-size: 14px;
		font-weight: 500;
		color: #059669;
		margin-bottom: 2px;
	}

	.file-size {
		font-size: 12px;
		color: #6b7280;
	}

	.clear-file-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.clear-file-btn:hover:not(:disabled) {
		border-color: #ef4444;
		background: #fef2f2;
		color: #ef4444;
	}

	.clear-file-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.clear-icon {
		width: 16px;
		height: 16px;
	}
</style>
