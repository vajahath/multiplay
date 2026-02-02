<script lang="ts">
  import type { Fact } from '../../../worker/types';

  interface Props {
    facts: Fact[];
  }

  let { facts }: Props = $props();

  const matrix = $derived.by(() => {
    const m: (Fact | null)[][] = Array.from({ length: 13 }, () => Array(13).fill(null));
    facts.forEach(f => {
      m[f.factors[0]][f.factors[1]] = f;
    });
    return m;
  });

  // Colorblind friendly sequential scale (Blue -> Teal -> Emerald)
  function getStatusColor(fact: Fact | null): string {
    if (!fact || fact.status === 'LOCKED') {
      return 'bg-slate-200 dark:bg-slate-700 opacity-20';
    }
    
    const conf = fact.confidence;
    
    if (conf === 0) {
      return 'bg-blue-300'; // New
    } else if (conf < 0.25) {
      return 'bg-blue-500'; // Learning low
    } else if (conf < 0.5) {
      return 'bg-indigo-500'; // Learning mid
    } else if (conf < 0.75) {
      return 'bg-teal-500'; // Learning high
    } else if (conf < GameConfig?.MASTERED_THRESHOLD || 0.85) {
      return 'bg-emerald-400'; // Almost there
    } else {
      return 'bg-emerald-600'; // Mastered
    }
  }

  import { GameConfig } from '../../../worker/game-config';
</script>

<div class="p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700/50">
  <div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
      <h3 class="text-xl font-black text-slate-800 dark:text-white font-display">Your Mastery Map</h3>
      
      <!-- Legend -->
      <div class="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-slate-400">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 opacity-20"></div>
          <span>Locked</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-blue-300"></div>
          <span>New</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-emerald-600"></div>
          <span>Pro</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-14 gap-1 sm:gap-1.5 font-display">
      <!-- Header Labels -->
      <div class="aspect-square"></div>
      {#each Array(13) as _, i}
        <div class="flex items-center justify-center font-black text-slate-300 dark:text-slate-600 text-[10px]">{i}</div>
      {/each}

      {#each matrix as row, i}
        <div class="flex items-center justify-end pr-2 font-black text-slate-300 dark:text-slate-600 text-[10px]">{i}</div>
        {#each row as fact}
          <div 
            class="aspect-square rounded-md sm:rounded-lg {getStatusColor(fact)} transition-all duration-500 hover:scale-125 hover:z-10 shadow-sm"
            title={fact ? `${fact.id}: ${(fact.confidence * 100).toFixed(0)}%` : 'Locked'}
          ></div>
        {/each}
      {/each}
    </div>
  </div>
</div>

<style>
  .grid-cols-14 {
    grid-template-columns: repeat(14, minmax(0, 1fr));
  }
</style>
