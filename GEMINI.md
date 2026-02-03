# 🤖 Gemini Built: Multiplay

This project was built and refined by **Antigravity**, a powerful agentic AI coding assistant designed by the **Google DeepMind** team.

## 🏗️ System Architecture & Logic Residence

Multiplay is designed with a strict separation of concerns to ensure UI performance and data integrity:

- **Game Engine (The Brain)**: Resides in `src/worker/`. All game state, SRS algorithms, and adaptive logic run in a dedicated Web Worker to prevent UI jank.
- **Mastery Engine**: Located in `src/worker/srs-algorithm.ts`. This is the core pedagogical engine that handles specialized logic:
    - **Tiered Fluency System**: Priorities speed (automaticity) using weighted thresholds (<3s, 3-6s, >6s). Mastery requires speed, not just correctness.
    - **Active Set Management**: Constrains the learning focus to a rotating set of 15 facts.
    - **Weighted Selection**: Uses a probability distribution (60% Weak Pool / 20% Mastered / 20% Learning) for optimal drilling.
    - **Pedagogical Progression**: Automatically unlocks tables based on difficulty patterns (e.g., 2s and 5s before 7s) rather than numerical order.
- **UI State Proxy**: Resides in `src/lib/stores/game.svelte.ts`. Uses Svelte 5 Runes to mirror worker state and expose it reactively to the frontend.
- **Persistence Layer**: Found in `src/worker/storage.ts`. Implements scoped profile storage using a custom versioned IndexedDB (defined in `src/lib/db/database.ts`).

## 🛠️ Tech Stack (AI Curated)

- **Framework**: Svelte 5 (Runes) for granular reactivity.
- **Threading**: Web Workers + **Comlink** for type-safe RPC communication.
- **Styling**: Tailwind CSS with custom Modern CSS Animations.
- **Persistence**: Custom versioned IndexedDB for offline-first player profiles and progress.
- **Performance**: Latency-masking patterns (700ms feedback windows) to hide background worker operations.

---
*Built with ❤️ by Antigravity @ Google DeepMind.*

