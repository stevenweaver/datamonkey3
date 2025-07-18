<script>
	import toml from 'toml';
	import { onMount } from 'svelte';
	import { aioliStore } from '../../../stores/aioli';
	import { alignmentFileStore, fileMetricsStore } from '../../../stores/fileInfo';
	import { treeStore } from '../../../stores/tree';
	import MethodForm from '../../../lib/FormGenerator.svelte';
	import methodConfigToml from '../../../lib/config/methodOptions.toml?raw';
	import { PAGES_URL, HYPHY_EYE_URL } from '../../../lib/config/env';

	import { page } from '$app/state';

	let currentMethod = page.params.method;
	let methodConfigs = toml.parse(methodConfigToml);
	let methodConfig = methodConfigs[currentMethod];

	let hyphyOut = '';
	let jsonOut;
	let jsonData;
	let resultsCompleted = false;
	let result;
	let cliObj;
	let alignmentFile;
	let fileMetrics;
	let trees = {};

	let isRunning = false;
	let formData = {};

	onMount(() => {
		alignmentFileStore.subscribe((value) => {
			alignmentFile = value;

			// Display the current alignment file if it's set
			if (alignmentFile) {
				console.log(`Currently working on alignment file: ${alignmentFile}`);
			} else {
				console.log('No alignment file is set.');
			}
		});

		fileMetricsStore.subscribe((value) => (fileMetrics = value));
		treeStore.subscribe((value) => (trees = value));

		// Subscribe to aioli store to get the CLI object
		aioliStore.subscribe((value) => {
			cliObj = value;
		});

		methodConfig.options.forEach((option) => {
			if (option.default !== undefined) {
				formData[option.name] = option.default;
			} else if (option.takes_value && option.type === 'number') {
				formData[option.name] = option.minimum || 0; // Default to minimum if no default is set
			}
		});
	});

	// We no longer need to send data to an iframe
	// jsonData is now used for the download feature

	let runMethod = async function (options) {
		isRunning = true;
		const command = currentMethod;
		const inputFile = '/shared/data/user.nex';

		const args = [];
		args.push(`--alignment ${inputFile}`);
		for (let option of methodConfig.options) {
			if (option.takes_value && option.type === 'string') {
				args.push(`--${option.name} ${options[option.name] || formData[option.name]}`);
			}

			if (option.takes_value && option.type === 'number') {
				args.push(
					`--${option.name} ${options[option.name] !== undefined ? options[option.name] : formData[option.name]}`
				);
			}
		}

		resultsCompleted = false;

		// Check if cliObj is available
		if (!cliObj) {
			console.error(
				'HyPhy CLI object is not initialized. Please wait for the application to load completely.'
			);
			isRunning = false;
			return;
		}

		try {
			let fullHyphyCommand = `hyphy LIBPATH=/shared/hyphy/ ${command} ${args.join(' ')}`;
			result = await cliObj.exec(fullHyphyCommand);
			hyphyOut = await result.stdout;

			const jsonBlob = await cliObj.download('/shared/data/user.nex.FEL.json');
			const response = await fetch(jsonBlob);
			const blob = await response.blob();
			jsonOut = await blob.text();
			jsonData = JSON.parse(jsonOut);
			resultsCompleted = true;
		} catch (e) {
			console.warn('Error executing command:', e);
		} finally {
			isRunning = false;
		}
	};

	// No need for the message listener since we're no longer using iframes
</script>

<div class="container mx-auto p-12">
	{#if alignmentFile}
		<div class="mb-4 border-l-4 border-blue-500 bg-blue-100 p-4 text-blue-700">
			<p>Currently working on alignment file: {alignmentFile}</p>
		</div>
	{/if}

	{#if !cliObj}
		<div class="mb-4 border-l-4 border-blue-500 bg-blue-100 p-4 text-blue-700">
			<p>Loading HyPhy analysis environment...</p>
		</div>
	{:else if isRunning}
		<div class="mb-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
			<p>Job is running. Please wait...</p>
		</div>
	{:else if !resultsCompleted}
		<MethodForm {runMethod} {trees} />
	{/if}

	<div class={resultsCompleted ? '' : 'invisible absolute'}>
		<div class="mb-4 mt-4 rounded-lg bg-gray-100 p-6 text-center shadow-sm">
			<h3 class="mb-4 text-xl font-semibold">View Results in hyphy-eye</h3>
			<p class="mb-4">View detailed visualization of your results in hyphy-eye:</p>
			<a
				href="{HYPHY_EYE_URL}/pages/{currentMethod}"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-block rounded-md bg-blue-500 px-5 py-3 text-white transition-colors hover:bg-blue-600"
			>
				Open {currentMethod.toUpperCase()} Results in hyphy-eye
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="ml-1 inline-block h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
					/>
				</svg>
			</a>
			<p class="mt-4 text-sm text-gray-600">
				Note: You may need to download the JSON result file below and upload it to hyphy-eye.
			</p>

			<div class="mt-6">
				<h4 class="mb-2 font-medium">Result JSON:</h4>
				<button
					class="rounded-md bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300"
					on:click={() => {
						const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonOut);
						const downloadAnchorNode = document.createElement('a');
						downloadAnchorNode.setAttribute('href', dataStr);
						downloadAnchorNode.setAttribute('download', `${currentMethod}_result.json`);
						document.body.appendChild(downloadAnchorNode);
						downloadAnchorNode.click();
						downloadAnchorNode.remove();
					}}
				>
					Download JSON Result
				</button>
			</div>
		</div>
	</div>

	{#if resultsCompleted}
		<h3 class="mt-4 text-xl">Output:</h3>
		<pre class="code-output">{hyphyOut}</pre>
	{/if}
</div>

<style>
	.code-output {
		background-color: #1e1e1e;
		color: #d4d4d4;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-family: monospace;
		white-space: pre-wrap;
	}
</style>
