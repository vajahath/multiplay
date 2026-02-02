/**
 * Profile Types
 * 
 * Defines the structure for user profiles in the app.
 */

export interface Profile {
    id: string;           // Unique identifier (UUID)
    name: string;         // Display name (kid's name)
    avatarEmoji: string;  // Fun emoji avatar
    createdAt: number;    // Unix timestamp
}

/**
 * Generate a simple UUID for profile IDs
 */
export function generateProfileId(): string {
    return 'profile_' + crypto.randomUUID();
}

/**
 * List of fun emoji avatars for kids to choose from
 */
export const AVATAR_EMOJIS = [
    '🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐰', '🐱',
    '🐶', '🦄', '🐲', '🦋', '🌟', '🚀', '🎨', '⚡',
];

/**
 * Get a random avatar emoji
 */
export function getRandomAvatar(): string {
    return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}
