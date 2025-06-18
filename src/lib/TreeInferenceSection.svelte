<script>
  import { onMount } from 'svelte';
  import { treeStore } from '../stores/tree';
  import { currentFile, fileMetricsStore } from '../stores/fileInfo';
  
  // Tree status constants
  const STATUS = {
    NONE: 'none',
    AVAILABLE: 'available',
    GENERATING: 'generating',
    COMPLETE: 'complete',
    ERROR: 'error'
  };
  
  // Props
  export let onTreeGenerated = () => {};
  
  // Local state
  let treeSource = 'infer'; // 'infer' or 'uploaded'
  let treeStatus = STATUS.NONE;
  let showAdvancedOptions = false;
  let errorMessage = '';
  let treeGenerationProgress = 0;
  
  // Advanced options
  let selectedMethod = 'nj'; // 'nj' (Neighbor Joining) or 'ml' (Maximum Likelihood)
  let bootstrapReps = 0; // Number of bootstrap replicates (0 = none)
  let substitutionModel = 'GTR'; // Substitution model for ML
  
  // Reactive variables
  $: hasUploadedTree = $treeStore && $treeStore.usertree;
  $: hasInferredTree = $treeStore && $treeStore.nj;
  $: hasAnyTree = hasUploadedTree || hasInferredTree;
  $: canGenerateTree = !!$currentFile && treeStatus !== STATUS.GENERATING;
  $: isTreeComplete = treeStatus === STATUS.COMPLETE;
  
  // When component mounts, check for existing trees
  onMount(() => {
    if (hasUploadedTree) {
      treeSource = 'uploaded';
      treeStatus = STATUS.AVAILABLE;
    } else if (hasInferredTree) {
      treeSource = 'infer';
      treeStatus = STATUS.COMPLETE;
    } else {
      treeStatus = $currentFile ? STATUS.NONE : STATUS.NONE;
    }
  });
  
  // Update status when tree store changes
  $: if ($treeStore) {
    if (treeSource === 'uploaded' && hasUploadedTree) {
      treeStatus = STATUS.AVAILABLE;
    } else if (treeSource === 'infer' && hasInferredTree) {
      treeStatus = STATUS.COMPLETE;
    }
  }
  
  // Function to generate tree
  async function generateTree() {
    if (!canGenerateTree) return;
    
    try {
      treeStatus = STATUS.GENERATING;
      treeGenerationProgress = 0;
      errorMessage = '';
      
      // Simulate tree generation progress
      const progressInterval = setInterval(() => {
        if (treeGenerationProgress < 95) {
          treeGenerationProgress += Math.random() * 10;
        }
      }, 300);
      
      // In a real implementation, this would call the actual tree inference method
      // For now, we'll simulate a delay and use existing NJ tree if available
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      treeGenerationProgress = 100;
      
      // In a real implementation, this would update the tree store with the newly generated tree
      // For demonstration, we'll assume it's successful if we have file metrics
      if ($fileMetricsStore && $fileMetricsStore.FILE_INFO && $fileMetricsStore.FILE_INFO.nj) {
        treeStatus = STATUS.COMPLETE;
        onTreeGenerated();
      } else {
        throw new Error('Could not generate tree. File metrics not available.');
      }
    } catch (error) {
      treeStatus = STATUS.ERROR;
      errorMessage = error.message || 'An error occurred during tree generation';
      console.error('Tree generation error:', error);
    }
  }
  
  // Function to toggle advanced options
  function toggleAdvancedOptions() {
    showAdvancedOptions = !showAdvancedOptions;
  }
  
  // Function to get status text
  function getStatusText() {
    switch (treeStatus) {
      case STATUS.NONE:
        return 'No tree available';
      case STATUS.AVAILABLE:
        return 'Tree available from upload';
      case STATUS.GENERATING:
        return 'Generating tree...';
      case STATUS.COMPLETE:
        return 'Tree generated successfully';
      case STATUS.ERROR:
        return `Error: ${errorMessage}`;
      default:
        return 'Unknown status';
    }
  }
  
  // Function to get status icon
  function getStatusIcon() {
    switch (treeStatus) {
      case STATUS.NONE:
        return '⚠️';
      case STATUS.AVAILABLE:
        return '✓';
      case STATUS.GENERATING:
        return '⏳';
      case STATUS.COMPLETE:
        return '✅';
      case STATUS.ERROR:
        return '❌';
      default:
        return '❓';
    }
  }
  
  // Function to reset tree generation
  function resetTree() {
    treeStatus = STATUS.NONE;
    errorMessage = '';
    treeGenerationProgress = 0;
  }
</script>

<div class="mb-premium-xl">
  <h2 class="text-premium-header font-semibold text-text-rich mb-premium-md">
    <span class="mr-premium-xs">🌳</span> Phylogenetic Tree
  </h2>
  
  <div class="rounded-premium border border-border-platinum bg-white p-premium-lg shadow-premium">
    {#if !$currentFile}
      <div class="text-center p-premium-md bg-brand-whisper rounded-premium">
        <p class="text-premium-body text-text-slate">Upload a sequence file to generate a phylogenetic tree</p>
      </div>
    {:else}
      <!-- Tree Source Selection -->
      <div class="mb-premium-md">
        <div class="flex items-center mb-premium-sm">
          <label class="text-premium-body font-medium text-text-rich">Tree Source:</label>
          <div class="text-premium-caption ml-premium-md px-premium-sm py-premium-xs rounded-premium-sm bg-brand-whisper text-text-slate">
            {#if treeStatus === STATUS.GENERATING}
              <span class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-royal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Status: {getStatusText()}
              </span>
            {:else}
              <span>Status: {getStatusIcon()} {getStatusText()}</span>
            {/if}
          </div>
        </div>
        
        <div class="flex flex-col space-y-premium-sm">
          <label class="flex items-center">
            <input 
              type="radio" 
              bind:group={treeSource} 
              value="uploaded" 
              disabled={!hasUploadedTree || treeStatus === STATUS.GENERATING}
              class="mr-premium-sm h-4 w-4 text-brand-royal focus:ring-brand-muted"
            />
            <span class="text-premium-body text-text-rich">
              Use uploaded tree
              {#if !hasUploadedTree}
                <span class="text-premium-caption text-text-silver">(No uploaded tree available)</span>
              {/if}
            </span>
          </label>
          
          <label class="flex items-center">
            <input 
              type="radio" 
              bind:group={treeSource} 
              value="infer" 
              disabled={treeStatus === STATUS.GENERATING}
              class="mr-premium-sm h-4 w-4 text-brand-royal focus:ring-brand-muted"
            />
            <span class="text-premium-body text-text-rich">Infer tree automatically</span>
          </label>
        </div>
      </div>
      
      <!-- Advanced Options (collapsible) -->
      <div class="mb-premium-md">
        <button 
          type="button"
          on:click={toggleAdvancedOptions}
          class="flex items-center text-premium-body text-brand-royal hover:text-brand-deep transition-colors duration-premium"
          disabled={treeStatus === STATUS.GENERATING}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 mr-premium-xs transition-transform duration-premium" 
            class:rotate-90={showAdvancedOptions}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          Advanced Tree Options
        </button>
        
        {#if showAdvancedOptions}
          <div class="mt-premium-sm p-premium-md bg-brand-whisper rounded-premium">
            <div class="mb-premium-sm">
              <label class="block text-premium-caption font-medium text-text-rich mb-premium-xs">Tree Building Method</label>
              <select 
                bind:value={selectedMethod}
                disabled={treeStatus === STATUS.GENERATING}
                class="w-full rounded-premium-sm border border-border-platinum px-premium-sm py-premium-xs text-premium-body"
              >
                <option value="nj">Neighbor Joining (Faster)</option>
                <option value="ml">Maximum Likelihood (More Accurate)</option>
              </select>
            </div>
            
            {#if selectedMethod === 'ml'}
              <div class="mb-premium-sm">
                <label class="block text-premium-caption font-medium text-text-rich mb-premium-xs">Substitution Model</label>
                <select 
                  bind:value={substitutionModel}
                  disabled={treeStatus === STATUS.GENERATING}
                  class="w-full rounded-premium-sm border border-border-platinum px-premium-sm py-premium-xs text-premium-body"
                >
                  <option value="JC69">JC69 (Simplest)</option>
                  <option value="K80">K80 (Transition/Transversion)</option>
                  <option value="HKY">HKY (Nucleotide Frequencies)</option>
                  <option value="GTR">GTR (General Time Reversible)</option>
                </select>
              </div>
            {/if}
            
            <div>
              <label class="block text-premium-caption font-medium text-text-rich mb-premium-xs">
                Bootstrap Replicates
                <span class="font-normal text-text-slate">(0 = no bootstrapping)</span>
              </label>
              <input 
                type="number" 
                bind:value={bootstrapReps}
                min="0" 
                max="1000"
                disabled={treeStatus === STATUS.GENERATING}
                class="w-full rounded-premium-sm border border-border-platinum px-premium-sm py-premium-xs text-premium-body"
              />
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Generation Progress (if generating) -->
      {#if treeStatus === STATUS.GENERATING}
        <div class="mb-premium-md">
          <div class="flex justify-between text-premium-caption text-text-slate mb-premium-xs">
            <span>Generating tree...</span>
            <span>{Math.round(treeGenerationProgress)}%</span>
          </div>
          <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-brand-royal transition-all duration-300"
              style="width: {treeGenerationProgress}%"
            ></div>
          </div>
        </div>
      {/if}
      
      <!-- Action Buttons -->
      <div class="flex justify-between items-center">
        <div>
          {#if treeStatus === STATUS.COMPLETE || treeStatus === STATUS.ERROR}
            <button
              type="button"
              on:click={resetTree}
              class="text-premium-body text-text-slate hover:text-brand-royal transition-colors duration-premium"
            >
              Reset
            </button>
          {/if}
        </div>
        
        <button
          type="button"
          on:click={generateTree}
          disabled={!canGenerateTree || treeSource !== 'infer'}
          class="rounded-premium-sm px-premium-md py-premium-sm font-medium text-premium-body transition-all duration-premium"
          class:bg-brand-gradient={canGenerateTree && treeSource === 'infer'}
          class:text-white={canGenerateTree && treeSource === 'infer'}
          class:hover:bg-brand-deep={canGenerateTree && treeSource === 'infer'}
          class:bg-gray-100={!canGenerateTree || treeSource !== 'infer'}
          class:text-gray-400={!canGenerateTree || treeSource !== 'infer'}
          class:cursor-not-allowed={!canGenerateTree || treeSource !== 'infer'}
        >
          {treeStatus === STATUS.COMPLETE ? 'Regenerate Tree' : 'Generate Tree'}
        </button>
      </div>
    {/if}
  </div>
</div>