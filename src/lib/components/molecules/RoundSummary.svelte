<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  import type { AnswerResult, Fact } from '../../../worker/types';
  import { Trophy, Star, TrendingUp, ArrowRight, PartyPopper, Eye, Check, Sparkles, Unlock, Download, Smartphone, X } from 'lucide-svelte';
  import Heatmap from './Heatmap.svelte';
  import { pwaStore } from '../../stores/pwa.svelte';

  interface Props {
    totalQuestions: number;
    correctCount: number;
    results: AnswerResult[];
    currentStreak: number;
    bestStreak: number;
    allFacts: Fact[];
    unlockedTable?: number | null;
    onContinue: () => void;
    onViewStats: () => void;
  }

  let { 
    totalQuestions, 
    correctCount, 
    results, 
    currentStreak, 
    bestStreak, 
    allFacts,
    unlockedTable = null,
    onContinue,
    onViewStats 
  }: Props = $props();

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

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      onContinue();
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<div 
  class="fixed inset-0 bg-indigo-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6" 
  in:fade 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="summary-title"
>
  <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl max-w-lg lg:max-w-6xl w-full max-h-[95dvh] overflow-y-auto soft-scroll p-6 sm:p-10 relative border border-white/20 dark:border-slate-700/50" in:scale={{ duration: 600, easing: elasticOut, start: 0.8 }}>
    
    <!-- Close Button -->
    <button
      onclick={onContinue}
      class="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-xl transition-all hover:scale-105 active:scale-95"
      aria-label="Close and continue"
      title="Close (Esc)"
    >
      <X size={20} />
    </button>
    
    <!-- Background Decor -->
    <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 dark:from-indigo-900/20 to-transparent -z-10"></div>
    
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      
      <!-- Left Column: Celebration & Primary Stats -->
      <div class="lg:col-span-5 flex flex-col items-center text-center">
        <!-- Stars Celebration -->
        <div class="flex justify-center gap-3 mb-6 sm:mb-8">
          {#each [1, 2, 3] as star, i}
            <div in:scale={{ delay: 300 + (i * 150), duration: 600, easing: elasticOut }}>
              <Star 
                size={starsCount >= star ? 56 : 40} 
                class={starsCount >= star ? 'fill-amber-400 text-amber-500 drop-shadow-lg' : 'text-slate-200 dark:text-slate-700'}
                style={starsCount >= star ? 'transform: rotate(' + (i === 1 ? '0' : (i === 0 ? '-15' : '15')) + 'deg)' : ''}
              />
            </div>
          {/each}
        </div>

        <!-- Title -->
        <div class="mb-6">
          <h2 id="summary-title" class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white font-display mb-2">
            {#if accuracy >= 90}
              Superstar! 🌟
            {:else if accuracy >= 70}
              Great Work! 🚀
            {:else}
              Good Effort! 💪
            {/if}
          </h2>
          
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full text-xs sm:text-sm font-black animate-vibrant-pulse">
            🔥 Streak: {currentStreak} (Best: {bestStreak})
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 sm:gap-4 w-full mb-6">
          <div class="bg-indigo-50 dark:bg-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-indigo-100 dark:border-slate-600/30">
            <div class="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-display">{correctCount}/{totalQuestions}</div>
            <div class="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Correct</div>
          </div>
          <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-100 dark:border-emerald-800/30">
            <div class="text-2xl sm:text-3xl font-black text-emerald-500 font-display">{accuracy}%</div>
            <div class="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Accuracy</div>
          </div>
        </div>

        <!-- Progress Card -->
        {#if improvements.totalDelta !== 0 || improvements.mastered > 0}
          <div class="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 mb-6 text-left text-white shadow-lg shadow-indigo-500/20">
            <div class="flex items-center gap-2 font-black text-xs uppercase tracking-widest mb-3">
              <PartyPopper size={16} />
              Level Up!
            </div>
            {#if improvements.totalDelta > 0}
              <p class="text-xs sm:text-sm font-bold opacity-90 leading-relaxed">
                Your brain grew by <span class="bg-white/20 px-1.5 rounded">{improvements.totalDelta}%</span>!
              </p>
            {/if}
            {#if improvements.mastered > 0}
              <div class="mt-2 flex items-center gap-2 text-white font-black bg-white/10 p-2 rounded-xl text-xs sm:text-sm">
                <Trophy size={14} />
                <span>{improvements.mastered} New Mastery!</span>
              </div>
            {/if}
          </div>
        {/if}

        <!-- New Table Unlocked Banner -->
        {#if unlockedTable !== null}
          <div class="w-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 mb-6 text-left text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden" in:fly={{ y: 20, delay: 300, duration: 500 }}>
            <div class="absolute -right-4 -top-4 opacity-20">
              <Sparkles size={80} />
            </div>
            <div class="flex items-center gap-3 relative z-10">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Unlock size={24} />
              </div>
              <div>
                <div class="flex items-center gap-2 font-black text-xs uppercase tracking-widest mb-1">
                  <Sparkles size={14} class="animate-pulse" />
                  New Table Unlocked!
                </div>
                <p class="text-lg sm:text-xl font-black">
                  The <span class="bg-white/20 px-2 py-0.5 rounded-lg">{unlockedTable}×</span> table is now available!
                </p>
              </div>
            </div>
          </div>
        {/if}

        <!-- PWA Install Nudge -->
        {#if !pwaStore.isInstalled && (pwaStore.canInstall || pwaStore.isIOS)}
          <div class="w-full bg-slate-50 dark:bg-slate-700/30 rounded-[1.5rem] sm:rounded-[2rem] p-5 mb-6 border border-slate-200/50 dark:border-slate-600/30">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                <Download size={20} />
              </div>
              <div class="flex-1 text-left">
                <h4 class="font-black text-slate-800 dark:text-white text-sm mb-1 line-clamp-1">Install Multiplay! 📱</h4>
                <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3 leading-tight">
                  Get the full app experience. It's tiny (only 3MB) and works offline!
                </p>
                
                {#if pwaStore.canInstall}
                  <button 
                    onclick={() => pwaStore.install()}
                    class="w-full py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Install Now
                  </button>
                {:else if pwaStore.isIOS}
                  <div class="flex items-center gap-2 text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                    <Smartphone size={14} />
                    <span>Tap Share → "Add to Home Screen"</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        <!-- Continue button (Desktop sticky or bottom) -->
        <button
          onclick={onContinue}
          class="w-full h-18 sm:h-22 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_auto] animate-gradient-slow text-white font-black text-2xl sm:text-3xl rounded-[2.5rem] shadow-[0_15px_50px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_25px_60px_-10px_rgba(16,185,129,0.7)] flex items-center justify-center gap-4 transition-all duration-300 hover:scale-[1.08] active:scale-95 group mb-4 lg:mb-0 relative overflow-hidden animate-vibrant-pulse"
        >
          <!-- Internal Glow -->
          <div class="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
          
          <!-- Shimmer -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
          
          <div class="relative z-10 flex items-center gap-3">
            <span class="drop-shadow-lg">Let's Play! </span>
            <span class="animate-bounce inline-block">🎮</span>
          </div>
          <ArrowRight size={36} class="relative z-10 transition-transform duration-500 group-hover:translate-x-3 drop-shadow-md animate-bounce-horizontal" />
        </button>
      </div>

      <!-- Right Column: Mastery Map (Visible on LG up) -->
      <div class="lg:col-span-7 w-full h-full flex flex-col justify-center">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <TrendingUp size={16} class="text-indigo-500" />
            </div>
            <span class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Mastery Map</span>
          </div>
          <button 
            onclick={onViewStats}
            class="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all border border-indigo-200/50 dark:border-indigo-800/50"
          >
            <Eye size={12} />
            Full View
          </button>
        </div>
        
        <div class="w-full">
          <Heatmap facts={allFacts} mini={true} />
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 rounded bg-emerald-500 flex items-center justify-center shadow-sm"><Check size={8} class="text-white" /></div>
            <span>Mastered</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 rounded bg-gradient-to-br from-rose-500 via-amber-500 to-lime-500 shadow-sm"></div>
            <span>Learning</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 rounded bg-slate-300/30 dark:bg-slate-700/30"></div>
            <span>Locked</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
