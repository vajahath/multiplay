<script lang="ts">
  import { game } from '../../stores/game.svelte';
  import { profileStore } from '../../stores/profile.svelte';
  import { APP_VERSION, updateStore } from '../../stores/version.svelte';
  import { CURRENT_SCHEMA_VERSION } from '../../db/schema';
  import { RotateCcw, AlertTriangle, Download, Info, Users } from 'lucide-svelte';

  const tables = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  let showResetConfirm = $state(false);
  let isResetting = $state(false);

  function toggleTable(table: number) {
    const current = game.enabledTables;
    if (current.includes(table)) {
      if (current.length > 1) {
        game.setEnabledTables(current.filter(t => t !== table));
      }
    } else {
      game.setEnabledTables([...current, table]);
    }
  }

  async function handleReset() {
    isResetting = true;
    try {
      await game.resetProgress();
      showResetConfirm = false;
    } finally {
      isResetting = false;
    }
  }

  function handleUpdate() {
    updateStore.applyUpdate();
  }

  function handleSwitchProfile() {
    profileStore.switchProfile();
  }
</script>

<div class="space-y-10">
  <!-- Update Available Banner -->
  {#if updateStore.hasUpdate}
    <div class="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-500/30 animate-pulse">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Download size={24} />
          <div>
            <h4 class="font-black text-lg">Update Available!</h4>
            <p class="text-sm opacity-90">A new version of Multiplay is ready.</p>
          </div>
        </div>
        <button 
          onclick={handleUpdate}
          class="px-6 py-3 bg-white text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-lg"
        >
          Update Now
        </button>
      </div>
    </div>
  {/if}

  <!-- Current Profile Section -->
  {#if profileStore.currentProfile}
    <section class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
            {profileStore.currentProfile.avatarEmoji}
          </div>
          <div>
            <div class="text-xs font-black uppercase text-indigo-500 tracking-widest mb-1">Playing as</div>
            <div class="text-xl font-black text-slate-800 dark:text-white">
              {profileStore.currentProfile.name}
            </div>
          </div>
        </div>
        <button
          onclick={handleSwitchProfile}
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700"
        >
          <Users size={16} />
          Switch
        </button>
      </div>
    </section>
  {/if}

  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-slate-800 dark:text-white font-display">Pick Your Tables</h2>
      <span class="text-xs font-black uppercase text-indigo-500 tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
        {game.enabledTables.length} Selected
      </span>
    </div>
    
    <div class="grid grid-cols-4 sm:grid-cols-7 gap-3">
      {#each tables as table}
        <button 
          class="aspect-square rounded-2xl font-black text-lg transition-all border-b-4 {game.enabledTables.includes(table) 
            ? 'bg-indigo-600 text-white border-indigo-800 shadow-lg shadow-indigo-600/30' 
            : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-400'}"
          onclick={() => toggleTable(table)}
        >
          {table}
        </button>
      {/each}
    </div>
  </section>

  <section class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div class="flex justify-between items-center">
          <label class="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest" for="max-factor">
            Difficulty
          </label>
          <span class="text-lg font-black text-indigo-600">Up to {game.maxFactor}</span>
        </div>
        <input 
          id="max-factor"
          type="range" 
          min="1" 
          max="12" 
          step="1"
          value={game.maxFactor}
          class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600 range-vibrant"
          oninput={(e) => game.setMaxFactor(parseInt(e.currentTarget.value))}
        />
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Sets the largest number you'll see.</p>
      </div>

      <div class="space-y-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div class="flex justify-between items-center">
          <label class="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest" for="round-length">
            Round Size
          </label>
          <span class="text-lg font-black text-indigo-600">{game.roundLength} Q's</span>
        </div>
        <input 
          id="round-length"
          type="range" 
          min="5" 
          max="50" 
          step="5"
          value={game.roundLength}
          class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600 range-vibrant"
          oninput={(e) => game.setRoundLength(parseInt(e.currentTarget.value))}
        />
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">How many questions per round.</p>
      </div>
    </div>
  </section>
  
  <div class="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden group">
    <div class="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    <h4 class="text-xl font-black mb-2 relative z-10">Pro Tip! 💡</h4>
    <p class="text-sm font-bold opacity-90 relative z-10 leading-relaxed">
      Choose just 1 or 2 tables to practice at a time. It's the fastest way to get them to "Mastered" status!
    </p>
  </div>

  <!-- Reset Progress Section -->
  <section class="space-y-4">
    <h3 class="text-lg font-black text-slate-800 dark:text-white">Danger Zone</h3>
    
    {#if showResetConfirm}
      <div class="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 p-6 rounded-[2rem] space-y-4">
        <div class="flex items-start gap-3">
          <AlertTriangle class="text-red-500 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h4 class="font-black text-red-700 dark:text-red-400">Are you sure?</h4>
            <p class="text-sm text-red-600 dark:text-red-300">
              This will permanently delete all your progress, including mastered facts, streaks, and settings. This action cannot be undone.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <button 
            onclick={handleReset}
            disabled={isResetting}
            class="flex-1 py-3 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
          </button>
          <button 
            onclick={() => showResetConfirm = false}
            disabled={isResetting}
            class="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    {:else}
      <button 
        onclick={() => showResetConfirm = true}
        class="w-full flex items-center justify-center gap-3 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800"
      >
        <RotateCcw size={18} />
        Reset All Progress
      </button>
    {/if}
  </section>

  <!-- Version Info -->
  <section class="pt-6 border-t border-slate-200 dark:border-slate-700">
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center gap-2 text-slate-400">
        <Info size={14} />
        <span>Version</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-mono font-bold text-slate-500 dark:text-slate-400">v{APP_VERSION}</span>
        <span class="text-xs text-slate-400">(Schema v{CURRENT_SCHEMA_VERSION})</span>
      </div>
    </div>
  </section>
</div>

<style>
  .range-vibrant::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #4f46e5;
    border: 4px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .range-vibrant::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
</style>
