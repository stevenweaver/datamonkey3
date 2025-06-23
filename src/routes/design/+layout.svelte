<script>
  let { children } = $props();
</script>

<div class="container mx-auto">
  <div class="mb-6 mt-4">
    <h1 class="text-3xl font-bold mb-4">Design System</h1>
    
    <div class="flex space-x-4 mb-8">
      <a 
        href="/design" 
        class="px-4 py-2 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Overview
      </a>
      <a 
        href="/design/analysis-status-demo" 
        class="px-4 py-2 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Status Indicator
      </a>
    </div>
  </div>
  
  {@render children()}
</div>