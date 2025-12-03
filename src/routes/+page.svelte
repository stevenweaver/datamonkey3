<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { aioliStore } from '../stores/aioli';
	import {
		alignmentFileStore,
		fileMetricsStore,
		persistentFileStore,
		currentFile
	} from '../stores/fileInfo';
	import { analysisStore, currentAnalysis, activeAnalysisProgress, activeAnalyses } from '../stores/analyses';
	import { backendAnalysisRunner } from '../lib/services/BackendAnalysisRunner.js';
	import { treeStore, addTree, updateTaggedTree } from '../stores/tree';
	import Aioli from '@biowasm/aioli';
	import TreeSelector from '../lib/TreeSelector.svelte';
	import ErrorHandler from '../lib/ErrorHandler.svelte';
	import DemoFileSelector from '../lib/DemoFileSelector.svelte';

	// New tabbed structure components
	import DataTab from '../lib/DataTab.svelte';
	import AnalyzeTab from '../lib/AnalyzeTab.svelte';
	import ResultsTab from '../lib/ResultsTab.svelte';
	import PremiumTabNavigation from '../lib/PremiumTabNavigation.svelte';
	import SmartTabNavigation from '../lib/SmartTabNavigation.svelte';
	import StepNavigation from '../lib/StepNavigation.svelte';

	// Import HyPhy dependencies
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
	let activeTab = 'data'; // 'data', 'analyze', or 'results'
	let selectedTree = 'nj';
	let selectedMethod = 'FEL'; // Default selected method for configuration
	let treeData = {};
	let showBatchExport = false;

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
			activeTab = 'analyze';

			// Initialize progress tracking
			analysisStore.startAnalysisProgress(
				analysisId,
				`Initializing ${methodName} analysis...`,
				methodName,
				{ executionMode: 'wasm' }
			);

			// Add method-specific data if needed
			analysisStore.updateAnalysisProgressById(
				analysisId,
				'mounting',
				10,
				`Preparing files for ${methodName} analysis...`
			);
			let methodDependencies = getMethodDependencies(methodName);

			let inputFiles = await cliObj.mount([
				{ name: 'user.nex', data: await file.text() },
				...methodDependencies.map((dep) => ({ name: dep.name, data: dep.data }))
			]);

			// Show preparation message
			analysisStore.updateAnalysisProgressById(
				analysisId,
				'running',
				20,
				`Running ${methodName} analysis...`
			);

			// Prepare additional command line arguments if options are provided
			let cmdArgs = inputFiles[0];
			if (options && typeof options === 'object') {
				// Log the options for debugging
				console.log('Running with options:', options);

				// Add each option as a command line argument
				Object.entries(options).forEach(([key, value]) => {
					// Skip null or undefined values
					if (value === null || value === undefined) return;

					// Skip method-specific metadata
					if (key === 'method' || key === 'executionMode') return;

					// Map parameter names to HyPhy expected names
					let paramName = key;
					if (key === 'geneticCode') {
						paramName = 'code';
					}

					// Handle boolean values
					if (typeof value === 'boolean') {
						if (value) {
							cmdArgs += ` --${paramName}`;
						}
					} else {
						cmdArgs += ` --${paramName} ${value}`;
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
					analysisStore.updateAnalysisProgressById(
						analysisId,
						'running',
						30,
						'Phase 1: Model fitting...'
					);
				} else if (line.includes('Phase 2')) {
					analysisStore.updateAnalysisProgressById(
						analysisId,
						'running',
						50,
						'Phase 2: Site-by-site analysis...'
					);
				} else if (line.includes('writing')) {
					analysisStore.updateAnalysisProgressById(
						analysisId,
						'processing',
						75,
						'Processing results...'
					);
				} else if (line.includes('error') || line.includes('Error')) {
					analysisStore.updateAnalysisProgressById(
						analysisId,
						'error',
						progressEstimate,
						`Error: ${line}`
					);
				}
			}

			// Handle JSON output
			analysisStore.updateAnalysisProgressById(
				analysisId,
				'processing',
				85,
				'Retrieving results...'
			);
			const outputFile = `/shared/data/user.nex.${outputSuffix}`;
			const jsonBlob = await cliObj.download(outputFile);
			const response = await fetch(jsonBlob);
			const blob = await response.blob();
			jsonOut = await blob.text();

			try {
				jsonData = JSON.parse(jsonOut);
				analysisStore.updateAnalysisProgressById(
					analysisId,
					'saving',
					95,
					'Saving analysis results...'
				);
			} catch (error) {
				analysisStore.updateAnalysisProgressById(
					analysisId,
					'error',
					85,
					'Failed to parse results'
				);
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
			analysisStore.update((state) => {
				const updatedAnalyses = state.analyses.map((a) =>
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
			analysisStore.completeAnalysisProgress(
				true,
				`${methodName} analysis completed successfully.`
			);
			console.log(`Analysis ${analysisId} for method ${methodName} completed successfully`);

			// Switch to results tab when analysis completes
			activeTab = 'results';
		} catch (error) {
			console.error(
				`Error running method ${typeof method === 'string' ? method : 'unknown'}:`,
				error
			);
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
				if (text && text.length > 5) {
					// Ignore short messages
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
						analysisStore.updateAnalysisProgressById(
							$activeAnalysisProgress.id,
							'running',
							progressUpdate.progress,
							progressUpdate.message
						);
					}

					// For all console output, add to the log
					analysisStore.updateAnalysisProgressById(
						$activeAnalysisProgress.id,
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
				// Clean up any WASM analyses that were interrupted by a previous page refresh
				await analysisStore.cleanupInterruptedAnalyses();

				await persistentFileStore.loadFiles();
				await analysisStore.loadAnalyses();

				// Attempt to reconnect to any backend jobs that were running before page refresh
				const backendToReconnect = await analysisStore.attemptBackendReconnection();
				if (backendToReconnect && backendToReconnect.length > 0) {
					console.log(`🔄 Attempting to reconnect to ${backendToReconnect.length} backend job(s)`);
					await backendAnalysisRunner.reconnectToJobs(backendToReconnect);
				}

				// If there are analyses, select the most recent one
				if ($analysisStore.analyses.length > 0) {
					const mostRecent = [...$analysisStore.analyses].sort(
						(a, b) => b.createdAt - a.createdAt
					)[0];
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
	let isStdOutVisible = false; // State for toggling stdout visibility
	let validationError = null;

	async function handleFileUpload(event) {
		try {
			// Check if this is a file selection event (from FileManager)
			if (event.isSelection) {
				console.log('File selected from FileManager:', event.fileId);

				// Set the file from the event
				file = event.file;

				// Try to find existing DATAREADER analysis for this file
				const existingAnalyses = $analysisStore.analyses.filter(
					(a) => a.fileId === event.fileId && a.method === 'datareader' && a.status === 'completed'
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
				// Pass any metadata from demo files
				const metadata = event.isDemo ? event.metadata : {};
				fileId = await persistentFileStore.uploadFile(file, metadata);
			} else {
				fileId = event.fileId;
			}

			// Check if there's already a DATAREADER analysis for this file
			const existingDatareaderAnalyses = $analysisStore.analyses.filter(
				(a) => a.fileId === fileId && a.method === 'datareader' && a.status === 'completed'
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
			analysisStore.updateAnalysisProgressById(
				analysisId,
				'mounting',
				20,
				'Mounting files for analysis...'
			);
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
			analysisStore.updateAnalysisProgressById(
				analysisId,
				'running',
				40,
				'Analyzing file structure...'
			);
			result = await cliObj.exec('hyphy LIBPATH=/shared/hyphy/ ' + inputFiles[1]);
			hyphyOut = await result.stdout;

			// Process results
			analysisStore.updateAnalysisProgressById(
				analysisId,
				'processing',
				80,
				'Processing file information...'
			);
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
			analysisStore.updateAnalysisProgressById(
				analysisId,
				'saving',
				90,
				'Saving file information...'
			);
			const completionTimestamp = new Date().getTime();
			await analysisStore.updateAnalysis(analysisId, {
				status: 'completed',
				result: JSON.stringify(fileMetricsJSON),
				completedAt: completionTimestamp
			});

			// Make sure to update the analysis in the store directly for immediate UI refresh
			analysisStore.update((state) => {
				const updatedAnalyses = state.analyses.map((a) =>
					a.id === analysisId
						? {
								...a,
								status: 'completed',
								result: JSON.stringify(fileMetricsJSON),
								completedAt: completionTimestamp
							}
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
		const { file, metadata } = event.detail;

		if (file) {
			// Process the demo file
			handleFileUpload({
				target: { files: [file] },
				isSelection: false,
				isDemo: true,
				metadata
			});
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

	// Handle tab switching events from child components
	function handleSwitchTab(event) {
		if (event.detail && event.detail.tabName) {
			activeTab = event.detail.tabName;

			// If we have an analysis ID, select it
			if (event.detail.analysisId) {
				selectAnalysis(event.detail.analysisId);
			}

			// Handle re-run: set the method and file for the Analyze tab
			if (event.detail.rerun && event.detail.tabName === 'analyze') {
				// Set the method if provided
				if (event.detail.method) {
					selectedMethod = event.detail.method.toUpperCase();
				}

				// Set the current file if provided
				if (event.detail.fileId) {
					persistentFileStore.setCurrentFile(event.detail.fileId);
				}
			}
		}
	}

	// Handle page unload warning for running analyses
	function handleBeforeUnload(event) {
		// Check if there are any running analyses (WASM or backend)
		let hasRunningWasmAnalyses = false;
		let hasRunningBackendAnalyses = false;
		const unsubscribe = activeAnalyses.subscribe((active) => {
			hasRunningWasmAnalyses = active.some(
				(a) =>
					a.metadata?.executionMode === 'wasm' &&
					!['completed', 'error', 'cancelled', 'interrupted'].includes(a.status)
			);
			hasRunningBackendAnalyses = active.some(
				(a) =>
					a.metadata?.executionMode === 'backend' &&
					!['completed', 'error', 'cancelled', 'interrupted', 'connection_lost'].includes(a.status)
			);
		});
		unsubscribe();

		if (hasRunningWasmAnalyses) {
			// Standard way to trigger browser's leave confirmation dialog
			event.preventDefault();
			// Modern browsers require returnValue to be set
			event.returnValue = 'You have running analyses that will be interrupted if you leave.';
			return event.returnValue;
		}

		// For backend analyses, show a less severe warning (they can be reconnected)
		if (hasRunningBackendAnalyses) {
			event.preventDefault();
			event.returnValue =
				'You have backend analyses running. They will continue on the server, but you may need to wait for reconnection.';
			return event.returnValue;
		}
	}

	// Set up beforeunload handler
	if (browser) {
		window.addEventListener('beforeunload', handleBeforeUnload);
	}

	// Clean up beforeunload handler on component destroy
	onDestroy(() => {
		if (browser) {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		}
	});
</script>

<svelte:window on:switchTab={handleSwitchTab} />

<div class="container mx-auto min-h-screen bg-brand-ghost">
	{#if loading}
		<div class="flex h-screen flex-col items-center justify-center px-4">
			<div class="loader mb-premium-md"></div>
			<p class="text-lg font-semibold text-brand-royal sm:text-premium-header">Loading HyPhy...</p>
		</div>
	{:else}
		<div class="pb-6 sm:pb-premium-xl">
			<h1
				class="mb-4 text-xl font-bold tracking-premium-tight text-text-rich sm:mb-premium-xl sm:text-premium-headline"
			>
				Sequence Analysis Platform
			</h1>

			<!-- Main Tabbed Interface with Smart Navigation -->
			<SmartTabNavigation
				{activeTab}
				showRunningIndicator={$activeAnalysisProgress.id &&
					$activeAnalysisProgress.status !== 'completed'}
				onChange={(tab) => (activeTab = tab)}
			/>

			<!-- Tab Content with Progressive Enhancement -->
			{#if activeTab === 'data'}
				<!-- Data Tab -->
				<DataTab
					{handleFileUpload}
					{handleDemoFileSelect}
					{validationError}
					{fileMetricsJSON}
					{handleValidated}
					{handleUseRepaired}
					{activeTab}
					onChange={(tab) => (activeTab = tab)}
				/>
			{:else if activeTab === 'analyze'}
				<!-- Analyze Tab -->
				<AnalyzeTab
					{methodConfig}
					{runMethod}
					{selectedMethod}
					{hyphyOut}
					{isStdOutVisible}
					{toggleStdOut}
					{showAllHistory}
					{selectAnalysis}
					{activeTab}
					onChange={(tab) => (activeTab = tab)}
				/>
			{:else if activeTab === 'results'}
				<!-- Results Tab -->
				<ResultsTab
					{selectedAnalysisId}
					{selectAnalysis}
					{showAllHistory}
					{showBatchExport}
					{toggleBatchExport}
					{activeTab}
					onChange={(tab) => (activeTab = tab)}
				/>
			{/if}
		</div>
	{/if}
</div>

<style>
	.loader {
		border: 16px solid var(--tw-border-platinum, #f1f5f9);
		border-top: 16px solid var(--tw-brand-royal, #7c3aed);
		border-radius: 50%;
		width: 120px;
		height: 120px;
		animation: spin 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
