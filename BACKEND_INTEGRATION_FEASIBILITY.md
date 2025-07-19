# Backend Integration Feasibility Analysis
## Datamonkey3 - Large Job Processing via datamonkey-js-server

### Executive Summary

This document outlines the feasibility and implementation approach for integrating the existing datamonkey-js-server backend to handle large computational jobs, while maintaining the current browser-based processing for smaller analyses.

### Current State Analysis

#### Architecture Overview
- **100% Browser-Based**: All analyses currently run locally using HyPhy WebAssembly via `@biowasm/aioli`
- **No Backend Integration**: Zero existing infrastructure for server communication
- **Local Storage**: Uses IndexedDB for persistence, no server-side data storage
- **Self-Contained**: Fully functional offline-capable application

#### Existing Infrastructure Gaps
1. **Missing API Routes**: No `/src/routes/api/analyses/` endpoints exist
2. **No Server Configuration**: No environment variables or connection logic for backend server
3. **Phantom API Calls**: Code contains non-functional fetch calls to missing endpoints
4. **No Job Routing Logic**: No criteria or infrastructure for local vs remote processing decisions

### Proposed Architecture: Hybrid Processing Model

#### Processing Decision Criteria

**Local Processing (Browser WebAssembly):**
```javascript
{
  fileSize: "< 5MB",
  sequences: "< 100", 
  sequenceLength: "< 10,000bp",
  methods: ["slac", "fel", "meme", "fubar"],
  expectedDuration: "< 5 minutes",
  memoryRequirement: "< 100MB"
}
```

**Backend Processing (datamonkey-js-server):**
```javascript
{
  fileSize: "> 5MB",
  sequences: "> 100",
  sequenceLength: "> 10,000bp", 
  methods: ["absrel", "busted", "gard", "bgm", "fade", "relax"],
  expectedDuration: "> 5 minutes",
  memoryRequirement: "> 100MB"
}
```

#### Implementation Components

### 1. Backend Server Integration

#### Required SvelteKit API Routes
```
/src/routes/api/
├── analyses/
│   ├── +server.js              # POST: Create analysis job
│   ├── [id]/
│   │   ├── +server.js          # GET: Status, PATCH: Update, DELETE: Cancel
│   │   └── results/+server.js  # GET: Download results
│   └── queue/+server.js        # GET: Queue status
├── server/
│   ├── status/+server.js       # GET: Server health check
│   └── config/+server.js       # GET: Server capabilities
```

#### Environment Configuration
```typescript
// src/lib/config/env.ts
export const DATAMONKEY_SERVER_URL = import.meta.env.VITE_DATAMONKEY_SERVER_URL || null;
export const ENABLE_BACKEND_PROCESSING = import.meta.env.VITE_ENABLE_BACKEND_PROCESSING === 'true';
export const BACKEND_JOB_THRESHOLD = {
  fileSize: parseInt(import.meta.env.VITE_BACKEND_FILE_SIZE_THRESHOLD) || 5 * 1024 * 1024,
  sequences: parseInt(import.meta.env.VITE_BACKEND_SEQUENCE_THRESHOLD) || 100
};
```

### 2. Job Routing Logic

#### Processing Decision Engine
```javascript
// src/lib/services/ProcessingDecisionEngine.js
export class ProcessingDecisionEngine {
  static determineProcessingLocation(fileMetrics, methodInfo, userPreference = 'auto') {
    // User override
    if (userPreference === 'force-local') return 'local';
    if (userPreference === 'force-backend') return 'backend';
    
    // Server availability check
    if (!this.isBackendAvailable()) return 'local';
    
    // Hard constraints for backend
    if (fileMetrics.size > BACKEND_JOB_THRESHOLD.fileSize) return 'backend';
    if (fileMetrics.sequences > BACKEND_JOB_THRESHOLD.sequences) return 'backend';
    if (methodInfo.complexity === 'very high') return 'backend';
    
    // Performance-based decisions  
    const estimatedDuration = this.estimateExecutionTime(fileMetrics, methodInfo);
    if (estimatedDuration > 300000) return 'backend'; // > 5 minutes
    
    return 'local';
  }
  
  static async isBackendAvailable() {
    if (!DATAMONKEY_SERVER_URL) return false;
    try {
      const response = await fetch(`${DATAMONKEY_SERVER_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 3. Enhanced Analysis Runner

#### Unified Analysis Interface
```javascript
// src/lib/services/UnifiedAnalysisRunner.js
export class UnifiedAnalysisRunner {
  async runAnalysis(fileId, method, options = {}) {
    const fileMetrics = await this.getFileMetrics(fileId);
    const methodInfo = this.getMethodInfo(method);
    const processingLocation = ProcessingDecisionEngine.determineProcessingLocation(
      fileMetrics, 
      methodInfo, 
      options.preferredLocation
    );
    
    if (processingLocation === 'backend') {
      return this.runBackendAnalysis(fileId, method, options);
    } else {
      return this.runLocalAnalysis(fileId, method, options);
    }
  }
  
  async runBackendAnalysis(fileId, method, options) {
    // Submit job to datamonkey-js-server
    // Implement polling for status updates
    // Handle results retrieval
  }
  
  async runLocalAnalysis(fileId, method, options) {
    // Existing WebAssembly-based processing
    // Reuse current AnalysisRunner logic
  }
}
```

### 4. Progress Tracking Enhancement

#### Unified Progress Interface
```javascript
// Enhanced src/stores/analyses.js
const analysisStore = {
  // Existing local analysis tracking...
  
  // New backend analysis tracking
  async trackBackendAnalysis(analysisId, serverJobId) {
    const pollInterval = setInterval(async () => {
      try {
        const status = await fetch(`/api/analyses/${analysisId}`);
        const data = await status.json();
        
        this.updateAnalysisProgress(data.status, data.progress, data.message);
        
        if (['completed', 'error', 'cancelled'].includes(data.status)) {
          clearInterval(pollInterval);
          await this.completeAnalysisProgress(data.status === 'completed');
        }
      } catch (error) {
        console.error('Backend status check failed:', error);
        // Implement retry logic or fallback
      }
    }, 5000); // Poll every 5 seconds
  }
};
```

### 5. User Interface Enhancements

#### Processing Location Indicator
```svelte
<!-- src/lib/ProcessingLocationBadge.svelte -->
<div class="processing-location-badge">
  {#if processingLocation === 'backend'}
    <span class="badge badge-server">
      <ServerIcon />
      Processing on Server
    </span>
  {:else}
    <span class="badge badge-local">
      <BrowserIcon />
      Processing Locally
    </span>
  {/if}
</div>
```

#### User Preference Settings
```svelte
<!-- src/lib/ProcessingPreferences.svelte -->
<div class="processing-preferences">
  <h3>Processing Preferences</h3>
  <label>
    <input type="radio" bind:group={processingPreference} value="auto" />
    Automatic (Recommended)
  </label>
  <label>
    <input type="radio" bind:group={processingPreference} value="force-local" />
    Always Local (Faster for small jobs)
  </label>
  <label>
    <input type="radio" bind:group={processingPreference} value="force-backend" />
    Always Backend (For large datasets)
  </label>
</div>
```

### Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- [ ] Create SvelteKit API routes structure
- [ ] Implement environment configuration
- [ ] Add backend server health check endpoints
- [ ] Create ProcessingDecisionEngine utility

#### Phase 2: Backend Integration (Week 3-4)  
- [ ] Implement job submission to datamonkey-js-server
- [ ] Add backend progress polling mechanism
- [ ] Create results retrieval system
- [ ] Implement error handling and fallback logic

#### Phase 3: UI/UX Enhancement (Week 5-6)
- [ ] Add processing location indicators
- [ ] Implement user preference settings
- [ ] Create queue status visualization
- [ ] Add backend job management (cancel, retry)

#### Phase 4: Testing & Optimization (Week 7-8)
- [ ] Performance testing with various file sizes
- [ ] Load testing backend integration
- [ ] Error scenario testing (server down, timeouts)
- [ ] User acceptance testing

### Risk Assessment

#### Technical Risks
- **Backend Server Dependency**: Application becomes partially dependent on external service
- **Network Reliability**: Requires stable internet connection for backend jobs
- **State Synchronization**: Complex state management between local and remote processing

#### Mitigation Strategies
- **Graceful Degradation**: Fall back to local processing if backend unavailable
- **Robust Error Handling**: Clear user feedback and retry mechanisms
- **State Management**: Unified interface abstracting processing location

### Success Metrics

#### Performance Metrics
- **Job Completion Time**: Faster processing for large jobs via backend
- **User Experience**: Seamless transition between local and backend processing
- **Reliability**: > 99% job completion rate across both processing modes

#### Technical Metrics  
- **Backend Utilization**: % of jobs routed to backend vs local
- **Error Rate**: < 1% failed job submissions or status updates
- **Fallback Success**: 100% local fallback when backend unavailable

### Conclusion

The integration is **technically feasible** but requires significant infrastructure development. The current codebase provides a solid foundation with clear separation of concerns, making the hybrid approach viable.

**Key Success Factors:**
1. Robust fallback mechanisms ensuring local processing always works
2. Clear user communication about processing location and status
3. Careful threshold tuning to optimize user experience
4. Comprehensive error handling for network and server issues

**Recommended Next Steps:**
1. Prototype the ProcessingDecisionEngine with mock backend
2. Implement basic SvelteKit API routes for testing
3. Create a simple backend job submission workflow
4. Test with progressively larger datasets to validate thresholds