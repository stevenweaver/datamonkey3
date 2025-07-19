<!--
ProcessingLocationBadge - Display where an analysis is being processed
Shows different badges for local vs backend processing with appropriate icons
-->

<script>
	export let processingLocation = 'local'; // 'local' | 'backend'
	export let status = 'pending'; // Analysis status
	export let compact = false; // Compact display mode
</script>

<div 
	class="processing-location-badge inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {compact ? 'px-1.5 py-0.5 text-2xs' : ''}"
	class:bg-blue-100={processingLocation === 'local'}
	class:text-blue-800={processingLocation === 'local'}
	class:bg-purple-100={processingLocation === 'backend'}
	class:text-purple-800={processingLocation === 'backend'}
	title={processingLocation === 'backend' ? 'Processing on remote server' : 'Processing locally in browser'}
>
	<!-- Local Processing Icon -->
	{#if processingLocation === 'local'}
		<svg 
			xmlns="http://www.w3.org/2000/svg" 
			class="mr-1 h-3 w-3" 
			viewBox="0 0 20 20" 
			fill="currentColor"
		>
			<path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
		</svg>
		{#if compact}
			Local
		{:else}
			Browser
		{/if}
	{/if}

	<!-- Backend Processing Icon -->
	{#if processingLocation === 'backend'}
		<svg 
			xmlns="http://www.w3.org/2000/svg" 
			class="mr-1 h-3 w-3" 
			viewBox="0 0 20 20" 
			fill="currentColor"
		>
			<path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
		</svg>
		{#if compact}
			Server
		{:else}
			Backend
		{/if}
	{/if}

	<!-- Status indicator for running jobs -->
	{#if ['pending', 'running', 'processing'].includes(status)}
		<div class="ml-1 h-1.5 w-1.5 rounded-full bg-current animate-pulse"></div>
	{/if}
</div>

<style>
	.text-2xs {
		font-size: 0.625rem;
		line-height: 0.75rem;
	}
</style>