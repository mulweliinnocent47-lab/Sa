# SA Student

NSC past papers, notes, memos, AI practice, an Exam Centre, a planner, progress tracking and an XP leaderboard for South African students. Built with Next.js 14 + Supabase, deployed on Vercel.

**Rules of the app:** everything is free. A free account is needed to (1) download files, (2) start a practice session, and (3) keep using the AI after **3 free messages** as a guest.

---

## 1. Setup checklist (do these once, in order)

### Step 1: Create the database tables
Supabase dashboard → **SQL Editor** → New query → paste everything in [`supabase/schema.sql`](supabase/schema.sql) → **Run**. It is safe to run again.

It creates: `profiles`, `user_events`, `task_awards`, `practice_results`, `push_subscriptions`, adds a `done` column to `planner`, and the `get_leaderboard()` function.

### Step 2: Add the environment variables in Vercel
Vercel → your project → Settings → Environment Variables. Then **redeploy**. (See `.env.example`.)

| Variable | What it is | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | you already have these | |
| `SUPABASE_SERVICE_ROLE_KEY` | lets only the server give out XP (keep it secret!) | Supabase → Project Settings → API → `service_role` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` | the key pair for push notifications | run `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | `mailto:your@email.com` | your email |
| `CRON_SECRET` | any long random text; protects the daily reminder job | make one up |

Without `SUPABASE_SERVICE_ROLE_KEY` the app still works, it just does not award XP. Without the VAPID keys the app still works, it just cannot send notifications.

### Step 3: The AI edge functions (Supabase)
| Function name | Used by | Source |
|---|---|---|
| `PROAI-PROCTICE` | AI chat on `/practice` | already deployed by you |
| `ProTestYourSelf` | "Test yourself" | already deployed by you |
| `exam-centre-egde` | writes the 10 practice questions | [`supabase/functions/exam-centre-egde/index.ts`](supabase/functions/exam-centre-egde/index.ts) |

`exam-centre-egde` keeps that spelling because that is the name you deployed. The name is set in one place: `EDGE_FUNCTION` in `app/api/practice/generate/route.js`.

---

## 2. Profile table (the config)

**The config file is [`lib/profileConfig.js`](lib/profileConfig.js).**

- `PROFILE_TABLE` is the table name (`profiles`). Change it there if you want another name.
- `PROFILE_FIELDS` are the columns that get saved. The form on `/profile` is built from this list, so adding a field there adds it to the form.
- `supabase/schema.sql` already creates a matching table. To create it by hand:

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid, **primary key** | references `auth.users(id)` |
| `username` | text, required | unique (case-insensitive); shown on the leaderboard |
| `full_name` | text | |
| `grade` | int | 8 to 12 |
| `school` | text | |
| `province` | text | |
| `created_at`, `updated_at` | timestamptz | |

Row level security: a user can read, insert and update **only their own row**.

Flow: `components/ProfileForm.jsx` → `PUT /api/profile` → `lib/profileServer.js` → Supabase. A profile row is created automatically the first time someone earns XP or opens Profile / Leaderboard (the username starts as their signup username, or the first part of their email).

**Top bar:** it shows the username with **no database call**. It reads the login session (`user_metadata.username`, else `name`, else the part of the email before `@`). The Profile page saves the new username back into the session, so the top bar stays in sync. **Log out now lives on the Profile page.**

---

## 3. XP and the leaderboard

**Change tasks and rewards in [`lib/tasksConfig.js`](lib/tasksConfig.js)**. It is the only place you need to touch.

| Daily (reset at midnight, SA time) | XP |
|---|---|
| Finish a practice session | 20 |
| Ask the AI 3 questions | 15 |
| Plan a study session | 10 |
| Tick off a planned session | 15 |

| Weekly (reset Monday) | XP |
|---|---|
| Finish 5 practice sessions | 75 |
| Score 70%+ in 2 sessions | 80 |
| Study on 4 different days | 100 |
| Tick off 5 planned sessions | 60 |

How it works: the app logs **events** (`user_events`) when a student finishes a practice session, asks the AI, or adds or ticks off a plan. After each event the server (`lib/xpServer.js`) checks which tasks are complete and pays each one **once per day or week** (the unique key in `task_awards` stops double XP). Only the server can write XP, so students cannot edit their own score. Level n starts at `50·n·(n−1)` XP.

Pages: `/leaderboard` (this week / all time, plus your tasks), `/profile` (level, streak, badges), `/progress`, `/exam-centre`.

Anti-cheat built in: practice sessions finished in under 30 seconds, or with fewer than 3 answers, are saved but earn no XP; AI events are capped at 60 a day. Someone who calls the API by hand could still fake a score, because the server trusts the score the browser sends. If that matters later, move the marking to the server.

---

## 4. Push notifications

**What students get:** one reminder a day at **17:00 SA time** ("You have 2 planned sessions waiting" or "Today's tasks are live"), and a recap on **Sundays**. Students switch them on at **Settings → Notifications**, where they can also send themselves a test.

**How it works (Web Push):**
1. `public/sw.js` is the service worker. It shows the notification and opens the right page when it is tapped.
2. `components/NotificationSettings.jsx` asks permission, subscribes the phone using your public VAPID key, and saves the subscription (`POST /api/push/subscribe` → table `push_subscriptions`).
3. `vercel.json` has a **cron job** that calls `GET /api/push/send` every day at 15:00 UTC (17:00 SA). Vercel sends `Authorization: Bearer <CRON_SECRET>` by itself. That route (`app/api/push/send/route.js`) encrypts and sends the messages with the `web-push` package and deletes phones that have unsubscribed.

**Test it by hand** (after Step 2): `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR-SITE/api/push/send`

**Good to know**
- **iPhone:** push only works after **Share → Add to Home Screen** and opening the app from the home screen (iOS 16.4+). The Settings page explains this to the student.
- **Android and desktop Chrome:** works straight from the browser.
- Vercel's free (Hobby) plan allows one cron run a day, which is exactly what this uses. Reminders at a time each student chooses would need a paid plan or a Supabase scheduled function.

---

## 5. App icon and "install the app"

Your logo is the app icon everywhere:
- `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`: browser tab and iPhone home screen (Next.js picks these up by itself)
- `public/icons/*`: install icons (including a "maskable" version for Android) and the notification badge
- `public/logo.png`: the logo in the top bar
- `app/manifest.js`: makes the site installable (name, colours, shortcuts)

To change the icon later, replace those image files (same names and sizes).

---

## 6. Guests, downloads and the AI limit

- **Downloads:** guests see the sign-in prompt (`components/DownloadButton.jsx`), and `/api/download` and `/api/memo` also refuse guests on the server.
- **AI limit:** guests get **3 free messages** across the chat and Test yourself (`lib/guestLimit.js`). A message only counts when the AI really answered. Practice sessions need an account.
- **Important:** the 3-message counter lives in the browser (localStorage), so a technical person can reset it. To enforce it for real, also count guests inside the `PROAI-PROCTICE` and `ProTestYourSelf` edge functions.

---

## 7. What was made faster

- Storage folder listings (notes, papers, memos, subjects) are **cached for 10 minutes** for everyone and fetched **in parallel** (`lib/storageCache.js`). Before, every page view listed every folder again, one after the other.
- The top bar no longer calls the server on every page; it reads the login session instantly.
- The protected layout checks the login cookie locally (`getClaims`) instead of waiting on Supabase.
- Home, Exam Centre, Progress and Profile load their data **at the same time**.
- Instant loading skeleton (`app/loading.jsx`), smaller icon bundle (`optimizePackageImports`), and the middleware skips images, icons and the service worker.

## 8. Bugs fixed

- Exam Centre **changed the shared `SESSIONS` list**, so planned sessions piled up on every page load.
- Planner showed fake data, and "Time" accepted nonsense values (now 5 to 240 minutes, checked on the server).
- `/api/plannerFetch` queried a table that does not exist and was never used: removed.
- Login and signup used `alert()`, broke hydration with `window` in the render, and signup never checked the username. Fixed.
- The AI chat counted a guest message even when the AI failed, and sent the welcome text as history.
- The Home countdown pointed at a date in the past (19 Oct). All countdowns now use the real NSC timetable in `lib/exam-timetable.js`.
- Removed the Pro/Go/R49/R99 plans, the "Pro" locks and the "UI preview" badge, because everything is free.
- Fixed `"@supabase/supabase-js": ""` in `package.json` and cleaned `.gitignore`.

## 9. Things only you can fill in

- **Videos:** `/video` now just says "Coming soon". (The old page used the same placeholder video for every entry.) When you have real videos, build the page again from your own list.
- **Planner topic check:** `lib/topicCheck.js` does basic checks. Put your "is this school work?" check there.
- **Papers and memos details:** `province`, `session`, `year` and `pages` are still fixed values in `lib/paperServer.js` and `lib/memoServer.js`.

## 10. Where things are

| Area | Files |
|---|---|
| Profile config | `lib/profileConfig.js`, `lib/profileServer.js`, `components/ProfileForm.jsx`, `app/api/profile/route.js` |
| XP and tasks | `lib/tasksConfig.js`, `lib/xpServer.js`, `lib/xpClient.js`, `components/XpToast.jsx`, `app/api/activity`, `app/api/practice/result` |
| Leaderboard | `app/leaderboard/page.jsx`, SQL function `get_leaderboard` |
| Push | `public/sw.js`, `components/NotificationSettings.jsx`, `lib/pushServer.js`, `app/api/push/*`, `vercel.json` |
| Exam timetable | `lib/exam-timetable.js` |
| Practice sessions | `lib/practice-sessions.js`, `components/PracticeSession.jsx`, `app/api/practice/generate/route.js` |
| Planner | `app/planner/page.jsx`, `components/PlannerForm.jsx`, `components/PlannerList.jsx`, `app/api/planner/route.js`, `lib/plannerAPIFetch.js` |
| Database | `supabase/schema.sql` |

Run locally: `npm install` then `npm run dev`.
