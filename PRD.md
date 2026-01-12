# PRD.md - Product Requirements Document

**Project:** Sequential Presentation Timer (PWA)
**Version:** 1.0
**Status:** Approved

## 1. Overview

A minimalist, browser-based Progressive Web App (PWA) designed to manage multi-stage presentations. The application allows users to define a sequence of timers (e.g., "Intro", "Main Content", "Q&A"). When one timer finishes, an audio alert plays, and the next timer immediately begins.

## 2. Core User Flow

1. **Setup:** User opens the app (or installs it).
2. **Configuration:** User adds multiple timer slots (e.g., 2 min, 15 min, 5 min).
3. **Action:** User clicks "Start Presentation".
4. **Execution:**
    * Timer 1 counts down.
    * User can Pause or "Skip Next" if the speaker finishes early.
5. **Transition:** Timer 1 hits 00:00 -> Audio Plays -> Timer 2 starts automatically.
6. **Completion:** Final timer hits 00:00 -> Distinct Completion Audio Plays.

## 3. Features & Functional Requirements

### 3.1 Timer Management (The "Playlist")

* **Add Timer:** Button to add a new timer slot to the queue.
* **Remove Timer:** Ability to delete a slot.
* **Reorder (Optional):** Nice to have, but not critical for V1.
* **Input Method:**
  * Label (e.g., "Introduction").
  * Duration Input: Although `type="time"` was requested, for UX clarity on mobile keypads, use two numeric inputs: **Minutes** and **Seconds**. (Or a unified text mask `MM:SS`).

### 3.2 Playback Control Logic

* **Auto-Sequence:** The defining feature. T(n+1) starts strictly when T(n) <= 0.
* **Global Start:** Starts the sequence from the current active timer.
* **Global Pause:** Freezes the current active timer.
* **Skip/Next:** Immediately forces the current timer to 0 (or skips it) and triggers the next timer in the queue.
* **Reset:** Stops all timers and resets the sequence to the first timer with original durations.

### 3.3 Audio Feedback

* **Transition Sound:** A short, distinct "blip" or "chime" when a timer transitions to the next.
* **Completion Sound:** A longer, more final sound when the entire sequence is done.
* **Mute Toggle:** Ability to silence audio.

### 3.4 Visual Interface (UX)

* **Active Timer:** Must be the dominant element on the screen (Largest font size).
* **Queue List:** Upcoming timers should be visible but visually receded (smaller opacity or size).
* **Theme:** Toggleable Light/Dark mode.
  * *Dark Mode:* Slate/Zinc palette (reduces eye strain in dark auditoriums).
  * *Light Mode:* High contrast white/black.
* **Icons:** Use Lucide Icons for controls (Play, Pause, Skip Forward, Rotate-CCW/Reset, Sun/Moon). No emojis.

### 3.5 Progressive Web App (PWA)

* **Manifest:** Must be installable on iOS and Android.
* **Offline Support:** Service Worker must cache assets to function without internet.
* **Display:** `standalone` mode (hides browser UI).

## 4. Technical Specifications

### 4.1 Tech Stack

* **Framework:** None (Vanilla JS).
* **Build Tool:** Vite.
* **Styling:** Tailwind CSS v4.
* **State Management:** Vanilla JS `class` or `object` based state to manage the array of timers and current index.

### 4.2 Data Persistence

* **Local Storage:** Save the user's timer configuration (the list of durations/labels) so they don't lose it if they refresh or close the tab.

### 4.3 Accessibility (a11y)

* Keyboard navigation for all controls.
* `aria-live="polite"` or `aria-atomic="true"` on the timer display so screen readers can announce time (configurable frequency).

## 5. Acceptance Criteria

1. User can add 3 timers, start the first, and watch it transition automatically to the 2nd and 3rd without clicking anything.
2. "Skip" button successfully jumps to the start of the next timer.
3. Audio plays on transitions.
4. App installs on a mobile device and works offline (PWA).
5. Dark mode toggle persists preference.

## 6. Out of Scope (v1)

* Backend/Server database.
* User accounts/Login.
* Exporting timer statistics.
* Complex animation libraries (keep it native CSS transitions).
