<script>
  import { persistentFileStore, currentFile } from '../stores/fileInfo';
  import { analysisStore } from '../stores/analyses';

  export let activeTab = 'data';
  export let onChange = (tabName) => {};
  export let showRunningIndicator = false;
  
  // Reactive variables to track state conditions
  $: hasFiles = $persistentFileStore?.files?.length > 0;
  $: hasAnalyses = $analysisStore?.analyses?.length > 0;
  
  // Logic to determine if a tab should be disabled
  $: isAnalyzeDisabled = !hasFiles;
  $: isResultsDisabled = !hasAnalyses;
  
  // Function to handle tab clicks with context-aware behavior
  function handleTabClick(tabName) {
    // Data tab is always accessible
    if (tabName === 'data') {
      onChange(tabName);
      return;
    }
    
    // Analyze tab requires at least one file
    if (tabName === 'analyze') {
      if (!isAnalyzeDisabled) {
        onChange(tabName);
      }
      return;
    }
    
    // Results tab requires at least one analysis
    if (tabName === 'results') {
      if (!isResultsDisabled) {
        onChange(tabName);
      }
      return;
    }
  }
</script>

<div class="mb-premium-xl">
  <div class="bg-brand-ghost rounded-premium p-premium-xs">
    <div class="flex border-b border-border-platinum">
      <!-- Data Tab - Always Enabled -->
      <button
        class="text-premium-brand font-semibold py-premium-lg px-premium-xl relative transition-all duration-premium"
        class:text-brand-royal={activeTab === 'data'}
        class:text-text-rich={activeTab !== 'data'}
        class:hover:text-brand-royal={activeTab !== 'data'}
        class:hover:bg-brand-whisper={activeTab !== 'data'}
        on:click={() => handleTabClick('data')}
        title="Manage sequence data"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          Data
        </span>
        {#if activeTab === 'data'}
          <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-copper"></div>
        {/if}
      </button>
      
      <!-- Analyze Tab - Disabled until data is available -->
      <button
        class="text-premium-brand font-semibold py-premium-lg px-premium-xl relative transition-all duration-premium"
        class:text-brand-royal={activeTab === 'analyze' && !isAnalyzeDisabled}
        class:text-text-rich={activeTab !== 'analyze' && !isAnalyzeDisabled}
        class:text-text-silver={isAnalyzeDisabled}
        class:hover:text-brand-royal={activeTab !== 'analyze' && !isAnalyzeDisabled}
        class:hover:bg-brand-whisper={activeTab !== 'analyze' && !isAnalyzeDisabled}
        class:cursor-not-allowed={isAnalyzeDisabled}
        class:opacity-60={isAnalyzeDisabled}
        on:click={() => handleTabClick('analyze')}
        title={isAnalyzeDisabled ? "Upload data first" : "Run analysis on selected data"}
        aria-disabled={isAnalyzeDisabled}
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V7zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" clip-rule="evenodd" />
          </svg>
          Analyze
        </span>
        {#if showRunningIndicator && !isAnalyzeDisabled}
          <span class="ml-2 inline-flex animate-pulse-premium items-center rounded-premium-xl bg-brand-royal px-2.5 py-0.5 text-premium-caption font-semibold text-white tracking-premium-badge">
            Running
          </span>
        {/if}
        {#if activeTab === 'analyze' && !isAnalyzeDisabled}
          <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-copper"></div>
        {/if}
      </button>
      
      <!-- Results Tab - Disabled until analyses exist -->
      <button
        class="text-premium-brand font-semibold py-premium-lg px-premium-xl relative transition-all duration-premium"
        class:text-brand-royal={activeTab === 'results' && !isResultsDisabled}
        class:text-text-rich={activeTab !== 'results' && !isResultsDisabled}
        class:text-text-silver={isResultsDisabled}
        class:hover:text-brand-royal={activeTab !== 'results' && !isResultsDisabled}
        class:hover:bg-brand-whisper={activeTab !== 'results' && !isResultsDisabled}
        class:cursor-not-allowed={isResultsDisabled}
        class:opacity-60={isResultsDisabled}
        on:click={() => handleTabClick('results')}
        title={isResultsDisabled ? "Run analysis first" : "View analysis results"}
        aria-disabled={isResultsDisabled}
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" />
          </svg>
          Results
        </span>
        {#if activeTab === 'results' && !isResultsDisabled}
          <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-copper"></div>
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  /* Add styles for custom tooltip on hover */
  button[title]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--tw-text-rich, #111827);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;
    opacity: 0;
    animation: fadeIn 0.2s ease-in-out forwards;
  }
  
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
</style>