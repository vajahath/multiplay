<script lang="ts">
  interface Props {
    factors: [number, number];
    answer: string;
    isCorrect?: boolean | null;
  }

  let { factors, answer, isCorrect }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-8">
  <div class="text-5xl md:text-7xl font-black tracking-tight flex items-baseline gap-3 md:gap-6">
    <span class="text-slate-700 dark:text-slate-300">{factors[0]}</span>
    <span class="text-indigo-500">×</span>
    <span class="text-slate-700 dark:text-slate-300">{factors[1]}</span>
    <span class="text-indigo-500">=</span>
    <div class="min-w-[1.5em] text-center">
      <span class={isCorrect === false ? 'text-red-500' : (isCorrect === true ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400')}>
        {answer}
      </span>
    </div>
  </div>
</div>

<style>
  div {
    font-variant-numeric: tabular-nums;
  }
</style>
