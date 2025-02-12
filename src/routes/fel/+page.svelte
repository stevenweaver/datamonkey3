<script>
	import { onMount } from 'svelte';
	import { aioliStore } from '../../stores/aioli';
	import FelOptions from '../../lib/FelOptions.svelte'; // Import the FelOptions component

	let hyphyOut = '';
	let jsonOut;
	let jsonData;
	let resultsCompleted;
	let result;
	let cliObj;
	let iframeEl;

	let gencodeid = '0'; // Default to Universal code
	let dsVariation = '2'; // Default to No
	let multipleHits = 'None'; // Default option
	let siteMultihit = 'Estimate'; // Default option
	let resample = 0; // Default value for resampling
	let confidenceInterval = false; // Default for checkbox

	$: if (jsonData) {
		sendDataToIframe();
	}

	// Function to send json data to the iframe
	function sendDataToIframe() {
		if (iframeEl) {
			console.log(jsonData);
			iframeEl.contentWindow.postMessage({ type: 'json', data: jsonData }, '*');
		}
	}

	let runMethod = async function (options) {
		const command = 'fel';
		const inputFile = '/shared/data/user.nex';

		const args = [];

		args.push(`--alignment ${inputFile}`);
		args.push(`--code ${options.gencodeid || gencodeid}`);
		//args.push(`--branches All`); // Default branch setting if you want to include all branches.
		args.push(
			`--srv ${options.srv !== undefined ? (options.srv === '1' ? 'Yes' : 'No') : dsVariation === '1' ? 'Yes' : 'No'}`
		);
		args.push(`--multiple-hits ${options.multipleHits || multipleHits}`);
		//args.push(`--resample ${options.resample !== undefined ? options.resample : resample}`);
		args.push(
			`--ci ${options.ci !== undefined ? (options.ci ? 'Yes' : 'No') : confidenceInterval ? 'Yes' : 'No'}`
		);
		//args.push(`--site-multihit ${options.siteMultihit || siteMultihit}`);

		resultsCompleted = false;
		await aioliStore.subscribe((value) => (cliObj = value));

		console.log(args);

		result = await cliObj.exec(`hyphy LIBPATH=/shared/hyphy/ ${command} ${args.join(' ')}`);
		hyphyOut = await result.stdout;

		// Handle JSON output
		const jsonBlob = await cliObj.download('/shared/data/user.nex.FEL.json');
		const response = await fetch(jsonBlob);
		const blob = await response.blob();
		jsonOut = await blob.text();
		jsonData = JSON.parse(jsonOut);
		console.log(jsonData);
		resultsCompleted = true;
	};

	onMount(async () => {
		// Setup an event listener to receive messages
		window.addEventListener('message', (event) => {
			if (event.data.type === 'ready') {
				sendDataToIframe(); // send data when iframe is ready
			}
		});
	});
</script>

<div class="container mx-auto p-12">
	<h1 class="mb-4 text-3xl font-bold">FEL Analysis</h1>
	<FelOptions {runMethod} />

	<div class={resultsCompleted ? '' : 'invisible absolute'}>
		<iframe bind:this={iframeEl} class="mt-4 h-screen w-full" src="//localhost:3000/pages/fel"
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
