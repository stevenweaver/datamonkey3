<script>
  import { activeAnalysisProgress } from '../stores/analyses';
  
  // Duration for which to show the completed message before hiding
  export let completedMessageDuration = 5000; // 5 seconds
  
  // Auto-hide completed progress after a delay
  let showCompleted = false;
  let hideCompletedTimeout;
  
  $: if ($activeAnalysisProgress.status === 'completed' || $activeAnalysisProgress.status === 'error') {
    showCompleted = true;
    clearTimeout(hideCompletedTimeout);
    hideCompletedTimeout = setTimeout(() => {
      showCompleted = false;
    }, completedMessageDuration);
  }
  
  // Clean up timeout on component destruction
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    clearTimeout(hideCompletedTimeout);
  });
  
  // Status icons for different states
  const statusIcons = {
    initializing: '🔄',
    mounting: '📂',
    running: '⚙️',
    processing: '🔍',
    saving: '💾',
    completed: '✅',
    error: '❌'
  };
  
  // Get appropriate text color class based on status
  function getStatusColorClass(status) {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'running':
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-700';
    }
  }
  
  // Format timestamp for display
  function formatTime(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '';
    }
  }
  
  // Toggle showing all logs
  let showAllLogs = false;
  const toggleLogs = () => {
    showAllLogs = !showAllLogs;
  };
  
  // Get the last few logs (or all if showAllLogs is true)
  $: displayedLogs = showAllLogs 
    ? $activeAnalysisProgress.logs 
    : $activeAnalysisProgress.logs.slice(-3);
</script>

{#if $activeAnalysisProgress.id && ($activeAnalysisProgress.status !== 'completed' || showCompleted)}
  <div class="analysis-progress mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
    <div class="p-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Analysis Progress</h3>
        {#if $activeAnalysisProgress.status === 'completed' || $activeAnalysisProgress.status === 'error'}
          <button 
            class="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            on:click={() => showCompleted = false}
          >
            Dismiss
          </button>
        {/if}
      </div>
      
      <div class="mt-2">
        <div class="flex items-center">
          <div class={getStatusColorClass($activeAnalysisProgress.status)}>
            <span class="mr-2 text-xl">{statusIcons[$activeAnalysisProgress.status] || '🔄'}</span>
            <span class="font-medium capitalize">{$activeAnalysisProgress.status}</span>
          </div>
          <div class="ml-auto text-sm text-gray-500">
            {$activeAnalysisProgress.progress}%
          </div>
        </div>
        
        <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div 
            class="h-full rounded-full transition-all duration-300 ease-out"
            class:bg-blue-500={$activeAnalysisProgress.status !== 'completed' && $activeAnalysisProgress.status !== 'error'}
            class:bg-green-500={$activeAnalysisProgress.status === 'completed'}
            class:bg-red-500={$activeAnalysisProgress.status === 'error'}
            style="width: {$activeAnalysisProgress.progress}%"
          ></div>
        </div>
        
        <p class="mt-2 text-sm">{$activeAnalysisProgress.message}</p>
      </div>
      
      <!-- Log output -->
      <div class="mt-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Analysis Log</h4>
          <button 
            class="text-xs text-blue-500 hover:text-blue-700"
            on:click={toggleLogs}
          >
            {showAllLogs ? 'Show Recent' : 'Show All'}
          </button>
        </div>
        
        <div class="mt-1 max-h-32 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-2 text-xs">
          {#each displayedLogs as log}
            <div class="log-entry mb-1 flex">
              <span class="mr-2 font-mono text-gray-500">{formatTime(log.time)}</span>
              <span class={getStatusColorClass(log.status)}>{statusIcons[log.status]}</span>
              <span class="ml-2 flex-1">{log.message}</span>
            </div>
          {/each}
          
          {#if $activeAnalysisProgress.logs.length === 0}
            <p class="text-gray-500">No logs available</p>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}