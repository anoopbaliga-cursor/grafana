import { render } from '@testing-library/react';
import { uniqueId } from 'lodash';

import {
  dateMath,
  dateTime,
  type EventBus,
  LoadingState,
  type PanelProps,
  type TimeRange,
  toDataFrame,
  VizOrientation,
} from '@grafana/data';
import { BigValueColorMode, BigValueGraphMode, BigValueJustifyMode, BigValueTextMode } from '@grafana/schema';
import { BigValue } from '@grafana/ui';

import { StatPanel } from './StatPanel';
import { defaultOptions, type Options } from './panelcfg.gen';

jest.mock('@grafana/ui', () => {
  const actual = jest.requireActual('@grafana/ui');
  return { ...actual, BigValue: jest.fn(() => null) };
});

const mockBigValue = BigValue as jest.MockedFunction<typeof BigValue>;

describe('StatPanel', () => {
  beforeEach(() => {
    mockBigValue.mockClear();
  });

  it('passes enableDrilldown to BigValue when the option is enabled', () => {
    render(
      <StatPanel
        {...buildPanelProps({
          options: {
            ...buildDefaultOptions(),
            enableDrilldown: true,
            graphMode: BigValueGraphMode.None,
          },
        })}
      />
    );

    expect(mockBigValue).toHaveBeenCalled();
    expect(mockBigValue.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        enableDrilldown: true,
      })
    );
  });

  it('passes enableDrilldown false to BigValue by default', () => {
    render(
      <StatPanel
        {...buildPanelProps({
          options: {
            ...buildDefaultOptions(),
            enableDrilldown: false,
          },
        })}
      />
    );

    expect(mockBigValue).toHaveBeenCalled();
    expect(mockBigValue.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        enableDrilldown: false,
      })
    );
  });
});

function buildDefaultOptions(): Options {
  return {
    ...defaultOptions,
    colorMode: BigValueColorMode.Value,
    graphMode: BigValueGraphMode.Area,
    justifyMode: BigValueJustifyMode.Auto,
    textMode: BigValueTextMode.Auto,
    wideLayout: true,
    showPercentChange: false,
    showBorder: false,
    enableDrilldown: false,
    reduceOptions: {
      calcs: ['lastNotNull'],
      fields: '',
      values: false,
    },
    orientation: VizOrientation.Auto,
    text: {},
  } as Options;
}

function buildPanelProps(overrideValues?: Partial<PanelProps<Options>>): PanelProps<Options> {
  const timeRange = createTimeRange();

  const defaultValues: PanelProps<Options> = {
    id: Number(uniqueId()),
    data: {
      series: [
        toDataFrame({
          name: 'A',
          fields: [
            { name: 'Time', type: 'time', values: [1000, 2000, 3000] },
            { name: 'Value', type: 'number', values: [10, 20, 30] },
          ],
        }),
      ],
      state: LoadingState.Done,
      timeRange,
    },
    options: buildDefaultOptions(),
    transparent: false,
    timeRange,
    timeZone: 'utc',
    title: 'Stat panel',
    fieldConfig: {
      defaults: {},
      overrides: [],
    },
    onFieldConfigChange: jest.fn(),
    onOptionsChange: jest.fn(),
    onChangeTimeRange: jest.fn(),
    replaceVariables: jest.fn((value) => value),
    renderCounter: 0,
    width: 300,
    height: 200,
    eventBus: {} as EventBus,
  };

  return {
    ...defaultValues,
    ...overrideValues,
    options: {
      ...defaultValues.options,
      ...overrideValues?.options,
    },
    data: {
      ...defaultValues.data,
      ...overrideValues?.data,
    },
  };
}

function createTimeRange(): TimeRange {
  return {
    from: dateMath.parse('now-6h') || dateTime(),
    to: dateMath.parse('now') || dateTime(),
    raw: { from: 'now-6h', to: 'now' },
  };
}
