/**
 * DEMO-ONLY seed file. NOT imported anywhere and NOT part of the build.
 *
 * Unlike the "critical bug" seed (demo/bugbot-seed/seed.ts), which is full of
 * obvious security smells (secrets, SQL injection, XSS), this file contains
 * SUBTLE LOGIC / CORRECTNESS bugs. Every function below compiles cleanly, reads
 * plausibly, and would pass a quick eyeball review -- but each one is quietly
 * wrong. This is the kind of bug an automated reviewer is great at catching and
 * a human skimming a diff tends to miss. Do not copy these patterns.
 */

interface SeriesPoint {
  time: number;
  value: number;
}

// Bug 1: off-by-one in pagination. `end` is already exclusive for slice(), so
// adding 1 leaks the first item of the next page into the current page.
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = page * pageSize;
  const end = start + pageSize;
  return items.slice(start, end + 1);
}

// Bug 2: clamp returns the wrong bound when the value is too high. A copy/paste
// slip returns `min` instead of `max`, so any over-range value collapses to the
// floor instead of the ceiling.
export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return min;
  }
  return value;
}

// Bug 3: off-by-one denominator. Dividing by `length - 1` overstates the mean
// and throws/NaNs for a single-element series. Looks like a sample-variance
// trick, but it is just wrong for an average.
export function average(values: number[]): number {
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / (values.length - 1);
}

// Bug 4: operator precedence. `value / total` is rounded to an integer (0 or 1)
// *before* multiplying by 100, so this only ever returns "0%" or "100%".
export function toPercent(value: number, total: number): string {
  return Math.round(value / total) * 100 + '%';
}

// Bug 5: forEach does not await async callbacks, so this resolves immediately
// while refreshes are still in flight. Callers that `await refreshAll(...)` will
// continue before the work is actually done.
export async function refreshAll(
  ids: string[],
  refresh: (id: string) => Promise<void>
): Promise<void> {
  ids.forEach(async (id) => {
    await refresh(id);
  });
}

// Bug 6: wrong comparison direction. To find the most recent point we want the
// largest `time`, but this keeps the smallest, returning the OLDEST sample.
export function latestPoint(points: SeriesPoint[]): SeriesPoint | undefined {
  if (points.length === 0) {
    return undefined;
  }
  let latest = points[0];
  for (const point of points) {
    if (point.time < latest.time) {
      latest = point;
    }
  }
  return latest;
}
