# IRONLOG — Daily Gym Tracker

An offline-first, installable gym tracker built for effective, targeted progress: a **muscle-specific exercise library**, daily set/rep/weight logging, a **muscle volume balance view**, personal records, and a secure on-device progress-photo gallery.

No account, no server, no analytics — everything is stored in `localStorage` on your own device.

## Features

- **Muscle-specific exercise library** — 90+ exercises pre-sorted into 12 muscle groups (Chest, Back, Shoulders, Biceps, Triceps, Forearms, Quads, Hamstrings, Glutes, Calves, Abs, Cardio). Pick a muscle, then pick an exercise — or add your own custom movement to any muscle group.
- **Daily workout log** — assign a routine day (Push/Pull/Legs, or your own), log sets with weight + reps, check off completed sets, and navigate freely between any date.
- **Muscle Volume progress view** — a 7/30/90-day/all-time bar breakdown of completed sets per muscle group, so you can spot which muscles are undertrained and keep your program balanced.
- **Personal records** — automatically tracks your heaviest completed set per exercise, with the date it was set.
- **Progress photos** — camera or gallery upload, auto-compressed and stored only on-device.
- **Session streak & history** — day streak, total sessions, total completed sets, and a full session-by-session log you can tap back into.
- **Installable PWA** — add to your phone's home screen and it works fully offline via a service worker.
- **Backup/restore** — export all data to a JSON file, or import it back in, from Settings.

## Project structure

```
ironlog/
├── index.html              # App shell & markup
├── manifest.json           # PWA manifest (installable, app icon, theme)
├── sw.js                   # Service worker — offline caching
├── css/
│   └── style.css           # All styling
├── js/
│   ├── exercise-library.js # Exercise database, grouped by muscle
│   ├── storage.js          # localStorage data layer (IronStore)
│   └── app.js               # UI logic & rendering
├── icons/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

## Run it

Just open `index.html` in a browser — no build step, no dependencies, no install required.

### Host it on GitHub Pages
1. Push this folder's contents to a GitHub repo.
2. Go to **Settings → Pages**.
3. Set the source to your default branch, root folder.
4. Visit `https://<username>.github.io/<repo>/` on your phone.
5. Tap your browser's **"Add to Home Screen"** — it installs like a native app and works offline afterward.

## Customizing the exercise library

Open `js/exercise-library.js`. Each muscle group is a key in `EXERCISE_LIBRARY` mapping to an array of `{ name, equipment }` objects. Add, remove, or rename entries freely — the app picks up changes automatically. Add a new muscle group by adding it to both `MUSCLE_GROUPS` (with a hex color) and `EXERCISE_LIBRARY`.

## Data & privacy

All data (workouts, routines, notes, personal records, photos) lives only in your browser's `localStorage`, tied to that browser and device. It is never uploaded anywhere. Switching browsers or devices, or clearing site data, will lose it — use **Settings → Export backup** periodically, and **Import backup** to restore.

## Tech

Plain HTML, CSS, and vanilla JavaScript — no build tools, no frameworks, no external runtime dependencies (only a Google Font is loaded from a CDN). Easy to read, fork, and extend.
