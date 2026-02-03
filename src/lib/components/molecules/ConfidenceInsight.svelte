<script lang="ts">
  import { GameConfig } from '../../../worker/game-config';
  import { Zap, Timer, Brain, AlertCircle } from 'lucide-svelte';

  const formatPercent = (val: number) => (val > 0 ? '+' : '') + Math.round(val * 100) + '%';
</script>

<div class="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 dark:border-slate-700/20 shadow-sm space-y-6">
  <div>
    <h4 class="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-1">Tiered Fluency System 🧠</h4>
    <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
      Speed determines your mastery ceiling
    </p>
  </div>

  <div class="grid grid-cols-1 gap-3">
    <!-- Fast = Mastery -->
    <div class="flex items-center gap-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
      <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
        <Zap size={20} />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-0.5">
          <span class="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">⚡ Fast (Fluent)</span>
          <span class="text-xs font-black px-2 py-0.5 bg-emerald-500 text-white rounded-full">{formatPercent(GameConfig.CONFIDENCE_BOOST_FAST)}</span>
        </div>
        <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">Under {GameConfig.TIME_THRESHOLD_FAST / 1000}s → <span class="text-emerald-500">Can reach {Math.round(GameConfig.MASTERED_THRESHOLD * 100)}% Mastery!</span></p>
      </div>
    </div>

    <!-- Normal = 85% Cap -->
    <div class="flex items-center gap-4 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
      <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
        <Timer size={20} />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-0.5">
          <span class="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">🏃 Normal</span>
          <span class="text-xs font-black px-2 py-0.5 bg-indigo-500 text-white rounded-full">{formatPercent(GameConfig.CONFIDENCE_BOOST_NORMAL)}</span>
        </div>
        <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">{GameConfig.TIME_THRESHOLD_FAST / 1000}s - {GameConfig.TIME_THRESHOLD_SLOW / 1000}s → <span class="text-indigo-500">Capped at {Math.round(GameConfig.NORMAL_CONFIDENCE_CAP * 100)}%</span></p>
      </div>
    </div>

    <!-- Slow = 70% Cap -->
    <div class="flex items-center gap-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
      <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
        <Brain size={20} />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-0.5">
          <span class="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">🐢 Slow</span>
          <span class="text-xs font-black px-2 py-0.5 bg-amber-500 text-white rounded-full">{formatPercent(GameConfig.CONFIDENCE_PENALTY_SLOW)}</span>
        </div>
        <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">Over {GameConfig.TIME_THRESHOLD_SLOW / 1000}s → <span class="text-amber-500">Capped at {Math.round(GameConfig.SLOW_CONFIDENCE_CAP * 100)}%</span></p>
      </div>
    </div>

    <!-- Wrong -->
    <div class="flex items-center gap-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
      <div class="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
        <AlertCircle size={20} />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-0.5">
          <span class="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">❌ Wrong</span>
          <span class="text-xs font-black px-2 py-0.5 bg-rose-500 text-white rounded-full">{formatPercent(GameConfig.CONFIDENCE_PENALTY_WRONG)}</span>
        </div>
        <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">Any incorrect answer → Drops confidence significantly</p>
      </div>
    </div>
  </div>

  <div class="pt-2">
    <div class="flex items-center gap-2 mb-2">
      <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
      <span class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">The Goal</span>
      <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
    </div>
    <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold text-center">
      Reach <span class="text-emerald-500 font-black">{Math.round(GameConfig.MASTERED_THRESHOLD * 100)}%</span> to master a fact.
      <span class="text-amber-500 italic">Only fast answers can get you there!</span>
    </p>
  </div>
</div>

