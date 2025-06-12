<script>
  import { onMount } from 'svelte';
  import { analysisStore } from '../stores/analyses';
  import { persistentFileStore } from '../stores/fileInfo';

  // Selected analyses for comparison (max 2)
  let selectedAnalyses = [];
  let maxSelections = 2;
  
  // Analysis data
  let analyses = [];
  let comparisonData = null;
  let isLoading = false;
  let error = null;
  
  // Filter for analysis type
  let analysisTypeFilter = 'all';
  let availableTypes = ['all'];
  
  $: filteredAnalyses = analyses.filter(a => 
    analysisTypeFilter === 'all' || a.method === analysisTypeFilter
  );
  
  // Load analyses on mount
  onMount(async () => {
    await loadAnalyses();
  });
  
  // Load analyses from store
  async function loadAnalyses() {
    isLoading = true;
    error = null;
    
    try {
      // Load data if not already loaded
      if ($analysisStore.analyses.length === 0) {
        await analysisStore.loadAnalyses();
      }
      
      // Get completed analyses
      analyses = $analysisStore.analyses
        .filter(a => a.status === 'completed')
        .sort((a, b) => b.createdAt - a.createdAt);
      
      // Extract available methods for filtering
      const methods = [...new Set(analyses.map(a => a.method))];
      availableTypes = ['all', ...methods];
      
    } catch (e) {
      console.error('Error loading analyses:', e);
      error = 'Failed to load analyses';
    } finally {
      isLoading = false;
    }
  }
  
  // Toggle analysis selection for comparison
  function toggleAnalysisSelection(analysis) {
    const index = selectedAnalyses.findIndex(a => a.id === analysis.id);
    
    if (index > -1) {
      // Remove if already selected
      selectedAnalyses = selectedAnalyses.filter(a => a.id !== analysis.id);
    } else if (selectedAnalyses.length < maxSelections) {
      // Add if under max selections
      selectedAnalyses = [...selectedAnalyses, analysis];
    } else {
      // Replace oldest selection if at max
      selectedAnalyses = [selectedAnalyses[1], analysis];
    }
    
    // If we have 2 analyses of the same type, compare them
    if (selectedAnalyses.length === 2 && 
        selectedAnalyses[0].method === selectedAnalyses[1].method) {
      compareAnalyses();
    } else {
      comparisonData = null;
    }
  }
  
  // Compare selected analyses
  async function compareAnalyses() {
    if (selectedAnalyses.length !== 2) return;
    
    isLoading = true;
    error = null;
    
    try {
      // Get full analysis data for both selections
      const analysis1 = await analysisStore.getAnalysis(selectedAnalyses[0].id);
      const analysis2 = await analysisStore.getAnalysis(selectedAnalyses[1].id);
      
      // Parse result JSON
      const result1 = typeof analysis1.result === 'string' 
        ? JSON.parse(analysis1.result) 
        : analysis1.result;
        
      const result2 = typeof analysis2.result === 'string' 
        ? JSON.parse(analysis2.result) 
        : analysis2.result;
      
      // Generate comparison data based on analysis type
      comparisonData = generateComparisonData(
        analysis1.method,
        result1,
        result2,
        analysis1,
        analysis2
      );
      
    } catch (e) {
      console.error('Error comparing analyses:', e);
      error = 'Failed to compare analyses';
      comparisonData = null;
    } finally {
      isLoading = false;
    }
  }
  
  // Generate comparison data based on analysis type
  function generateComparisonData(method, result1, result2, analysis1, analysis2) {
    // Get file names for the analyses
    const file1 = $persistentFileStore.files.find(f => f.id === analysis1.fileId)?.filename || 'Unknown';
    const file2 = $persistentFileStore.files.find(f => f.id === analysis2.fileId)?.filename || 'Unknown';
    
    // Prepare basic comparison info
    const comparison = {
      method,
      file1,
      file2,
      analysis1: {
        id: analysis1.id,
        createdAt: analysis1.createdAt
      },
      analysis2: {
        id: analysis2.id,
        createdAt: analysis2.createdAt
      },
      differences: []
    };
    
    // Compare based on analysis type
    switch (method) {
      case 'datareader':
        // Compare file statistics
        if (result1.FILE_INFO && result2.FILE_INFO) {
          const info1 = result1.FILE_INFO;
          const info2 = result2.FILE_INFO;
          
          comparison.summary = {
            file1: {
              sequences: info1.sequences || 0,
              sites: info1.sites || 0,
              type: info1.type || 'Unknown'
            },
            file2: {
              sequences: info2.sequences || 0,
              sites: info2.sites || 0,
              type: info2.type || 'Unknown'
            }
          };
          
          // Find differences
          if (info1.sequences !== info2.sequences) {
            comparison.differences.push({
              property: 'Sequences',
              value1: info1.sequences || 0,
              value2: info2.sequences || 0
            });
          }
          
          if (info1.sites !== info2.sites) {
            comparison.differences.push({
              property: 'Sites',
              value1: info1.sites || 0,
              value2: info2.sites || 0
            });
          }
          
          if (info1.type !== info2.type) {
            comparison.differences.push({
              property: 'File Type',
              value1: info1.type || 'Unknown',
              value2: info2.type || 'Unknown'
            });
          }
        }
        break;
        
      case 'fel':
      case 'slac':
      case 'meme':
      case 'fubar':
        // Compare selection analysis results
        if (result1.tested?.sites && result2.tested?.sites) {
          // Basic summary
          comparison.summary = {
            file1: {
              sites: result1.tested.sites.length || 0,
              positiveCount: result1.tested.sites.filter(s => 
                s.p <= 0.05 && s.beta > s.alpha
              ).length || 0
            },
            file2: {
              sites: result2.tested.sites.length || 0,
              positiveCount: result2.tested.sites.filter(s => 
                s.p <= 0.05 && s.beta > s.alpha
              ).length || 0
            }
          };
          
          // Find significant differences
          const siteComparisons = [];
          
          // Create a map of sites for faster lookup
          const sitesMap2 = new Map();
          result2.tested.sites.forEach(site => {
            const index = site.site_index || site.site;
            sitesMap2.set(index, site);
          });
          
          // Compare sites
          result1.tested.sites.forEach(site1 => {
            const siteIndex = site1.site_index || site1.site;
            const site2 = sitesMap2.get(siteIndex);
            
            if (site2) {
              // Check if there are significant differences
              const pDiff = Math.abs(site1.p - site2.p);
              const status1 = site1.p <= 0.05 && site1.beta > site1.alpha ? 'positive' : 
                              site1.p <= 0.05 && site1.beta < site1.alpha ? 'negative' : 'neutral';
              const status2 = site2.p <= 0.05 && site2.beta > site2.alpha ? 'positive' : 
                              site2.p <= 0.05 && site2.beta < site2.alpha ? 'negative' : 'neutral';
              
              // If status changed or p-value difference is significant
              if (status1 !== status2 || pDiff > 0.05) {
                siteComparisons.push({
                  site: siteIndex,
                  p1: site1.p,
                  p2: site2.p,
                  status1,
                  status2,
                  changed: status1 !== status2
                });
              }
            } else {
              // Site only in first analysis
              siteComparisons.push({
                site: siteIndex,
                p1: site1.p,
                p2: null,
                status1: site1.p <= 0.05 && site1.beta > site1.alpha ? 'positive' : 'neutral',
                status2: 'missing',
                changed: true
              });
            }
          });
          
          // Check for sites only in second analysis
          result2.tested.sites.forEach(site2 => {
            const siteIndex = site2.site_index || site2.site;
            const site1Index = result1.tested.sites.findIndex(s => 
              (s.site_index || s.site) === siteIndex
            );
            
            if (site1Index === -1) {
              siteComparisons.push({
                site: siteIndex,
                p1: null,
                p2: site2.p,
                status1: 'missing',
                status2: site2.p <= 0.05 && site2.beta > site2.alpha ? 'positive' : 'neutral',
                changed: true
              });
            }
          });
          
          // Sort by site number
          siteComparisons.sort((a, b) => {
            const siteA = typeof a.site === 'number' ? a.site : parseInt(a.site);
            const siteB = typeof b.site === 'number' ? b.site : parseInt(b.site);
            return siteA - siteB;
          });
          
          comparison.siteComparisons = siteComparisons;
          
          // Add main differences for summary
          comparison.differences = [
            {
              property: 'Total Sites',
              value1: comparison.summary.file1.sites,
              value2: comparison.summary.file2.sites
            },
            {
              property: 'Positively Selected Sites',
              value1: comparison.summary.file1.positiveCount,
              value2: comparison.summary.file2.positiveCount
            },
            {
              property: 'Sites with Changed Status',
              value1: '-',
              value2: siteComparisons.filter(s => s.changed).length
            }
          ];
        }
        break;
        
      default:
        // Generic comparison for other analysis types
        comparison.summary = {
          file1: { analysisId: analysis1.id },
          file2: { analysisId: analysis2.id }
        };
        
        comparison.differences.push({
          property: 'Analysis Type',
          value1: method,
          value2: method,
          note: 'Detailed comparison not available for this analysis type'
        });
    }
    
    return comparison;
  }
  
  // Format date for display
  function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  }
</script>

<div class="analysis-compare rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <h2 class="mb-4 text-xl font-bold">Compare Analyses</h2>
  
  <!-- Filter controls -->
  <div class="mb-4 flex flex-wrap items-center gap-2">
    <label class="text-sm font-medium">Filter by type:</label>
    <select 
      bind:value={analysisTypeFilter}
      class="rounded border border-gray-300 px-2 py-1 text-sm"
    >
      {#each availableTypes as type}
        <option value={type}>{type === 'all' ? 'All Types' : type.toUpperCase()}</option>
      {/each}
    </select>
    
    <div class="ml-auto">
      <button
        on:click={loadAnalyses}
        class="flex items-center rounded bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200"
        disabled={isLoading}
      >
        {#if isLoading}
          <svg class="mr-1 h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        {/if}
        Refresh
      </button>
    </div>
  </div>
  
  <!-- Selection section -->
  <div class="mb-4">
    <h3 class="mb-2 text-lg font-medium">Select Analyses to Compare</h3>
    <p class="mb-2 text-sm text-gray-600">Select up to {maxSelections} analyses of the same type to compare. For the most meaningful comparison, select analyses with similar parameters.</p>
    
    {#if error}
      <div class="mb-2 rounded bg-red-100 p-2 text-sm text-red-700">
        {error}
      </div>
    {/if}
    
    <!-- Selected analyses badges -->
    <div class="mb-3 flex flex-wrap gap-2">
      {#if selectedAnalyses.length === 0}
        <span class="text-sm text-gray-500">No analyses selected</span>
      {:else}
        {#each selectedAnalyses as analysis}
          <div class="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
            <span>{analysis.method.toUpperCase()}</span>
            <button
              on:click={() => toggleAnalysisSelection(analysis)}
              class="ml-2 rounded-full p-0.5 hover:bg-blue-200"
              title="Remove selection"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        {/each}
      {/if}
    </div>
    
    <!-- Analysis selection list -->
    <div class="max-h-48 overflow-y-auto rounded border border-gray-200">
      {#if filteredAnalyses.length === 0}
        <p class="p-3 text-center text-sm text-gray-500">
          No analyses available{analysisTypeFilter !== 'all' ? ` for type ${analysisTypeFilter.toUpperCase()}` : ''}
        </p>
      {:else}
        <table class="w-full table-fixed text-sm">
          <thead class="sticky top-0 bg-gray-100">
            <tr>
              <th class="w-10 p-2"></th>
              <th class="w-24 p-2 text-left">Type</th>
              <th class="p-2 text-left">File</th>
              <th class="w-40 p-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredAnalyses as analysis}
              {@const file = $persistentFileStore.files.find(f => f.id === analysis.fileId)}
              {@const isSelected = selectedAnalyses.some(a => a.id === analysis.id)}
              <tr 
                class="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
                class:bg-blue-50={isSelected}
                on:click={() => toggleAnalysisSelection(analysis)}
              >
                <td class="p-2 text-center">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    class="h-4 w-4 cursor-pointer"
                    on:click|stopPropagation={() => toggleAnalysisSelection(analysis)}
                  />
                </td>
                <td class="p-2 font-medium">{analysis.method.toUpperCase()}</td>
                <td class="p-2 truncate">{file?.filename || 'Unknown file'}</td>
                <td class="p-2 text-gray-600">{formatDate(analysis.createdAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
  
  <!-- Comparison results -->
  {#if comparisonData}
    <div class="comparison-results mt-4 rounded border border-gray-200 p-4">
      <h3 class="mb-3 text-lg font-bold">{comparisonData.method.toUpperCase()} Comparison</h3>
      
      <!-- Summary table -->
      <div class="mb-4">
        <h4 class="mb-2 text-base font-medium">Summary</h4>
        <table class="w-full table-auto rounded border border-gray-200 text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 text-left">Property</th>
              <th class="p-2 text-left">{comparisonData.file1}</th>
              <th class="p-2 text-left">{comparisonData.file2}</th>
              <th class="p-2 text-left">Difference</th>
            </tr>
          </thead>
          <tbody>
            {#each comparisonData.differences as diff}
              <tr class="border-t border-gray-200">
                <td class="p-2 font-medium">{diff.property}</td>
                <td class="p-2">{diff.value1}</td>
                <td class="p-2">{diff.value2}</td>
                <td class="p-2">
                  {#if diff.value1 !== '-' && diff.value2 !== '-' && !isNaN(diff.value1) && !isNaN(diff.value2)}
                    {Math.abs(diff.value2 - diff.value1)}
                    {#if diff.value2 > diff.value1}
                      <span class="text-green-600">↑</span>
                    {:else if diff.value2 < diff.value1}
                      <span class="text-red-600">↓</span>
                    {:else}
                      <span class="text-gray-500">-</span>
                    {/if}
                  {:else}
                    {diff.note || '-'}
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <!-- Site comparison for selection analyses -->
      {#if comparisonData.siteComparisons && comparisonData.siteComparisons.length > 0}
        <div class="site-comparisons">
          <h4 class="mb-2 text-base font-medium">Site Comparisons</h4>
          <p class="mb-2 text-sm text-gray-600">Showing only sites with significant differences in selection status.</p>
          
          <div class="max-h-64 overflow-y-auto rounded border border-gray-200">
            <table class="w-full table-auto text-sm">
              <thead class="sticky top-0 bg-gray-100">
                <tr>
                  <th class="p-2 text-left">Site</th>
                  <th class="p-2 text-left">p-value ({comparisonData.file1})</th>
                  <th class="p-2 text-left">p-value ({comparisonData.file2})</th>
                  <th class="p-2 text-left">Status ({comparisonData.file1})</th>
                  <th class="p-2 text-left">Status ({comparisonData.file2})</th>
                </tr>
              </thead>
              <tbody>
                {#each comparisonData.siteComparisons.filter(s => s.changed) as comparison}
                  <tr class="border-t border-gray-200">
                    <td class="p-2 font-medium">{comparison.site}</td>
                    <td class="p-2">{comparison.p1 !== null ? comparison.p1.toExponential(2) : '-'}</td>
                    <td class="p-2">{comparison.p2 !== null ? comparison.p2.toExponential(2) : '-'}</td>
                    <td class="p-2">
                      {#if comparison.status1 === 'positive'}
                        <span class="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800">Positive</span>
                      {:else if comparison.status1 === 'negative'}
                        <span class="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800">Negative</span>
                      {:else if comparison.status1 === 'missing'}
                        <span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">Not Present</span>
                      {:else}
                        <span class="text-gray-500">Neutral</span>
                      {/if}
                    </td>
                    <td class="p-2">
                      {#if comparison.status2 === 'positive'}
                        <span class="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800">Positive</span>
                      {:else if comparison.status2 === 'negative'}
                        <span class="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800">Negative</span>
                      {:else if comparison.status2 === 'missing'}
                        <span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">Not Present</span>
                      {:else}
                        <span class="text-gray-500">Neutral</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    </div>
  {:else if selectedAnalyses.length === 2}
    <div class="mt-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800">
      To compare analyses, select two analyses of the same type. Currently, you have selected different types.
    </div>
  {/if}
</div>