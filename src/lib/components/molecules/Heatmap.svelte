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

  function getStatusColor(fact: Fact | null): string {
    if (!fact || fact.status === 'LOCKED') {
      return 'bg-slate-200 dark:bg-slate-700';
    }
    
    // ACTIVE or MASTERED - show confidence gradient
    const conf = fact.confidence;
    
    if (conf === 0) {
      // Just started - bright blue to indicate active
      return 'bg-blue-400';
    } else if (conf < 0.3) {
      // Low confidence - red
      return 'bg-red-500';
    } else if (conf < 0.5) {
      // Getting better - orange
      return 'bg-orange-500';
    } else if (conf < 0.7) {
      // Medium - yellow
      return 'bg-yellow-400';
    } else if (conf < 0.9) {
      // Good - lime
      return 'bg-lime-500';
    } else {
      // Mastered - bright green
      return 'bg-emerald-500';
    }
  }

  function getOpacity(fact: Fact | null): string {
    if (!fact || fact.status === 'LOCKED') {
      return 'opacity-30';
    }
    return 'opacity-100';
  }
</script>

<div class="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
  <!-- Legend -->
  <div class="flex items-center justify-center gap-4 mb-4 text-xs">
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 opacity-30"></div>
      <span class="text-slate-500">Locked</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded-sm bg-blue-400"></div>
      <span class="text-slate-500">New</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded-sm bg-red-500"></div>
      <span class="text-slate-500">Learning</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded-sm bg-emerald-500"></div>
      <span class="text-slate-500">Mastered</span>
    </div>
  </div>

  <div class="grid grid-cols-14 gap-0.5 md:gap-1 text-[8px] md:text-[10px]">
    <!-- Header Labels -->
    <div class="col-start-2 flex items-center justify-center font-bold text-slate-400">0</div>
    <div class="flex items-center justify-center font-bold text-slate-400">1</div>
    <div class="flex items-center justify-center font-bold text-slate-400">2</div>
    <div class="flex items-center justify-center font-bold text-slate-400">3</div>
    <div class="flex items-center justify-center font-bold text-slate-400">4</div>
    <div class="flex items-center justify-center font-bold text-slate-400">5</div>
    <div class="flex items-center justify-center font-bold text-slate-400">6</div>
    <div class="flex items-center justify-center font-bold text-slate-400">7</div>
    <div class="flex items-center justify-center font-bold text-slate-400">8</div>
    <div class="flex items-center justify-center font-bold text-slate-400">9</div>
    <div class="flex items-center justify-center font-bold text-slate-400">10</div>
    <div class="flex items-center justify-center font-bold text-slate-400">11</div>
    <div class="flex items-center justify-center font-bold text-slate-400">12</div>

    {#each matrix as row, i}
      <div class="flex items-center justify-end pr-1 font-bold text-slate-400">{i}</div>
      {#each row as fact}
        <div 
          class="aspect-square rounded-sm {getStatusColor(fact)} {getOpacity(fact)} transition-colors duration-300"
          title={fact ? `${fact.id}: ${(fact.confidence * 100).toFixed(0)}%` : 'Locked'}
        ></div>
      {/each}
    {/each}
  </div>
</div>

<style>
  .grid-cols-14 {
    grid-template-columns: repeat(14, minmax(0, 1fr));
  }
</style>
