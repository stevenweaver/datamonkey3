<script>
	import { onMount, createEventDispatcher } from 'svelte';

	// Props
	export let error = null;
	export let level = 'error'; // 'error', 'warning', 'info'
	export let dismissable = true;
	export let autoDismiss = false;
	export let dismissAfter = 5000; // ms
	export let showDetails = true;
	export let suggestions = [];

	// Local state
	let timer = null;
	let isExpanded = false;

	const dispatch = createEventDispatcher();

	// Get appropriate styling based on level
	function getLevelStyles() {
		switch (level) {
			case 'error':
				return {
					container: 'bg-status-error-bg border-status-error-border text-status-error-text',
					icon: 'text-status-error',
					button: 'hover:bg-status-error-border focus:ring-status-error'
				};
			case 'warning':
				return {
					container: 'bg-status-warning-bg border-status-warning-border text-status-warning-text',
					icon: 'text-status-warning',
					button: 'hover:bg-status-warning-border focus:ring-status-warning'
				};
			case 'info':
			default:
				return {
					container: 'bg-status-info-bg border-status-info-border text-status-info-text',
					icon: 'text-status-info',
					button: 'hover:bg-status-info-border focus:ring-status-info'
				};
		}
	}

	// Get appropriate icon based on level
	function getIcon() {
		switch (level) {
			case 'error':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>`;
			case 'warning':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>`;
			case 'info':
			default:
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 102 0v-3a1 1 0 10-2 0v3z" clip-rule="evenodd" />
        </svg>`;
		}
	}

	// Handle dismissal
	function dismiss() {
		dispatch('dismiss');
	}

	// Toggle expanded details
	function toggleDetails() {
		isExpanded = !isExpanded;
	}

	// Execute a suggested action
	function executeSuggestion(suggestion) {
		dispatch('suggestion', suggestion);
	}

	// Set up auto-dismiss if enabled
	$: if (autoDismiss && error) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			dismiss();
		}, dismissAfter);
	}

	// Clean up timer on component destroy
	onMount(() => {
		return () => {
			clearTimeout(timer);
		};
	});

	// Format error message
	$: errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
	$: errorDetails = typeof error === 'string' ? null : error?.details || null;
	$: styles = getLevelStyles();
</script>

{#if error}
	<div class="error-handler mb-4 rounded border p-4 shadow-sm {styles.container}" role="alert">
		<div class="flex">
			<div class="mr-3 flex-shrink-0 {styles.icon}">
				{@html getIcon()}
			</div>
			<div class="flex-grow">
				<div class="flex items-start justify-between">
					<div>
						<p class="font-medium">{errorMessage}</p>
					</div>

					{#if dismissable}
						<button
							on:click={dismiss}
							class="ml-4 inline-flex rounded p-1.5 transition-colors {styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2"
							aria-label="Dismiss"
						>
							<svg
								class="h-4 w-4"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					{/if}
				</div>

				{#if errorDetails && showDetails}
					<div class="mt-2">
						<button
							type="button"
							on:click={toggleDetails}
							class="inline-flex items-center text-sm {styles.button} rounded px-2 py-1 transition-colors focus:outline-none"
						>
							<span>Details</span>
							<svg
								class="ml-1 h-4 w-4 transform transition-transform"
								class:rotate-180={isExpanded}
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>

						{#if isExpanded}
							<div class="mt-2 rounded bg-white bg-opacity-50 p-3 text-sm">
								<p>{errorDetails}</p>
							</div>
						{/if}
					</div>
				{/if}

				{#if suggestions && suggestions.length > 0}
					<div class="mt-3">
						<p class="text-sm font-medium">Suggestions:</p>
						<div class="mt-1 flex flex-wrap gap-2">
							{#each suggestions as suggestion}
								<button
									on:click={() => executeSuggestion(suggestion)}
									class="inline-flex items-center rounded border border-current px-2 py-1 text-xs opacity-90 hover:opacity-100"
								>
									{suggestion.label}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
