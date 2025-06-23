<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import AnalysisStatusIndicator from '../../../lib/AnalysisStatusIndicator.svelte';
  
  // Mock analysis store for the demo
  const mockAnalysisStore = writable({
    analyses: [],
    currentAnalysisId: null,
    isLoading: false,
    error: null,
    activeAnalysis: {
      id: null,
      status: null,
      progress: 0,
      message: '',
      logs: []
    },
    activeAnalysesList: []
  });
  
  // Mock the activeAnalyses store to feed our component
  const mockActiveAnalyses = {
    subscribe: callback => {
      return mockAnalysisStore.subscribe(state => {
        callback(state.activeAnalysesList);
      });
    }
  };
  
  // Override the store module during this demo
  import { analysisStore } from '../../../stores/analyses';
  
  // Original store reference
  let originalActiveAnalyses;
  
  // Sample analysis templates
  const analysisTemplates = [
    {
      method: 'FEL',
      fileName: 'HIV1_env.fasta',
      fileId: 'file-1',
      phases: [
        { status: 'initializing', message: 'Initializing FEL analysis...', duration: 1000 },
        { status: 'mounting', message: 'Loading sequence data...', duration: 2000 },
        { status: 'running', message: 'Running FEL on 120 codons...', duration: 8000 },
        { status: 'processing', message: 'Processing results...', duration: 2000 },
        { status: 'completed', message: 'Analysis completed. Found 5 sites under selection.', duration: 0 }
      ]
    },
    {
      method: 'MEME',
      fileName: 'SARS-CoV-2_spike.fasta',
      fileId: 'file-2',
      phases: [
        { status: 'initializing', message: 'Initializing MEME analysis...', duration: 1000 },
        { status: 'mounting', message: 'Loading sequence data...', duration: 2000 },
        { status: 'running', message: 'Running MEME on 187 codons...', duration: 12000 },
        { status: 'processing', message: 'Processing results...', duration: 3000 },
        { status: 'completed', message: 'Analysis completed. Found 8 sites under episodic selection.', duration: 0 }
      ]
    },
    {
      method: 'FUBAR',
      fileName: 'Influenza_HA.fasta',
      fileId: 'file-3',
      phases: [
        { status: 'initializing', message: 'Initializing FUBAR analysis...', duration: 1000 },
        { status: 'mounting', message: 'Loading sequence data...', duration: 1500 },
        { status: 'running', message: 'Running FUBAR on 95 codons...', duration: 10000 },
        { status: 'processing', message: 'Processing results...', duration: 2500 },
        { status: 'completed', message: 'Analysis completed. Found 3 sites under selection.', duration: 0 }
      ]
    },
    {
      method: 'SLAC',
      fileName: 'HCV_NS5A.fasta',
      fileId: 'file-4',
      phases: [
        { status: 'initializing', message: 'Initializing SLAC analysis...', duration: 800 },
        { status: 'mounting', message: 'Loading sequence data...', duration: 1200 },
        { status: 'running', message: 'Running SLAC on 150 codons...', duration: 5000 },
        { status: 'error', message: 'Error: Analysis failed due to convergence issues.', duration: 0 }
      ]
    }
  ];
  
  // Running analyses state
  let runningAnalyses = [];
  let analysisIntervals = {};
  
  // Generate a UUID for analysis IDs
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  
  // Start a new analysis
  function startAnalysis(template) {
    const analysisId = generateId();
    const startTime = new Date().toISOString();
    
    // Create analysis object
    const analysis = {
      id: analysisId,
      status: 'initializing',
      progress: 0,
      method: template.method,
      fileName: template.fileName,
      fileId: template.fileId,
      message: template.phases[0].message,
      startTime,
      logs: [
        { 
          time: startTime, 
          status: 'initializing', 
          message: template.phases[0].message 
        }
      ],
      currentPhase: 0,
      phases: template.phases
    };
    
    // Add to running analyses
    runningAnalyses = [...runningAnalyses, analysis];
    
    // Update the store
    updateStore();
    
    // Start progression
    progressAnalysis(analysisId);
    
    return analysisId;
  }
  
  // Progress an analysis through its phases
  function progressAnalysis(analysisId) {
    // Find analysis
    const analysisIndex = runningAnalyses.findIndex(a => a.id === analysisId);
    if (analysisIndex === -1) return;
    
    const analysis = runningAnalyses[analysisIndex];
    const currentPhase = analysis.currentPhase;
    const phases = analysis.phases;
    
    // If we're at the final phase, we're done
    if (currentPhase >= phases.length - 1) {
      clearInterval(analysisIntervals[analysisId]);
      delete analysisIntervals[analysisId];
      
      // For completed analyses, set the completedAt timestamp for today filtering
      if (phases[currentPhase].status === 'completed') {
        runningAnalyses = runningAnalyses.map(a => {
          if (a.id !== analysisId) return a;
          
          return {
            ...a,
            completedAt: new Date().getTime()
          };
        });
        
        // Update store
        updateStore();
      }
      
      return;
    }
    
    // Calculate progress step
    const phaseDuration = phases[currentPhase].duration;
    const steps = 10; // 10 steps per phase
    const stepTime = phaseDuration / steps;
    const progressIncrement = 100 / (phases.length * steps);
    
    // Update progress every step
    let step = 0;
    analysisIntervals[analysisId] = setInterval(() => {
      step++;
      
      // Update progress
      const newProgress = Math.min(
        analysis.progress + progressIncrement, 
        ((currentPhase + 1) / phases.length) * 100
      );
      
      // Update analysis object
      runningAnalyses = runningAnalyses.map(a => {
        if (a.id !== analysisId) return a;
        
        return {
          ...a,
          progress: Math.round(newProgress)
        };
      });
      
      // Update store
      updateStore();
      
      // If we've reached the end of this phase, move to the next
      if (step >= steps) {
        clearInterval(analysisIntervals[analysisId]);
        
        // Move to next phase
        const nextPhase = currentPhase + 1;
        const nextPhaseData = phases[nextPhase];
        
        // Add log entry
        const logTime = new Date().toISOString();
        const log = { 
          time: logTime, 
          status: nextPhaseData.status, 
          message: nextPhaseData.message 
        };
        
        // Update analysis with new phase
        runningAnalyses = runningAnalyses.map(a => {
          if (a.id !== analysisId) return a;
          
          return {
            ...a,
            currentPhase: nextPhase,
            status: nextPhaseData.status,
            message: nextPhaseData.message,
            logs: [...a.logs, log]
          };
        });
        
        // Update store
        updateStore();
        
        // Continue progression if not at final phase
        if (nextPhase < phases.length - 1) {
          progressAnalysis(analysisId);
        }
      }
    }, stepTime);
  }
  
  // Update the mock store with current running analyses
  function updateStore() {
    mockAnalysisStore.update(state => ({
      ...state,
      activeAnalysesList: [...runningAnalyses]
    }));
  }
  
  // Start multiple analyses for demo
  function startMultipleAnalyses() {
    // Clear any existing analyses
    resetDemo();
    
    // Start a few analyses with staggered starts
    startAnalysis(analysisTemplates[0]);
    
    setTimeout(() => {
      startAnalysis(analysisTemplates[1]);
    }, 3000);
    
    setTimeout(() => {
      startAnalysis(analysisTemplates[2]);
    }, 6000);
  }
  
  // Start an analysis that will fail
  function startFailingAnalysis() {
    startAnalysis(analysisTemplates[3]);
  }
  
  // Reset the demo
  function resetDemo() {
    // Clear all intervals
    Object.values(analysisIntervals).forEach(interval => {
      clearInterval(interval);
    });
    
    // Reset state
    analysisIntervals = {};
    runningAnalyses = [];
    
    // Update store
    updateStore();
  }
  
  // Override the activeAnalyses store on mount
  onMount(() => {
    // Store the original
    originalActiveAnalyses = analysisStore.activeAnalyses;
    
    // Override
    analysisStore.activeAnalyses = mockActiveAnalyses;
    
    // Restore on unmount
    return () => {
      // Clear all intervals
      Object.values(analysisIntervals).forEach(interval => {
        clearInterval(interval);
      });
      
      // Restore original
      if (originalActiveAnalyses) {
        analysisStore.activeAnalyses = originalActiveAnalyses;
      }
    };
  });
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="container mx-auto">
    <h1 class="mb-2 text-3xl font-bold text-gray-900">Analysis Status Indicator Demo</h1>
    <p class="mb-8 text-gray-600">Demonstrates the new analysis status indicator in the navigation bar.</p>
    
    <!-- Demo controls -->
    <div class="mb-8 rounded-lg bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-lg font-semibold">Demo Controls</h2>
          <p class="text-sm text-gray-600">Start multiple analyses to see the indicator in action.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button 
            class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            on:click={startMultipleAnalyses}
          >
            Start Multiple Analyses
          </button>
          <button 
            class="rounded-md border border-red-400 bg-white px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
            on:click={startFailingAnalysis}
          >
            Start Failing Analysis
          </button>
          <button 
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            on:click={resetDemo}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mockup of the navbar with the indicator -->
    <div class="mb-8 rounded-lg bg-white p-4 shadow-sm">
      <h2 class="mb-4 text-xl font-semibold">Navigation Bar Mockup</h2>
      <div class="flex items-center justify-between rounded-md bg-white p-4 shadow-sm">
        <div class="text-xl font-bold">
          <span class="text-purple-600">Datamonkey</span> <span class="text-orange-500">3</span>
        </div>
        
        <div class="flex items-center space-x-4">
          <a class="text-gray-700 hover:text-purple-600" href="#">Home</a>
          <a class="text-gray-700 hover:text-purple-600" href="#">Design System</a>
          <a class="rounded bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-white" href="#">GitHub</a>
          
          <!-- Status Indicator Preview -->
          <div class="ml-4">
            <AnalysisStatusIndicator />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Explanation -->
    <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
      <h2 class="mb-4 text-xl font-bold text-gray-900">About the Analysis Status Indicator</h2>
      
      <div class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Key Features</h3>
        <ul class="ml-5 list-disc space-y-2 text-gray-600">
          <li><strong>Always Visible:</strong> Status is always visible in the navigation bar</li>
          <li><strong>Minimal Interface:</strong> Shows only counts, not detailed information</li>
          <li><strong>Direct Navigation:</strong> Clicking navigates to the Results tab for details</li>
          <li><strong>Clear Indicators:</strong> Uses color and icons to differentiate status types</li>
          <li><strong>Adaptive Display:</strong> Only shows relevant counters, hides zeros</li>
        </ul>
      </div>
      
      <div class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Dieter Rams Design Principles</h3>
        <ul class="ml-5 list-disc space-y-2 text-gray-600">
          <li><strong>Good Design Is Unobtrusive:</strong> Simple counter that doesn't distract from main content</li>
          <li><strong>Good Design Is Honest:</strong> Shows exactly what's happening with no unnecessary information</li>
          <li><strong>Good Design Is As Little Design As Possible:</strong> Minimal UI with only essential information</li>
          <li><strong>Good Design Is Useful:</strong> Provides persistent status awareness across the application</li>
        </ul>
      </div>
      
      <div>
        <h3 class="mb-2 text-lg font-medium">Status Types</h3>
        <ul class="ml-5 list-disc space-y-2 text-gray-600">
          <li><strong>⚡ Running:</strong> Blue with a pulsing dot to indicate activity</li>
          <li><strong>✓ Completed:</strong> Green with a checkmark icon</li>
          <li><strong>⚠ Failed:</strong> Red with a warning icon (only shown when failures exist)</li>
        </ul>
      </div>
    </div>
  </div>
</div>