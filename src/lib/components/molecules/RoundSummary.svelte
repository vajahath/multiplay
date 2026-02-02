<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  import type { AnswerResult } from '../../../worker/types';
  import { Trophy, Star, TrendingUp, ArrowRight, PartyPopper } from 'lucide-svelte';

  interface Props {
    totalQuestions: number;
    correctCount: number;
    results: AnswerResult[];
    currentStreak: number;
    bestStreak: number;
    onContinue: () => void;
  }

  let { totalQuestions, correctCount, results, currentStreak, bestStreak, onContinue }: Props = $props();

  const accuracy = $derived(Math.round((correctCount / totalQuestions) * 100));
  
  const starsCount = $derived.by(() => {
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  });

  const improvements = $derived.by(() => {
    const totalDelta = results.reduce((sum, r) => sum + r.deltaConfidence, 0);
    return {
      totalDelta: Math.round(totalDelta * 100),
      mastered: results.filter(r => r.isMasteredEvent).length
    };
  });
</script>

<div class="fixed inset-0 bg-indigo-950/40 backdrop-blur-md flex items-center justify-center z-50 p-6" in:fade>
  <div class="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl max-w-sm sm:max-w-lg w-full p-10 text-center relative overflow-hidden border border-white/20 dark:border-slate-700/50" in:scale={{ duration: 600, easing: elasticOut, start: 0.8 }}>
    
    <!-- Background Decor -->
    <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 dark:from-indigo-900/20 to-transparent -z-10"></div>
    
    <!-- Stars Celebration -->
    <div class="flex justify-center gap-3 mb-8">
      {#each [1, 2, 3] as star, i}
        <div in:scale={{ delay: 300 + (i * 150), duration: 600, easing: elasticOut }}>
          <Star 
            size={starsCount >= star ? 64 : 48} 
            class={starsCount >= star ? 'fill-amber-400 text-amber-500 drop-shadow-lg' : 'text-slate-200 dark:text-slate-700'}
            style={starsCount >= star ? 'transform: rotate(' + (i === 1 ? '0' : (i === 0 ? '-15' : '15')) + 'deg)' : ''}
          />
        </div>
      {/each}
    </div>

    <!-- Title -->
    <div class="mb-6">
      <h2 class="text-3xl font-black text-slate-800 dark:text-white font-display mb-2">
        {#if accuracy >= 90}
          Superstar! 🌟
        {:else if accuracy >= 70}
          Great Work! 🚀
        {:else}
          Good Effort! 💪
        {/if}
      </h2>
      
      <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full text-sm font-black animate-vibrant-pulse">
        🔥 Streak: {currentStreak} (Best: {bestStreak})
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 my-8">
      <div class="bg-indigo-50 dark:bg-slate-700/50 rounded-3xl p-6 border border-indigo-100 dark:border-slate-600/30">
        <div class="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-display">{correctCount}/{totalQuestions}</div>
        <div class="text-xs font-black uppercase text-slate-400 tracking-widest mt-1">Found</div>
      </div>
      <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/30">
        <div class="text-4xl font-black text-emerald-500 font-display">{accuracy}%</div>
        <div class="text-xs font-black uppercase text-slate-400 tracking-widest mt-1">Accuracy</div>
      </div>
    </div>

    <!-- Progress Card -->
    {#if improvements.totalDelta !== 0 || improvements.mastered > 0}
      <div class="bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-[2rem] p-6 mb-8 text-left text-white shadow-lg shadow-indigo-500/20">
        <div class="flex items-center gap-2 font-black text-sm uppercase tracking-widest mb-3">
          <PartyPopper size={18} />
          Level Up!
        </div>
        {#if improvements.totalDelta > 0}
          <p class="text-sm font-bold opacity-90 leading-relaxed">
            Your math brain grew by <span class="bg-white/20 px-1.5 rounded">{improvements.totalDelta}%</span> this round!
          </p>
        {/if}
        {#if improvements.mastered > 0}
          <div class="mt-2 flex items-center gap-2 text-white font-black bg-white/10 p-2 rounded-xl">
            <Trophy size={16} />
            <span>{improvements.mastered} New Fact{improvements.mastered > 1 ? 's' : ''} Mastered!</span>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Continue button -->
    <button
      onclick={onContinue}
      class="w-full h-18 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-3xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group"
    >
      Next Round
      <ArrowRight size={24} class="transition-transform group-hover:translate-x-1" />
    </button>
  </div>
</div>
