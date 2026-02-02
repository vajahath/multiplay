<script lang="ts">
  import type { AnswerResult } from '../../../worker/types';
  import { Trophy, Star, TrendingUp, ArrowRight } from 'lucide-svelte';

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
  
  const stars = $derived(() => {
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  });

  // Calculate confidence improvements
  const improvements = $derived.by(() => {
    const changes: { fact: string; delta: number }[] = [];
    results.forEach(r => {
      if (r.deltaConfidence !== 0) {
        changes.push({
          fact: 'Question',
          delta: Math.round(r.deltaConfidence * 100)
        });
      }
    });
    
    const totalDelta = results.reduce((sum, r) => sum + r.deltaConfidence, 0);
    return {
      changes,
      totalDelta: Math.round(totalDelta * 100),
      mastered: results.filter(r => r.isMasteredEvent).length
    };
  });
</script>

<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-300">
    <!-- Stars -->
    <div class="flex justify-center gap-2 mb-6">
      {#each [1, 2, 3] as star}
        <Star 
          size={48} 
          class={star <= stars() ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
        />
      {/each}
    </div>

    <!-- Title -->
    <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2">
      {#if accuracy >= 90}
        Amazing! 🎉
      {:else if accuracy >= 70}
        Great Job! 👏
      {:else}
        Keep Practicing! 💪
      {/if}
    </h2>

    <div class="flex justify-center mb-4">
      <div class="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 rounded-full text-sm font-bold animate-bounce">
        🔥 Streak: {currentStreak} (Best: {bestStreak})
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 my-6">
      <div class="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4">
        <div class="text-3xl font-black text-indigo-600 dark:text-indigo-400">{correctCount}/{totalQuestions}</div>
        <div class="text-sm text-slate-500 dark:text-slate-400">Correct</div>
      </div>
      <div class="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4">
        <div class="text-3xl font-black text-emerald-500">{accuracy}%</div>
        <div class="text-sm text-slate-500 dark:text-slate-400">Accuracy</div>
      </div>
    </div>

    <!-- Confidence changes -->
    {#if improvements.totalDelta !== 0 || improvements.mastered > 0}
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-4 mb-6 text-left">
        <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
          <TrendingUp size={20} />
          Progress Update
        </div>
        {#if improvements.totalDelta > 0}
          <p class="text-sm text-slate-700 dark:text-slate-300">
            Your confidence increased by <span class="font-bold text-emerald-600">+{improvements.totalDelta}%</span> this round!
          </p>
        {:else if improvements.totalDelta < 0}
          <p class="text-sm text-slate-700 dark:text-slate-300">
            Don't worry! Keep practicing to improve. Confidence: <span class="font-bold text-amber-600">{improvements.totalDelta}%</span>
          </p>
        {/if}
        {#if improvements.mastered > 0}
          <p class="text-sm text-emerald-600 font-bold mt-1">
            🎯 {improvements.mastered} fact{improvements.mastered > 1 ? 's' : ''} mastered!
          </p>
        {/if}
      </div>
    {/if}

    <!-- Continue button -->
    <button
      onclick={onContinue}
      class="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
    >
      Continue <ArrowRight size={20} />
    </button>
  </div>
</div>
