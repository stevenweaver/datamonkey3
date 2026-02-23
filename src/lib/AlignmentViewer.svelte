<script>
	import { AliVibe } from 'alivibe';
	import { parseFasta } from 'alivibe/io';
	import { computeTreeLayout } from 'alivibe/tree';
	import { onMount, tick } from 'svelte';

	export let alignmentFile = null;
	export let fileMetricsJSON = null;

	let mounted = false;
	let isLoading = false;
	let error = null;

	$: if (alignmentFile && mounted) {
		loadAlignment();
	}

	async function loadAlignment() {
		if (!alignmentFile) return;

		isLoading = true;
		error = null;

		try {
			const content = await alignmentFile.text();
			const fastaText = convertToFasta(content);
			parseFasta(fastaText);
			computeTreeLayout();
		} catch (err) {
			console.error('Error loading alignment:', err);
			error = err.message;
		} finally {
			isLoading = false;
		}
	}

	function convertToFasta(content) {
		const trimmed = content.trim();

		if (trimmed.toLowerCase().startsWith('#nexus')) {
			return nexusToFasta(trimmed);
		}

		if (trimmed.startsWith('>')) {
			return trimmed;
		}

		return trimmed;
	}

	function nexusToFasta(content) {
		const matrixMatch = content.match(/MATRIX\s*\n([\s\S]*?)\s*;/i);
		if (!matrixMatch) {
			throw new Error('Could not find MATRIX block in NEXUS file');
		}

		const lines = matrixMatch[1].split('\n');
		let fasta = '';

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine) continue;

			const parts = trimmedLine.split(/\s+/);
			if (parts.length >= 2) {
				const name = parts[0];
				const sequence = parts.slice(1).join('');
				fasta += `>${name}\n${sequence}\n`;
			}
		}

		return fasta;
	}

	onMount(() => {
		mounted = true;
	});
</script>

{#if isLoading}
	<div class="flex items-center justify-center p-8">
		<p class="text-sm text-text-silver">Loading alignment viewer...</p>
	</div>
{:else if error}
	<div class="p-4 text-sm text-red-600">
		Failed to load alignment: {error}
	</div>
{/if}

<div class="alivibe-container">
	<AliVibe height="500px" features={{
		sequences: false,
		phylogeny: false,
		reset: false,
		history: false,
		export: false,
		viewMode: true,
		highlighter: true,
		alignment: false,
		frame: true,
		info: true
	}} />
</div>

<style>
	.alivibe-container {
		width: 100%;
		overflow: hidden;
	}
</style>
