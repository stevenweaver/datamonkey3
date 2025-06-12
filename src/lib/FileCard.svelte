<script>
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let file = {};
  export let isActive = false;
  export let showDetails = false;
  export let preview = null;
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Format date for display
  function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Same day
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Within the last week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (date > oneWeekAgo) {
      const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleString([], options);
    }
    
    // Default date format
    return date.toLocaleString([], { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Format file size
  function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
  
  // Get file type icon and color based on file type
  function getFileTypeInfo(filename, contentType) {
    const fileExtension = filename ? filename.split('.').pop().toLowerCase() : '';
    
    // Define file type categories
    const fileTypes = {
      fasta: { icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z', color: 'bg-green-100 text-green-600' },
      fastq: { icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z', color: 'bg-green-100 text-green-600' },
      nex: { icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z', color: 'bg-green-100 text-green-600' },
      nexus: { icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z', color: 'bg-green-100 text-green-600' },
      phy: { icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z', color: 'bg-green-100 text-green-600' },
      phylip: { icon: 'M10 10L4 14v-8l6 4zm2-4v8l6-4-6-4z', color: 'bg-green-100 text-green-600' },
      txt: { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-gray-100 text-gray-600' },
      csv: { icon: 'M4 4v16l6-4.5V16l6 4.5V4a1 1 0 00-1-1H5a1 1 0 00-1 1z', color: 'bg-yellow-100 text-yellow-600' },
      tsv: { icon: 'M4 4v16l6-4.5V16l6 4.5V4a1 1 0 00-1-1H5a1 1 0 00-1 1z', color: 'bg-yellow-100 text-yellow-600' },
      json: { icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'bg-purple-100 text-purple-600' },
      xml: { icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'bg-purple-100 text-purple-600' }
    };
    
    // Check if the file extension is in our defined types
    if (fileExtension && fileTypes[fileExtension]) {
      return fileTypes[fileExtension];
    }
    
    // Default file icon
    return {
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-blue-100 text-blue-500'
    };
  }
  
  // Get time ago string
  function getTimeAgo(timestamp) {
    if (!timestamp) return '';
    
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }
    
    return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
  }
  
  // Get file type label
  function getFileTypeLabel(filename, contentType) {
    if (!filename) return 'Unknown';
    
    const fileExtension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
      fasta: 'FASTA Sequence',
      fa: 'FASTA Sequence',
      fastq: 'FASTQ Sequence',
      fq: 'FASTQ Sequence',
      nex: 'NEXUS Format',
      nexus: 'NEXUS Format',
      phy: 'PHYLIP Format',
      phylip: 'PHYLIP Format',
      txt: 'Text File',
      csv: 'CSV Data',
      tsv: 'TSV Data',
      json: 'JSON Data',
      xml: 'XML Data'
    };
    
    return typeMap[fileExtension] || contentType || 'File';
  }
  
  // Get file type info based on the file
  $: fileTypeInfo = getFileTypeInfo(file.filename, file.contentType);
  $: fileTypeLabel = getFileTypeLabel(file.filename, file.contentType);
  $: timeAgo = getTimeAgo(file.createdAt);
  
  // Toggle details visibility
  function toggleDetails(event) {
    event.stopPropagation();
    showDetails = !showDetails;
  }
  
  // Select the file
  function selectFile() {
    dispatch('select', { id: file.id });
  }
  
  // Delete the file
  function deleteFile(event) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      dispatch('delete', { id: file.id });
    }
  }
</script>

<div 
  class="file-card mb-2 overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-md"
  class:border-blue-500={isActive}
  class:shadow-blue-100={isActive}
>
  <div 
    class="cursor-pointer p-3"
    on:click={selectFile}
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <!-- File icon based on type -->
        <div class="mr-3 flex h-10 w-10 items-center justify-center rounded-md {fileTypeInfo.color}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={fileTypeInfo.icon} />
          </svg>
        </div>
        
        <!-- File info -->
        <div class="flex-grow overflow-hidden">
          <div class="flex items-center">
            <h3 class="truncate font-medium">{file.filename || 'Unnamed File'}</h3>
            <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{fileTypeLabel}</span>
          </div>
          <div class="flex items-center text-xs text-gray-500">
            <span>{formatFileSize(file.size)}</span>
            <span class="mx-1">•</span>
            <span title={formatDate(file.createdAt)}>{timeAgo}</span>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="ml-2 flex items-center">
        <button
          on:click={toggleDetails}
          class="ml-1 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title={showDetails ? 'Hide details' : 'Show details'}
        >
          {#if showDetails}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          {/if}
        </button>
        
        <button
          on:click={deleteFile}
          class="ml-1 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-500"
          title="Delete file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Details panel (conditional) -->
    {#if showDetails}
      <div class="details-panel mt-3 rounded-md bg-gray-50 p-3">
        <!-- File preview, if available -->
        {#if preview}
          <div class="mb-3">
            <h4 class="mb-1 text-sm font-medium">Preview</h4>
            <div class="preview-content max-h-28 overflow-y-auto rounded border border-gray-200 bg-white p-2 text-xs">
              <pre class="whitespace-pre-wrap">{preview}</pre>
            </div>
          </div>
        {/if}
        
        <!-- File metadata -->
        <div class="metadata">
          <h4 class="mb-1 text-sm font-medium">File Details</h4>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="text-gray-500">File Name:</div>
            <div class="truncate font-medium">{file.filename}</div>
            
            <div class="text-gray-500">File Type:</div>
            <div class="font-medium">{fileTypeLabel}</div>
            
            <div class="text-gray-500">Size:</div>
            <div class="font-medium">{formatFileSize(file.size)}</div>
            
            <div class="text-gray-500">MIME Type:</div>
            <div class="font-medium">{file.contentType || 'Unknown'}</div>
            
            <div class="text-gray-500">Upload Date:</div>
            <div class="font-medium">{formatDate(file.createdAt)}</div>
            
            <div class="text-gray-500">ID:</div>
            <div class="font-mono text-[10px] opacity-70">{file.id}</div>
          </div>
        </div>
        
        <!-- File actions -->
        <div class="mt-3 flex justify-end">
          <button
            on:click={selectFile}
            class="flex items-center rounded-md bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Select File
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>