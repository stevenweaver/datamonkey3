<script>
	import { onMount } from 'svelte';
	import { currentFile } from '../stores/fileInfo';
	import { persistentFileStore } from '../stores/fileInfo';
	import { analysisStore, activeAnalysisProgress } from '../stores/analyses';
	import { treeStore } from '../stores/tree';
	import {
		backendConnectivity,
		initializeBackendConnectivity
	} from '../stores/backendConnectivity.js';
	import MethodSelector from './MethodSelector.svelte';
	import AnalysisTimingEstimate from './AnalysisTimingEstimate.svelte';
	import FileIndicator from './FileIndicator.svelte';
	import TabNavigation from './TabNavigation.svelte';
	import TreePrompt from './TreePrompt.svelte';
	import TreeSourceSelector from './TreeSourceSelector.svelte';
	import backendAnalysisRunner from './services/BackendAnalysisRunner.js';
	import wasmAnalysisRunner from './services/WasmAnalysisRunner.js';

	// Props
	export let methodConfig = {};
	export let runMethod = () => {};
	export let selectedMethod = 'FEL'; // Default method for configuration
	export let hyphyOut = '';
	export let isStdOutVisible = false;
	export let toggleStdOut = () => {};

	// Tab navigation
	export let activeTab = 'analyze';
	export let onChange = (tab) => {};

	// Local state
	let analysisSectionExpanded = true;

	// Tree detection
	$: hasTree = $treeStore && ($treeStore.nj || $treeStore.usertree);

	// Tree inference state
	let treeGenerated = false;

	// Track current method selection and options for timing estimates
	let currentSelectedMethod = null;
	let currentMethodOptions = {};
	let currentGeneticCode = 'Universal';
	let currentExecutionMode = 'local';

	// Handle method selection changes from MethodSelector
	function handleMethodChange(event) {
		const { method, options, geneticCode, executionMode } = event.detail;
		currentSelectedMethod = method;
		currentMethodOptions = options || {};
		currentGeneticCode = geneticCode || 'Universal';
		currentExecutionMode = executionMode || 'local';
	}

	// Enhanced runMethod that handles both local and backend execution
	async function enhancedRunMethod(method, config) {
		try {
			if (config.executionMode === 'backend') {
				// Backend execution
				if (!$backendConnectivity.isConnected) {
					throw new Error('Backend server is not connected');
				}

				// Check if we have a current file selected
				if (!$currentFile || !$currentFile.id) {
					throw new Error('No file selected for analysis');
				}

				// Get full file data including content from storage
				const fullFileData = await persistentFileStore.getFile($currentFile.id);
				if (!fullFileData) {
					throw new Error('Unable to load file data');
				}

				// Convert file to text to get FASTA data
				const fastaData = await fullFileData.text();
				if (!fastaData || !fastaData.trim()) {
					throw new Error('No sequence data available in selected file');
				}

				// Get tree data based on user's selection
				const treeData = getSelectedTreeData();
				if (!treeData) {
					const treeSourceName =
						selectedTreeSource === 'uploaded'
							? 'uploaded tree'
							: selectedTreeSource === 'inferred'
								? 'neighbor-joining tree'
								: 'uploaded tree file';
					throw new Error(
						`No ${treeSourceName} available. Please select a different tree source or upload a tree.`
					);
				}

				console.log('📤 Submitting to backend with data:', {
					method,
					fastaLength: fastaData.length,
					treeLength: treeData.length,
					fileName: $currentFile.filename
				});

				const result = await backendAnalysisRunner.runAnalysis(
					method,
					config,
					fastaData,
					treeData,
					$currentFile?.id
				);
				console.log('✅ Backend analysis submitted:', result);
			} else {
				// Local WASM execution
				if (!$currentFile || !$currentFile.id) {
					throw new Error('No file selected for analysis');
				}

				// Get full file data including content from storage
				const fullFileData = await persistentFileStore.getFile($currentFile.id);
				if (!fullFileData) {
					throw new Error('Unable to load file data');
				}

				// Convert file to text to get FASTA data
				const fastaData = await fullFileData.text();
				if (!fastaData || !fastaData.trim()) {
					throw new Error('No sequence data available in selected file');
				}

				// Get tree data based on user's selection
				let treeData = getSelectedTreeData();

				// Check if we have interactive branch selection with tagged tree
				console.log('🔍 METHOD CONFIG DEBUG:', { method, config });
				if (config.branchesToTest === 'Interactive' && config.interactiveTree) {
					console.log('🌳 Using tagged tree from interactive selection');
					console.log('Tagged tree length:', config.interactiveTree.length);
					console.log('Tagged tree preview:', config.interactiveTree.substring(0, 300));
					console.log('Tagged tree has {FG}:', config.interactiveTree.includes('{FG}'));
					treeData = config.interactiveTree;
				} else {
					console.log('🌳 Using original tree data from tree store');
					console.log('Original tree length:', treeData.length);
					console.log('Original tree preview:', treeData.substring(0, 200));
				}

				if (!treeData) {
					const treeSourceName =
						selectedTreeSource === 'uploaded'
							? 'uploaded tree'
							: selectedTreeSource === 'inferred'
								? 'neighbor-joining tree'
								: 'uploaded tree file';
					throw new Error(
						`No ${treeSourceName} available. Please select a different tree source or upload a tree.`
					);
				}

				console.log('🖥️ Submitting to WASM with data:', {
					method,
					fastaLength: fastaData.length,
					treeLength: treeData.length,
					fileName: $currentFile.filename,
					selectedTreeSource,
					branchesToTest: config.branchesToTest,
					hasTaggedTree: treeData.includes('{FG}')
				});

				const result = await wasmAnalysisRunner.runAnalysis(
					method,
					config,
					fastaData,
					treeData,
					$currentFile?.id
				);
				console.log('✅ WASM analysis completed:', result);
			}
		} catch (error) {
			console.error('❌ Analysis execution failed:', error);
			// Could show error notification to user
			alert(`Analysis failed: ${error.message}`);
		}
	}

	// Initialize backend connectivity on mount
	onMount(() => {
		initializeBackendConnectivity();
	});

	// Handle tree generation prompt
	function handleGenerateTreeClick() {
		// Navigate to the Data tab
		onChange('data');
	}

	// Handle tree generation completion
	function handleTreeGenerated() {
		treeGenerated = true;
	}

	// Handle tree source change from TreeSourceSelector
	function handleTreeSourceChange(event) {
		const { treeSource, hasUploadedTree, hasInferredTree, uploadedFile } = event.detail;
		console.log('Tree source changed:', {
			treeSource,
			hasUploadedTree,
			hasInferredTree,
			uploadedFile
		});
		selectedTreeSource = treeSource;

		// If there's an uploaded file in the event, store it
		if (uploadedFile) {
			uploadedTreeFile = { content: null, file: uploadedFile };
		}
	}

	// Handle file upload from TreeSourceSelector
	async function handleFileUploaded(event) {
		const { file, treeSource } = event.detail;
		console.log('Tree file uploaded:', { file, treeSource });

		try {
			// Read the file content
			const content = await file.text();
			uploadedTreeFile = { content, file };
			selectedTreeSource = 'upload-new';
			console.log('Tree file content loaded:', content.substring(0, 100) + '...');
		} catch (error) {
			console.error('Failed to read tree file:', error);
			alert('Failed to read tree file. Please ensure it is a valid Newick format file.');
		}
	}

	// Tree source selection state
	let selectedTreeSource = 'inferred'; // 'uploaded' | 'inferred' | 'upload-new'
	let uploadedTreeFile = null;

	// Calculate tree state for TreeSourceSelector
	$: hasUploadedTree = $treeStore && $treeStore.usertree;
	$: hasInferredTree = $treeStore && $treeStore.nj;

	// Get tree data based on user's selection
	function getSelectedTreeData() {
		switch (selectedTreeSource) {
			case 'uploaded':
				return $treeStore?.usertree || '';
			case 'inferred':
				return $treeStore?.nj || '';
			case 'upload-new':
				return uploadedTreeFile?.content || '';
			default:
				return '';
		}
	}

	// Toggle analysis section
	function toggleAnalysisSection() {
		analysisSectionExpanded = !analysisSectionExpanded;
	}
</script>

<div class="analyze-tab">
	<!-- File Indicator (visible when a file is selected) -->
	<FileIndicator />

	<!-- Tree Prompt (shown if no tree is available) -->
	<TreePrompt onGenerateClick={handleGenerateTreeClick} />

	<!-- Tree Source Selector -->
	{#if $currentFile}
		<div class="mb-premium-xl">
			<h2 class="mb-premium-md text-premium-header font-semibold text-text-rich">
				<span class="mr-premium-xs">🌳</span> Phylogenetic Tree
			</h2>

			<!-- Development Preview Banner -->
			<div class="mb-premium-md rounded-premium border border-amber-200 bg-amber-50 p-premium-sm">
				<p class="flex items-center text-premium-caption text-amber-800">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-4 w-4 flex-shrink-0"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>
						<strong>Development Preview:</strong> The tree inference functionality is currently simulated
						for UI demonstration purposes. Backend implementation coming soon.
					</span>
				</p>
			</div>

			<div
				class="rounded-premium border border-border-platinum bg-white p-premium-lg shadow-premium"
			>
				<TreeSourceSelector
					{hasUploadedTree}
					{hasInferredTree}
					bind:treeSource={selectedTreeSource}
					disabled={false}
					on:treeSourceChange={handleTreeSourceChange}
					on:fileUploaded={handleFileUploaded}
				/>
			</div>
		</div>
	{/if}

	<!-- Analysis Section (expanded by default) -->
	<div class="mb-premium-xl rounded-premium border border-border-platinum bg-white shadow-premium">
		<div
			class="flex cursor-pointer items-center justify-between rounded-t-premium bg-brand-whisper p-premium-md transition-all duration-premium hover:bg-brand-ghost"
			on:click={toggleAnalysisSection}
		>
			<h2 class="text-premium-header font-semibold text-text-rich">Analysis</h2>
			<div class="flex items-center">
				{#if $currentFile}
					<button
						on:click={(e) => {
							e.stopPropagation();
							toggleStdOut();
						}}
						class="mr-premium-md rounded-premium-sm bg-brand-royal px-premium-md py-premium-xs text-premium-meta font-medium text-white transition-all duration-premium hover:bg-brand-deep"
					>
						{isStdOutVisible ? 'Hide Console' : 'Show Console'}
					</button>
				{/if}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-brand-royal transition-transform duration-premium"
					class:rotate-180={analysisSectionExpanded}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</div>
		</div>

		{#if analysisSectionExpanded}
			<div class="p-premium-lg">
				{#if $currentFile}
					<!-- Method Selector -->
					<MethodSelector
						{methodConfig}
						runMethod={enhancedRunMethod}
						on:methodChange={handleMethodChange}
					/>

					<!-- Analysis Timing Estimate -->
					{#if currentSelectedMethod}
						<div class="mt-premium-md">
							<AnalysisTimingEstimate
								method={currentSelectedMethod}
								methodOptions={currentMethodOptions}
								geneticCode={currentGeneticCode}
								executionMode={currentExecutionMode === 'local' ? 'wasm' : 'backend'}
							/>
						</div>
					{/if}

					<!-- Console output (conditionally shown) -->
					{#if isStdOutVisible}
						<div class="mt-premium-md">
							<h3 class="mb-premium-sm text-premium-title font-semibold text-text-rich">
								Console Output
							</h3>
							<pre
								class="code-output h-48 overflow-auto rounded-premium bg-text-rich p-premium-md text-premium-meta text-white text-opacity-90">{hyphyOut}</pre>
						</div>
					{/if}
				{:else if $persistentFileStore && $persistentFileStore.files && $persistentFileStore.files.length > 0}
					<div
						class="rounded-premium border border-border-platinum bg-brand-whisper p-premium-xl text-center"
					>
						<p class="text-premium-body text-text-slate">
							Select a file from the list to run analyses
						</p>
					</div>
				{:else}
					<div
						class="rounded-premium border border-border-platinum bg-brand-whisper p-premium-xl text-center"
					>
						<p class="text-premium-body text-text-slate">
							Upload a file in the Data tab to run analyses
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Tab Navigation -->
	<TabNavigation {activeTab} {onChange} />
</div>

<style>
	.code-output {
		font-family: monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
