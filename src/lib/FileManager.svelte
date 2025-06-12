<script>
  import { onMount } from 'svelte';
  import { persistentFileStore, currentFile } from '../stores/fileInfo';
  import { analysisStore } from '../stores/analyses';
  import FileCard from './FileCard.svelte';
  
  // Props
  export let onSelectFile = () => {};
  
  // Local state
  let filePreviews = new Map();
  let expandedFiles = new Set();
  let sortBy = 'date';
  let sortDirection = 'desc';
  let filterText = '';
  let isLoading = true;
  
  // Computed properties
  $: sortedFiles = sortFiles($persistentFileStore.files, sortBy, sortDirection);
  $: filteredFiles = filterFiles(sortedFiles, filterText);
  
  // Load files on mount
  onMount(async () => {
    isLoading = true;
    try {
      await persistentFileStore.loadFiles();
      await loadFilePreviews();
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      isLoading = false;
    }
  });
  
  // Load previews for all files
  async function loadFilePreviews() {
    for (const file of $persistentFileStore.files) {
      if (!filePreviews.has(file.id)) {
        try {
          const fileObj = await persistentFileStore.getFile(file.id);
          const preview = await generatePreview(fileObj);
          filePreviews.set(file.id, preview);
        } catch (error) {
          console.error(`Error loading preview for ${file.filename}:`, error);
          filePreviews.set(file.id, 'Preview unavailable');
        }
      }
    }
  }
  
  // Generate a preview of the file contents
  async function generatePreview(fileObj) {
    try {
      const text = await fileObj.text();
      // Show first few lines
      const lines = text.split('\n').slice(0, 5);
      return lines.join('\n');
    } catch (error) {
      console.error('Error generating preview:', error);
      return 'Preview unavailable';
    }
  }
  
  // Sort files based on selected criteria
  function sortFiles(files, sortBy, direction) {
    if (!files || !files.length) return [];
    
    return [...files].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.filename || '').localeCompare(b.filename || '');
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'date':
        default:
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
      }
      
      return direction === 'desc' ? -comparison : comparison;
    });
  }
  
  // Filter files by name
  function filterFiles(files, filterText) {
    if (!filterText) return files;
    
    const search = filterText.toLowerCase();
    return files.filter(file => 
      (file.filename || '').toLowerCase().includes(search)
    );
  }
  
  // Change sort criteria
  function changeSorting(criteria) {
    if (sortBy === criteria) {
      // Toggle direction if clicking the same criteria
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to descending for new criteria
      sortBy = criteria;
      sortDirection = 'desc';
    }
  }
  
  // Toggle file details visibility
  function toggleFileDetails(fileId) {
    if (expandedFiles.has(fileId)) {
      expandedFiles.delete(fileId);
    } else {
      expandedFiles.add(fileId);
    }
    expandedFiles = expandedFiles; // Trigger reactivity
  }
  
  // Handle file selection
  async function selectFile(fileId) {
    try {
      // Set the current file in the store
      persistentFileStore.setCurrentFile(fileId);
      
      // Notify that file was selected, but don't trigger a re-analysis
      // by passing an event with a special flag
      const file = await persistentFileStore.getFile(fileId);
      
      // Create a custom event object that indicates this is a selection, not an upload
      onSelectFile({ 
        isSelection: true, 
        fileId: fileId,
        file: file
      });
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  }
  
  // Handle file deletion
  async function deleteFile(fileId) {
    try {
      // First delete any analyses associated with this file
      const fileAnalyses = $analysisStore.analyses.filter(a => a.fileId === fileId);
      for (const analysis of fileAnalyses) {
        await analysisStore.deleteAnalysis(analysis.id);
      }
      
      // Then delete the file
      await persistentFileStore.deleteFile(fileId);
      
      // Remove from previews map
      filePreviews.delete(fileId);
      filePreviews = filePreviews; // Trigger reactivity
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  
  // Handle clearing all files
  async function clearAllFiles() {
    try {
      if (confirm('Are you sure you want to delete ALL files and their analyses? This cannot be undone.')) {
        // Get all file IDs
        const fileIds = $persistentFileStore.files.map(file => file.id);
        
        // Show a loading state
        isLoading = true;
        
        // Delete each file and its analyses
        for (const fileId of fileIds) {
          const fileAnalyses = $analysisStore.analyses.filter(a => a.fileId === fileId);
          for (const analysis of fileAnalyses) {
            await analysisStore.deleteAnalysis(analysis.id);
          }
          
          await persistentFileStore.deleteFile(fileId);
        }
        
        // Clear the previews map
        filePreviews = new Map();
        
        // Force a reload of files
        await persistentFileStore.loadFiles();
        
        // Clear the current file
        persistentFileStore.setCurrentFile(null);
        
        isLoading = false;
      }
    } catch (error) {
      console.error('Error clearing all files:', error);
      isLoading = false;
    }
  }
</script>

<div class="file-manager">
  <div class="mb-4">
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-xl font-bold">Saved Files</h2>
      
      <!-- Clear All Files button -->
      {#if $persistentFileStore.files.length > 0}
        <button
          on:click={clearAllFiles}
          class="flex items-center rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
          title="Delete all files and their analyses"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Clear All Files
        </button>
      {/if}
    </div>
    
    <div class="mb-2 flex flex-wrap items-center gap-2">
      <!-- Search input -->
      <div class="relative flex-grow">
        <input 
          type="text"
          placeholder="Search files..."
          bind:value={filterText}
          class="w-full rounded-md border border-gray-300 pl-8 pr-2 py-1 text-sm"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <!-- Sort options -->
      <div class="flex rounded-md border border-gray-300 text-sm">
        <button 
          class="px-2 py-1 transition-colors"
          class:bg-blue-500={sortBy === 'name'}
          class:text-white={sortBy === 'name'}
          class:hover:bg-gray-100={sortBy !== 'name'}
          class:hover:text-gray-900={sortBy !== 'name'}
          on:click={() => changeSorting('name')}
        >
          Name {sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button 
          class="border-l border-gray-300 px-2 py-1 transition-colors"
          class:bg-blue-500={sortBy === 'size'}
          class:text-white={sortBy === 'size'}
          class:hover:bg-gray-100={sortBy !== 'size'}
          class:hover:text-gray-900={sortBy !== 'size'}
          on:click={() => changeSorting('size')}
        >
          Size {sortBy === 'size' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button 
          class="border-l border-gray-300 px-2 py-1 transition-colors"
          class:bg-blue-500={sortBy === 'date'}
          class:text-white={sortBy === 'date'}
          class:hover:bg-gray-100={sortBy !== 'date'}
          class:hover:text-gray-900={sortBy !== 'date'}
          on:click={() => changeSorting('date')}
        >
          Date {sortBy === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </button>
      </div>
    </div>
  </div>
  
  <!-- File list -->
  <div class="files-container max-h-96 overflow-y-auto">
    {#if isLoading}
      <div class="flex items-center justify-center p-4 text-gray-500">
        <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading files...
      </div>
    {:else if filteredFiles.length === 0}
      <p class="p-4 text-center text-gray-500">
        {filterText ? 'No matching files found.' : 'No files saved yet. Upload a file to get started.'}
      </p>
    {:else}
      {#each filteredFiles as file (file.id)}
        <FileCard 
          {file} 
          isActive={file.id === $currentFile?.id}
          showDetails={expandedFiles.has(file.id)}
          preview={filePreviews.get(file.id)}
          on:select={({detail}) => selectFile(detail.id)}
          on:delete={({detail}) => deleteFile(detail.id)}
        />
      {/each}
    {/if}
  </div>
</div>