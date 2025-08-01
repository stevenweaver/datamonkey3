# DataMonkey FEL Analysis Integration Documentation

## Overview

This document provides comprehensive documentation for integrating FEL (Fixed Effects Likelihood) analysis with the DataMonkey backend server. The integration uses Socket.IO for real-time communication between the frontend and backend.

## Server Connection

### Socket.IO Setup
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:7015');
```

### Connection Events
The client should handle these basic connection events:
- `connect` - Successfully connected to server
- `disconnect` - Disconnected from server  
- `connect_error` - Connection failed
- `connected` - Server ready with greeting message

## Data Format for FEL Analysis

### Request Format

The FEL analysis is initiated by emitting a `fel:spawn` event with a single object containing three properties:

```javascript
socket.emit('fel:spawn', {
    alignment: fastaString,
    tree: newickString, 
    job: felParameters
});
```

#### 1. Alignment Data (`alignment`)

**Type:** String  
**Format:** Raw FASTA format  
**Description:** Multi-sequence alignment in FASTA format

**Example:**
```
>Human
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT
>Chimp  
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT
>Baboon
GCTTTGGAAACCTGGGGAGCGCTGGGTCAGGACATCGACTTGGACATTCCT
>RhMonkey
GCTTTGGAAACCTGGGGAGCGCTGGGTCAGGACATCGACTTGGACATTCCT
```

**Requirements:**
- Valid FASTA format with `>` header lines
- Sequence names should not contain spaces or special characters
- All sequences must be the same length (aligned)
- Must contain at least 2 sequences
- Sequences should be in nucleotide format (A, T, G, C, N)

#### 2. Phylogenetic Tree (`tree`)

**Type:** String  
**Format:** Newick format  
**Description:** Phylogenetic tree topology with branch lengths

**Example:**
```
((((Pig:0.147969,Cow:0.213430):0.085099,Horse:0.165787,Cat:0.264806):0.058611,((RhMonkey:0.002015,Baboon:0.003108):0.022733,(Human:0.004349,Chimp:0.000799):0.011873):0.101856):0.340802,Rat:0.050958,Mouse:0.097950);
```

**Requirements:**
- Valid Newick format ending with semicolon
- Branch lengths are required for FEL analysis
- Leaf names must exactly match FASTA sequence headers (without `>`)
- Tree topology must be consistent with alignment (same species)

#### 3. Analysis Parameters (`job`)

**Type:** Object  
**Description:** FEL analysis configuration parameters

**Required Parameters:**
```javascript
{
    analysis_type: "fel",           // Fixed value for FEL analysis
    genetic_code: "Universal",      // Genetic code table
    p_value: 0.1,                  // P-value threshold for significance
    branches: "All",               // Which branches to test
    bootstrap: 1,                  // Number of bootstrap replicates
    model: "HKY85",               // Nucleotide substitution model
    rate_classes: 3,              // Number of rate classes
    synonymous_rate_variation: false // Enable synonymous rate variation
}
```

**Parameter Details:**

| Parameter | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| `analysis_type` | String | `"fel"` | `"fel"` | Analysis method identifier |
| `genetic_code` | String | `"Universal"` | `"Universal"`, `"Vertebrate Mitochondrial"`, `"Yeast Mitochondrial"`, `"Mold Mitochondrial"`, `"Invertebrate Mitochondrial"` | Genetic code translation table |
| `p_value` | Number | `0.1` | `0.01` to `1.0` | P-value threshold for detecting selection |
| `branches` | String | `"All"` | `"All"`, `"Internal"`, `"Terminal"` | Which branches to test for selection |
| `bootstrap` | Number | `1` | `0` to `1000` | Number of bootstrap replicates (1 = no bootstrap) |
| `model` | String | `"HKY85"` | `"HKY85"`, `"GTR"`, `"F81"`, `"K80"` | Nucleotide substitution model |
| `rate_classes` | Number | `3` | `1` to `10` | Number of discrete rate categories |
| `synonymous_rate_variation` | Boolean | `false` | `true`, `false` | Model synonymous rate variation |

## Backend Processing Flow

### How the Backend Handles Requests

1. **Router Layer** (`/lib/router.js:26-49`):
   ```javascript
   socket.on('fel:spawn', function(stream, data) {
       // Single parameter handling
       if (data === undefined && stream && typeof stream === 'object') {
           data = stream;
           stream = data.alignment; // ALIGNMENT BECOMES THE STREAM
       }
       callback(stream, data); // Calls FEL constructor
   });
   ```

2. **FEL Constructor** (`/app/fel/fel.js:10-14`):
   ```javascript
   var fel = function (socket, stream, params) {
       self.stream = stream;    // This is the ALIGNMENT data
       self.params = params;    // This is the full data object
   }
   ```

3. **Tree Extraction** (`/app/fel/fel.js:71,76`):
   ```javascript
   self.nwk_tree = self.params.analysis.tagged_nwk_tree ||
                   self.params.nwk_tree ||
                   self.params.tree;  // Fallback to tree property
   ```

4. **File Writing** (`/app/hyphyjob.js:137-167`):
   ```javascript
   // Writes alignment file
   fs.writeFile(self.fn, dataToWrite, err => { ... });
   
   // Tree file written separately
   fs.writeFile(self.tree_fn, self.nwk_tree, function (err) { ... });
   ```

## Server Response Events

### Real-time Status Updates

The server sends progress updates via these Socket.IO events:

#### `status update`
**Payload:** `{ msg: string, phase?: string }`  
**Description:** Analysis progress messages

**Example:**
```javascript
socket.on('status update', (status) => {
    console.log(`${status.msg}${status.phase ? ` (Phase: ${status.phase})` : ''}`);
});
```

#### `completed`
**Payload:** Analysis results object  
**Description:** Analysis finished successfully

**Example:**
```javascript
socket.on('completed', (data) => {
    console.log('Analysis completed:', data);
    // data contains the full FEL analysis results
});
```

#### `script error`
**Payload:** `{ message: string }` or string  
**Description:** Analysis failed with error

**Example:**
```javascript
socket.on('script error', (err) => {
    console.error('Analysis failed:', err.message || err);
});
```

#### `validated`
**Payload:** `{ valid: boolean, errors?: string[] }`  
**Description:** Parameter validation result (if using `fel:check`)

#### `job queue`
**Payload:** Array of job objects  
**Description:** Current server job queue status

## Additional Socket Events

### Parameter Validation (`fel:check`)

Before running analysis, you can validate parameters:

```javascript
socket.emit('fel:check', {
    job: felParameters
});

socket.on('validated', (result) => {
    if (result.valid) {
        console.log('Parameters valid');
    } else {
        console.error('Invalid parameters:', result.errors);
    }
});
```

### Job Queue Status

Check server job queue:

```javascript
socket.emit('job queue', {});

socket.on('job queue', (jobs) => {
    console.log(`Active jobs: ${jobs.length}`);
});
```

### Cancel Analysis (`fel:cancel`)

Cancel a running analysis:

```javascript
socket.emit('fel:cancel', { id: jobId });
```

## Complete Integration Example

```javascript
import io from 'socket.io-client';

class FELAnalysis {
    constructor(serverUrl = 'http://localhost:7015') {
        this.socket = io(serverUrl);
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Connected to DataMonkey server');
        });
        
        this.socket.on('status update', (status) => {
            console.log('Status:', status.msg);
        });
        
        this.socket.on('completed', (results) => {
            console.log('Analysis completed:', results);
        });
        
        this.socket.on('script error', (error) => {
            console.error('Analysis error:', error.message || error);
        });
    }
    
    runAnalysis(fastaData, treeData, parameters = {}) {
        const defaultParams = {
            analysis_type: 'fel',
            genetic_code: 'Universal',
            p_value: 0.1,
            branches: 'All',
            bootstrap: 1,
            model: 'HKY85',
            rate_classes: 3,
            synonymous_rate_variation: false
        };
        
        const felParams = { ...defaultParams, ...parameters };
        
        this.socket.emit('fel:spawn', {
            alignment: fastaData,
            tree: treeData,
            job: felParams
        });
    }
}

// Usage
const felAnalysis = new FELAnalysis();

const fasta = `>Human
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT
>Chimp
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT`;

const tree = `(Human:0.004349,Chimp:0.000799);`;

felAnalysis.runAnalysis(fasta, tree, {
    p_value: 0.05,
    bootstrap: 100
});
```

## Error Handling

### Common Errors

1. **Connection Errors**
   - Server not running on specified port
   - Network connectivity issues
   - CORS policy restrictions

2. **Data Format Errors**
   - Invalid FASTA format
   - Malformed Newick tree
   - Mismatched sequence/tree species names
   - Empty or missing data

3. **Parameter Errors**
   - Invalid genetic code selection
   - Out-of-range numeric parameters
   - Incompatible parameter combinations

4. **Analysis Errors**
   - Insufficient sequence variation
   - Convergence failures
   - Memory/resource limitations

### Error Recovery

```javascript
socket.on('connect_error', (error) => {
    console.error('Connection failed:', error.message);
    // Implement reconnection logic
});

socket.on('script error', (error) => {
    console.error('Analysis failed:', error.message || error);
    // Reset UI state, show error message to user
});
```

## Testing Data

### Sample FASTA (CD2-slim.fna)
```
>Human
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT
>Chimp
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT
>Baboon
GCTTTGGAAACCTGGGGAGCGCTGGGTCAGGACATCGACTTGGACATTCCT
>RhMonkey
GCTTTGGAAACCTGGGGAGCGCTGGGTCAGGACATCGACTTGGACATTCCT
>Cow
AGCATTGTCGTCTGGGGTGCCCTGGATCATGACCTCAACCTGGACATTCCT
>Pig
ACTGAGGTTGTCTGGGGCATCGTGGATCAAGACATCAACCTGGACATTCCT
>Horse
AATATCACCATCTTGGGTGCCCTGGAACGTGATATCAACCTGGACATTCCT
>Cat
GATGATATCGTCTGGGGTACCCTGGGTCAGGACATCAACCTGGACATTCCT
>Mouse
AATGAGACCATCTGGGGTGTCTTGGGTCATGGCATCACCCTGAACATCCCC
>Rat
AGTGGGACCGTCTGGGGTGCCCTGGGTCATGGCATCAACCTGAACATCCCT
```

### Sample Tree
```
((((Pig:0.147969,Cow:0.213430):0.085099,Horse:0.165787,Cat:0.264806):0.058611,((RhMonkey:0.002015,Baboon:0.003108):0.022733,(Human:0.004349,Chimp:0.000799):0.011873):0.101856):0.340802,Rat:0.050958,Mouse:0.097950);
```

## Dependencies

### Frontend Dependencies
```json
{
  "socket.io-client": "^4.8.1",
  "socket.io-stream": "^0.9.1"
}
```

### Vite Configuration
```javascript
export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    include: ['socket.io-client']
  }
});
```

## Security Considerations

1. **Input Validation**
   - Validate FASTA format before submission
   - Check tree format and consistency
   - Sanitize parameter values

2. **Rate Limiting**
   - Implement client-side rate limiting for analysis requests
   - Handle server-side rate limiting responses

3. **Data Privacy**
   - Consider data sensitivity when submitting sequences
   - Implement secure connection (HTTPS/WSS) for production

4. **Error Information**
   - Avoid exposing server internals in error messages
   - Log detailed errors server-side for debugging

## Performance Optimization

1. **Connection Management**
   - Reuse socket connections when possible
   - Implement connection pooling for multiple analyses
   - Handle connection recovery gracefully

2. **Data Transfer**
   - Compress large sequence files if needed
   - Validate data client-side before transmission
   - Implement progress indicators for large uploads

3. **Resource Management**
   - Clean up event listeners when components unmount
   - Implement analysis timeouts and cancellation
   - Monitor memory usage for large datasets