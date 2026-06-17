---
name: test-coverage-canvas
description: Generate a visual test-coverage report for a selected area of the codebase and render it as a Cursor Canvas. Use when asked to summarize, visualize, or report on test coverage.
---

# Test coverage canvas report

Produce a clear, visual coverage report and render it as a Canvas (not just a markdown
file). This is a "how" workflow — follow the steps in order.

## Steps

1. Determine the scope. If the user named a directory (e.g.
   `public/app/plugins/panel/stat`), use it. Otherwise ask which area to report on, or
   default to the files changed in the current branch (`git diff --name-only main...`).

2. Collect coverage for that scope:

   ```bash
   yarn jest --no-watch --coverage --collectCoverageFrom='<scope-glob>' <scope-path>
   ```

   Example scope glob: `public/app/plugins/panel/stat/**/*.{ts,tsx}`.

3. Parse the coverage summary (statements / branches / functions / lines per file).

4. Build a Canvas that includes:
   - A title and the scope being reported.
   - A per-file table or bar visualization of the four coverage metrics.
   - A highlighted list of files **below 80%** coverage.
   - A short "Recommended next tests" section naming concrete untested functions or
     branches.

5. Render the report as a Canvas so it is visual rather than plain markdown.

## Notes

- Do not modify source or test files while generating the report; this skill only reads
  and reports.
- If coverage cannot be collected for a path, say so explicitly rather than guessing
  numbers.
