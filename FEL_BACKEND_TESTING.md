# FEL Backend Integration Testing

## Overview

This document describes how to test the FEL analysis integration with the DataMonkey backend server. The tests are designed for manual execution and are excluded from CI since they require an external DataMonkey server.

## Prerequisites

1. **DataMonkey Server Running**

   - Server must be running on `localhost:7015`
   - Server must support FEL analysis via Socket.IO
   - Server must handle the documented data format

2. **Dependencies Installed**
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Tests

### Method 1: NPM Script (Recommended)

```bash
npm run test:fel-backend
```

This will:

- Check if DataMonkey server is available
- Skip tests with clear messaging if server is not running
- Run comprehensive FEL integration tests if server is available
- Provide detailed output with status updates

### Method 2: Direct Vitest

```bash
npx vitest run src/test/fel-backend.test.js --reporter=verbose
```

### Method 3: Interactive Testing

For development and debugging, you can run the helper class manually:

```javascript
import { FELBackendTester } from './src/test/fel-backend.test.js';

const tester = new FELBackendTester();

try {
	await tester.connect();

	// Validate parameters
	const validation = await tester.validateParameters();
	console.log('Validation result:', validation);

	// Run analysis
	const result = await tester.runAnalysis();
	console.log('Analysis result:', result);
} catch (error) {
	console.error('Test failed:', error.message);
} finally {
	tester.disconnect();
}
```

## Test Coverage

The test suite covers:

### 1. Connection Testing

- ✅ Server availability check
- ✅ Socket.IO connection establishment
- ⚠️ Graceful handling when server is unavailable

### 2. Parameter Validation

- ✅ Valid FEL parameter validation
- ✅ `fel:check` event handling
- ✅ Server response validation

### 3. FEL Analysis Execution

- ✅ Complete analysis workflow
- ✅ Real-time status update tracking
- ✅ Successful completion handling
- ✅ Result structure validation
- ⏱️ Timeout handling (5 minute limit)

### 4. Error Handling

- ✅ Malformed data rejection
- ✅ Script error event handling
- ✅ Analysis failure scenarios

### 5. Server Communication

- ✅ Job queue status requests (optional - local servers may not implement)
- ✅ Socket event handling
- ✅ Connection state management

## Test Data

The tests use the CD2-slim.fna dataset:

**FASTA Alignment:** 10 mammalian species, 51bp each

```
>Human, >Chimp, >Baboon, >RhMonkey, >Cow, >Pig, >Horse, >Cat, >Mouse, >Rat
```

**Phylogenetic Tree:** Newick format with branch lengths

```
((((Pig:0.147969,Cow:0.213430):0.085099,Horse:0.165787,Cat:0.264806):0.058611,((RhMonkey:0.002015,Baboon:0.003108):0.022733,(Human:0.004349,Chimp:0.000799):0.011873):0.101856):0.340802,Rat:0.050958,Mouse:0.097950);
```

**FEL Parameters:**

- Genetic Code: Universal
- P-value: 0.1
- Bootstrap: 1 (for fast testing)
- Model: HKY85
- Rate Classes: 3

## Expected Output

### Successful Test Run

```
✅ DataMonkey server is available
📊 Status: Reading alignment file
📊 Status: Preparing phylogenetic tree
📊 Status: Running FEL analysis
📊 Status: Testing sites for selection
✅ Analysis completed successfully
📈 Received 15 status updates
📋 Analysis Summary:
   - Status updates: 15
   - Result keys: input, fits, test results, timers
✅ Analysis result is valid object
📊 Job queue: 0 jobs (optional feature)
✅ Server correctly rejected malformed data
```

### Server Not Available

```
⚠️  DataMonkey server not available, skipping tests
   To run these tests:
   1. Start DataMonkey server on localhost:7015
   2. Run: npm run test:fel-backend
   Error: Server not available: connect ECONNREFUSED 127.0.0.1:7015
```

## Troubleshooting

### Server Connection Issues

**Problem:** `connect ECONNREFUSED 127.0.0.1:7015`
**Solution:**

- Ensure DataMonkey server is running
- Check server is listening on port 7015
- Verify no firewall blocking connections

### Test Timeouts

**Problem:** Analysis timeout after 5 minutes
**Solution:**

- Check server logs for processing issues
- Verify test data is valid
- Consider increasing timeout for complex datasets
- Ensure server has sufficient resources

### Analysis Failures

**Problem:** `script error` events during analysis
**Solution:**

- Check server logs for detailed error messages
- Validate FASTA alignment format
- Verify tree topology matches sequence names
- Ensure parameter values are in valid ranges

### Socket.IO Issues

**Problem:** Connection established but events not received
**Solution:**

- Check Socket.IO version compatibility
- Verify event names match server implementation
- Ensure proper event handler setup
- Check server CORS configuration

## Configuration

### Test Timeouts

```javascript
const CONNECTION_TIMEOUT = 5000; // 5 seconds
const ANALYSIS_TIMEOUT = 300000; // 5 minutes
```

### Server URL

```javascript
const SERVER_URL = 'http://localhost:7015';
```

To test against a different server, modify the URL in the test file or pass it to the `FELBackendTester` constructor.

## Integration with CI/CD

These tests are **intentionally excluded** from automated CI/CD pipelines because:

1. **External Dependency:** Requires running DataMonkey server
2. **Resource Intensive:** Analysis can take several minutes
3. **Environment Specific:** Server configuration may vary
4. **Manual Verification:** Results need human interpretation

For CI integration, consider:

- Mock server implementation for unit tests
- Docker composition with DataMonkey server
- Separate integration test environment
- Scheduled integration test runs

## Manual Testing Checklist

Before deploying FEL integration:

- [ ] Server connection establishes successfully
- [ ] Parameter validation works correctly
- [ ] Analysis completes without errors
- [ ] Status updates are received throughout analysis
- [ ] Results contain expected data structure
- [ ] Error scenarios are handled gracefully
- [ ] Job queue functionality works
- [ ] Malformed data is rejected appropriately
- [ ] Connection recovery works after disconnection
- [ ] Multiple sequential analyses work correctly

## Development Workflow

1. **Start DataMonkey Server**

   ```bash
   # Start your DataMonkey server on localhost:7015
   ```

2. **Run Integration Tests**

   ```bash
   npm run test:fel-backend
   ```

3. **Test Demo Page**

   ```bash
   npm run dev
   # Navigate to http://localhost:5173/demo
   ```

4. **Verify Results**
   - Check analysis completion
   - Verify result data structure
   - Test error scenarios
   - Validate status updates

This testing approach ensures the integration works correctly with the actual DataMonkey backend while keeping automated tests focused on frontend logic.
