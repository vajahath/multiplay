<script lang="ts">
  import type { Fact } from '../../../worker/types';
  import { GameConfig } from '../../../worker/game-config';
  import { game } from '../../stores/game.svelte';
  import { Check } from 'lucide-svelte';

  interface Props {
    facts: Fact[];
    mini?: boolean;
  }

  let { facts, mini = false }: Props = $props();

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
      // High contrast ring that adapts to theme backgrounds
      return 'ring-2 ring-indigo-500 dark:ring-white ring-offset-1 ring-offset-[#f0f4ff] dark:ring-offset-[#0f172a] z-10 shadow-lg';
    }
    return '';
  }
</script>

<div class="w-full">
  <div class="flex flex-col gap-10">
    {#if !mini}
      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
        <div>
          <h3 class="text-3xl font-black text-slate-800 dark:text-white font-display mb-1.5 leading-tight">Your Mastery Map</h3>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em] opacity-80">Fluency tracking across all math facts</p>
        </div>
        
        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/20 dark:border-slate-700/20 shadow-sm">
          <div class="flex items-center gap-2 group/leg cursor-default">
            <div class="w-4 h-4 rounded-md bg-slate-300/30 dark:bg-slate-700/30 transition-transform group-hover/leg:scale-110"></div>
            <span>Locked</span>
          </div>
          <div class="flex items-center gap-2 group/leg cursor-default">
            <div class="w-4 h-4 rounded-md bg-gradient-to-br from-rose-500 via-orange-400 to-amber-500 shadow-sm transition-transform group-hover/leg:scale-110"></div>
            <span>Learning</span>
          </div>
          <div class="flex items-center gap-2 group/leg cursor-default">
            <div class="w-4 h-4 rounded-md bg-emerald-500 shadow-sm flex items-center justify-center transition-transform group-hover/leg:scale-110"><Check size={10} class="text-white" /></div>
            <span>Mastered</span>
          </div>
          <div class="flex items-center gap-2 group/leg cursor-default">
            <div class="w-4 h-4 rounded-md bg-indigo-500 border-2 border-indigo-500 ring-2 ring-indigo-500 dark:ring-white ring-offset-2 ring-offset-[#f0f4ff] dark:ring-offset-[#0f172a] shadow-sm animate-pulse transition-transform group-hover/leg:scale-110"></div>
            <span>Practicing</span>
          </div>
        </div>
      </div>
    {/if}

    <div class="grid grid-cols-14 {mini ? 'gap-1' : 'gap-1.5 sm:gap-2.5 md:gap-3'} font-display select-none">
      <!-- Header Labels -->
      <div class="aspect-square"></div>
      {#each Array(13) as _, i}
        <div class="flex items-center justify-center font-black text-slate-400 dark:text-slate-500 {mini ? 'text-[7px]' : 'text-[11px] sm:text-xs'} transition-colors hover:text-indigo-500 cursor-default" aria-label="Table {i}">{i}</div>
      {/each}

      {#each matrix as row, i}
        <div class="flex items-center justify-end pr-2 sm:pr-4 font-black text-slate-400 dark:text-slate-500 {mini ? 'text-[7px]' : 'text-[11px] sm:text-xs'} transition-colors hover:text-indigo-500 cursor-default">{i}</div>
        {#each row as fact}
          <div 
            class="aspect-square {mini ? 'rounded-sm' : 'rounded-[2px] sm:rounded-lg md:rounded-xl'} {getStatusColor(fact)} {getBorderStyle(fact)} transition-all duration-300 hover:scale-150 hover:z-20 shadow-sm flex items-center justify-center relative group/box cursor-help"
            title={fact ? `${fact.factors[0]} x ${fact.factors[1]} = ${fact.factors[0] * fact.factors[1]}\nConfidence: ${(fact.confidence * 100).toFixed(0)}%` : 'Locked'}
          >
            {#if fact && (fact.status === 'MASTERED' || fact.confidence >= GameConfig.MASTERED_THRESHOLD)}
              <Check size={mini ? 6 : 14} class="text-white drop-shadow-md transition-transform group-hover/box:scale-110" />
            {/if}
            
            <!-- Glow/Selection Effect -->
            {#if fact && fact.status !== 'LOCKED'}
              <div class="absolute inset-0 rounded-[2px] sm:rounded-lg md:rounded-xl bg-white/30 opacity-0 group-hover/box:opacity-100 transition-opacity pointer-events-none"></div>
            {/if}
          </div>
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


