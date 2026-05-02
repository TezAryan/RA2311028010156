# RA2311028010156

## Modern Notification Center

A premium, full-stack notification management system featuring a sleek, responsive UI, an intelligent priority algorithm, and centralized telemetry.

## Screenshots

### Desktop View
| All Notifications | Priority Inbox |
| :---: | :---: |
| ![Desktop All Notifications](screenshots/Desktop_view(All).png) | ![Desktop Priority Inbox](screenshots/Desktop_view(Priority).png) |

### Mobile View
| All Notifications | Priority Inbox |
| :---: | :---: |
| ![Mobile All Notifications](screenshots/Mobile_view(All).png) | ![Mobile Priority Inbox](screenshots/Mobile_view(Priority).png) |

## Core Features & Architecture

### 💎 Premium Frontend Experience
- **Tech Stack:** React 18, TypeScript, React Router v6.
- **Design System:** Custom CSS featuring a warm-light glassmorphism theme, smooth micro-animations, and responsive layouts.
- **State Management:** Persistent read/unread state tracking using `localStorage` and hoisted state.
- **UX Details:** Dynamic unread badges, custom select dropdowns, rank indicators, and loading skeletons.

### 🧠 Intelligent Priority Algorithm
The backend calculates a dynamic score for each notification, balancing categorical importance and temporal relevance.
- **Weight Allocation:** Placement = 3, Result = 2, Event = 1
- **Recency Decay:** `Recency Score = 1 / (1 + hours_elapsed)`
- **Final Score Calculation:** `(Weight * 0.7) + (Recency Score * 0.3)`

### ⚡ Optimized Data Processing
To efficiently determine the top $N$ notifications from a large dataset $M$ (where $N \ll M$), the system implements a **Bounded Min-Heap of size $N$**.
- **Time Complexity:** $O(M \log N)$ (faster than standard $O(M \log M)$ sorting).
- **Space Complexity:** $O(N)$
- Enables highly efficient real-time streaming updates.

### 📡 Centralized Telemetry
A custom `logging_middleware` library provides structured logging capabilities.
- Type-safe logging (`info`, `warn`, `error`, `fatal`).
- Cross-platform support (used by both Frontend and Backend).
- Non-blocking asynchronous execution.

## Project Structure
- `logging_middleware/` - Shared TypeScript library for structured logging.
- `notification_app_be/` - Express server handling APIs, priority scoring, and data aggregation.
- `notification_app_fe/` - React frontend application.

## Quick Start Guide

### 1. Start the Backend
```bash
cd notification_app_be
npm install
npm run dev
```
*Note: Ensure you have a `.env` file with a valid `BEARER_TOKEN`.*

### 2. Start the Frontend
```bash
cd notification_app_fe
npm install
npm start
```

The application will be available at `http://localhost:3000`.
