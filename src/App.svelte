<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from './lib/stores/game.svelte';
  import { audio } from './lib/audio/AudioManager';
  import EquationDisplay from './lib/components/molecules/EquationDisplay.svelte';
  import MultipleChoice from './lib/components/molecules/MultipleChoice.svelte';
  import RoundSummary from './lib/components/molecules/RoundSummary.svelte';
  import Heatmap from './lib/components/molecules/Heatmap.svelte';
  import ProgressBar from './lib/components/atoms/ProgressBar.svelte';
  import SettingsComp from './lib/components/molecules/Settings.svelte';
  import { Settings, BarChart3, ChevronLeft, Zap } from 'lucide-svelte';
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
      // Only reset these, keep buttonResult visible briefly
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
    
    const result = await game.submitAnswer(answer, 1500); // Fixed time for simplicity
    
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
      
      // Show result on buttons
      buttonResult = {
        selectedAnswer: answer,
        correctAnswer: result.correctAnswer
      };
      
      // Quick transition - show result briefly then move to next question
      setTimeout(() => {
        buttonResult = null;
        
        // Check if round is complete
        if (roundQuestionCount >= game.roundLength) {
          showRoundSummary = true;
        } else {
          game.nextQuestion();
        }
      }, 600); // Short delay for feedback visibility
    }
  }

  async function startNewRound() {
    showRoundSummary = false;
    roundQuestionCount = 0;
    roundCorrectCount = 0;
    roundResults = [];
    hasStartedRound = false;
    await game.refreshFacts(); // Refresh to update heatmap
    game.nextQuestion();
  }
</script>

<main class="max-w-xl mx-auto min-h-screen flex flex-col p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
  <!-- Header -->
  <header class="flex justify-between items-center h-16 mb-4">
    {#if view === 'game'}
      <h1 class="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
        <Zap class="fill-indigo-600 dark:fill-indigo-400" />
        MultiFlow
      </h1>
    {:else}
      <button onclick={() => view = 'game'} class="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ChevronLeft /> Back
      </button>
    {/if}

    <div class="flex gap-1">
      <button 
        onclick={() => view = 'stats'} 
        class="p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-colors {view === 'stats' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}"
      >
        <BarChart3 size={24} />
      </button>
      <button 
        onclick={() => view = 'settings'} 
        class="p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-colors {view === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}"
      >
        <Settings size={24} />
      </button>
    </div>
  </header>

  {#if game.isInitializing}
    <div class="flex-1 flex flex-col items-center justify-center space-y-4">
      <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <div class="text-xl font-black text-slate-400">Loading Brain...</div>
    </div>
  {:else if view === 'stats'}
    <div class="flex-1 overflow-y-auto space-y-6 pb-8">
      <Heatmap facts={game.allFacts} />
      
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Mastered</div>
          <div class="text-3xl font-black text-emerald-500">
            {game.allFacts.filter(f => f.status === 'MASTERED').length}
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Learning</div>
          <div class="text-3xl font-black text-amber-500">
            {game.allFacts.filter(f => f.status === 'ACTIVE').length}
          </div>
        </div>
      </div>
    </div>
  {:else if view === 'settings'}
    <div class="flex-1 overflow-y-auto pb-8">
      <SettingsComp />
    </div>
  {:else}
    <div class="flex-1 flex flex-col justify-between pb-4">
      <div class="space-y-4">
        <!-- Session Progress Bar (not time pressure) -->
        <div class="px-2">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-bold text-slate-500 dark:text-slate-400">
              Round Progress
            </span>
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 rounded-full">
                🔥 {currentStreak} / Best: {game.bestStreak}
              </span>
              <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {roundQuestionCount}/{game.roundLength}
              </span>
            </div>
          </div>
          <ProgressBar progress={roundProgress} color="bg-indigo-600" />
        </div>
        
        {#if game.currentQuestion}
          <EquationDisplay 
            factors={game.currentQuestion.factors} 
            answer={selectedAnswer !== null ? String(selectedAnswer) : '?'} 
            isCorrect={isCorrect}
          />
        {/if}

        <!-- Encouraging message for first question -->
        {#if !hasStartedRound && game.currentQuestion}
          <div class="text-center text-slate-500 dark:text-slate-400 text-sm animate-pulse">
            Tap the correct answer to start! 🚀
          </div>
        {/if}
      </div>

      {#if game.currentQuestion && correctAnswer >= 0}
        {#key buttonResult ? 'showing-result' : game.currentQuestion.id}
          <MultipleChoice 
            choices={choices}
            correctAnswer={correctAnswer}
            onSelect={handleAnswer}
            disabled={game.isAnswering || !!buttonResult}
            showResult={buttonResult}
          />
        {/key}
      {/if}
    </div>
  {/if}
</main>

<!-- Round Summary Modal -->
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
    background-color: #f8fafc;
    overflow: hidden;
  }
  
  :global(.dark body) {
    background-color: #0f172a;
  }
  
  main {
    height: 100dvh;
    user-select: none;
    -webkit-user-select: none;
  }
</style>
