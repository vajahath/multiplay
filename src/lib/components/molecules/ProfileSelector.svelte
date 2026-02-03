<script lang="ts">
  import { fly, scale } from "svelte/transition";
  import { profileStore } from "../../stores/profile.svelte";
  import { game } from "../../stores/game.svelte";
  import { AVATAR_EMOJIS, getRandomAvatar } from "../../types/profile";
  import { UserPlus, Sparkles, ArrowRight, X } from "lucide-svelte";

  let isCreating = $state(false);
  let newName = $state("");
  let selectedAvatar = $state(getRandomAvatar());
  let isSubmitting = $state(false);
  let nameInput: HTMLInputElement;

  // Computed: show create form if no profiles exist or user clicked "Add New"
  const showCreateForm = $derived(
    profileStore.profiles.length === 0 || isCreating,
  );

  async function handleCreateProfile() {
    const trimmedName = newName.trim();
    if (!trimmedName || isSubmitting) return;

    isSubmitting = true;
    try {
      // Create the profile
      const profile = await profileStore.createProfile(trimmedName);
      // Update the profile with selected avatar
      await profileStore.updateProfile(profile.id, {
        avatarEmoji: selectedAvatar,
      });

      // IMPORTANT: Initialize game FIRST (this sets the storage profile ID)
      await game.init(profile.id);

      // THEN select the profile (this hides the modal)
      await profileStore.selectProfile(profile.id);

      newName = "";
      isCreating = false;
    } finally {
      isSubmitting = false;
    }
  }

  async function handleSelectProfile(profileId: string) {
    isSubmitting = true;
    try {
      // IMPORTANT: Initialize game FIRST (this sets the storage profile ID)
      await game.init(profileId);

      // THEN select the profile (this hides the modal)
      await profileStore.selectProfile(profileId);
    } finally {
      isSubmitting = false;
    }
  }

  function startCreating() {
    isCreating = true;
    selectedAvatar = getRandomAvatar();
    // Focus input after transition
    setTimeout(() => nameInput?.focus(), 100);
  }

  function cancelCreating() {
    isCreating = false;
    newName = "";
  }

  function cycleAvatar() {
    // Get a new random avatar that's different from current
    let newAvatar = getRandomAvatar();
    while (newAvatar === selectedAvatar && AVATAR_EMOJIS.length > 1) {
      newAvatar = getRandomAvatar();
    }
    selectedAvatar = newAvatar;
  }

  function handleClose() {
    if (!profileStore.currentProfile || isSubmitting) return;
    profileStore.showSelector = false;
  }
</script>

{#if profileStore.showSelector}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-sm"
    in:fly={{ y: 20, duration: 400 }}
  >
    <div
      class="w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-800 rounded-[3rem] p-8 shadow-2xl relative"
      in:scale={{ start: 0.9, duration: 400, delay: 100 }}
    >
      {#if profileStore.currentProfile && !isSubmitting}
        <button
          onclick={handleClose}
          class="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
        >
          <X size={24} />
        </button>
      {/if}

      {#if showCreateForm}
        <!-- Create New Profile Form -->
        <div class="space-y-6" in:fly={{ x: 20, duration: 300 }}>
          <div class="text-center">
            <button
              onclick={cycleAvatar}
              class="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-5xl mb-4 hover:scale-110 active:scale-95 transition-transform shadow-lg cursor-pointer"
              type="button"
              title="Tap to change avatar"
            >
              {selectedAvatar}
            </button>
            <h2
              class="text-2xl font-black text-slate-800 dark:text-white font-display"
            >
              {profileStore.profiles.length === 0
                ? "What's Your Name?"
                : "New Player"}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tap the emoji to change it! 🎨
            </p>
          </div>

          <div class="space-y-4">
            <input
              bind:this={nameInput}
              type="text"
              bind:value={newName}
              placeholder="Enter your name..."
              maxlength="20"
              class="w-full px-6 py-4 text-xl font-bold text-center bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-2xl border-4 border-transparent focus:border-indigo-500 focus:outline-none transition-colors"
              onkeydown={(e) => e.key === "Enter" && handleCreateProfile()}
            />

            <button
              onclick={handleCreateProfile}
              disabled={!newName.trim() || isSubmitting}
              class="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              {#if isSubmitting}
                <div
                  class="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                Loading...
              {:else}
                <Sparkles size={20} />
                Let's Play!
              {/if}
            </button>

            {#if profileStore.profiles.length > 0}
              <button
                onclick={cancelCreating}
                class="w-full py-3 text-slate-500 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                ← Back to Players
              </button>
            {/if}
          </div>
        </div>
      {:else}
        <!-- Profile Selection -->
        <div class="space-y-6" in:fly={{ x: -20, duration: 300 }}>
          <div class="text-center">
            <h2
              class="text-2xl font-black text-slate-800 dark:text-white font-display"
            >
              Who's Playing? 🎮
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pick your name to continue!
            </p>
          </div>

          <div class="space-y-3 max-h-[300px] overflow-y-auto soft-scroll">
            {#each profileStore.profiles as profile}
              <button
                onclick={() => handleSelectProfile(profile.id)}
                disabled={isSubmitting}
                class="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all group border-2 border-transparent hover:border-indigo-300 dark:hover:border-indigo-600 disabled:opacity-50"
              >
                <div
                  class="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform"
                >
                  {profile.avatarEmoji}
                </div>
                <div class="flex-1 text-left">
                  <div
                    class="text-lg font-black text-slate-800 dark:text-white"
                  >
                    {profile.name}
                  </div>
                </div>
                <ArrowRight
                  class="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
                  size={24}
                />
              </button>
            {/each}
          </div>

          <button
            onclick={startCreating}
            class="w-full flex items-center justify-center gap-3 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-all border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400"
          >
            <UserPlus size={20} />
            Add New Player
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .soft-scroll {
    scrollbar-width: none;
  }
  .soft-scroll::-webkit-scrollbar {
    display: none;
  }
</style>
