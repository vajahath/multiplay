<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { game } from './lib/stores/game.svelte';
  import { audio } from './lib/audio/AudioManager';
  import EquationDisplay from './lib/components/molecules/EquationDisplay.svelte';
  import MultipleChoice from './lib/components/molecules/MultipleChoice.svelte';
  import RoundSummary from './lib/components/molecules/RoundSummary.svelte';
  import Heatmap from './lib/components/molecules/Heatmap.svelte';
  import ProgressBar from './lib/components/atoms/ProgressBar.svelte';
  import SettingsComp from './lib/components/molecules/Settings.svelte';
  import { Settings, BarChart3, ChevronLeft, Gamepad2, Sparkles, Trophy } from 'lucide-svelte';
  import type { AnswerResult } from './worker/types';

  let view = $state<'game' | 'stats' | 'settings'>('game');
  let isCorrect = $state<boolean | null>(null);
  let selectedAnswer = $state<number | null>(null);
  
  // Round tracking
  let roundQuestionCount = $state(0);
  let roundCorrectCount = $state(0);
  let roundResults = $state<AnswerResult[]>([]);
  let showRoundSummary = $state(false);
  let hasStartedRound = $state(false);
  
  // Winstreak
  let currentStreak = $state(0);

  // Result display on buttons
  let buttonResult = $state<{ selectedAnswer: number; correctAnswer: number } | null>(null);
  let choices = $state<number[]>([]);

  // Compute the correct answer for the current question
  const correctAnswer = $derived(
    game.currentQuestion 
      ? game.currentQuestion.factors[0] * game.currentQuestion.factors[1] 
      : 0
  );

  // Session progress (0 to 1)
  const roundProgress = $derived(roundQuestionCount / game.roundLength);

  onMount(() => {
    game.init();
  });

  // Reset state when new question loads
  $effect(() => {
    if (game.currentQuestion && view === 'game') {
      isCorrect = null;
      selectedAnswer = null;

      // Generate stable choices for the new question
      const options = new Set<number>();
      options.add(correctAnswer);
      while (options.size < 3) {
        const offset = Math.floor(Math.random() * 20) - 10;
        let wrong = correctAnswer + offset;
        if (wrong < 0) wrong = Math.abs(wrong);
        if (wrong !== correctAnswer && wrong >= 0) options.add(wrong);
      }
      choices = [...options].sort(() => Math.random() - 0.5);
    }
  });

  async function handleAnswer(answer: number) {
    if (game.isAnswering || buttonResult) return;
    
    audio.init();
    hasStartedRound = true;
    selectedAnswer = answer;
    
    const result = await game.submitAnswer(answer, 1500); 
    
    if (result) {
      isCorrect = result.isCorrect;
      roundResults = [...roundResults, result];
      roundQuestionCount++;
      
      if (result.isCorrect) {
        roundCorrectCount++;
        currentStreak++;
        if (currentStreak > game.bestStreak) {
          game.setBestStreak(currentStreak);
        }
        audio.playCorrect();
      } else {
        currentStreak = 0;
        audio.playWrong();
      }
      
      buttonResult = {
        selectedAnswer: answer,
        correctAnswer: result.correctAnswer
      };
      
      // Feedback display delay
      setTimeout(() => {
        buttonResult = null;
        if (roundQuestionCount >= game.roundLength) {
          showRoundSummary = true;
        } else {
          game.nextQuestion();
        }
      }, 700);
    }
  }

  async function startNewRound() {
    showRoundSummary = false;
    roundQuestionCount = 0;
    roundCorrectCount = 0;
    roundResults = [];
    hasStartedRound = false;
    await game.refreshFacts();
    game.nextQuestion();
  }
</script>

<div class="fixed inset-0 bg-[#f0f4ff] dark:bg-[#0f172a] -z-10 transition-colors duration-700">
  <div class="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300 blur-[100px] rounded-full animate-vibrant-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-300 blur-[100px] rounded-full animate-vibrant-pulse" style="animation-delay: -1.5s"></div>
  </div>
</div>

<main class="max-w-xl mx-auto min-h-screen flex flex-col p-6 font-sans">
  <!-- Header -->
  <header class="flex justify-between items-center h-20 mb-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-4 rounded-[2rem] shadow-sm border border-white/20 dark:border-slate-700/30">
    {#if view === 'game'}
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-fun-bounce">
          <Gamepad2 class="text-white fill-white" size={20} />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-800 dark:text-white leading-none">Multiplay</h1>
          <p class="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Level Up Your Math</p>
        </div>
      </div>
    {:else}
      <button onclick={() => view = 'game'} class="flex items-center gap-2 font-black text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors group">
        <div class="p-2 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30">
          <ChevronLeft />
        </div>
        Go Back
      </button>
    {/if}

    <div class="flex gap-2">
      <button 
        onclick={() => view = 'stats'} 
        class="p-3 rounded-2xl transition-all duration-300 {view === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}"
      >
        <BarChart3 size={20} />
      </button>
      <button 
        onclick={() => view = 'settings'} 
        class="p-3 rounded-2xl transition-all duration-300 {view === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}"
      >
        <Settings size={20} />
      </button>
    </div>
  </header>

  {#if game.isInitializing}
    <div class="flex-1 flex flex-col items-center justify-center gap-6" in:fade>
      <div class="relative">
        <div class="w-20 h-20 border-8 border-indigo-100 dark:border-slate-800 rounded-full"></div>
        <div class="w-20 h-20 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <div class="text-2xl font-black text-slate-400 font-display text-center">
        Unlocking Your<br/><span class="text-indigo-600">Superpower...</span>
      </div>
    </div>
  {:else if view === 'stats'}
    <div class="flex-1 overflow-y-auto space-y-8 pb-12 soft-scroll" in:fly={{ y: 20, duration: 500 }}>
      <Heatmap facts={game.allFacts} />
      
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-emerald-400 to-emerald-500 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden group">
          <Trophy class="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 transition-transform group-hover:scale-110" />
          <div class="text-xs font-black uppercase tracking-widest mb-2 opacity-80">Mastered</div>
          <div class="text-5xl font-black font-display">
            {game.allFacts.filter(f => f.status === 'MASTERED').length}
          </div>
        </div>
        <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
          <Sparkles class="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 transition-transform group-hover:scale-110" />
          <div class="text-xs font-black uppercase tracking-widest mb-2 opacity-80">Learning</div>
          <div class="text-5xl font-black font-display">
            {game.allFacts.filter(f => f.status === 'ACTIVE').length}
          </div>
        </div>
      </div>
    </div>
  {:else if view === 'settings'}
    <div class="flex-1 overflow-y-auto pb-12" in:fly={{ x: 20, duration: 500 }}>
      <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 dark:border-slate-700/30">
        <SettingsComp />
      </div>
    </div>
  {:else}
    <div class="flex-1 flex flex-col justify-between pb-4" in:fade>
      <div class="space-y-4">
        <div class="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20 dark:border-slate-700/20 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs font-black uppercase tracking-widest text-slate-400">Round Progress</span>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full animate-fun-bounce">
                <span class="text-lg">🔥</span> 
                <span class="text-sm font-black">{currentStreak}</span>
              </div>
              <div class="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
                {roundQuestionCount}/{game.roundLength}
              </div>
            </div>
          </div>
          <ProgressBar progress={roundProgress} color="bg-gradient-to-r from-indigo-500 to-fuchsia-500" h="h-4" />
        </div>
        
        {#if game.currentQuestion}
          <div in:scale={{ duration: 400, start: 0.9 }}>
            <EquationDisplay 
              factors={game.currentQuestion.factors} 
              answer={selectedAnswer !== null ? String(selectedAnswer) : '?'} 
              isCorrect={isCorrect}
            />
          </div>
        {/if}

        {#if !hasStartedRound && game.currentQuestion}
          <div class="text-center text-slate-500 dark:text-slate-400 font-bold animate-pulse text-lg" in:fade>
            Ready? Tap an answer to start! ⚡
          </div>
        {/if}
      </div>

      {#if game.currentQuestion && correctAnswer >= 0}
        <div class="w-full">
          {#key buttonResult ? 'showing-result' : game.currentQuestion.id}
            <div in:fly={{ y: 20, duration: 400 }}>
              <MultipleChoice 
                choices={choices}
                correctAnswer={correctAnswer}
                onSelect={handleAnswer}
                disabled={game.isAnswering || !!buttonResult}
                showResult={buttonResult}
              />
            </div>
          {/key}
        </div>
      {/if}
    </div>
  {/if}
</main>

{#if showRoundSummary}
  <RoundSummary
    totalQuestions={game.roundLength}
    correctCount={roundCorrectCount}
    results={roundResults}
    currentStreak={currentStreak}
    bestStreak={game.bestStreak}
    onContinue={startNewRound}
  />
{/if}

<style>
  :global(body) {
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }
  
  main {
    height: 100dvh;
    overflow: hidden;
  }

  .soft-scroll {
    scrollbar-width: none;
  }
  .soft-scroll::-webkit-scrollbar {
    display: none;
  }
</style>
