<script>
	// Props
	export let direction = 'forward'; // 'forward' or 'back'
	export let label = '';
	export let disabled = false;
	export let tooltip = '';
	export let onClick = () => {};
	export let step = null; // 1, 2, or 3 to show step number

	// Determine styling based on direction
	$: isPrimary = direction === 'forward';
	$: icon = direction === 'forward' ? 'arrow-right' : 'arrow-left';
</script>

<button
	class="rounded-premium-md flex items-center px-premium-md py-premium-sm text-premium-body font-medium transition-all duration-premium"
	class:bg-brand-gradient={isPrimary && !disabled}
	class:text-white={isPrimary && !disabled}
	class:hover:bg-brand-deep={isPrimary && !disabled}
	class:shadow-sm={isPrimary && !disabled}
	class:hover:shadow={isPrimary && !disabled}
	class:transform={isPrimary && !disabled}
	class:hover:scale-[0.98]={isPrimary && !disabled}
	class:active:scale-[0.96]={isPrimary && !disabled}
	class:border={!isPrimary || disabled}
	class:border-brand-royal={!isPrimary && !disabled}
	class:text-brand-royal={!isPrimary && !disabled}
	class:hover:bg-brand-whisper={!isPrimary && !disabled}
	class:bg-gray-100={disabled}
	class:border-gray-300={disabled}
	class:text-gray-400={disabled}
	class:cursor-not-allowed={disabled}
	class:opacity-75={disabled}
	on:click={() => !disabled && onClick()}
	title={tooltip}
	aria-disabled={disabled}
>
	{#if direction === 'back'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-premium-xs h-5 w-5"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	{/if}

	{#if step}
		<div
			class="mr-premium-xs flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
			class:bg-white={isPrimary && !disabled}
			class:text-brand-royal={isPrimary && !disabled}
			class:bg-brand-royal={!isPrimary && !disabled}
			class:text-white={!isPrimary && !disabled}
			class:bg-gray-200={disabled}
			class:text-gray-400={disabled}
		>
			<span class="text-sm font-bold">{step}</span>
		</div>
	{/if}

	{label}

	{#if direction === 'forward'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="ml-premium-xs h-5 w-5"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	{/if}
</button>
