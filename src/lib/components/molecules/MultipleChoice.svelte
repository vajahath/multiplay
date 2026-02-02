<script lang="ts">
  interface Props {
    correctAnswer: number;
    onSelect: (answer: number) => void;
    disabled?: boolean;
    showResult?: { selectedAnswer: number; correctAnswer: number } | null;
    choices: number[];
  }

  let { correctAnswer, onSelect, disabled = false, showResult = null, choices }: Props = $props();

  function handleClick(answer: number) {
    if (disabled) return;
    if (window.navigator.vibrate) window.navigator.vibrate(15);
    onSelect(answer);
  }

  function getButtonClass(choice: number): string {
    const base = "h-20 sm:h-24 text-4xl sm:text-5xl font-black rounded-[2rem] shadow-xl transition-all duration-300 touch-none select-none font-display border-b-8";
    
    if (showResult) {
      if (choice === showResult.correctAnswer) {
        return `${base} bg-emerald-400 text-white border-emerald-600 shadow-emerald-400/30 scale-105 z-10`;
      } else if (choice === showResult.selectedAnswer && choice !== showResult.correctAnswer) {
        return `${base} bg-rose-400 text-white border-rose-600 shadow-rose-400/20 opacity-80`;
      } else {
        return `${base} bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700 opacity-40 grayscale`;
      }
    }
    
    // Vibrant default state with "fat" buttons (3D effect with border-b)
    const activeStates = [
      "bg-amber-400 text-white border-amber-600 hover:bg-amber-300 hover:border-amber-500",
      "bg-indigo-500 text-white border-indigo-700 hover:bg-indigo-400 hover:border-indigo-600",
      "bg-fuchsia-500 text-white border-fuchsia-700 hover:bg-fuchsia-400 hover:border-fuchsia-600"
    ];
    
    return `${base} ${activeStates[choices.indexOf(choice) % 3]} hover:-translate-y-1 hover:shadow-2xl active:translate-y-1 active:border-b-0`;
  }
</script>

<div class="flex flex-col gap-5 max-w-md mx-auto w-full px-4 mb-8">
  {#each choices as choice}
    <button 
      type="button"
      class={getButtonClass(choice)}
      onclick={() => handleClick(choice)}
      disabled={disabled}
    >
      {choice}
    </button>
  {/each}
</div>
