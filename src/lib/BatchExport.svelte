<script>
  import { onMount } from 'svelte';
  import { analysisStore } from '../stores/analyses';
  import { persistentFileStore } from '../stores/fileInfo';
  import { exportData } from './utils/exportUtils';
  
  // Internal state
  let analyses = [];
  let files = [];
  let selectedAnalyses = new Set();
  let exportFormat = 'json';
  let isExporting = false;
  let exportStatus = '';
  let isSelectAll = false;
  let filterMethod = 'all';
  let filterFile = 'all';
  let availableMethods = ['all'];
  let availableFiles = ['all'];
  
  // Available export formats
  const exportFormats = [
    { id: 'json', label: 'JSON', description: 'Full data structure' },
    { id: 'csv', label: 'CSV', description: 'Tabular format' },
    { id: 'txt', label: 'Text', description: 'Plain text summary' }
  ];
  
  // Load analyses on mount
  onMount(async () => {
    await loadAnalyses();
  });
  
  // Load analyses
  async function loadAnalyses() {
    try {
      // Load analyses and files if needed
      if ($analysisStore.analyses.length === 0) {
        await analysisStore.loadAnalyses();
      }
      
      if ($persistentFileStore.files.length === 0) {
        await persistentFileStore.loadFiles();
      }
      
      // Get completed analyses
      analyses = $analysisStore.analyses
        .filter(a => a.status === 'completed')
        .sort((a, b) => b.createdAt - a.createdAt);
      
      files = $persistentFileStore.files;
      
      // Build available filters
      availableMethods = ['all', ...new Set(analyses.map(a => a.method))];
      
      const fileIds = new Set(analyses.map(a => a.fileId));
      const fileOptions = files
        .filter(f => fileIds.has(f.id))
        .map(f => ({ id: f.id, name: f.filename }));
      
      availableFiles = [
        { id: 'all', name: 'All Files' },
        ...fileOptions
      ];
    } catch (error) {
      console.error('Error loading analyses for batch export:', error);
    }
  }
  
  // Filter analyses based on selected filters
  $: filteredAnalyses = analyses.filter(analysis => {
    const methodMatch = filterMethod === 'all' || analysis.method === filterMethod;
    const fileMatch = filterFile === 'all' || analysis.fileId === filterFile;
    return methodMatch && fileMatch;
  });
  
  // Toggle select all
  function toggleSelectAll() {
    if (isSelectAll) {
      // Deselect all
      selectedAnalyses = new Set();
    } else {
      // Select all filtered analyses
      selectedAnalyses = new Set(filteredAnalyses.map(a => a.id));
    }
    isSelectAll = !isSelectAll;
  }
  
  // Toggle selection for an analysis
  function toggleSelection(analysisId) {
    if (selectedAnalyses.has(analysisId)) {
      selectedAnalyses.delete(analysisId);
    } else {
      selectedAnalyses.add(analysisId);
    }
    selectedAnalyses = selectedAnalyses; // Trigger reactivity
    
    // Update select all state
    isSelectAll = filteredAnalyses.length > 0 && 
      filteredAnalyses.every(a => selectedAnalyses.has(a.id));
  }
  
  // Format date for display
  function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  }
  
  // Get file name for an analysis
  function getFileName(fileId) {
    const file = files.find(f => f.id === fileId);
    return file ? file.filename : 'Unknown file';
  }
  
  // Export selected analyses
  async function exportSelectedAnalyses() {
    if (selectedAnalyses.size === 0) return;
    
    isExporting = true;
    exportStatus = 'Preparing export...';
    
    try {
      // Get selected analyses data
      const analysesToExport = analyses.filter(a => selectedAnalyses.has(a.id));
      
      if (analysesToExport.length === 0) {
        exportStatus = 'No analyses selected';
        return;
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      
      // For single exports, we'll create a combined file
      let exportFilename = `batch_export_${timestamp}`;
      let exportContent;
      
      if (exportFormat === 'json') {
        // Create a JSON with all selected analyses
        const exportData = {
          exportDate: new Date().toISOString(),
          analysisCount: analysesToExport.length,
          analyses: await Promise.all(analysesToExport.map(async analysis => {
            const fullAnalysis = await analysisStore.getAnalysis(analysis.id);
            const file = files.find(f => f.id === analysis.fileId);
            
            return {
              id: analysis.id,
              method: analysis.method,
              createdAt: analysis.createdAt,
              file: file ? {
                name: file.filename,
                size: file.size,
                type: file.contentType
              } : null,
              result: typeof fullAnalysis.result === 'string' 
                ? JSON.parse(fullAnalysis.result) 
                : fullAnalysis.result
            };
          }))
        };
        
        exportContent = JSON.stringify(exportData, null, 2);
      } else if (exportFormat === 'csv') {
        // Create a CSV with analysis summaries
        const headers = ['ID', 'Method', 'File', 'Created', 'Status'];
        const rows = analysesToExport.map(a => [
          a.id,
          a.method,
          getFileName(a.fileId),
          new Date(a.createdAt).toISOString(),
          a.status
        ]);
        
        exportContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
      } else {
        // Text format - simple summary
        exportContent = `Batch Export - ${timestamp}\n\n`;
        exportContent += `Total Analyses: ${analysesToExport.length}\n\n`;
        
        for (const analysis of analysesToExport) {
          exportContent += `ID: ${analysis.id}\n`;
          exportContent += `Method: ${analysis.method}\n`;
          exportContent += `File: ${getFileName(analysis.fileId)}\n`;
          exportContent += `Created: ${formatDate(analysis.createdAt)}\n`;
          exportContent += `Status: ${analysis.status}\n\n`;
        }
      }
      
      // Perform the export
      exportData(exportContent, exportFilename, exportFormat);
      
      exportStatus = `Exported ${analysesToExport.length} analyses successfully`;
      setTimeout(() => { exportStatus = ''; }, 3000);
    } catch (error) {
      console.error('Error exporting analyses:', error);
      exportStatus = `Export failed: ${error.message}`;
    } finally {
      isExporting = false;
    }
  }
  
  // Export FASTA file with corrections
  async function exportCorrectedFasta(analysisId) {
    try {
      const analysis = await analysisStore.getAnalysis(analysisId);
      if (!analysis || analysis.method !== 'datareader') {
        return false;
      }
      
      const file = files.find(f => f.id === analysis.fileId);
      if (!file) {
        return false;
      }
      
      const result = typeof analysis.result === 'string' 
        ? JSON.parse(analysis.result) 
        : analysis.result;
      
      if (!result || !result.FILE_INFO) {
        return false;
      }
      
      // TODO: Extract the corrected FASTA content
      
      return true;
    } catch (error) {
      console.error('Error exporting corrected FASTA:', error);
      return false;
    }
  }
</script>

<div class="batch-export rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <h3 class="mb-3 text-lg font-bold">Batch Export</h3>
  
  <!-- Filter controls -->
  <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div>
      <label class="mb-1 block text-sm font-medium">Method:</label>
      <select 
        bind:value={filterMethod}
        class="w-full rounded border border-gray-300 px-2 py-1 text-sm"
      >
        {#each availableMethods as method}
          <option value={method}>{method === 'all' ? 'All Methods' : method.toUpperCase()}</option>
        {/each}
      </select>
    </div>
    
    <div>
      <label class="mb-1 block text-sm font-medium">File:</label>
      <select 
        bind:value={filterFile}
        class="w-full rounded border border-gray-300 px-2 py-1 text-sm"
      >
        {#if Array.isArray(availableFiles)}
          {#each availableFiles as fileOption}
            <option value={fileOption.id}>{fileOption.name}</option>
          {/each}
        {:else}
          <option value="all">All Files</option>
        {/if}
      </select>
    </div>
  </div>
  
  <!-- Export format selection -->
  <div class="mb-4">
    <label class="mb-1 block text-sm font-medium">Export Format:</label>
    <div class="flex flex-wrap gap-2">
      {#each exportFormats as format}
        <label class="flex cursor-pointer items-center">
          <input 
            type="radio" 
            name="exportFormat" 
            value={format.id} 
            bind:group={exportFormat}
            class="mr-1"
          >
          <span class="mr-1 text-sm font-medium">{format.label}</span>
          <span class="text-xs text-gray-500">({format.description})</span>
        </label>
      {/each}
    </div>
  </div>
  
  <!-- Analysis selection table -->
  <div class="mb-4">
    <div class="mb-2 flex items-center justify-between">
      <h4 class="font-medium">Select Analyses to Export</h4>
      <label class="flex cursor-pointer items-center text-sm">
        <input type="checkbox" checked={isSelectAll} on:change={toggleSelectAll} class="mr-1">
        Select All
      </label>
    </div>
    
    <div class="max-h-64 overflow-y-auto rounded border border-gray-200">
      {#if filteredAnalyses.length === 0}
        <p class="p-3 text-center text-sm text-gray-500">
          No analyses available for the selected filters
        </p>
      {:else}
        <table class="w-full table-auto text-sm">
          <thead class="sticky top-0 bg-gray-100">
            <tr>
              <th class="w-10 p-2"></th>
              <th class="w-20 p-2 text-left">Method</th>
              <th class="p-2 text-left">File</th>
              <th class="w-40 p-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredAnalyses as analysis (analysis.id)}
              <tr class="cursor-pointer border-t border-gray-200 hover:bg-gray-50">
                <td class="p-2 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedAnalyses.has(analysis.id)}
                    on:change={() => toggleSelection(analysis.id)}
                    class="h-4 w-4 cursor-pointer"
                  />
                </td>
                <td class="p-2 font-medium">{analysis.method.toUpperCase()}</td>
                <td class="p-2 truncate">{getFileName(analysis.fileId)}</td>
                <td class="p-2 text-gray-600">{formatDate(analysis.createdAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
    
    <p class="mt-1 text-right text-sm text-gray-600">
      {selectedAnalyses.size} analyses selected
    </p>
  </div>
  
  <!-- Export button -->
  <div class="export-actions">
    <button 
      on:click={exportSelectedAnalyses}
      disabled={selectedAnalyses.size === 0 || isExporting}
      class="flex items-center rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
    >
      {#if isExporting}
        <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Exporting...
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        Export Selected Analyses
      {/if}
    </button>
    
    {#if exportStatus}
      <p class="mt-2 text-sm" class:text-green-600={!exportStatus.includes('failed')} class:text-red-600={exportStatus.includes('failed')}>
        {exportStatus}
      </p>
    {/if}
  </div>
</div>