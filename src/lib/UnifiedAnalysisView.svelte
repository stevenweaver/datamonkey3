<!-- src/lib/UnifiedAnalysisView.svelte -->
<script>
  import MethodSelector from './MethodSelector.svelte';
  import AnalysisHistory from './AnalysisHistory.svelte';
  import AnalysisResultViewer from './AnalysisResultViewer.svelte';
  import { persistentFileStore } from '../stores/fileInfo';
  
  // Props
  export let methodConfig = {};
  export let runMethod = () => {};
  export let showAllHistory = false;
  export let currentFile = null;
  export let hyphyOut = '';
  export let toggleStdOut = () => {};
  export let isStdOutVisible = false;
  export let selectedAnalysisId = null;
  export let selectAnalysis = () => {};
  export let onConfigureMethod = () => {};
</script>

<div class="analysis-view flex flex-col gap-6">
  <!-- Top section: Method selection and controls -->
  <div class="bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Quick Analysis</h2>
      {#if currentFile}
        <button 
          on:click={toggleStdOut} 
          class="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600 text-sm"
        >
          {isStdOutVisible ? 'Hide Console' : 'Show Console'}
        </button>
      {/if}
    </div>
    
    {#if currentFile}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Method selection cards -->
        <div>
          <MethodSelector 
            {methodConfig} 
            {runMethod} 
            {onConfigureMethod}
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
        <p class="text-lg text-gray-600">Select a file from the list above to run analyses</p>
      </div>
    {:else}
      <div class="rounded border border-gray-200 bg-gray-50 p-6 text-center">
        <p class="text-lg text-gray-600">Upload a file to run analyses</p>
      </div>
    {/if}
  </div>
  
  <!-- Middle section: Analysis history and results split view -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left column: Analysis history -->
    <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
      <AnalysisHistory 
        filterByCurrentFile={!showAllHistory && !!currentFile} 
        onSelectAnalysis={selectAnalysis} 
      />
    </div>
    
    <!-- Right column: Analysis results (expanded) -->
    <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4">Analysis Results</h2>
      {#if selectedAnalysisId}
        <AnalysisResultViewer analysisId={selectedAnalysisId} />
      {:else}
        <div class="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p class="text-gray-500">Select an analysis from the history to view results</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .code-output {
    font-family: monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }
</style>