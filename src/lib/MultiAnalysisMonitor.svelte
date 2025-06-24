<script>
  import { onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { activeAnalyses } from '../stores/analyses';
  import { tick } from 'svelte';
  
  // Props with default values
  export let position = 'top-right'; // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  export let initiallyExpanded = false;
  export let dismissDuration = 5000; // How long completed analyses remain visible
  
  // Component state
  let isExpanded = initiallyExpanded;
  let completedNotifications = [];
  
  // Toggle expanded state
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
  
  // Format elapsed time
  function formatElapsedTime(startTime) {
    if (!startTime) return '00:00';
    
    const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = Math.floor(elapsed % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
  
  // Track completed analyses
  let prevAnalysesCount = 0;
  let completionTimeouts = [];
  
  // Set up notification and cleanup for completed analyses
  $: {
    // Check for newly completed analyses
    if ($activeAnalyses) {
      // Log analysis structure for debugging
      console.log('Active analyses:', $activeAnalyses);
      $activeAnalyses.forEach(analysis => {
        console.log(`Analysis ID: ${analysis.id}, Status: ${analysis.status}`);
        console.log('Logs structure:', analysis.logs);
        if (analysis.logs) {
          console.log('Logs type:', typeof analysis.logs);
          console.log('Logs is array:', Array.isArray(analysis.logs));
          console.log('Logs length:', Array.isArray(analysis.logs) ? analysis.logs.length : 'N/A');
        }
      });
      
      const completedAnalyses = $activeAnalyses.filter(analysis => 
        analysis.status === 'completed' && !completedNotifications.includes(analysis.id)
      );
      
      // Add notifications for newly completed analyses
      if (completedAnalyses.length > 0) {
        completedAnalyses.forEach(analysis => {
          completedNotifications = [...completedNotifications, analysis.id];
          
          // Set up timeout to remove notification
          const timeoutId = setTimeout(() => {
            completedNotifications = completedNotifications.filter(id => id !== analysis.id);
          }, dismissDuration);
          
          completionTimeouts.push(timeoutId);
        });
      }
      
      // Track number of analyses for automatic expansion
      if ($activeAnalyses.length > 0 && prevAnalysesCount === 0) {
        isExpanded = true;
      }
      
      prevAnalysesCount = $activeAnalyses.length;
    }
  }
  
  // Clean up timeouts on component destruction
  onMount(() => {
    return () => {
      completionTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  });
  
  // Get total number of running analyses
  $: runningAnalysesCount = $activeAnalyses ? 
    $activeAnalyses.filter(a => a.status !== 'completed' && a.status !== 'error').length : 0;
    
  // Get total number of analyses (including completed ones that are still showing)
  $: totalVisibleAnalyses = $activeAnalyses ? 
    $activeAnalyses.filter(a => 
      a.status !== 'completed' || completedNotifications.includes(a.id)
    ).length : 0;
    
  // Position classes
  $: positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }[position] || 'top-4 right-4';
  
  // Helper to determine if we should show an analysis
  function shouldShowAnalysis(analysis) {
    return analysis.status !== 'completed' || 
           completedNotifications.includes(analysis.id);
  }
  
  // Handle dismissing a single analysis
  function dismissAnalysis(analysisId) {
    completedNotifications = completedNotifications.filter(id => id !== analysisId);
  }
  
  // Handle collapsing the panel
  function collapsePanel() {
    isExpanded = false;
  }
</script>

{#if $activeAnalyses && $activeAnalyses.length > 0 && totalVisibleAnalyses > 0}
  <div 
    class="fixed z-50 {positionClasses} transition-all duration-300"
    class:w-72={isExpanded}
    class:w-auto={!isExpanded}
  >
    <!-- Monitor Panel -->
    <div 
      class="bg-white rounded-md shadow-lg overflow-hidden border border-gray-200"
      transition:fade={{ duration: 300 }}
    >
      <!-- Header -->
      <div 
        class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer"
        on:click={toggleExpanded}
      >
        <div class="flex items-center">
          {#if runningAnalysesCount > 0}
            <div class="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2 pulse-animation"></div>
          {/if}
          <h3 class="text-sm font-medium text-gray-700">
            {runningAnalysesCount > 0 ? 'Analyses Running' : 'Analyses'}
            {#if totalVisibleAnalyses > 0}
              <span class="ml-1 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                {totalVisibleAnalyses}
              </span>
            {/if}
          </h3>
        </div>
        
        <div class="flex items-center">
          <button 
            class="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
            aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            <svg 
              class="w-4 h-4 transition-transform duration-300" 
              class:rotate-180={isExpanded}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Analysis List (only visible when expanded) -->
      {#if isExpanded}
        <div 
          class="max-h-80 overflow-y-auto"
          transition:slide={{ duration: 300 }}
        >
          {#if $activeAnalyses.length === 0 || totalVisibleAnalyses === 0}
            <div class="p-3 text-center text-gray-500 text-sm">
              No active analyses
            </div>
          {:else}
            <ul class="divide-y divide-gray-100">
              {#each $activeAnalyses as analysis (analysis.id)}
                {#if shouldShowAnalysis(analysis)}
                  <li 
                    class="p-3 hover:bg-gray-50 transition-colors duration-200"
                    transition:slide|local={{ duration: 200 }}
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {analysis.method || 'Analysis'}
                        </p>
                        <p class="text-xs text-gray-500 truncate">
                          {analysis.fileName || 'Unknown file'}
                        </p>
                      </div>
                      
                      {#if analysis.status === 'completed' || analysis.status === 'error'}
                        <button 
                          class="ml-2 text-gray-400 hover:text-gray-600"
                          on:click|stopPropagation={() => dismissAnalysis(analysis.id)}
                          aria-label="Dismiss notification"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      {:else}
                        <a 
                          href={`/analysis/${analysis.id}`} 
                          class="ml-2 text-blue-500 hover:text-blue-700"
                          aria-label="View analysis details"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      {/if}
                    </div>
                    
                    <div class="mt-1 flex items-center justify-between">
                      <div class="flex items-center">
                        <span 
                          class="w-2 h-2 rounded-full mr-1.5"
                          class:bg-blue-500={analysis.status !== 'completed' && analysis.status !== 'error'}
                          class:bg-green-500={analysis.status === 'completed'}
                          class:bg-red-500={analysis.status === 'error'}
                        ></span>
                        <span class="text-xs capitalize text-gray-600">
                          {analysis.status || 'running'}
                        </span>
                      </div>
                      
                      {#if analysis.startTime && analysis.status !== 'completed' && analysis.status !== 'error'}
                        <span class="text-xs text-gray-500 tabular-nums">
                          {formatElapsedTime(analysis.startTime)}
                        </span>
                      {/if}
                    </div>
                    
                    {#if analysis.message}
                      <p class="mt-1 text-xs text-gray-500 truncate">
                        {analysis.message}
                      </p>
                    {/if}
                  </li>
                {/if}
              {/each}
            </ul>
          {/if}
        </div>
        
        <!-- Footer (only for expanded state) -->
        <div class="px-3 py-2 bg-gray-50 border-t border-gray-200 text-right">
          <button 
            class="text-xs text-gray-500 hover:text-gray-700"
            on:click={collapsePanel}
          >
            Collapse
          </button>
        </div>
      {/if}
    </div>
  </div>
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
  
  /* Ensure proper scrolling behavior */
  :global(html) {
    scroll-padding-top: 4rem;
  }
</style>