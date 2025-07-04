<script>
  import { onMount } from 'svelte';
  import { analysisStore } from '../stores/analyses';
  import { currentFile, fileMetricsStore } from '../stores/fileInfo';
  import AnalysisResultViewer from './AnalysisResultViewer.svelte';
  import AnalysisHistory from './AnalysisHistory.svelte';
  import AnalysisCompare from './AnalysisCompare.svelte';
  import BatchExport from './BatchExport.svelte';
  import FastaExport from './FastaExport.svelte';
  import TabNavigation from './TabNavigation.svelte';
  
  // Props
  export let selectedAnalysisId = null;
  export let selectAnalysis = () => {};
  export let showAllHistory = false;
  export let showBatchExport = false;
  export let toggleBatchExport = () => {};
  
  // Tab navigation
  export let activeTab = 'results';
  export let onChange = (tab) => {};
  
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
    
    <!-- Export toggle removed - now integrated into the export section below -->
  </div>
  
  <!-- Export Options -->
  <div class="mb-premium-xl rounded-premium border border-border-platinum bg-white p-premium-lg shadow-premium">
    <h2 class="text-premium-header font-semibold text-text-rich mb-premium-md">Export Options</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-premium-lg">
      <!-- Sequence Data Export (if file metrics available) -->
      {#if $fileMetricsStore}
        <div class="border-r border-border-platinum pr-premium-lg">
          <h3 class="text-premium-title font-semibold mb-premium-sm">Sequence Data Export</h3>
          <FastaExport fileMetricsJSON={$fileMetricsStore} />
        </div>
      {/if}
      
      <!-- Analysis Results Export -->
      <div class={$fileMetricsStore ? '' : 'col-span-2'}>
        <h3 class="text-premium-title font-semibold mb-premium-sm">Analysis Results Export</h3>
        {#if showBatchExport}
          <BatchExport />
        {:else}
          <button 
            on:click={toggleBatchExport} 
            class="bg-accent-copper hover:bg-accent-warm text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Show Batch Export
          </button>
        {/if}
      </div>
    </div>
  </div>
  
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
        {:else if $analysisStore.analyses.filter(a => a.method !== 'datareader').length > 0}
          <div class="flex flex-col items-center justify-center h-64 bg-brand-whisper rounded-premium text-center">
            <div class="mb-premium-md">
              <svg class="w-16 h-16 text-text-muted mx-auto mb-premium-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="text-premium-title font-semibold text-text-rich mb-premium-xs">Select an Analysis</h3>
              <p class="text-premium-body text-text-slate">Choose an analysis from the history to view detailed results</p>
            </div>
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center h-64 bg-brand-whisper rounded-premium text-center">
            <div class="mb-premium-md">
              <svg class="w-16 h-16 text-text-muted mx-auto mb-premium-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 class="text-premium-title font-semibold text-text-rich mb-premium-xs">No Analyses Yet</h3>
              <p class="text-premium-body text-text-slate mb-premium-md">You haven't run any analyses yet. Get started by uploading a file and running an analysis method.</p>
              <button 
                on:click={() => onChange('analyze')}
                class="bg-brand-royal hover:bg-brand-deep text-white font-medium py-premium-sm px-premium-md rounded-premium transition-colors"
              >
                Go to Analyze Tab
              </button>
            </div>
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
  
  <!-- Tab Navigation -->
  <div class="mt-premium-xl">
    <TabNavigation {activeTab} onChange={onChange} />
  </div>
</div>