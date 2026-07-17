import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { type FieldDisplay, getDefaultTimeRange } from '@grafana/data';

import { StatDrilldownDrawer } from './StatDrilldownDrawer';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  PanelRenderer: () => <div data-testid="panel-renderer" />,
}));

// AutoSizer measures 0x0 in jsdom, so give it a fixed size to render its children.
jest.mock('react-virtualized-auto-sizer', () => {
  return ({ children }: { children: (size: { width: number; height: number }) => ReactNode }) =>
    children({ width: 500, height: 400 });
});

describe('StatDrilldownDrawer', () => {
  let mainView: HTMLDivElement;

  beforeEach(() => {
    mainView = document.createElement('div');
    mainView.classList.add('main-view');
    document.body.appendChild(mainView);
  });

  afterEach(() => {
    document.body.removeChild(mainView);
  });

  const metricTitle = 'CPU Usage';

  const value: FieldDisplay = {
    display: {
      numeric: 42,
      text: '42',
      color: 'green',
    },
    field: {},
    view: undefined,
    colIndex: 0,
    rowIndex: 0,
    name: metricTitle,
    getLinks: () => [],
    hasLinks: false,
  };

  const defaultProps = {
    title: metricTitle,
    value,
    timeZone: 'browser',
    timeRange: getDefaultTimeRange(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onClose = jest.fn();
  });

  it('renders the metric title in the drawer', () => {
    render(<StatDrilldownDrawer {...defaultProps} />);

    expect(screen.getByText(metricTitle)).toBeInTheDocument();
  });

  it('renders the time series graph area', () => {
    render(<StatDrilldownDrawer {...defaultProps} />);

    expect(screen.getByTestId('panel-renderer')).toBeInTheDocument();
  });

  it('calls onClose when the drawer close button is clicked', async () => {
    render(<StatDrilldownDrawer {...defaultProps} />);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
