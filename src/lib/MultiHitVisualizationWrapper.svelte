<script>
	import { MultiHitVisualization } from 'hyphy-scope';
	import { onMount } from 'svelte';

	export let data;

	let showVisualization = true;
	let error = null;

	// Check if data has the required structure for Multi-Hit
	$: hasValidStructure =
		data && data['Evidence Ratios'] && data['Site Log Likelihood'] && data['Site substitutions'];
	$: hasTreeData = data && data.input && data.input.trees;

	onMount(() => {
		// Log the data structure for debugging
		console.log('Multi-Hit data structure:', data);

		// Check for required fields
		if (!data) {
			error = 'No data provided';
			showVisualization = false;
		} else if (
			!data['Evidence Ratios'] ||
			!data['Site Log Likelihood'] ||
			!data['Site substitutions']
		) {
			error =
				'Missing required Multi-Hit data fields (Evidence Ratios, Site Log Likelihood, or Site substitutions)';
			showVisualization = false;
			console.error('Required fields check:', {
				hasEvidenceRatios: !!data['Evidence Ratios'],
				hasSiteLogLikelihood: !!data['Site Log Likelihood'],
				hasSiteSubstitutions: !!data['Site substitutions']
			});
		}
	});

	// Error boundary for the visualization
	function handleError(e) {
		console.error('MultiHitVisualization error:', e);
		error = e.message || 'Unknown visualization error';
		showVisualization = false;
	}
</script>

{#if showVisualization && !error}
	<div class="multihit-wrapper">
		{#if !hasTreeData}
			<div class="warning-banner">
				<p>⚠️ Tree visualization unavailable - phylogenetic tree data not included in results</p>
			</div>
		{/if}

		<div on:error={handleError}>
			<MultiHitVisualization {data} />
		</div>
	</div>
{:else if error}
	<div class="error-container">
		<h4>Multi-Hit Visualization Error</h4>
		<p>{error}</p>
		<details>
			<summary>View raw results</summary>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</details>
	</div>
{/if}

<style>
	.multihit-wrapper {
		position: relative;
	}

	.warning-banner {
		background-color: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 4px;
		padding: 12px;
		margin-bottom: 16px;
		color: #856404;
	}

	.error-container {
		background-color: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 4px;
		padding: 16px;
		color: #721c24;
	}

	.error-container h4 {
		margin-top: 0;
		margin-bottom: 8px;
		color: #721c24;
	}

	.error-container details {
		margin-top: 12px;
	}

	.error-container summary {
		cursor: pointer;
		color: #721c24;
		font-weight: 500;
	}

	.error-container pre {
		background-color: #fff;
		border: 1px solid #f5c6cb;
		border-radius: 4px;
		padding: 12px;
		margin-top: 8px;
		overflow: auto;
		max-height: 300px;
		font-size: 12px;
	}
</style>
