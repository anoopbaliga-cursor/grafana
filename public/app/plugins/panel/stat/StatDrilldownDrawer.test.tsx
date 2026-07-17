import { type ComponentProps } from 'react';
import type AutoSizer from 'react-virtualized-auto-sizer';

import {
  type FieldDisplay,
  LoadingState,
  getDefaultTimeRange,
} from '@grafana/data';
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
      <StatDrilldownDrawer
        title="Fallback title"
        value={makeFieldDisplay()}
        timeZone="utc"
        timeRange={getDefaultTimeRange()}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'CPU Usage' })).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('renders a timeseries panel for the 30-day graph region', () => {
    const timeRange = getDefaultTimeRange();

    render(
      <StatDrilldownDrawer
        title="Fallback title"
        value={makeFieldDisplay()}
        timeZone="utc"
        timeRange={timeRange}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByTestId('panel-renderer')).toBeInTheDocument();
    expect(mockPanelRendererProps).toHaveBeenCalledWith(
      expect.objectContaining({
        pluginId: 'timeseries',
        timeZone: 'utc',
        data: expect.objectContaining({
          state: LoadingState.Done,
          timeRange,
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
  });

  it('calls onClose when the drawer close control is clicked', async () => {
    const onClose = jest.fn();
    const { user } = render(
      <StatDrilldownDrawer
        title="Fallback title"
        value={makeFieldDisplay()}
        timeZone="utc"
        timeRange={getDefaultTimeRange()}
        onClose={onClose}
      />
    );

    await user.click(screen.getByTestId(selectors.components.Drawer.General.close));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
