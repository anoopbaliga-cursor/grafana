import { defaultOptions } from './panelcfg.gen';

describe('Stat panel defaultOptions', () => {
  it('defaults showBorder to false for backwards compatibility', () => {
    expect(defaultOptions.showBorder).toBe(false);
  });
});
