<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { analysisStore } from '../stores/analyses';
  import { persistentFileStore } from '../stores/fileInfo';
  
  export let openAnalyses = [];
  export let activeAnalysisId = null;
  
  const dispatch = createEventDispatcher();
  
  // Local state
  let analyses = [];
  let files = [];
  let loaded = false;
  
  // Get currently loaded analyses
  $: if ($analysisStore.analyses) {
    analyses = $analysisStore.analyses;
    
    // If we have open analyses, fetch their details
    if (openAnalyses.length > 0) {
      // Ensure all open analyses exist in the store
      openAnalyses = openAnalyses.filter(id => analyses.some(a => a.id === id));
      
      // If none left, clear active
      if (openAnalyses.length === 0) {
        activeAnalysisId = null;
      } 
      // If active is not in open, set to first open
      else if (!openAnalyses.includes(activeAnalysisId)) {
        activeAnalysisId = openAnalyses[0];
      }
    }
  }
  
  // Get files for display
  $: if ($persistentFileStore.files) {
    files = $persistentFileStore.files;
  }
  
  // Computed properties for displaying tabs
  $: tabAnalyses = openAnalyses.map(id => {
    const analysis = analyses.find(a => a.id === id);
    if (!analysis) return null;
    
    const file = files.find(f => f.id === analysis.fileId);
    const fileName = file ? file.filename : 'Unknown file';
    
    return {
      ...analysis,
      fileName,
      isActive: id === activeAnalysisId
    };
  }).filter(a => a !== null);
  
  // Switch to a tab
  function switchTab(id) {
    if (openAnalyses.includes(id)) {
      activeAnalysisId = id;
      dispatch('tabChange', { id });
    }
  }
  
  // Close a tab
  function closeTab(id, event) {
    event.stopPropagation();
    
    const index = openAnalyses.indexOf(id);
    if (index === -1) return;
    
    // Remove from open analyses
    const newOpenAnalyses = [...openAnalyses];
    newOpenAnalyses.splice(index, 1);
    
    // If closing active tab, switch to another tab if available
    if (id === activeAnalysisId) {
      const newActiveId = newOpenAnalyses.length > 0 
        ? (index < newOpenAnalyses.length ? newOpenAnalyses[index] : newOpenAnalyses[newOpenAnalyses.length - 1])
        : null;
      
      activeAnalysisId = newActiveId;
    }
    
    openAnalyses = newOpenAnalyses;
    dispatch('tabClose', { id });
  }
  
  // Open a new tab
  function openTab(id) {
    if (!id || openAnalyses.includes(id)) {
      if (id) switchTab(id);
      return;
    }
    
    openAnalyses = [...openAnalyses, id];
    activeAnalysisId = id;
    dispatch('tabOpen', { id });
  }
  
  // Get method display name
  function getMethodDisplayName(method) {
    if (!method) return 'Unknown';
    return method.toUpperCase();
  }
  
  // Get status icon
  function getStatusIcon(status) {
    switch (status) {
      case 'running':
        return `<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>`;
      case 'completed':
        return `<svg class="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>`;
      case 'error':
        return `<svg class="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>`;
      default:
        return `<svg class="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>`;
    }
  }
  
  // Save the open tabs to localStorage
  function saveTabState() {
    if (typeof window !== 'undefined') {
      const tabState = {
        openAnalyses,
        activeAnalysisId
      };
      localStorage.setItem('analysisTabState', JSON.stringify(tabState));
    }
  }
  
  // Load tab state from localStorage
  function loadTabState() {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('analysisTabState');
      if (savedState) {
        try {
          const { openAnalyses: savedOpenAnalyses, activeAnalysisId: savedActiveId } = JSON.parse(savedState);
          
          if (Array.isArray(savedOpenAnalyses)) {
            openAnalyses = savedOpenAnalyses;
          }
          
          if (savedActiveId) {
            activeAnalysisId = savedActiveId;
          }
        } catch (error) {
          console.error('Error loading tab state:', error);
        }
      }
    }
    loaded = true;
  }
  
  // Update URL with active analysis
  function updateUrlWithAnalysis(id) {
    if (typeof window !== 'undefined' && id) {
      const url = new URL(window.location);
      url.searchParams.set('analysis', id);
      window.history.replaceState({}, '', url);
    } else if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.delete('analysis');
      window.history.replaceState({}, '', url);
    }
  }
  
  // Watch for changes to save state
  $: if (loaded) {
    saveTabState();
    updateUrlWithAnalysis(activeAnalysisId);
  }
  
  onMount(() => {
    // Check URL for analysis ID first
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const analysisId = urlParams.get('analysis');
      
      if (analysisId) {
        openTab(analysisId);
      } else {
        // Load from localStorage if no URL parameter
        loadTabState();
      }
    } else {
      loadTabState();
    }
    
    // Watch for store changes
    const unsubscribe = analysisStore.subscribe(({ analyses }) => {
      // Check if any open analysis status has changed
      for (const id of openAnalyses) {
        const analysis = analyses.find(a => a.id === id);
        if (analysis && analysis.status === 'completed' && id === activeAnalysisId) {
          // If a running analysis completes and is active, trigger a refresh
          dispatch('analysisCompleted', { id });
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  });
</script>

<div class="analysis-tabs">
  <!-- Tab list -->
  <div class="border-b border-gray-200">
    <ul class="flex flex-wrap -mb-px">
      {#each tabAnalyses as analysis (analysis.id)}
        <li class="mr-1">
          <button
            class="inline-flex items-center py-2 px-4 text-sm font-medium rounded-t-lg border-b-2 transition-colors"
            class:border-blue-500={analysis.isActive}
            class:text-blue-600={analysis.isActive}
            class:border-transparent={!analysis.isActive}
            class:text-gray-500={!analysis.isActive}
            class:hover:text-gray-600={!analysis.isActive}
            class:hover:border-gray-300={!analysis.isActive}
            on:click={() => switchTab(analysis.id)}
          >
            <span class="status-icon mr-2">
              {@html getStatusIcon(analysis.status)}
            </span>
            <span class="truncate max-w-[120px]">{getMethodDisplayName(analysis.method)}</span>
            <button 
              class="ml-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none" 
              on:click={(e) => closeTab(analysis.id, e)}
              title="Close tab"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </button>
        </li>
      {/each}
    </ul>
  </div>
  
  <!-- Tab content -->
  <div class="tab-content py-4">
    {#if activeAnalysisId}
      <div transition:fade={{ duration: 150 }}>
        <slot></slot>
      </div>
    {:else}
      <div class="text-center py-8 text-gray-500">
        <p>No analysis selected. Select an analysis from the history to view results.</p>
      </div>
    {/if}
  </div>
</div>