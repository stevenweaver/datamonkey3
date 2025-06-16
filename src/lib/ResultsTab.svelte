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
  <div class="mb-premium-xl flex flex-wrap items-center justify-between gap-premium-md">
    <div class="flex items-center gap-premium-sm">
      <button
        class="rounded-premium-sm px-premium-md py-premium-sm font-medium text-premium-body transition-all duration-premium"
        class:bg-brand-royal={viewMode === 'single'}
        class:text-white={viewMode === 'single'}
        class:bg-brand-whisper={viewMode !== 'single'}
        class:text-text-rich={viewMode !== 'single'}
        class:hover:bg-brand-ghost={viewMode !== 'single'}
        class:hover:text-brand-royal={viewMode !== 'single'}
        on:click={() => setViewMode('single')}
      >
        Single View
      </button>
      <button
        class="rounded-premium-sm px-premium-md py-premium-sm font-medium text-premium-body transition-all duration-premium"
        class:bg-brand-royal={viewMode === 'compare'}
        class:text-white={viewMode === 'compare'}
        class:bg-brand-whisper={viewMode !== 'compare'}
        class:text-text-rich={viewMode !== 'compare'}
        class:hover:bg-brand-ghost={viewMode !== 'compare'}
        class:hover:text-brand-royal={viewMode !== 'compare'}
        on:click={() => setViewMode('compare')}
      >
        Compare View
      </button>
    </div>
    
    <div class="flex items-center gap-premium-sm">
      <button 
        on:click={toggleBatchExport} 
        class="rounded-premium-sm bg-accent-copper px-premium-md py-premium-sm text-white text-premium-body font-medium hover:bg-accent-warm transition-all duration-premium"
      >
        {showBatchExport ? 'Hide Batch Export' : 'Batch Export'}
      </button>
    </div>
  </div>
  
  <!-- Batch Export (conditional) -->
  {#if showBatchExport}
    <div class="mb-premium-xl rounded-premium border border-border-platinum bg-white p-premium-lg shadow-premium">
      <h2 class="text-premium-header font-semibold text-text-rich mb-premium-md">Batch Export</h2>
      <BatchExport />
    </div>
  {/if}
  
  <!-- Main content area -->
  {#if viewMode === 'single'}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-premium-xl">
      <!-- Left column: Analysis history -->
      <div class="lg:col-span-1 bg-white p-premium-lg rounded-premium shadow-premium">
        <h2 class="text-premium-header font-semibold text-text-rich mb-premium-md">Analysis History</h2>
        <AnalysisHistory 
          filterByCurrentFile={!showAllHistory && !!$currentFile} 
          onSelectAnalysis={selectAnalysis} 
        />
      </div>
      
      <!-- Right column: Analysis results (expanded) -->
      <div class="lg:col-span-2 bg-white p-premium-lg rounded-premium shadow-premium">
        <h2 class="text-premium-header font-semibold text-text-rich mb-premium-md">Analysis Results</h2>
        {#if selectedAnalysisId}
          <AnalysisResultViewer analysisId={selectedAnalysisId} />
        {:else}
          <div class="flex items-center justify-center h-64 bg-brand-whisper rounded-premium">
            <p class="text-premium-body text-text-slate">Select an analysis from the history to view results</p>
          </div>
        {/if}
      </div>
    </div>
  {:else if viewMode === 'compare'}
    <div class="bg-white p-premium-lg rounded-premium shadow-premium">
      <h2 class="text-premium-header font-semibold text-text-rich mb-premium-md">Compare Analyses</h2>
      <AnalysisCompare />
    </div>
  {/if}
</div>