<script lang="ts">
  import { game } from '../../stores/game.svelte';

  const tables = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
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

<div class="space-y-10">
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-slate-800 dark:text-white font-display">Pick Your Tables</h2>
      <span class="text-xs font-black uppercase text-indigo-500 tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
        {game.enabledTables.length} Selected
      </span>
    </div>
    
    <div class="grid grid-cols-4 sm:grid-cols-7 gap-3">
      {#each tables as table}
        <button 
          class="aspect-square rounded-2xl font-black text-lg transition-all border-b-4 {game.enabledTables.includes(table) 
            ? 'bg-indigo-600 text-white border-indigo-800 shadow-lg shadow-indigo-600/30' 
            : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-400'}"
          onclick={() => toggleTable(table)}
        >
          {table}
        </button>
      {/each}
    </div>
  </section>

  <section class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div class="flex justify-between items-center">
          <label class="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest" for="max-factor">
            Difficulty
          </label>
          <span class="text-lg font-black text-indigo-600">Up to {game.maxFactor}</span>
        </div>
        <input 
          id="max-factor"
          type="range" 
          min="1" 
          max="12" 
          step="1"
          value={game.maxFactor}
          class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600 range-vibrant"
          oninput={(e) => game.setMaxFactor(parseInt(e.currentTarget.value))}
        />
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Sets the largest number you'll see.</p>
      </div>

      <div class="space-y-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div class="flex justify-between items-center">
          <label class="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest" for="round-length">
            Round Size
          </label>
          <span class="text-lg font-black text-indigo-600">{game.roundLength} Q's</span>
        </div>
        <input 
          id="round-length"
          type="range" 
          min="5" 
          max="50" 
          step="5"
          value={game.roundLength}
          class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600 range-vibrant"
          oninput={(e) => game.setRoundLength(parseInt(e.currentTarget.value))}
        />
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">How many questions per round.</p>
      </div>
    </div>
  </section>
  
  <div class="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden group">
    <div class="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    <h4 class="text-xl font-black mb-2 relative z-10">Pro Tip! 💡</h4>
    <p class="text-sm font-bold opacity-90 relative z-10 leading-relaxed">
      Choose just 1 or 2 tables to practice at a time. It's the fastest way to get them to "Mastered" status!
    </p>
  </div>
</div>

<style>
  .range-vibrant::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #4f46e5;
    border: 4px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .range-vibrant::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
</style>
