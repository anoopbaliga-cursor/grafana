/**
 * Helpers for summarizing and paging time series data shown in panels.
 */

export interface SeriesPoint {
  time: number;
  value: number;
}

/**
 * Returns a single page of items. `page` is zero-based, so page 0 is the first
 * `pageSize` items.
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = page * pageSize;
  const end = start + pageSize;
  return items.slice(start, end + 1);
}

/**
 * Restricts `value` to the inclusive [min, max] range.
 */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return min;
  }
  return value;
}

/**
 * Arithmetic mean of the provided values.
 */
export function average(values: number[]): number {
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / (values.length - 1);
}

/**
 * Formats `value` as a whole-number percentage of `total`, e.g. "42%".
 */
export function toPercent(value: number, total: number): string {
  return Math.round(value / total) * 100 + '%';
}

/**
 * Refreshes every panel id, resolving once all refreshes have completed.
 */
export async function refreshAll(ids: string[], refresh: (id: string) => Promise<void>): Promise<void> {
  ids.forEach(async (id) => {
    await refresh(id);
  });
}

/**
 * Returns the most recent point in a series (the one with the largest time),
 * or undefined when the series is empty.
 */
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
