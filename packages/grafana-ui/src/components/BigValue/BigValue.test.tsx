import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTheme, dateTime, FieldType, type FieldSparkline, type TimeRange } from '@grafana/data';

import { BigValue } from './BigValue';
import { BigValueColorMode, BigValueGraphMode, type Props } from './BigValueTypes';

const timeRange: TimeRange = {
  from: dateTime('2024-01-01T00:00:00Z'),
  to: dateTime('2024-01-01T06:00:00Z'),
  raw: { from: 'now-6h', to: 'now' },
};

const sparkline: FieldSparkline = {
  y: {
    name: 'value',
    type: FieldType.number,
    config: {},
    values: [1, 2, 3, 2, 4],
    state: { range: { min: 1, max: 4, delta: 3 } },
  },
  timeRange,
};

const valueObject = {
  text: '25',
  numeric: 25,
  color: 'red',
};

function getProps(propOverrides?: Partial<Props>): Props {
  const props: Props = {
    colorMode: BigValueColorMode.Background,
    graphMode: BigValueGraphMode.Line,
    height: 300,
    width: 300,
    value: valueObject,
    theme: createTheme(),
  };

  Object.assign(props, propOverrides);
  return props;
}

describe('BigValue', () => {
  describe('Render with basic options', () => {
    it('should render', () => {
      render(<BigValue {...getProps()} />);

      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should render with percent change', () => {
      render(
        <BigValue
          {...getProps({
            value: { ...valueObject, percentChange: 0.5 },
          })}
        />
      );

      expect(screen.getByText('0.5%')).toBeInTheDocument();
    });

    it('should render without percent change', () => {
      render(<BigValue {...getProps()} />);
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  describe('drill-down', () => {
    it('toggles a section labeled from the sparkline time range when enableDrilldown is true', async () => {
      const user = userEvent.setup();

      render(
        <BigValue
          {...getProps({
            enableDrilldown: true,
            graphMode: BigValueGraphMode.None,
            sparkline,
          })}
        />
      );

      const valueButton = screen.getByRole('button', { name: '25' });
      expect(screen.queryByText(/last 6 hours/i)).not.toBeInTheDocument();

      await user.click(valueButton);
      expect(screen.getByText(/last 6 hours/i)).toBeInTheDocument();
      expect(valueButton).toHaveStyle({ height: '300px' });

      await user.click(valueButton);
      expect(screen.queryByText(/last 6 hours/i)).not.toBeInTheDocument();
    });

    it('falls back to Trend when the sparkline has no time range', async () => {
      const user = userEvent.setup();
      const sparklineWithoutRange: FieldSparkline = {
        y: sparkline.y,
      };

      render(
        <BigValue
          {...getProps({
            enableDrilldown: true,
            graphMode: BigValueGraphMode.None,
            sparkline: sparklineWithoutRange,
          })}
        />
      );

      await user.click(screen.getByRole('button', { name: '25' }));
      expect(screen.getByText('Trend')).toBeInTheDocument();
    });

    it('does not render drill-down UI when enableDrilldown is false', () => {
      render(<BigValue {...getProps()} />);

      expect(screen.queryByText(/last 6 hours/i)).not.toBeInTheDocument();
      expect(screen.queryByText('Trend')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
