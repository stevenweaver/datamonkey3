<script>
  import { onMount } from 'svelte';
  import { currentFile } from '../stores/fileInfo';
  import { persistentFileStore } from '../stores/fileInfo';
  import { analysisStore, activeAnalysisProgress } from '../stores/analyses';
  import MethodSelector from './MethodSelector.svelte';
  import MethodOptionsTab from './MethodOptionsTab.svelte';
  import EnhancedAnalysisProgress from './EnhancedAnalysisProgress.svelte';
  import AnalysisHistory from './AnalysisHistory.svelte';
  
  // Props
  export let methodConfig = {};
  export let runMethod = () => {};
  export let selectedMethod = 'FEL'; // Default method for configuration
  export let hyphyOut = '';
  export let isStdOutVisible = false;
  export let toggleStdOut = () => {};
  export let showAllHistory = false;
  export let selectAnalysis = () => {};
  
  // Local state
  let expandedSection = 'quick'; // 'quick', 'advanced', 'history'
  
  // Toggle section expansion
  function toggleSection(section) {
    expandedSection = expandedSection === section ? null : section;
  }
  
  // Configure method from selector
  function handleConfigureMethod(method) {
    selectedMethod = method;
    expandedSection = 'advanced';
  }
</script>

<div class="analyze-tab">
  <!-- Analysis Progress Bar (always visible at top) -->
  <div class="mb-6">
    <EnhancedAnalysisProgress />
  </div>
  
  <!-- Quick Analysis Section (expanded by default) -->
  <div class="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
    <div 
      class="flex cursor-pointer items-center justify-between rounded-t-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
      on:click={() => toggleSection('quick')}
    >
      <h2 class="text-xl font-bold">Quick Analysis</h2>
      <div class="flex items-center">
        {#if $currentFile}
          <button 
            on:click={(e) => {
              e.stopPropagation();
              toggleStdOut();
            }} 
            class="mr-4 rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600 text-sm"
          >
            {isStdOutVisible ? 'Hide Console' : 'Show Console'}
          </button>
        {/if}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6 transition-transform" 
          class:rotate-180={expandedSection === 'quick'}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    
    {#if expandedSection === 'quick'}
      <div class="p-4">
        {#if $currentFile}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Method selection cards -->
            <div class="md:col-span-2">
              <MethodSelector 
                {methodConfig} 
                {runMethod} 
                onConfigureMethod={handleConfigureMethod}
              />
            </div>
            
            <!-- Console output (conditionally shown) -->
            {#if isStdOutVisible}
              <div class="md:col-span-2">
                <h3 class="text-md font-semibold mb-2">Console Output</h3>
                <pre class="code-output h-48 overflow-auto rounded bg-black p-3 text-white text-opacity-90 text-sm">{hyphyOut}</pre>
              </div>
            {/if}
          </div>
        {:else if $persistentFileStore && $persistentFileStore.files && $persistentFileStore.files.length > 0}
          <div class="rounded border border-gray-200 bg-gray-50 p-6 text-center">
            <p class="text-lg text-gray-600">Select a file from the list to run analyses</p>
          </div>
        {:else}
          <div class="rounded border border-gray-200 bg-gray-50 p-6 text-center">
            <p class="text-lg text-gray-600">Upload a file in the Data tab to run analyses</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <!-- Advanced Options Section (collapsible) -->
  <div class="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
    <div 
      class="flex cursor-pointer items-center justify-between rounded-t-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
      on:click={() => toggleSection('advanced')}
    >
      <h2 class="text-xl font-bold">Advanced Options</h2>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-6 w-6 transition-transform" 
        class:rotate-180={expandedSection === 'advanced'}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    
    {#if expandedSection === 'advanced'}
      <div class="p-4">
        {#if $currentFile}
          <MethodOptionsTab {runMethod} {selectedMethod} />
        {:else}
          <div class="rounded border border-gray-200 bg-gray-50 p-6 text-center">
            <p class="text-lg text-gray-600">Upload or select a file to configure advanced options</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <!-- Analysis History Section (collapsible) -->
  <div class="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
    <div 
      class="flex cursor-pointer items-center justify-between rounded-t-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
      on:click={() => toggleSection('history')}
    >
      <h2 class="text-xl font-bold">Recent Analyses</h2>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-6 w-6 transition-transform" 
        class:rotate-180={expandedSection === 'history'}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    
    {#if expandedSection === 'history'}
      <div class="p-4">
        <AnalysisHistory 
          filterByCurrentFile={!showAllHistory && !!$currentFile} 
          onSelectAnalysis={selectAnalysis}
          redirectToResults={true}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .code-output {
    font-family: monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }
</style>