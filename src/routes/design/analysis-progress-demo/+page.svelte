<script>
  import AnalysisProgress from '../../../lib/AnalysisProgress.svelte';
  import EnhancedAnalysisProgress from '../../../lib/EnhancedAnalysisProgress.svelte';
  import AnalysisProgressRams from '../../../lib/AnalysisProgressRams.svelte';
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  
  // Create a mock analysis store for demo purposes
  const mockAnalysisStore = writable({
    analyses: [],
    currentAnalysisId: null,
    isLoading: false,
    error: null,
    activeAnalysis: {
      id: 'demo-analysis',
      status: 'initializing',
      progress: 0,
      message: 'Initializing analysis...',
      logs: []
    }
  });
  
  // Override the imported store
  import { analysisStore } from '../../../stores/analyses';
  
  // Override the store's subscribe method for the demo
  const originalSubscribe = analysisStore.subscribe;
  analysisStore.subscribe = mockAnalysisStore.subscribe;
  
  // Restore the original subscribe on component destroy
  onMount(() => {
    return () => {
      analysisStore.subscribe = originalSubscribe;
    };
  });
  
  // Phases for the demo
  const phases = [
    { id: 'initializing', name: 'Initializing', message: 'Setting up analysis parameters', duration: 2000 },
    { id: 'mounting', name: 'File Preparation', message: 'Preparing sequence files for analysis', duration: 3000 },
    { id: 'running', name: 'Analysis', message: 'Running HyPhy FEL analysis', duration: 10000 },
    { id: 'processing', name: 'Processing', message: 'Processing analysis results', duration: 3000 },
    { id: 'saving', name: 'Saving', message: 'Saving results to database', duration: 2000 },
    { id: 'completed', name: 'Completed', message: 'Analysis completed successfully', duration: 0 }
  ];
  
  // Variables to control demo
  let currentPhaseIndex = 0;
  let progress = 0;
  let runningInterval;
  let demoRunning = false;
  let logs = [];
  
  // Start the demo progression
  function startDemo() {
    if (demoRunning) return;
    
    demoRunning = true;
    currentPhaseIndex = 0;
    progress = 0;
    logs = [];
    
    // Set initial state
    updateAnalysisProgress(phases[currentPhaseIndex].id, 0, phases[currentPhaseIndex].message);
    addLog(phases[currentPhaseIndex].id, phases[currentPhaseIndex].message);
    
    // Progress through phases
    progressPhase();
  }
  
  // Reset the demo
  function resetDemo() {
    demoRunning = false;
    clearInterval(runningInterval);
    currentPhaseIndex = 0;
    progress = 0;
    logs = [];
    updateAnalysisProgress('initializing', 0, 'Initializing analysis...');
  }
  
  // Progress through a single phase
  function progressPhase() {
    const phase = phases[currentPhaseIndex];
    const startProgress = currentPhaseIndex > 0 
      ? (currentPhaseIndex / phases.length) * 100
      : 0;
    const endProgress = ((currentPhaseIndex + 1) / phases.length) * 100;
    const progressIncrement = (endProgress - startProgress) / 10; // 10 steps per phase
    
    let phaseProgress = 0;
    
    // Clear any existing interval
    clearInterval(runningInterval);
    
    // Set up a new interval for this phase
    runningInterval = setInterval(() => {
      phaseProgress += progressIncrement;
      progress = Math.min(startProgress + phaseProgress, endProgress);
      
      // Add random logs during the phase
      if (Math.random() < 0.3) {
        addLog(phase.id, `${phase.message} - step ${Math.floor(phaseProgress / progressIncrement)}`);
      }
      
      // Update the progress store
      updateAnalysisProgress(phase.id, progress, phase.message);
      
      // If we've reached the end of this phase
      if (progress >= endProgress) {
        clearInterval(runningInterval);
        
        // Move to the next phase or complete
        currentPhaseIndex++;
        if (currentPhaseIndex < phases.length) {
          // Add a log for the new phase
          addLog(phases[currentPhaseIndex].id, phases[currentPhaseIndex].message);
          // Start the next phase
          progressPhase();
        } else {
          // Demo is complete
          demoRunning = false;
        }
      }
    }, phase.duration / 10);
  }
  
  // Update the analysis progress store
  function updateAnalysisProgress(status, progress, message) {
    mockAnalysisStore.update(state => ({
      ...state,
      activeAnalysis: {
        ...state.activeAnalysis,
        status,
        progress: Math.round(progress),
        message,
        logs: [...logs]
      }
    }));
  }
  
  // Add a log entry
  function addLog(status, message) {
    logs = [...logs, {
      time: new Date().toISOString(),
      status,
      message
    }];
  }
  
  // Clean up on component destruction
  onMount(() => {
    return () => {
      clearInterval(runningInterval);
    };
  });
  
  // UI state
  let selectedTab = 'original';
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Analysis Progress Component</h1>
    <p class="mb-8 text-gray-600">A comparison of the original and redesigned components based on Dieter Rams' principles.</p>
    
    <!-- Demo controls -->
    <div class="mb-8 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
      <div>
        <h2 class="text-lg font-semibold">Demo Controls</h2>
        <p class="text-sm text-gray-600">Run the simulated analysis to see the progress components in action.</p>
      </div>
      <div class="flex gap-4">
        <button 
          class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
          on:click={startDemo}
          disabled={demoRunning}
        >
          {demoRunning ? 'Demo Running...' : 'Start Demo'}
        </button>
        <button 
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          on:click={resetDemo}
        >
          Reset
        </button>
      </div>
    </div>
    
    <!-- Component tabs -->
    <div class="mb-4">
      <div class="flex border-b">
        <button 
          class="border-b-2 px-4 py-2 text-sm font-medium"
          class:border-blue-600={selectedTab === 'original'} 
          class:text-blue-600={selectedTab === 'original'}
          class:border-transparent={selectedTab !== 'original'} 
          class:text-gray-500={selectedTab !== 'original'}
          on:click={() => selectedTab = 'original'}
        >
          Original
        </button>
        <button 
          class="border-b-2 px-4 py-2 text-sm font-medium"
          class:border-blue-600={selectedTab === 'enhanced'} 
          class:text-blue-600={selectedTab === 'enhanced'}
          class:border-transparent={selectedTab !== 'enhanced'} 
          class:text-gray-500={selectedTab !== 'enhanced'}
          on:click={() => selectedTab = 'enhanced'}
        >
          Enhanced
        </button>
        <button 
          class="border-b-2 px-4 py-2 text-sm font-medium"
          class:border-blue-600={selectedTab === 'rams'} 
          class:text-blue-600={selectedTab === 'rams'}
          class:border-transparent={selectedTab !== 'rams'} 
          class:text-gray-500={selectedTab !== 'rams'}
          on:click={() => selectedTab = 'rams'}
        >
          Dieter Rams Redesign
        </button>
      </div>
    </div>
    
    <!-- Component display -->
    <div class="mb-16">
      {#if selectedTab === 'original'}
        <div class="mb-4">
          <h3 class="text-lg font-medium">Original Component</h3>
          <p class="text-sm text-gray-600">The initial implementation of the analysis progress component.</p>
        </div>
        <AnalysisProgress />
      {:else if selectedTab === 'enhanced'}
        <div class="mb-4">
          <h3 class="text-lg font-medium">Enhanced Component</h3>
          <p class="text-sm text-gray-600">An enhanced version with more detailed information and phase visualization.</p>
        </div>
        <EnhancedAnalysisProgress />
      {:else if selectedTab === 'rams'}
        <div class="mb-4">
          <h3 class="text-lg font-medium">Dieter Rams Redesign</h3>
          <p class="text-sm text-gray-600">A minimalist redesign following Dieter Rams' principles of good design.</p>
        </div>
        <AnalysisProgressRams />
      {/if}
    </div>
    
    <!-- Design principles section -->
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-xl font-bold">Dieter Rams' Design Principles Applied</h2>
      
      <div class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Good Design Is As Little Design As Possible</h3>
        <p class="text-gray-600">The redesign focuses on essential information and reduces visual noise. It presents only what users need to know at first glance.</p>
      </div>
      
      <div class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Good Design Makes a Product Understandable</h3>
        <p class="text-gray-600">Information is organized in a clear hierarchy, with the most important status and progress indicators immediately visible.</p>
      </div>
      
      <div class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Good Design Is Honest</h3>
        <p class="text-gray-600">The component clearly communicates analysis status without misleading users or hiding important information.</p>
      </div>
      
      <div>
        <h3 class="mb-2 text-lg font-medium">Good Design Is Unobtrusive</h3>
        <p class="text-gray-600">Technical details are available but don't overwhelm the interface. Progressive disclosure allows users to access additional information when needed.</p>
      </div>
    </div>
  </div>
</div>