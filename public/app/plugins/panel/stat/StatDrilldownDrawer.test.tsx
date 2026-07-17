import { type ComponentProps } from 'react';
import type AutoSizer from 'react-virtualized-auto-sizer';

import { type FieldDisplay, FieldType, LoadingState } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { render, screen } from 'test/test-utils';

import { StatDrilldownDrawer } from './StatDrilldownDrawer';

const mockPanelRendererProps = jest.fn();

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  PanelRenderer: (props: object) => {
    mockPanelRendererProps(props);
    return <div data-testid="panel-renderer" />;
  },
}));

jest.mock('react-virtualized-auto-sizer', () => ({
  __esModule: true,
  default(props: ComponentProps<typeof AutoSizer>) {
    return <div>{props.children({ height: 400, width: 600, scaledHeight: 400, scaledWidth: 600 })}</div>;
  },
}));

function makeFieldDisplay(overrides?: Partial<FieldDisplay>): FieldDisplay {
  return {
    name: 'cpu_usage',
    field: {},
    display: {
      title: 'CPU Usage',
      text: '42',
      numeric: 42,
    },
    hasLinks: false,
    ...overrides,
  } as FieldDisplay;
}

describe('StatDrilldownDrawer', () => {
  let mainView: HTMLDivElement;

  beforeEach(() => {
    mockPanelRendererProps.mockClear();

    mainView = document.createElement('div');
    mainView.classList.add('main-view');
    document.body.appendChild(mainView);
  });

  afterEach(() => {
    document.body.removeChild(mainView);
  });

  it('shows the metric name as the drawer title', () => {
    render(
      <StatDrilldownDrawer title="Fallback title" value={makeFieldDisplay()} timeZone="utc" onClose={jest.fn()} />
    );

    expect(screen.getByRole('heading', { name: 'CPU Usage' })).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('renders a timeseries panel with a time range matching the series span', () => {
    render(
      <StatDrilldownDrawer title="Fallback title" value={makeFieldDisplay()} timeZone="utc" onClose={jest.fn()} />
    );

    expect(screen.getByTestId('panel-renderer')).toBeInTheDocument();
    expect(mockPanelRendererProps).toHaveBeenCalledWith(
      expect.objectContaining({
        pluginId: 'timeseries',
        timeZone: 'utc',
        data: expect.objectContaining({
          state: LoadingState.Done,
          series: expect.arrayContaining([
            expect.objectContaining({
              fields: expect.arrayContaining([
                expect.objectContaining({ name: 'time' }),
                expect.objectContaining({ name: 'CPU Usage' }),
              ]),
            }),
          ]),
        }),
      })
    );

    const props = mockPanelRendererProps.mock.calls[0][0];
    const timeField = props.data.series[0].fields.find((f: { type: FieldType }) => f.type === FieldType.time);
    const times = timeField.values as number[];
    const expectedFrom = Math.min(...times);
    const expectedTo = Math.max(...times);

    expect(props.data.timeRange.from.valueOf()).toBe(expectedFrom);
    expect(props.data.timeRange.to.valueOf()).toBe(expectedTo);
  });

  it('calls onClose when the drawer close control is clicked', async () => {
    const onClose = jest.fn();
    const { user } = render(
      <StatDrilldownDrawer title="Fallback title" value={makeFieldDisplay()} timeZone="utc" onClose={onClose} />
    );

    await user.click(screen.getByTestId(selectors.components.Drawer.General.close));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
