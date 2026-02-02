<script lang="ts">
  interface Props {
    factors: [number, number];
    answer: string;
    isCorrect?: boolean | null;
  }

  let { factors, answer, isCorrect }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-12 md:py-16">
  <div class="text-6xl md:text-8xl font-black tracking-tight flex items-baseline gap-4 md:gap-8 font-display">
    <span class="text-slate-800 dark:text-slate-100 transition-all duration-300 drop-shadow-sm">{factors[0]}</span>
    <span class="text-indigo-500 animate-fun-bounce inline-block">×</span>
    <span class="text-slate-800 dark:text-slate-100 transition-all duration-300 drop-shadow-sm">{factors[1]}</span>
    <span class="text-indigo-500">=</span>
    <div class="min-w-[1.2em] text-center relative">
      <span class="absolute -top-4 -right-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity">?</span>
      <span class={isCorrect === false ? 'text-rose-500 scale-110' : (isCorrect === true ? 'text-emerald-500 scale-110' : 'text-indigo-600 dark:text-indigo-400')}>
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
