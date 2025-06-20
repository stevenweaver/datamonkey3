<script>
  import { activeAnalysisProgress } from '../stores/analyses';
  import { onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  
  // Duration for which to show the completed message before hiding
  export let completedMessageDuration = 5000; // 5 seconds
  export let enableMarkdown = true; // Option to enable markdown rendering
  
  // Simple markdown renderer for log messages
  function renderMarkdown(text) {
    // This is a very simple implementation
    // In a production app, use a proper markdown library
    
    if (!text) return '';
    
    // Handle code blocks
    let formatted = text.replace(/```([\s\S]*?)```/g, '<pre class="p-2 my-1 bg-gray-700 text-gray-100 overflow-x-auto rounded">$1</pre>');
    
    // Handle bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle emphasis
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace newlines with <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }
  
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
  onDestroy(() => {
    clearTimeout(hideCompletedTimeout);
  });
  
  // Show/hide detailed logs
  let showDetails = false;
  
  // Format timestamp for display
  function formatTime(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '';
    }
  }
  
  // Get appropriate text color based on status
  function getStatusColor(status) {
    switch (status) {
      case 'completed':
        return '#34D399'; // Green
      case 'error':
        return '#EF4444'; // Red
      case 'running':
      case 'processing':
        return '#3B82F6'; // Blue
      default:
        return '#6B7280'; // Gray
    }
  }
  
  // Get status text based on the current status
  function getStatusText(status) {
    switch (status) {
      case 'initializing':
        return 'Initializing';
      case 'mounting':
        return 'Loading Data';
      case 'running':
        return 'Running';
      case 'processing':
        return 'Processing';
      case 'saving':
        return 'Saving Results';
      case 'completed':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Processing';
    }
  }
  
  // Determine if we should animate the progress bar
  $: isActive = $activeAnalysisProgress.status !== 'completed' && 
                $activeAnalysisProgress.status !== 'error';
</script>

{#if $activeAnalysisProgress.id && ($activeAnalysisProgress.status !== 'completed' || showCompleted)}
  <div 
    class="analysis-progress mt-4 overflow-hidden rounded-md bg-white transition-all"
    class:shadow-sm={isActive}
    transition:slide={{ duration: 300 }}
  >
    <!-- Status Bar -->
    <div class="flex h-12 items-center justify-between p-3">
      <!-- Status and message -->
      <div class="flex items-center">
        <div 
          class="mr-3 h-2.5 w-2.5 rounded-full transition-colors" 
          style="background-color: {getStatusColor($activeAnalysisProgress.status)}"
        ></div>
        <span class="font-medium">
          {getStatusText($activeAnalysisProgress.status)}
          {#if isActive}
            <span class="ml-2 text-xs text-gray-500">{$activeAnalysisProgress.progress}%</span>
          {/if}
        </span>
      </div>
      
      <!-- Controls -->
      <div class="flex items-center space-x-2">
        <button 
          class="rounded p-1 text-xs text-gray-400 transition-colors hover:text-gray-700"
          on:click={() => showDetails = !showDetails}
          aria-label={showDetails ? 'Hide details' : 'Show details'}
        >
          {showDetails ? '△' : '▽'}
        </button>
        
        {#if $activeAnalysisProgress.status === 'completed' || $activeAnalysisProgress.status === 'error'}
          <button 
            class="rounded p-1 text-xs text-gray-400 transition-colors hover:text-gray-700"
            on:click={() => showCompleted = false}
            aria-label="Dismiss"
          >
            ×
          </button>
        {/if}
      </div>
    </div>
    
    <!-- Progress bar -->
    {#if isActive}
      <div class="h-1 w-full overflow-hidden bg-gray-100">
        <div 
          class="h-full transition-all duration-300 ease-out"
          style="
            background-color: {getStatusColor($activeAnalysisProgress.status)};
            width: {$activeAnalysisProgress.progress}%;
          "
        ></div>
      </div>
    {/if}
    
    <!-- Message -->
    <div class="border-t border-gray-100 px-3 py-2">
      <p class="text-sm text-gray-700">{$activeAnalysisProgress.message}</p>
    </div>
    
    <!-- Detailed view -->
    {#if showDetails}
      <div class="border-t border-gray-100 p-3">
        <h4 class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Log</h4>
        
        <div class="max-h-40 overflow-y-auto rounded bg-gray-50 p-2 text-xs">
          {#each $activeAnalysisProgress.logs as log}
            <div class="mb-1.5 flex">
              <span class="mr-2 whitespace-nowrap font-mono text-gray-400">{formatTime(log.time)}</span>
              <div
                class="mr-1.5 h-2 w-2 mt-1.5 flex-shrink-0 rounded-full"
                style="background-color: {getStatusColor(log.status)}"
              ></div>
              {#if enableMarkdown && log.message.includes('```') || log.message.includes('**')}
                <div class="log-message flex-1">
                  {@html renderMarkdown(log.message)}
                </div>
              {:else}
                <span class="flex-1 font-mono">{log.message}</span>
              {/if}
            </div>
          {:else}
            <p class="text-gray-500">No logs available</p>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}