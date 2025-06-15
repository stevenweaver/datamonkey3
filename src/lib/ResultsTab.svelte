<script>
  import { onMount } from 'svelte';
  import { analysisStore } from '../stores/analyses';
  import { currentFile } from '../stores/fileInfo';
  import AnalysisResultViewer from './AnalysisResultViewer.svelte';
  import AnalysisHistory from './AnalysisHistory.svelte';
  import AnalysisCompare from './AnalysisCompare.svelte';
  import BatchExport from './BatchExport.svelte';
  
  // Props
  export let selectedAnalysisId = null;
  export let selectAnalysis = () => {};
  export let showAllHistory = false;
  export let showBatchExport = false;
  export let toggleBatchExport = () => {};
  
  // Local state
  let viewMode = 'single'; // 'single' or 'compare'
  
  function setViewMode(mode) {
    viewMode = mode;
  }
</script>

<div class="results-tab">
  <!-- Top controls -->
  <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <button
        class="rounded px-4 py-2 font-medium transition-colors"
        class:bg-blue-500={viewMode === 'single'}
        class:text-white={viewMode === 'single'}
        class:bg-gray-100={viewMode !== 'single'}
        class:hover:bg-gray-200={viewMode !== 'single'}
        on:click={() => setViewMode('single')}
      >
        Single View
      </button>
      <button
        class="rounded px-4 py-2 font-medium transition-colors"
        class:bg-blue-500={viewMode === 'compare'}
        class:text-white={viewMode === 'compare'}
        class:bg-gray-100={viewMode !== 'compare'}
        class:hover:bg-gray-200={viewMode !== 'compare'}
        on:click={() => setViewMode('compare')}
      >
        Compare View
      </button>
    </div>
    
    <div class="flex items-center gap-2">
      <button 
        on:click={toggleBatchExport} 
        class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
      >
        {showBatchExport ? 'Hide Batch Export' : 'Batch Export'}
      </button>
    </div>
  </div>
  
  <!-- Batch Export (conditional) -->
  {#if showBatchExport}
    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 class="mb-4 text-xl font-bold">Batch Export</h2>
      <BatchExport />
    </div>
  {/if}
  
  <!-- Main content area -->
  {#if viewMode === 'single'}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column: Analysis history -->
      <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Analysis History</h2>
        <AnalysisHistory 
          filterByCurrentFile={!showAllHistory && !!$currentFile} 
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
  {:else if viewMode === 'compare'}
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4">Compare Analyses</h2>
      <AnalysisCompare />
    </div>
  {/if}
</div>