<script>
  export let activeTab = 'data';
  export let onChange = (tabName) => {};
  export let showRunningIndicator = false;
</script>

<div class="mb-premium-xl">
  <div class="bg-brand-ghost rounded-premium p-premium-xs">
    <div class="flex border-b border-border-platinum">
      <button
        class="text-premium-brand font-semibold py-premium-lg px-premium-xl relative transition-all duration-premium"
        class:text-brand-royal={activeTab === 'data'}
        class:text-text-rich={activeTab !== 'data'}
        class:hover:text-brand-royal={activeTab !== 'data'}
        class:hover:bg-brand-whisper={activeTab !== 'data'}
        on:click={() => onChange('data')}
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          Data
        </span>
        {#if activeTab === 'data'}
          <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-copper"></div>
        {/if}
      </button>
      
      <button
        class="text-premium-brand font-semibold py-premium-lg px-premium-xl relative transition-all duration-premium"
        class:text-brand-royal={activeTab === 'analyze'}
        class:text-text-rich={activeTab !== 'analyze'}
        class:hover:text-brand-royal={activeTab !== 'analyze'}
        class:hover:bg-brand-whisper={activeTab !== 'analyze'}
        on:click={() => onChange('analyze')}
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V7zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" clip-rule="evenodd" />
          </svg>
          Analyze
        </span>
        {#if showRunningIndicator}
          <span class="ml-2 inline-flex animate-pulse-premium items-center rounded-premium-xl bg-brand-royal px-2.5 py-0.5 text-premium-caption font-semibold text-white tracking-premium-badge">
            Running
          </span>
        {/if}
        {#if activeTab === 'analyze'}
          <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-copper"></div>
        {/if}
      </button>
      
      <button
        class="text-premium-brand font-semibold py-premium-lg px-premium-xl relative transition-all duration-premium"
        class:text-brand-royal={activeTab === 'results'}
        class:text-text-rich={activeTab !== 'results'}
        class:hover:text-brand-royal={activeTab !== 'results'}
        class:hover:bg-brand-whisper={activeTab !== 'results'}
        on:click={() => onChange('results')}
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" />
          </svg>
          Results
        </span>
        {#if activeTab === 'results'}
          <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-copper"></div>
        {/if}
      </button>
    </div>
  </div>
</div>