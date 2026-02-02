<script lang="ts">
  import { Delete } from 'lucide-svelte';
  
  interface Props {
    onPress: (val: string) => void;
    onBackspace: () => void;
    onSubmit: () => void;
  }

  let { onPress, onBackspace, onSubmit }: Props = $props();

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  function handleKey(key: string) {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
    onPress(key);
  }

  function handleBackspace() {
    if (window.navigator.vibrate) window.navigator.vibrate(5);
    onBackspace();
  }

  function handleSubmit() {
    if (window.navigator.vibrate) window.navigator.vibrate(20);
    onSubmit();
  }
</script>

<div class="grid grid-cols-3 gap-3 max-w-sm mx-auto w-full px-4">
  {#each keys as key}
    <button 
      type="button"
      class="h-20 text-3xl font-bold bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 touch-none select-none"
      onclick={() => handleKey(key)}
    >
      {key}
    </button>
  {/each}
  
  <button 
    type="button"
    class="h-20 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl active:scale-95 transition-transform touch-none select-none"
    onclick={handleBackspace}
  >
    <Delete size={32} />
  </button>
  
  <button 
    type="button"
    class="h-20 text-3xl font-bold bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 touch-none select-none"
    onclick={() => handleKey('0')}
  >
    0
  </button>

  <button 
    type="button"
    class="h-20 text-xl font-bold bg-primary text-white rounded-2xl active:scale-95 transition-transform shadow-lg shadow-primary/30 flex items-center justify-center touch-none select-none"
    onclick={handleSubmit}
  >
    Enter
  </button>
</div>
