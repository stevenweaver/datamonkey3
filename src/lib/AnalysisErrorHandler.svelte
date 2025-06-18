<script>
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { analysisStore } from '../stores/analyses';
  import { hyPhyAnalysisRunner } from './services/HyPhyAnalysisRunner';
  
  // Props
  export let analysisId = null;
  export let onRetry = () => {};
  export let onDismiss = () => {};
  
  // State
  let error = null;
  let errorDetails = null;
  let showDetails = false;
  let recoveryOptions = [];
  let selectedRecoveryOption = null;
  
  // Reactive statement to update error when the active analysis changes
  $: {
    if ($analysisStore.activeAnalysis && $analysisStore.activeAnalysis.status === 'error') {
      // Extract error information
      error = getErrorMessage($analysisStore.activeAnalysis);
      errorDetails = getErrorDetails($analysisStore.activeAnalysis);
      
      // Generate recovery options based on the error
      recoveryOptions = generateRecoveryOptions(error, errorDetails);
      
      // Select the first recovery option by default
      if (recoveryOptions.length > 0 && !selectedRecoveryOption) {
        selectedRecoveryOption = recoveryOptions[0];
      }
    } else {
      // Reset error state if there's no error
      error = null;
      errorDetails = null;
      recoveryOptions = [];
      selectedRecoveryOption = null;
    }
  }
  
  /**
   * Extract a user-friendly error message from the analysis
   * @param {Object} analysis - The analysis object
   * @returns {string} A user-friendly error message
   */
  function getErrorMessage(analysis) {
    // First try to get the error from the message
    if (analysis.message && analysis.message.includes('Error:')) {
      return analysis.message.split('Error:')[1].trim();
    }
    
    // Look for error messages in the logs
    if (analysis.logs && analysis.logs.length > 0) {
      for (let i = analysis.logs.length - 1; i >= 0; i--) {
        const log = analysis.logs[i];
        if (log.message.includes('Error:')) {
          return log.message.split('Error:')[1].trim();
        }
        if (log.message.includes('Failed:')) {
          return log.message.split('Failed:')[1].trim();
        }
      }
    }
    
    // Default error message
    return 'An unexpected error occurred during analysis';
  }
  
  /**
   * Extract detailed error information from the analysis
   * @param {Object} analysis - The analysis object
   * @returns {string} Detailed error information
   */
  function getErrorDetails(analysis) {
    // Look for technical details in the logs
    if (analysis.logs && analysis.logs.length > 0) {
      for (let i = analysis.logs.length - 1; i >= 0; i--) {
        const log = analysis.logs[i];
        
        // Check for code blocks or stack traces
        if (log.message.includes('```')) {
          const codeMatch = log.message.match(/```(?:.*?)\n([\s\S]*?)```/);
          if (codeMatch && codeMatch[1]) {
            return codeMatch[1].trim();
          }
        }
        
        // Check for traceback lines
        if (log.message.includes('Traceback') || log.message.includes('Stack trace')) {
          return log.message;
        }
      }
    }
    
    // No detailed information available
    return null;
  }
  
  /**
   * Generate recovery options based on the error
   * @param {string} errorMessage - The error message
   * @param {string} errorDetails - Detailed error information
   * @returns {Array} Array of recovery option objects
   */
  function generateRecoveryOptions(errorMessage, errorDetails) {
    const options = [];
    
    // Always offer a retry option
    options.push({
      id: 'retry',
      label: 'Retry Analysis',
      description: 'Run the analysis again with the same parameters',
      action: handleRetry
    });
    
    // Add specific recovery options based on error patterns
    if (errorMessage && errorMessage.includes('convergence')) {
      // Convergence issues
      options.push({
        id: 'increase-iterations',
        label: 'Increase Maximum Iterations',
        description: 'Try again with more iterations to help reach convergence',
        action: () => handleRetryWithOption({ maxIterations: 1000 })
      });
    }
    
    if (errorMessage && errorMessage.includes('memory') || (errorDetails && errorDetails.includes('memory'))) {
      // Memory issues
      options.push({
        id: 'reduce-sites',
        label: 'Reduce Number of Sites',
        description: 'Analyze a subset of sites to reduce memory usage',
        action: () => handleRetryWithOption({ subsample: true })
      });
    }
    
    if (errorMessage && errorMessage.includes('timeout')) {
      // Timeout issues
      options.push({
        id: 'simple-model',
        label: 'Use Simpler Model',
        description: 'Try a less computationally intensive model',
        action: () => handleRetryWithOption({ simplifiedModel: true })
      });
    }
    
    // Always offer an option to try different parameters
    options.push({
      id: 'change-params',
      label: 'Change Parameters',
      description: 'Modify analysis parameters and try again',
      action: handleChangeParameters
    });
    
    return options;
  }
  
  /**
   * Handle the retry action
   */
  function handleRetry() {
    // Call the parent's onRetry callback
    onRetry();
  }
  
  /**
   * Handle retrying with modified options
   * @param {Object} options - Modified options for the retry
   */
  function handleRetryWithOption(options) {
    // Call the parent's onRetry callback with options
    onRetry(options);
  }
  
  /**
   * Handle changing parameters
   */
  function handleChangeParameters() {
    // Dismiss the error handler and let the parent know to show parameter options
    onDismiss({ showParameters: true });
  }
  
  /**
   * Handle dismissing the error
   */
  function handleDismiss() {
    onDismiss();
  }
</script>

{#if error}
  <div 
    class="analysis-error mt-4 overflow-hidden rounded-lg border border-red-200 bg-white shadow-sm"
    transition:slide={{ duration: 300 }}
  >
    <div class="border-b border-red-100 bg-red-50 p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">Analysis Failed</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          
          {#if errorDetails}
            <div class="mt-2">
              <button 
                class="text-xs font-medium text-red-800 underline"
                on:click={() => showDetails = !showDetails}
              >
                {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
              </button>
              
              {#if showDetails}
                <div class="mt-2 max-h-32 overflow-y-auto rounded border border-red-200 bg-red-50 p-2 font-mono text-xs text-red-800">
                  <pre>{errorDetails}</pre>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <div class="p-4">
      <h4 class="mb-3 text-sm font-medium text-gray-700">Recovery Options</h4>
      
      <div class="space-y-3">
        {#each recoveryOptions as option}
          <div 
            class="flex cursor-pointer items-start rounded-md border p-3 transition-colors"
            class:border-blue-300={selectedRecoveryOption === option}
            class:bg-blue-50={selectedRecoveryOption === option}
            class:border-gray-200={selectedRecoveryOption !== option}
            class:hover:border-blue-200={selectedRecoveryOption !== option}
            on:click={() => selectedRecoveryOption = option}
          >
            <input 
              type="radio" 
              name="recovery-option" 
              value={option.id} 
              checked={selectedRecoveryOption === option}
              class="mt-0.5 h-4 w-4 cursor-pointer text-blue-600"
            />
            <div class="ml-3">
              <label class="block text-sm font-medium text-gray-700 cursor-pointer">
                {option.label}
              </label>
              <p class="text-xs text-gray-500">{option.description}</p>
            </div>
          </div>
        {/each}
      </div>
      
      <div class="mt-4 flex justify-end space-x-3">
        <button 
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          on:click={handleDismiss}
        >
          Dismiss
        </button>
        
        <button 
          class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          on:click={() => selectedRecoveryOption?.action()}
          disabled={!selectedRecoveryOption}
        >
          {selectedRecoveryOption?.label || 'Continue'}
        </button>
      </div>
    </div>
  </div>
{/if}