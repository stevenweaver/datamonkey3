<!-- src/lib/MethodSelector.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';

	export let methodConfig;
	export let runMethod = null;
	export let onConfigureMethod = null;

	const dispatch = createEventDispatcher();

	// Method info with simplified descriptions and runtime estimates
	const METHOD_INFO = {
		fel: {
			name: 'FEL',
			fullName: 'Fixed Effects Likelihood',
			shortDescription: 'Detect selection at individual sites'
		},
		meme: {
			name: 'MEME',
			fullName: 'Mixed Effects Model of Evolution',
			shortDescription: 'Detect episodic selection at individual sites'
		},
		slac: {
			name: 'SLAC',
			fullName: 'Single-Likelihood Ancestor Counting',
			shortDescription: 'Fast approximate method for detecting selection'
		},
		fubar: {
			name: 'FUBAR',
			fullName: 'Fast Unconstrained Bayesian AppRoximation',
			shortDescription: 'Bayesian approach to detect selection'
		},
		absrel: {
			name: 'aBSREL',
			fullName: 'adaptive Branch-Site Random Effects Likelihood',
			shortDescription: 'Test for selection on specific branches'
		},
		busted: {
			name: 'BUSTED',
			fullName: 'Branch-site Unrestricted Statistical Test for Episodic Diversification',
			shortDescription: 'Test for gene-wide selection'
		},
		gard: {
			name: 'GARD',
			fullName: 'Genetic Algorithm for Recombination Detection',
			shortDescription: 'Detect recombination breakpoints'
		},
		bgm: {
			name: 'BGM',
			fullName: 'Bayesian Graphical Model',
			shortDescription: 'Detect correlated substitution patterns'
		},
		fade: {
			name: 'FADE',
			fullName: 'FUBAR Approach to Directional Evolution',
			shortDescription: 'Detect directional selection'
		},
		relax: {
			name: 'RELAX',
			fullName: 'Relaxation Test',
			shortDescription: 'Test for relaxed or intensified selection'
		},
		'multi-hit': {
			name: 'MULTI-HIT',
			fullName: 'Multiple Hit Model',
			shortDescription: 'Account for multiple substitutions'
		},
		nrm: {
			name: 'NRM',
			fullName: 'Non-Reversible Model',
			shortDescription: 'Directional evolution analysis'
		},
		'contrast-fel': {
			name: 'Contrast-FEL',
			fullName: 'Contrast Fixed Effects Likelihood',
			shortDescription: 'Compare selection between groups'
		}
	};

	// State management
	let selectedMethod = null;
	let geneticCode = 'Universal';

	// Method-specific advanced options configurations
	const METHOD_ADVANCED_OPTIONS = {
		fel: {
			pValueThreshold: {
				type: 'number',
				label: 'P-value threshold',
				default: 0.1,
				min: 0.001,
				max: 1,
				step: 0.001
			},
			confidenceLevel: {
				type: 'number',
				label: 'Confidence level',
				default: 0.95,
				min: 0.8,
				max: 0.99,
				step: 0.01
			},
			rateClasses: { type: 'number', label: 'Rate classes', default: 3, min: 2, max: 10 },
			confidenceIntervals: {
				type: 'boolean',
				label: 'Include confidence intervals',
				default: false
			}
		},
		meme: {
			pValueThreshold: {
				type: 'number',
				label: 'P-value threshold',
				default: 0.1,
				min: 0.001,
				max: 1,
				step: 0.001
			},
			confidenceLevel: {
				type: 'number',
				label: 'Confidence level',
				default: 0.95,
				min: 0.8,
				max: 0.99,
				step: 0.01
			},
			rateClasses: { type: 'number', label: 'Rate classes', default: 3, min: 2, max: 10 },
			siteToSiteRateVariation: {
				type: 'boolean',
				label: 'Site-to-site rate variation',
				default: true
			}
		},
		slac: {
			pValueThreshold: {
				type: 'number',
				label: 'P-value threshold',
				default: 0.1,
				min: 0.001,
				max: 1,
				step: 0.001
			},
			confidenceLevel: {
				type: 'number',
				label: 'Confidence level',
				default: 0.95,
				min: 0.8,
				max: 0.99,
				step: 0.01
			},
			ancestralSequences: { type: 'boolean', label: 'Include ancestral sequences', default: false }
		},
		fubar: {
			posteriorThreshold: {
				type: 'number',
				label: 'Posterior threshold',
				default: 0.9,
				min: 0.5,
				max: 0.99,
				step: 0.01
			},
			gridPoints: { type: 'number', label: 'Grid points', default: 20, min: 5, max: 50 },
			mcmcChains: { type: 'number', label: 'MCMC chains', default: 5, min: 2, max: 20 },
			mcmcSamples: {
				type: 'number',
				label: 'MCMC samples',
				default: 2000000,
				min: 100000,
				max: 10000000,
				step: 100000
			}
		},
		absrel: {
			branchesType: {
				type: 'select',
				label: 'Test branches',
				default: 'All',
				options: ['All', 'Internal', 'Leaves', 'Unlabeled-branches', 'Test']
			},
			pValueThreshold: {
				type: 'number',
				label: 'P-value threshold',
				default: 0.05,
				min: 0.001,
				max: 1,
				step: 0.001
			},
			synonymousRateVariation: {
				type: 'boolean',
				label: 'Synonymous rate variation',
				default: true
			},
			multipleHits: {
				type: 'select',
				label: 'Multiple hits',
				default: 'Double',
				options: ['None', 'Double', 'Double+Triple']
			}
		},
		busted: {
			branchesType: {
				type: 'select',
				label: 'Test branches',
				default: 'All',
				options: ['All', 'Internal', 'Leaves', 'Unlabeled-branches', 'Test']
			},
			rateClasses: { type: 'number', label: 'Rate classes', default: 3, min: 2, max: 10 },
			synonymousRateVariation: {
				type: 'boolean',
				label: 'Synonymous rate variation',
				default: true
			},
			multipleHits: {
				type: 'select',
				label: 'Multiple hits',
				default: 'Double',
				options: ['None', 'Double', 'Double+Triple']
			}
		},
		gard: {
			rateClasses: { type: 'number', label: 'Rate classes', default: 4, min: 2, max: 10 },
			modelSelection: {
				type: 'select',
				label: 'Model selection',
				default: 'AIC',
				options: ['AIC', 'AICc', 'BIC']
			},
			breakpointMethod: {
				type: 'select',
				label: 'Breakpoint method',
				default: 'GA',
				options: ['GA', 'Exhaustive']
			},
			maxBreakpoints: { type: 'number', label: 'Max breakpoints', default: 10, min: 1, max: 50 }
		},
		bgm: {
			chainLength: {
				type: 'number',
				label: 'Chain length',
				default: 2500000,
				min: 100000,
				max: 10000000,
				step: 100000
			},
			burnIn: {
				type: 'number',
				label: 'Burn-in samples',
				default: 1000000,
				min: 50000,
				max: 5000000,
				step: 50000
			},
			samples: { type: 'number', label: 'Samples', default: 100, min: 50, max: 1000 },
			substitutionModel: {
				type: 'select',
				label: 'Substitution model',
				default: 'GTR',
				options: ['JC69', 'HKY85', 'TN93', 'GTR']
			}
		},
		fade: {
			pValueThreshold: {
				type: 'number',
				label: 'P-value threshold',
				default: 0.1,
				min: 0.001,
				max: 1,
				step: 0.001
			},
			gridPoints: { type: 'number', label: 'Grid points', default: 20, min: 5, max: 50 },
			mcmcChains: { type: 'number', label: 'MCMC chains', default: 5, min: 2, max: 20 },
			mcmcSamples: {
				type: 'number',
				label: 'MCMC samples',
				default: 2000000,
				min: 100000,
				max: 10000000,
				step: 100000
			}
		},
		relax: {
			testBranches: {
				type: 'select',
				label: 'Test branches',
				default: 'Test',
				options: ['Test', 'All', 'Internal', 'Leaves']
			},
			referenceBranches: {
				type: 'select',
				label: 'Reference branches',
				default: 'Reference',
				options: ['Reference', 'All-except-test', 'Internal', 'Leaves']
			},
			rateClasses: { type: 'number', label: 'Rate classes', default: 3, min: 2, max: 10 },
			modelSelection: { type: 'boolean', label: 'Perform model selection', default: true }
		},
		'multi-hit': {
			tripleHits: { type: 'boolean', label: 'Include triple hits', default: false },
			pValueThreshold: {
				type: 'number',
				label: 'P-value threshold',
				default: 0.05,
				min: 0.001,
				max: 1,
				step: 0.001
			},
			confidenceLevel: {
				type: 'number',
				label: 'Confidence level',
				default: 0.95,
				min: 0.8,
				max: 0.99,
				step: 0.01
			}
		},
		nrm: {
			rateClasses: { type: 'number', label: 'Rate classes', default: 3, min: 2, max: 10 },
			modelSelection: {
				type: 'select',
				label: 'Model selection',
				default: 'AIC',
				options: ['AIC', 'AICc', 'BIC']
			},
			equilibriumFrequencies: {
				type: 'boolean',
				label: 'Estimate equilibrium frequencies',
				default: true
			}
		},
		'contrast-fel': {
			branchSets: { type: 'select', label: 'Branch sets', default: '2', options: ['2', '3', '4'] },
			pValueThreshold: {
				type: 'number',
				label: 'P-value threshold',
				default: 0.1,
				min: 0.001,
				max: 1,
				step: 0.001
			},
			confidenceLevel: {
				type: 'number',
				label: 'Confidence level',
				default: 0.95,
				min: 0.8,
				max: 0.99,
				step: 0.01
			}
		}
	};

	// Method-specific advanced options state
	let methodOptions = {};

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

	// Get current method's advanced options
	$: currentMethodOptions = selectedMethod
		? METHOD_ADVANCED_OPTIONS[selectedMethod.toLowerCase()] || {}
		: {};

	// Initialize method options when method changes
	$: if (selectedMethod && !methodOptions[selectedMethod]) {
		initializeMethodOptions(selectedMethod);
	}

	// Dispatch method changes for parent components (like timing estimates)
	$: if (selectedMethod || geneticCode || methodOptions) {
		dispatch('methodChange', {
			method: selectedMethod,
			options: selectedMethod ? methodOptions[selectedMethod] : {},
			geneticCode
		});
	}

	// Initialize default values for a method's options
	function initializeMethodOptions(method) {
		const options = METHOD_ADVANCED_OPTIONS[method.toLowerCase()];
		if (options) {
			methodOptions[method] = {};
			for (const [key, config] of Object.entries(options)) {
				methodOptions[method][key] = config.default;
			}
			methodOptions = { ...methodOptions }; // Trigger reactivity
		}
	}

	// Get method info helper
	function getMethodInfo(key) {
		return (
			METHOD_INFO[key.toLowerCase()] || {
				name: key.toUpperCase(),
				fullName: key,
				shortDescription: ''
			}
		);
	}

	// Run analysis
	function runAnalysis() {
		if (selectedMethod && runMethod) {
			const analysisConfig = {
				method: selectedMethod,
				geneticCode,
				...(methodOptions[selectedMethod] || {})
			};
			console.log(`Running analysis with config:`, analysisConfig);
			runMethod(selectedMethod, analysisConfig);
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
						{#if Object.keys(currentMethodOptions).length > 0}
							{#each Object.entries(currentMethodOptions) as [optionKey, optionConfig]}
								<div class="option-group">
									{#if optionConfig.type === 'number'}
										<label class="option-label">
											{optionConfig.label}:
											<input
												type="number"
												bind:value={methodOptions[selectedMethod][optionKey]}
												min={optionConfig.min || 0}
												max={optionConfig.max || 1000}
												step={optionConfig.step || 1}
												class="option-input"
											/>
										</label>
									{:else if optionConfig.type === 'boolean'}
										<label class="option-checkbox">
											<input
												type="checkbox"
												bind:checked={methodOptions[selectedMethod][optionKey]}
											/>
											{optionConfig.label}
										</label>
									{:else if optionConfig.type === 'select'}
										<label class="option-label">
											{optionConfig.label}:
											<select
												bind:value={methodOptions[selectedMethod][optionKey]}
												class="option-select"
											>
												{#each optionConfig.options as option}
													<option value={option}>{option}</option>
												{/each}
											</select>
										</label>
									{/if}
								</div>
							{/each}
						{:else}
							<div class="no-options">
								<span class="no-options-text">This method uses default parameters</span>
							</div>
						{/if}
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

	.no-options {
		padding: 16px;
		text-align: center;
		color: #718096;
		background: #f7fafc;
		border-radius: 4px;
		border: 1px solid #e2e8f0;
	}

	.no-options-text {
		font-size: 13px;
		font-style: italic;
	}
</style>
