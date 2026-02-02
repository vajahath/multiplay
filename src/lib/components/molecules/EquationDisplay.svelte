<script lang="ts">
  interface Props {
    factors: [number, number];
    answer: string;
    isCorrect?: boolean | null;
  }

  let { factors, answer, isCorrect }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-2 sm:py-4 md:py-6 lg:py-8 max-h-full min-h-0 w-full overflow-hidden">
  <div class="text-[clamp(2rem,min(8vh,12vw),7rem)] leading-none font-black tracking-tighter flex items-center justify-center gap-[0.2em] font-display w-full">
    <span class="text-slate-800 dark:text-slate-100 transition-all duration-500 drop-shadow-lg shrink min-w-0">{factors[0]}</span>
    <span class="text-indigo-500 animate-pulse opacity-80 shrink-0">×</span>
    <span class="text-slate-800 dark:text-slate-100 transition-all duration-500 drop-shadow-lg shrink min-w-0">{factors[1]}</span>
    <span class="text-indigo-500 shrink-0">=</span>
    <div class="min-w-[1.2em] text-center relative shrink-0">
      <span class={isCorrect === false ? 'text-rose-500 scale-110 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]' : (isCorrect === true ? 'text-emerald-500 scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-indigo-600 dark:text-indigo-400')}>
        {answer}
      </span>
    </div>
  </div>
</div>

<style>
  div {
    font-variant-numeric: tabular-nums;
  }
  
  span {
    transition: color 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
</style>
