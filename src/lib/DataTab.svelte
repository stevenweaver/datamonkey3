<script>
  import { onMount } from 'svelte';
  import { fileMetricsStore, currentFile } from '../stores/fileInfo';
  import DataReaderResults from './dataReaderResults.svelte';
  import FastaExport from './FastaExport.svelte';
  import FastaValidator from './FastaValidator.svelte';
  import SequenceWarnings from './SequenceWarnings.svelte';
  import FileManager from './FileManager.svelte';
  import ErrorHandler from './ErrorHandler.svelte';
  import DemoFileSelector from './DemoFileSelector.svelte';
  
  // Props
  export let handleFileUpload = () => {};
  export let handleDemoFileSelect = () => {};
  export let validationError = null;
  export let fileMetricsJSON = null;
  export let handleValidated = () => {};
  export let handleUseRepaired = () => {};
  
  // Computed props
  $: hasFileMetrics = !!fileMetricsJSON && Object.keys(fileMetricsJSON).length > 0;
  $: warnings = hasFileMetrics && fileMetricsJSON.WARNINGS ? fileMetricsJSON.WARNINGS : [];
</script>

<div class="data-tab">
  <div class="mb-8">
    <h2 class="mb-4 text-xl font-bold">Data Input</h2>
    
    <div class="flex flex-wrap gap-4">
      <div class="min-w-[300px] flex-grow">
        <label for="file-upload" class="mb-1 block font-medium">Upload Sequence File:</label>
        <input id="file-upload" type="file" on:change={handleFileUpload} class="file-input w-full" />
      </div>
      
      <div class="min-w-[300px] flex-grow">
        <DemoFileSelector 
          on:selectFile={handleDemoFileSelect} 
          on:error={(e) => validationError = { message: e.detail.message }} 
        />
      </div>
    </div>
    
    <!-- Error display -->
    <ErrorHandler 
      error={validationError} 
      level="error"
      on:dismiss={() => validationError = null}
    />
  </div>
  
  <!-- File Management Section -->
  <div class="mb-8">
    <FileManager onSelectFile={handleFileUpload} />
  </div>
  
  <!-- File Information Section -->
  {#if hasFileMetrics}
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-bold">Sequence Data Information</h2>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <DataReaderResults {fileMetricsJSON} />
      </div>
    </div>
    
    <!-- Sequence Warnings Section (if any) -->
    {#if warnings && warnings.length > 0}
      <div class="mb-8">
        <h2 class="mb-4 text-xl font-bold">Sequence Warnings</h2>
        <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
          <SequenceWarnings warnings={warnings} />
        </div>
      </div>
    {/if}
    
    <!-- Export Section -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-bold">Export Data</h2>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <FastaExport {fileMetricsJSON} />
      </div>
    </div>
  {:else}
    <div class="my-12 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <p class="text-lg text-gray-600">Upload or select a file to view sequence data information</p>
    </div>
  {/if}
</div>

<style>
  .file-input {
    border: 1px solid #e2e8f0;
    padding: 0.5rem;
    border-radius: 0.25rem;
    background-color: white;
  }
</style>