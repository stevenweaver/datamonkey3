<script>
  import DesignSystem from '../../lib/DesignSystem.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let demoLinks = [
    { name: 'Design System', path: '/design' },
    { name: 'Status Indicator Demo', path: '/design/analysis-status-demo' }
  ];
  
  function navigateTo(path) {
    goto(path);
  }
</script>

<div class="p-8">
  <h1 class="mb-6 text-3xl font-bold">Design System & Demos</h1>
  
  <div class="mb-8">
    <h2 class="mb-4 text-xl font-semibold">Available Demos</h2>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each demoLinks as link}
        <button 
          class="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md"
          on:click={() => navigateTo(link.path)}
        >
          <h3 class="text-lg font-medium">{link.name}</h3>
          <p class="mt-2 text-sm text-gray-600">
            {link.name === 'Design System' ? 'View the core design system components' : 
             link.name === 'Status Indicator Demo' ? 'New streamlined status indicator in navbar' :
             'Demo description'}
          </p>
        </button>
      {/each}
    </div>
  </div>
  
  <div>
    <h2 class="mb-4 text-xl font-semibold">Full Design System</h2>
    <DesignSystem />
  </div>
</div>