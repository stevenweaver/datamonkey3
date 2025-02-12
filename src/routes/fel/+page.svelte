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

	// Function to send json data to the iframe
	function sendDataToIframe() {
		if (iframeEl) {
			iframeEl.contentWindow.postMessage({ type: 'json', data: jsonData }, '*');
		}
	}

	let runMethod = async function (method) {
		const command = 'fel';
		const args = {};

		resultsCompleted = false;
		const inputFile = '/shared/data/user.nex';
		await aioliStore.subscribe((value) => (cliObj = value));

		result = await cliObj.exec(`hyphy LIBPATH=/shared/hyphy/ ${command} ${inputFile}`);
		hyphyOut = await result.stdout;

		// Handle JSON output
		const jsonBlob = await cliObj.download('/shared/data/user.nex.FEL.json');
		const response = await fetch(jsonBlob);
		const blob = await response.blob();
		jsonOut = await blob.text();
		jsonData = JSON.parse(jsonOut);
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

	{#if resultsCompleted}
		<h3 class="mt-4 text-xl">Output:</h3>
		<pre class="code-output">{hyphyOut}</pre>
		<!-- Display the HyPhy output -->
	{/if}
	<div class={resultsCompleted ? '' : 'invisible absolute'}>
		<iframe bind:this={iframeEl} class="mt-4 h-screen w-full" src="//localhost:3000/pages/fel"
		></iframe>
	</div>
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
