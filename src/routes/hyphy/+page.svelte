<script>
	import { onMount } from 'svelte';
	import { html } from 'htl';
	import Aioli from '@biowasm/aioli';
	import DataReaderResults from '../../lib/dataReaderResults.svelte';
	import MethodSelector from '../../lib/MethodSelector.svelte';

	import dataReader from '../../data/datareader.bf?raw';

	import HyPhyGlobals from '../../data/shared/HyPhyGlobals.ibf?raw';
	import chooseGeneticCode from '../../data/shared/chooseGeneticCode.def?raw';
	import ReadDelimitedFiles from '../../data/shared/ReadDelimitedFiles.bf?raw';
	import TreeTools from '../../data/shared/TreeTools.ibf?raw';
	import NJ from '../../data/shared/NJ.bf?raw';
	import PartitionReader from '../../data/shared/PartitionReader.ibf?raw';
	import GrabBag from '../../data/shared/GrabBag.bf?raw';

	let hyphyOut = '';
	let jsonOut;
	let jsonData;
	let resultsCompleted;
	let loading = true;
	let cliObj;
	let result;
	let fileMetricsJSON;

	// Consolidating methods and hyphyCommands
	const methodConfig = {
		aBSREL: { command: 'absrel', outputSuffix: 'ABSREL.json', args: [] },
		BGM: { command: 'bgm', outputSuffix: 'BGM.json', args: [] },
		BUSTED: { command: 'busted', outputSuffix: 'BUSTED.json', args: [] },
		'Contrast-FEL': { command: 'contrast-fel', outputSuffix: 'CFEL.json', args: [] },
		FADE: { command: 'fade', outputSuffix: 'FADE.json', args: [] },
		FEL: { command: 'fel', outputSuffix: 'FEL.json', args: [] },
		FUBAR: { command: 'fubar', outputSuffix: 'FUBAR.json', args: [] },
		GARD: { command: 'gard', outputSuffix: 'GARD.json', args: [] },
		MEME: { command: 'meme', outputSuffix: 'MEME.json', args: [] },
		'MULTI-HIT': { command: 'fmm', outputSuffix: 'FMM.json', args: [] }, // Placeholder: Customize if needed
		NRM: { command: null, outputSuffix: 'NRM.json', args: [] }, // Placeholder: Customize if needed
		RELAX: { command: 'relax', outputSuffix: 'RELAX.json', args: [] },
		SLAC: { command: 'slac', outputSuffix: 'SLAC.json', args: [] }
	};

	const methods = Object.keys(methodConfig);

	let iframeEl;

	// Function to send json data to the iframe
	function sendDataToIframe() {
		if (iframeEl) {
			console.log('haro?');
			iframeEl.contentWindow.postMessage({ type: 'json', data: jsonData }, '*');
		}
	}

	// Watch for changes to jsonData and send to iframe
	$: if (jsonData) {
		sendDataToIframe();
	}

	let runMethod = async function (method) {
		// Extract the command and arguments from the configuration

		const { command, args } = methodConfig[method];
		resultsCompleted = false;

		// Add method-specific data if needed
		let methodDependencies = getMethodDependencies(method);
		//inputFiles.push(...methodDependencies.map((dep) => ({ name: dep.name, data: dep.data })));

		let inputFiles = await cliObj.mount([
			{ name: 'user.nex', data: await file.text() },
			...methodDependencies.map((dep) => ({ name: dep.name, data: dep.data }))
		]);

		// Mounting input files for HyPhy execution
		result = await cliObj.exec(`hyphy LIBPATH=/shared/hyphy/ ${command} ${inputFiles[0]}`);
		hyphyOut = await result.stdout;

		// Handle JSON output
		const jsonBlob = await cliObj.download('/shared/data/user.nex.FEL.json');
		console.log(await cliObj.ls('/shared/data/'));
		const response = await fetch(jsonBlob);
		const blob = await response.blob();
		jsonOut = await blob.text();
		jsonData = JSON.parse(jsonOut);
		resultsCompleted = true;
	};

	function getMethodDependencies(method) {
		switch (method) {
			case 'FEL':
			case 'BUSTED':
			case 'SLAC':
				return []; // Empty for now; potentially add dependencies if necessary
			default:
				return [];
		}
	}

	onMount(async () => {
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

		result = await cliObj.exec('hyphy --version');
		hyphyOut = result.stdout;
		loading = false;

		// Setup an event listener to receive messages
		window.addEventListener('message', (event) => {
			if (event.data.type === 'ready') {
				sendDataToIframe(); // send data when iframe is ready
			}
		});
	});

	function updateHyphyProgress(payload) {
		if (payload.type === 'print') {
			console.log(payload.text);
		}
	}

	let file;
	let isStdOutVisible = false; // New state for toggling stdout visibility

	async function handleFileUpload(event) {
		file = event.target.files[0];

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

		result = await cliObj.exec('hyphy LIBPATH=/shared/hyphy/ ' + inputFiles[1]);
		hyphyOut = await result.stdout;
		const jsonBlob = await cliObj.download('/shared/data/results.json');
		const response = await fetch(jsonBlob);
		const blob = await response.blob();
		jsonOut = await blob.text();
		fileMetricsJSON = JSON.parse(jsonOut);
		console.log(fileMetricsJSON);
	}

	const toggleStdOut = () => {
		isStdOutVisible = !isStdOutVisible; // Toggle the visibility state
	};
</script>

<div class="container mx-auto p-12">
	{#if loading}
		<div class="flex h-screen flex-col items-center justify-center">
			<div class="loader mb-4"></div>
			<p class="text-xl">Loading HyPhy...</p>
		</div>
	{:else}
		{#if fileMetricsJSON}
			<MethodSelector {methods} {runMethod} />
		{/if}

		<div class="ml-16">
			<input type="file" on:change={handleFileUpload} class="mb-4" />
			<div class="grid grid-cols-1 gap-4 md:grid-cols-1">
				<!-- Adjust grid to avoid overlap -->

				{#if fileMetricsJSON}
					<DataReaderResults {fileMetricsJSON} />
				{/if}
				<!-- Add toggle button for stdout -->
				<button on:click={toggleStdOut} class="mt-4 rounded bg-gray-500 px-2 py-1 text-white">
					{isStdOutVisible ? 'Hide Output' : 'Show Output'}
				</button>

				<!-- Output section, collapsible -->
				{#if isStdOutVisible}
					<pre class="code-output mt-4">{hyphyOut}</pre>
				{/if}
				<iframe
					bind:this={iframeEl}
					hidden={!resultsCompleted}
					class="mt-4 h-screen w-full"
					src="//localhost:3000/pages/fel"
				></iframe>
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
	.code-output {
		background-color: #f5f5f5; /* Just to give some contrast */
		padding: 10px;
		border-radius: 5px;
		overflow-x: auto; /* Allow horizontal scrolling if needed */
	}
</style>
