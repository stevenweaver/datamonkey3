<!-- src/lib/EnhancedExportPanel.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { exportData, createShareableLink, copyToClipboard } from './utils/exportUtils';
  import { analysisStore } from '../stores/analyses';
  import { persistentFileStore } from '../stores/fileInfo';
  
  // Props
  export let analysisId;
  
  // Internal state
  let analysis = null;
  let file = null;
  let exportFormat = 'json';
  let showExportOptions = false;
  let exportStatus = '';
  let shareLinkCopied = false;
  let shareLinkTimeout;
  let showPreview = false;
  let previewContent = '';
  let includeMetadata = true;
  let exportFilename = '';
  
  // Available export formats
  const exportFormats = [
    { id: 'json', label: 'JSON', description: 'Full data structure, best for importing later', icon: '{ }' },
    { id: 'csv', label: 'CSV', description: 'Tabular format, best for spreadsheets', icon: '📊' },
    { id: 'txt', label: 'Text', description: 'Plain text format', icon: '📝' }
  ];
  
  // Load analysis data
  $: if (analysisId) {
    loadAnalysisData(analysisId);
  }
  
  async function loadAnalysisData(id) {
    try {
      // Get analysis details
      analysis = $analysisStore.analyses.find(a => a.id === id);
      
      if (!analysis) {
        analysis = await analysisStore.getAnalysis(id);
      }
      
      if (!analysis) {
        throw new Error('Analysis not found');
      }
      
      // Get associated file
      file = $persistentFileStore.files.find(f => f.id === analysis.fileId);
      
      // Generate default filename
      updateExportFilename();
    } catch (error) {
      console.error('Error loading analysis data:', error);
    }
  }
  
  // Update export filename when analysis or format changes
  $: if (analysis && exportFormat) {
    updateExportFilename();
  }
  
  function updateExportFilename() {
    if (!analysis) return;
    
    const method = analysis.method.toUpperCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const extension = `.${exportFormat}`;
    
    // Generate base filename without extension
    const baseFilename = `${method}_analysis_${timestamp}`;
    
    // Add extension if not already present
    exportFilename = baseFilename.endsWith(extension) ? baseFilename : baseFilename + extension;
  }
  
  // Toggle export options
  function toggleExportOptions() {
    showExportOptions = !showExportOptions;
    
    // Generate preview if options are shown
    if (showExportOptions && analysis) {
      generatePreview();
    }
  }
  
  // Generate preview of export content
  async function generatePreview() {
    if (!analysis) return;
    
    try {
      // Parse the analysis result if needed
      let resultData;
      try {
        resultData = typeof analysis.result === 'string' 
          ? JSON.parse(analysis.result)
          : analysis.result;
      } catch (e) {
        resultData = { error: 'Could not parse results', raw: analysis.result };
      }
      
      // Add metadata if needed
      if (includeMetadata) {
        resultData = addMetadata(resultData);
      }
      
      // Generate preview based on format
      switch (exportFormat) {
        case 'json':
          previewContent = JSON.stringify(resultData, null, 2);
          break;
          
        case 'csv':
          previewContent = convertToCSV(resultData);
          break;
          
        case 'txt':
        default:
          previewContent = typeof resultData === 'string' 
            ? resultData 
            : JSON.stringify(resultData, null, 2);
          break;
      }
      
      // Truncate preview for display
      if (previewContent.length > 2000) {
        previewContent = previewContent.substring(0, 2000) + '...\n[Content truncated for preview]';
      }
      
    } catch (error) {
      console.error('Error generating preview:', error);
      previewContent = 'Error generating preview: ' + error.message;
    }
  }
  
  // Add metadata to export
  function addMetadata(data) {
    if (!data || typeof data !== 'object') return data;
    
    return {
      ...data,
      exportMetadata: {
        analysisId: analysis.id,
        method: analysis.method,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt,
        filename: file?.filename || 'Unknown file',
        exportDate: new Date().toISOString()
      }
    };
  }
  
  // Convert to CSV (simplified for preview)
  function convertToCSV(data) {
    if (!data) return '';
    
    // For selection analysis results
    if (data.tested && data.tested.sites) {
      const headers = ['site', 'alpha', 'beta', 'p-value', 'selection'];
      const rows = [headers.join(',')];
      
      for (const site of data.tested.sites) {
        const siteIndex = site.site_index || site.site || 'unknown';
        const alpha = site.alpha || 0;
        const beta = site.beta || 0;
        const pValue = site.p || 1;
        const selection = beta > alpha && pValue <= 0.05 ? 'positive' : 
                         alpha > beta && pValue <= 0.05 ? 'negative' : 'neutral';
        
        rows.push([siteIndex, alpha, beta, pValue, selection].join(','));
      }
      
      return rows.join('\n');
    }
    
    // For a generic object
    return Object.entries(data)
      .filter(([_, value]) => typeof value !== 'object')
      .map(([key, value]) => `${key},${value}`)
      .join('\n');
  }
  
  // Export analysis results
  async function exportAnalysisResults() {
    if (!analysis) return;
    
    try {
      // Parse the analysis result if needed
      let resultData;
      try {
        resultData = typeof analysis.result === 'string' 
          ? JSON.parse(analysis.result)
          : analysis.result;
      } catch (e) {
        resultData = { error: 'Could not parse results', raw: analysis.result };
      }
      
      // Add metadata if requested
      if (includeMetadata) {
        resultData = addMetadata(resultData);
      }
      
      // Export the data
      exportData(resultData, exportFilename, exportFormat);
      
      // Show success message
      exportStatus = `Exported as ${exportFormat.toUpperCase()}`;
      setTimeout(() => { exportStatus = ''; }, 3000);
      
    } catch (error) {
      console.error('Error exporting results:', error);
      exportStatus = 'Export failed';
      setTimeout(() => { exportStatus = ''; }, 3000);
    }
  }
  
  // Copy shareable link to clipboard
  async function copyShareLink() {
    if (!analysisId) return;
    
    const link = createShareableLink(analysisId);
    const success = await copyToClipboard(link);
    
    if (success) {
      shareLinkCopied = true;
      clearTimeout(shareLinkTimeout);
      shareLinkTimeout = setTimeout(() => {
        shareLinkCopied = false;
      }, 3000);
    }
  }
  
  // Toggle preview
  function togglePreview() {
    showPreview = !showPreview;
    if (showPreview) {
      generatePreview();
    }
  }
  
  // Watch for format changes to update preview
  $: if (exportFormat && showPreview) {
    generatePreview();
  }
  
  // Watch for metadata inclusion changes
  $: if (includeMetadata !== undefined && showPreview) {
    generatePreview();
  }
  
  // Clean up on destroy
  onDestroy(() => {
    clearTimeout(shareLinkTimeout);
  });
</script>

<div class="enhanced-export-panel mb-4 rounded-lg border border-gray-200 bg-white shadow-md">
  <div class="flex items-center justify-between border-b border-gray-200 p-4">
    <h3 class="text-lg font-semibold">Export & Share</h3>
    <button 
      on:click={toggleExportOptions}
      class="rounded-full p-1 text-gray-500 hover:bg-gray-100"
      aria-label={showExportOptions ? 'Hide export options' : 'Show export options'}
    >
      {#if showExportOptions}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      {/if}
    </button>
  </div>
  
  {#if showExportOptions}
    <div class="p-4">
      <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Export format selection -->
        <div>
          <label class="mb-2 block font-medium">Export Format</label>
          <div class="grid grid-cols-3 gap-2">
            {#each exportFormats as format}
              <button 
                class={`flex flex-col items-center justify-center rounded-lg border p-3 transition
                  ${exportFormat === format.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                on:click={() => exportFormat = format.id}
              >
                <span class="mb-1 text-lg">{format.icon}</span>
                <span class="font-semibold">{format.label}</span>
                <span class="mt-1 text-center text-xs text-gray-500">{format.description}</span>
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Export options -->
        <div>
          <label class="mb-2 block font-medium">Export Options</label>
          
          <div class="rounded-lg border border-gray-300 p-3">
            <!-- Filename input -->
            <div class="mb-3">
              <label class="mb-1 block text-sm font-medium">Filename</label>
              <input 
                type="text" 
                bind:value={exportFilename} 
                class="w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
            
            <!-- Include metadata checkbox -->
            <div class="mb-3">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  bind:checked={includeMetadata} 
                  class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span class="text-sm">Include metadata (timestamps, analysis info)</span>
              </label>
            </div>
            
            <!-- Preview toggle -->
            <div>
              <button 
                on:click={togglePreview}
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Preview section -->
      {#if showPreview}
        <div class="mb-4">
          <h4 class="mb-2 font-medium">Preview</h4>
          <div class="max-h-60 overflow-auto rounded border border-gray-300 bg-gray-50 p-3">
            <pre class="text-xs">{previewContent}</pre>
          </div>
          <p class="mt-1 text-xs text-gray-500">Preview shows up to 2000 characters</p>
        </div>
      {/if}
      
      <!-- Action buttons -->
      <div class="export-actions flex flex-wrap gap-2">
        <button 
          on:click={exportAnalysisResults}
          class="flex items-center rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={!analysis}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Download {exportFormat.toUpperCase()}
        </button>
        
        <button 
          on:click={copyShareLink}
          class={`flex items-center rounded px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${shareLinkCopied 
              ? 'bg-green-100 text-green-800 focus:ring-green-500' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'}`}
          disabled={!analysisId}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          {shareLinkCopied ? 'Link Copied!' : 'Copy Shareable Link'}
        </button>
        
        {#if exportStatus}
          <span class="ml-2 self-center text-sm font-medium text-green-600">{exportStatus}</span>
        {/if}
      </div>
      
      <div class="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
        <p class="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 mt-0.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <span>
            <strong>Export tips:</strong> JSON format preserves all analysis details, while CSV is best for importing into 
            spreadsheet software. You can share your analysis with others by copying the shareable link.
          </span>
        </p>
      </div>
    </div>
  {/if}
</div>