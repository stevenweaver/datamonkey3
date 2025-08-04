<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		backendConnectivity,
		startPeriodicConnectivityCheck,
		stopPeriodicConnectivityCheck
	} from '../stores/backendConnectivity.js';

	let intervalId = null;

	onMount(() => {
		// Start checking connectivity when component mounts
		intervalId = startPeriodicConnectivityCheck(30000); // Check every 30 seconds
	});

	onDestroy(() => {
		// Clean up when component is destroyed
		if (intervalId) {
			stopPeriodicConnectivityCheck(intervalId);
		}
	});

	// Reactive statements for status
	$: status = $backendConnectivity.isChecking
		? 'checking'
		: $backendConnectivity.isConnected
			? 'connected'
			: 'disconnected';

	$: statusColor = {
		checking: 'bg-yellow-400',
		connected: 'bg-green-500',
		disconnected: 'bg-red-500'
	}[status];

	$: tooltipText = {
		checking: 'Checking DataMonkey server connection...',
		connected: `DataMonkey server connected (${$backendConnectivity.serverUrl})`,
		disconnected: $backendConnectivity.error
			? `DataMonkey server disconnected: ${$backendConnectivity.error}`
			: 'DataMonkey server disconnected'
	}[status];
</script>

<div class="relative inline-flex items-center">
	<div
		class="group relative flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
		title={tooltipText}
	>
		<!-- Status dot -->
		<div
			class="h-3 w-3 rounded-full {statusColor} {status === 'checking' ? 'animate-pulse' : ''}"
		></div>

		<!-- Tooltip -->
		<div
			class="pointer-events-none absolute right-0 top-full mt-2 hidden w-max max-w-xs rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg group-hover:block"
		>
			{tooltipText}
			{#if $backendConnectivity.lastChecked}
				<div class="mt-1 text-xs text-gray-300">
					Last checked: {$backendConnectivity.lastChecked.toLocaleTimeString()}
				</div>
			{/if}
			<!-- Tooltip arrow -->
			<div
				class="absolute bottom-full right-6 h-2 w-2 rotate-45 bg-gray-900"
				style="margin-bottom: -4px;"
			></div>
		</div>
	</div>
</div>
