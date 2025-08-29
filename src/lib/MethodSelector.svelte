<!-- src/lib/MethodSelector.svelte -->
<script>
	export let methodConfig;
	export let runMethod = null;
	export let onConfigureMethod = null;

	// Method info with simplified descriptions and runtime estimates
	const METHOD_INFO = {
		fel: {
			name: 'FEL',
			fullName: 'Fixed Effects Likelihood',
			shortDescription: 'Detect selection at individual sites',
			estimatedTime: 'Fast (2-5 min)',
			speed: 'fast',
			icon: '⚡'
		},
		meme: {
			name: 'MEME',
			fullName: 'Mixed Effects Model of Evolution',
			shortDescription: 'Detect episodic selection at individual sites',
			estimatedTime: 'Medium (5-15 min)',
			speed: 'medium',
			icon: '⏱️'
		},
		slac: {
			name: 'SLAC',
			fullName: 'Single-Likelihood Ancestor Counting',
			shortDescription: 'Fast approximate method for detecting selection',
			estimatedTime: 'Very Fast (1-2 min)',
			speed: 'very fast',
			icon: '⚡⚡'
		},
		fubar: {
			name: 'FUBAR',
			fullName: 'Fast Unconstrained Bayesian AppRoximation',
			shortDescription: 'Bayesian approach to detect selection',
			estimatedTime: 'Medium (10-20 min)',
			speed: 'medium',
			icon: '⏱️'
		},
		absrel: {
			name: 'aBSREL',
			fullName: 'adaptive Branch-Site Random Effects Likelihood',
			shortDescription: 'Test for selection on specific branches',
			estimatedTime: 'Slow (20-60 min)',
			speed: 'slow',
			icon: '🐢'
		},
		busted: {
			name: 'BUSTED',
			fullName: 'Branch-site Unrestricted Statistical Test for Episodic Diversification',
			shortDescription: 'Test for gene-wide selection',
			estimatedTime: 'Slow (15-45 min)',
			speed: 'slow',
			icon: '🐢'
		},
		gard: {
			name: 'GARD',
			fullName: 'Genetic Algorithm for Recombination Detection',
			shortDescription: 'Detect recombination breakpoints',
			estimatedTime: 'Very Slow (1-4 hours)',
			speed: 'very slow',
			icon: '🐌'
		},
		bgm: {
			name: 'BGM',
			fullName: 'Bayesian Graphical Model',
			shortDescription: 'Detect correlated substitution patterns',
			estimatedTime: 'Very Slow (2-8 hours)',
			speed: 'very slow',
			icon: '🐌'
		},
		fade: {
			name: 'FADE',
			fullName: 'FUBAR Approach to Directional Evolution',
			shortDescription: 'Detect directional selection',
			estimatedTime: 'Slow (30-90 min)',
			speed: 'slow',
			icon: '🐢'
		},
		relax: {
			name: 'RELAX',
			fullName: 'Relaxation Test',
			shortDescription: 'Test for relaxed or intensified selection',
			estimatedTime: 'Slow (20-60 min)',
			speed: 'slow',
			icon: '🐢'
		},
		'multi-hit': {
			name: 'MULTI-HIT',
			fullName: 'Multiple Hit Model',
			shortDescription: 'Account for multiple substitutions',
			estimatedTime: 'Slow (15-45 min)',
			speed: 'slow',
			icon: '🐢'
		},
		nrm: {
			name: 'NRM',
			fullName: 'Non-Reversible Model',
			shortDescription: 'Directional evolution analysis',
			estimatedTime: 'Slow (20-60 min)',
			speed: 'slow',
			icon: '🐢'
		},
		'contrast-fel': {
			name: 'Contrast-FEL',
			fullName: 'Contrast Fixed Effects Likelihood',
			shortDescription: 'Compare selection between groups',
			estimatedTime: 'Medium (10-30 min)',
			speed: 'medium',
			icon: '⏱️'
		}
	};

	// State management
	let selectedMethod = null;
	let geneticCode = 'Universal';

	// Advanced options state
	let confidenceIntervals = false;
	let resample = 0;
	let multipleHits = 'None';

	// Get available methods sorted by recommendation
	$: availableMethods = Object.entries(methodConfig)
		.map(([key, method]) => ({
			id: key,
			info: getMethodInfo(key),
			config: method
		}))
		.sort((a, b) => {
			// Prioritize commonly used methods
			const priority = ['fel', 'meme', 'slac', 'fubar'];
			const aIndex = priority.indexOf(a.id);
			const bIndex = priority.indexOf(b.id);
			if (aIndex !== -1 && bIndex === -1) return -1;
			if (aIndex === -1 && bIndex !== -1) return 1;
			if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
			return a.info.name.localeCompare(b.info.name);
		});

	// Get current method details
	$: currentMethod = selectedMethod ? availableMethods.find((m) => m.id === selectedMethod) : null;

	// Get method info helper
	function getMethodInfo(key) {
		return (
			METHOD_INFO[key.toLowerCase()] || {
				name: key.toUpperCase(),
				fullName: key,
				shortDescription: '',
				estimatedTime: 'Unknown',
				speed: 'unknown',
				icon: '⏱️'
			}
		);
	}

	// Run analysis
	function runAnalysis() {
		if (selectedMethod && runMethod) {
			console.log(`Running analysis with method: ${selectedMethod}`);
			runMethod(selectedMethod);
		}
	}
</script>

<div class="method-selector">
	<!-- Unified Interface Container -->
	<div class="interface-container">
		<!-- Method Selection Row -->
		<div class="method-selection">
			<select bind:value={selectedMethod} class="method-dropdown">
				<option value={null}>Select an analysis method</option>
				{#each availableMethods as method}
					<option value={method.id}>
						{method.info.name} - {method.info.fullName}
					</option>
				{/each}
			</select>

			{#if currentMethod}
				<span class="method-timing">
					{currentMethod.info.icon}
					{currentMethod.info.estimatedTime}
				</span>
			{/if}
		</div>

		<!-- Method Description -->
		{#if currentMethod}
			<div class="method-description">
				{currentMethod.info.shortDescription}
			</div>
		{/if}

		<!-- Options Container -->
		{#if selectedMethod}
			<div class="options-container">
				<!-- Essential Options -->
				<div class="essential-options">
					<div class="options-header">
						<span class="options-label">Essential</span>
					</div>

					<div class="option-group">
						<label class="option-label">
							Genetic Code:
							<select bind:value={geneticCode} class="option-select">
								<option>Universal</option>
								<option>Vertebrate mitochondrial</option>
								<option>Yeast mitochondrial</option>
								<option>Mold mitochondrial</option>
								<option>Invertebrate mitochondrial</option>
								<option>Ciliate nuclear</option>
								<option>Echinoderm mitochondrial</option>
								<option>Euplotid nuclear</option>
								<option>Alternative yeast nuclear</option>
								<option>Ascidian mitochondrial</option>
								<option>Flatworm mitochondrial</option>
							</select>
						</label>
					</div>

					<button class="run-button" on:click={runAnalysis} disabled={!selectedMethod}>
						Run Analysis
					</button>
				</div>

				<!-- Divider -->
				<div class="options-divider"></div>

				<!-- Advanced Options -->
				<div class="advanced-options">
					<div class="options-header">
						<span class="options-label">Advanced</span>
					</div>

					<div class="advanced-content">
						<div class="option-group">
							<label class="option-label">
								Resample:
								<input
									type="number"
									bind:value={resample}
									min="0"
									max="1000"
									class="option-input"
								/>
							</label>
						</div>

						<div class="option-group">
							<label class="option-checkbox">
								<input type="checkbox" bind:checked={confidenceIntervals} />
								Confidence intervals
							</label>
						</div>

						<div class="option-group">
							<label class="option-label">
								Multiple Hits:
								<select bind:value={multipleHits} class="option-select">
									<option>None</option>
									<option>Double</option>
									<option>Double+Triple</option>
								</select>
							</label>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Help hint (subtle) -->
	{#if !selectedMethod}
		<div class="help-hint">
			<span class="help-icon">?</span>
			<span class="help-text">
				For detecting selection at sites, try FEL or MEME. For recombination detection, use GARD.
			</span>
		</div>
	{/if}
</div>

<style>
	.method-selector {
		width: 100%;
		padding: 0;
	}

	.interface-container {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: 0;
		box-shadow: none;
	}

	.interface-header {
		margin-bottom: 20px;
	}

	.interface-title {
		font-size: 18px;
		font-weight: 600;
		color: #1a202c;
		margin: 0;
	}

	.method-selection {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 12px;
	}

	.method-dropdown {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #cbd5e0;
		border-radius: 6px;
		font-size: 14px;
		background: white;
		color: #2d3748;
		cursor: pointer;
	}

	.method-dropdown:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 1px #4299e1;
	}

	.method-timing {
		font-size: 13px;
		color: #718096;
		white-space: nowrap;
	}

	.method-description {
		font-size: 13px;
		color: #4a5568;
		margin-bottom: 24px;
		padding: 8px 0;
	}

	.options-container {
		display: flex;
		gap: 24px;
		border-top: 1px solid #f7fafc;
		padding-top: 20px;
	}

	.essential-options,
	.advanced-options {
		flex: 1;
	}

	.options-divider {
		width: 1px;
		background: #e2e8f0;
		margin: -8px 0;
	}

	.options-header {
		margin-bottom: 16px;
	}

	.options-label {
		font-size: 13px;
		font-weight: 500;
		color: #4a5568;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.option-group {
		margin-bottom: 16px;
	}

	.option-label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 13px;
		color: #2d3748;
		font-weight: 500;
	}

	.option-select,
	.option-input {
		padding: 6px 10px;
		border: 1px solid #cbd5e0;
		border-radius: 4px;
		font-size: 13px;
		background: white;
		color: #2d3748;
	}

	.option-select:focus,
	.option-input:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 1px #4299e1;
	}

	.option-input {
		width: 100%;
	}

	.option-checkbox {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: #2d3748;
		font-weight: 500;
		cursor: pointer;
	}

	.option-checkbox input {
		cursor: pointer;
	}

	.run-button {
		background: #2563eb;
		color: white;
		padding: 8px 20px;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s ease;
		margin-top: 8px;
	}

	.run-button:hover:not(:disabled) {
		background: #1d4ed8;
	}

	.run-button:active:not(:disabled) {
		transform: translateY(1px);
	}

	.run-button:disabled {
		background: #cbd5e0;
		cursor: not-allowed;
	}

	.advanced-content {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.help-hint {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
		padding: 12px 16px;
		background: #f7fafc;
		border-radius: 6px;
		font-size: 13px;
		color: #4a5568;
	}

	.help-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #cbd5e0;
		color: white;
		border-radius: 50%;
		font-size: 11px;
		font-weight: 600;
	}

	.help-text {
		flex: 1;
	}
</style>
