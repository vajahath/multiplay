/**
 * Profile Store
 * 
 * Manages user profiles for multi-kid support.
 * Handles profile selection, creation, and persistence.
 */

import { ProfilesDB, MetaDB, type ProfileRecord } from '../db/database';
import { getRandomAvatar, generateProfileId } from '../types/profile';
import { game } from './game.svelte';

const ACTIVE_PROFILE_KEY = 'activeProfileId';

class ProfileStore {
    // All available profiles
    profiles = $state<ProfileRecord[]>([]);

    // Currently active profile
    currentProfile = $state<ProfileRecord | null>(null);

    // Loading state
    isLoading = $state(true);

    // Whether profile selector should be shown
    showSelector = $state(false);

    /**
     * Initialize the profile store - loads profiles and determines if selection is needed
     */
    async init(): Promise<void> {
        this.isLoading = true;

        try {
            // Load all profiles
            this.profiles = await ProfilesDB.getAll();

            // Check for previously active profile
            const activeId = await MetaDB.get<string>(ACTIVE_PROFILE_KEY);

            if (activeId) {
                const activeProfile = this.profiles.find(p => p.id === activeId);
                if (activeProfile) {
                    // Resume previous session - init game first, then set state
                    await game.init(activeProfile.id);
                    this.currentProfile = activeProfile;
                    this.showSelector = false;
                } else {
                    // Active profile was deleted, show selector
                    this.showSelector = this.profiles.length > 0;
                }
            } else if (this.profiles.length === 0) {
                // No profiles exist - show create new profile form
                this.showSelector = true;
            } else if (this.profiles.length === 1) {
                // Only one profile, auto-select it
                await game.init(this.profiles[0].id);
                await this.selectProfile(this.profiles[0].id);
            } else {
                // Multiple profiles, show selector
                this.showSelector = true;
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Create a new profile
     */
    async createProfile(name: string): Promise<ProfileRecord> {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error('Name is required');
        }

        const profile: ProfileRecord = {
            id: generateProfileId(),
            name: trimmedName,
            avatarEmoji: getRandomAvatar(),
            createdAt: Date.now(),
        };

        await ProfilesDB.save(profile);
        this.profiles = [...this.profiles, profile];

        // Note: Don't auto-select here - let the caller handle selection
        // so they can also initialize the game in the correct order

        return profile;
    }

    /**
     * Select a profile as active
     */
    async selectProfile(profileId: string): Promise<void> {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) {
            throw new Error('Profile not found');
        }

        // Save as active profile
        await MetaDB.set(ACTIVE_PROFILE_KEY, profileId);
        this.currentProfile = profile;
        this.showSelector = false;
    }

    /**
     * Delete a profile
     */
    async deleteProfile(profileId: string): Promise<void> {
        await ProfilesDB.delete(profileId);
        this.profiles = this.profiles.filter(p => p.id !== profileId);

        // If we deleted the current profile, show selector
        if (this.currentProfile?.id === profileId) {
            this.currentProfile = null;
            await MetaDB.set(ACTIVE_PROFILE_KEY, null);

            if (this.profiles.length === 0) {
                this.showSelector = true;
            } else if (this.profiles.length === 1) {
                await this.selectProfile(this.profiles[0].id);
            } else {
                this.showSelector = true;
            }
        }
    }

    /**
     * Update a profile's name
     */
    async updateProfile(profileId: string, updates: Partial<Pick<ProfileRecord, 'name' | 'avatarEmoji'>>): Promise<void> {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) {
            throw new Error('Profile not found');
        }

        const updatedProfile = { ...profile, ...updates };
        await ProfilesDB.save(updatedProfile);

        this.profiles = this.profiles.map(p => p.id === profileId ? updatedProfile : p);

        if (this.currentProfile?.id === profileId) {
            this.currentProfile = updatedProfile;
        }
    }

    /**
     * Switch to a different profile (show selector)
     */
    switchProfile(): void {
        this.showSelector = true;
    }

    /**
     * Get the current profile ID for scoping data
     * Returns empty string if no profile is selected (shouldn't happen in normal flow)
     */
    get profileId(): string {
        return this.currentProfile?.id || '';
    }
}

export const profileStore = new ProfileStore();
