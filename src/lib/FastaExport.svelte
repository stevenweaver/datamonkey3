<script>
  import { onMount } from 'svelte';
  import { exportData } from './utils/exportUtils';
  
  // Props
  export let fileMetricsJSON = null;
  export let showExport = true;
  
  // Internal state
  let exportStatus = '';
  let includePadding = true;
  let lineWrap = 60;
  let exportFormat = 'fasta';
  
  // Available export formats
  const exportFormats = [
    { id: 'fasta', label: 'FASTA', description: 'Standard FASTA format' },
    { id: 'csv', label: 'CSV', description: 'Tabular format with annotations' },
    { id: 'json', label: 'JSON', description: 'Full data structure' }
  ];
  
  /**
   * Extract sequence data from the datareader results
   */
  function extractSequenceData() {
    if (!fileMetricsJSON || !fileMetricsJSON.FILE_PARTITION_INFO) {
      return [];
    }
    
    const sequences = [];
    
    // Process each partition
    for (const [partitionKey, partition] of Object.entries(fileMetricsJSON.FILE_PARTITION_INFO)) {
      if (!partition.sequences) continue;
      
      // Extract sequences from this partition
      for (const [seqName, sequence] of Object.entries(partition.sequences)) {
        sequences.push({
          name: seqName,
          sequence: sequence,
          partition: partitionKey
        });
      }
    }
    
    return sequences;
  }
  
  /**
   * Generate FASTA format text from sequences
   */
  function generateFastaText(sequences, options = {}) {
    const { wrap = lineWrap, includePadding = true } = options;
    let fastaText = '';
    
    for (const seq of sequences) {
      // Add header
      fastaText += `>${seq.name}\n`;
      
      // Add sequence with line wrapping
      let sequence = seq.sequence;
      
      // Remove padding if requested
      if (!includePadding) {
        sequence = sequence.replace(/-/g, '');
      }
      
      // Wrap the sequence
      if (wrap > 0) {
        for (let i = 0; i < sequence.length; i += wrap) {
          fastaText += sequence.substring(i, i + wrap) + '\n';
        }
      } else {
        fastaText += sequence + '\n';
      }
    }
    
    return fastaText;
  }
  
  /**
   * Generate CSV format from sequences
   */
  function generateCsvText(sequences) {
    let csvText = 'Name,Partition,Length,Sequence\n';
    
    for (const seq of sequences) {
      const row = [
        `"${seq.name}"`,
        seq.partition,
        seq.sequence.length,
        `"${seq.sequence}"`
      ];
      
      csvText += row.join(',') + '\n';
    }
    
    return csvText;
  }
  
  /**
   * Export sequences in the selected format
   */
  function exportSequences() {
    try {
      const sequences = extractSequenceData();
      
      if (sequences.length === 0) {
        exportStatus = 'No sequence data available';
        setTimeout(() => { exportStatus = ''; }, 3000);
        return;
      }
      
      // Generate a filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const baseFilename = fileMetricsJSON.FILE_INFO?.name || 'sequences';
      const filename = `${baseFilename}_${timestamp}`;
      
      // Generate content based on format
      let content;
      let format;
      
      switch (exportFormat) {
        case 'fasta':
          content = generateFastaText(sequences, { wrap: lineWrap, includePadding });
          format = 'txt';
          break;
          
        case 'csv':
          content = generateCsvText(sequences);
          format = 'csv';
          break;
          
        case 'json':
          content = JSON.stringify({
            info: fileMetricsJSON.FILE_INFO,
            sequences: sequences
          }, null, 2);
          format = 'json';
          break;
      }
      
      // Export the data
      exportData(content, filename, format);
      
      exportStatus = 'Exported successfully';
      setTimeout(() => { exportStatus = ''; }, 3000);
    } catch (error) {
      console.error('Error exporting sequences:', error);
      exportStatus = `Export failed: ${error.message}`;
      setTimeout(() => { exportStatus = ''; }, 5000);
    }
  }
</script>

{#if fileMetricsJSON && showExport}
  <div class="fasta-export mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <h3 class="mb-3 text-lg font-bold">Export Sequences</h3>
    
    <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <!-- Export format -->
      <div>
        <label class="mb-1 block text-sm font-medium">Format:</label>
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
            </label>
          {/each}
        </div>
      </div>
      
      <!-- FASTA options (conditional) -->
      {#if exportFormat === 'fasta'}
        <div>
          <label class="mb-1 block text-sm font-medium">Options:</label>
          <div class="flex flex-wrap gap-3">
            <label class="flex cursor-pointer items-center">
              <input 
                type="checkbox" 
                bind:checked={includePadding}
                class="mr-1"
              >
              <span class="text-sm">Include gap characters</span>
            </label>
            
            <div class="flex items-center">
              <label class="mr-1 text-sm">Line wrap:</label>
              <input 
                type="number" 
                bind:value={lineWrap}
                min="0" 
                max="10000" 
                step="10" 
                class="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
              >
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Export button -->
    <div class="export-actions flex items-center">
      <button 
        on:click={exportSequences}
        class="flex items-center rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        Export Sequences
      </button>
      
      {#if exportStatus}
        <span class="ml-3 text-sm" class:text-green-600={!exportStatus.includes('failed')} class:text-red-600={exportStatus.includes('failed')}>
          {exportStatus}
        </span>
      {/if}
    </div>
    
    <!-- Help text -->
    <div class="mt-3 text-xs text-gray-500">
      {#if exportFormat === 'fasta'}
        <p>Exports sequences in standard FASTA format with each sequence preceded by a header line (starting with &gt;).</p>
      {:else if exportFormat === 'csv'}
        <p>Exports sequences in CSV format with additional metadata including partition and sequence length.</p>
      {:else}
        <p>Exports complete sequence data with all metadata in JSON format.</p>
      {/if}
    </div>
  </div>
{/if}