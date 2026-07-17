import { css } from '@emotion/css';
import { useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import {
  createDataFrame,
  dateTime,
  type DataFrame,
  type FieldDisplay,
  FieldType,
  type GrafanaTheme2,
  LoadingState,
  makeTimeRange,
  type TimeRange,
} from '@grafana/data';
import { t } from '@grafana/i18n';
import { PanelRenderer } from '@grafana/runtime';
import { Drawer, useStyles2 } from '@grafana/ui';

interface Props {
  title: string;
  value: FieldDisplay;
  timeZone: string;
  onClose: () => void;
}

const DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Deterministic pseudo-random generator so the synthesized series is stable across renders.
function seededJitter(seed: number, index: number): number {
  const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function buildFromSparkline(metricName: string, value: FieldDisplay): DataFrame | undefined {
  const sparkline = value.sparkline;
  if (!sparkline) {
    return undefined;
  }

  const yValues = sparkline.y.values as number[];
  if (!yValues.length) {
    return undefined;
  }

  const now = Date.now();
  const cutoff = now - (DAYS - 1) * MS_PER_DAY;

  let times: number[];
  let values: number[];

  if (sparkline.x) {
    const xValues = sparkline.x.values as number[];
    times = [];
    values = [];
    for (let i = 0; i < yValues.length; i++) {
      const time = xValues[i];
      if (time >= cutoff) {
        times.push(time);
        values.push(yValues[i]);
      }
    }

    // If the sparkline window is shorter than 30 days, show all available points.
    if (times.length === 0) {
      times = xValues.slice();
      values = yValues.slice();
    }
  } else {
    const count = Math.min(yValues.length, DAYS);
    times = [];
    values = [];
    for (let i = 0; i < count; i++) {
      const idx = yValues.length - count + i;
      times.push(now - (count - 1 - i) * MS_PER_DAY);
      values.push(yValues[idx]);
    }
  }

  return createDataFrame({
    fields: [
      { name: 'time', type: FieldType.time, values: times },
      { name: metricName, type: FieldType.number, values, config: value.field },
    ],
  });
}

function buildSyntheticSeries(metricName: string, value: FieldDisplay): DataFrame {
  const base = value.display.numeric;
  const now = Date.now();

  const times: number[] = [];
  const values: number[] = [];

  const seed = Number.isFinite(base) ? base : 0;
  // Amplitude scales with the value so the jitter reads as gentle regardless of magnitude.
  const amplitude = Number.isFinite(base) && base !== 0 ? Math.abs(base) * 0.1 : 1;

  for (let i = DAYS - 1; i >= 0; i--) {
    times.push(now - i * MS_PER_DAY);
    const offset = (seededJitter(seed, i) - 0.5) * 2 * amplitude;
    values.push((Number.isFinite(base) ? base : 0) + offset);
  }

  return createDataFrame({
    fields: [
      { name: 'time', type: FieldType.time, values: times },
      { name: metricName, type: FieldType.number, values, config: value.field },
    ],
  });
}

function buildSeries(metricName: string, value: FieldDisplay): DataFrame {
  return buildFromSparkline(metricName, value) ?? buildSyntheticSeries(metricName, value);
}

function timeRangeFromFrame(frame: DataFrame): TimeRange {
  const timeField = frame.fields.find((f) => f.type === FieldType.time);
  const times = (timeField?.values as number[]) ?? [];

  if (times.length === 0) {
    const now = dateTime();
    return makeTimeRange(dateTime(now.valueOf() - (DAYS - 1) * MS_PER_DAY), now);
  }

  let from = times[0];
  let to = times[0];
  for (let i = 1; i < times.length; i++) {
    if (times[i] < from) {
      from = times[i];
    }
    if (times[i] > to) {
      to = times[i];
    }
  }

  return makeTimeRange(dateTime(from), dateTime(to));
}

export function StatDrilldownDrawer({ title, value, timeZone, onClose }: Props) {
  const styles = useStyles2(getStyles);

  const metricName = value.display.title ?? title;

  const frame = useMemo(() => buildSeries(metricName, value), [metricName, value]);
  const timeRange = useMemo(() => timeRangeFromFrame(frame), [frame]);

  return (
    <Drawer
      title={metricName}
      subtitle={t('stat.drilldown-drawer.subtitle', 'Last 30 days')}
      onClose={onClose}
      size="lg"
    >
      <div className={styles.content}>
        <AutoSizer>
          {({ width, height }) => {
            if (width < 1 || height < 1) {
              return null;
            }

            return (
              <PanelRenderer
                pluginId="timeseries"
                title=""
                width={width}
                height={height}
                data={{ series: [frame], state: LoadingState.Done, timeRange }}
                timeZone={timeZone}
              />
            );
          }}
        </AutoSizer>
      </div>
    </Drawer>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  content: css({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: theme.spacing(40),
    gap: theme.spacing(2),
  }),
});
