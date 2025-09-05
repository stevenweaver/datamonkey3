<!-- src/lib/MethodSelector.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { backendConnectivity } from '../stores/backendConnectivity.js';
	import { treeStore } from '../stores/tree';
	import BranchSelector from './BranchSelector.svelte';

	export let methodConfig;
	export let runMethod = null;
	export let onConfigureMethod = null;

	const dispatch = createEventDispatcher();

	// Supported methods - easy to update when methods are implemented
	const SUPPORTED_METHODS = ['fel', 'slac'];

	// Method info with simplified descriptions and runtime estimates
	const METHOD_INFO = {
		fel: {
			name: 'FEL',
			fullName: 'Fixed Effects Likelihood',
			shortDescription: 'Detect selection at individual sites',
			supported: true
		},
		meme: {
			name: 'MEME',
			fullName: 'Mixed Effects Model of Evolution',
			shortDescription: 'Detect episodic selection at individual sites',
			supported: false
		},
		slac: {
			name: 'SLAC',
			fullName: 'Single-Likelihood Ancestor Counting',
			shortDescription: 'Fast approximate method for detecting selection',
			supported: true
		},
		fubar: {
			name: 'FUBAR',
			fullName: 'Fast Unconstrained Bayesian AppRoximation',
			shortDescription: 'Bayesian approach to detect selection',
			supported: false
		},
		absrel: {
			name: 'aBSREL',
			fullName: 'adaptive Branch-Site Random Effects Likelihood',
			shortDescription: 'Test for selection on specific branches',
			supported: false
		},
		busted: {
			name: 'BUSTED',
			fullName: 'Branch-site Unrestricted Statistical Test for Episodic Diversification',
			shortDescription: 'Test for gene-wide selection',
			supported: false
		},
		gard: {
			name: 'GARD',
			fullName: 'Genetic Algorithm for Recombination Detection',
			shortDescription: 'Detect recombination breakpoints',
			supported: false
		},
		bgm: {
			name: 'BGM',
			fullName: 'Bayesian Graphical Model',
			shortDescription: 'Detect correlated substitution patterns',
			supported: false
		},
		fade: {
			name: 'FADE',
			fullName: 'FUBAR Approach to Directional Evolution',
			shortDescription: 'Detect directional selection',
			supported: false
		},
		relax: {
			name: 'RELAX',
			fullName: 'Relaxation Test',
			shortDescription: 'Test for relaxed or intensified selection',
			supported: false
		},
		'multi-hit': {
			name: 'MULTI-HIT',
			fullName: 'Multiple Hit Model',
			shortDescription: 'Account for multiple substitutions',
			supported: false
		},
		nrm: {
			name: 'NRM',
			fullName: 'Non-Reversible Model',
			shortDescription: 'Directional evolution analysis',
			supported: false
		},
		'contrast-fel': {
			name: 'Contrast-FEL',
			fullName: 'Contrast Fixed Effects Likelihood',
			shortDescription: 'Compare selection between groups',
			supported: false
		}
	};

	// State management
	let selectedMethod = null;
	let geneticCode = 'Universal';
	let geneticCodeId = 0; // For matching HyPhy numeric codes
	let executionMode = 'local'; // 'local' or 'backend'

	// Genetic code mapping (HyPhy uses numeric IDs)
	const GENETIC_CODES = [
		{ id: 0, name: 'Universal', label: 'Universal code' },
		{ id: 1, name: 'Vertebrate mitochondrial', label: 'Vertebrate mitochondrial DNA code' },
		{ id: 2, name: 'Yeast mitochondrial', label: 'Yeast mitochondrial DNA code' },
		{
			id: 3,
			name: 'Mold mitochondrial',
			label: 'Mold, Protozoan and Coelenterate mt; Mycloplasma/Spiroplasma'
		},
		{ id: 4, name: 'Invertebrate mitochondrial', label: 'Invertebrate mitochondrial DNA code' },
		{ id: 5, name: 'Ciliate nuclear', label: 'Ciliate, Dasycladacean and Hexamita Nuclear code' },
		{ id: 6, name: 'Echinoderm mitochondrial', label: 'Echinoderm mitochondrial DNA code' },
		{ id: 7, name: 'Euplotid nuclear', label: 'Euplotid Nuclear code' },
		{ id: 8, name: 'Alternative yeast nuclear', label: 'Alternative Yeast Nuclear code' },
		{ id: 9, name: 'Ascidian mitochondrial', label: 'Ascidian mitochondrial DNA code' },
		{ id: 10, name: 'Flatworm mitochondrial', label: 'Flatworm mitochondrial DNA code' },
		{ id: 11, name: 'Blepharisma nuclear', label: 'Blepharisma Nuclear code' }
	];

	// Method-specific advanced options configurations
	const METHOD_ADVANCED_OPTIONS = {
		fel: {
			// Branch selection options
			branchesToTest: {
				type: 'select',
				label: 'Branches to Test',
				default: 'All',
				options: ['All', 'Internal', 'Leaves', 'Unlabeled', 'Custom', 'Interactive'],
				description: 'Which branches to test for positive selection'
			},
			customBranches: {
				type: 'text',
				label: 'Custom branches (comma-separated or regex)',
				default: '',
				placeholder: 'e.g. Node1,Node2 or /^human/i',
				dependsOn: 'branchesToTest',
				enabledWhen: ['Custom'],
				description: 'Comma-separated branch names or regex pattern'
			},
			interactiveTree: {
				type: 'interactive-tree',
				label: 'Select branches on tree',
				default: '',
				dependsOn: 'branchesToTest',
				enabledWhen: ['Interactive'],
				description: 'Click on tree branches to select them for testing'
			},
			// Core FEL parameters
			srv: {
				type: 'select',
				label: 'Synonymous rate variation (recommended)',
				default: 'Yes',
				options: ['Yes', 'No']
			},
			multipleHits: {
				type: 'select',
				label: 'Multiple Hits',
				default: 'None',
				options: ['None', 'Double', 'Double+Triple']
			},
			siteMultihit: {
				type: 'select',
				label: 'Site Multihit',
				default: 'Estimate',
				options: ['Estimate', 'Global'],
				dependsOn: 'multipleHits',
				enabledWhen: ['Double', 'Double+Triple']
			},
			// Advanced parameters (matching the form structure)
			resample: {
				type: 'number',
				label: 'Resample (parametric bootstrap replicates)',
				default: 0,
				min: 0,
				max: 1000,
				step: 1,
				description:
					'Advanced setting - will result in MUCH SLOWER run time. Recommended for small to medium (<30 sequences) datasets.'
			},
			confidenceIntervals: {
				type: 'boolean',
				label: 'Compute confidence intervals',
				default: false,
				description: 'Compute profile likelihood confidence intervals for each variable site'
			},
			// Keep existing parameters for backward compatibility
			pValueThreshold: {
				type: 'number',
				label: 'P-value threshold',
				default: 0.1,
				min: 0.001,
				max: 1,
				step: 0.001
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

	// Tree data from store
	let trees = {};
	treeStore.subscribe((value) => {
		trees = value;
	});

	// Get tree data for interactive selection
	$: selectedTreeData = trees.nj || trees.usertree || trees.inferredNewick || '';

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

	// Update genetic code ID when name changes
	$: {
		const codeEntry = GENETIC_CODES.find((code) => code.name === geneticCode);
		if (codeEntry) {
			geneticCodeId = codeEntry.id;
		}
	}

	// Dispatch method changes for parent components (like timing estimates)
	$: if (selectedMethod || geneticCode || methodOptions || executionMode) {
		dispatch('methodChange', {
			method: selectedMethod,
			options: selectedMethod ? methodOptions[selectedMethod] : {},
			geneticCode,
			geneticCodeId,
			executionMode
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
				shortDescription: '',
				supported: false
			}
		);
	}

	// Run analysis
	function runAnalysis() {
		if (selectedMethod && runMethod) {
			const analysisConfig = {
				method: selectedMethod,
				geneticCode,
				executionMode,
				...(methodOptions[selectedMethod] || {})
			};
			console.log(`🚀 METHODSELECTOR DEBUG - Running analysis with config:`, analysisConfig);
			console.log(`🚀 METHODSELECTOR DEBUG - methodOptions[${selectedMethod}]:`, methodOptions[selectedMethod]);
			runMethod(selectedMethod, analysisConfig);
		}
	}

	// Smart default: suggest backend for larger datasets
	function getSmartDefault(fileSequenceCount = 0) {
		return fileSequenceCount > 1000 ? 'backend' : 'local';
	}

	// Handle branch selection from interactive tree
	function handleBranchSelectionChange(event) {
		console.log('🌳🔥 METHODSELECTOR EVENT FIRED! Branch selection changed:', event.detail);
		console.log('🌳🔥 METHODSELECTOR - selectedMethod:', selectedMethod);
		console.log('🌳🔥 METHODSELECTOR - methodOptions exist:', !!methodOptions[selectedMethod]);
		
		if (selectedMethod && methodOptions[selectedMethod]) {
			const { taggedNewick, selectedBranches, count } = event.detail;
			console.log('🌳🔥 METHODSELECTOR - Setting interactive tree:', {
				taggedNewick: taggedNewick || '',
				selectedBranches: selectedBranches || [],
				count: count || 0,
				taggedTreeLength: (taggedNewick || '').length,
				hasFgTags: (taggedNewick || '').includes('{fg}')
			});
			methodOptions[selectedMethod].interactiveTree = taggedNewick || '';
			methodOptions[selectedMethod].selectedBranchCount = count || 0;
			methodOptions[selectedMethod].selectedBranchNames = selectedBranches || [];
			methodOptions = { ...methodOptions }; // Trigger reactivity
			console.log('🌳🔥 METHODSELECTOR - Updated methodOptions[' + selectedMethod + ']:', methodOptions[selectedMethod]);
			console.log('🌳🔥 METHODSELECTOR - Stored interactiveTree length:', methodOptions[selectedMethod].interactiveTree.length);
			console.log('🌳🔥 METHODSELECTOR - Stored interactiveTree has {fg}:', methodOptions[selectedMethod].interactiveTree.includes('{fg}'));
		} else {
			console.log('🌳🔥 METHODSELECTOR - Missing selectedMethod or methodOptions');
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
					<option value={method.id} disabled={!method.info.supported}>
						{method.info.name} - {method.info.fullName}
						{#if !method.info.supported}(Coming Soon){/if}
					</option>
				{/each}
			</select>
		</div>

		<!-- Method Description -->
		{#if currentMethod}
			<div class="method-description">
				{currentMethod.info.shortDescription}
				{#if !currentMethod.info.supported}
					<div class="coming-soon-badge">
						<span class="badge-text">Coming Soon</span>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Execution Mode Selection -->
		{#if selectedMethod && currentMethod?.info.supported}
			<div class="execution-mode-section">
				<h4 class="execution-mode-title">Execution Mode</h4>
				<div class="execution-mode-options">
					<label class="execution-mode-option">
						<input
							type="radio"
							bind:group={executionMode}
							value="local"
							class="execution-mode-radio"
						/>
						<div class="execution-mode-content">
							<div class="execution-mode-name">Local (Browser)</div>
							<div class="execution-mode-desc">Fast • Small datasets</div>
						</div>
					</label>
					<label class="execution-mode-option">
						<input
							type="radio"
							bind:group={executionMode}
							value="backend"
							class="execution-mode-radio"
							disabled={!$backendConnectivity.isConnected}
						/>
						<div class="execution-mode-content">
							<div class="execution-mode-name">Backend Server</div>
							<div class="execution-mode-desc">
								{#if $backendConnectivity.isConnected}
									Powerful • Large datasets
								{:else}
									Server unavailable
								{/if}
							</div>
						</div>
					</label>
				</div>
				{#if !$backendConnectivity.isConnected}
					<div class="backend-status-warning">
						<svg class="warning-icon" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						<span>Server temporarily unavailable. Please use Local mode.</span>
					</div>
				{/if}
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
								{#each GENETIC_CODES as code}
									<option value={code.name}>{code.label}</option>
								{/each}
							</select>
						</label>
					</div>

					<button
						class="run-button"
						on:click={runAnalysis}
						disabled={!selectedMethod || !currentMethod?.info.supported}
					>
						{#if currentMethod?.info.supported}
							Run Analysis
						{:else}
							Coming Soon
						{/if}
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
								{@const isEnabled =
									!optionConfig.dependsOn ||
									(methodOptions[selectedMethod] &&
										optionConfig.enabledWhen &&
										optionConfig.enabledWhen.includes(
											methodOptions[selectedMethod][optionConfig.dependsOn]
										))}

								<div class="option-group" class:disabled={!isEnabled}>
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
												disabled={!isEnabled}
											/>
										</label>
									{:else if optionConfig.type === 'boolean'}
										<label class="option-checkbox">
											<input
												type="checkbox"
												bind:checked={methodOptions[selectedMethod][optionKey]}
												disabled={!isEnabled}
											/>
											{optionConfig.label}
										</label>
									{:else if optionConfig.type === 'select'}
										<label class="option-label">
											{optionConfig.label}:
											<select
												bind:value={methodOptions[selectedMethod][optionKey]}
												class="option-select"
												disabled={!isEnabled}
											>
												{#each optionConfig.options as option}
													<option value={option}>{option}</option>
												{/each}
											</select>
										</label>
									{:else if optionConfig.type === 'text'}
										<label class="option-label">
											{optionConfig.label}:
											<input
												type="text"
												bind:value={methodOptions[selectedMethod][optionKey]}
												placeholder={optionConfig.placeholder || ''}
												class="option-input"
												disabled={!isEnabled}
											/>
										</label>
									{/if}

									{#if optionConfig.description}
										<div class="option-description">
											{optionConfig.description}
										</div>
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

		<!-- Interactive Tree Section (shown only when Interactive branch selection is enabled) -->
		{#if selectedMethod && methodOptions[selectedMethod] && methodOptions[selectedMethod].branchesToTest === 'Interactive'}
			<div class="interactive-tree-section">
				<div class="tree-section-header">
					<h4 class="tree-section-title">Interactive Branch Selection</h4>
					<p class="tree-section-description">Click on tree branches to select them for testing. Use the dropdown menu on nodes for additional options.</p>
				</div>
				
				{#if selectedTreeData}
					<div class="tree-selector-wrapper">
						<BranchSelector
							treeData={selectedTreeData}
							height={400}
							width={800}
							on:selectionChange={handleBranchSelectionChange}
						/>
					</div>
					
					{#if methodOptions[selectedMethod].selectedBranchCount > 0}
						<div class="selection-summary">
							<strong>Selected {methodOptions[selectedMethod].selectedBranchCount} branches:</strong>
							<div class="selected-branches-list">
								{#each (methodOptions[selectedMethod].selectedBranchNames || []).slice(0, 5) as branchName}
									<span class="branch-tag">{branchName}</span>
								{/each}
								{#if methodOptions[selectedMethod].selectedBranchCount > 5}
									<span class="more-branches">+{methodOptions[selectedMethod].selectedBranchCount - 5} more</span>
								{/if}
							</div>
						</div>
					{:else}
						<div class="no-selection-message">
							No branches selected. Click on tree branches to select them for testing.
						</div>
					{/if}
				{:else}
					<div class="no-tree-message">
						<div class="no-tree-icon">🌳</div>
						<div class="no-tree-text">
							<strong>No tree data available</strong>
							<p>Please upload a tree file or generate a neighbor-joining tree from your alignment data first.</p>
						</div>
					</div>
				{/if}
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

	.method-dropdown option:disabled {
		color: #a0aec0;
		background-color: #f7fafc;
		font-style: italic;
	}

	.method-description {
		font-size: 13px;
		color: #4a5568;
		margin-bottom: 24px;
		padding: 8px 0;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.coming-soon-badge {
		display: inline-flex;
		align-items: center;
		padding: 2px 8px;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 12px;
		font-size: 11px;
		font-weight: 500;
		color: #92400e;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.badge-text {
		line-height: 1;
	}

	.execution-mode-section {
		margin-bottom: 24px;
		padding: 16px 0;
		border-top: 1px solid #f7fafc;
	}

	.execution-mode-title {
		font-size: 13px;
		font-weight: 500;
		color: #4a5568;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 12px;
	}

	.execution-mode-options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.execution-mode-option {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.execution-mode-option:hover {
		border-color: #cbd5e0;
		background-color: #f7fafc;
	}

	.execution-mode-option:has(:checked) {
		border-color: #4299e1;
		background-color: #ebf8ff;
	}

	.execution-mode-option:has(:disabled) {
		opacity: 0.6;
		cursor: not-allowed;
		background-color: #f9fafb;
	}

	.execution-mode-radio {
		margin-top: 2px;
		cursor: pointer;
	}

	.execution-mode-radio:disabled {
		cursor: not-allowed;
	}

	.execution-mode-content {
		flex: 1;
	}

	.execution-mode-name {
		font-size: 14px;
		font-weight: 500;
		color: #2d3748;
		margin-bottom: 2px;
	}

	.execution-mode-desc {
		font-size: 12px;
		color: #718096;
	}

	.backend-status-warning {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
		padding: 8px 12px;
		background-color: #fef3cd;
		border: 1px solid #f59e0b;
		border-radius: 4px;
		font-size: 12px;
		color: #92400e;
	}

	.warning-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: #f59e0b;
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

	.option-description {
		font-size: 12px;
		color: #718096;
		margin-top: 4px;
		line-height: 1.4;
		font-style: italic;
	}

	.option-group.disabled {
		opacity: 0.5;
	}

	.option-group.disabled input,
	.option-group.disabled select {
		cursor: not-allowed;
	}

	.interactive-tree-section {
		margin-top: 24px;
		padding: 24px;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		background: #f7fafc;
	}

	.tree-section-header {
		margin-bottom: 20px;
	}

	.tree-section-title {
		font-size: 16px;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 8px;
	}

	.tree-section-description {
		font-size: 13px;
		color: #4a5568;
		margin: 0;
		line-height: 1.5;
	}

	.tree-selector-wrapper {
		border: 2px solid #cbd5e0;
		border-radius: 8px;
		background: white;
		overflow: hidden;
		margin-bottom: 16px;
	}

	.selection-summary {
		padding: 16px;
		background: #e6fffa;
		border: 1px solid #38b2ac;
		border-radius: 6px;
		font-size: 14px;
		color: #234e52;
	}

	.selected-branches-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 8px;
	}

	.branch-tag {
		display: inline-block;
		padding: 2px 8px;
		background: #38b2ac;
		color: white;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
	}

	.more-branches {
		display: inline-block;
		padding: 2px 8px;
		background: #718096;
		color: white;
		border-radius: 4px;
		font-size: 12px;
		font-style: italic;
	}

	.no-selection-message {
		padding: 20px;
		text-align: center;
		background: #f0f4f8;
		border: 1px dashed #cbd5e0;
		border-radius: 6px;
		color: #4a5568;
		font-style: italic;
	}

	.no-tree-message {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 24px;
		background: #f9fafb;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
	}

	.no-tree-icon {
		font-size: 32px;
		opacity: 0.5;
	}

	.no-tree-text strong {
		display: block;
		font-size: 14px;
		color: #2d3748;
		margin-bottom: 4px;
	}

	.no-tree-text p {
		margin: 0;
		font-size: 13px;
		color: #718096;
		line-height: 1.4;
	}
</style>
