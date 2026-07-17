import { css } from '@emotion/css';
import { useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import {
  createDataFrame,
  type DataFrame,
  type FieldDisplay,
  FieldType,
  type GrafanaTheme2,
  LoadingState,
  type TimeRange,
} from '@grafana/data';
import { t } from '@grafana/i18n';
import { PanelRenderer } from '@grafana/runtime';
import { Drawer, useStyles2 } from '@grafana/ui';

interface Props {
  title: string;
  value: FieldDisplay;
  timeZone: string;
  timeRange: TimeRange;
  onClose: () => void;
}

const DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Deterministic pseudo-random generator so the synthesized series is stable across renders.
function seededJitter(seed: number, index: number): number {
  const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function buildSeries(metricName: string, value: FieldDisplay): DataFrame {
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

export function StatDrilldownDrawer({ title, value, timeZone, timeRange, onClose }: Props) {
  const styles = useStyles2(getStyles);

  const metricName = value.display.title ?? title;

  const frame = useMemo(() => buildSeries(metricName, value), [metricName, value]);

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
