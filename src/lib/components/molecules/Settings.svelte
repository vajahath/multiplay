<script lang="ts">
  import { game } from '../../stores/game.svelte';

  let tables = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  function toggleTable(table: number) {
    const current = game.enabledTables;
    if (current.includes(table)) {
      if (current.length > 1) {
        game.setEnabledTables(current.filter(t => t !== table));
      }
    } else {
      game.setEnabledTables([...current, table]);
    }
  }
</script>

<div class="space-y-8">
  <section class="space-y-4">
    <h2 class="text-xl font-bold text-slate-800 dark:text-white">Tables to Practice</h2>
    <div class="grid grid-cols-3 md:grid-cols-4 gap-3">
      {#each tables as table}
        <button 
          class="h-16 rounded-2xl font-bold text-lg transition-all {game.enabledTables.includes(table) 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'}"
          onclick={() => toggleTable(table)}
        >
          {table}×
        </button>
      {/each}
    </div>
  </section>

  <section class="grid grid-cols-2 gap-6">
    <div class="space-y-2">
      <label class="block text-sm font-bold text-slate-600 dark:text-slate-400" for="max-factor">
        Max Factor ({game.maxFactor})
      </label>
      <input 
        id="max-factor"
        type="range" 
        min="1" 
        max="12" 
        step="1"
        value={game.maxFactor}
        class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        oninput={(e) => game.setMaxFactor(parseInt(e.currentTarget.value))}
      />
      <div class="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <span>1</span>
        <span>12</span>
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-bold text-slate-600 dark:text-slate-400" for="round-length">
        Questions ({game.roundLength})
      </label>
      <input 
        id="round-length"
        type="range" 
        min="5" 
        max="50" 
        step="5"
        value={game.roundLength}
        class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        oninput={(e) => game.setRoundLength(parseInt(e.currentTarget.value))}
      />
      <div class="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <span>5</span>
        <span>50</span>
      </div>
    </div>
  </section>
  
  <p class="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl">
    <strong>💡 Tip:</strong> Focusing on one or two tables at a time is the fastest way to master them!
  </p>
</div>
