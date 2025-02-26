<script>
	import toml from 'toml';
	import { onMount } from 'svelte';
	import { aioliStore } from '../../../stores/aioli';
	import { alignmentFileStore, fileMetricsStore } from '../../../stores/fileInfo';
	import { treeStore } from '../../../stores/tree';
	import MethodForm from '../../../lib/FormGenerator.svelte';
	import methodConfigToml from '../../../lib/config/methodOptions.toml?raw';

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
	let iframeEl;

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

		methodConfig.options.forEach((option) => {
			if (option.default !== undefined) {
				formData[option.name] = option.default;
			} else if (option.takes_value && option.type === 'number') {
				formData[option.name] = option.minimum || 0; // Default to minimum if no default is set
			}
		});
	});

	$: if (jsonData) {
		sendDataToIframe();
	}

	// Function to send json data to the iframe
	function sendDataToIframe() {
		if (iframeEl) {
			iframeEl.contentWindow.postMessage({ type: 'json', data: jsonData }, '*');
		}
	}

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
		await aioliStore.subscribe((value) => (cliObj = value));

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

	onMount(async () => {
		window.addEventListener('message', (event) => {
			if (event.data.type === 'ready') {
				sendDataToIframe();
			}
		});
	});
</script>

<div class="container mx-auto p-12">
	{#if alignmentFile}
		<div class="mb-4 border-l-4 border-blue-500 bg-blue-100 p-4 text-blue-700">
			<p>Currently working on alignment file: {alignmentFile}</p>
		</div>
	{/if}

	{#if isRunning}
		<div class="mb-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
			<p>Job is running. Please wait...</p>
		</div>
	{:else if !resultsCompleted}
		<MethodForm {runMethod} {trees} />
	{/if}

	<div class={resultsCompleted ? '' : 'invisible absolute'}>
		<iframe
			bind:this={iframeEl}
			class="mt-4 h-screen w-full"
			src="//localhost:3000/pages/{currentMethod}"
		></iframe>
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
