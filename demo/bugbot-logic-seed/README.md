# Bugbot seed — subtle logic bugs (the "looks fine, isn't" demo)

This folder is a second, complementary Bugbot seed. It is **deliberately different**
from `demo/bugbot-seed/`:

| Seed | What it contains | Story it tells |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| `demo/bugbot-seed/` | Glaring **security/critical** bugs (secrets, SQLi, XSS) | "Bugbot blocks the obviously dangerous stuff." (your existing critical-bug automation) |
| `demo/bugbot-logic-seed/` | Subtle **logic/correctness** bugs | "Bugbot catches the quiet bugs a human reviewer skims right past." |

Use this one when you want to show Bugbot doing the *harder* job: every function in
`seed.ts` compiles, looks reasonable, and would pass a quick glance — but each is
quietly wrong. Nothing here is imported by the app; it exists only to be reviewed.

> Use this on a **separate throwaway branch**, not on your main demo branch. Delete
> the branch after the session.

## How to run it during prep

1. Create a throwaway branch:

   ```bash
   git checkout -b demo/bugbot-logic-seed-throwaway
   ```

2. Copy the example into a real source location so it shows up in the diff (it is
   plain TypeScript and is never wired into the build):

   ```bash
   mkdir -p public/app/core/utils/_demo
   cp demo/bugbot-logic-seed/seed.ts public/app/core/utils/_demo/logic-seed.ts
   git add public/app/core/utils/_demo/logic-seed.ts
   git commit -m "chore(demo): add logic-bug seed for bugbot review"
   git push -u origin demo/bugbot-logic-seed-throwaway
   ```

3. Open the PR on GitHub and comment `bugbot run`.

4. After the session: close the PR and delete the branch
   (`git push origin --delete demo/bugbot-logic-seed-throwaway`).

## What Bugbot should flag in `seed.ts`

Each is a correctness bug, **not** a security issue:

- `paginate` — off-by-one: `slice(start, end + 1)` leaks the next page's first item.
- `clamp` — returns `min` instead of `max` when the value is above range.
- `average` — divides by `length - 1`, overstating the mean (and NaN for one item).
- `toPercent` — operator precedence: rounds the ratio to 0/1 before multiplying by 100.
- `refreshAll` — `forEach` with an async callback doesn't await; resolves too early.
- `latestPoint` — wrong comparison (`<` instead of `>`) returns the oldest point.

These pair naturally with the runbook's Bugbot section: run the critical-bug seed to
show the obvious catches, then this one to show the subtle catches.
