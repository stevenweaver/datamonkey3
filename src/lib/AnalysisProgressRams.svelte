<script>
  import { activeAnalysisProgress } from '../stores/analyses';
  import { onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  // Duration for which to show the completed message before hiding
  export let completedMessageDuration = 5000; // 5 seconds
  
  // Auto-hide completed progress after a delay
  let showCompleted = false;
  let hideCompletedTimeout;
  
  // Progressive disclosure states
  let showPhases = false;
  let showLogs = false;
  
  // State for managing phases
  const phases = [
    { id: 'initializing', name: 'Initialize' },
    { id: 'mounting', name: 'Prepare' },
    { id: 'running', name: 'Analyze' },
    { id: 'processing', name: 'Process' },
    { id: 'saving', name: 'Save' },
    { id: 'completed', name: 'Complete' }
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
  function formatTimestamp(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '';
    }
  }
  
  // Get the last few logs
  $: displayedLogs = $activeAnalysisProgress.logs.slice(-5);
  
  // Get current phase index
  $: currentPhaseIndex = phases.findIndex(phase => phase.id === $activeAnalysisProgress.status);
  
  // Get simplified status for display
  $: statusText = $activeAnalysisProgress.status === 'running' ? 'Running analysis' : 
                 $activeAnalysisProgress.status === 'completed' ? 'Analysis complete' :
                 $activeAnalysisProgress.status === 'error' ? 'Analysis failed' :
                 `${phases.find(p => p.id === $activeAnalysisProgress.status)?.name || 'Processing'}`;
</script>

{#if $activeAnalysisProgress.id && ($activeAnalysisProgress.status !== 'completed' || showCompleted)}
  <div class="analysis-progress mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
    <!-- Essential information - always visible -->
    <div class="p-5">
      <!-- Status and time information in single row -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center">
          <span class={`mr-2 text-lg font-medium ${getStatusColorClass($activeAnalysisProgress.status)}`}>
            {statusText}
          </span>
        </div>
        
        <div class="flex items-center text-sm text-gray-600">
          <span>
            {formatTime(elapsed)}
            {#if estimatedTimeRemaining && estimatedTimeRemaining > 0}
              <span class="mx-1 text-gray-400">•</span>
              <span>{formatTime(estimatedTimeRemaining)} remaining</span>
            {/if}
          </span>
        </div>
      </div>
      
      <!-- Progress bar - more prominent -->
      <div class="my-4 flex items-center">
        <div class="relative mr-3 h-2 flex-grow overflow-hidden rounded-full bg-gray-100">
          <div 
            class="absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out"
            class:bg-blue-500={$activeAnalysisProgress.status !== 'completed' && $activeAnalysisProgress.status !== 'error'}
            class:bg-green-500={$activeAnalysisProgress.status === 'completed'}
            class:bg-red-500={$activeAnalysisProgress.status === 'error'}
            style="width: {$activeAnalysisProgress.progress}%"
          ></div>
        </div>
        <span class="w-12 text-right text-sm font-medium">{$activeAnalysisProgress.progress}%</span>
      </div>
      
      <!-- Current operation - brief description -->
      <p class="text-sm text-gray-600">
        {$activeAnalysisProgress.message}
      </p>
    </div>
    
    <!-- Toggle buttons for additional information -->
    <div class="flex border-t border-gray-100 bg-gray-50 text-sm">
      <button 
        class="flex-1 py-2 text-center transition-colors hover:bg-gray-100"
        class:text-blue-600={showPhases}
        class:font-medium={showPhases}
        on:click={() => showPhases = !showPhases}
      >
        {showPhases ? 'Hide' : 'Show'} Phases
      </button>
      
      <div class="h-6 w-px self-center bg-gray-200"></div>
      
      <button 
        class="flex-1 py-2 text-center transition-colors hover:bg-gray-100"
        class:text-blue-600={showLogs}
        class:font-medium={showLogs}
        on:click={() => showLogs = !showLogs}
      >
        {showLogs ? 'Hide' : 'Show'} Details
      </button>
    </div>
    
    <!-- Phase indicator (collapsible) -->
    {#if showPhases}
      <div transition:slide={{duration: 200, easing: quintOut}} class="border-t border-gray-100 bg-white p-4">
        <div class="flex items-center justify-between">
          {#each phases as phase, index}
            <div class="flex flex-col items-center" style="width: {100/phases.length}%">
              <div 
                class={`flex h-6 w-6 items-center justify-center rounded-full
                  ${index <= currentPhaseIndex 
                    ? index === currentPhaseIndex 
                      ? 'bg-blue-100 ring-2 ring-blue-500' 
                      : 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'}`}
              >
                {#if index < currentPhaseIndex}
                  <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                {:else if index === currentPhaseIndex}
                  <div class="h-2 w-2 rounded-full bg-blue-500"></div>
                {:else}
                  <div class="h-2 w-2 rounded-full bg-gray-300"></div>
                {/if}
                
                {#if index < phases.length - 1}
                  <div 
                    class={`absolute left-[calc(100%+2px)] top-1/2 h-px w-[calc(100%-12px)] -translate-y-1/2 
                      ${index < currentPhaseIndex ? 'bg-green-500' : 'bg-gray-200'}`}
                  ></div>
                {/if}
              </div>
              <span 
                class={`mt-2 text-center text-xs
                  ${index === currentPhaseIndex 
                    ? 'font-medium text-blue-600' 
                    : index < currentPhaseIndex 
                      ? 'text-green-600' 
                      : 'text-gray-500'}`}
              >
                {phase.name}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- Log output (collapsible) -->
    {#if showLogs}
      <div transition:slide={{duration: 200, easing: quintOut}} class="border-t border-gray-100 bg-gray-50 p-4">
        <div class="rounded border border-gray-200 bg-white p-2 text-xs">
          {#each displayedLogs as log}
            <div class="mb-2 flex">
              <span class="mr-2 font-mono text-gray-400">{formatTimestamp(log.time)}</span>
              <span class={`${getStatusColorClass(log.status)} flex-1`}>{log.message}</span>
            </div>
          {/each}
          
          {#if $activeAnalysisProgress.logs.length === 0}
            <p class="text-center text-gray-500">No logs available</p>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .analysis-progress {
    transition: all 0.2s ease-in-out;
  }
</style>