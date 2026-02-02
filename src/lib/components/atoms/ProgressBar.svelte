<script lang="ts">
  interface Props {
    progress: number; // 0 to 1
    color?: string;
  }

  let { progress, color = 'bg-primary' }: Props = $props();
</script>

<div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
  <div 
    class="h-full {color} transition-all duration-100 ease-linear"
    style="width: {Math.max(0, Math.min(1, progress)) * 100}%"
  ></div>
</div>
