<script>
	import { onMount } from 'svelte';
	import { activeAnalyses } from '../stores/analyses';
	import { goto } from '$app/navigation';

	// Function to navigate to the Results tab when clicked
	function navigateToResults() {
		goto('/?tab=results');
	}

	// Get today's date at midnight for filtering completed analyses
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	// Derived counts from activeAnalyses (excluding datareader which is just file processing)
	$: runningCount = $activeAnalyses
		? $activeAnalyses.filter((a) => a.status !== 'completed' && a.status !== 'error' && a.method !== 'datareader').length
		: 0;

	$: completedCount = $activeAnalyses
		? $activeAnalyses.filter(
				(a) => a.status === 'completed' && a.completedAt && new Date(a.completedAt) >= todayStart && a.method !== 'datareader'
			).length
		: 0;

	$: failedCount = $activeAnalyses ? $activeAnalyses.filter((a) => a.status === 'error' && a.method !== 'datareader').length : 0;

	// Only show indicator if there are any analyses to display
	$: showIndicator = runningCount > 0 || completedCount > 0 || failedCount > 0;
</script>

{#if showIndicator}
	<button
		class="flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm transition-shadow duration-200 hover:shadow-md"
		on:click={navigateToResults}
		aria-label="View all analyses"
	>
		{#if runningCount > 0}
			<div class="flex items-center">
				<span class="inline-flex items-center justify-center text-sm">
					<span class="pulse-animation mr-1 h-2 w-2 rounded-full bg-blue-500"></span>
					<span class="font-medium text-blue-600">{runningCount}</span>
				</span>
			</div>
		{/if}

		{#if completedCount > 0}
			<div class="flex items-center">
				{#if runningCount > 0}
					<span class="mx-1.5 text-gray-300">•</span>
				{/if}
				<span class="inline-flex items-center justify-center text-sm">
					<span class="mr-1 text-green-500">✓</span>
					<span class="font-medium text-green-600">{completedCount}</span>
				</span>
			</div>
		{/if}

		{#if failedCount > 0}
			<div class="flex items-center">
				{#if runningCount > 0 || completedCount > 0}
					<span class="mx-1.5 text-gray-300">•</span>
				{/if}
				<span class="inline-flex items-center justify-center text-sm">
					<span class="mr-1 text-red-500">⚠</span>
					<span class="font-medium text-red-600">{failedCount}</span>
				</span>
			</div>
		{/if}
	</button>
{/if}

<style>
	/* Animation for the pulsing indicator */
	.pulse-animation {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.05);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
