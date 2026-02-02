<script lang="ts">
  interface Props {
    correctAnswer: number;
    onSelect: (answer: number) => void;
    disabled?: boolean;
    showResult?: { selectedAnswer: number; correctAnswer: number } | null;
    // Pass in the choices to keep them stable
    choices: number[];
  }

  let { correctAnswer, onSelect, disabled = false, showResult = null, choices }: Props = $props();

  function handleClick(answer: number) {
    if (disabled) return;
    if (window.navigator.vibrate) window.navigator.vibrate(15);
    onSelect(answer);
  }

  function getButtonClass(choice: number): string {
    // Fixed height and no scale transforms to prevent shifting
    const base = "h-20 text-4xl font-black rounded-3xl shadow-lg transition-colors duration-200 touch-none select-none";
    
    if (showResult) {
      if (choice === showResult.correctAnswer) {
        // Always highlight correct answer in green - no scale to prevent shift
        return `${base} bg-emerald-500 text-white border-4 border-emerald-400 shadow-emerald-500/40`;
      } else if (choice === showResult.selectedAnswer && choice !== showResult.correctAnswer) {
        // Wrong selection - show red
        return `${base} bg-red-500 text-white border-4 border-red-400 shadow-red-500/40`;
      } else {
        // Other buttons fade out
        return `${base} bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-4 border-transparent`;
      }
    }
    
    // Default state - consistent border to prevent layout shift
    return `${base} bg-white dark:bg-slate-800 text-slate-800 dark:text-white
           border-4 border-slate-200 dark:border-slate-700
           hover:border-indigo-400 hover:shadow-xl
           active:bg-indigo-600 active:text-white active:border-indigo-600`;
  }
</script>

<div class="flex flex-col gap-4 max-w-md mx-auto w-full px-4">
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
