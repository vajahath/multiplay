<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly, scale } from "svelte/transition";
  import { game } from "./lib/stores/game.svelte";
  import { profileStore } from "./lib/stores/profile.svelte";
  import { audio } from "./lib/audio/AudioManager";
  import EquationDisplay from "./lib/components/molecules/EquationDisplay.svelte";
  import MultipleChoice from "./lib/components/molecules/MultipleChoice.svelte";
  import RoundSummary from "./lib/components/molecules/RoundSummary.svelte";
  import Heatmap from "./lib/components/molecules/Heatmap.svelte";
  import ConfidenceInsight from "./lib/components/molecules/ConfidenceInsight.svelte";
  import ProgressBar from "./lib/components/atoms/ProgressBar.svelte";
  import SettingsComp from "./lib/components/molecules/Settings.svelte";
  import ProfileSelector from "./lib/components/molecules/ProfileSelector.svelte";
  import { Settings, BarChart3, ChevronLeft, Gamepad2, Sparkles, Trophy, Users, Maximize2, Minimize2 } from 'lucide-svelte';
  import type { AnswerResult } from './worker/types';

  let view = $state<"game" | "stats" | "settings">("game");
  let isFullscreen = $state(false);
  let isCorrect = $state<boolean | null>(null);
  let selectedAnswer = $state<number | null>(null);

  // Round tracking
  let roundQuestionCount = $state(0);
  let roundCorrectCount = $state(0);
  let roundResults = $state<AnswerResult[]>([]);
  let showRoundSummary = $state(false);
  let hasStartedRound = $state(false);
  let unlockedTable = $state<number | null>(null);

  // Winstreak
  let currentStreak = $state(0);
  let lastProfileId = $state(profileStore.currentProfile?.id || "");

  // Result display on buttons
  let buttonResult = $state<{
    selectedAnswer: number;
    correctAnswer: number;
  } | null>(null);
  let choices = $state<number[]>([]);
  let questionStartTime = $state<number>(0);

  // Compute the correct answer for the current question
  const correctAnswer = $derived(
    game.currentQuestion
      ? game.currentQuestion.factors[0] * game.currentQuestion.factors[1]
      : 0,
  );

  // Session progress (0 to 1)
  const roundProgress = $derived(roundQuestionCount / game.roundLength);

  onMount(() => {
    // Initialize profile store - it will show selector if needed
    profileStore.init();
  });

  // Reset state when new question loads
  $effect(() => {
    if (game.currentQuestion && view === "game") {
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

      // Start the timer for the new question
      questionStartTime = performance.now();
    }
  });

  // Watch for profile changes to reset session state
  $effect(() => {
    const currentId = profileStore.currentProfile?.id || "";
    if (currentId && currentId !== lastProfileId) {
      lastProfileId = currentId;

      // Complete reset of round state whenever profile changes
      roundQuestionCount = 0;
      roundCorrectCount = 0;
      roundResults = [];
      showRoundSummary = false;
      hasStartedRound = false;
      currentStreak = 0;
      unlockedTable = null;
      buttonResult = null;
      isCorrect = null;
      selectedAnswer = null;

      // Always return to game view on switch
      view = "game";
    }
  });

  async function handleAnswer(answer: number) {
    if (game.isAnswering || buttonResult) return;

    audio.init();
    hasStartedRound = true;
    selectedAnswer = answer;

    // Calculate precise time taken
    const timeTaken = Math.round(performance.now() - questionStartTime);
    const result = await game.submitAnswer(answer, timeTaken);

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
        // Haptic: Sharp, happy tap (subtle)
        if (navigator.vibrate) navigator.vibrate(5);
      } else {
        currentStreak = 0;
        audio.playWrong();
        // Haptic: Longer, clear error buzz
        if (navigator.vibrate) navigator.vibrate(50);
      }

      buttonResult = {
        selectedAnswer: answer,
        correctAnswer: result.correctAnswer,
      };

      // PERFORMANCE OPTIMIZATION: Start pre-fetching background data immediately
      // This masks the worker latency behind the result animation (700ms)
      const nextQuestionPromise =
        roundQuestionCount < game.roundLength
          ? game.prepareNextQuestion()
          : null;

      const progressionPromise =
        roundQuestionCount >= game.roundLength
          ? game.checkTableProgression()
          : null;

      // Feedback display delay
      setTimeout(async () => {
        buttonResult = null;

        if (roundQuestionCount >= game.roundLength) {
          // If end of round, get the pre-calculated progression result
          unlockedTable = await progressionPromise;
          showRoundSummary = true;
        } else if (nextQuestionPromise) {
          // If round continues, apply the pre-fetched question
          const q = await nextQuestionPromise;
          game.applyNextQuestion(q);
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
    unlockedTable = null;
    await game.refreshFacts();
    game.nextQuestion();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      isFullscreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        isFullscreen = false;
      }
    }
  }

  // Handle physical exit (like ESC key)
  onMount(() => {
    const handler = () => {
      isFullscreen = !!document.fullscreenElement;
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  });
</script>

<div
  class="fixed inset-0 bg-[#f0f4ff] dark:bg-[#0f172a] -z-10 transition-colors duration-700"
>
  <!-- Static gradient blobs for visual interest (no animation for battery) -->
  <div class="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
    <div
      class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300 blur-[80px] rounded-full"
    ></div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-300 blur-[80px] rounded-full"
    ></div>
  </div>
</div>

<main
  class="mx-auto h-[100dvh] flex flex-col p-4 sm:p-6 font-sans transition-all duration-500 overflow-hidden {view ===
  'stats'
    ? 'max-w-6xl'
    : view === 'settings'
      ? 'max-w-4xl'
      : 'max-w-full lg:px-12 xl:px-24'}"
>
  <!-- Header: Compact and responsive -->
  <header
    class="flex justify-between items-center h-14 sm:h-16 mb-2 sm:mb-4 px-2 shrink-0 transition-all duration-500"
  >
    {#if view === "game"}
      <div
        class="flex items-center gap-3 min-w-0"
        in:fly={{ x: -20, duration: 500 }}
      >
        {#if profileStore.currentProfile}
          <button
            onclick={() => profileStore.switchProfile()}
            class="relative group shrink-0 cursor-pointer focus-visible:ring-4 focus-visible:ring-indigo-500/50 outline-none"
            title="Switch Player"
            aria-label="Current player: {profileStore.currentProfile.name}. Click to switch player."
          >
            <div
              class="w-9 h-9 sm:w-10 sm:h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-lg border border-white dark:border-slate-700 group-hover:scale-105 transition-transform"
            >
              {profileStore.currentProfile.avatarEmoji}
            </div>
            <div
              class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"
            ></div>
          </button>
        {/if}
        <button
          onclick={() => profileStore.switchProfile()}
          class="min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg px-2 -mx-2 outline-none"
          title="Switch Player"
          aria-label="Switch player"
        >
          <div
            class="text-[8px] sm:text-[9px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-0.5 opacity-80 truncate"
          >
            Playing as
          </div>
          <h1
            class="text-base sm:text-lg font-black text-slate-800 dark:text-white leading-none truncate"
          >
            {profileStore.currentProfile?.name || "Multiplay"}
          </h1>
        </button>
      </div>
    {:else}
      <button
        onclick={() => (view = "game")}
        class="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl font-black text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 border border-white/20 dark:border-slate-700/30 transition-all group"
      >
        <ChevronLeft
          size={16}
          class="group-hover:-translate-x-1 transition-transform"
        />
        Back
      </button>
    {/if}

    <div class="flex gap-2 sm:gap-2.5">
      <button 
        onclick={toggleFullscreen}
        class="hidden sm:flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-white/20 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-700 transition-all"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {#if isFullscreen}
          <Minimize2 size={16} />
        {:else}
          <Maximize2 size={16} />
        {/if}
      </button>
      <button 
        onclick={() => view = 'stats'} 
        class="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-300 {view === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-white/20 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-700'}"
      >
        <BarChart3 size={16} />
        <span
          class="hidden sm:inline font-black text-xs uppercase tracking-widest"
          >Stats</span
        >
      </button>
      <button
        onclick={() => (view = "settings")}
        class="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-300 {view ===
        'settings'
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
          : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-white/20 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-700'}"
      >
        <Settings size={16} />
        <span
          class="hidden sm:inline font-black text-xs uppercase tracking-widest"
          >Settings</span
        >
      </button>
    </div>
  </header>

  {#if game.isInitializing}
    <div class="flex-1 flex flex-col items-center justify-center gap-6" in:fade>
      <div class="relative">
        <div
          class="w-20 h-20 border-8 border-indigo-100 dark:border-slate-800 rounded-full"
        ></div>
        <div
          class="w-20 h-20 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"
        ></div>
      </div>
      <div class="text-2xl font-black text-slate-400 font-display text-center">
        Unlocking Your<br /><span class="text-indigo-600">Superpower...</span>
      </div>
    </div>
  {:else if view === "stats"}
    <div
      class="flex-1 overflow-y-auto pb-12 soft-scroll space-y-10 lg:grid lg:grid-cols-2 lg:gap-12 lg:space-y-0"
      in:fly={{ y: 20, duration: 500 }}
    >
      <!-- Left Column: Heatmap -->
      <div class="space-y-12">
        <Heatmap facts={game.allFacts} />
      </div>

      <!-- Right Column: Stats & Guidance -->
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4 lg:gap-6">
          <div
            class="bg-gradient-to-br from-emerald-400 to-emerald-500 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden group"
          >
            <Trophy
              class="absolute -right-4 -bottom-4 w-16 sm:w-20 h-16 sm:h-20 opacity-20 transition-transform group-hover:scale-110"
            />
            <div
              class="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2 opacity-80"
            >
              Mastered
            </div>
            <div
              class="text-3xl sm:text-4xl lg:text-5xl font-black font-display"
            >
              {game.allFacts.filter((f) => f.status === "MASTERED").length}
            </div>
          </div>
          <div
            class="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group"
          >
            <Sparkles
              class="absolute -right-4 -bottom-4 w-16 sm:w-20 h-16 sm:h-20 opacity-20 transition-transform group-hover:scale-110"
            />
            <div
              class="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2 opacity-80"
            >
              Learning
            </div>
            <div
              class="text-3xl sm:text-4xl lg:text-5xl font-black font-display"
            >
              {game.allFacts.filter((f) => f.status === "ACTIVE").length}
            </div>
          </div>
        </div>

        <ConfidenceInsight />

        <div
          class="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 dark:border-slate-700/20"
        >
          <h4
            class="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-2"
          >
            Pro Tip! 🚀
          </h4>
          <p
            class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold"
          >
            Mastery is all about <span class="text-emerald-500">fluency</span>.
            Try to answer without counting on your fingers to get that
            <span class="text-emerald-500 uppercase tracking-wider"
              >Power Boost</span
            >!
          </p>
        </div>
      </div>
    </div>
  {:else if view === "settings"}
    <div
      class="flex-1 overflow-y-auto pb-12 soft-scroll"
      in:fly={{ x: 20, duration: 500 }}
    >
      <SettingsComp />
    </div>
  {:else}
    <div class="flex-1 flex flex-col gap-4 min-h-0 pb-4" in:fade>
      <!-- Game Info Panel (Progress & Title) - Fixed Height -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center shrink-0">
        <div class="lg:col-span-12 xl:col-span-7">
          <div class="p-1 flex items-center gap-4">
            <div class="flex-1">
              <div class="flex justify-between items-end mb-1.5 px-1">
                <span
                  class="text-[9px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400"
                  >Round Progress</span
                >
                <span
                  class="text-[10px] font-black text-slate-500 dark:text-slate-400"
                  >{roundQuestionCount} / {game.roundLength}</span
                >
              </div>
              <ProgressBar
                progress={roundProgress}
                color="bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                h="h-2"
              />
            </div>
            <div
              class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl shadow-sm"
            >
              <span class="text-base">🔥</span>
              <span class="text-base font-black">{currentStreak}</span>
            </div>
          </div>
        </div>
        <div class="xl:col-span-5 hidden xl:flex items-center justify-center">
          <div
            class="px-5 py-2 bg-white/20 dark:bg-slate-800/20 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
          >
            Pick the correct result
          </div>
        </div>
      </div>

      <!-- Main Play Zone - Flexible Height -->
      <div
        class="flex-1 min-h-0 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-[2.5rem] sm:rounded-[3rem] border border-white/20 dark:border-slate-700/20 shadow-2xl overflow-hidden flex flex-col lg:grid lg:grid-cols-12"
      >
        <!-- Question Area -->
        <div
          class="flex-1 lg:flex-none lg:col-span-7 flex flex-col items-center justify-center p-2 sm:p-8 relative overflow-hidden bg-white/20 dark:bg-slate-900/10 min-h-0"
        >
          <div
            class="absolute top-0 left-0 w-full h-full bg-grid-slate-200/50 [mask-image:linear-gradient(to_bottom,white,transparent)] dark:bg-grid-slate-700/30 -z-10"
          ></div>

          {#if game.currentQuestion}
            <div
              class="w-full flex items-center justify-center min-h-0"
              in:scale={{ duration: 400, start: 0.9 }}
            >
              <EquationDisplay
                factors={game.currentQuestion.factors}
                answer={selectedAnswer !== null ? String(selectedAnswer) : "?"}
                {isCorrect}
              />
            </div>
          {/if}

          {#if !hasStartedRound && game.currentQuestion}
            <div
              class="mt-1 text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-base text-center shrink-0"
              in:fade
            >
              Ready? Select an answer! ⚡
            </div>
          {/if}
        </div>

        <!-- Action Area (Answers) -->
        <div
          class="flex-1 lg:flex-none lg:col-span-5 bg-white/50 dark:bg-slate-800/40 p-3 sm:p-5 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/20 dark:border-slate-700/20 min-h-0"
        >
          {#if game.currentQuestion && correctAnswer >= 0}
            <div
              class="w-full max-w-sm sm:max-w-md mx-auto h-full flex items-center justify-center min-h-0"
            >
              {#key buttonResult ? "showing-result" : game.currentQuestion.id}
                <div class="w-full" in:fly={{ x: 20, duration: 400 }}>
                  <MultipleChoice
                    {choices}
                    {correctAnswer}
                    onSelect={handleAnswer}
                    disabled={game.isAnswering || !!buttonResult}
                    showResult={buttonResult}
                  />
                </div>
              {/key}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</main>

{#if showRoundSummary}
  <RoundSummary
    totalQuestions={game.roundLength}
    correctCount={roundCorrectCount}
    results={roundResults}
    {currentStreak}
    bestStreak={game.bestStreak}
    allFacts={game.allFacts}
    {unlockedTable}
    onContinue={startNewRound}
    onViewStats={async () => {
      await startNewRound();
      view = "stats";
    }}
  />
{/if}

<!-- Profile Selector Modal -->
<ProfileSelector />

<style>
  :global(body) {
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    background-color: #0f172a; /* Solid base for transitions */
  }

  :global(.bg-grid-slate-200\/50) {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%2394a3b8' fill-opacity='0.1'%3E%3Cpath d='M0 38.59V40h1.41l3.3-3.3L1.41 33.41 0 34.82V38.59zM0 1.41L1.41 0H38.59L40 1.41V38.59L38.59 40H1.41L0 38.59V1.41zM1.41 1.41V38.59h37.18V1.41H1.41z'/%3E%3C/g%3E%3C/svg%3E");
  }

  main {
    height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .soft-scroll {
    scrollbar-width: none;
  }
  .soft-scroll::-webkit-scrollbar {
    display: none;
  }
</style>
