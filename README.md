# 🎮 Multiplay

**Level Up Your Math | The Ultimate Multiplication Game**

Multiplay is a high-performance, mobile-first multiplication learning web application designed to turn rote memorization into a fun, gamified flow state. Built with Svelte 5 and a custom Spaced Repetition System (SRS) engine running in a Web Worker, it provides a seamless, distraction-free environment for mastering multiplication tables.

---

## ✨ Key Features

- **🎯 Controlled Practice Set**: Unlike other apps that flood you with 100+ facts, Multiplay focuses on a tight set of **8 active facts** at a time. New facts are only introduced as you master current ones.
- **🚀 Accelerated Mastery**: Our aggressive confidence algorithm means you can master a fact in as little as **3 fast correct answers**.
- **🔥 Winstreak System**: Build momentum and beat your best records. Gamified feedback loops keep learners engaged and motivated.
- **🗺️ Mastery Heatmap**: A colorblind-friendly visual map of your progress across the entire 1x1 to 12x12 grid.
- **🛠️ Customizable Gameplay**: Set your own round lengths (5-50 questions) and difficulty caps (up to 12x12).
- **📴 Offline Ready**: Built as a PWA with IndexedDB persistence, works perfectly without an internet connection.

---

## 🧠 Scientific Approach & Methodology

Multiplay isn't just a game; it's a precision learning tool based on cognitive science principles:

### 1. Spaced Repetition System (SRS)
Cognitive science shows that we learn best when we are challenged just before we forget. Multiplay tracks your confidence and response latency for every single multiplication "fact."
*   **Weakness Targeting**: Facts with low confidence are prioritized (80% weight) to ensure they are reinforced frequently.
*   **Maintenance**: Mastered facts are occasionally reintroduced for long-term retention verification.

### 2. Cognitive Load Management
By using an **Active Practice Pool (Size: 8)**, we prevent overwhelming the learner. This "slot-based" system ensures that as one fact moves from short-term memory to long-term "Mastered" status, a single new challenge is introduced, maintaining a perfect balance of challenge and success.

### 3. Immediate Feedback & Positive Reinforcement
Response latency is a critical indicator of automaticity. Multiplay differentiates between "Correct" and "Mastered" (Correct + Fast), rewarding high-speed recall which is essential for mental math proficiency.

---

## 🛠️ Internal Algorithms

### Confidence Scoring Logic
The engine uses a dynamic scoring system based on performance:

| Action | Boost/Penalty | Logic |
| :--- | :--- | :--- |
| **Fast Correct** | +35% | Answered within < 3s. Strong association. |
| **Normal Correct** | +25% | Answered within 3s-6s. Good recall. |
| **Slow Correct** | +10% | Answered within > 6s. Correct but struggling. |
| **Wrong Answer** | -25% | Incorrect association. Needs immediate review. |

*Mastery Threshold: 85% Confidence.*

### Question Selection Engine
The selection algorithm uses a weighted random roll:
- **80% Chance**: Pick from the **3 weakest facts** in the current active set. This creates "intense focus" rounds.
- **20% Chance**: Pick from the rest of the active set for variety and flow maintenance.

---

## 🏗️ Technical Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (using Runes for high-performance reactivity)
- **Engine**: Custom Web Worker implementation (Comlink) to keep UI thread buttery smooth (60fps) during heavy calculations.
- **Storage**: IndexedDB via `idb-keyval` for persistent progress storage.
- **Styling**: Tailwind CSS with custom vibrant "kid-centric" design tokens.
- **Icons**: Lucide Svelte.
- **Fonts**: Outfit (Display) & Quicksand (Body) for maximum legibility.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Developed with ❤️ for the next generation of math wizards.
