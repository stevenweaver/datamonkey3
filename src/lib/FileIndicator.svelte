<script>
  import { currentFile } from '../stores/fileInfo';
  import { fileMetricsStore } from '../stores/fileInfo';
  
  // Format file size in a human-readable way
  function formatFileSize(bytes) {
    if (!bytes) return '0B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)}${units[i]}`;
  }

  // Get format from filename
  function getFileFormat(filename) {
    if (!filename) return '';
    const extension = filename.split('.').pop().toLowerCase();
    const formatMap = {
      'fasta': 'FASTA',
      'fna': 'FASTA Nucleic Acid',
      'faa': 'FASTA Amino Acid',
      'fa': 'FASTA',
      'nex': 'NEXUS',
      'nexus': 'NEXUS',
      'phy': 'PHYLIP',
      'phylip': 'PHYLIP',
    };
    return formatMap[extension] || extension.toUpperCase();
  }
</script>

{#if $currentFile}
  <div class="file-indicator mb-premium-lg rounded-premium border-2 border-accent-warm bg-accent-pearl p-premium-md shadow-premium">
    <div class="flex flex-wrap items-center justify-between">
      <div class="flex items-center">
        <div class="mr-premium-md flex h-10 w-10 items-center justify-center rounded-premium bg-accent-copper text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <div>
            <span class="text-premium-meta text-text-slate">Currently Analyzing:</span> 
            <span class="text-premium-header font-bold text-brand-royal ml-premium-xs">{$currentFile.name}</span>
          </div>
          <div class="text-premium-meta text-text-slate flex flex-wrap items-center gap-premium-sm">
            {#if $fileMetricsStore?.FILE_INFO}
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                {$fileMetricsStore.FILE_INFO.sequences} sequences
              </span>
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                {$fileMetricsStore.FILE_INFO.sites} sites
              </span>
            {/if}
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
              </svg>
              {formatFileSize($currentFile.size)}
            </span>
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
              </svg>
              {getFileFormat($currentFile.name)}
            </span>
          </div>
        </div>
      </div>
      <div class="mt-premium-sm md:mt-0">
        <div class="rounded-premium-sm bg-brand-whisper px-premium-sm py-premium-xs text-premium-caption font-medium text-text-slate">
          {#if $fileMetricsStore?.FILE_INFO?.goodtree}
            <span class="text-accent-copper">✓ Valid for analysis</span>
          {:else if $fileMetricsStore?.FILE_INFO}
            <span class="text-brand-deep">⚠️ Has potential issues</span>
          {:else}
            <span class="text-text-slate">File loaded</span>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}