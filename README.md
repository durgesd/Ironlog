# IRONLOG — Admin + Member Apps

Two separate apps that share data on the same device/origin — no server, no database, no login system. Everything lives in the browser's `localStorage`.

## Files

| File | What it is |
|---|---|
| `index.html` | **Member app** — daily workout log, muscle-specific exercise picker, progress photos (with fullscreen viewer), progress/PR tracking, and a **Fees** tab showing your membership status & payment history. |
| `admin.html` | **Admin app** — full gym management: members, plans, payments, attendance, trainers, and a **custom exercise manager** where you upload your own GIFs. |
| `manifest.json` / `sw.js` | PWA files for the Member app (installable, offline). |
| `admin-manifest.json` / `admin-sw.js` | PWA files for the Admin app (installable, offline). |

## How the two apps share data

Both apps must be hosted on the **same domain** (e.g. the same GitHub Pages site) — for example:

```
https://yourname.github.io/ironlog/           → Member app (index.html)
https://yourname.github.io/ironlog/admin.html → Admin app
```

Because `localStorage` is shared by all pages on the same origin, anything the Admin app writes — custom exercises with GIFs, member records, payments — is instantly visible to the Member app on that same device/browser. No internet sync, no backend: just the same browser reading the same local storage.

**Important:** this means the two apps only share data if opened in the **same browser on the same device**. If a member opens the Member app on their own phone, they won't automatically see the gym's data unless the Admin operator exports a backup and the member imports it (Settings → Export/Import), or they're using a shared front-desk device.

## Admin app — what you can do

- **Dashboard** — total/active/expired members, today's check-ins, 30-day revenue, memberships expiring within 7 days.
- **Exercises** — add your own exercises with a name, muscle group, equipment, step-by-step instructions, and an uploaded **GIF or image** showing correct form (max 4MB). These automatically appear in the Member app's exercise picker, tagged "GYM".
- **Members** — add/edit/delete, with photo, plan, join date, notes; tap a member to see full payment history and renew their membership.
- **Plans** — create membership plans (name, duration, price).
- **Payments** — record a payment, optionally auto-extending the member's plan.
- **Attendance** — daily check-in list, searchable.
- **Trainers** — simple staff directory.
- **Settings** — export/import a combined backup (gym data + custom exercises), or erase either independently.

## Member app — what's new

- **Fees tab** — pick your name from the gym's member list (once, first time) to see your plan, status (active/expired), and full payment history, pulled live from the Admin app's data.
- **Custom exercise GIFs** — when you tap the ▶ "how-to" button on an exercise your gym added, you'll see their uploaded GIF and instructions instead of the generic public demo.
- **Photo lightbox** — tap any progress photo to view it fullscreen, swipe between photos, and delete from the viewer.
- Everything from before still works: routine days, muscle-specific exercise picker, set/rep/weight logging, muscle volume balance, personal records, and full local backup.

## Hosting on GitHub Pages

1. Push all 6 files to your repo's root (no subfolders).
2. Settings → Pages → enable, root folder.
3. Member app: `https://<username>.github.io/<repo>/`
4. Admin app: `https://<username>.github.io/<repo>/admin.html`
5. On the gym's front-desk device, install the Admin app (Add to Home Screen). On each member's phone, install the Member app the same way.

## Privacy

All data — members, payments, exercise GIFs, workout logs, progress photos — stays in `localStorage` on-device. Nothing is uploaded anywhere. Use the Export/Import backup features regularly, since clearing browser data or switching devices loses everything not backed up.
