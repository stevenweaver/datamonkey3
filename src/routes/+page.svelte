<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { aioliStore } from '../stores/aioli';
	import { alignmentFileStore, fileMetricsStore, persistentFileStore, currentFile } from '../stores/fileInfo';
	import { analysisStore, currentAnalysis, activeAnalysisProgress } from '../stores/analyses';
	import { treeStore, addTree, updateTaggedTree } from '../stores/tree';
	import Aioli from '@biowasm/aioli';
	import DataReaderResults from '../lib/dataReaderResults.svelte';
	import MethodSelector from '../lib/MethodSelector.svelte';
	import FileManager from '../lib/FileManager.svelte';
	import AnalysisHistory from '../lib/AnalysisHistory.svelte';
	import AnalysisResultViewer from '../lib/AnalysisResultViewer.svelte';
	import AnalysisProgress from '../lib/AnalysisProgress.svelte';
import EnhancedAnalysisProgress from '../lib/EnhancedAnalysisProgress.svelte';
	import AnalysisCompare from '../lib/AnalysisCompare.svelte';
	import BatchExport from '../lib/BatchExport.svelte';
	import ErrorHandler from '../lib/ErrorHandler.svelte';
	import FastaExport from '../lib/FastaExport.svelte';
	import TreeSelector from '../lib/TreeSelector.svelte';
	import MethodOptionsTab from '../lib/MethodOptionsTab.svelte';
	import DemoFileSelector from '../lib/DemoFileSelector.svelte';
import UnifiedAnalysisView from '../lib/UnifiedAnalysisView.svelte';

	import dataReader from '../data/datareader.bf?raw';

	import HyPhyGlobals from '../data/shared/HyPhyGlobals.ibf?raw';
	import chooseGeneticCode from '../data/shared/chooseGeneticCode.def?raw';
	import ReadDelimitedFiles from '../data/shared/ReadDelimitedFiles.bf?raw';
	import TreeTools from '../data/shared/TreeTools.ibf?raw';
	import NJ from '../data/shared/NJ.bf?raw';
	import PartitionReader from '../data/shared/PartitionReader.ibf?raw';
	import GrabBag from '../data/shared/GrabBag.bf?raw';

	let hyphyOut = '';
	let jsonOut;
	let jsonData;
	let trees = {};
	let loading = true;
	let cliObj;
	let result;
	let fileMetricsJSON;
	let selectedAnalysisId = null;
	let showAllHistory = false;
	let activeTab = 'data'; // 'data', 'tree', 'options', 'analysis', or 'compare'
	let selectedTree = 'nj';
	let selectedMethod = 'FEL'; // Default selected method for configuration
	let treeData = {};

	// Consolidating methods and hyphyCommands with descriptions
	const methodConfig = {
		aBSREL: {
			command: 'absrel',
			outputSuffix: 'ABSREL.json',
			url: 'absrel',
			args: [],
			description: 'A method for assessing the presence of positive selection.'
		},
		BGM: {
			command: 'bgm',
			outputSuffix: 'BGM.json',
			url: 'bgm',
			args: [],
			description: 'Bayesian graphical models for comparative analysis.'
		},
		BUSTED: {
			command: 'busted',
			outputSuffix: 'BUSTED.json',
			url: 'busted',
			args: [],
			description: 'A method for testing positive selection in gene families.'
		},
		'Contrast-FEL': {
			command: 'contrast-fel',
			outputSuffix: 'CFEL.json',
			url: 'contrast-fel',
			args: [],
			description: 'Estimates selection pressure on branches.'
		},
		FADE: {
			command: 'fade',
			outputSuffix: 'FADE.json',
			url: 'fade',
			args: [],
			description: 'Detects positive selection and adaptive evolution.'
		},
		FEL: {
			command: 'fel',
			outputSuffix: 'FEL.json',
			url: 'fel',
			args: [],
			description: 'Fixed Effects Likelihood for testing selection.'
		},
		FUBAR: {
			command: 'fubar',
			outputSuffix: 'FUBAR.json',
			url: 'fubar',
			args: [],
			description: 'Identifies positively selected sites.'
		},
		GARD: {
			command: 'gard',
			outputSuffix: 'GARD.json',
			url: 'gard',
			args: [],
			description: 'Detects recombination in sequences.'
		},
		MEME: {
			command: 'meme',
			outputSuffix: 'MEME.json',
			url: 'meme',
			args: [],
			description: 'Identifies episodic evolution.'
		},
		'MULTI-HIT': {
			command: 'fmm',
			outputSuffix: 'FMM.json',
			url: 'multhit',
			args: [],
			description: 'Analyzes multiple hits in evolution.'
		},
		NRM: {
			command: null,
			outputSuffix: 'NRM.json',
			url: 'nrm',
			args: [],
			description: 'Nonstationary rate mixture model.'
		},
		RELAX: {
			command: 'relax',
			outputSuffix: 'RELAX.json',
			url: 'relax',
			args: [],
			description: 'Tests for heterogeneous selection.'
		},
		SLAC: {
			command: 'slac',
			outputSuffix: 'SLAC.json',
			url: 'slac',
			args: [],
			description: 'Estimation of selection pressure.'
		}
	};

	// Select an analysis to view
	function selectAnalysis(analysisId) {
		selectedAnalysisId = analysisId;
		analysisStore.setCurrentAnalysis(analysisId);
	}

	// Run or rerun an analysis method
	async function runMethod(method, options = null) {
		try {
			// Extract the method name and options
			const methodName = typeof method === 'string' ? method : 'unknown';
			
			// Get method configuration
			const methodInfo = methodConfig[methodName];
			if (!methodInfo) {
				hyphyOut = `Error: Method ${methodName} is not found in configuration`;
				return;
			}
			
			const { command, outputSuffix } = methodInfo;
			
			if (!command) {
				hyphyOut = `Error: Method ${methodName} is not implemented yet`;
				return;
			}
			
			// Create an analysis record for tracking
			const currentFileId = $currentFile?.id;
			if (!currentFileId) {
				hyphyOut = 'Error: No file selected for analysis';
				return;
			}
			
			// Get the current file content
			file = await persistentFileStore.getFile(currentFileId);
			if (!file) {
				hyphyOut = 'Error: Unable to retrieve file content';
				return;
			}
			
			// Create a new analysis record
			const analysisId = await analysisStore.createAnalysis(currentFileId, methodName);
			console.log(`Created analysis ${analysisId} for method ${methodName}`);
			selectAnalysis(analysisId); // Select the new analysis immediately
			
			// Switch to the analysis tab to show the analysis in progress
			activeTab = 'analysis';
			
			// Initialize progress tracking
			analysisStore.startAnalysisProgress(analysisId, `Initializing ${methodName} analysis...`);
			
			// Add method-specific data if needed
			analysisStore.updateAnalysisProgress('mounting', 10, `Preparing files for ${methodName} analysis...`);
			let methodDependencies = getMethodDependencies(methodName);
			
			let inputFiles = await cliObj.mount([
				{ name: 'user.nex', data: await file.text() },
				...methodDependencies.map((dep) => ({ name: dep.name, data: dep.data }))
			]);
			
			// Show preparation message
			analysisStore.updateAnalysisProgress('running', 20, `Running ${methodName} analysis...`);

			// Prepare additional command line arguments if options are provided
			let cmdArgs = inputFiles[0];
			if (options && typeof options === 'object') {
				// Log the options for debugging
				console.log('Running with options:', options);
				
				// Add each option as a command line argument
				Object.entries(options).forEach(([key, value]) => {
					// Skip null or undefined values
					if (value === null || value === undefined) return;
					
					// Handle boolean values
					if (typeof value === 'boolean') {
						if (value) {
							cmdArgs += ` --${key}`;
						}
					} else {
						cmdArgs += ` --${key} ${value}`;
					}
				});
			}

			// Mounting input files for HyPhy execution
			const fullCommand = `hyphy LIBPATH=/shared/hyphy/ ${command} ${cmdArgs}`;
			console.log('Executing command:', fullCommand);
			result = await cliObj.exec(fullCommand);
			hyphyOut = await result.stdout;
			
			// Process log output to update progress indicators
			const lines = hyphyOut.split('\n');
			let progressEstimate = 20; // Start at 20%
			
			for (const line of lines) {
				// Increase progress based on line count, capped at 80%
				progressEstimate = Math.min(80, progressEstimate + 0.5);
				
				// Special progress markers
				if (line.includes('Phase 1')) {
					analysisStore.updateAnalysisProgress('running', 30, 'Phase 1: Model fitting...');
				} else if (line.includes('Phase 2')) {
					analysisStore.updateAnalysisProgress('running', 50, 'Phase 2: Site-by-site analysis...');
				} else if (line.includes('writing')) {
					analysisStore.updateAnalysisProgress('processing', 75, 'Processing results...');
				} else if (line.includes('error') || line.includes('Error')) {
					analysisStore.updateAnalysisProgress('error', progressEstimate, `Error: ${line}`);
				}
			}

			// Handle JSON output
			analysisStore.updateAnalysisProgress('processing', 85, 'Retrieving results...');
			const outputFile = `/shared/data/user.nex.${outputSuffix}`;
			const jsonBlob = await cliObj.download(outputFile);
			const response = await fetch(jsonBlob);
			const blob = await response.blob();
			jsonOut = await blob.text();
			
			try {
				jsonData = JSON.parse(jsonOut);
				analysisStore.updateAnalysisProgress('saving', 95, 'Saving analysis results...');
			} catch (error) {
				analysisStore.updateAnalysisProgress('error', 85, 'Failed to parse results');
				throw new Error('Failed to parse analysis results');
			}
			
			// Save the analysis result to IndexedDB with completed status
			const completionTimestamp = new Date().getTime();
			await analysisStore.updateAnalysis(analysisId, {
				status: 'completed', // Set status to completed
				result: jsonOut,
				completedAt: completionTimestamp,
				options: options // Save the options used for this analysis
			});
			
			// Make sure to update the analysis in the store directly for immediate UI refresh
			analysisStore.update(state => {
				const updatedAnalyses = state.analyses.map(a => 
					a.id === analysisId 
						? { 
							...a, 
							status: 'completed', 
							result: jsonOut, 
							completedAt: completionTimestamp,
							options: options
						} 
						: a
				);
				
				return {
					...state,
					analyses: updatedAnalyses
				};
			});
			
			// Complete progress tracking
			analysisStore.completeAnalysisProgress(true, `${methodName} analysis completed successfully.`);
			console.log(`Analysis ${analysisId} for method ${methodName} completed successfully`);
		} catch (error) {
			console.error(`Error running method ${typeof method === 'string' ? method : 'unknown'}:`, error);
			hyphyOut = `Error: ${error.message}`;
			
			// Update analysis with error
			if (analysisStore.currentAnalysisId) {
				await analysisStore.updateAnalysis(analysisStore.currentAnalysisId, {
					status: 'completed',
					result: JSON.stringify({ error: error.message })
				});
				
				// Update progress tracking
				analysisStore.completeAnalysisProgress(false, `Error: ${error.message}`);
			}
		}
	}

	// Get method-specific dependencies
	function getMethodDependencies(method) {
		switch (method) {
			case 'FEL':
			case 'BUSTED':
			case 'SLAC':
				return [];
			default:
				return [];
		}
	}

	// Track HyPhy progress from console output
	function updateHyphyProgress(payload) {
		if (payload.type === 'print') {
			// Update the console output
			console.log(payload.text);
			
			// Update progress indicator if we have an active analysis
			if ($activeAnalysisProgress.id && $activeAnalysisProgress.status === 'running') {
				// Extract meaningful messages
				const text = payload.text.trim();
				if (text && text.length > 5) { // Ignore short messages
					// Estimate progress based on various cues
					let progressUpdate = null;
					
					if (text.includes('Fitting')) {
						progressUpdate = { progress: 30, message: 'Fitting models...' };
					} else if (text.includes('Optimizing')) {
						progressUpdate = { progress: 40, message: 'Optimizing parameters...' };
					} else if (text.includes('Computing')) {
						progressUpdate = { progress: 60, message: 'Computing site rates...' };
					} else if (text.includes('Writing')) {
						progressUpdate = { progress: 80, message: 'Writing results...' };
					}
					
					// Update the progress if we found a meaningful message
					if (progressUpdate) {
						analysisStore.updateAnalysisProgress(
							'running',
							progressUpdate.progress,
							progressUpdate.message
						);
					}
					
					// For all console output, add to the log
					analysisStore.updateAnalysisProgress(
						$activeAnalysisProgress.status,
						$activeAnalysisProgress.progress,
						text
					);
				}
			}
		}
	}

	onMount(async () => {
		// Initialize Aioli for HyPhy
		cliObj = await new Aioli(
			{
				tool: 'hyphy',
				version: '2.5.63',
				urlPrefix: 'https://data.hyphy.org/web/biowasm'
			},
			{
				printInterleaved: false,
				callback: updateHyphyProgress
			}
		);

		aioliStore.set(cliObj);

		// Get HyPhy version
		result = await cliObj.exec('hyphy --version');
		hyphyOut = result.stdout;
		
		// Load any previously saved files from browser storage
		if (browser) {
			try {
				await persistentFileStore.loadFiles();
				await analysisStore.loadAnalyses();
				
				// If there are analyses, select the most recent one
				if ($analysisStore.analyses.length > 0) {
					const mostRecent = [...$analysisStore.analyses].sort((a, b) => b.createdAt - a.createdAt)[0];
					selectAnalysis(mostRecent.id);
				}
				
				// Load tree data from the store if available
				const storedTrees = $treeStore;
				if (storedTrees && Object.keys(storedTrees).length > 0) {
					trees = { ...storedTrees };
					treeData = { ...storedTrees };
				}
			} catch (error) {
				console.error('Error loading saved data:', error);
			}
		}
		
		loading = false;
	});

	let file;
	let isStdOutVisible = false; // New state for toggling stdout visibility
	let validationError = null;
	let showBatchExport = false;

	async function handleFileUpload(event) {
		try {
			// Check if this is a file selection event (from FileManager)
			if (event.isSelection) {
				console.log('File selected from FileManager:', event.fileId);
				
				// Set the file from the event
				file = event.file;
				
				// Try to find existing DATAREADER analysis for this file
				const existingAnalyses = $analysisStore.analyses.filter(
					a => a.fileId === event.fileId && a.method === 'datareader' && a.status === 'completed'
				);
				
				if (existingAnalyses.length > 0) {
					// Use the most recent completed analysis
					const mostRecentAnalysis = existingAnalyses.sort((a, b) => b.createdAt - a.createdAt)[0];
					console.log('Using existing DATAREADER analysis:', mostRecentAnalysis.id);
					
					// Load the file metrics from the existing analysis
					if (mostRecentAnalysis.result) {
						try {
							fileMetricsJSON = JSON.parse(mostRecentAnalysis.result);
							
							// Set the file and its metrics in the store
							fileMetricsStore.set(fileMetricsJSON);
							alignmentFileStore.set(file);
							
							// Extract trees
							trees['nj'] = fileMetricsJSON.FILE_INFO?.nj;
							if (fileMetricsJSON?.FILE_PARTITION_INFO) {
								trees['usertree'] = fileMetricsJSON.FILE_PARTITION_INFO['0'].usertree;
							}
							
							// Save extracted trees in treeData and update the tree store
							if (trees['nj']) {
								treeData = addTree('nj', trees['nj'], treeData);
							}
							if (trees['usertree']) {
								treeData = addTree('usertree', trees['usertree'], treeData);
							}
							
							// Select the existing analysis
							selectAnalysis(mostRecentAnalysis.id);
							
							// Switch to the data tab to show the file information
							activeTab = 'data';
							
							return; // Exit early since we've loaded existing analysis
						} catch (error) {
							console.error('Error parsing existing analysis:', error);
							// Continue with new analysis if parsing fails
						}
					}
				}
				
				// If we get here, either there was no existing analysis or there was an error loading it
				// Proceed with a new analysis using the selected file
			} else if (event.target && event.target.files) {
				// This is a new file upload
				file = event.target.files[0];
			}
			
			if (!file) return; // No file selected
			
			// Clear any previous errors
			validationError = null;
			
			// For new uploads, save the file to browser storage
			// For selections, this is already done
			let fileId;
			if (!event.isSelection) {
				fileId = await persistentFileStore.uploadFile(file);
			} else {
				fileId = event.fileId;
			}
			
			// Check if there's already a DATAREADER analysis for this file
			const existingDatareaderAnalyses = $analysisStore.analyses.filter(
				a => a.fileId === fileId && a.method === 'datareader' && a.status === 'completed'
			);
			
			let analysisId;
			
			if (existingDatareaderAnalyses.length > 0 && event.isSelection) {
				// Use the existing analysis
				analysisId = existingDatareaderAnalyses[0].id;
				console.log('Using existing DATAREADER analysis:', analysisId);
				
				// Load the file metrics from the existing analysis
				const existingAnalysis = await analysisStore.getAnalysis(analysisId);
				if (existingAnalysis && existingAnalysis.result) {
					fileMetricsJSON = JSON.parse(existingAnalysis.result);
					
					// Set the file and its metrics in the store
					fileMetricsStore.set(fileMetricsJSON);
					alignmentFileStore.set(file);
					
					// Extract trees
					trees['nj'] = fileMetricsJSON.FILE_INFO?.nj;
					if (fileMetricsJSON?.FILE_PARTITION_INFO) {
						trees['usertree'] = fileMetricsJSON.FILE_PARTITION_INFO['0'].usertree;
					}
					
					// Save extracted trees in treeData and update the tree store
					if (trees['nj']) {
						treeData = addTree('nj', trees['nj'], treeData);
					}
					if (trees['usertree']) {
						treeData = addTree('usertree', trees['usertree'], treeData);
					}
					
					// Select the existing analysis
					selectAnalysis(analysisId);
					
					// Switch to the data tab to show the file information
					activeTab = 'data';
					
					return; // Exit early since we've loaded existing analysis
				}
			}
			
			// Create a new analysis record and start progress tracking
			analysisId = await analysisStore.createAnalysis(fileId, 'datareader');
			analysisStore.startAnalysisProgress(analysisId, 'Initializing file analysis...');
			
			// Mount the file for analysis
			analysisStore.updateAnalysisProgress('mounting', 20, 'Mounting files for analysis...');
			let inputFiles = await cliObj.mount([
				{ name: 'user.nex', data: await file.text() },
				{ name: 'datareader.bf', data: dataReader },
				{ name: 'HyPhyGlobals.ibf', data: HyPhyGlobals },
				{ name: 'chooseGeneticCode.def', data: chooseGeneticCode },
				{ name: 'ReadDelimitedFiles.bf', data: ReadDelimitedFiles },
				{ name: 'TreeTools.ibf', data: TreeTools },
				{ name: 'NJ.bf', data: NJ },
				{ name: 'PartitionReader.ibf', data: PartitionReader },
				{ name: 'GrabBag.bf', data: GrabBag }
			]);

			// Run the datareader analysis
			analysisStore.updateAnalysisProgress('running', 40, 'Analyzing file structure...');
			result = await cliObj.exec('hyphy LIBPATH=/shared/hyphy/ ' + inputFiles[1]);
			hyphyOut = await result.stdout;
			
			// Process results
			analysisStore.updateAnalysisProgress('processing', 80, 'Processing file information...');
			const jsonBlob = await cliObj.download('/shared/data/results.json');
			const response = await fetch(jsonBlob);
			const blob = await response.blob();
			jsonOut = await blob.text();
			fileMetricsJSON = JSON.parse(jsonOut);

			// Set the file and its metrics in the store
			fileMetricsStore.set(fileMetricsJSON);
			alignmentFileStore.set(file);

			// Extract trees
			trees['nj'] = fileMetricsJSON.FILE_INFO?.nj;
			if (fileMetricsJSON?.FILE_PARTITION_INFO) {
				trees['usertree'] = fileMetricsJSON.FILE_PARTITION_INFO['0'].usertree;
			}

			// Save extracted trees in treeData and update the tree store
			if (trees['nj']) {
				treeData = addTree('nj', trees['nj'], treeData);
			}
			if (trees['usertree']) {
				treeData = addTree('usertree', trees['usertree'], treeData);
			}
			
			// Save the file metrics as an analysis result in IndexedDB
			analysisStore.updateAnalysisProgress('saving', 90, 'Saving file information...');
			const completionTimestamp = new Date().getTime();
			await analysisStore.updateAnalysis(analysisId, {
				status: 'completed',
				result: JSON.stringify(fileMetricsJSON),
				completedAt: completionTimestamp
			});
			
			// Make sure to update the analysis in the store directly for immediate UI refresh
			analysisStore.update(state => {
				const updatedAnalyses = state.analyses.map(a => 
					a.id === analysisId 
						? { ...a, status: 'completed', result: JSON.stringify(fileMetricsJSON), completedAt: completionTimestamp } 
						: a
				);
				
				return {
					...state,
					analyses: updatedAnalyses
				};
			});
			
			// Complete progress tracking
			analysisStore.completeAnalysisProgress(true, 'File analysis completed successfully.');
			
			// Select the new analysis
			selectAnalysis(analysisId);
			
			// Switch to the data tab to show the file information
			activeTab = 'data';
		} catch (error) {
			console.error('Error handling file upload:', error);
			hyphyOut = `Error: ${error.message}`;
			
			// Update progress tracking
			analysisStore.completeAnalysisProgress(false, `Error: ${error.message}`);
			
			// Set validation error for display
			validationError = {
				code: 'FASTA-999',
				message: 'File processing error',
				details: error.message,
				type: {
					code: 'FASTA-999',
					message: 'File processing error'
				}
			};
		}
	}

	// Toggle the stdout visibility
	const toggleStdOut = () => {
		isStdOutVisible = !isStdOutVisible;
	};
	
	// Toggle showing all history vs. just current file
	const toggleHistoryView = () => {
		showAllHistory = !showAllHistory;
	};
	
	// Toggle batch export view
	const toggleBatchExport = () => {
		showBatchExport = !showBatchExport;
	};
	
	// Handle validation results
	function handleValidated(event) {
		const results = event.detail;
		
		if (!results.valid && results.errors.length > 0) {
			validationError = results.errors[0];
		} else {
			validationError = null;
		}
	}
	
	// Handle using repaired FASTA file
	function handleUseRepaired(event) {
		const { content, name } = event.detail;
		
		if (content) {
			// Create a new file object from the repaired content
			const repairedFile = new File([content], name, {
				type: 'application/octet-stream'
			});
			
			// Process the repaired file
			file = repairedFile;
			handleFileUpload({ target: { files: [repairedFile] } });
		}
	}
	
	// Handle demo file selection
	function handleDemoFileSelect(event) {
		const { file } = event.detail;
		
		if (file) {
			// Process the demo file
			handleFileUpload({ target: { files: [file] } });
		}
	}

	// Handle tree selection changes
	function handleTreeChange(newTreeId, taggedNewick) {
		selectedTree = newTreeId;
		
		// Update tree data in store if we have a tagged Newick
		if (taggedNewick) {
			treeData = updateTaggedTree(newTreeId, taggedNewick, treeData);
		}
	}
</script>

<div class="container mx-auto p-8">
	{#if loading}
		<div class="flex h-screen flex-col items-center justify-center">
			<div class="loader mb-4"></div>
			<p class="text-xl">Loading HyPhy...</p>
		</div>
	{:else}
		<div class="pb-8">
			<h1 class="mb-4 text-2xl font-bold">FASTA Validation and Analysis</h1>
			
			<div class="file-section mb-6">
				<!-- File upload and controls -->
				<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
					<div>
						<label for="file-upload" class="mb-1 block font-medium">Upload File:</label>
						<input id="file-upload" type="file" on:change={handleFileUpload} class="file-input" />
						
						<!-- Demo file selector -->
						<DemoFileSelector on:selectFile={handleDemoFileSelect} on:error={(e) => validationError = { message: e.detail.message }} />
					</div>
					
					<div class="flex items-center gap-2">
						<button 
							on:click={toggleHistoryView} 
							class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
						>
							{showAllHistory ? 'Current File Only' : 'All Files'}
						</button>
						
						<button 
							on:click={toggleBatchExport} 
							class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
						>
							{showBatchExport ? 'Hide Batch Export' : 'Batch Export'}
						</button>
					</div>
				</div>
				
				<!-- Error display -->
				<ErrorHandler 
					error={validationError} 
					level="error"
					on:dismiss={() => validationError = null}
				/>
				
				<!-- Enhanced file management -->
				<FileManager onSelectFile={handleFileUpload} />
				
				<!-- Analysis Progress Indicator -->
				<EnhancedAnalysisProgress />
				
				<!-- Batch Export (conditional) -->
				{#if showBatchExport}
					<BatchExport />
				{/if}
				
				<!-- Main Tabbed Interface -->
				<div class="mt-6 mb-4 border-b border-gray-300">
					<div class="flex">
						<button
							class="border-b-2 px-4 py-2 font-medium transition-colors"
							class:border-blue-500={activeTab === 'data'}
							class:text-blue-600={activeTab === 'data'}
							class:border-transparent={activeTab !== 'data'}
							class:text-gray-500={activeTab !== 'data'}
							on:click={() => activeTab = 'data'}
						>
							File Data
						</button>
						<button
							class="border-b-2 px-4 py-2 font-medium transition-colors"
							class:border-blue-500={activeTab === 'tree'}
							class:text-blue-600={activeTab === 'tree'}
							class:border-transparent={activeTab !== 'tree'}
							class:text-gray-500={activeTab !== 'tree'}
							on:click={() => activeTab = 'tree'}
						>
							Tree View
						</button>
						<button
							class="border-b-2 px-4 py-2 font-medium transition-colors"
							class:border-blue-500={activeTab === 'options'}
							class:text-blue-600={activeTab === 'options'}
							class:border-transparent={activeTab !== 'options'}
							class:text-gray-500={activeTab !== 'options'}
							on:click={() => activeTab = 'options'}
						>
							Analysis Options
						</button>
						<button
							class="border-b-2 px-4 py-2 font-medium transition-colors"
							class:border-blue-500={activeTab === 'analysis'}
							class:text-blue-600={activeTab === 'analysis'}
							class:border-transparent={activeTab !== 'analysis'}
							class:text-gray-500={activeTab !== 'analysis'}
							on:click={() => activeTab = 'analysis'}
						>
							Results
						</button>
						<button
							class="border-b-2 px-4 py-2 font-medium transition-colors"
							class:border-blue-500={activeTab === 'compare'}
							class:text-blue-600={activeTab === 'compare'}
							class:border-transparent={activeTab !== 'compare'}
							class:text-gray-500={activeTab !== 'compare'}
							on:click={() => activeTab = 'compare'}
						>
							Compare
						</button>
					</div>
				</div>
				
				<!-- Tab Content -->
				<div class="tab-content mt-4">
					{#if activeTab === 'data'}
						<!-- Data Tab: File Information -->
						<div class="data-view">
							{#if fileMetricsJSON}
								<DataReaderResults {fileMetricsJSON} />
								<FastaExport {fileMetricsJSON} />
							{:else}
								<div class="rounded border border-gray-200 bg-gray-50 p-6 text-center">
									<p class="text-lg text-gray-600">Upload a file to view its information</p>
								</div>
							{/if}
						</div>
					{:else if activeTab === 'tree'}
						<!-- Tree Tab: Tree Visualization -->
						<div class="tree-view">
							{#if $currentFile && Object.keys(trees).length > 0}
								<TreeSelector 
									trees={trees} 
									selectedTree={selectedTree}
									onChange={handleTreeChange}
								/>
							{:else}
								<div class="rounded border border-gray-200 bg-gray-50 p-6 text-center">
									<p class="text-lg text-gray-600">Upload a file to view and manipulate phylogenetic trees</p>
								</div>
							{/if}
						</div>
					{:else if activeTab === 'options'}
						<!-- Options Tab: Analysis Options -->
						<div class="options-view">
							{#if $currentFile}
								<MethodOptionsTab {runMethod} {selectedMethod} />
							{:else}
								<div class="rounded border border-gray-200 bg-gray-50 p-6 text-center">
									<p class="text-lg text-gray-600">Upload a file to configure analysis options</p>
								</div>
							{/if}
						</div>
					{:else if activeTab === 'analysis'}
						<!-- Analysis Tab: Results View using UnifiedAnalysisView component -->
						<UnifiedAnalysisView
							{methodConfig}
							{runMethod}
							showAllHistory={!showAllHistory}
							currentFile={$currentFile}
							{hyphyOut}
							{toggleStdOut}
							{isStdOutVisible}
							{selectedAnalysisId}
							{selectAnalysis}
							onConfigureMethod={(method) => {
								// Set the active tab to 'options' 
								activeTab = 'options';
								// Set the selected method in the state for MethodOptionsTab
								selectedMethod = method;
								console.log(`Switching to configure ${method}`);
							}}
						/>
					{:else if activeTab === 'compare'}
						<!-- Compare Tab: Analysis Comparison -->
						<div class="comparison-view">
							<AnalysisCompare />
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.loader {
		border: 16px solid #f3f3f3;
		border-top: 16px solid #3498db;
		border-radius: 50%;
		width: 120px;
		height: 120px;
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	
	.file-input {
		border: 1px solid #e2e8f0;
		padding: 0.5rem;
		border-radius: 0.25rem;
		background-color: white;
	}
	
	.code-output {
		font-family: monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}
	
	/* Responsive adjustments */
	@media (max-width: 1023px) {
		.main-content > div {
			margin-bottom: 2rem;
		}
	}
</style>