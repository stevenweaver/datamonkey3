<!-- TreeSourceSelector.svelte - Tree source selection component for Storybook -->
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let hasUploadedTree = false;
	export let treeSource = 'infer'; // 'uploaded' | 'infer'
	export let isGenerating = false;
	export let treeStatus = 'ready'; // 'ready' | 'generating' | 'available' | 'error'
	export let showAdvancedOptions = false;
	export let selectedMethod = 'nj'; // 'nj' | 'ml'
	export let substitutionModel = 'HKY';
	export let bootstrapReps = 100;
	export let disabled = false;

	// Status display
	const STATUS_CONFIG = {
		ready: { icon: '⚪', text: 'Ready for tree inference' },
		generating: { icon: '🔄', text: 'Generating tree...' },
		available: { icon: '✓', text: 'Tree available from upload' },
		error: { icon: '❌', text: 'Tree generation failed' }
	};

	$: statusConfig = STATUS_CONFIG[treeStatus] || STATUS_CONFIG.ready;

	// Event handlers
	function toggleAdvancedOptions() {
		if (disabled || isGenerating) return;
		showAdvancedOptions = !showAdvancedOptions;
		dispatch('advancedToggle', { showAdvanced: showAdvancedOptions });
	}

	function handleTreeSourceChange() {
		dispatch('treeSourceChange', { 
			treeSource,
			hasUploadedTree,
			selectedMethod,
			substitutionModel,
			bootstrapReps 
		});
	}

	function handleAdvancedChange() {
		dispatch('advancedChange', {
			selectedMethod,
			substitutionModel,
			bootstrapReps
		});
	}

	// Reactive statements
	$: if (treeSource || selectedMethod || substitutionModel || bootstrapReps) {
		handleTreeSourceChange();
	}
</script>

<div class="tree-source-selector">
	<!-- Tree Source Selection Header -->
	<div class="tree-source-header">
		<div class="tree-source-title">
			<label class="source-label">Tree Source:</label>
			<div class="status-badge" class:generating={isGenerating}>
				{#if isGenerating}
					<span class="status-content">
						<svg class="spinner" viewBox="0 0 24 24">
							<circle class="spinner-track" cx="12" cy="12" r="10" />
							<path class="spinner-path" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
						</svg>
						Status: {statusConfig.text}
					</span>
				{:else}
					<span class="status-content">
						Status: {statusConfig.icon} {statusConfig.text}
					</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Tree Source Options -->
	<div class="tree-source-options">
		<label class="option-row">
			<input
				type="radio"
				bind:group={treeSource}
				value="uploaded"
				disabled={!hasUploadedTree || isGenerating || disabled}
				class="option-radio"
			/>
			<span class="option-content">
				<span class="option-text">Use uploaded tree</span>
				{#if !hasUploadedTree}
					<span class="option-hint">(No uploaded tree available)</span>
				{/if}
			</span>
		</label>

		<label class="option-row">
			<input
				type="radio"
				bind:group={treeSource}
				value="infer"
				disabled={isGenerating || disabled}
				class="option-radio"
			/>
			<span class="option-content">
				<span class="option-text">Infer tree automatically</span>
			</span>
		</label>
	</div>

	<!-- Advanced Options Toggle -->
	<div class="advanced-section">
		<button
			type="button"
			on:click={toggleAdvancedOptions}
			class="advanced-toggle"
			class:disabled={disabled || isGenerating}
			{disabled}
		>
			<svg class="chevron" class:expanded={showAdvancedOptions} viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
			</svg>
			Advanced Tree Options
		</button>

		{#if showAdvancedOptions}
			<div class="advanced-content">
				<!-- Tree Building Method -->
				<div class="form-group">
					<label class="form-label">Tree Building Method</label>
					<select
						bind:value={selectedMethod}
						on:change={handleAdvancedChange}
						disabled={isGenerating || disabled}
						class="form-select"
					>
						<option value="nj">Neighbor Joining (Faster)</option>
						<option value="ml">Maximum Likelihood (More Accurate)</option>
					</select>
				</div>

				<!-- Substitution Model (ML only) -->
				{#if selectedMethod === 'ml'}
					<div class="form-group">
						<label class="form-label">Substitution Model</label>
						<select
							bind:value={substitutionModel}
							on:change={handleAdvancedChange}
							disabled={isGenerating || disabled}
							class="form-select"
						>
							<option value="JC69">JC69 (Simplest)</option>
							<option value="K80">K80 (Transition/Transversion)</option>
							<option value="HKY">HKY (Nucleotide Frequencies)</option>
							<option value="GTR">GTR (General Time Reversible)</option>
						</select>
					</div>
				{/if}

				<!-- Bootstrap Replicates -->
				<div class="form-group">
					<label class="form-label">
						Bootstrap Replicates
						<span class="form-hint">(0 = no bootstrapping)</span>
					</label>
					<input
						type="number"
						bind:value={bootstrapReps}
						on:change={handleAdvancedChange}
						min="0"
						max="1000"
						disabled={isGenerating || disabled}
						class="form-input"
					/>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.tree-source-selector {
		font-family: system-ui, -apple-system, sans-serif;
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

	.status-badge.generating {
		background: #fef3c7;
		color: #92400e;
	}

	.status-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.spinner {
		width: 16px;
		height: 16px;
		animation: spin 1s linear infinite;
	}

	.spinner-track {
		opacity: 0.25;
		stroke: currentColor;
		stroke-width: 4;
		fill: none;
	}

	.spinner-path {
		opacity: 0.75;
		fill: currentColor;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
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

	.advanced-section {
		border-top: 1px solid #e5e7eb;
		padding-top: 16px;
	}

	.advanced-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		background: none;
		border: none;
		color: #3b82f6;
		font-size: 14px;
		cursor: pointer;
		transition: color 0.2s ease;
		padding: 0;
	}

	.advanced-toggle:hover:not(.disabled) {
		color: #1d4ed8;
	}

	.advanced-toggle.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.chevron {
		width: 20px;
		height: 20px;
		transition: transform 0.2s ease;
		fill: currentColor;
	}

	.chevron.expanded {
		transform: rotate(90deg);
	}

	.advanced-content {
		margin-top: 12px;
		padding: 16px;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-label {
		display: block;
		margin-bottom: 4px;
		font-size: 12px;
		font-weight: 500;
		color: #374151;
	}

	.form-hint {
		font-weight: 400;
		color: #6b7280;
	}

	.form-select,
	.form-input {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		background: white;
		color: #374151;
	}

	.form-select:focus,
	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}

	.form-select:disabled,
	.form-input:disabled {
		background: #f3f4f6;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.form-input[type="number"] {
		-moz-appearance: textfield;
	}

	.form-input[type="number"]::-webkit-outer-spin-button,
	.form-input[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>