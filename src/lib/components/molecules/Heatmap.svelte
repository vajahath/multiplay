<script lang="ts">
  import type { Fact } from '../../../worker/types';
  import { GameConfig } from '../../../worker/game-config';
  import { game } from '../../stores/game.svelte';

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

  // Check if a fact is in the current enabled set
  function isInCurrentSet(fact: Fact | null): boolean {
    if (!fact) return false;
    return (
      (game.enabledTables.includes(fact.factors[0]) || game.enabledTables.includes(fact.factors[1])) &&
      fact.factors[0] <= game.maxFactor &&
      fact.factors[1] <= game.maxFactor
    );
  }

  // Get background color based on status and confidence
  function getStatusColor(fact: Fact | null): string {
    if (!fact || fact.status === 'LOCKED') {
      return 'bg-slate-300/30 dark:bg-slate-700/30';
    }
    
    // Mastered = Solid Green
    if (fact.status === 'MASTERED' || fact.confidence >= GameConfig.MASTERED_THRESHOLD) {
      return 'bg-emerald-500';
    }
    
    // Active = Red to Green gradient based on confidence
    const conf = fact.confidence;
    // Map confidence 0-0.85 to a color from red (0) through yellow (0.4) to green (0.85)
    if (conf < 0.2) {
      return 'bg-rose-500'; // Very low
    } else if (conf < 0.4) {
      return 'bg-orange-500'; // Low
    } else if (conf < 0.6) {
      return 'bg-amber-500'; // Medium
    } else if (conf < 0.75) {
      return 'bg-lime-500'; // Getting there
    } else {
      return 'bg-emerald-400'; // Almost mastered
    }
  }

  // Get border style for current set
  function getBorderStyle(fact: Fact | null): string {
    if (isInCurrentSet(fact) && fact?.status === 'ACTIVE') {
      return 'ring-2 ring-white ring-offset-1 ring-offset-slate-800';
    }
    return '';
  }
</script>

<div class="p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700/50">
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h3 class="text-xl font-black text-slate-800 dark:text-white font-display">Your Mastery Map</h3>
      
      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase font-black tracking-widest text-slate-400">
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded bg-slate-300/30 dark:bg-slate-700/30"></div>
          <span>Locked</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded bg-gradient-to-r from-rose-500 via-amber-500 to-lime-500"></div>
          <span>Learning</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded bg-emerald-500"></div>
          <span>Mastered</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded bg-indigo-500 ring-2 ring-white ring-offset-1 ring-offset-slate-800"></div>
          <span>Practicing</span>
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
            class="aspect-square rounded-md sm:rounded-lg {getStatusColor(fact)} {getBorderStyle(fact)} transition-all duration-500 hover:scale-125 hover:z-10 shadow-sm"
            title={fact ? `${fact.id}: ${(fact.confidence * 100).toFixed(0)}% confidence` : 'Locked'}
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

