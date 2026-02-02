<script lang="ts">
  interface Props {
    progress: number; // 0 to 1
    color?: string;
    h?: string;
  }

  let { progress, color = 'bg-indigo-600', h = 'h-1.5' }: Props = $props();
</script>

<div class="w-full {h} bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
  <div 
    class="h-full {color} transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) rounded-full"
    style="width: {Math.max(0, Math.min(1, progress)) * 100}%"
  ></div>
</div>
