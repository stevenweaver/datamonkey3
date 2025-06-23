<script>
  import { onMount } from 'svelte';
  import { exportData } from './utils/exportUtils';
  import { analysisStore } from '../stores/analyses';
  
  // Props
  export let analysisId;
  
  // Local state
  let showOptions = false;
  let downloadStatus = '';
  let statusTimeout;
  let analysis = null;
  
  // Log types available for download
  const logTypes = [
    { 
      id: 'stdout', 
      label: 'Standard Output (stdout)', 
      description: 'Program output and results',
      icon: '🖥️',
      filename: 'stdout.txt'
    },
    { 
      id: 'stderr', 
      label: 'Standard Error (stderr)', 
      description: 'Error messages and warnings',
      icon: '⚠️',
      filename: 'stderr.txt'
    },
    { 
      id: 'combined', 
      label: 'Execution Log', 
      description: 'Combined stdout and stderr',
      icon: '📄',
      filename: 'execution.log'
    }
  ];
  
  // Load analysis data when analysisId changes
  $: if (analysisId) {
    loadAnalysis(analysisId);
  }
  
  // Load analysis data
  async function loadAnalysis(id) {
    try {
      // Get analysis from store
      analysis = $analysisStore.analyses.find(a => a.id === id);
      
      if (!analysis) {
        analysis = await analysisStore.getAnalysis(id);
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
    }
  }
  
  // Toggle options dropdown
  function toggleOptions() {
    showOptions = !showOptions;
  }
  
  // Download log file
  async function downloadLog(logType) {
    if (!analysis) return;
    
    try {
      let content = '';
      const logInfo = logTypes.find(lt => lt.id === logType);
      
      if (!logInfo) {
        throw new Error('Invalid log type');
      }
      
      // Generate filename based on analysis method and timestamp
      const method = analysis.method.toUpperCase();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = `${method}_${timestamp}_${logInfo.filename}`;
      
      // Get log content based on type
      switch (logType) {
        case 'stdout':
          content = analysis.logs?.stdout || getStdoutFromLogs(analysis.logs) || 'No standard output available';
          break;
        case 'stderr':
          content = analysis.logs?.stderr || getStderrFromLogs(analysis.logs) || 'No error output available';
          break;
        case 'combined':
          const stdout = analysis.logs?.stdout || getStdoutFromLogs(analysis.logs) || 'No standard output available';
          const stderr = analysis.logs?.stderr || getStderrFromLogs(analysis.logs) || 'No error output available';
          content = `=== STANDARD OUTPUT ===\n${stdout}\n\n=== STANDARD ERROR ===\n${stderr}`;
          break;
        default:
          content = 'Invalid log type selected';
      }
      
      // Try using the export utility, but provide fallback for older browsers
      try {
        exportData(content, filename, 'txt');
      } catch (e) {
        console.warn('Error using exportData, falling back to alternative method:', e);
        fallbackDownload(content, filename);
      }
      
      // Show success message
      displayStatus(`Downloaded ${logInfo.label}`);
    } catch (error) {
      console.error('Error downloading log:', error);
      displayStatus('Download failed');
    }
  }
  
  // Extract stdout from analysis logs
  function getStdoutFromLogs(logs) {
    if (!logs || !Array.isArray(logs)) return '';
    
    // Filter logs that might be stdout entries
    const stdoutLogs = logs.filter(log => 
      log.status !== 'error' && 
      log.status !== 'warning'
    );
    
    // Join the messages
    return stdoutLogs.map(log => log.message).join('\n');
  }
  
  // Extract stderr from analysis logs
  function getStderrFromLogs(logs) {
    if (!logs || !Array.isArray(logs)) return '';
    
    // Filter logs that might be stderr entries
    const stderrLogs = logs.filter(log => 
      log.status === 'error' || 
      log.status === 'warning'
    );
    
    // Join the messages
    return stderrLogs.map(log => log.message).join('\n');
  }
  
  // Display status message with auto-clear
  function displayStatus(message) {
    downloadStatus = message;
    
    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
      downloadStatus = '';
    }, 3000);
  }
  
  // Fallback method for browsers that don't support Blob/URL.createObjectURL
  function fallbackDownload(content, filename) {
    // Create a temporary textarea element
    const element = document.createElement('textarea');
    element.value = content;
    element.setAttribute('readonly', '');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);
    
    // Create a link with download attribute using data URI (works in more browsers)
    const link = document.createElement('a');
    const encodedContent = encodeURIComponent(content);
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodedContent);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(element);
    document.body.removeChild(link);
  }

  // Clean up on component destroy and check browser compatibility
  onMount(() => {
    // Check for Blob and URL.createObjectURL support
    const blobSupported = typeof Blob !== 'undefined';
    const urlSupported = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
    
    // Log browser compatibility information (dev only)
    console.log(`Browser compatibility check: Blob: ${blobSupported}, URL.createObjectURL: ${urlSupported}`);
    
    return () => {
      clearTimeout(statusTimeout);
    };
  });
</script>

<div class="log-downloader">
  <div class="relative">
    <!-- Dropdown toggle button -->
    <button 
      on:click={toggleOptions}
      class="flex items-center rounded bg-gray-100 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      aria-expanded={showOptions}
      aria-haspopup="true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download Logs
      <svg class="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <!-- Status message -->
    {#if downloadStatus}
      <span class="ml-2 text-sm font-medium text-green-600">{downloadStatus}</span>
    {/if}
    
    <!-- Dropdown menu -->
    {#if showOptions}
      <div 
        class="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="log-options-button"
      >
        <div class="p-3">
          <h3 class="mb-2 text-sm font-medium text-gray-900">Download Log Files</h3>
          <p class="mb-3 text-xs text-gray-500">Access raw output files for debugging and documentation</p>
          
          <div class="space-y-2">
            {#each logTypes as logType}
              <button
                on:click={() => downloadLog(logType.id)}
                class="flex w-full items-start rounded-md p-2 text-left hover:bg-gray-50"
                role="menuitem"
              >
                <span class="mr-3 text-lg">{logType.icon}</span>
                <div>
                  <p class="text-sm font-medium text-gray-900">{logType.label}</p>
                  <p class="text-xs text-gray-500">{logType.description}</p>
                </div>
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>