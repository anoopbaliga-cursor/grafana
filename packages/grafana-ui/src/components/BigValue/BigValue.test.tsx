import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTheme } from '@grafana/data';

import { BigValue } from './BigValue';
import { BigValueColorMode, BigValueGraphMode, type Props } from './BigValueTypes';

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

  describe('interaction', () => {
    it('renders the value as a button when onClick is provided', async () => {
      const onClick = jest.fn();
      render(<BigValue {...getProps({ onClick })} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not render a button when onClick is omitted', () => {
      render(<BigValue {...getProps()} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
