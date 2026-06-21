# Bugbot seed (optional) — guarantee a finding during the demo

Bugbot is most convincing when it actually finds something. This folder gives you a
**deliberately flawed snippet** you can drop into a throwaway branch so a review always
surfaces issues. Nothing here is imported by the app — it exists only to be reviewed.

> Use this on a **separate throwaway branch**, not on your main demo branch. Delete the
> branch after the session.

## How to run it during prep

1. Create a throwaway branch:

   ```bash
   git checkout -b demo/bugbot-seed-throwaway
   ```

2. Copy the example into a real source location so it shows up in the diff (it is plain
   TypeScript and is never wired into the build):

   ```bash
   mkdir -p public/app/core/utils/_demo
   cp demo/bugbot-seed/seed.ts public/app/core/utils/_demo/seed.ts
   git add public/app/core/utils/_demo/seed.ts
   git commit -m "chore(demo): add seed file for bugbot review"
   git push -u origin demo/bugbot-seed-throwaway
   ```

3. Open the PR on GitHub and comment `bugbot run`.

4. After the session: close the PR and delete the branch
   (`git push origin --delete demo/bugbot-seed-throwaway`).

## What Bugbot should flag in `seed.ts`

- A hardcoded secret/token (credential leak).
- A SQL string built with string concatenation (SQL injection).
- `dangerouslySetInnerHTML`-style unescaped HTML (XSS).
- A missing null/undefined check that can throw at runtime.
- `console.log` of sensitive data (convention + leak).

These map directly to the talking points in the runbook's Bugbot section.

## Want a subtler demo?

This seed shows the **obvious, critical** catches (secrets, SQLi, XSS). For a
contrasting demo that shows Bugbot catching quiet **logic/correctness** bugs that
compile cleanly and pass a quick eyeball review, use `demo/bugbot-logic-seed/`.
