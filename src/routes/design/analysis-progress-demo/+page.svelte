<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import AnalysisProgress from '../../../lib/AnalysisProgress.svelte';
  import AnalysisProgressRams from '../../../lib/AnalysisProgressRams.svelte';
  import AnalysisErrorHandler from '../../../lib/AnalysisErrorHandler.svelte';
  import EnhancedAnalysisProgress from '../../../lib/EnhancedAnalysisProgress.svelte';
  import { hyphyOutputParser } from '../../../lib/utils/hyphyOutputParser.js';
  
  // Mock analysis store to simulate the real app store
  const mockAnalysisStore = writable({
    activeAnalysis: {
      id: 'demo-analysis',
      status: 'initializing',
      progress: 0,
      message: 'Initializing analysis...',
      logs: []
    }
  });
  
  // Mock the activeAnalysisProgress store to feed our component
  const activeAnalysisProgress = {
    subscribe: mockAnalysisStore.subscribe,
    update: mockAnalysisStore.update
  };
  
  // Override the store module during this demo
  import { analysisStore } from '../../../stores/analyses';
  analysisStore.activeAnalysisProgress = activeAnalysisProgress;
  
  // Demo phases
  const phases = [
    { 
      id: 'initializing', 
      message: 'Initializing HyPhy analysis...', 
      duration: 1500
    },
    { 
      id: 'mounting', 
      message: 'Loading sequence data into memory...', 
      duration: 2000 
    },
    { 
      id: 'running', 
      message: 'Running FEL analysis on 120 sequences...', 
      duration: 8000
    },
    { 
      id: 'processing', 
      message: 'Processing results and computing statistics...', 
      duration: 3000
    },
    { 
      id: 'saving', 
      message: 'Saving results to cache...', 
      duration: 1500
    },
    { 
      id: 'completed', 
      message: 'Analysis completed successfully! Found 3 sites under positive selection.', 
      duration: 0
    }
  ];
  
  // Error scenarios for demo
  const errorScenarios = [
    {
      title: 'Memory Error',
      message: 'Error: The analysis ran out of memory. Try using a smaller dataset or a different method.'
    },
    {
      title: 'Convergence Failure',
      message: 'Error: The likelihood optimization failed to converge after 100 iterations.'
    },
    {
      title: 'Invalid Input',
      message: 'Error: The input alignment contains stop codons at sites 42, 156, and 302.'
    },
    {
      title: 'Execution Timeout',
      message: 'Error: The analysis exceeded the maximum allowed execution time (600 seconds).'
    }
  ];
  
  // Demo state
  let currentPhaseIndex = 0;
  let progress = 0;
  let runningInterval;
  let demoRunning = false;
  let logs = [];
  let showError = false;
  let selectedErrorScenario = errorScenarios[0];
  
  // UI state
  let selectedTab = 'rams'; // Default to the Rams design
  let enableMarkdown = true;
  let simulateRealOutput = false;
  
  // Sample logs for simulation
  const sampleRealOutput = [
    `HyPhy 2.5.31 (MP) for MacOS
Built on Sat Jun 4 16:42:13 2022

Parsing input alignment file...
Found 14 sequences with 1380 sites`,
    
    `Using the following nucleotide model: GTR
Model parameter count: 10
Nucleotide equilibrium frequencies: (0.23, 0.30, 0.22, 0.25)`,
    
    `Log L = -25631.88 | Tree length = 3.45
Computing site likelihoods...
Step 1/100`,
    
    `Step 25/100 | Log L = -24120.54 | Progress: 25%
Testing for selection at sites 1-115`,
    
    `Step 50/100 | Log L = -23010.12 | Progress: 50%
Testing for selection at sites 116-230`,
    
    `Step 75/100 | Log L = -22490.33 | Progress: 75%
Testing for selection at sites 231-345`,
    
    `Step 100/100 | Log L = -22105.21 | Progress: 100%
Testing for selection at sites 346-459`,
    
    `Analysis complete.
Results summary:
- 3 sites under positive selection (p ≤ 0.05)
- 42 sites under negative selection (p ≤ 0.05)
- 414 sites not under selection`
  ];
  
  // Start the demo progression
  function startDemo() {
    demoRunning = true;
    clearInterval(runningInterval);
    currentPhaseIndex = 0;
    progress = 0;
    logs = [];
    showError = false;
    
    // Reset the store
    mockAnalysisStore.update(state => ({
      ...state,
      activeAnalysis: {
        id: 'demo-analysis',
        status: 'initializing',
        progress: 0,
        message: 'Initializing analysis...',
        logs: []
      }
    }));
    
    if (simulateRealOutput) {
      // Use the sample real output for simulation
      simulateRealHyPhyOutput();
    } else {
      // Use the structured phases for simulation
      simulateStructuredOutput();
    }
  }
  
  // Simulate with structured, prepared phases
  function simulateStructuredOutput() {
    // Set initial state
    addLog(phases[0].id, phases[0].message);
    updateAnalysisProgress(phases[0].id, 0, phases[0].message);
    
    // Progress through phases
    progressPhase();
  }
  
  // Simulate with more realistic HyPhy output format
  function simulateRealHyPhyOutput() {
    let timeOffset = 0;
    const totalDuration = 20000; // 20 seconds for the whole simulation
    const stepDuration = totalDuration / sampleRealOutput.length;
    
    // Process each output chunk
    sampleRealOutput.forEach((output, index) => {
      setTimeout(() => {
        if (!demoRunning) return;
        
        // Calculate progress based on the current step
        const stepProgress = Math.round(((index + 1) / sampleRealOutput.length) * 100);
        
        // Determine status based on content
        let status = 'running';
        if (index === 0) status = 'initializing';
        else if (index === sampleRealOutput.length - 1) status = 'completed';
        else if (index >= sampleRealOutput.length - 2) status = 'processing';
        
        // Create a log entry with Markdown formatting
        addLog(status, output);
        
        // Update the analysis progress in the store
        updateAnalysisProgress(status, stepProgress, output);
        
        // If this is the last step, mark as completed
        if (index === sampleRealOutput.length - 1) {
          demoRunning = false;
        }
      }, timeOffset);
      
      timeOffset += stepDuration;
    });
  }
  
  // Reset the demo
  function resetDemo() {
    demoRunning = false;
    clearInterval(runningInterval);
    currentPhaseIndex = 0;
    progress = 0;
    logs = [];
    showError = false;
    
    // Reset the store
    mockAnalysisStore.update(state => ({
      ...state,
      activeAnalysis: {
        id: 'demo-analysis',
        status: 'initializing',
        progress: 0,
        message: 'Initializing analysis...',
        logs: []
      }
    }));
  }
  
  // Simulate an error
  function simulateError() {
    if (!demoRunning) {
      startDemo();
      
      // Wait a bit before showing the error
      setTimeout(() => {
        showError = true;
        demoRunning = false;
        
        // Add the error log
        addLog('error', selectedErrorScenario.message);
        
        // Update the store with the error
        updateAnalysisProgress('error', progress, selectedErrorScenario.message);
      }, 3000);
    } else {
      // If already running, show the error immediately
      showError = true;
      demoRunning = false;
      clearInterval(runningInterval);
      
      // Add the error log
      addLog('error', selectedErrorScenario.message);
      
      // Update the store with the error
      updateAnalysisProgress('error', progress, selectedErrorScenario.message);
    }
  }
  
  // Progress through a single phase
  function progressPhase() {
    if (!demoRunning || currentPhaseIndex >= phases.length) {
      demoRunning = currentPhaseIndex < phases.length;
      return;
    }
    
    const phase = phases[currentPhaseIndex];
    const phaseDuration = phase.duration;
    const startProgress = currentPhaseIndex === 0 ? 0 : Math.round((currentPhaseIndex / phases.length) * 100);
    const endProgress = Math.round(((currentPhaseIndex + 1) / phases.length) * 100);
    const progressIncrement = (endProgress - startProgress) / 10; // 10 steps per phase
    let phaseProgress = 0;
    
    // Set up a new interval for this phase
    runningInterval = setInterval(() => {
      if (!demoRunning) {
        clearInterval(runningInterval);
        return;
      }
      
      phaseProgress += progressIncrement;
      progress = Math.min(startProgress + phaseProgress, endProgress);
      
      // Update the progress store
      updateAnalysisProgress(phase.id, progress, phase.message);
      
      // If we've reached the end of this phase, move to the next
      if (progress >= endProgress) {
        clearInterval(runningInterval);
        currentPhaseIndex++;
        
        // If this was the last phase, we're done
        if (currentPhaseIndex >= phases.length) {
          demoRunning = false;
          return;
        }
        
        // Otherwise, start the next phase
        const nextPhase = phases[currentPhaseIndex];
        addLog(nextPhase.id, nextPhase.message);
        updateAnalysisProgress(nextPhase.id, progress, nextPhase.message);
        progressPhase();
      }
    }, phaseDuration / 10); // 10 steps per phase
  }
  
  // Update the analysis progress store
  function updateAnalysisProgress(status, progress, message) {
    mockAnalysisStore.update(state => {
      // Check if we already have this message in logs to avoid duplication
      const logMessages = logs.map(log => log.message);
      const updatedLogs = [...logs];
      
      // Add the message to logs if it's not there
      if (!logMessages.includes(message)) {
        updatedLogs.push({
          time: new Date().toISOString(),
          status,
          message
        });
      }
      
      return {
        ...state,
        activeAnalysis: {
          ...state.activeAnalysis,
          status,
          progress: Math.round(progress),
          message,
          logs: updatedLogs
        }
      };
    });
  }
  
  // Add a log entry
  function addLog(status, message) {
    logs = [...logs, {
      time: new Date().toISOString(),
      status,
      message
    }];
  }
  
  // Handle retry after error
  function handleRetry() {
    showError = false;
    startDemo();
  }
  
  // Handle dismiss of error
  function handleDismiss() {
    showError = false;
    resetDemo();
  }
  
  // Clean up on component destruction
  onMount(() => {
    return () => {
      clearInterval(runningInterval);
    };
  });
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="container mx-auto">
    <h1 class="mb-2 text-3xl font-bold text-gray-900">Analysis Progress Demo</h1>
    <p class="mb-8 text-gray-600">A comparison of the original and redesigned components based on Dieter Rams' principles.</p>
    
    <!-- Demo controls -->
    <div class="mb-8 rounded-lg bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-lg font-semibold">Demo Controls</h2>
          <p class="text-sm text-gray-600">Run the simulated analysis to see the progress components in action.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button 
            class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
            on:click={startDemo}
            disabled={demoRunning}
          >
            {demoRunning ? 'Demo Running...' : 'Start Demo'}
          </button>
          <button 
            class="rounded-md border border-red-400 bg-white px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
            on:click={simulateError}
            disabled={showError}
          >
            Simulate Error
          </button>
          <button 
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            on:click={resetDemo}
          >
            Reset
          </button>
        </div>
      </div>
      
      <!-- Demo options -->
      <div class="mt-4 border-t border-gray-100 pt-4">
        <h3 class="mb-2 text-sm font-medium text-gray-700">Demo Options</h3>
        
        <div class="grid gap-4 md:grid-cols-2">
          <!-- Markdown option -->
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="enable-markdown" 
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              bind:checked={enableMarkdown}
            />
            <label for="enable-markdown" class="ml-2 text-sm text-gray-700">
              Enable Markdown Rendering
            </label>
          </div>
          
          <!-- Real output option -->
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="simulate-real-output" 
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              bind:checked={simulateRealOutput}
            />
            <label for="simulate-real-output" class="ml-2 text-sm text-gray-700">
              Simulate Real HyPhy Output
            </label>
          </div>
          
          <!-- Error scenario selector -->
          <div class="md:col-span-2">
            <label for="error-scenario" class="block text-sm font-medium text-gray-700">
              Error Scenario
            </label>
            <select 
              id="error-scenario" 
              class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              bind:value={selectedErrorScenario}
            >
              {#each errorScenarios as scenario}
                <option value={scenario}>{scenario.title}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Component selector tabs -->
    <div class="mb-6 flex rounded-lg bg-white shadow-sm overflow-hidden">
      <button
        class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
        class:bg-brand-royal={selectedTab === 'original'}
        class:text-white={selectedTab === 'original'}
        class:bg-white={selectedTab !== 'original'}
        class:text-gray-700={selectedTab !== 'original'}
        class:hover:bg-gray-50={selectedTab !== 'original'}
        on:click={() => selectedTab = 'original'}
      >
        Original
      </button>
      <button
        class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
        class:bg-brand-royal={selectedTab === 'enhanced'}
        class:text-white={selectedTab === 'enhanced'}
        class:bg-white={selectedTab !== 'enhanced'}
        class:text-gray-700={selectedTab !== 'enhanced'}
        class:hover:bg-gray-50={selectedTab !== 'enhanced'}
        on:click={() => selectedTab = 'enhanced'}
      >
        Enhanced
      </button>
      <button
        class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
        class:bg-brand-royal={selectedTab === 'rams'}
        class:text-white={selectedTab === 'rams'}
        class:bg-white={selectedTab !== 'rams'}
        class:text-gray-700={selectedTab !== 'rams'}
        class:hover:bg-gray-50={selectedTab !== 'rams'}
        on:click={() => selectedTab = 'rams'}
      >
        Dieter Rams
      </button>
    </div>
    
    <!-- Component display -->
    <div class="mb-8">
      {#if selectedTab === 'original'}
        <div class="mb-4">
          <h3 class="text-lg font-medium">Original Component</h3>
          <p class="text-sm text-gray-600">The initial implementation of the analysis progress component.</p>
        </div>
        <AnalysisProgress />
        
        <!-- Error handler (if showing error) -->
        {#if showError}
          <AnalysisErrorHandler
            analysisId="demo-analysis"
            onRetry={handleRetry}
            onDismiss={handleDismiss}
          />
        {/if}
      {:else if selectedTab === 'enhanced'}
        <div class="mb-4">
          <h3 class="text-lg font-medium">Enhanced Component</h3>
          <p class="text-sm text-gray-600">An enhanced version with more detailed information and phase visualization.</p>
        </div>
        <!-- This component might not exist yet -->
        {#if typeof EnhancedAnalysisProgress !== 'undefined'}
          <EnhancedAnalysisProgress />
        {:else}
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <p class="text-gray-500">Enhanced component not implemented yet.</p>
          </div>
        {/if}
        
        <!-- Error handler (if showing error) -->
        {#if showError}
          <AnalysisErrorHandler
            analysisId="demo-analysis"
            onRetry={handleRetry}
            onDismiss={handleDismiss}
          />
        {/if}
      {:else if selectedTab === 'rams'}
        <div class="mb-4">
          <h3 class="text-lg font-medium">Dieter Rams Redesign</h3>
          <p class="text-sm text-gray-600">A minimalist redesign following Dieter Rams' principles of good design.</p>
        </div>
        <AnalysisProgressRams {enableMarkdown} />
        
        <!-- Error handler (if showing error) -->
        {#if showError}
          <AnalysisErrorHandler
            analysisId="demo-analysis"
            onRetry={handleRetry}
            onDismiss={handleDismiss}
          />
        {/if}
      {/if}
    </div>
    
    <!-- Design principles -->
    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <h2 class="mb-4 text-xl font-bold text-gray-900">Dieter Rams Design Principles</h2>
      
      <div class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Good Design Is As Little Design As Possible</h3>
        <p class="text-gray-600">The redesigned component focuses only on essential elements, removing unnecessary decorations and focusing on clarity and function.</p>
      </div>
      
      <div class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Good Design Is Honest</h3>
        <p class="text-gray-600">The component clearly communicates analysis status without misleading users or hiding important information.</p>
      </div>
      
      <div class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Good Design Is Unobtrusive</h3>
        <p class="text-gray-600">Technical details are available but don't overwhelm the interface. Progressive disclosure allows users to access additional information when needed.</p>
      </div>
      
      <div>
        <h3 class="mb-2 text-lg font-medium">Implementation Improvements</h3>
        <ul class="ml-5 list-disc space-y-2 text-gray-600">
          <li><strong>Markdown Integration:</strong> Analysis logs now support rich Markdown formatting, making technical outputs more readable.</li>
          <li><strong>Intelligent Parsing:</strong> A robust HyPhy output parser extracts structured data from raw output to drive the UI.</li>
          <li><strong>Error Handling:</strong> Improved error detection, display, and recovery options help users troubleshoot issues.</li>
          <li><strong>Progressive Disclosure:</strong> Details are available on demand, keeping the interface clean while making all information accessible.</li>
        </ul>
      </div>
    </div>
  </div>
</div>