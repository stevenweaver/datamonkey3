<!-- src/lib/EnhancedAnalysisProgress.svelte -->
<script>
  import { activeAnalysisProgress } from '../stores/analyses';
  import { onDestroy } from 'svelte';
  
  // Duration for which to show the completed message before hiding
  export let completedMessageDuration = 5000; // 5 seconds
  
  // Auto-hide completed progress after a delay
  let showCompleted = false;
  let hideCompletedTimeout;
  
  // State for managing phases
  const phases = [
    { id: 'initializing', name: 'Initializing', description: 'Setting up analysis parameters' },
    { id: 'mounting', name: 'File Preparation', description: 'Preparing files for analysis' },
    { id: 'running', name: 'Analysis', description: 'Running HyPhy analysis' },
    { id: 'processing', name: 'Processing', description: 'Processing analysis results' },
    { id: 'saving', name: 'Saving', description: 'Saving results to database' },
    { id: 'completed', name: 'Completed', description: 'Analysis completed successfully' }
  ];
  
  // Estimated time tracking
  let startTime = null;
  let elapsed = 0;
  let estimatedTimeRemaining = null;
  let timerInterval;
  
  // When active analysis progress changes, update timer
  $: if ($activeAnalysisProgress.id) {
    // If we have a new analysis or state changed to running, start/reset the timer
    if (!startTime || 
        ($activeAnalysisProgress.status === 'running' && ['initializing', 'mounting'].includes(previousStatus))) {
      startTime = new Date();
      elapsed = 0;
      
      // Clear any existing interval
      if (timerInterval) clearInterval(timerInterval);
      
      // Start a new timer interval
      timerInterval = setInterval(() => {
        elapsed = (new Date() - startTime) / 1000; // elapsed time in seconds
        
        // Estimate remaining time based on progress and elapsed time
        if ($activeAnalysisProgress.progress > 5) {
          const progressRate = $activeAnalysisProgress.progress / elapsed; // % per second
          const remainingProgress = 100 - $activeAnalysisProgress.progress;
          estimatedTimeRemaining = remainingProgress / progressRate; // seconds
        } else {
          estimatedTimeRemaining = null; // Not enough data to estimate
        }
      }, 1000);
    }
    
    // If analysis is completed or errored, clear the interval
    if (['completed', 'error'].includes($activeAnalysisProgress.status)) {
      clearInterval(timerInterval);
    }
  } else {
    // If no active analysis, clear the timer
    clearInterval(timerInterval);
    startTime = null;
    elapsed = 0;
    estimatedTimeRemaining = null;
  }
  
  // Format time for display (converts seconds to mm:ss)
  function formatTime(seconds) {
    if (!seconds && seconds !== 0) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Track previous status to detect changes
  let previousStatus = null;
  $: {
    previousStatus = $activeAnalysisProgress.status;
  }
  
  $: if ($activeAnalysisProgress.status === 'completed' || $activeAnalysisProgress.status === 'error') {
    showCompleted = true;
    clearTimeout(hideCompletedTimeout);
    hideCompletedTimeout = setTimeout(() => {
      showCompleted = false;
    }, completedMessageDuration);
  }
  
  // Clean up timeout and interval on component destruction
  onDestroy(() => {
    clearTimeout(hideCompletedTimeout);
    clearInterval(timerInterval);
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
  
  // Get background color class for progress bar
  function getProgressBarColorClass(status) {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  }
  
  // Format timestamp for display
  function formatTimestamp(isoString) {
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
  
  // Get current phase index
  $: currentPhaseIndex = phases.findIndex(phase => phase.id === $activeAnalysisProgress.status);
</script>

{#if $activeAnalysisProgress.id && ($activeAnalysisProgress.status !== 'completed' || showCompleted)}
  <div class="enhanced-analysis-progress mt-4 rounded-lg border border-gray-200 bg-white shadow-md">
    <div class="p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Analysis Progress</h3>
        {#if $activeAnalysisProgress.status === 'completed' || $activeAnalysisProgress.status === 'error'}
          <button 
            class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
            on:click={() => showCompleted = false}
          >
            Dismiss
          </button>
        {/if}
      </div>
      
      <!-- Time estimation and progress -->
      <div class="mt-3 flex items-center justify-between">
        <div class="flex items-center">
          <div class={`flex items-center ${getStatusColorClass($activeAnalysisProgress.status)}`}>
            <span class="mr-2 text-xl">{statusIcons[$activeAnalysisProgress.status] || '🔄'}</span>
            <span class="font-medium capitalize">{$activeAnalysisProgress.status}</span>
          </div>
        </div>
        
        <div class="flex items-center text-sm text-gray-600">
          {#if ['completed', 'error'].includes($activeAnalysisProgress.status)}
            <span>Completed in {formatTime(elapsed)}</span>
          {:else}
            <span>Time elapsed: {formatTime(elapsed)}</span>
            {#if estimatedTimeRemaining && estimatedTimeRemaining > 0}
              <span class="ml-2">• Est. remaining: {formatTime(estimatedTimeRemaining)}</span>
            {/if}
          {/if}
          <span class="ml-4 font-semibold">{$activeAnalysisProgress.progress}%</span>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div 
          class={`h-full rounded-full transition-all duration-300 ease-out ${getProgressBarColorClass($activeAnalysisProgress.status)}`}
          style="width: {$activeAnalysisProgress.progress}%"
        ></div>
      </div>
      
      <!-- Current message -->
      <div class="mt-3 rounded-md bg-gray-50 p-3">
        <p class={`text-sm ${getStatusColorClass($activeAnalysisProgress.status)}`}>
          <span class="font-semibold">Status:</span> {$activeAnalysisProgress.message}
        </p>
      </div>
      
      <!-- Phase indicator -->
      <div class="mt-4">
        <h4 class="mb-2 text-sm font-medium">Analysis Phases</h4>
        <div class="flex justify-between">
          {#each phases as phase, index}
            <div class="flex flex-col items-center" style="width: {100/phases.length}%">
              <div 
                class={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 
                  ${index <= currentPhaseIndex 
                    ? index === currentPhaseIndex 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-green-500 bg-green-50' 
                    : 'border-gray-300 bg-white'}`}
              >
                {#if index < currentPhaseIndex}
                  <span class="text-green-500">✓</span>
                {:else if index === currentPhaseIndex}
                  <span class="relative flex h-3 w-3">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                    <span class="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
                  </span>
                {:else}
                  <span class="text-gray-400">{index + 1}</span>
                {/if}
                
                {#if index < phases.length - 1}
                  <div 
                    class={`absolute left-full top-1/2 h-0.5 w-full -translate-y-1/2 
                      ${index < currentPhaseIndex ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                {/if}
              </div>
              <span 
                class={`mt-1 text-center text-xs
                  ${index === currentPhaseIndex 
                    ? 'font-semibold text-blue-600' 
                    : index < currentPhaseIndex 
                      ? 'font-medium text-green-600' 
                      : 'text-gray-500'}`}
              >
                {phase.name}
              </span>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Log output -->
      <div class="mt-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Analysis Log</h4>
          <button 
            class="text-xs text-blue-500 hover:text-blue-700"
            on:click={toggleLogs}
          >
            {showAllLogs ? 'Show Recent' : 'Show All'}
          </button>
        </div>
        
        <div class="mt-1 max-h-40 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-2 text-xs">
          {#each displayedLogs as log}
            <div class="log-entry mb-1 flex">
              <span class="mr-2 font-mono text-gray-500">{formatTimestamp(log.time)}</span>
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

<style>
  /* Animation for pulsing effect */
  @keyframes pulse {
    0% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
    100% {
      opacity: 0.5;
      transform: scale(1);
    }
  }
  
  .enhanced-analysis-progress {
    transition: all 0.3s ease-in-out;
  }
</style>