<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Sample files available for demo
  const demoFiles = [
    { name: 'CD2-slim.fna', description: 'CD2 gene alignment (10 sequences)', path: '/test-data/CD2-slim.fna' },
    { name: 'small.nex', description: 'Small NEXUS alignment', path: '/test-data/small.nex' },
    { name: 'medium.nex', description: 'Medium NEXUS alignment', path: '/test-data/medium.nex' },
    { name: 'large.nex', description: 'Large NEXUS alignment', path: '/test-data/large.nex' }
  ];
  
  // Handle loading a demo file using the File System API
  async function loadDemoFile(filePath, fileName) {
    try {
      // For security reasons, browser JS can't directly access file system
      // In a real app, these would be served from the server's public directory
      // For this demo, we'll simply read the files from our test-data directory
      
      // Read file from test-data directory using fetch
      const demoFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      
      // In a development environment, we need to fetch from the right path
      // In Vite, public files are served from the root, so we adjust the path
      const response = await fetch(demoFilePath);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch demo file: ${response.status} ${response.statusText}`);
      }
      
      // Get the file content
      const content = await response.text();
      
      // Create a File object from the content
      const file = new File([content], fileName, { type: 'application/octet-stream' });
      
      // Add metadata to indicate this is a demo file
      const metadata = { isDemo: true, source: 'demoSelector' };
      
      // Dispatch the file to the parent component
      dispatch('selectFile', { file, metadata });
      
    } catch (error) {
      console.error('Error loading demo file:', error);
      dispatch('error', { message: `Failed to load demo file: ${error.message}` });
    }
  }
</script>

<div class="demo-selector mt-2 mb-4">
  <div class="flex items-center mb-2">
    <div class="mr-2 text-blue-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
      </svg>
    </div>
    <span class="text-sm font-medium text-gray-700">Try a sample file:</span>
  </div>
  
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
    {#each demoFiles as demoFile}
      <button 
        class="flex items-center p-2 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
        on:click={() => loadDemoFile(demoFile.path, demoFile.name)}
      >
        <div class="mr-2 text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="text-left">
          <div class="font-medium text-sm">{demoFile.name}</div>
          <div class="text-xs text-gray-500">{demoFile.description}</div>
        </div>
      </button>
    {/each}
  </div>
</div>