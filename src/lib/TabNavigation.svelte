<script>
  import { currentFile } from '../stores/fileInfo';
  import { analysisStore } from '../stores/analyses';
  import { treeStore } from '../stores/tree';
  import TabNavButton from './TabNavButton.svelte';
  
  // Props
  export let activeTab = 'data';
  export let onChange = (tabName) => {};
  
  // State tracking
  $: hasFile = !!$currentFile;
  $: hasAnalyses = $analysisStore?.analyses?.length > 0;
  $: hasTree = $treeStore && ($treeStore.nj || $treeStore.usertree);
  
  // Button configs based on current tab
  $: navConfig = getNavConfig(activeTab, hasFile, hasAnalyses, hasTree);
  
  // Helper function to get step number based on tab name
  function getStepNumber(tabName) {
    switch(tabName) {
      case 'data': return 1;
      case 'analyze': return 2;
      case 'results': return 3;
      default: return null;
    }
  }
  
  // Handle tree warning when moving to analyze tab
  function handleToAnalyzeTab() {
    if (!hasTree && hasFile) {
      if (confirm('A phylogenetic tree is required for analysis. Do you want to generate a tree first?')) {
        // Stay on data tab to generate tree
        return;
      }
    }
    
    // Proceed to analyze tab
    onChange('analyze');
  }
  
  // Helper to get navigation configuration based on active tab
  function getNavConfig(tab, hasFile, hasAnalyses, hasTree) {
    switch(tab) {
      case 'data':
        return {
          back: null,
          forward: {
            label: 'Analyze',
            disabled: !hasFile,
            tooltip: !hasFile ? 'Upload or select a file first' : 
                    !hasTree ? 'Generate a phylogenetic tree first' : 'Continue to analysis',
            onClick: () => handleToAnalyzeTab(),
            step: 2 // Step 2 for Analyze
          }
        };
      
      case 'analyze':
        return {
          back: {
            label: 'Data',
            disabled: false,
            tooltip: 'Back to data selection',
            onClick: () => onChange('data'),
            step: 1 // Step 1 for Data
          },
          forward: {
            label: 'Results',
            disabled: !hasAnalyses,
            tooltip: !hasAnalyses ? 'Run an analysis first' : 'View analysis results',
            onClick: () => onChange('results'),
            step: 3 // Step 3 for Results
          }
        };
      
      case 'results':
        return {
          back: {
            label: 'Analyze',
            disabled: false,
            tooltip: 'Back to analysis',
            onClick: () => onChange('analyze'),
            step: 2 // Step 2 for Analyze
          },
          forward: {
            label: 'New Analysis',
            disabled: false,
            tooltip: 'Start a new analysis with different data',
            onClick: () => onChange('data'),
            step: 1 // Step 1 for Data
          }
        };
      
      default:
        return { back: null, forward: null };
    }
  }
</script>

<!-- Removed redundant bottom navigation buttons to consolidate navigation to the top tab bar -->