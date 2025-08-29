# Backend Integration Guide

## Overview

The application now supports both local (browser-based) and backend (server-based) analysis execution following Dieter Rams' design principles. The integration is minimal, clear, and provides users with an obvious choice without compromising the existing workflow.

## Architecture

### Execution Modes

1. **Local Mode (Default)**
   - Analysis runs in the browser using WebAssembly
   - Fast execution for small datasets (<1000 sequences)
   - No server dependency required
   - Uses existing `AnalysisRunner.js`

2. **Backend Mode**
   - Analysis runs on DataMonkey server via Socket.IO
   - Powerful execution for large datasets (>1000 sequences)  
   - Requires backend server connection
   - Uses new `BackendAnalysisRunner.js`

### UI Changes

The execution mode selection appears only when:
- A supported method is selected (FEL, SLAC)
- Two radio buttons with clear descriptions
- Smart visual feedback for server availability
- Warning message when backend is unavailable

## Components Modified

### 1. MethodSelector.svelte
- Added execution mode toggle UI
- Integrated with backend connectivity store
- Dispatches `executionMode` in method change events
- Added radio button styling for execution mode selection

### 2. AnalyzeTab.svelte  
- Enhanced `runMethod` to handle both execution modes
- Initializes backend connectivity on mount
- Routes analysis to appropriate execution engine
- Error handling for backend failures

### 3. BackendAnalysisRunner.js (New)
- Singleton service for backend analysis execution
- Socket.IO communication with DataMonkey server
- Analysis lifecycle management (submit → track → complete)
- Parameter mapping for different analysis methods

## Configuration

### Environment Variables
- `VITE_DATAMONKEY_SERVER_URL` - Backend server URL (default: `http://localhost:7015`)

### Backend Connectivity
- Automatic connection initialization on app load
- Persistent Socket.IO connection management
- Reconnection logic with exponential backoff
- Connection status indicator in UI

## Method Support Status

### Currently Supported (Backend + Local)
- **FEL** - Fixed Effects Likelihood
- **SLAC** - Single-Likelihood Ancestor Counting

### Coming Soon (Local Only)
- MEME, FUBAR, aBSREL, BUSTED, GARD, BGM, FADE, RELAX, MULTI-HIT, NRM, Contrast-FEL

## Enabling New Methods

### To enable a method for backend execution:

1. **Update MethodSelector.svelte:**
   ```javascript
   // Change supported status
   meme: {
     name: 'MEME',
     fullName: 'Mixed Effects Model of Evolution', 
     shortDescription: 'Detect episodic selection at individual sites',
     supported: true  // Changed from false
   },
   ```

2. **Add parameter mapping in BackendAnalysisRunner.js:**
   ```javascript
   case 'meme':
     return {
       ...baseParams,
       pvalue: config.pValueThreshold || 0.1,
       branches: 'All'
     };
   ```

3. **Verify backend server supports the method:**
   - Ensure server handles `{method}:spawn` and `{method}:check` events
   - Test with demo page to confirm functionality

## Error Handling

### Backend Unavailable
- Execution mode automatically defaults to "Local"
- "Backend Server" option is disabled
- Warning message: "Server temporarily unavailable. Please use Local mode."

### Analysis Submission Failure  
- User-friendly error message
- Analysis marked as failed in store
- Fallback suggestion to use local mode

### Connection Lost During Analysis
- Automatic reconnection attempts
- Analysis status preserved in local store
- Progress tracking continues when reconnected

## Testing

### Unit Tests
- Backend connectivity: `/src/test/{method}-backend.test.js`
- Parameter validation testing
- Socket.IO event handling verification

### Manual Testing
1. Start DataMonkey server on `localhost:7015`
2. Select supported method (FEL/SLAC)  
3. Choose "Backend Server" execution mode
4. Submit analysis and verify job submission
5. Check Results tab for completion status

## Smart Defaults

The system automatically suggests the appropriate execution mode:
- **Files >1000 sequences:** Backend Server (if available)
- **Files ≤1000 sequences:** Local (Browser)
- **Backend unavailable:** Local (Browser) only

## Socket.IO Events

### Outbound (Client → Server)
- `{method}:spawn` - Submit analysis job
- `{method}:check` - Validate parameters
- `cancel` - Cancel running job

### Inbound (Server → Client) 
- `connect` - Connection established
- `status update` - Analysis progress updates
- `completed` - Analysis finished successfully
- `script error` - Analysis failed with error
- `validated` - Parameter validation result

## Design Philosophy

Following Rams' Principle 10: "Good design is as little design as possible"

- **Minimal UI Change:** Single execution mode choice
- **Clear Intent:** Obvious when to use each mode  
- **Consistent Experience:** Same interface regardless of execution mode
- **Honest Communication:** No false complexity or hidden options
- **Progressive Enhancement:** Local mode works without backend dependency

The backend integration becomes nearly invisible - users simply choose where to run their analysis, then proceed exactly as before.